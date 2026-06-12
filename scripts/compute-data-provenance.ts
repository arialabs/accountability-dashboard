#!/usr/bin/env tsx
/**
 * Generate src/data/data-provenance.json — one registry describing where every
 * displayed dataset comes from, how it refreshes, and when it last changed.
 *
 * Rendered by src/components/DataProvenance.tsx ("Source: X · Updated <date>"
 * plus staleness warnings) and the /data-status page.
 *
 * last_updated resolution order:
 *   1. Timestamp embedded in the data file itself (meta.generated_at etc.)
 *   2. Git last-commit date for the file — only when history is available
 *      (the weekly data refresh runs with fetch-depth: 0 and commits this
 *      file; CI/deploy checkouts are shallow and would mis-date everything)
 *   3. The value already committed in data-provenance.json
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src/data");
const OUTPUT = path.join(DATA_DIR, "data-provenance.json");

type Refresh = "auto-daily" | "auto-weekly" | "manual" | "editorial";

interface RegistryEntry {
  /** File under src/data (or descriptive path) */
  file: string;
  /** Human label shown in UI */
  label: string;
  source: string;
  source_url: string;
  refresh: Refresh;
  /** JSON path (dot notation) to an embedded timestamp, if the file has one */
  timestamp_path?: string;
  /** Extra context shown on /data-status */
  notes?: string;
  /** Not currently rendered anywhere on the site */
  hidden?: boolean;
}

// Days after which an auto-refreshed dataset is considered stale. Manual and
// editorial datasets show their review date instead of a warning.
export const STALE_AFTER_DAYS: Record<Refresh, number | null> = {
  "auto-daily": 3,
  "auto-weekly": 14,
  manual: null,
  editorial: null,
};

const REGISTRY: RegistryEntry[] = [
  // ── Pipeline-refreshed (automated) ────────────────────────────────────────
  { file: "live-votes.json", label: "Live roll-call votes", source: "Congress.gov API + senate.gov", source_url: "https://www.congress.gov/roll-call-votes", refresh: "auto-daily", timestamp_path: "meta.generated_at" },
  { file: "executive-orders.json", label: "Executive orders", source: "Federal Register API", source_url: "https://www.federalregister.gov/", refresh: "auto-daily", timestamp_path: "last_updated" },
  { file: "news-cache.json", label: "Representative news", source: "Perplexity Sonar via OpenRouter", source_url: "https://openrouter.ai/", refresh: "auto-daily", notes: "AI-retrieved news summaries with linked sources" },
  { file: "members.json", label: "Members of Congress", source: "Congress.gov API + Voteview", source_url: "https://api.congress.gov/", refresh: "auto-weekly" },
  { file: "finance.json", label: "Campaign finance", source: "FEC via OpenFEC API", source_url: "https://api.open.fec.gov/", refresh: "auto-weekly" },
  { file: "bill-summaries.json", label: "Bill summaries", source: "Congress.gov (CRS) + AI summarization", source_url: "https://www.congress.gov/", refresh: "auto-weekly", notes: "Plain-English summaries are AI-assisted and labeled as such" },
  { file: "alignment-scores.json", label: "Say vs. Do alignment scores", source: "Computed: OnTheIssues positions × Voteview roll calls (v3 methodology)", source_url: "/methodology", refresh: "auto-weekly", timestamp_path: "0.say_vs_do_v3.computed_at" },
  { file: "top-captured.json", label: "Most PAC-captured members", source: "Computed from FEC data", source_url: "https://api.open.fec.gov/", refresh: "auto-weekly", timestamp_path: "meta.generated_at" },
  { file: "home-stats.json", label: "Site-wide statistics", source: "Computed from all datasets at build time", source_url: "/methodology", refresh: "auto-weekly", timestamp_path: "meta.generated_at" },
  { file: "donor-percentiles.json", label: "Donor percentiles", source: "Computed from FEC data", source_url: "https://api.open.fec.gov/", refresh: "auto-weekly", timestamp_path: "generated_at" },
  { file: "usaspending.json", label: "Agency budgets & awards", source: "USASpending.gov API", source_url: "https://api.usaspending.gov/", refresh: "auto-weekly", timestamp_path: "meta.generated_at" },

  // ── Script-refreshed (manual trigger) ─────────────────────────────────────
  { file: "key-votes.json", label: "Key roll-call votes", source: "Voteview (UCLA)", source_url: "https://voteview.com/", refresh: "manual" },
  { file: "positions.json", label: "Stated policy positions", source: "OnTheIssues.org", source_url: "https://www.ontheissues.org/", refresh: "manual" },
  { file: "committees.json", label: "Committee assignments", source: "Congress.gov / ProPublica bulk data", source_url: "https://www.congress.gov/committees", refresh: "manual" },
  { file: "trades-by-member.json", label: "Congressional stock trades", source: "STOCK Act disclosures (Quiver Quantitative)", source_url: "https://www.quiverquant.com/", refresh: "manual" },
  { file: "trading-summaries.json", label: "Trading pattern summaries", source: "Computed from STOCK Act disclosures", source_url: "https://www.quiverquant.com/", refresh: "manual" },
  { file: "house-disclosures.json", label: "Financial disclosures", source: "House Clerk disclosure filings", source_url: "https://disclosures-clerk.house.gov/", refresh: "manual" },
  { file: "leadership-finance.json", label: "Leadership campaign finance", source: "FEC via OpenFEC API", source_url: "https://api.open.fec.gov/", refresh: "manual" },
  { file: "leadership-donors.json", label: "Leadership PAC donors", source: "FEC Schedule A filings", source_url: "https://api.open.fec.gov/", refresh: "manual" },
  { file: "committee-conflicts.json", label: "Committee conflict analysis", source: "Computed: trades × committee jurisdictions", source_url: "/methodology", refresh: "manual" },

  // ── Editorial (hand-researched, cited inline) ─────────────────────────────
  { file: "scandals.json", label: "Scandal tracker", source: "Editorial research with cited news sources", source_url: "", refresh: "editorial" },
  { file: "deep-dives.json", label: "Deep-dive investigations", source: "Editorial research with cited sources", source_url: "", refresh: "editorial" },
  { file: "doge.ts", label: "DOGE tracker", source: "Editorial research (AP, Reuters, NYT, CBO, court filings)", source_url: "", refresh: "editorial" },
  { file: "scotus.json", label: "Supreme Court justices", source: "Editorial research with public records", source_url: "", refresh: "editorial" },
  { file: "cabinet.json", label: "Cabinet officials", source: "Editorial research with public records", source_url: "", refresh: "editorial" },
  { file: "vp.json", label: "Vice President profile", source: "Editorial research with public records", source_url: "", refresh: "editorial" },
  { file: "trump-promises.json", label: "Presidential promise tracker", source: "Editorial research with cited sources", source_url: "", refresh: "editorial" },
  { file: "trump-conflicts.json", label: "Presidential conflicts of interest", source: "Editorial research with cited sources", source_url: "", refresh: "editorial" },
  { file: "leadership-scrutiny.json", label: "Leadership scrutiny", source: "Editorial analysis of FEC + voting data", source_url: "", refresh: "editorial" },
  { file: "policy-impacts.json", label: "Policy impact analysis", source: "Editorial analysis", source_url: "", refresh: "editorial" },
  { file: "budget-impacts.json", label: "Budget impact analysis", source: "Editorial analysis", source_url: "", refresh: "editorial" },
  { file: "affected-programs.json", label: "Affected programs", source: "Editorial analysis", source_url: "", refresh: "editorial" },
  { file: "cabinet-spending.json", label: "Cabinet agency spending (legacy)", source: "Editorial compilation", source_url: "", refresh: "editorial", notes: "Superseded by the automated USASpending pipeline" },
  { file: "executive-actions.json", label: "Executive actions timeline", source: "Editorial; entries without verifiable sources are hidden", source_url: "", refresh: "editorial" },
  { file: "presidential-promises.json", label: "Presidential promises (legacy)", source: "Pending source verification", source_url: "", refresh: "editorial", hidden: true, notes: "Not displayed — citations failed verification and must be re-sourced" },
];

