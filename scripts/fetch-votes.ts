#!/usr/bin/env tsx
/**
 * Fetch House roll call votes from Congress.gov API v3
 * 
 * Usage: CONGRESS_API_KEY=xxx tsx scripts/fetch-votes.ts
 * 
 * Uses the /house-vote endpoint (added May 2025).
 * Senate votes are not yet available in the API — use VoteView data for Senate.
 * 
 * Output: src/data/key-votes.json
 * Source: https://api.congress.gov/v3
 */

import * as fs from "fs";
import * as path from "path";

const API_BASE = "https://api.congress.gov/v3";
const API_KEY = process.env.CONGRESS_API_KEY;
const CURRENT_CONGRESS = 119; // 2025-2027
const OUTPUT_PATH = path.join(__dirname, "../src/data/key-votes.json");

if (!API_KEY) {
  console.error("❌ CONGRESS_API_KEY required. Get one at https://api.congress.gov/sign-up/");
  process.exit(1);
}

// Bill categories mapped to OnTheIssues topics for alignment scoring
const CATEGORY_MAP: Record<string, string> = {
  "healthcare": "Expand ObamaCare",
  "environment": "Prioritize green energy",
  "gun_control": "Gun Control",
  "immigration": "Immigration",
  "defense": "Make military spending",
  "taxes": "Higher taxes on the wealthy",
  "abortion": "Abortion is a woman's unrestricted right",
  "education": "Vouchers for school choice",
  "economy": "Economy & Taxes",
  "social_security": "Privatize Social Security",
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  healthcare: ["health", "medicare", "medicaid", "aca", "affordable care", "drug pricing", "pharmaceutical"],
  environment: ["climate", "environment", "epa", "emission", "clean energy", "renewable", "conservation"],
  gun_control: ["firearm", "gun", "second amendment", "background check", "assault weapon"],
  immigration: ["immigration", "border", "visa", "asylum", "refugee", "daca", "dreamer", "deportation"],
  defense: ["defense", "military", "pentagon", "armed forces", "veteran", "national security"],
  taxes: ["tax", "irs", "revenue", "fiscal"],
  abortion: ["abortion", "reproductive", "roe", "planned parenthood", "contraception"],
  education: ["education", "school", "student loan", "college", "university", "pell grant"],
  economy: ["budget", "spending", "debt ceiling", "appropriation", "economic"],
  social_security: ["social security", "retirement", "pension", "401k"],
};

interface BillVoteRecord {
  id: string;
  congress: number;
  chamber: "House" | "Senate";
  roll_number: number;
  session: number;
  date: string;
  bill_id: string;
  bill_title: string;
  description: string;
  category: string;
  category_topic: string;
  result: "Passed" | "Failed" | "Unknown";
  vote_question: string;
  vote_type: string;
  party_totals: {
    party: string;
    yea: number;
    nay: number;
    not_voting: number;
    present: number;
  }[];
  votes: Record<string, "Yea" | "Nay" | "Not Voting" | "Present">;
  bill_url: string;
  source_url: string;
  is_key_vote: boolean;
  key_vote_reason: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const wait = Math.pow(2, i) * 2000;
        console.log(`  ⏳ Rate limited, waiting ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

function categorize(title: string, question: string): { category: string; topic: string } {
  const text = `${title} ${question}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return { category, topic: CATEGORY_MAP[category] || category };
    }
  }
  return { category: "other", topic: "other" };
}

function isKeyVote(question: string): { is_key: boolean; reason: string } {
  if (question.includes("On Passage") || question.includes("On the Resolution")) {
    return { is_key: true, reason: "Final passage vote" };
  }
  if (question.includes("Cloture")) {
    return { is_key: true, reason: "Cloture motion" };
  }
  if (question.includes("Override")) {
    return { is_key: true, reason: "Veto override attempt" };
  }
  if (question.includes("Conference Report")) {
    return { is_key: true, reason: "Conference report adoption" };
  }
  if (question.includes("On Agreeing to the Resolution")) {
    return { is_key: true, reason: "Resolution vote" };
  }
  return { is_key: false, reason: "" };
}

