import { getMember, getMembers, getMemberFinance, getMemberTrades, getMemberDisclosures, getMemberAlignment, getAlignmentRanking } from "@/lib/data";
import { getMemberAlignmentEnhanced, getAlignmentRankingEnhanced } from "@/lib/data-enhanced";
import { notFound } from "next/navigation";
import Link from "next/link";
import DonorAnalysisSection from "@/components/DonorAnalysisSection";
import VotingRecordSection from "@/components/VotingRecordSection";
import MemberVotingRecord from "@/components/MemberVotingRecord";
import CommitteeMemberships from "@/components/CommitteeMemberships";
import StockTradesSection from "@/components/StockTradesSection";
import FinancialDisclosuresSection from "@/components/FinancialDisclosuresSection";
import CampaignPositions from "@/components/CampaignPositions";
import VoteBasedPositions from "@/components/VoteBasedPositions";
import AlignmentScoreCard from "@/components/AlignmentScoreCard";
import AlignmentScoreCardEnhanced from "@/components/AlignmentScoreCardEnhanced";
import RepresentativeImage from "@/components/RepresentativeImage";
import keyVotesData from "@/data/key-votes.json";
import positionsData from "@/data/positions.json";

export function generateStaticParams() {
  return getMembers().map((member) => ({
    id: member.bioguide_id,
  }));
}

