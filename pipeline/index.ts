/**
 * Main data pipeline - fetches and processes all data sources
 * 
 * Run with: pnpm pipeline
 * 
 * This script:
 * 1. Fetches current members from Congress.gov
 * 2. Fetches voting records from Voteview
 * 3. Fetches campaign finance from FEC (detailed donor breakdown)
 * 4. Writes to src/data for Next.js static import
 */

import { fetchAllMembers, transformMember, enrichMembersWithBills } from "./sources/congress-members.js";
import { fetchVoteviewData, calculatePartyLoyalty } from "./sources/voteview.js";
import { fetchAllMemberFinance } from "./sources/fec.js";
import { enrichWithCommittees } from "./sources/propublica-committees.js";
import * as fs from "fs";

async function runPipeline() {
  console.log("=".repeat(60));
  console.log("Rep Accountability Dashboard - Data Pipeline");
  console.log("=".repeat(60));
  console.log(`Started at: ${new Date().toISOString()}\n`);

  try {
    // Step 1: Fetch members
    console.log("\n[1/5] Fetching Congress members...");
    const members = await fetchAllMembers();
    console.log(`✓ Got ${members.length} members\n`);
    
    // Step 1b: Enrich with bills data
    console.log("[1b/5] Enriching with bills data...");
    const enrichedMembers = await enrichMembersWithBills(members);
    let transformedMembers = enrichedMembers.map(transformMember);
    console.log(`✓ Transformed ${transformedMembers.length} members\n`);

    // Step 1c: Enrich with committee data from ProPublica
    console.log("[1c/5] Fetching committee assignments from ProPublica...");
    if (process.env.PROPUBLICA_API_KEY) {
      const committeesMap = await enrichWithCommittees(
        transformedMembers.map(m => ({ bioguide_id: m.bioguide_id, full_name: m.full_name })),
        10,   // batch size
        200   // delay between batches (ms)
      );
      
      // Merge committee data into members
      transformedMembers = transformedMembers.map(m => ({
        ...m,
        committees: committeesMap.get(m.bioguide_id) || [],
      }));
      
      const membersWithCommittees = transformedMembers.filter(m => m.committees.length > 0).length;
      console.log(`✓ Added committee data for ${membersWithCommittees}/${transformedMembers.length} members\n`);
    } else {
      console.log("⚠️  Skipping committee data (set PROPUBLICA_API_KEY)");
      console.log("   Get one at: https://www.propublica.org/datastore/api/propublica-congress-api\n");
    }

    // Step 2: Fetch voting data from Voteview
    console.log("\n[2/5] Fetching voting records from Voteview...");
    const voteviewData = await fetchVoteviewData();
    
    // Merge Voteview data
    for (const member of transformedMembers) {
      const vv = voteviewData.get(member.bioguide_id);
      if (vv) {
        member.party_loyalty_pct = calculatePartyLoyalty(vv);
        member.ideology_score = vv.nominate_dim1;
        member.votes_cast = vv.nominate_number_of_votes || 0;
        member.votes_against_party = vv.nominate_number_of_errors || 0;
      }
    }
    
    const membersWithVotes = transformedMembers.filter(m => m.party_loyalty_pct !== undefined).length;
    console.log(`✓ Merged voting data for ${membersWithVotes}/${transformedMembers.length} members`);

    // Step 3: Fetch campaign finance from FEC
    console.log("\n[3/5] Fetching campaign finance from FEC...");
    
    let financeData: Record<string, any> = {};
    
    if (process.env.FEC_API_KEY && process.env.FEC_API_KEY !== 'DEMO_KEY') {
      financeData = await fetchAllMemberFinance(
        transformedMembers.map(m => ({
          bioguide_id: m.bioguide_id,
          full_name: m.full_name,
          state: m.state,
          chamber: m.chamber,
          district: m.district,
        })),
        10,   // batch size (reduced to avoid rate limits)
        3000 // delay between batches (ms) - 3 seconds
      );
      
      console.log(`✓ Got detailed finance data for ${Object.keys(financeData).length} members`);
    } else {
      console.log("⚠️  Skipping FEC (set FEC_API_KEY for real data)");
      console.log("   Run: export FEC_API_KEY=your_key_here");
    }

    // Step 4: Write output files
    console.log("\n[4/5] Writing output files...");
    
    const outDir = "./pipeline/output";
    const srcDataDir = "./src/data";
    
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    if (!fs.existsSync(srcDataDir)) {
      fs.mkdirSync(srcDataDir, { recursive: true });
    }

    // Write members.json
    fs.writeFileSync(
      `${srcDataDir}/members.json`,
      JSON.stringify(transformedMembers, null, 2)
    );
    console.log(`✓ Wrote ${srcDataDir}/members.json (${transformedMembers.length} members)`);
    
    // Write finance.json
    fs.writeFileSync(
      `${srcDataDir}/finance.json`,
      JSON.stringify(financeData, null, 2)
    );
    console.log(`✓ Wrote ${srcDataDir}/finance.json (${Object.keys(financeData).length} records)`);
    
    // Extract and write committees.json for easy querying
    const committeesData: Record<string, any> = {};
    for (const member of transformedMembers) {
      if (member.committees && member.committees.length > 0) {
        committeesData[member.bioguide_id] = {
          name: member.full_name,
          party: member.party,
          state: member.state,
          chamber: member.chamber,
          committees: member.committees,
        };
      }
    }
    
    fs.writeFileSync(
      `${srcDataDir}/committees.json`,
      JSON.stringify(committeesData, null, 2)
    );
    console.log(`✓ Wrote ${srcDataDir}/committees.json (${Object.keys(committeesData).length} members with committees)`);

    // Also copy to pipeline/output for reference
    fs.writeFileSync(
      `${outDir}/members.json`,
      JSON.stringify(transformedMembers, null, 2)
    );
    fs.writeFileSync(
      `${outDir}/finance.json`,
      JSON.stringify(financeData, null, 2)
    );
    fs.writeFileSync(
      `${outDir}/committees.json`,
      JSON.stringify(committeesData, null, 2)
    );

    // Count members with committee data
    const membersWithCommittees = transformedMembers.filter(m => m.committees && m.committees.length > 0).length;
    const totalCommittees = transformedMembers.reduce((sum, m) => sum + (m.committees?.length || 0), 0);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("Pipeline complete!");
    console.log("=".repeat(60));
    console.log(`\nSummary:`);
    console.log(`  Members: ${transformedMembers.length}`);
    console.log(`  With voting data: ${membersWithVotes}`);
    console.log(`  With finance data: ${Object.keys(financeData).length}`);
    console.log(`  With committee data: ${membersWithCommittees}`);
    console.log(`  Total committee assignments: ${totalCommittees}`);
    console.log(`\nRun 'pnpm build' to rebuild the site with new data.`);

  } catch (error) {
    console.error("\n❌ Pipeline failed:", error);
    process.exit(1);
  }
}

runPipeline();
