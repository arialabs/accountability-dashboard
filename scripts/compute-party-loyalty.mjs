/**
 * Compute party loyalty scores from key-votes.json
 * Updates members.json with party_loyalty_pct and votes_cast fields
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../src/data");

const votes = JSON.parse(readFileSync(join(dataDir, "key-votes.json"), "utf8"));
const membersData = JSON.parse(readFileSync(join(dataDir, "members.json"), "utf8"));
const bioToIcpsr = JSON.parse(readFileSync(join(dataDir, "bioguide-to-icpsr.json"), "utf8"));

const members = membersData.members ?? membersData;
const icpsrToBio = Object.fromEntries(Object.entries(bioToIcpsr).map(([bio, icpsr]) => [String(icpsr), bio]));
const bioToParty = Object.fromEntries(members.map((m) => [m.bioguide_id, m.party]));
const icpsrToParty = Object.fromEntries(
  Object.entries(bioToIcpsr).map(([bio, icpsr]) => [String(icpsr), bioToParty[bio] ?? ""])
);

// Accumulate aligned/total per member
const results = {};
for (const vote of votes) {
  const voteMap = vote.votes ?? {};
  if (!voteMap || Object.keys(voteMap).length === 0) continue;

  let rYea = 0, rNay = 0, dYea = 0, dNay = 0;
  for (const [icpsr, position] of Object.entries(voteMap)) {
    const party = icpsrToParty[icpsr] ?? "";
    if (position === "Yea") { if (party === "R") rYea++; else if (party === "D") dYea++; }
    else if (position === "Nay") { if (party === "R") rNay++; else if (party === "D") dNay++; }
  }
  const rPos = rYea >= rNay ? "Yea" : "Nay";
  const dPos = dYea >= dNay ? "Yea" : "Nay";

  for (const [icpsr, position] of Object.entries(voteMap)) {
    if (position !== "Yea" && position !== "Nay") continue;
    const bio = icpsrToBio[icpsr];
    if (!bio) continue;
    const party = bioToParty[bio] ?? "";
    const partyPos = party === "R" ? rPos : party === "D" ? dPos : null;
    if (!partyPos) continue;
    if (!results[bio]) results[bio] = { aligned: 0, total: 0 };
    results[bio].total++;
    if (position === partyPos) results[bio].aligned++;
  }
}

// Update members
let updated = 0;
for (const member of members) {
  const counts = results[member.bioguide_id];
  if (counts && counts.total >= 5) {
    member.party_loyalty_pct = Math.round((counts.aligned / counts.total) * 1000) / 10;
    member.votes_cast = counts.total;
    updated++;
  } else {
    member.party_loyalty_pct = null;
    member.votes_cast = 0;
  }
}

// Write back
const output = membersData.members ? { ...membersData, members } : members;
writeFileSync(join(dataDir, "members.json"), JSON.stringify(output, null, 2));
console.log(`✅ Updated party_loyalty_pct for ${updated}/${members.length} members`);
