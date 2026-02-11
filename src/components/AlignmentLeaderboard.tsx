import Link from 'next/link';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/leaderboard';

function PartyBadge({ party }: { party: string }) {
  const colors = {
    D: 'bg-blue-100 text-blue-700',
    R: 'bg-red-100 text-red-700',
    I: 'bg-purple-100 text-purple-700'
  };
  
  const names = { D: 'D', R: 'R', I: 'I' };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors[party as keyof typeof colors] || 'bg-slate-100 text-slate-700'}`}>
      {names[party as keyof typeof names] || party}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let bgColor, textColor;
  
  if (score >= 75) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-700';
  } else if (score >= 50) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
  } else {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${bgColor} ${textColor}`}>
      {score}%
    </span>
  );
}

function LeaderboardRow({ entry, rank, type }: { entry: LeaderboardEntry; rank: number; type: 'top' | 'bottom' }) {
  const isTop = type === 'top';
  
  return (
    <Link 
      href={`/rep/${entry.bioguideId}`}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
    >
      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isTop ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
          {entry.name}
        </p>
        <p className="text-xs text-slate-500">
          {entry.chamber} • {entry.state}
        </p>
      </div>
      <PartyBadge party={entry.party} />
      <ScoreBadge score={entry.alignmentScore} />
    </Link>
  );
}

export default function AlignmentLeaderboard() {
  const leaderboard = getLeaderboard(5);
  
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Say vs. Do Leaderboard
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            How well do politicians' votes align with their stated positions?
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-500">
            <span>📊 {leaderboard.membersWithData} members analyzed</span>
            <span>•</span>
            <span>📈 Average: {leaderboard.averageScore}% alignment</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Most Aligned */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="text-xl font-bold text-green-900">Most Aligned</h3>
                <p className="text-sm text-green-700">Votes match their stated positions</p>
              </div>
            </div>
            <div className="space-y-2">
              {leaderboard.topAligned.map((entry, idx) => (
                <LeaderboardRow key={entry.bioguideId} entry={entry} rank={idx + 1} type="top" />
              ))}
            </div>
          </div>
          
          {/* Least Aligned */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-xl font-bold text-red-900">Least Aligned</h3>
                <p className="text-sm text-red-700">Votes contradict stated positions</p>
              </div>
            </div>
            <div className="space-y-2">
              {leaderboard.bottomAligned.map((entry, idx) => (
                <LeaderboardRow 
                  key={entry.bioguideId} 
                  entry={entry} 
                  rank={leaderboard.membersWithData - leaderboard.bottomAligned.length + idx + 1} 
                  type="bottom" 
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link 
            href="/congress"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
          >
            View All Representatives
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
