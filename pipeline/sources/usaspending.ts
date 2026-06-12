/**
 * USASpending.gov integration.
 *
 * Fetches agency-level fiscal year totals, program-level funding changes,
 * and top contract/grant awards for executive agencies.
 */

import cabinetData from '../../src/data/cabinet.json';

const USASPENDING_API_BASE = 'https://api.usaspending.gov/api/v2';
const REQUEST_TIMEOUT_MS = 30_000;

// USASpending award-type taxonomy: contracts are A-D (BPA Call, Purchase
// Order, Delivery Order, Definitive Contract); grants are 02-05 (Block,
// Formula, Project, Cooperative Agreement). The API rejects requests that
// mix codes from different groups in spending_by_award.
const CONTRACT_AWARD_TYPE_CODES = ['A', 'B', 'C', 'D'];
const GRANT_AWARD_TYPE_CODES = ['02', '03', '04', '05'];

interface UsaSpendingResponse {
  results?: any[];
  page_metadata?: {
    has_next_page?: boolean;
  };
}

export interface AgencyFiscalYearBudget {
  fiscal_year: number;
  total_obligations: number;
  total_outlays: number;
  total_budget_authority: number;
  yoy_change_pct: number | null;
}

export interface ProgramFundingChange {
  program_name: string;
  fiscal_year: number;
  current_amount: number;
  previous_amount: number;
  change_amount: number;
  change_pct: number | null;
}

export type AwardType = 'contract' | 'grant' | 'other';

export interface AgencyAward {
  award_id: string;
  generated_internal_id: string | null;
  recipient_name: string;
  amount: number;
  award_type: AwardType;
  award_type_label: string;
  awarding_agency: string;
  awarding_sub_agency: string | null;
  action_date: string | null;
  description: string;
  source_url: string | null;
}

export interface AgencySpendingProfile {
  agency_slug: string;
  agency_name: string;
  fiscal_year_start: number;
  fiscal_year_end: number;
  budget_totals_by_fiscal_year: AgencyFiscalYearBudget[];
  program_funding_changes: ProgramFundingChange[];
  awards: AgencyAward[];
  contracts_obligated: number;
  grants_obligated: number;
  total_awards_obligated: number;
  last_updated: string;
  source: 'usaspending.gov';
}

export interface OfficialAgencyMap {
  official_id: string;
  official_name: string;
  role: string;
  department: string;
  agency_slug: string;
}

export interface USASpendingDataStore {
  meta: {
    generated_at: string;
    source: 'usaspending.gov';
    fiscal_year_start: number;
    fiscal_year_end: number;
    total_agencies: number;
    total_officials: number;
    total_awards: number;
  };
  agencies: Record<string, AgencySpendingProfile>;
  officials: Record<string, OfficialAgencyMap>;
}

export interface USASpendingSyncStatus {
  last_attempt_at: string;
  last_success_at: string | null;
  status: 'ok' | 'partial' | 'error';
  fiscal_year_start: number;
  fiscal_year_end: number;
  total_agencies_processed: number;
  total_agencies_with_data: number;
  total_officials_mapped: number;
  total_awards_stored: number;
  errors: Array<{
    at: string;
    stage: string;
    message: string;
    detail?: string;
  }>;
}

interface SyncOptions {
  fiscalYearStart?: number;
  fiscalYearEnd?: number;
  awardsLimit?: number;
}

interface SyncResult {
  store: USASpendingDataStore;
  status: USASpendingSyncStatus;
}

function getCurrentFiscalYear(today = new Date()): number {
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;
  return month >= 10 ? year + 1 : year;
}

export function calculateYoYChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

function slugifyAgencyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function pickString(obj: any, keys: string[], fallback = ''): string {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return fallback;
}

function classifyAwardType(raw: string): AwardType {
  const value = raw.toLowerCase();
  if (value.includes('contract')) return 'contract';
  if (value.includes('grant')) return 'grant';
  return 'other';
}

function dateRangeForFiscalYear(fiscalYear: number): { start_date: string; end_date: string } {
  return {
    start_date: `${fiscalYear - 1}-10-01`,
    end_date: `${fiscalYear}-09-30`,
  };
}

function buildAwardFilters(agencyName: string, fiscalYearStart: number, fiscalYearEnd: number) {
  return {
    agencies: [
      {
        type: 'awarding',
        tier: 'toptier',
        name: agencyName,
      },
    ],
    time_period: [
      {
        start_date: `${fiscalYearStart - 1}-10-01`,
        end_date: `${fiscalYearEnd}-09-30`,
      },
    ],
    award_type_codes: [...CONTRACT_AWARD_TYPE_CODES, ...GRANT_AWARD_TYPE_CODES],
  };
}

