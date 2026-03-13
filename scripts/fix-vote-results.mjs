#!/usr/bin/env node
/**
 * One-time fix: compute vote `result` from yea/nay counts
 * for the 176 key votes with result = "Unknown"
 *
 * Rules:
 * - Senate cloture motions require 60 votes (3/5 supermajority)
 * - All other votes use simple majority (yea > nay)
 * - Ties left as Unknown (VP tiebreaker not in data)
 */
import { readFileSync, writeFileSync } from "fs";

const KEY_VOTES_PATH = "./src/data/key-votes.json";
const data = JSON.parse(readFileSync(KEY_VOTES_PATH, "utf-8"));

let fixed = 0;
for (const vote of data) {
  if (vote.result !== "Unknown") continue;

  const isCloture = vote.title.includes("Cloture");
  const isSenate = vote.chamber === "Senate";
  const threshold = isCloture && isSenate ? 60 : Math.floor((vote.yea_count + vote.nay_count) / 2) + 1;

  if (vote.yea_count >= threshold) {
    vote.result = isCloture ? "Cloture Motion Agreed to" : "Agreed to";
    fixed++;
  } else if (vote.nay_count > vote.yea_count) {
    vote.result = isCloture ? "Cloture Motion Rejected" : "Rejected";
    fixed++;
  }
  // yea === nay (tie) → leave as Unknown
}

writeFileSync(KEY_VOTES_PATH, JSON.stringify(data, null, 2));

console.log(`Fixed ${fixed} of 176 Unknown results`);
console.log(`Remaining Unknown: ${data.filter(v => v.result === "Unknown").length}`);

// Summary
const results = {};
for (const v of data) {
  results[v.result] = (results[v.result] || 0) + 1;
}
console.log("\nResult distribution:");
for (const [k, v] of Object.entries(results).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}
