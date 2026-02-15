// @ts-nocheck
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import cabinetData from "@/data/cabinet.json";
import AlignmentSection from "./alignment-section";
import ConflictBadge from "@/components/ConflictBadge";
import { 
  getOfficialById,
  calculateConflictScore,
  formatTenure,
  getDepartmentDescription,
  groupConflictsByCategory,
  getConflictCategoryLabel,
  getConflictSeverityLabel,
} from "@/lib/executive-data";
import type { ConflictSeverity } from "@/types/executive";

interface CabinetMemberPageProps {
  params: Promise<{ role: string }>;
}

export function generateStaticParams() {
  return cabinetData.members.map((member) => ({
    role: member.id,
  }));
}

export default async function CabinetMemberPage({ params }: CabinetMemberPageProps) {
  const { role } = await params;
  const member = cabinetData.members.find((m) => m.id === role);
  const official = getOfficialById(role);

  if (!member || !official) {
    notFound();
  }

  const formatDate = (dateStr: string) => {
    // Parse as local date to avoid timezone issues
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const conflictScore = calculateConflictScore(official.conflicts_of_interest as any);
  const conflictLabel = getConflictSeverityLabel(conflictScore);
  const tenure = formatTenure(official.appointed_date);
  const groupedConflicts = groupConflictsByCategory(official.conflicts_of_interest as any);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Photo */}
            <Image 
              src={member.photo_url}
              alt={member.name}
              width={192}
              height={192}
              className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-xl border-4 border-white"
            />
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-2">
                {member.name}
              </h1>
              <p className="text-xl md:text-2xl text-slate-700 font-semibold mb-2">
                {member.role}
              </p>
              <p className="text-lg text-slate-600">
                {member.department}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Appointment Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Appointed
              </h2>
              <p className="text-2xl font-bold text-slate-900">
                {formatDate(member.appointed_date)}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {tenure} in office
              </p>
            </div>

            {/* Confirmation Vote */}
            {member.confirmation_vote && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Confirmation Vote
                </h2>
                <p className="text-2xl font-bold text-slate-900">
                  {member.confirmation_vote}
                </p>
              </div>
            )}
            
            {/* Conflict Score */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Conflict Risk
              </h2>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-900">
                  {conflictLabel}
                </p>
                {conflictScore > 0 && (
                  <span className="text-sm text-slate-500">
                    ({conflictScore} pts)
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1">
                {official.conflicts_of_interest.length} conflict{official.conflicts_of_interest.length !== 1 ? 's' : ''} identified
              </p>
            </div>
          </div>
          
          {/* Net Worth */}
          {official.net_worth && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-12">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Estimated Net Worth
              </h2>
              <p className="text-2xl font-bold text-slate-900">
                {official.net_worth}
              </p>
            </div>
          )}

          {/* Conflicts of Interest */}
          {official.conflicts_of_interest.length > 0 && (
            <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-8 mb-12">
              <h2 className="text-2xl font-black text-red-900 mb-6">
                ⚠️ Conflicts of Interest ({official.conflicts_of_interest.length})
              </h2>
              <div className="space-y-4">
                {Object.entries(groupedConflicts).map(([category, conflicts]: [string, any[]]) => (
                  <div key={category} className="bg-white rounded-xl border border-red-200 p-4">
                    <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      {getConflictCategoryLabel(category)}
                      <span className="text-sm font-normal text-red-600">
                        ({conflicts.length})
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {conflicts.map((conflict: any, idx: number) => (
                        <div key={idx} className="flex gap-3">
                          <ConflictBadge severity={conflict.severity as ConflictSeverity} />
                          <p className="text-slate-700 text-sm flex-1">
                            {conflict.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Prior Positions */}
          {official.prior_positions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-12">
              <h2 className="text-2xl font-black text-slate-900 mb-6">
                Prior Experience
              </h2>
              <div className="space-y-4">
                {official.prior_positions.map((position, idx) => (
                  <div key={idx} className="border-l-4 border-blue-200 pl-4 py-2">
                    <h3 className="font-bold text-slate-900">{position.title}</h3>
                    <p className="text-slate-700">{position.organization}</p>
                    <p className="text-sm text-slate-500">{position.years}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Policy Positions */}
          {official.policy_positions.length > 0 && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-12">
              <h2 className="text-2xl font-black text-slate-900 mb-6">
                Policy Positions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {official.policy_positions.map((position, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4">
                    <h3 className="font-bold text-slate-900 mb-1">{position.topic}</h3>
                    <p className="text-sm text-slate-700">{position.stance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Department Info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              About {member.department}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {getDepartmentDescription(member.department)}
            </p>
          </div>

          {/* Policy Alignment Section */}
          <AlignmentSection memberId={member.id} />
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <Link 
            href="/executive/cabinet"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Cabinet
          </Link>
        </div>
      </section>
    </div>
  );
}