// The USASpending search API intermittently returns 503 "upstream connect
// error"; observed failure rates make 3 attempts insufficient.
async function postUsaSpending<T>(
  endpoint: string,
  body: Record<string, unknown>,
  attempts = 6
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${USASPENDING_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          await new Promise((resolve) => setTimeout(resolve, (i + 1) * 1000));
          continue;
        }
        const bodyText = await response.text().catch(() => '');
        throw new Error(
          `USASpending API error ${response.status} ${response.statusText} at ${endpoint}: ${bodyText.slice(0, 300)}`
        );
      }

      const payload = (await response.json()) as T;
      return payload;
    } catch (error) {
      lastError = error as Error;
      await new Promise((resolve) => setTimeout(resolve, (i + 1) * 1000));
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error('Unknown USASpending API failure');
}

function getTrackedAgencies(): Array<{ agency_slug: string; agency_name: string }> {
  const seen = new Set<string>();
  const list: Array<{ agency_slug: string; agency_name: string }> = [];

  for (const member of cabinetData.members) {
    const agencyName = member.department;
    if (!agencyName || seen.has(agencyName)) continue;
    seen.add(agencyName);
    list.push({
      agency_slug: slugifyAgencyName(agencyName),
      agency_name: agencyName,
    });
  }

  return list;
}

function getOfficialAgencyMap(): Record<string, OfficialAgencyMap> {
  const mapped: Record<string, OfficialAgencyMap> = {};

  for (const member of cabinetData.members) {
    mapped[member.id] = {
      official_id: member.id,
      official_name: member.name,
      role: member.role,
      department: member.department,
      agency_slug: slugifyAgencyName(member.department),
    };
  }

  return mapped;
}

export function normalizeSpendingOverTimeResponse(
  response: UsaSpendingResponse,
  fiscalYears: number[]
): AgencyFiscalYearBudget[] {
  const amountByYear = new Map<number, { obligations: number; outlays: number; budgetAuthority: number }>();

  for (const row of response.results || []) {
    const fiscalYear = Number(
      row?.fiscal_year ??
      row?.year ??
      row?.time_period?.fiscal_year ??
      row?.time_period?.fiscalYear
    );

    if (!Number.isInteger(fiscalYear)) continue;

    const obligations = toNumber(
      row?.obligated_amount ?? row?.obligations ?? row?.aggregated_amount ?? row?.amount
    );
    const outlays = toNumber(row?.outlay ?? row?.outlays ?? row?.outlay_amount);
    const budgetAuthority = toNumber(
      row?.budget_authority ?? row?.budgetary_resources ?? row?.budget_authority_amount
    );

    amountByYear.set(fiscalYear, {
      obligations,
      outlays,
      budgetAuthority,
    });
  }

  const ordered = [...fiscalYears].sort((a, b) => a - b);

  return ordered.map((fy, idx) => {
    const current = amountByYear.get(fy) || { obligations: 0, outlays: 0, budgetAuthority: 0 };
    const previous = idx > 0 ? amountByYear.get(ordered[idx - 1]) : null;

    return {
      fiscal_year: fy,
      total_obligations: current.obligations,
      total_outlays: current.outlays,
      total_budget_authority: current.budgetAuthority,
      yoy_change_pct: previous ? calculateYoYChange(current.obligations, previous.obligations) : null,
    };
  });
}

function normalizeProgramRows(rows: any[], fiscalYear: number): Map<string, { programName: string; amount: number; fiscalYear: number }> {
  const map = new Map<string, { programName: string; amount: number; fiscalYear: number }>();

  for (const row of rows) {
    const programName = pickString(row, ['name', 'program_name', 'federal_account_name'], 'Unknown Program');
    const amount = toNumber(row?.amount ?? row?.aggregated_amount ?? row?.obligated_amount);
    const normalizedKey = programName.toLowerCase();

    if (!map.has(normalizedKey)) {
      map.set(normalizedKey, {
        programName,
        amount,
        fiscalYear,
      });
      continue;
    }

    const current = map.get(normalizedKey)!;
    current.amount += amount;
  }

  return map;
}

