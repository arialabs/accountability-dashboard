# Accountability Dashboard

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
| [ProPublica Congress API](https://www.propublica.org/datastore/api/propublica-congress-api) | Voting records, bill details |
| [OpenSecrets](https://www.opensecrets.org/open-data) | Campaign finance (bulk data) |
| [FEC API](https://api.open.fec.gov/) | Detailed contributions |

## Development

```bash
# Install dependencies
pnpm install

# Run data pipeline (fetch latest data)
pnpm run pipeline

# Sync recent Congress.gov roll calls into live vote store
pnpm run votes:sync

# Start dev server
pnpm dev

# Build for production
pnpm build
```

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
