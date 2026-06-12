# Accountability Dashboard

[![CI](https://github.com/arialabs/accountability-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/arialabs/accountability-dashboard/actions/workflows/ci.yml)
[![Deploy](https://github.com/arialabs/accountability-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/arialabs/accountability-dashboard/actions/workflows/deploy.yml)

**Track what politicians say vs what they do.**

Built for citizens who demand transparency from their elected representatives.

## What This Does

- Shows voting records for all 535 members of Congress
- Tracks campaign donors and money trail
- Highlights discrepancies between promises and actions
- No fake "trust scores" — just facts you can verify

## Stack

- **Frontend:** Next.js 14 (App Router, static generation)
- **Database:** Turso (SQLite at the edge)
- **Hosting:** Cloudflare Pages
- **Data Pipeline:** GitHub Actions (daily refresh)

## Data Sources

| Source | What We Get |
|--------|-------------|
| [Congress.gov API](https://api.congress.gov/) | Members, votes, bills |
| [Voteview](https://voteview.com/) | Historical roll calls, ideology scores |
| [OpenSecrets](https://www.opensecrets.org/open-data) | Campaign finance (bulk data) |
| [FEC API](https://api.open.fec.gov/) | Detailed contributions |
| [USASpending.gov API](https://api.usaspending.gov/) | Agency FY budgets, program changes, contracts/grants awards |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes (for news features) | OpenRouter API key — used to query Perplexity Sonar for live representative news. Get yours at [openrouter.ai](https://openrouter.ai). |

```bash
# .env.local (development)
OPENROUTER_API_KEY=sk-or-...
```

## Perplexity News Integration

The "Latest News" section on rep profile pages is powered by [Perplexity Sonar](https://perplexity.ai) via OpenRouter.

### How it works

- **Static builds (Cloudflare Pages):** Run `pnpm research:fetch` before building to pre-generate `src/data/news-cache.json`. The static pages load news from this cache at build time.
- **Server deployments:** The `/api/research?id=<bioguide_id>` route fetches live news on demand (requires removing `output: "export"` from `next.config.mjs`).

### Pre-fetch news for all reps

```bash
OPENROUTER_API_KEY=sk-or-... pnpm research:fetch          # sonar (fast)
OPENROUTER_API_KEY=sk-or-... pnpm research:fetch:deep     # sonar-deep-research (thorough)
OPENROUTER_API_KEY=sk-or-... pnpm research:fetch -- --ids A000374,B001271  # specific reps
```

## Development

```bash
# Install dependencies
pnpm install

# Run data pipeline (fetch latest data)
pnpm run pipeline

# Sync recent Congress.gov roll calls into live vote store
pnpm run votes:sync

# Sync USASpending agency budgets + awards into executive data store
pnpm run usaspending:sync

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## USASpending Sync (Local)

```bash
# Default: last 3 completed fiscal years
pnpm usaspending:sync

# Optional overrides
pnpm usaspending:sync --fyStart=2022 --fyEnd=2024 --awardsLimit=50

# Test mode writes to pipeline/output
pnpm usaspending:sync:test

# Optional DB persistence (Turso) in addition to JSON artifacts
TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... pnpm usaspending:sync
```

Artifacts:
- `src/data/usaspending.json`
- `src/data/usaspending-sync-status.json`

## Project Structure

```
accountability-dashboard/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities, DB client
│   └── data/             # Static data, types
├── pipeline/             # Data fetching scripts
│   ├── sources/          # API clients
│   ├── processors/       # Data transformation
│   └── index.ts          # Main pipeline runner
├── database/
│   └── schema.sql        # Database schema
└── .github/
    └── workflows/        # CI/CD + data refresh
```

## License

MIT — Use this however you want. Democracy shouldn't be paywalled.

---

*Built by [Aria Labs](https://github.com/arialabs) 🔥*

## GitHub Actions Secrets

The following secrets must be configured in the repository settings for CI/CD and data pipelines to work:

| Secret | Description |
|--------|-------------|
| `OPENROUTER_API_KEY` | API key for OpenRouter (used by Perplexity Sonar news fetch in the nightly news refresh workflow) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID for Pages deployment |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages deploy permissions |
| `CONGRESS_API_KEY` | Congress.gov API key for legislative data pipeline |
| `FEC_API_KEY` | Federal Election Commission API key for campaign finance data |
| `GH_TOKEN` | GitHub Personal Access Token for workflow automation (write access to repo) |

To add secrets: **Repo Settings → Secrets and variables → Actions → New repository secret**
