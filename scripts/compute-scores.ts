#!/usr/bin/env tsx
/**
 * Compute "Say vs. Do" Alignment Scores
 * 
 * Usage: tsx scripts/compute-scores.ts
 * 
 * ## Methodology (v2.0) — FULLY TRANSPARENT
 * 
 * For each member, we compare STATED POSITIONS (OnTheIssues.org)
 * against ACTUAL VOTES (Congress.gov roll calls).
 * 
 *   Score = (aligned_votes / total_votes_analyzed) × 100
 * 
 * Every score is decomposable: users can see each vote comparison,
 * the stated position used, and why it was judged aligned or not.
 * 
 * Inputs:  src/data/positions.json, src/data/key-votes.json, src/data/finance.json
 * Outputs: src/data/alignment-scores.json, src/data/alignment-summary.json
 */

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "../src/data");
const VERSION = "2.0";

// ===== Types =====

interface Position {
  topic: string;
  stance: string;
  intensity: number; // 1=Strongly Opposes, 3=Neutral, 5=Strongly Supports
}

interface MemberPositions {
  bioguide_id: string;
  name: string;
  positions: Position[];
}

interface VoteRecord {
  id: string;
  bill_id: string;
  bill_title: string;
  category: string;
  category_topic: string;
  result: string;
  votes: Record<string, string>;
}

interface Comparison {
  bill_id: string;
  bill_title: string;
  category: string;
  stated_position: string;
  stated_intensity: number;
  actual_vote: string;
  aligned: boolean;
  explanation: string;
}

interface RedFlag {
  type: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  data: Record<string, any>;
}

// ===== Topic Mapping =====
// Maps vote categories → OnTheIssues topic keywords

const TOPIC_KEYWORDS: Record<string, string[]> = {
  healthcare: ["ObamaCare", "health", "Medicare", "Medicaid"],
  environment: ["green energy", "environment", "climate", "EPA"],
  gun_control: ["Gun Control", "gun", "firearm"],
  immigration: ["Immigration", "immigrant", "border"],
  defense: ["military spending", "military", "defense"],
  taxes: ["taxes on the wealthy", "tax", "Tax"],
  abortion: ["Abortion", "abortion", "reproductive"],
  education: ["school choice", "education", "school"],
  economy: ["Economy", "economic", "budget", "spending"],
  social_security: ["Social Security", "retirement", "pension"],
};

function findPosition(positions: Position[], category: string): Position | null {
  const keywords = TOPIC_KEYWORDS[category];
  if (!keywords) return null;
  for (const pos of positions) {
    if (keywords.some(kw => pos.topic.toLowerCase().includes(kw.toLowerCase()))) {
      return pos;
    }
  }
  return null;
}

/**
 * Core alignment check.
 * 
 * Assumptions (documented for transparency):
 * - Bills in a category are assumed "pro" that category
 *   (e.g., a "healthcare" bill generally expands healthcare access)
 * - Intensity >= 3 = supports the topic; <= 2 = opposes
 * - Neutral (3) with a lean is treated as mild support
 */
function checkAlignment(pos: Position, vote: string): { aligned: boolean; explanation: string } {
  const supports = pos.intensity >= 3;
  const yea = vote === "Yea";

  if (supports && yea) return { aligned: true, explanation: `States "${pos.stance}" on "${pos.topic}", voted Yea — consistent` };
  if (supports && !yea) return { aligned: false, explanation: `States "${pos.stance}" on "${pos.topic}", voted Nay — contradicts position` };
  if (!supports && !yea) return { aligned: true, explanation: `States "${pos.stance}" on "${pos.topic}", voted Nay — consistent` };
  if (!supports && yea) return { aligned: false, explanation: `States "${pos.stance}" on "${pos.topic}", voted Yea — contradicts position` };
  return { aligned: true, explanation: "Neutral" };
}

function getConfidence(n: number): "high" | "medium" | "low" | "insufficient" {
  if (n >= 50) return "high";
  if (n >= 20) return "medium";
  if (n >= 5) return "low";
  return "insufficient";
}

function detectRedFlags(finance: any): RedFlag[] {
  if (!finance) return [];
  const flags: RedFlag[] = [];
  if (finance.pac_percentage > 50) {
    flags.push({
      type: "finance", severity: finance.pac_percentage > 70 ? "high" : "medium",
      title: "High PAC Dependency",
      description: `${finance.pac_percentage.toFixed(1)}% of funds from PACs`,
      data: { pac_percentage: finance.pac_percentage, pac_total: finance.pac_contributions, total_raised: finance.total_raised },
    });
  }
  if (finance.small_donor_percentage < 10 && finance.total_raised > 100000) {
    flags.push({
      type: "finance", severity: "medium",
      title: "Low Grassroots Support",
      description: `Only ${finance.small_donor_percentage.toFixed(1)}% from small donors (<$200)`,
      data: { small_donor_percentage: finance.small_donor_percentage, total_raised: finance.total_raised },
    });
  }
  return flags;
}