function getByPath(obj: unknown, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function embeddedTimestamp(entry: RegistryEntry): string | null {
  if (!entry.timestamp_path) return null;
  const filePath = path.join(DATA_DIR, entry.file);
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const value = getByPath(data, entry.timestamp_path);
    if (typeof value === "string" && !Number.isNaN(new Date(value).getTime())) {
      return new Date(value).toISOString();
    }
  } catch {
    // fall through
  }
  return null;
}

function isShallowRepo(): boolean {
  try {
    return (
      execSync("git rev-parse --is-shallow-repository", { cwd: ROOT })
        .toString()
        .trim() === "true"
    );
  } catch {
    return true; // no git at all — treat like shallow
  }
}

function gitLastModified(file: string): string | null {
  try {
    const out = execSync(
      `git log -1 --format=%cI -- ${JSON.stringify(`src/data/${file}`)}`,
      { cwd: ROOT }
    )
      .toString()
      .trim();
    return out ? new Date(out).toISOString() : null;
  } catch {
    return null;
  }
}

function previousValues(): Map<string, string | null> {
  const map = new Map<string, string | null>();
  try {
    const prev = JSON.parse(fs.readFileSync(OUTPUT, "utf-8"));
    for (const d of prev.datasets ?? []) {
      map.set(d.file, d.last_updated ?? null);
    }
  } catch {
    // first run
  }
  return map;
}

const shallow = isShallowRepo();
const previous = previousValues();

const datasets = REGISTRY.map((entry) => {
  const embedded = embeddedTimestamp(entry);
  const fromGit = embedded === null && !shallow ? gitLastModified(entry.file) : null;
  const lastUpdated =
    embedded ?? fromGit ?? previous.get(entry.file) ?? null;

  return {
    file: entry.file,
    label: entry.label,
    source: entry.source,
    source_url: entry.source_url,
    refresh: entry.refresh,
    stale_after_days: STALE_AFTER_DAYS[entry.refresh],
    last_updated: lastUpdated,
    exists: fs.existsSync(path.join(DATA_DIR, entry.file)),
    hidden: entry.hidden ?? false,
    notes: entry.notes ?? null,
  };
});

const output = {
  generated_at: new Date().toISOString(),
  git_history_available: !shallow,
  datasets,
};

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));

const withDates = datasets.filter((d) => d.last_updated).length;
console.log(
  `data-provenance.json written: ${datasets.length} datasets, ${withDates} with timestamps (git history: ${!shallow})`
);
