import Link from "next/link";
import RepresentativeImage from "@/components/RepresentativeImage";
import { getMemberFinanceStatic } from "@/lib/data";
import { calculateGrade } from "@/lib/grading";
import type { Member } from "@/lib/types";

interface MemberCardProps {
  member: Member;
  userState: string | null;
  currentStateFilter: string;
}

export default function MemberCard({ member, userState, currentStateFilter }: MemberCardProps) {
  // Get finance data and calculate grade
  const finance = getMemberFinanceStatic(member.bioguide_id);
  const grade = calculateGrade({
    pac_percentage: finance?.pac_percentage,
    large_donor_percentage: finance?.large_donor_percentage,
  });
  
  // Check if this is user's representative
  const isUserRep = userState === member.state;
  
  // Grade badge colors
  const gradeColors: Record<string, string> = {
    A: "bg-green-100 text-green-700 border-green-200",
    B: "bg-blue-100 text-blue-700 border-blue-200",
    C: "bg-yellow-100 text-yellow-700 border-yellow-200",
    D: "bg-orange-100 text-orange-700 border-orange-200",
    F: "bg-red-100 text-red-700 border-red-200",
  };
  
  return (
    <Link
      href={`/rep/${member.bioguide_id}`}
      className={`bg-white border rounded-xl p-6 transition-all duration-200 hover:shadow-lg cursor-pointer group overflow-hidden relative ${
        isUserRep && currentStateFilter === userState
          ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50/30'
          : 'border-slate-200 hover:border-slate-300'
      }`}
      style={{
        borderLeft: `4px solid ${
          member.party === 'D' ? '#2563EB' :
          member.party === 'R' ? '#B91C1C' :
          '#7C3AED'
        }`,
      }}
    >
      {/* User Rep Badge */}
      {isUserRep && currentStateFilter === userState && (
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Your Representative
        </div>
      )}
      
      {/* Header: Photo + Name + Party + Grade */}
      <div className="flex items-start gap-4 mb-6">
        {/* Photo */}
        <RepresentativeImage
          bioguideId={member.bioguide_id}
          fullName={member.full_name}
          party={member.party}
          photoUrl={member.photo_url}
          size="md"
          className="flex-shrink-0"
        />
        
        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold leading-tight text-slate-900 mb-1 group-hover:text-blue-600 transition truncate">
            {member.full_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              member.party === "D" 
                ? "bg-blue-100 text-blue-700" 
                : member.party === "R" 
                ? "bg-red-100 text-red-700" 
                : "bg-purple-100 text-purple-700"
            }`}>
              {member.party === "D" ? "D" : member.party === "R" ? "R" : "I"}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              member.chamber === "house" 
                ? "bg-slate-100 text-slate-700" 
                : "bg-indigo-100 text-indigo-700"
            }`}>
              {member.chamber === "house" ? "H" : "S"}
            </span>
            <span>
              {member.state}{member.district ? `-${member.district}` : ""}
            </span>
          </div>
        </div>
        
        {/* Grade Badge */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 flex items-center justify-center ${gradeColors[grade.letter]}`}>
          <span className="text-2xl font-black">{grade.letter}</span>
        </div>
      </div>
      
      {/* Grade Breakdown Bars */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-slate-500 font-medium">Donors</span>
          <div className="flex-1 bg-slate-100 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all" 
              style={{ width: `${grade.breakdown.donorScore}%` }}
            />
          </div>
          <span className="w-8 text-right text-slate-600 font-mono">{Math.round(grade.breakdown.donorScore)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-slate-500 font-medium">Voting</span>
          <div className="flex-1 bg-slate-100 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all" 
              style={{ width: `${grade.breakdown.votingScore}%` }}
            />
          </div>
          <span className="w-8 text-right text-slate-600 font-mono">{Math.round(grade.breakdown.votingScore)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-slate-500 font-medium">Trading</span>
          <div className="flex-1 bg-slate-100 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all" 
              style={{ width: `${grade.breakdown.tradingScore}%` }}
            />
          </div>
          <span className="w-8 text-right text-slate-600 font-mono">{Math.round(grade.breakdown.tradingScore)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-slate-500 font-medium">Disclosure</span>
          <div className="flex-1 bg-slate-100 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all" 
              style={{ width: `${grade.breakdown.disclosureScore}%` }}
            />
          </div>
          <span className="w-8 text-right text-slate-600 font-mono">{Math.round(grade.breakdown.disclosureScore)}</span>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-lg py-2 px-2 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Bills</div>
          <div className="font-mono text-lg font-bold text-slate-900">{member.bills_sponsored}</div>
        </div>
        
        <div className="bg-slate-50 rounded-lg py-2 px-2 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Votes</div>
          <div className="font-mono text-lg font-bold text-slate-900">{member.votes_cast}</div>
        </div>
        
        <div className="bg-slate-50 rounded-lg py-2 px-2 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Cosponsor</div>
          <div className="font-mono text-lg font-bold text-slate-900">{member.bills_cosponsored}</div>
        </div>
      </div>
      
      {/* View Details CTA */}
      <div className="mt-4 pt-4 border-t border-slate-100 text-center">
        <span className="text-sm text-blue-600 font-semibold group-hover:text-blue-700">
          View Details →
        </span>
      </div>
    </Link>
  );
}
