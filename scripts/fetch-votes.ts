#!/usr/bin/env tsx
/**
 * Fetch recent key votes from Congress.gov API
 * 
 * Usage: CONGRESS_API_KEY=xxx tsx scripts/fetch-votes.ts
 * 
 * Fetches roll call votes for the current Congress and categorizes them
 * for use in alignment score calculation.
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
  console.error("❌ CONGRESS_API_KEY required.");
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

// Keywords to auto-categorize bills
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
  date: string;
  bill_id: string;
  bill_title: string;
  description: string;
  category: string;
  category_topic: string; // Maps to OnTheIssues topic
  result: "Passed" | "Failed" | "Unknown";
  yea_count: number;
  nay_count: number;
  votes: Record<string, "Yea" | "Nay" | "Not Voting" | "Present">;
  bill_url: string;
  is_key_vote: boolean;
  key_vote_reason: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 2000));
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

function categorize(title: string, description: string): { category: string; topic: string } {
  const text = `${title} ${description}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return { category, topic: CATEGORY_MAP[category] || category };
    }
  }
  return { category: "other", topic: "other" };
}

function isKeyVote(vote: any): { is_key: boolean; reason: string } {
  // Final passage votes are key votes
  if (vote.question?.includes("On Passage") || vote.question?.includes("On the Resolution")) {
    return { is_key: true, reason: "Final passage vote" };
  }
  // Cloture votes on major bills
  if (vote.question?.includes("On the Cloture Motion")) {
    return { is_key: true, reason: "Cloture motion (filibuster override)" };
  }
  // Veto overrides
  if (vote.question?.includes("Override")) {
    return { is_key: true, reason: "Veto override attempt" };
  }
  // Conference report adoption
  if (vote.question?.includes("Conference Report")) {
    return { is_key: true, reason: "Conference report adoption" };
  }
  return { is_key: false, reason: "" };
}

async function fetchRollCallVotes(chamber: "house" | "senate"): Promise<any[]> {
  const votes: any[] = [];
  let offset = 0;
  const limit = 250;

  console.log(`\n📥 Fetching ${chamber} roll call votes for Congress ${CURRENT_CONGRESS}...`);

  while (true) {
    const url = `${API_BASE}/roll-call-vote/${CURRENT_CONGRESS}/${chamber}?limit=${limit}&offset=${offset}&api_key=${API_KEY}`;
    
    try {
      const data = await fetchWithRetry(url);
      const items = data.rollCallVotes || data.roll_call_votes || [];
      
      if (items.length === 0) break;
      votes.push(...items);
      console.log(`  Fetched ${votes.length} ${chamber} votes...`);

      if (!data.pagination?.next) break;
      offset += limit;
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.warn(`  ⚠️ Error fetching ${chamber} votes at offset ${offset}: ${e}`);
      break;
    }
  }

  return votes;
}

async function fetchVoteDetail(url: string): Promise<any> {
  try {
    const fullUrl = url.includes("api_key") ? url : `${url}?api_key=${API_KEY}`;
    return await fetchWithRetry(fullUrl);
  } catch (e) {
    console.warn(`  ⚠️ Could not fetch vote detail: ${e}`);
    return null;
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("Key Votes Fetch Script");
  console.log("=".repeat(50));
  console.log(`Congress: ${CURRENT_CONGRESS}`);
  console.log(`Source: Congress.gov API v3`);
  console.log(`Output: ${OUTPUT_PATH}\n`);

  const allVotes: BillVoteRecord[] = [];

  // Fetch from both chambers
  for (const chamber of ["house", "senate"] as const) {
    const rawVotes = await fetchRollCallVotes(chamber);
    console.log(`  Got ${rawVotes.length} raw ${chamber} votes`);

    // Process each vote
    for (const vote of rawVotes) {
      const title = vote.bill?.title || vote.question || "Unknown";
      const desc = vote.description || "";
      const { category, topic } = categorize(title, desc);
      const { is_key, reason } = isKeyVote(vote);

      // Only keep key votes and categorizable votes
      if (!is_key && category === "other") continue;

      const record: BillVoteRecord = {
        id: `${chamber}-${CURRENT_CONGRESS}-${vote.rollNumber || vote.roll_number}`,
        congress: CURRENT_CONGRESS,
        chamber: chamber === "house" ? "House" : "Senate",
        roll_number: vote.rollNumber || vote.roll_number,
        date: vote.date || vote.actionDate || "",
        bill_id: vote.bill?.number ? `${vote.bill.type || ""}${vote.bill.number}` : "",
        bill_title: title,
        description: desc,
        category,
        category_topic: topic,
        result: vote.result?.includes("Passed") || vote.result?.includes("Agreed") ? "Passed" : 
                vote.result?.includes("Failed") || vote.result?.includes("Rejected") ? "Failed" : "Unknown",
        yea_count: vote.yea_count || vote.total?.yea || 0,
        nay_count: vote.nay_count || vote.total?.nay || 0,
        votes: {}, // Populated from vote detail
        bill_url: vote.bill?.url || vote.url || "",
        is_key_vote: is_key,
        key_vote_reason: reason,
      };

      allVotes.push(record);
    }
  }

  // Write output
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allVotes, null, 2));

  const keyVotes = allVotes.filter(v => v.is_key_vote);
  const categorized = allVotes.filter(v => v.category !== "other");

  console.log(`\n✅ Wrote ${allVotes.length} votes to ${OUTPUT_PATH}`);
  console.log(`   Key votes: ${keyVotes.length}`);
  console.log(`   Categorized: ${categorized.length}`);
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