export default async function RepPage({ params }: { params: { id: string } }) {
  const member = getMember(params.id);

  if (!member) {
    notFound();
  }

  // Get real finance data from OpenFEC API
  const finance = await getMemberFinance(params.id);

  // Placeholder committee data (will be replaced with real data)
  const committees = [
    {
      name: "Committee data coming soon",
      role: "Member" as const,
    },
  ];

  // Key votes are now handled by MemberVotingRecord component using real VoteView data
  // This empty array is just to satisfy VotingRecordSection's interface
  const keyVotes: Array<{
    date: string;
    bill: string;
    title: string;
    vote: "Yea" | "Nay" | "Present" | "Not Voting";
    partyPosition: "Yea" | "Nay";
    aligned: boolean;
  }> = [];

  // Real stock trades from Quiver Quant
  const stockTrades = getMemberTrades(params.id) as Array<{
    ticker: string;
    company: string | null;
    tradedDate: string;
    filedDate: string;
    transaction: "Purchase" | "Sale";
    tradeSizeUsd: number;
    excessReturn: number | null;
  }>;

  // Financial disclosures from House Clerk
  const financialDisclosures = getMemberDisclosures(params.id);

  // Position-to-vote alignment data (enhanced with confidence and multi-factor scoring)
  const alignmentEnhanced = getMemberAlignmentEnhanced(params.id);
  const alignmentRankingEnhanced = getAlignmentRankingEnhanced(params.id);
  
  // Keep basic alignment as fallback
  const alignment = getMemberAlignment(params.id);
  const alignmentRanking = getAlignmentRanking(params.id);

  const getPartyBadgeClass = (party: string) => {
    switch (party) {
      case "D":
        return "bg-blue-100 text-blue-700";
      case "R":
        return "bg-red-100 text-red-700";
      case "I":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPartyName = (party: string) => {
    switch (party) {
      case "D":
        return "Democrat";
      case "R":
        return "Republican";
      case "I":
        return "Independent";
      default:
        return party;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/congress"
              className="text-slate-600 hover:text-slate-900 text-base font-medium transition"
            >
              ← Back to Representatives
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Photo */}
            <RepresentativeImage
              bioguideId={member.bioguide_id}
              fullName={member.full_name}
              party={member.party}
              photoUrl={member.photo_url}
              size="lg"
            />

            <div className="flex-1">
              {/* Name */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-3 leading-tight">
                {member.full_name}
              </h1>

              {/* Party & District */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span
                  className={`px-3 py-1.5 rounded-lg font-bold text-sm ${getPartyBadgeClass(
                    member.party
                  )}`}
                >
                  {getPartyName(member.party)}
                </span>
                <span className="text-lg text-slate-600">
                  {member.state}
                  {member.district ? `-${member.district}` : ""} •{" "}
                  {member.chamber === "house" ? "Representative" : "Senator"}
                </span>
              </div>

              {/* Quick Stats Row */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-slate-500">Bills Sponsored</span>
                  <span className="ml-2 font-bold text-slate-900">{member.bills_sponsored}</span>
                </div>
                <div>
                  <span className="text-slate-500">Bills Cosponsored</span>
                  <span className="ml-2 font-bold text-slate-900">{member.bills_cosponsored}</span>
                </div>
                <div>
                  <span className="text-slate-500">Votes Cast</span>
                  <span className="ml-2 font-bold text-slate-900">{member.votes_cast}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href={`https://www.congress.gov/member/${member.bioguide_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Congress.gov Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Finance - Now the main focus */}
            <DonorAnalysisSection finance={finance} />

            {/* Key Votes Record */}
            <MemberVotingRecord
              bioguideId={member.bioguide_id}
              memberName={member.full_name}
              chamber={member.chamber === "house" ? "House" : "Senate"}
              keyVotes={keyVotesData as unknown as Array<{
                id: string;
                congress: number;
                chamber: "House" | "Senate";
                rollnumber: number;
                date: string;
                bill: string;
                title: string;
                description: string;
                category: string;
                yea_count: number;
                nay_count: number;
                result: "Passed" | "Failed" | "Unknown";
                votes: Record<string, string>;
              }>}
            />

            {/* Policy Positions: Says vs Does (Vote-Based) */}
            <VoteBasedPositions 
              bioguideId={member.bioguide_id} 
              positionsData={positionsData as { members: Array<{ bioguide_id: string; name: string; source: string; source_url: string; last_updated: string; positions: Array<{ topic: string; stance: string; intensity: number; quotes: string[]; votes?: unknown[] }> }> }}
              keyVotesData={keyVotesData as unknown as Array<{
                id: string;
                bill: string;
                title: string;
                category: string;
                date: string;
                description: string;
                votes: Record<string, string>;
                yea_count: number;
                nay_count: number;
              }>}
              allMembers={getMembers().map(m => ({ bioguide_id: m.bioguide_id, party: m.party }))}
            />
            
            {/* Voting Record (Party Loyalty & Ideology) */}
            <VotingRecordSection
              partyLoyalty={member.party_alignment_pct}
              ideologyScore={member.ideology_score}
              keyVotes={keyVotes}
            />

            {/* Stock Trades */}
            <StockTradesSection 
              trades={stockTrades} 
              memberName={member.full_name} 
            />

            {/* Financial Disclosures */}
            <FinancialDisclosuresSection 
              disclosures={financialDisclosures} 
              memberName={member.full_name} 
            />
          </div>

          {/* Sidebar (1/3 width) */}
          <aside className="space-y-8">
            {/* Position-to-Vote Alignment (Enhanced) */}
            {alignmentEnhanced ? (
              <AlignmentScoreCardEnhanced 
                alignment={alignmentEnhanced} 
                ranking={alignmentRankingEnhanced}
              />
            ) : (
              <AlignmentScoreCard 
                alignment={alignment} 
                ranking={alignmentRanking}
              />
            )}

            {/* Committee Memberships */}
            <CommitteeMemberships committees={committees} />

            {/* External Links */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-4">
                Resources
              </h4>
              <div className="space-y-2 text-sm">
                <a
                  href={`https://www.congress.gov/member/${member.bioguide_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline block"
                >
                  Congress.gov Profile →
                </a>
                <a
                  href={`https://bioguide.congress.gov/search/bio/${member.bioguide_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline block"
                >
                  Biographical Directory →
                </a>
                <a
                  href={`https://www.opensecrets.org/search?q=${encodeURIComponent(member.full_name)}&type=politicians`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline block"
                >
                  OpenSecrets Profile →
                </a>
                <a
                  href={`https://www.fec.gov/data/candidates/?q=${encodeURIComponent(member.last_name)}&office=${member.chamber === 'house' ? 'H' : 'S'}&state=${member.state}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline block"
                >
                  FEC Filings →
                </a>
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3">📊 Data Sources</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Congress.gov API</li>
                <li>• Federal Election Commission</li>
                <li>• Voteview (voting records)</li>
              </ul>
              <p className="text-xs text-slate-400 mt-3">
                Data updated regularly. Last build: {new Date().toLocaleDateString()}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
