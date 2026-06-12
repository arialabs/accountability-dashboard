"use client";

import { useState, useMemo } from "react";
import DataProvenance from "@/components/DataProvenance";
import KeyVotes from "@/components/KeyVotes";
import keyVotesData from "@/data/key-votes.json";
import Link from "next/link";

export default function VotesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const votes = keyVotesData as Array<{
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
  }>;

  // Filter votes by selected category
  const filteredVotes = useMemo(() => {
    if (selectedCategory === "All") return votes;
    return votes.filter(v => v.category === selectedCategory);
  }, [votes, selectedCategory]);

  // Stats
  const houseVotes = votes.filter(v => v.chamber === "House");
  const senateVotes = votes.filter(v => v.chamber === "Senate");
  const passed = votes.filter(v => v.result === "Passed");
  const failed = votes.filter(v => v.result === "Failed");

  // Category breakdown
  const byCategory = votes.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white border-b border-slate-200 py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-4"
          >
            ← Back to Dashboard
          </Link>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3 sm:mb-4">
            Key Congressional Votes
          </h1>
          <DataProvenance dataset="key-votes.json" className="mb-3" />
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl">
            Track how your representatives vote on the issues that matter most. 
            Data sourced from VoteView (UCLA/Berkeley) and updated regularly.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-black text-slate-900">{votes.length}</div>
              <div className="text-sm text-slate-500">Key Votes Tracked</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-black text-blue-600">{houseVotes.length}</div>
              <div className="text-sm text-slate-500">House Votes</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-black text-purple-600">{senateVotes.length}</div>
              <div className="text-sm text-slate-500">Senate Votes</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-black text-emerald-600">{passed.length}</div>
              <div className="text-sm text-slate-500">Passed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="py-8 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">By Category</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "All"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All <span className={selectedCategory === "All" ? "text-blue-200" : "text-slate-400"}>({votes.length})</span>
            </button>
            {sortedCategories.map(([category, count]) => (
              <button 
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category} <span className={`ml-1 ${selectedCategory === category ? "text-blue-200" : "text-slate-400"}`}>({count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Vote list */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedCategory === "All" ? "All Key Votes" : `${selectedCategory} Votes`}
            </h2>
            <span className="text-sm text-slate-500">
              {filteredVotes.length} vote{filteredVotes.length !== 1 ? "s" : ""}
            </span>
          </div>
          <KeyVotes votes={filteredVotes} limit={20} showFilters={false} />
        </div>
      </section>

      {/* Data source */}
      <section className="py-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500">
            Vote data from{" "}
            <a 
              href="https://voteview.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              VoteView
            </a>
            {" "}(UCLA/Berkeley). 119th Congress. Updated regularly.
          </p>
        </div>
      </section>
    </div>
  );
}
