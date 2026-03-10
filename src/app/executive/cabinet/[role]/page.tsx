import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
import { getOfficialAgencySpending } from "@/lib/data";
import { formatCurrencyShort } from "@/lib/formatting";
import type { ConflictSeverity } from "@/types/executive";
import {
  getRevolvingDoorEntry,
  getRevolvingDoorLabel,
  getRevolvingDoorColor,
  getRevolvingDoorIcon,
} from "@/lib/revolving-door";
import { generatePersonSchema, generateBreadcrumbSchema, structuredDataScript } from "@/lib/schema";
import { Container } from "@/components/ui";
import { VerdictBanner } from "@/components/VerdictBanner";
import { CareerTimeline } from "@/components/CareerTimeline";
import { AgencyBudget } from "@/components/AgencyBudget";

export async function generateMetadata({ params }: CabinetMemberPageProps): Promise<Metadata> {
  const { role } = await params;
  const member = cabinetData.members.find((m) => m.id === role);

  if (!member) {
    return {
      title: "Cabinet Member Not Found",
    };
  }

  const ogTitle = `${member.name} - ${member.role}`;
  const ogDescription = `${member.role} ${member.name}. Track policy positions, conflicts of interest, and accountability metrics for ${member.department}.`;

  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: `/api/og/cabinet?id=${role}`,
          width: 1200,
          height: 630,
          alt: `${member.name} accountability profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [`/api/og/cabinet?id=${role}`],
    },
  };
}

interface ConflictOfInterest {
  description: string;
  severity: string;
  category: string;
}

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
  
  const conflictScore = calculateConflictScore(official.conflicts_of_interest as Array<{ severity: ConflictSeverity }>);
  const conflictLabel = getConflictSeverityLabel(conflictScore);
  const tenure = formatTenure(official.appointed_date);
  const rdEntry = getRevolvingDoorEntry(role);
  const groupedConflicts = groupConflictsByCategory(official.conflicts_of_interest as Array<{ severity: ConflictSeverity; category: string }>);
  const agencySpending = getOfficialAgencySpending(role);
  const latestBudgetYear = agencySpending?.budget_totals_by_fiscal_year.at(-1);

  // Schema.org structured data
  const personSchema = generatePersonSchema({
    name: member.name,
    jobTitle: member.role,
    description: `${member.role} of the ${member.department}. Track policy positions and accountability metrics.`,
    url: `/executive/cabinet/${role}`,
    affiliation: {
      name: member.department,
      url: "/executive/cabinet",
    },
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Executive Branch", url: "/executive" },
    { name: "Cabinet", url: "/executive/cabinet" },
    { name: member.name, url: `/executive/cabinet/${role}` },
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={structuredDataScript(personSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={structuredDataScript(breadcrumbSchema)}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white border-b border-slate-200 py-16 md:py-20">
        <Container>
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
        </Container>
      </section>

      {/* Verdict Banner */}
      {rdEntry && (
        <section className="pt-8 pb-0">
          <Container>
            <VerdictBanner entry={rdEntry} expandTargetId="revolving-door" />
          </Container>
        </section>
      )}

      {/* Details Section */}
      <section className="py-12">
        <Container>
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

          {/* Revolving Door Analysis */}
          {(() => {
            const rdEntry = getRevolvingDoorEntry(role);
            if (!rdEntry) return null;
            const rdLabel = getRevolvingDoorLabel(rdEntry.type);
            const rdColor = getRevolvingDoorColor(rdEntry.type);
            const rdIcon = getRevolvingDoorIcon(rdEntry.type);
            const isHighRisk = rdEntry.type === "industry_insider" || rdEntry.type === "ideological_conflict";
            return (
              <div id="revolving-door" className={`rounded-2xl border-2 p-8 mb-8 ${isHighRisk ? "bg-orange-50 border-orange-300" : "bg-slate-50 border-slate-200"}`}>
                <h2 className={`text-2xl font-black mb-3 flex items-center gap-2 ${isHighRisk ? "text-orange-900" : "text-slate-700"}`}>
                  <span>{rdIcon}</span>
                  Revolving Door Analysis
                </h2>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold mb-4 ${rdColor}`}>
                  {rdLabel}
                </div>
                <div className="mb-2">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Prior Industry: </span>
                  <span className="text-slate-800 font-semibold">{rdEntry.prior_industry}</span>
                </div>
                <p className={`text-base leading-relaxed ${isHighRisk ? "text-orange-800" : "text-slate-600"}`}>
                  {rdEntry.summary}
                </p>
              </div>
            );
          })()}

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
                      {conflicts.map((conflict, idx: number) => (
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
          
          {/* Career Timeline */}
          {official.prior_positions.length > 0 && (
            <CareerTimeline
              priorPositions={official.prior_positions}
              currentRole={member.role}
              currentDepartment={member.department}
              rdEntry={rdEntry}
            />
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
          
          {/* Agency Budget (USASpending.gov) */}
          <AgencyBudget cabinetId={role} />

          {/* Department Info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 mb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              About {member.department}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {getDepartmentDescription(member.department)}
            </p>
          </div>

          {/* Federal Budget + Awards (USASpending) */}
          {agencySpending && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Federal Budget & Awards</h2>
                  <p className="text-sm text-slate-600">
                    FY {agencySpending.fiscal_year_start}-{agencySpending.fiscal_year_end} • Source: USASpending.gov
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Last updated {new Date(agencySpending.last_updated).toLocaleDateString("en-US")}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Latest FY Obligations</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatCurrencyShort(latestBudgetYear?.total_obligations || 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contracts (Top Awards)</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatCurrencyShort(agencySpending.contracts_obligated)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Grants (Top Awards)</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatCurrencyShort(agencySpending.grants_obligated)}
                  </p>
                </div>
              </div>

              {agencySpending.program_funding_changes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Largest Program Funding Changes</h3>
                  <div className="space-y-2">
                    {agencySpending.program_funding_changes.slice(0, 5).map((program) => (
                      <div key={program.program_name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                        <p className="text-sm text-slate-800">{program.program_name}</p>
                        <p className={`text-sm font-semibold ${program.change_amount >= 0 ? "text-green-700" : "text-red-700"}`}>
                          {program.change_amount >= 0 ? "+" : ""}{formatCurrencyShort(program.change_amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agencySpending.awards.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Top Contract & Grant Awards</h3>
                  <div className="space-y-2">
                    {agencySpending.awards.slice(0, 6).map((award) => (
                      <div key={`${award.award_id}-${award.recipient_name}`} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">{award.recipient_name}</p>
                            <p className="text-xs text-slate-500">{award.award_type_label}{award.action_date ? ` • ${award.action_date}` : ""}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{formatCurrencyShort(award.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Policy Alignment Section */}
          <AlignmentSection memberId={member.id} />
        </Container>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <Container className="text-center">
          <Link 
            href="/executive/cabinet"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Cabinet
          </Link>
        </Container>
      </section>
    </div>
  );
}
