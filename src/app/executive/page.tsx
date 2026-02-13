import Link from "next/link";

export default function ExecutiveBranch() {
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-4xl mb-6 shadow-xl mx-auto">
            🏛️
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
            Executive Branch
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Track presidential accountability: policy impact, executive orders, 
            appointments, and financial transparency.
          </p>
        </div>
      </section>

      {/* Current President Card */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Current Administration</h2>
          
          <Link 
            href="/executive/president"
            className="block bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-red-300 transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Photo */}
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Donald_Trump_official_portrait_%282024%29.jpg/440px-Donald_Trump_official_portrait_%282024%29.jpg"
                alt="Donald Trump"
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
        </div>
      </section>

      {/* Vice President */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Vice President</h2>
          
          <Link 
            href="/executive/vp"
            className="block bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Photo */}
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/4/49/Senator-Elect_James_David_Vance_official_portrait%2C_117th_Congress_%28cropped%29.jpg"
                alt="J.D. Vance"
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
        </div>
      </section>

      {/* DOGE Section - Featured */}
      <section className="py-12 bg-amber-50 border-b-2 border-amber-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Department of Government Efficiency</h2>

          <Link
            href="/executive/doge"
            className="block bg-white rounded-3xl border-2 border-amber-300 p-8 shadow-sm hover:shadow-xl hover:border-red-400 transition-all duration-300 group"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg"
                alt="Elon Musk"
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
                  352K workers affected · $206B claimed savings · 65+ lawsuits · Spending still rose $248B
                </p>
              </div>

              <div className="text-amber-600 font-semibold group-hover:translate-x-1 transition-transform">
                View Full Report →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Cabinet */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
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
              { role: "Secretary of State", name: "Marco Rubio", id: "secretary-of-state" },
              { role: "Secretary of Defense", name: "Pete Hegseth", id: "secretary-of-defense" },
              { role: "Attorney General", name: "Pam Bondi", id: "attorney-general" },
              { role: "Secretary of Treasury", name: "Scott Bessent", id: "secretary-of-treasury" },
              { role: "Secretary of HHS", name: "RFK Jr.", id: "secretary-of-hhs" },
              { role: "Secretary of Homeland Security", name: "Kristi Noem", id: "secretary-of-homeland-security" },
              { role: "EPA Administrator", name: "Lee Zeldin", id: "epa-administrator" },
              { role: "Secretary of Interior", name: "Doug Burgum", id: "secretary-of-interior" },
            ].map((cabinet) => (
              <Link
                key={cabinet.id}
                href={`/executive/cabinet/${cabinet.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 text-center hover:shadow-lg hover:border-blue-300 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl mx-auto mb-2 group-hover:bg-blue-50">
                  👤
                </div>
                <div className="text-xs text-slate-500 mb-1">{cabinet.role}</div>
                <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{cabinet.name}</div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              href="/executive/cabinet"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              View Full Cabinet
            </Link>
          </div>
        </div>
      </section>

      {/* What We Track */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">What We Track</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="font-bold text-green-900">Policy Impact</h3>
                <p className="text-sm text-green-700">Measuring real-world outcomes of executive actions</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="font-bold text-green-900">Cabinet Appointments</h3>
                <p className="text-sm text-green-700">Track all cabinet members and their departments</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="text-2xl">📜</div>
              <div>
                <h3 className="font-bold text-green-900">Executive Actions</h3>
                <p className="text-sm text-green-700">View presidential orders, proclamations, and memoranda</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="text-2xl">💼</div>
              <div>
                <h3 className="font-bold text-green-900">Transparency & Ethics</h3>
                <p className="text-sm text-green-700">Financial disclosures and conflict of interest monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