export function normalizeProgramFundingChanges(
  currentYearRows: any[],
  previousYearRows: any[],
  fiscalYear: number
): ProgramFundingChange[] {
  const current = normalizeProgramRows(currentYearRows, fiscalYear);
  const previous = normalizeProgramRows(previousYearRows, fiscalYear - 1);
  const keys = new Set([...current.keys(), ...previous.keys()]);

  const combined: ProgramFundingChange[] = [];

  for (const key of keys) {
    const currentProgram = current.get(key);
    const previousProgram = previous.get(key);

    const currentAmount = currentProgram?.amount ?? 0;
    const previousAmount = previousProgram?.amount ?? 0;
    const changeAmount = currentAmount - previousAmount;

    combined.push({
      program_name: currentProgram?.programName ?? previousProgram?.programName ?? 'Unknown Program',
      fiscal_year: fiscalYear,
      current_amount: currentAmount,
      previous_amount: previousAmount,
      change_amount: changeAmount,
      change_pct: calculateYoYChange(currentAmount, previousAmount),
    });
  }

  return combined
    .sort((a, b) => Math.abs(b.change_amount) - Math.abs(a.change_amount))
    .slice(0, 20);
}

export function normalizeAwardsResponse(
  response: UsaSpendingResponse,
  knownType?: AwardType
): AgencyAward[] {
  return (response.results || [])
    .map((row) => {
      const awardTypeLabel = pickString(row, ['Award Type', 'award_type', 'award_type_name', 'type'], 'Unknown');
      const amount = toNumber(row?.['Award Amount'] ?? row?.amount ?? row?.['Total Obligated Amount']);

      return {
        award_id: pickString(row, ['Award ID', 'award_id', 'piid'], 'unknown-award-id'),
        generated_internal_id: pickString(row, ['generated_internal_id', 'internal_id'], '') || null,
        recipient_name: pickString(row, ['Recipient Name', 'recipient_name', 'recipient'], 'Unknown Recipient'),
        amount,
        // Contract rows come back with a null "Award Type" label, so prefer
        // the award group the request was scoped to.
        award_type: knownType ?? classifyAwardType(awardTypeLabel),
        award_type_label: awardTypeLabel,
        awarding_agency: pickString(row, ['Awarding Agency', 'awarding_agency'], ''),
        awarding_sub_agency: pickString(row, ['Awarding Sub Agency', 'awarding_sub_agency'], '') || null,
        action_date: pickString(row, ['Action Date', 'action_date', 'start_date'], '') || null,
        description: pickString(row, ['Description', 'description', 'award_description'], 'No description'),
        source_url: pickString(row, ['generated_internal_id_url', 'source_url'], '') || null,
      };
    })
    .filter((award) => award.amount >= 0)
    .sort((a, b) => b.amount - a.amount);
}

async function fetchAgencyFiscalYearBudgets(
  agencyName: string,
  fiscalYearStart: number,
  fiscalYearEnd: number
): Promise<AgencyFiscalYearBudget[]> {
  const response = await postUsaSpending<UsaSpendingResponse>('/search/spending_over_time/', {
    group: 'fiscal_year',
    filters: buildAwardFilters(agencyName, fiscalYearStart, fiscalYearEnd),
  });

  const fiscalYears: number[] = [];
  for (let year = fiscalYearStart; year <= fiscalYearEnd; year += 1) {
    fiscalYears.push(year);
  }

  return normalizeSpendingOverTimeResponse(response, fiscalYears);
}

async function fetchProgramFundingChanges(
  agencyName: string,
  fiscalYear: number
): Promise<ProgramFundingChange[]> {
  // The category belongs in the URL path, not the request body — the old
  // body-based form 404s.
  const currentYear = await postUsaSpending<UsaSpendingResponse>(
    '/search/spending_by_category/federal_account/',
    {
      limit: 50,
      page: 1,
      filters: {
        agencies: [
          {
            type: 'awarding',
            tier: 'toptier',
            name: agencyName,
          },
        ],
        time_period: [dateRangeForFiscalYear(fiscalYear)],
        award_type_codes: [...CONTRACT_AWARD_TYPE_CODES, ...GRANT_AWARD_TYPE_CODES],
      },
    }
  );

  const previousYear = await postUsaSpending<UsaSpendingResponse>(
    '/search/spending_by_category/federal_account/',
    {
      limit: 50,
      page: 1,
      filters: {
        agencies: [
          {
            type: 'awarding',
            tier: 'toptier',
            name: agencyName,
          },
        ],
        time_period: [dateRangeForFiscalYear(fiscalYear - 1)],
        award_type_codes: [...CONTRACT_AWARD_TYPE_CODES, ...GRANT_AWARD_TYPE_CODES],
      },
    }
  );

  return normalizeProgramFundingChanges(currentYear.results || [], previousYear.results || [], fiscalYear);
}