// ===== Main =====

function main() {
  console.log("=".repeat(50));
  console.log("Say vs. Do Alignment Score Calculator");
  console.log(`Methodology v${VERSION} | ${new Date().toISOString()}`);
  console.log("=".repeat(50));

  const posData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "positions.json"), "utf-8"));
  const votes: VoteRecord[] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "key-votes.json"), "utf-8"));
  let finance: Record<string, any> = {};
  try { finance = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "finance.json"), "utf-8")); } catch {}

  const members: MemberPositions[] = posData.members || posData;
  console.log(`\nMembers with positions: ${members.length}`);
  console.log(`Vote records: ${votes.length}`);

  // Group votes by category
  const byCategory: Record<string, VoteRecord[]> = {};
  for (const v of votes) {
    const c = v.category || "other";
    (byCategory[c] ??= []).push(v);
  }

  const scores = members.map(mp => {
    const comparisons: Comparison[] = [];
    const catBreakdown: Record<string, { aligned: number; total: number; score: number }> = {};

    for (const [cat, catVotes] of Object.entries(byCategory)) {
      const pos = findPosition(mp.positions, cat);
      if (!pos) continue;

      for (const vote of catVotes) {
        const mv = vote.votes?.[mp.bioguide_id];
        if (!mv || mv === "Not Voting" || mv === "Present") continue;

        const { aligned, explanation } = checkAlignment(pos, mv);
        comparisons.push({
          bill_id: vote.bill_id, bill_title: vote.bill_title, category: cat,
          stated_position: `${pos.stance} (${pos.intensity}/5)`,
          stated_intensity: pos.intensity, actual_vote: mv, aligned, explanation,
        });

        const cb = catBreakdown[cat] ??= { aligned: 0, total: 0, score: 0 };
        cb.total++;
        if (aligned) cb.aligned++;
      }
    }

    for (const cb of Object.values(catBreakdown)) {
      cb.score = cb.total > 0 ? Math.round((cb.aligned / cb.total) * 100) : 0;
    }

    const total = comparisons.length;
    const alignedCount = comparisons.filter(c => c.aligned).length;
    const score = total > 0 ? Math.round((alignedCount / total) * 100) : 0;

    return {
      bioguide_id: mp.bioguide_id,
      name: mp.name,
      alignment_score: score,
      total_votes_analyzed: total,
      aligned_votes: alignedCount,
      misaligned_votes: total - alignedCount,
      confidence: getConfidence(total),
      category_breakdown: catBreakdown,
      notable_misalignments: comparisons.filter(c => !c.aligned).sort((a, b) => b.stated_intensity - a.stated_intensity).slice(0, 10),
      all_comparisons: comparisons, // FULL TRANSPARENCY
      red_flags: detectRedFlags(finance[mp.bioguide_id]),
      methodology_version: VERSION,
      last_computed: new Date().toISOString(),
    };
  }).sort((a, b) => b.alignment_score - a.alignment_score);

  // Write outputs
  fs.writeFileSync(path.join(DATA_DIR, "alignment-scores.json"), JSON.stringify(scores, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, "alignment-summary.json"), JSON.stringify(
    scores.map(s => ({
      bioguide_id: s.bioguide_id, name: s.name,
      alignment_score: s.alignment_score, votes_analyzed: s.total_votes_analyzed,
      confidence: s.confidence, red_flag_count: s.red_flags.length,
    })), null, 2
  ));

  const withData = scores.filter(s => s.total_votes_analyzed > 0);
  const avg = withData.length ? withData.reduce((s, x) => s + x.alignment_score, 0) / withData.length : 0;

  console.log(`\n✅ ${scores.length} members scored`);
  console.log(`   With data: ${withData.length} | Avg: ${avg.toFixed(1)}%`);
  console.log(`   High confidence: ${scores.filter(s => s.confidence === "high").length}`);
  
  if (withData.length >= 5) {
    console.log("\n   Top 5:", withData.slice(0, 5).map(s => `${s.name} ${s.alignment_score}%`).join(", "));
    console.log("   Bottom 5:", withData.slice(-5).map(s => `${s.name} ${s.alignment_score}%`).join(", "));
  }

  console.log(`\n📖 Full methodology: docs/DATA_PIPELINE.md (v${VERSION})`);
  console.log("   Every score is decomposable via all_comparisons in alignment-scores.json");
}

main();
