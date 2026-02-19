import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import vpData from "@/data/vp.json";
import { generatePersonSchema, generateBreadcrumbSchema, structuredDataScript } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Vice President of the United States",
  description: "Track the Vice President's role, Senate record, and policy positions. View voting history and accountability metrics.",
};

export default function VicePresidentPage() {
  const { vice_president, senate_record } = vpData;
  
  // Schema.org structured data
  const personSchema = generatePersonSchema({
    name: vice_president.name,
    jobTitle: "Vice President of the United States",
    description: "Track the Vice President's role, Senate record, and policy positions.",
    url: "/executive/vp",
    party: "R",
    state: "OH",
    affiliation: {
      name: "Executive Branch of the United States",
      url: "/executive",
    },
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Executive Branch", url: "/executive" },
    { name: "Vice President", url: "/executive/vp" },
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
      <section className="bg-gradient-to-b from-blue-50 to-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Photo */}
            <Image 
              src={vice_president.photo_url}
              alt={vice_president.name}
              width={160}
              height={160}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-xl border-4 border-white"
            />
            
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                  Republican
                </span>
                <span className="text-slate-500 text-sm">Vice President</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-2">
                {vice_president.name}
              </h1>
              <p className="text-lg text-slate-600">
                Inaugurated January 20, 2025 • Ohio
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Background Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
            Background
          </h2>
          
          <p className="text-lg text-slate-700 mb-6 leading-relaxed">
            {vice_president.background.summary}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {vice_president.background.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <span className="text-blue-600 text-xl flex-shrink-0">✓</span>
                <span className="text-slate-700">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Senate Record */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
            Senate Record (2023-2025)
          </h2>
          
          <p className="text-lg text-slate-700 mb-6 leading-relaxed">
            {senate_record.summary}
          </p>

          {/* Voting Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <div className="text-2xl md:text-3xl font-black text-slate-900">
                {senate_record.voting_stats.votes_cast}
              </div>
              <div className="text-sm text-slate-600">Votes Cast</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <div className="text-2xl md:text-3xl font-black text-red-600">
                {senate_record.voting_stats.party_alignment}%
              </div>
              <div className="text-sm text-slate-600">Party Alignment</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <div className="text-2xl md:text-3xl font-black text-slate-900">
                {senate_record.voting_stats.missed_votes_pct}%
              </div>
              <div className="text-sm text-slate-600">Missed Votes</div>
            </div>
          </div>

          {/* Committees */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Committee Assignments</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {senate_record.committees.map((committee, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200">
                  <span className="text-sm text-slate-700">{committee}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Votes */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
            Key Votes
          </h2>
          
          <div className="space-y-4">
            {senate_record.key_votes.map((vote, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm ${
                    vote.vote === "Yea" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {vote.vote === "Yea" ? "✓ Yea" : "✗ Nay"}
                  </div>
                  
                  <div className="flex-1">
                    <a 
                      href={vote.congress_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {vote.bill}
                    </a>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                      <span>{vote.date}</span>
                      <span className="text-slate-400">•</span>
                      <span>{vote.result}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="mt-6 text-sm text-slate-500 text-center">
            Click on any bill to view full details on Congress.gov
          </p>
        </div>
      </section>

      {/* Sponsored Legislation */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
            Sponsored Legislation
          </h2>
          
          <div className="space-y-4">
            {senate_record.sponsored_legislation.map((bill, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <a 
                      href={bill.congress_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {bill.bill}
                    </a>
                    <p className="text-slate-700 mt-2">{bill.summary}</p>
                  </div>
                  <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    {bill.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <Link 
            href="/executive"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Executive Branch
          </Link>
        </div>
      </section>
    </div>
  );
}