async function fetchBillTitle(legislationType: string, legislationNumber: string): Promise<string> {
  try {
    const type = legislationType.toLowerCase();
    const url = `${API_BASE}/bill/${CURRENT_CONGRESS}/${type}/${legislationNumber}?api_key=${API_KEY}`;
    const data = await fetchWithRetry(url);
    return data.bill?.title || "";
  } catch {
    return "";
  }
}

async function fetchAllHouseVotes(): Promise<any[]> {
  const votes: any[] = [];
  let offset = 0;
  const limit = 250;

  console.log(`\n📥 Fetching House roll call votes for Congress ${CURRENT_CONGRESS}...`);

  while (true) {
    const url = `${API_BASE}/house-vote?congress=${CURRENT_CONGRESS}&limit=${limit}&offset=${offset}&api_key=${API_KEY}`;
    try {
      const data = await fetchWithRetry(url);
      const items = data.houseRollCallVotes || [];
      if (items.length === 0) break;
      votes.push(...items);
      console.log(`  Fetched ${votes.length} votes...`);
      if (!data.pagination?.next) break;
      offset += limit;
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.warn(`  ⚠️ Error at offset ${offset}: ${e}`);
      break;
    }
  }

  return votes;
}

async function fetchMemberVotes(session: number, rollNumber: number): Promise<Record<string, string>> {
  const votes: Record<string, string> = {};
  let offset = 0;
  const limit = 250;

  while (true) {
    const url = `${API_BASE}/house-vote/${CURRENT_CONGRESS}/${session}/${rollNumber}/members?limit=${limit}&offset=${offset}&api_key=${API_KEY}`;
    try {
      const data = await fetchWithRetry(url);
      const results = data.houseRollCallVoteMemberVotes?.results || [];
      if (results.length === 0) break;
      for (const m of results) {
        if (m.bioguideID && m.voteCast) {
          votes[m.bioguideID] = m.voteCast;
        }
      }
      if (!data.pagination?.next) break;
      offset += limit;
      await new Promise(r => setTimeout(r, 200));
    } catch {
      break;
    }
  }

  return votes;
}

