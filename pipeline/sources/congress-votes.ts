/**
 * Fetch and normalize voting records from Congress.gov API.
 *
 * This module powers a lightweight JSON store in src/data/live-votes.json,
 * with sync status persisted in src/data/vote-sync-status.json.
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';

const CONGRESS_API_BASE = 'https://api.congress.gov/v3';
const CURRENT_CONGRESS = 119;

type VotePosition = 'Yea' | 'Nay' | 'Present' | 'Not Voting' | 'Unknown';

export interface NormalizedMemberVote {
  bioguide_id: string;
  member_name: string;
  party: string;
  state: string;
  vote_position: VotePosition;
}

export interface NormalizedRollCall {
  roll_call_id: string;
  congress: number;
  chamber: 'house' | 'senate';
  session: number;
  roll_call_number: number;
  vote_date: string;
  question: string;
  result: string;
  bill_id: string | null;
  source_url: string;
  member_votes: NormalizedMemberVote[];
}

export interface VoteSyncStatus {
  last_attempt_at: string;
  last_success_at: string | null;
  status: 'ok' | 'partial' | 'error';
  lookback_days: number;
  total_roll_calls_fetched: number;
  total_roll_calls_stored: number;
  total_member_votes_stored: number;
  deduped_member_votes: number;
  errors: Array<{
    at: string;
    stage: string;
    message: string;
    detail?: string;
  }>;
}

export interface LiveVotesStore {
  meta: {
    generated_at: string;
    source: 'congress.gov';
    congress: number;
    lookback_days: number;
    total_roll_calls: number;
    total_member_votes: number;
    deduped_member_votes: number;
  };
  roll_calls: NormalizedRollCall[];
}

interface HouseVote {
  congress: number;
  rollCallNumber: number;
  sessionNumber: number;
  result: string;
  voteQuestion?: string;
  legislationNumber?: string;
  legislationType?: string;
  sourceDataURL?: string;
  startDate?: string;
}

interface SenateVote {
  congress: number;
  rollCallNumber: number;
  session: number;
  result?: string;
  question?: string;
  billNumber?: string;
  billType?: string;
  voteUrl?: string;
  date?: string;
}

interface SyncOptions {
  lookbackDays?: number;
  congress?: number;
  outputPath?: string;
  statusPath?: string;
}

interface SyncResult {
  store: LiveVotesStore;
  status: VoteSyncStatus;
}

function log(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  const payload = context ? ` ${JSON.stringify(context)}` : '';
  const line = `[${ts}] [${level}] ${message}${payload}`;
  if (level === 'ERROR') {
    console.error(line);
  } else if (level === 'WARN') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

function getApiKey(): string {
  const key = process.env.CONGRESS_API_KEY;
  if (!key) {
    throw new Error('CONGRESS_API_KEY environment variable required');
  }
  return key;
}

function todayIsoDate(): string {
  return new Date().toISOString().split('T')[0];
}

function parseIsoDate(value: string | undefined): string {
  if (!value) return todayIsoDate();
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return todayIsoDate();
  return dt.toISOString().split('T')[0];
}

function isWithinLookback(dateIso: string, lookbackDays: number): boolean {
  const voteTs = new Date(dateIso).getTime();
  if (Number.isNaN(voteTs)) return false;
  const cutoff = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  return voteTs >= cutoff;
}

function normalizeVotePosition(rawVote: string): VotePosition {
  const vote = rawVote.trim().toLowerCase();
  if (['yea', 'yes', 'aye'].includes(vote)) return 'Yea';
  if (['nay', 'no'].includes(vote)) return 'Nay';
  if (vote === 'present') return 'Present';
  if (
    vote === 'not voting' ||
    vote === 'not-voting' ||
    vote === 'absent' ||
    vote === 'did not vote'
  ) {
    return 'Not Voting';
  }
  return 'Unknown';
}

export function dedupeMemberVotes(votes: NormalizedMemberVote[]): {
  votes: NormalizedMemberVote[];
  removed: number;
} {
  const seen = new Set<string>();
  const deduped: NormalizedMemberVote[] = [];

  for (const vote of votes) {
    const key = vote.bioguide_id || vote.member_name;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(vote);
  }

  return {
    votes: deduped,
    removed: votes.length - deduped.length,
  };
}

function dedupeRollCalls(rollCalls: NormalizedRollCall[]): NormalizedRollCall[] {
  const seen = new Set<string>();
  const deduped: NormalizedRollCall[] = [];

  for (const rc of rollCalls) {
    if (seen.has(rc.roll_call_id)) continue;
    seen.add(rc.roll_call_id);
    deduped.push(rc);
  }

  return deduped.sort((a, b) => b.vote_date.localeCompare(a.vote_date));
}

async function fetchWithAuth(url: string): Promise<Response> {
  const apiKey = getApiKey();
  return fetch(url, {
    headers: {
      'X-API-Key': apiKey,
    },
  });
}

async function fetchJsonWithRetry<T>(url: string, attempts = 3): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetchWithAuth(url);
      if (!response.ok) {
        if (response.status >= 500 || response.status === 429) {
          const waitMs = (i + 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }
        throw new Error(`Congress API error: ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error as Error;
      const waitMs = (i + 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError ?? new Error('Failed to fetch Congress API response');
}

export async function fetchRecentHouseVotes(
  congress = CURRENT_CONGRESS,
  limit = 50,
  offset = 0
): Promise<HouseVote[]> {
  const url = `${CONGRESS_API_BASE}/house-vote/${congress}?offset=${offset}&limit=${limit}&format=json`;
  const data = await fetchJsonWithRetry<{ houseRollCallVotes?: HouseVote[] }>(url);
  return data.houseRollCallVotes || [];
}

export async function fetchRecentSenateVotes(
  congress = CURRENT_CONGRESS,
  limit = 50,
  offset = 0
): Promise<SenateVote[]> {
  const url = `${CONGRESS_API_BASE}/senate-vote/${congress}?offset=${offset}&limit=${limit}&format=json`;
  const data = await fetchJsonWithRetry<{ senateRollCallVotes?: SenateVote[] }>(url);
  return data.senateRollCallVotes || [];
}

export async function parseHouseRollCallXmlText(xmlText: string): Promise<NormalizedMemberVote[]> {
  const parsed = await parseStringPromise(xmlText);
  const recordedVotes = parsed['rollcall-vote']?.['vote-data']?.[0]?.['recorded-vote'] || [];

  return recordedVotes.map((rv: any) => {
    const legislator = rv.legislator?.[0] || {};
    const name = typeof legislator._ === 'string' ? legislator._ : '';
    const bioguideId = legislator.$?.['name-id'] || '';

    return {
      bioguide_id: bioguideId,
      member_name: name,
      party: legislator.$?.party || '',
      state: legislator.$?.state || '',
      vote_position: normalizeVotePosition(rv.vote?.[0] || ''),
    };
  });
}

export async function parseHouseRollCallXML(xmlUrl: string): Promise<NormalizedMemberVote[]> {
  const response = await fetch(xmlUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch House XML: ${response.status} ${response.statusText}`);
  }
  return parseHouseRollCallXmlText(await response.text());
}

export async function parseSenateRollCallXmlText(xmlText: string): Promise<NormalizedMemberVote[]> {
  const parsed = await parseStringPromise(xmlText);
  const members = parsed['roll_call_vote']?.members?.[0]?.member || [];

  return members.map((m: any) => {
    const firstName = m.first_name?.[0] || '';
    const lastName = m.last_name?.[0] || '';
    const bioguideId = m.bioguide_id?.[0] || m.lis_member_id?.[0] || '';

    return {
      bioguide_id: bioguideId,
      member_name: `${firstName} ${lastName}`.trim(),
      party: m.party?.[0] || '',
      state: m.state?.[0] || '',
      vote_position: normalizeVotePosition(m.vote_cast?.[0] || ''),
    };
  });
}

export async function parseSenateRollCallXML(xmlUrl: string): Promise<NormalizedMemberVote[]> {
  const response = await fetch(xmlUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Senate XML: ${response.status} ${response.statusText}`);
  }
  return parseSenateRollCallXmlText(await response.text());
}

function toHouseRollCall(vote: HouseVote, memberVotes: NormalizedMemberVote[]): NormalizedRollCall {
  const billId = vote.legislationNumber && vote.legislationType
    ? `${vote.legislationType.toLowerCase()}${vote.legislationNumber}-${vote.congress}`
    : null;

  return {
    roll_call_id: `${vote.congress}-house-${vote.rollCallNumber}`,
    congress: vote.congress,
    chamber: 'house',
    session: vote.sessionNumber,
    roll_call_number: vote.rollCallNumber,
    vote_date: parseIsoDate(vote.startDate),
    question: vote.voteQuestion || '',
    result: vote.result || '',
    bill_id: billId,
    source_url: vote.sourceDataURL || '',
    member_votes: memberVotes,
  };
}

function toSenateRollCall(vote: SenateVote, memberVotes: NormalizedMemberVote[]): NormalizedRollCall {
  const billId = vote.billNumber && vote.billType
    ? `${vote.billType.toLowerCase()}${vote.billNumber}-${vote.congress}`
    : null;

  return {
    roll_call_id: `${vote.congress}-senate-${vote.rollCallNumber}`,
    congress: vote.congress,
    chamber: 'senate',
    session: vote.session,
    roll_call_number: vote.rollCallNumber,
    vote_date: parseIsoDate(vote.date),
    question: vote.question || '',
    result: vote.result || '',
    bill_id: billId,
    source_url: vote.voteUrl || '',
    member_votes: memberVotes,
  };
}

function safeReadJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getMembersByLastNameMap(): Map<string, string> {
  const membersPath = path.resolve(process.cwd(), 'src/data/members.json');
  const members = safeReadJson<Array<{ bioguide_id: string; full_name: string }>>(membersPath, []);
  const map = new Map<string, string>();

  for (const member of members) {
    const name = member.full_name || '';
    const lastName = name.split(' ').slice(-1)[0]?.toLowerCase();
    if (lastName && !map.has(lastName)) {
      map.set(lastName, member.bioguide_id);
    }
  }

  return map;
}

function resolveMissingBioguideIds(
  memberVotes: NormalizedMemberVote[],
  membersByLastName: Map<string, string>
): NormalizedMemberVote[] {
  return memberVotes.map((vote) => {
    if (vote.bioguide_id) return vote;
    const lastName = vote.member_name.split(' ').slice(-1)[0]?.toLowerCase();
    if (!lastName) return vote;
    const resolved = membersByLastName.get(lastName);
    if (!resolved) return vote;
    return { ...vote, bioguide_id: resolved };
  });
}

function mergeWithExistingRollCalls(
  newRollCalls: NormalizedRollCall[],
  existingStore: LiveVotesStore
): NormalizedRollCall[] {
  const merged = new Map<string, NormalizedRollCall>();

  for (const rc of existingStore.roll_calls || []) {
    merged.set(rc.roll_call_id, rc);
  }
  for (const rc of newRollCalls) {
    merged.set(rc.roll_call_id, rc);
  }

  return dedupeRollCalls(Array.from(merged.values()));
}

export async function syncRecentVotes(options: SyncOptions = {}): Promise<SyncResult> {
  const lookbackDays = options.lookbackDays ?? 7;
  const congress = options.congress ?? CURRENT_CONGRESS;
  const outputPath = options.outputPath ?? path.resolve(process.cwd(), 'src/data/live-votes.json');
  const statusPath = options.statusPath ?? path.resolve(process.cwd(), 'src/data/vote-sync-status.json');

  const existingStore = safeReadJson<LiveVotesStore>(outputPath, {
    meta: {
      generated_at: new Date(0).toISOString(),
      source: 'congress.gov',
      congress,
      lookback_days: lookbackDays,
      total_roll_calls: 0,
      total_member_votes: 0,
      deduped_member_votes: 0,
    },
    roll_calls: [],
  });

  const status: VoteSyncStatus = {
    last_attempt_at: new Date().toISOString(),
    last_success_at: null,
    status: 'ok',
    lookback_days: lookbackDays,
    total_roll_calls_fetched: 0,
    total_roll_calls_stored: 0,
    total_member_votes_stored: 0,
    deduped_member_votes: 0,
    errors: [],
  };

  const membersByLastName = getMembersByLastNameMap();
  const newRollCalls: NormalizedRollCall[] = [];

  const addError = (stage: string, error: unknown, detail?: string) => {
    const message = error instanceof Error ? error.message : String(error);
    status.errors.push({
      at: new Date().toISOString(),
      stage,
      message,
      detail,
    });
    log('ERROR', `Vote sync error at ${stage}`, { message, detail });
  };

  try {
    log('INFO', 'Fetching recent House votes', { congress, lookbackDays });
    const houseVotes = await fetchRecentHouseVotes(congress, 75);

    for (const vote of houseVotes) {
      try {
        const voteDate = parseIsoDate(vote.startDate);
        if (!isWithinLookback(voteDate, lookbackDays)) continue;
        if (!vote.sourceDataURL) continue;

        const parsedVotes = await parseHouseRollCallXML(vote.sourceDataURL);
        const withResolvedIds = resolveMissingBioguideIds(parsedVotes, membersByLastName);
        const deduped = dedupeMemberVotes(withResolvedIds);

        status.deduped_member_votes += deduped.removed;

        newRollCalls.push(toHouseRollCall(vote, deduped.votes));
        status.total_roll_calls_fetched += 1;

        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (error) {
        addError('house-roll-call', error, `rollCallNumber=${vote.rollCallNumber}`);
      }
    }
  } catch (error) {
    addError('house-list', error);
  }

  try {
    log('INFO', 'Fetching recent Senate votes', { congress, lookbackDays });
    const senateVotes = await fetchRecentSenateVotes(congress, 75);

    for (const vote of senateVotes) {
      try {
        const voteDate = parseIsoDate(vote.date);
        if (!isWithinLookback(voteDate, lookbackDays)) continue;

        const voteUrl = vote.voteUrl || '';
        const xmlUrl = voteUrl.includes('/vote/')
          ? voteUrl.replace('/vote/', '/vote/vote_xml/')
          : '';
        if (!xmlUrl) continue;

        const parsedVotes = await parseSenateRollCallXML(xmlUrl);
        const withResolvedIds = resolveMissingBioguideIds(parsedVotes, membersByLastName);
        const deduped = dedupeMemberVotes(withResolvedIds);

        status.deduped_member_votes += deduped.removed;

        newRollCalls.push(toSenateRollCall(vote, deduped.votes));
        status.total_roll_calls_fetched += 1;

        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (error) {
        addError('senate-roll-call', error, `rollCallNumber=${vote.rollCallNumber}`);
      }
    }
  } catch (error) {
    addError('senate-list', error);
  }

  const mergedRollCalls = mergeWithExistingRollCalls(newRollCalls, existingStore);
  const totalMemberVotes = mergedRollCalls.reduce((sum, rc) => sum + rc.member_votes.length, 0);

  const store: LiveVotesStore = {
    meta: {
      generated_at: new Date().toISOString(),
      source: 'congress.gov',
      congress,
      lookback_days: lookbackDays,
      total_roll_calls: mergedRollCalls.length,
      total_member_votes: totalMemberVotes,
      deduped_member_votes: status.deduped_member_votes,
    },
    roll_calls: mergedRollCalls,
  };

  status.total_roll_calls_stored = mergedRollCalls.length;
  status.total_member_votes_stored = totalMemberVotes;

  if (status.errors.length === 0) {
    status.status = 'ok';
    status.last_success_at = new Date().toISOString();
  } else if (mergedRollCalls.length > 0) {
    status.status = 'partial';
    status.last_success_at = new Date().toISOString();
  } else {
    status.status = 'error';
    const previousStatus = safeReadJson<VoteSyncStatus | null>(statusPath, null);
    status.last_success_at = previousStatus?.last_success_at || null;
  }

  writeJson(outputPath, store);
  writeJson(statusPath, status);

  return {
    store,
    status,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncRecentVotes()
    .then(({ status }) => {
      log('INFO', 'Vote sync completed', {
        status: status.status,
        rollCalls: status.total_roll_calls_stored,
        memberVotes: status.total_member_votes_stored,
      });
    })
    .catch((error) => {
      log('ERROR', 'Vote sync failed', { error: error instanceof Error ? error.message : String(error) });
      process.exit(1);
    });
}

export { normalizeVotePosition };