async function fetchTopAwardsForCodes(
  agencyName: string,
  fiscalYearStart: number,
  fiscalYearEnd: number,
  limit: number,
  awardTypeCodes: string[],
  knownType: AwardType
): Promise<AgencyAward[]> {
  const response = await postUsaSpending<UsaSpendingResponse>('/search/spending_by_award/', {
    fields: [
      'Award ID',
      'Recipient Name',
      'Award Amount',
      'Award Type',
      'Awarding Agency',
      'Awarding Sub Agency',
      'Action Date',
      'Description',
    ],
    page: 1,
    limit,
    sort: 'Award Amount',
    order: 'desc',
    filters: {
      ...buildAwardFilters(agencyName, fiscalYearStart, fiscalYearEnd),
      award_type_codes: awardTypeCodes,
    },
  });

  return normalizeAwardsResponse(response, knownType);
}

async function fetchTopAwards(
  agencyName: string,
  fiscalYearStart: number,
  fiscalYearEnd: number,
  limit: number
): Promise<AgencyAward[]> {
  // spending_by_award rejects mixed award-type groups ("'award_type_codes'
  // must only contain types from one group"), so contracts and grants are
  // fetched separately and merged.
  const [contracts, grants] = await Promise.all([
    fetchTopAwardsForCodes(
      agencyName, fiscalYearStart, fiscalYearEnd, limit,
      [...CONTRACT_AWARD_TYPE_CODES], 'contract'
    ),
    fetchTopAwardsForCodes(
      agencyName, fiscalYearStart, fiscalYearEnd, limit,
      [...GRANT_AWARD_TYPE_CODES], 'grant'
    ),
  ]);

  return [...contracts, ...grants]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export async function syncUsaSpendingData(options: SyncOptions = {}): Promise<SyncResult> {
  const currentFiscalYear = getCurrentFiscalYear();
  const fiscalYearEnd = options.fiscalYearEnd ?? currentFiscalYear - 1;
  const fiscalYearStart = options.fiscalYearStart ?? fiscalYearEnd - 2;
  const awardsLimit = options.awardsLimit ?? 30;

  const status: USASpendingSyncStatus = {
    last_attempt_at: new Date().toISOString(),
    last_success_at: null,
    status: 'ok',
    fiscal_year_start: fiscalYearStart,
    fiscal_year_end: fiscalYearEnd,
    total_agencies_processed: 0,
    total_agencies_with_data: 0,
    total_officials_mapped: 0,
    total_awards_stored: 0,
    errors: [],
  };

  const agencies: Record<string, AgencySpendingProfile> = {};
  const trackedAgencies = getTrackedAgencies();
  const officials = getOfficialAgencyMap();

  for (const agency of trackedAgencies) {
    status.total_agencies_processed += 1;

    try {
      const [fyBudgets, programChanges, awards] = await Promise.all([
        fetchAgencyFiscalYearBudgets(agency.agency_name, fiscalYearStart, fiscalYearEnd),
        fetchProgramFundingChanges(agency.agency_name, fiscalYearEnd),
        fetchTopAwards(agency.agency_name, fiscalYearStart, fiscalYearEnd, awardsLimit),
      ]);

      const contractsObligated = awards
        .filter((award) => award.award_type === 'contract')
        .reduce((sum, award) => sum + award.amount, 0);
      const grantsObligated = awards
        .filter((award) => award.award_type === 'grant')
        .reduce((sum, award) => sum + award.amount, 0);

      agencies[agency.agency_slug] = {
        agency_slug: agency.agency_slug,
        agency_name: agency.agency_name,
        fiscal_year_start: fiscalYearStart,
        fiscal_year_end: fiscalYearEnd,
        budget_totals_by_fiscal_year: fyBudgets,
        program_funding_changes: programChanges,
        awards,
        contracts_obligated: contractsObligated,
        grants_obligated: grantsObligated,
        total_awards_obligated: contractsObligated + grantsObligated,
        last_updated: new Date().toISOString(),
        source: 'usaspending.gov',
      };

      status.total_agencies_with_data += 1;
      status.total_awards_stored += awards.length;
    } catch (error) {
      status.errors.push({
        at: new Date().toISOString(),
        stage: `agency-sync:${agency.agency_name}`,
        message: (error as Error).message,
      });
    }
  }

  status.total_officials_mapped = Object.keys(officials).length;

  if (status.total_agencies_with_data === 0) {
    status.status = 'error';
  } else if (status.errors.length > 0) {
    status.status = 'partial';
  } else {
    status.status = 'ok';
  }

  if (status.status !== 'error') {
    status.last_success_at = new Date().toISOString();
  }

  const store: USASpendingDataStore = {
    meta: {
      generated_at: new Date().toISOString(),
      source: 'usaspending.gov',
      fiscal_year_start: fiscalYearStart,
      fiscal_year_end: fiscalYearEnd,
      total_agencies: Object.keys(agencies).length,
      total_officials: Object.keys(officials).length,
      total_awards: status.total_awards_stored,
    },
    agencies,
    officials,
  };

  return {
    store,
    status,
  };
}
