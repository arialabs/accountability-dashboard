#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const keyVotes = JSON.parse(readFileSync(join(ROOT, "src/data/key-votes.json"), "utf-8"));
const members = JSON.parse(readFileSync(join(ROOT, "src/data/members.json"), "utf-8"));
const bioguideToIcpsr = JSON.parse(readFileSync(join(ROOT, "src/data/bioguide-to-icpsr.json"), "utf-8"));

// Build reverse map: ICPSR ID → party
const icpsrToParty = {};
for (const [bioguideId, icpsrId] of Object.entries(bioguideToIcpsr)) {
  const member = members.find((m) => m.bioguide_id === bioguideId);
  if (member) {
    icpsrToParty[icpsrId] = member.party;
  }
}

console.log(`Mapped ${Object.keys(icpsrToParty).length} ICPSR IDs to parties`);

let updated = 0;
for (const vote of keyVotes) {
  let dem_yea = 0, dem_nay = 0, rep_yea = 0, rep_nay = 0, other_yea = 0, other_nay = 0;

  for (const [icpsrId, position] of Object.entries(vote.votes)) {
    const party = icpsrToParty[icpsrId];
    if (position === "Yea") {
      if (party === "D") dem_yea++;
      else if (party === "R") rep_yea++;
      else other_yea++;
    } else if (position === "Nay") {
      if (party === "D") dem_nay++;
      else if (party === "R") rep_nay++;
      else other_nay++;
    }
  }

  vote.party_breakdown = { dem_yea, dem_nay, rep_yea, rep_nay, other_yea, other_nay };
  updated++;
}

writeFileSync(join(ROOT, "src/data/key-votes.json"), JSON.stringify(keyVotes, null, 2) + "\n");
console.log(`Updated ${updated} votes with party_breakdown`);
