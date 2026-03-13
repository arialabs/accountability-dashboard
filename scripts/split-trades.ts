/**
 * Split trades-by-member.json into per-member files under public/data/trades/
 * and fix trading-summaries.json (string→number coercion, stale member pruning).
 *
 * Usage: npx tsx scripts/split-trades.ts
 */

import * as fs from "fs";
import * as path from "path";

const MAX_TRADES_PER_MEMBER = 500;

function main() {
  const root = path.resolve(__dirname, "..");

  // ── Load data ─────────────────────────────────────────────────────────────
  const membersRaw = fs.readFileSync(path.join(root, "src/data/members.json"), "utf8");
  const members: Array<{ bioguide_id: string }> = JSON.parse(membersRaw);
  const validIds = new Set(members.map((m) => m.bioguide_id));

  const tradesRaw = fs.readFileSync(path.join(root, "src/data/trades-by-member.json"), "utf8");
  const tradesByMember: Record<string, any[]> = JSON.parse(tradesRaw);

  const summariesPath = path.join(root, "src/data/trading-summaries.json");
  const summaries: Record<string, any> = JSON.parse(fs.readFileSync(summariesPath, "utf8"));

  // ── Split trades into per-member files ────────────────────────────────────
  const outDir = path.join(root, "public/data/trades");
  fs.mkdirSync(outDir, { recursive: true });

  // Remove existing files first so stale members don't linger
  const existing = fs.readdirSync(outDir).filter((f) => f.endsWith(".json"));
  for (const f of existing) {
    fs.unlinkSync(path.join(outDir, f));
  }

  let membersWritten = 0;
  let totalTradesWritten = 0;
  let membersSkipped = 0;
  const skippedIds: string[] = [];

  for (const [bioguideId, trades] of Object.entries(tradesByMember)) {
    if (!validIds.has(bioguideId)) {
      membersSkipped++;
      skippedIds.push(bioguideId);
      continue;
    }

    // Sort by tradedDate descending, keep most recent MAX_TRADES_PER_MEMBER
    const sorted = [...trades].sort((a, b) => {
      const da = a.tradedDate || "";
      const db = b.tradedDate || "";
      return db.localeCompare(da);
    });
    const trimmed = sorted.slice(0, MAX_TRADES_PER_MEMBER);

    const outPath = path.join(outDir, `${bioguideId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(trimmed));
    membersWritten++;
    totalTradesWritten += trimmed.length;
  }

  console.log(`\nTrades split complete:`);
  console.log(`  Members written:  ${membersWritten}`);
  console.log(`  Total trades:     ${totalTradesWritten}`);
  console.log(`  Members skipped:  ${membersSkipped} (not in members.json)`);
  if (skippedIds.length > 0) {
    console.log(`  Skipped IDs:      ${skippedIds.slice(0, 10).join(", ")}${skippedIds.length > 10 ? ` ... and ${skippedIds.length - 10} more` : ""}`);
  }

  // ── Fix trading-summaries.json ────────────────────────────────────────────
  // 1. Convert string numeric fields to actual numbers
  // 2. Prune entries for members not in members.json
  const prunedSummaries: Record<string, any> = {};
  let summariesPruned = 0;
  let fieldsFixed = 0;

  for (const [bioguideId, summary] of Object.entries(summaries)) {
    if (!validIds.has(bioguideId)) {
      summariesPruned++;
      continue;
    }

    // Coerce string fields to numbers
    for (const field of ["flag_rate", "avg_risk_per_trade", "avg_excess_return"]) {
      if (typeof summary[field] === "string") {
        summary[field] = parseFloat(summary[field]);
        fieldsFixed++;
      }
    }

    prunedSummaries[bioguideId] = summary;
  }

  fs.writeFileSync(summariesPath, JSON.stringify(prunedSummaries, null, 2));

  console.log(`\nTrading summaries fixed:`);
  console.log(`  Entries kept:     ${Object.keys(prunedSummaries).length}`);
  console.log(`  Entries pruned:   ${summariesPruned}`);
  console.log(`  Fields coerced:   ${fieldsFixed} (string -> number)`);
}

main();
