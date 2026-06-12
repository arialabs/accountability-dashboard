import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { generateGovernmentOrgSchema, generateBreadcrumbSchema, structuredDataScript } from "@/lib/schema";
import cabinetData from "@/data/cabinet.json";
import { dogeData } from "@/data/doge";
import { calculateConflictScore, getConflictSeverityLabel } from "@/lib/executive-data";

/** Pre-compute conflict score labels keyed by member id */
const cabinetConflictMap: Record<string, { label: string; score: number }> = Object.fromEntries(
  (cabinetData.members as Array<{ id: string; conflicts_of_interest?: Array<{ severity: string }> }>).map((m) => {
    const score = calculateConflictScore(
      (m.conflicts_of_interest ?? []) as Array<{ severity: "low" | "medium" | "high" | "critical" }>
    );
    return [m.id, { label: getConflictSeverityLabel(score), score }];
  })
);

function conflictBadgeStyle(label: string): { bg: string; text: string; border: string; icon: string } {
  switch (label) {
    case "Critical": return { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5", icon: "🚨" };
    case "High":     return { bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74", icon: "⚠️" };
    case "Medium":   return { bg: "#FFFBEB", text: "#92400E", border: "#FCD34D", icon: "🔶" };
    case "Low":      return { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC", icon: "✅" };
    default:         return { bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0", icon: "—" };
  }
}

export default function ExecutiveBranch() {
  // Schema.org structured data
  const executiveSchema = generateGovernmentOrgSchema({
    name: "Executive Branch of the United States",
    description: "The executive branch carries out and enforces laws. It includes the President, Vice President, the Cabinet, executive departments, and independent agencies.",
    url: "/executive",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Executive Branch", url: "/executive" },
  ]);
  
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={structuredDataScript(executiveSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={structuredDataScript(breadcrumbSchema)}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-16 md:py-24">
        <Container className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-4xl mb-6 shadow-xl mx-auto">
            🏛️
          </div>
          <h1 className="text-3xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
            Executive Branch
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Track presidential accountability: policy impact, executive orders, 
            appointments, and financial transparency.
          </p>
        </Container>
      </section>

      {/* Administration Accountability Scorecard */}
      {(() => {
        type CabinetMember = {
          id: string;
          name: string;
          role: string;
          conflicts_of_interest?: Array<{ severity: string }>;
        };
        const members = cabinetData.members as CabinetMember[];
        const scored = members.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          score: calculateConflictScore((m.conflicts_of_interest ?? []) as Array<{ severity: "low"|"medium"|"high"|"critical" }>),
          label: getConflictSeverityLabel(calculateConflictScore((m.conflicts_of_interest ?? []) as Array<{ severity: "low"|"medium"|"high"|"critical" }>)),
        })).sort((a, b) => b.score - a.score);

        const counts = { Critical: 0, High: 0, Medium: 0, Low: 0, None: 0 };
        scored.forEach(m => { counts[m.label as keyof typeof counts] = (counts[m.label as keyof typeof counts] ?? 0) + 1; });
        const conflicted = scored.filter(m => m.label !== "None").length;
        const top3 = scored.slice(0, 3);

        return (
          <section className="py-10 bg-white border-b-2 border-red-100">
            <Container>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Administration Scorecard</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {conflicted} of {members.length} cabinet members have documented conflicts of interest
                  </p>
                </div>
                <Link href="/executive/conflicts" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Full Leaderboard →
                </Link>
              </div>

              {/* Conflict breakdown bar */}
              <div className="mb-6">
                <div className="flex rounded-full overflow-hidden h-3 mb-3">
                  {counts.Critical > 0 && <div style={{ width: `${(counts.Critical / members.length) * 100}%`, background: "#EF4444" }} title={`${counts.Critical} Critical`} />}
                  {counts.High > 0 && <div style={{ width: `${(counts.High / members.length) * 100}%`, background: "#F97316" }} title={`${counts.High} High`} />}
                  {counts.Medium > 0 && <div style={{ width: `${(counts.Medium / members.length) * 100}%`, background: "#EAB308" }} title={`${counts.Medium} Medium`} />}
                  {counts.Low > 0 && <div style={{ width: `${(counts.Low / members.length) * 100}%`, background: "#22C55E" }} title={`${counts.Low} Low`} />}
                  {counts.None > 0 && <div style={{ width: `${(counts.None / members.length) * 100}%`, background: "#E2E8F0" }} title={`${counts.None} None`} />}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  {counts.Critical > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{counts.Critical} Critical</span>}
                  {counts.High > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />{counts.High} High</span>}
                  {counts.Medium > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />{counts.Medium} Medium</span>}
                  {counts.Low > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{counts.Low} Low</span>}
                  {counts.None > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />{counts.None} None documented</span>}
                </div>
              </div>

              {/* Top 3 most-conflicted */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {top3.map((m, i) => {
                  const bs = conflictBadgeStyle(m.label);
                  return (
                    <Link
                      key={m.id}
                      href={`/executive/cabinet/${m.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:shadow-md transition-all"
                      style={{ borderColor: bs.border, background: `${bs.bg}80` }}
                    >
                      <span className="text-lg font-black text-slate-400 w-5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 truncate">{m.name}</div>
                        <div className="text-xs text-slate-500 truncate">{m.role}</div>
                      </div>
                      <span
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border flex-shrink-0"
                        style={{ background: bs.bg, color: bs.text, borderColor: bs.border }}
                      >
                        {bs.icon} {m.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Container>
          </section>
        );
      })()}

      {/* Current President Card */}
      <section className="py-12 bg-slate-50">
        <Container>
          <h2 className="text-2xl font-black text-slate-900 mb-8">Current Administration</h2>
          
          <Link 
            href="/executive/president"
            className="block bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-red-300 transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Photo */}
              <Image 
                src="/images/officials/trump.jpg"
                alt="Donald Trump"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white flex-shrink-0"
              />
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    Republican
                  </span>
                  <span className="text-slate-500 text-sm">47th President</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                  Donald Trump
                </h3>
                <p className="text-slate-600 mt-1">Inaugurated January 20, 2025</p>
              </div>
              
              <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                View Details →
              </div>
            </div>
          </Link>
        </Container>
      </section>

      {/* Vice President */}
      <section className="py-12 bg-white">
        <Container>
          <h2 className="text-2xl font-black text-slate-900 mb-8">Vice President</h2>
          
          <Link 
            href="/executive/vp"
            className="block bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Photo */}
              <Image 
                src="/images/officials/vance.jpg"
                alt="J.D. Vance"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white flex-shrink-0"
              />
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    Republican
                  </span>
                  <span className="text-slate-500 text-sm">Vice President</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  J.D. Vance
                </h3>
                <p className="text-slate-600 mt-1">Inaugurated January 20, 2025 • Ohio</p>
              </div>
              
              <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                View Details →
              </div>
            </div>
          </Link>
        </Container>
      </section>

      {/* DOGE Section - Featured */}
      <section className="py-12 bg-amber-50 border-b-2 border-amber-200">
        <Container>
          <h2 className="text-2xl font-black text-slate-900 mb-4">Department of Government Efficiency</h2>

          <Link
            href="/executive/doge"
            className="block bg-white rounded-3xl border-2 border-amber-300 p-8 shadow-sm hover:shadow-xl hover:border-red-400 transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Image
                src="/images/officials/musk.jpg"
                alt="Elon Musk"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white flex-shrink-0"
              />

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    🐕 DOGE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    DISBANDED
                  </span>
                  <span className="text-slate-500 text-sm">Jan — Nov 2025</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  Elon Musk
                </h3>
                <p className="text-slate-600 mt-1">
                  {Math.round(dogeData.overview.totalWorkersAffected / 1000)}K workers affected
                  {" · "}{dogeData.overview.lawsuitsFiled}+ lawsuits
                  {" · "}{dogeData.keyStats.find((s) => s.label === "Claimed Savings")?.value ?? "—"} claimed savings
                </p>
              </div>

              <div className="text-amber-600 font-semibold group-hover:translate-x-1 transition-transform">
                View Full Report →
              </div>
            </div>
          </Link>
        </Container>
      </section>

      {/* Cabinet */}
      <section className="py-12 bg-slate-50">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">Cabinet</h2>
            <Link 
              href="/executive/cabinet"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { role: "Secretary of State", name: "Marco Rubio", id: "secretary-of-state", photo: "/images/officials/rubio.jpg" },
              { role: "Secretary of Defense", name: "Pete Hegseth", id: "secretary-of-defense", photo: "/images/officials/hegseth.jpg" },
              { role: "Attorney General", name: "Pam Bondi", id: "attorney-general", photo: "/images/officials/bondi.jpg" },
              { role: "Secretary of Treasury", name: "Scott Bessent", id: "secretary-of-treasury", photo: "/images/officials/bessent.jpg" },
              { role: "Secretary of HHS", name: "RFK Jr.", id: "secretary-of-hhs", photo: "/images/officials/kennedy.jpg" },
              { role: "Secretary of Homeland Security", name: "Kristi Noem", id: "secretary-of-homeland-security", photo: "/images/officials/noem.jpg" },
              { role: "EPA Administrator", name: "Lee Zeldin", id: "epa-administrator", photo: "/images/officials/zeldin.jpg" },
              { role: "Secretary of Interior", name: "Doug Burgum", id: "secretary-of-interior", photo: "/images/officials/burgum.jpg" },
            ].map((cabinet) => {
              const conflict = cabinetConflictMap[cabinet.id];
              const bs = conflict ? conflictBadgeStyle(conflict.label) : null;
              return (
                <Link
                  key={cabinet.id}
                  href={`/executive/cabinet/${cabinet.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:shadow-lg hover:border-blue-300 transition-all group flex flex-col items-center"
                >
                  {cabinet.photo ? (
                    <Image
                      src={cabinet.photo}
                      alt={cabinet.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-slate-100 group-hover:border-blue-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 mx-auto mb-2 group-hover:bg-blue-50">
                      {cabinet.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mb-1">{cabinet.role}</div>
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors mb-2">{cabinet.name}</div>
                  {bs && conflict && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border"
                      style={{ background: bs.bg, color: bs.text, borderColor: bs.border }}
                      title={`Conflict of interest severity: ${conflict.label} (score: ${conflict.score}) — See /methodology for details`}
                    >
                      <span aria-hidden="true">{bs.icon}</span>
                      {conflict.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          
          <div className="text-center">
            <Link 
              href="/executive/cabinet"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 min-h-[44px] rounded-xl transition-colors"
            >
              View Full Cabinet
            </Link>
          </div>
        </Container>
      </section>

      {/* What We Track */}
      <section className="py-12 bg-white">
        <Container>
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">What We Track</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/executive/timeline" className="flex gap-4 p-4 rounded-xl bg-blue-50 border border-blue-200 hover:shadow-lg transition-shadow group">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-bold text-blue-900 group-hover:text-blue-700">Policy Impact →</h3>
                <p className="text-sm text-blue-700">Measuring real-world outcomes of executive actions</p>
              </div>
            </Link>

            <Link href="/executive/cabinet" className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:shadow-lg transition-shadow group">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-slate-700">Cabinet Appointments →</h3>
                <p className="text-sm text-slate-600">Track all cabinet members and their departments</p>
              </div>
            </Link>

            <Link href="/executive/timeline" className="flex gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 hover:shadow-lg transition-shadow group">
              <div className="text-2xl">📜</div>
              <div>
                <h3 className="font-bold text-amber-900 group-hover:text-amber-700">Executive Actions →</h3>
                <p className="text-sm text-amber-700">View orders, budget decisions, and policy changes</p>
              </div>
            </Link>

            <Link href="/executive/conflicts" className="flex gap-4 p-4 rounded-xl bg-red-50 border border-red-200 hover:shadow-lg transition-shadow group">
              <div className="text-2xl">💼</div>
              <div>
                <h3 className="font-bold text-red-900 group-hover:text-red-700">Transparency & Ethics →</h3>
                <p className="text-sm text-red-700">Financial disclosures and conflict of interest monitoring</p>
              </div>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
