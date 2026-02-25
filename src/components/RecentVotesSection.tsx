import type { RecentMemberVote } from '@/lib/live-votes';

interface RecentVotesSectionProps {
  memberName: string;
  votes: RecentMemberVote[];
}

const VOTE_STYLE: Record<string, string> = {
  Yea: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Nay: 'bg-red-100 text-red-700 border-red-200',
  Present: 'bg-amber-100 text-amber-700 border-amber-200',
  'Not Voting': 'bg-slate-100 text-slate-600 border-slate-200',
  Unknown: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function RecentVotesSection({ memberName, votes }: RecentVotesSectionProps) {
  if (votes.length === 0) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-3">
          Recent Roll Calls
        </h3>
        <p className="text-slate-500">No recent synced roll calls available for {memberName}.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Recent Roll Calls</h3>
          <p className="text-sm text-slate-500">Latest votes from the Congress.gov sync feed</p>
        </div>
      </div>

      <div className="space-y-3">
        {votes.map((vote) => (
          <div key={vote.roll_call_id} className="border border-slate-200 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${VOTE_STYLE[vote.vote_position]}`}>
                {vote.vote_position}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(vote.vote_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{vote.question || 'Roll call vote'}</p>

            <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-3">
              <span>Result: {vote.result || 'Unknown'}</span>
              <span>Chamber: {vote.chamber === 'house' ? 'House' : 'Senate'}</span>
              {vote.bill_id && <span>Bill: {vote.bill_id.toUpperCase()}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
