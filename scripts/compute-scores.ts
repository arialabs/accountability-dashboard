#!/usr/bin/env tsx
/**
 * Compute "Say vs. Do" Alignment Scores — v3.0
 *
 * Usage: tsx scripts/compute-scores.ts
 *
 * ## Methodology (v3.0) — FULLY TRANSPARENT
 *
 * For each member we compare STATED POSITIONS (OnTheIssues.org, intensity 1-5)
 * against ACTUAL VOTES (Congress.gov roll calls), weighted by:
 *   - Position intensity  (strongly held views count more)
 *   - Recency             (recent votes count more)
 *
 * Vote ideological direction is determined by PARTISAN VOTING PATTERNS:
 *   - If Democrats vote Yea and Republicans vote Nay on a bill → "Yea" is the liberal vote
 *   - If Republicans vote Yea and Democrats vote Nay → "Yea" is the conservative vote
 *   - If the vote is bipartisan (< 30% split) → it's skipped (uninformative for Say vs Do)
 *
 * This replaces the broken v2.0 "publicBenefit" approach where 75% of votes were
 * labeled "mixed", causing the algorithm to invert alignment for the majority of data.
 *
 * Score = Σ(weight × aligned) / Σ(weight) × 100
 *   where weight = intensityWeight × timeWeight
 *
 * Inputs:  src/data/positions.json, src/data/key-votes.json, src/data/members.json
 * Outputs: src/data/alignment-scores.json, src/data/alignment-summary.json
 *
 * See src/lib/say-vs-do.ts for the full algorithm implementation.
 * See docs/SAY-VS-DO-METHODOLOGY.md for design rationale.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "../src/data");

async function main() {
  console.log("=".repeat(60));
  console.log("Say vs. Do Score Calculator — v3.0");
  console.log(`${new Date().toISOString()}`);
  console.log("=".repeat(60));

  // Dynamic import to handle ESM/CJS interop
  const { computeAllSayVsDo } = await import("../src/lib/say-vs-do.js");

  // ── Load data ────────────────────────────────────────────────────────────
  const posData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "positions.json"), "utf-8"));
  const rawVotes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "key-votes.json"), "utf-8"));
  const rawMembers = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "members.json"), "utf-8"));

  const memberPositions = (posData.members ?? posData).map((m: any) => ({
    bioguide_id: m.bioguide_id,
    name: m.name,
    positions: m.positions.map((p: any) => ({
      topic: p.topic,
      stance: p.stance,
      intensity: p.intensity,
    })),
  }));

  const keyVotes = rawVotes.map((v: any) => ({
    id: v.id,
    category: v.category,
    date: v.date,
    votes: v.votes,
  }));

  const allMembers = rawMembers.map((m: any) => ({
    bioguide_id: m.bioguide_id,
    party: m.party,
  }));

  console.log(`\nMembers with positions: ${memberPositions.length}`);
  console.log(`Vote records:           ${keyVotes.length}`);
  console.log(`Congress members:       ${allMembers.length}`);

  // ── Compute scores ───────────────────────────────────────────────────────
  console.log("\nComputing scores...");

  const scores = computeAllSayVsDo(memberPositions, keyVotes, allMembers);

  // Merge in member names for the output
  const nameMap = new Map(memberPositions.map((m: any) => [m.bioguide_id, m.name]));

  const fullResults = scores.map((s: any) => ({
    // Legacy fields for backwards-compatible display layer
    bioguide_id: s.bioguide_id,
    name: nameMap.get(s.bioguide_id) ?? s.bioguide_id,
    alignment_score: s.score ?? 0,
    total_votes_analyzed: s.totalComparisons,
    aligned_votes: s.alignedComparisons,
    misaligned_votes: s.misalignedComparisons,
    confidence: s.confidence,
    category_breakdown: Object.fromEntries(
      s.categoryBreakdown.map((c: any) => [
        c.category,
        { aligned: c.aligned, total: c.comparisons, score: c.score },
      ])
    ),
    notable_misalignments: s.notableContradictions.map((c: any) => ({
      vote_id: c.voteId,
      topic: c.topic,
      stated_stance: c.statedStance,
      actual_vote: c.actualVote,
      expected_direction: c.expectedDirection,
    })),

    // v3.0 enhanced fields
    say_vs_do_v3: {
      score: s.score,
      confidence: s.confidence,
      total_comparisons: s.totalComparisons,
      aligned_comparisons: s.alignedComparisons,
      misaligned_comparisons: s.misalignedComparisons,
      topic_breakdown: s.topicBreakdown,
      category_breakdown: s.categoryBreakdown,
      methodology: s.methodology,
      computed_at: s.computedAt,
    },
  }));

  // ── Write outputs ────────────────────────────────────────────────────────
  fs.writeFileSync(
    path.join(DATA_DIR, "alignment-scores.json"),
    JSON.stringify(fullResults, null, 2)
  );

  const summary = fullResults.map((s: any) => ({
    bioguide_id: s.bioguide_id,
    name: s.name,
    alignment_score: s.alignment_score,
    votes_analyzed: s.total_votes_analyzed,
    confidence: s.confidence,
    methodology: "say-vs-do-v3",
  }));

  fs.writeFileSync(
    path.join(DATA_DIR, "alignment-summary.json"),
    JSON.stringify(summary, null, 2)
  );

  // ── Report ───────────────────────────────────────────────────────────────
  const withData = fullResults.filter((s: any) => s.total_votes_analyzed > 0);
  const noData = fullResults.filter((s: any) => s.total_votes_analyzed === 0);

  const avg =
    withData.length > 0
      ? withData.reduce((s: number, x: any) => s + x.alignment_score, 0) / withData.length
      : 0;

  const high = fullResults.filter((s: any) => s.confidence === "high").length;
  const medium = fullResults.filter((s: any) => s.confidence === "medium").length;
  const low = fullResults.filter((s: any) => s.confidence === "low").length;
  const insufficient = fullResults.filter((s: any) => s.confidence === "insufficient").length;

  console.log(`\n✅ ${fullResults.length} members scored`);
  console.log(`   With data:      ${withData.length}`);
  console.log(`   No data:        ${noData.length}`);
  console.log(`   Average score:  ${avg.toFixed(1)}%`);
  console.log(`   Confidence:     high=${high} medium=${medium} low=${low} insufficient=${insufficient}`);

  if (withData.length >= 5) {
    console.log("\n   Top 5 aligned:");
    withData.slice(0, 5).forEach((s: any, i: number) =>
      console.log(`     ${i + 1}. ${s.name}: ${s.alignment_score}% (${s.total_votes_analyzed} comparisons, ${s.confidence})`)
    );

    console.log("\n   Bottom 5 aligned:");
    [...withData].reverse().slice(0, 5).forEach((s: any, i: number) =>
      console.log(`     ${i + 1}. ${s.name}: ${s.alignment_score}% (${s.total_votes_analyzed} comparisons, ${s.confidence})`)
    );
  }

  console.log("\n📖 Algorithm: src/lib/say-vs-do.ts (say-vs-do-v3)");
  console.log("   Docs: docs/SAY-VS-DO-METHODOLOGY.md");
  console.log("   Every score is decomposable via say_vs_do_v3.topic_breakdown");
}

main().catch(console.error);
