"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getAllBills, getBillCategoryBreakdown, getBillStatusBreakdown } from "@/lib/bills";
import { getMember } from "@/lib/data";
import type { Bill, BillStatus } from "@/lib/types";

// Status labels and colors
const STATUS_CONFIG: Record<BillStatus, { label: string; color: string; icon: string }> = {
  introduced: { label: "Introduced", color: "bg-slate-200 text-slate-700", icon: "📝" },
  committee: { label: "In Committee", color: "bg-blue-100 text-blue-700", icon: "🔍" },
  floor_vote: { label: "Floor Vote", color: "bg-purple-100 text-purple-700", icon: "🗳️" },
  passed_chamber: { label: "Passed One Chamber", color: "bg-yellow-100 text-yellow-700", icon: "✓" },
  passed_both: { label: "Passed Both Chambers", color: "bg-emerald-100 text-emerald-700", icon: "✓✓" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700", icon: "✗" },
};

function BillCard({ bill }: { bill: Bill }) {
  const statusConfig = STATUS_CONFIG[bill.status];
  
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-lg mb-1 break-words">
            {bill.bill_id}
          </h3>
          <p className="text-sm text-slate-600 mb-2">{bill.title}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start ${statusConfig.color}`}>
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-sm text-slate-600 mb-4">{bill.description}</p>
      
      {/* Progress Pipeline */}
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          {['introduced', 'committee', 'floor_vote', 'passed_chamber', 'passed_both'].map((s, i) => {
            const status = s as BillStatus;
            const isActive = 
              (status === 'introduced') ||
              (status === 'committee' && ['committee', 'floor_vote', 'passed_chamber', 'passed_both'].includes(bill.status)) ||
              (status === 'floor_vote' && ['floor_vote', 'passed_chamber', 'passed_both'].includes(bill.status)) ||
              (status === 'passed_chamber' && ['passed_chamber', 'passed_both'].includes(bill.status)) ||
              (status === 'passed_both' && bill.status === 'passed_both');
            
            const isFailed = bill.status === 'failed';
            
            return (
              <div key={status} className="flex items-center flex-1">
                <div 
                  className={`h-2 rounded-full flex-1 ${
                    isFailed ? 'bg-red-200' :
                    isActive ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  title={STATUS_CONFIG[status].label}
                />
                {i < 4 && <div className="w-1" />}
              </div>
            );
          })}
        </div>
        <div className="text-xs text-slate-500">
          Progress: {bill.status === 'failed' ? 'Failed' : STATUS_CONFIG[bill.status].label}
        </div>
      </div>
      
      {/* Vote summary */}
      <div className="flex flex-wrap gap-3 text-sm mb-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Category:</span>
          <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium">
            {bill.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Votes:</span>
          <span className="font-medium text-slate-900">{bill.votes.length}</span>
        </div>
      </div>
      
      {/* Chamber status */}
      <div className="flex gap-3 text-sm mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded ${
            bill.passed_house ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            House: {bill.passed_house ? '✓ Passed' : `${bill.house_votes.length} vote(s)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded ${
            bill.passed_senate ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            Senate: {bill.passed_senate ? '✓ Passed' : `${bill.senate_votes.length} vote(s)`}
          </span>
        </div>
      </div>
      
      {/* Key supporters/opponents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-slate-500 font-medium mb-1">Top Supporters:</div>
          <div className="space-y-1">
            {bill.top_supporters.slice(0, 3).map(s => {
              const member = getMember(s.bioguide_id);
              return member ? (
                <Link 
                  key={s.bioguide_id} 
                  href={`/rep/${s.bioguide_id}`}
                  className="block text-blue-600 hover:underline break-words"
                >
                  {member.last_name} ({member.party}-{member.state})
                </Link>
              ) : null;
            })}
          </div>
        </div>
        <div>
          <div className="text-slate-500 font-medium mb-1">Top Opponents:</div>
          <div className="space-y-1">
            {bill.top_opponents.slice(0, 3).map(o => {
              const member = getMember(o.bioguide_id);
              return member ? (
                <Link 
                  key={o.bioguide_id} 
                  href={`/rep/${o.bioguide_id}`}
                  className="block text-blue-600 hover:underline break-words"
                >
                  {member.last_name} ({member.party}-{member.state})
                </Link>
              ) : null;
            })}
          </div>
        </div>
      </div>
      
      {/* Latest action */}
      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
        Latest action: {new Date(bill.latest_action_date).toLocaleDateString()}
      </div>
    </div>
  );
}

export default function BillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  
  const bills = getAllBills();
  const statusBreakdown = getBillStatusBreakdown();
  const categoryBreakdown = getBillCategoryBreakdown();
  
  // Filter bills
  const filteredBills = useMemo(() => {
    let filtered = bills;
    
    if (selectedCategory !== "All") {
      filtered = filtered.filter(b => b.category === selectedCategory);
    }
    
    if (selectedStatus !== "All") {
      filtered = filtered.filter(b => b.status === selectedStatus);
    }
    
    return filtered;
  }, [bills, selectedCategory, selectedStatus]);
  
  // Stats
  const passedCount = bills.filter(b => b.final_result === "Passed").length;
  const failedCount = bills.filter(b => b.final_result === "Failed").length;
  const pendingCount = bills.filter(b => b.final_result === "Pending").length;
  
  // Top categories
  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-white border-b border-slate-200 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600 mb-4"
          >
            ← Back to Dashboard
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Bill Tracker
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Follow legislation through Congress. See which bills are progressing, who supports them, 
            and track their journey from introduction to law.
          </p>
        </div>
      </section>
      
      {/* Stats */}
      <section className="py-8 border-b border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-black text-slate-900">{bills.length}</div>
              <div className="text-sm text-slate-500">Bills Tracked</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-black text-emerald-600">{passedCount}</div>
              <div className="text-sm text-slate-500">Passed</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-black text-yellow-600">{pendingCount}</div>
              <div className="text-sm text-slate-500">Pending</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-3xl font-black text-red-600">{failedCount}</div>
              <div className="text-sm text-slate-500">Failed</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Filters */}
      <section className="py-8 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Status filter */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Filter by Status</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus("All")}
                className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition ${
                  selectedStatus === "All"
                    ? "bg-purple-600 text-white"
                    : "bg-white border border-slate-300 text-slate-700 hover:border-purple-600"
                }`}
              >
                All ({bills.length})
              </button>
              {Object.entries(statusBreakdown).map(([status, count]) => {
                if (status === 'total') return null;
                const config = STATUS_CONFIG[status as BillStatus];
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition ${
                      selectedStatus === status
                        ? "bg-purple-600 text-white"
                        : "bg-white border border-slate-300 text-slate-700 hover:border-purple-600"
                    }`}
                  >
                    {config.icon} {config.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Category filter */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Filter by Category</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition ${
                  selectedCategory === "All"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-300 text-slate-700 hover:border-blue-600"
                }`}
              >
                All Categories
              </button>
              {topCategories.map(([category, count]) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-slate-300 text-slate-700 hover:border-blue-600"
                  }`}
                >
                  {category} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Bills grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {filteredBills.length} {filteredBills.length === 1 ? 'Bill' : 'Bills'}
            </h2>
          </div>
          
          {filteredBills.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No bills match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBills.map(bill => (
                <BillCard key={bill.bill_id} bill={bill} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
