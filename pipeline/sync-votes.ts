#!/usr/bin/env tsx
/**
 * Sync congressional votes from Congress.gov API to database
 * 
 * Usage:
 *   pnpm tsx pipeline/sync-votes.ts          # Sync past 7 days
 *   pnpm tsx pipeline/sync-votes.ts --days 30  # Sync past 30 days
 *   pnpm tsx pipeline/sync-votes.ts --test   # Test mode (no DB writes)
 */

import db from './lib/db.js';
import { syncRecentVotes, fetchRecentHouseVotes, parseHouseRollCallXML } from './sources/congress-votes.js';

const args = process.argv.slice(2);
const lookbackDays = parseInt(args.find(a => a.startsWith('--days='))?.split('=')[1] || '7');
const testMode = args.includes('--test');

async function main() {
  console.log("=".repeat(60));
  console.log("Congressional Votes Sync");
  console.log("=".repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Lookback period: ${lookbackDays} days`);
  console.log(`Test mode: ${testMode ? 'YES' : 'NO'}\n`);

  if (testMode) {
    console.log("TEST MODE: Fetching data but not writing to database\n");
    
    // Just test API access
    const votes = await fetchRecentHouseVotes(119, 3);
    console.log(`\n✓ Fetched ${votes.length} recent House votes`);
    
    if (votes[0]) {
      console.log("\nSample vote:");
      console.log(`  Roll Call: ${votes[0].rollCallNumber}`);
      console.log(`  Date: ${votes[0].startDate}`);
      console.log(`  Question: ${votes[0].voteQuestion || 'N/A'}`);
      console.log(`  Result: ${votes[0].result}`);
      
      const members = await parseHouseRollCallXML(votes[0].sourceDataURL);
      console.log(`\n✓ Parsed ${members.length} member votes`);
      console.log("\nSample members:");
      members.slice(0, 3).forEach(m => {
        console.log(`  ${m.name} (${m.party}-${m.state}): ${m.vote}`);
      });
    }
    
    console.log("\n✓ Test complete - no database changes made");
    return;
  }

  try {
    const synced = await syncRecentVotes(db, lookbackDays);
    
    console.log("\n" + "=".repeat(60));
    console.log("Sync complete!");
    console.log("=".repeat(60));
    console.log(`Total records synced: ${synced}`);
    console.log(`Completed at: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  }
}

main();