async function main() {
  console.log("=".repeat(50));
  console.log("House Votes Fetch Script (Congress.gov API v3)");
  console.log("=".repeat(50));
  console.log(`Congress: ${CURRENT_CONGRESS}`);
  console.log(`Output: ${OUTPUT_PATH}\n`);
  console.log(`ℹ️ Senate votes not yet available in API — use VoteView for Senate data.\n`);

  const rawVotes = await fetchAllHouseVotes();
  console.log(`\n📊 Total House votes found: ${rawVotes.length}`);

  // Sort by date descending (newest first)
  rawVotes.sort((a, b) => new Date(b.startDate || b.actionDate || 0).getTime() - new Date(a.startDate || a.actionDate || 0).getTime());

  // Parse limit arg
  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const maxToProcess = limitArg ? parseInt(limitArg.split('=')[1]) : 50;
  console.log(`ℹ️ Limiting detailed processing to newest ${maxToProcess} votes (use --limit=N to change)`);

  const allVotes: BillVoteRecord[] = [];
  let processed = 0;
  let detailedCount = 0;

  // Load existing votes to skip redundant processing
  let existingVotes: Record<string, BillVoteRecord> = {};
  if (fs.existsSync(OUTPUT_PATH) && !process.argv.includes('--force')) {
    try {
      const data = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
      if (Array.isArray(data)) {
        data.forEach((v: BillVoteRecord) => existingVotes[v.id] = v);
        console.log(`ℹ️ Loaded ${Object.keys(existingVotes).length} existing votes from disk.`);
      }
    } catch (e) {
      console.warn(`⚠️ Could not read existing votes: ${e}`);
    }
  }

  for (const vote of rawVotes) {
    const voteId = `house-${CURRENT_CONGRESS}-${vote.rollCallNumber}`;
    
    // Skip if already exists and has votes
    if (existingVotes[voteId] && Object.keys(existingVotes[voteId].votes || {}).length > 0) {
      allVotes.push(existingVotes[voteId]);
      continue;
    }

    if (detailedCount >= maxToProcess) {
      // If limit reached, keep existing record if available, else skip details
      if (existingVotes[voteId]) {
        allVotes.push(existingVotes[voteId]);
      }
      continue; 
    }

    const question = vote.voteQuestion || "";
    const { is_key, reason } = isKeyVote(question);
    
    // Get bill title for categorization
    let billTitle = "";
    if (vote.legislationType && vote.legislationNumber) {
      billTitle = await fetchBillTitle(vote.legislationType, vote.legislationNumber);
      await new Promise(r => setTimeout(r, 200));
    }

    const { category, topic } = categorize(billTitle, question);

    // Keep key votes and categorizable votes
    if (!is_key && category === "other") {
      processed++;
      if (processed % 50 === 0) console.log(`  Processed ${processed}/${rawVotes.length}...`);
      continue;
    }

    detailedCount++;
    if (detailedCount > maxToProcess) {
      console.log(`\n🛑 Reached limit of ${maxToProcess} detailed votes. Switching to existing-only mode.`);
    }

    // Fetch per-member votes for key/categorized votes
    console.log(`  🗳️ Fetching member votes for roll #${vote.rollCallNumber}: ${billTitle.slice(0, 60) || question.slice(0, 60)}...`);
    const memberVotes = await fetchMemberVotes(vote.sessionNumber, vote.rollCallNumber);
    await new Promise(r => setTimeout(r, 300));

    const partyTotals = (vote.votePartyTotal || []).map((p: any) => ({
      party: p.party?.type || p.voteParty || "?",
      yea: p.yeaTotal || 0,
      nay: p.nayTotal || 0,
      not_voting: p.notVotingTotal || 0,
      present: p.presentTotal || 0,
    }));

    const record: BillVoteRecord = {
      id: `house-${CURRENT_CONGRESS}-${vote.rollCallNumber}`,
      congress: CURRENT_CONGRESS,
      chamber: "House",
      roll_number: vote.rollCallNumber,
      session: vote.sessionNumber,
      date: vote.startDate || "",
      bill_id: vote.legislationNumber ? `${vote.legislationType}${vote.legislationNumber}` : "",
      bill_title: billTitle,
      description: question,
      category,
      category_topic: topic,
      result: vote.result === "Passed" || vote.result?.includes("Agreed") ? "Passed" :
              vote.result === "Failed" || vote.result?.includes("Rejected") ? "Failed" : "Unknown",
      vote_question: question,
      vote_type: vote.voteType || "",
      party_totals: partyTotals,
      votes: memberVotes,
      bill_url: vote.legislationUrl || "",
      source_url: vote.sourceDataURL || "",
      is_key_vote: is_key,
      key_vote_reason: reason,
    };

    allVotes.push(record);
    processed++;
    if (processed % 50 === 0) console.log(`  Processed ${processed}/${rawVotes.length}...`);
  }

  // Write output
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allVotes, null, 2));

  const keyVotes = allVotes.filter(v => v.is_key_vote);
  const categorized = allVotes.filter(v => v.category !== "other");

  console.log(`\n✅ Wrote ${allVotes.length} votes to ${OUTPUT_PATH}`);
  console.log(`   Key votes: ${keyVotes.length}`);
  console.log(`   Categorized: ${categorized.length}`);
  console.log(`   With member-level data: ${allVotes.filter(v => Object.keys(v.votes).length > 0).length}`);
  console.log(`   Categories:`);
  const cats = allVotes.reduce((acc, v) => { acc[v.category] = (acc[v.category] || 0) + 1; return acc; }, {} as Record<string, number>);
  for (const [cat, count] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${cat}: ${count}`);
  }
}

main().catch(e => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
