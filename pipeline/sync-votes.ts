#!/usr/bin/env tsx
/**
 * Sync congressional votes from Congress.gov API into JSON data store.
 *
 * Usage:
 *   pnpm tsx pipeline/sync-votes.ts
 *   pnpm tsx pipeline/sync-votes.ts --days=30
 *   pnpm tsx pipeline/sync-votes.ts --test
 */

import { syncRecentVotes } from './sources/congress-votes.js';

const args = process.argv.slice(2);
const lookbackDays = parseInt(args.find((a) => a.startsWith('--days='))?.split('=')[1] || '7', 10);
const testMode = args.includes('--test');

async function main() {
  console.log('='.repeat(60));
  console.log('Congressional Votes Sync (JSON Store)');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Lookback period: ${lookbackDays} days`);
  console.log(`Test mode: ${testMode ? 'YES' : 'NO'}\n`);

  try {
    const result = await syncRecentVotes({
      lookbackDays,
      outputPath: testMode ? './pipeline/output/live-votes.test.json' : './src/data/live-votes.json',
      statusPath: testMode ? './pipeline/output/vote-sync-status.test.json' : './src/data/vote-sync-status.json',
    });

    console.log('\n' + '='.repeat(60));
    console.log('Sync complete');
    console.log('='.repeat(60));
    console.log(`Status: ${result.status.status}`);
    console.log(`Roll calls stored: ${result.status.total_roll_calls_stored}`);
    console.log(`Member votes stored: ${result.status.total_member_votes_stored}`);
    console.log(`Deduped member votes: ${result.status.deduped_member_votes}`);
    console.log(`Errors: ${result.status.errors.length}`);
    console.log(`Completed at: ${new Date().toISOString()}`);

    if (result.status.status === 'error') {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();
