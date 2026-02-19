import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { generateGovernmentOrgSchema, generateBreadcrumbSchema, structuredDataScript } from "@/lib/schema";

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
                  352K workers affected · 65+ lawsuits · $206B claimed savings
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
            ].map((cabinet) => (
              <Link
                key={cabinet.id}
                href={`/executive/cabinet/${cabinet.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:shadow-lg hover:border-blue-300 transition-all group"
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
                <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{cabinet.name}</div>
              </Link>
            ))}
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
            <Link href="/executive/timeline" className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-200 hover:shadow-lg transition-shadow group">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-bold text-green-900 group-hover:text-green-700">Policy Impact →</h3>
                <p className="text-sm text-green-700">Measuring real-world outcomes of executive actions</p>
              </div>
            </Link>
            
            <Link href="/executive/cabinet" className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-200 hover:shadow-lg transition-shadow group">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="font-bold text-green-900 group-hover:text-green-700">Cabinet Appointments →</h3>
                <p className="text-sm text-green-700">Track all cabinet members and their departments</p>
              </div>
            </Link>
            
            <Link href="/executive/timeline" className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-200 hover:shadow-lg transition-shadow group">
              <div className="text-2xl">📜</div>
              <div>
                <h3 className="font-bold text-green-900 group-hover:text-green-700">Executive Actions →</h3>
                <p className="text-sm text-green-700">View orders, budget decisions, and policy changes</p>
              </div>
            </Link>
            
            <Link href="/executive/conflicts" className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-200 hover:shadow-lg transition-shadow group">
              <div className="text-2xl">💼</div>
              <div>
                <h3 className="font-bold text-green-900 group-hover:text-green-700">Transparency & Ethics →</h3>
                <p className="text-sm text-green-700">Financial disclosures and conflict of interest monitoring</p>
              </div>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
