#!/usr/bin/env tsx
/**
 * Sync USASpending data into JSON artifacts.
 *
 * Usage:
 *   pnpm tsx pipeline/sync-usaspending.ts
 *   pnpm tsx pipeline/sync-usaspending.ts --test
 *   pnpm tsx pipeline/sync-usaspending.ts --fyStart=2022 --fyEnd=2024
 */

import * as fs from 'fs';
import * as path from 'path';
import { syncUsaSpendingData } from './sources/usaspending.js';

const args = process.argv.slice(2);
const testMode = args.includes('--test');

const fyStartArg = args.find((arg) => arg.startsWith('--fyStart='));
const fyEndArg = args.find((arg) => arg.startsWith('--fyEnd='));
const awardsLimitArg = args.find((arg) => arg.startsWith('--awardsLimit='));

const fiscalYearStart = fyStartArg ? Number(fyStartArg.split('=')[1]) : undefined;
const fiscalYearEnd = fyEndArg ? Number(fyEndArg.split('=')[1]) : undefined;
const awardsLimit = awardsLimitArg ? Number(awardsLimitArg.split('=')[1]) : undefined;

function readJsonIfExists<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

async function syncToDatabase(store: any, status: any) {
  const databaseUrl = process.env.TURSO_DATABASE_URL;
  if (!databaseUrl) return;

  const { createClient } = await import('@libsql/client');
  const db = createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await db.execute(`
    CREATE TABLE IF NOT EXISTS usaspending_sync_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_at TEXT NOT NULL,
      status TEXT NOT NULL,
      fiscal_year_start INTEGER NOT NULL,
      fiscal_year_end INTEGER NOT NULL,
      agencies_processed INTEGER NOT NULL,
      agencies_with_data INTEGER NOT NULL,
      awards_stored INTEGER NOT NULL,
      errors_json TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS agency_budget_totals (
      agency_slug TEXT NOT NULL,
      agency_name TEXT NOT NULL,
      fiscal_year INTEGER NOT NULL,
      total_obligations REAL NOT NULL,
      total_outlays REAL NOT NULL,
      total_budget_authority REAL NOT NULL,
      yoy_change_pct REAL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (agency_slug, fiscal_year)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS agency_program_changes (
      agency_slug TEXT NOT NULL,
      fiscal_year INTEGER NOT NULL,
      program_name TEXT NOT NULL,
      current_amount REAL NOT NULL,
      previous_amount REAL NOT NULL,
      change_amount REAL NOT NULL,
      change_pct REAL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (agency_slug, fiscal_year, program_name)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS agency_awards (
      agency_slug TEXT NOT NULL,
      award_id TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      amount REAL NOT NULL,
      award_type TEXT NOT NULL,
      award_type_label TEXT NOT NULL,
      awarding_agency TEXT NOT NULL,
      awarding_sub_agency TEXT,
      action_date TEXT,
      description TEXT NOT NULL,
      source_url TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (agency_slug, award_id, recipient_name)
    )
  `);

  await db.execute(`CREATE INDEX IF NOT EXISTS idx_agency_budget_fy ON agency_budget_totals(fiscal_year)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_program_change_fy ON agency_program_changes(fiscal_year)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_awards_agency_type ON agency_awards(agency_slug, award_type)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_awards_action_date ON agency_awards(action_date)`);

  const now = new Date().toISOString();

  for (const [agencySlug, agency] of Object.entries<any>(store.agencies || {})) {
    await db.execute({ sql: 'DELETE FROM agency_budget_totals WHERE agency_slug = ?', args: [agencySlug] });
    await db.execute({ sql: 'DELETE FROM agency_program_changes WHERE agency_slug = ?', args: [agencySlug] });
    await db.execute({ sql: 'DELETE FROM agency_awards WHERE agency_slug = ?', args: [agencySlug] });

    for (const row of agency.budget_totals_by_fiscal_year || []) {
      await db.execute({
        sql: `INSERT INTO agency_budget_totals
          (agency_slug, agency_name, fiscal_year, total_obligations, total_outlays, total_budget_authority, yoy_change_pct, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          agencySlug,
          agency.agency_name,
          row.fiscal_year,
          row.total_obligations,
          row.total_outlays,
          row.total_budget_authority,
          row.yoy_change_pct,
          now,
        ],
      });
    }

    for (const row of agency.program_funding_changes || []) {
      await db.execute({
        sql: `INSERT INTO agency_program_changes
          (agency_slug, fiscal_year, program_name, current_amount, previous_amount, change_amount, change_pct, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          agencySlug,
          row.fiscal_year,
          row.program_name,
          row.current_amount,
          row.previous_amount,
          row.change_amount,
          row.change_pct,
          now,
        ],
      });
    }

    for (const row of agency.awards || []) {
      await db.execute({
        sql: `INSERT INTO agency_awards
          (agency_slug, award_id, recipient_name, amount, award_type, award_type_label, awarding_agency, awarding_sub_agency, action_date, description, source_url, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          agencySlug,
          row.award_id,
          row.recipient_name,
          row.amount,
          row.award_type,
          row.award_type_label,
          row.awarding_agency,
          row.awarding_sub_agency,
          row.action_date,
          row.description,
          row.source_url,
          now,
        ],
      });
    }
  }

  await db.execute({
    sql: `INSERT INTO usaspending_sync_runs
      (run_at, status, fiscal_year_start, fiscal_year_end, agencies_processed, agencies_with_data, awards_stored, errors_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      now,
      status.status,
      status.fiscal_year_start,
      status.fiscal_year_end,
      status.total_agencies_processed,
      status.total_agencies_with_data,
      status.total_awards_stored,
      JSON.stringify(status.errors || []),
    ],
  });
}

async function main() {
  const dataPath = testMode ? './pipeline/output/usaspending.test.json' : './src/data/usaspending.json';
  const statusPath = testMode
    ? './pipeline/output/usaspending-sync-status.test.json'
    : './src/data/usaspending-sync-status.json';

  console.log('='.repeat(60));
  console.log('USASpending Sync (JSON Store)');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Test mode: ${testMode ? 'YES' : 'NO'}`);
  if (fiscalYearStart) console.log(`FY Start: ${fiscalYearStart}`);
  if (fiscalYearEnd) console.log(`FY End: ${fiscalYearEnd}`);
  if (awardsLimit) console.log(`Awards limit: ${awardsLimit}`);

  const previousData = readJsonIfExists<Record<string, unknown>>(dataPath);
  const previousStatus = readJsonIfExists<{ last_success_at?: string | null }>(statusPath);

  try {
    const result = await syncUsaSpendingData({
      fiscalYearStart,
      fiscalYearEnd,
      awardsLimit,
    });

    if (result.status.status === 'error' && previousData) {
      result.status.last_success_at = previousStatus?.last_success_at ?? null;
      ensureDir(statusPath);
      fs.writeFileSync(statusPath, JSON.stringify(result.status, null, 2));
      console.error('USASpending sync failed; preserved last-known-good data artifact.');
      process.exit(1);
    }

    ensureDir(dataPath);
    ensureDir(statusPath);

    fs.writeFileSync(dataPath, JSON.stringify(result.store, null, 2));
    fs.writeFileSync(statusPath, JSON.stringify(result.status, null, 2));

    try {
      await syncToDatabase(result.store, result.status);
      if (process.env.TURSO_DATABASE_URL) {
        console.log('Persisted USASpending data to Turso');
      }
    } catch (dbError) {
      console.warn('Database sync skipped/failed:', (dbError as Error).message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('USASpending sync complete');
    console.log('='.repeat(60));
    console.log(`Status: ${result.status.status}`);
    console.log(`Agencies processed: ${result.status.total_agencies_processed}`);
    console.log(`Agencies with data: ${result.status.total_agencies_with_data}`);
    console.log(`Officials mapped: ${result.status.total_officials_mapped}`);
    console.log(`Awards stored: ${result.status.total_awards_stored}`);
    console.log(`Errors: ${result.status.errors.length}`);
    console.log(`Data path: ${dataPath}`);
    console.log(`Status path: ${statusPath}`);

    if (result.status.status === 'error') {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ USASpending sync failed:', error);
    process.exit(1);
  }
}

main();
