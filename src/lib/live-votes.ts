import liveVotesData from '@/data/live-votes.json';
import voteSyncStatusData from '@/data/vote-sync-status.json';

export type VotePosition = 'Yea' | 'Nay' | 'Present' | 'Not Voting' | 'Unknown';

export interface RecentMemberVote {
  roll_call_id: string;
  chamber: 'house' | 'senate';
  vote_date: string;
  question: string;
  result: string;
  bill_id: string | null;
  vote_position: VotePosition;
}

interface StoredMemberVote {
  bioguide_id: string;
  member_name: string;
  party: string;
  state: string;
  vote_position: VotePosition;
}

interface StoredRollCall {
  roll_call_id: string;
  chamber: 'house' | 'senate';
  vote_date: string;
  question: string;
  result: string;
  bill_id: string | null;
  member_votes: StoredMemberVote[];
}

interface LiveVotesStore {
  meta: {
    generated_at: string;
    source: 'congress.gov';
    congress: number;
    lookback_days: number;
    total_roll_calls: number;
    total_member_votes: number;
    deduped_member_votes: number;
  };
  roll_calls: StoredRollCall[];
}

interface VoteSyncStatus {
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

function getStore(): LiveVotesStore {
  return liveVotesData as LiveVotesStore;
}

export function getVoteSyncStatus(): VoteSyncStatus {
  return voteSyncStatusData as VoteSyncStatus;
}

export function getRecentVotesForMember(bioguideId: string, limit = 10): RecentMemberVote[] {
  const store = getStore();

  return store.roll_calls
    .slice()
    .sort((a, b) => b.vote_date.localeCompare(a.vote_date))
    .map((rollCall) => {
      const memberVote = rollCall.member_votes.find((vote) => vote.bioguide_id === bioguideId);
      if (!memberVote) return null;

      return {
        roll_call_id: rollCall.roll_call_id,
        chamber: rollCall.chamber,
        vote_date: rollCall.vote_date,
        question: rollCall.question,
        result: rollCall.result,
        bill_id: rollCall.bill_id,
        vote_position: memberVote.vote_position,
      } satisfies RecentMemberVote;
    })
    .filter((vote): vote is RecentMemberVote => vote !== null)
    .slice(0, limit);
}

export function getLiveVoteMeta() {
  return getStore().meta;
}
