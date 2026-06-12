"use client";

import { useState, useMemo } from "react";
import DataProvenance from "@/components/DataProvenance";
import Link from "next/link";
import Image from "next/image";
import cabinetData from "@/data/cabinet.json";
import ConflictBadge from "@/components/ConflictBadge";
import { 
  calculateConflictScore, 
  getConflictSeverityLabel,
  formatTenure,
  sortByConflictScore,
  getAllOfficials,
} from "@/lib/executive-data";
import {
  getRevolvingDoorEntry,
  getRevolvingDoorLabel,
  getRevolvingDoorColor,
  getRevolvingDoorIcon,
  getRevolvingDoorShortDesc,
} from "@/lib/revolving-door";
import type { ConflictSeverity } from "@/types/executive";
import { BodyText, Caption } from "@/components/ui";

interface ConflictOfInterest {
  description: string;
  severity: ConflictSeverity;
  category: string;
}

interface CabinetMemberData {
  id: string;
  name: string;
  role: string;
  department: string;
  photo_url: string;
  appointed_date: string;
  confirmation_vote: string;
  bio: string;
  prior_positions: Array<{
    title: string;
    organization: string;
    years: string;
  }>;
  conflicts_of_interest: ConflictOfInterest[];
  policy_positions: Array<{
    topic: string;
    stance: string;
  }>;
}

// Calculate a basic alignment score based on conflicts
function calculateAlignmentScore(member: CabinetMemberData): number {
  let score = 100;
  
  if (member.conflicts_of_interest) {
    member.conflicts_of_interest.forEach((conflict) => {
      switch (conflict.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });
  }
  
  return Math.max(0, Math.min(100, score));
}

function getAlignmentColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

type SortOption = "name" | "alignment" | "conflicts" | "department" | "tenure";
type ViewMode = "grid" | "list";

export default function CabinetPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("conflicts");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  const members = cabinetData.members as CabinetMemberData[];
  const officials = getAllOfficials();

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set(members.map(m => m.department));
    return Array.from(depts).sort();
  }, [members]);

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    let filtered = members.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = 
        selectedDepartment === "all" || member.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "alignment":
          return calculateAlignmentScore(b) - calculateAlignmentScore(a);
        case "conflicts":
          const scoreA = calculateConflictScore(a.conflicts_of_interest || []);
          const scoreB = calculateConflictScore(b.conflicts_of_interest || []);
          return scoreB - scoreA;
        case "department":
          return a.department.localeCompare(b.department);
        case "tenure":
          return new Date(a.appointed_date).getTime() - new Date(b.appointed_date).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [members, searchQuery, sortBy, selectedDepartment]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const totalConflicts = members.reduce((sum, m) => 
      sum + (m.conflicts_of_interest?.length || 0), 0
    );
    const criticalConflicts = members.reduce((sum, m) => 
      sum + (m.conflicts_of_interest?.filter((c) => c.severity === 'critical').length || 0), 0
    );
    const avgAlignment = members.reduce((sum, m) => 
      sum + calculateAlignmentScore(m), 0) / totalMembers;

    return {
      totalMembers,
      totalConflicts,
      criticalConflicts,
      avgAlignment: Math.round(avgAlignment),
    };
  }, [members]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
              Cabinet Members
            </h1>
          <DataProvenance dataset="cabinet.json" className="mb-3" />
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              The President's Cabinet advises on matters related to the duties of their respective offices. 
              Track conflicts of interest, policy positions, and accountability metrics.
            </p>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-3xl font-black text-slate-900">{stats.totalMembers}</div>
                <div className="text-sm text-slate-600">Cabinet Members</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-3xl font-black text-slate-900">{stats.avgAlignment}</div>
                <div className="text-sm text-slate-600">Avg Alignment</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-3xl font-black text-orange-600">{stats.totalConflicts}</div>
                <div className="text-sm text-slate-600">Total Conflicts</div>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-4">
                <div className="text-3xl font-black text-red-600">{stats.criticalConflicts}</div>
                <div className="text-sm text-slate-600">Critical Issues</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="py-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, role, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="conflicts">Sort by Conflicts</option>
              <option value="alignment">Sort by Alignment</option>
              <option value="name">Sort by Name</option>
              <option value="department">Sort by Department</option>
              <option value="tenure">Sort by Tenure</option>
            </select>

            {/* View Toggle */}
            <div className="flex gap-2 bg-white border border-slate-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded ${
                  viewMode === "grid" 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded ${
                  viewMode === "list" 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedDepartment !== "all") && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <BodyText as="span">Active filters:</BodyText>
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">✕</button>
                </span>
              )}
              {selectedDepartment !== "all" && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                  {selectedDepartment}
                  <button onClick={() => setSelectedDepartment("all")} className="hover:text-blue-900">✕</button>
                </span>
              )}
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="mt-2 text-sm text-slate-600">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        </div>
      </section>

      {/* Cabinet Grid/List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {viewMode === "grid" ? (
            <div 
              data-testid="cabinet-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredMembers.map((member) => {
                const alignmentScore = calculateAlignmentScore(member);
                const alignmentColor = getAlignmentColor(alignmentScore);
                const conflictScore = calculateConflictScore((member.conflicts_of_interest as Array<{ severity: ConflictSeverity }>) || []);
                const conflictLabel = getConflictSeverityLabel(conflictScore);
                
                return (
                  <Link
                    key={member.id}
                    href={`/executive/cabinet/${member.id}`}
                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Photo */}
                    <div className="aspect-square overflow-hidden bg-slate-100 relative">
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Alignment Badge */}
                      <div className="absolute top-2 right-2">
                        <div className={`px-3 py-1 rounded-full font-bold text-sm shadow-lg ${alignmentColor}`}>
                          {alignmentScore}
                        </div>
                      </div>
                      {/* Conflict Badge */}
                      {conflictScore > 0 && (
                        <div className="absolute bottom-2 left-2">
                          <div className="px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg">
                            {conflictLabel}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {member.role}
                      </p>
                      <p className="text-xs text-slate-400 mb-2">
                        {member.department}
                      </p>
                      {/* Revolving Door Badge */}
                      {(() => {
                        const rdEntry = getRevolvingDoorEntry(member.id);
                        const rdLabel = getRevolvingDoorLabel(rdEntry?.type ?? null);
                        const rdColor = getRevolvingDoorColor(rdEntry?.type ?? null);
                        const rdIcon = getRevolvingDoorIcon(rdEntry?.type ?? null);
                        const rdDesc = getRevolvingDoorShortDesc(rdEntry?.type ?? null);
                        if (!rdEntry || rdEntry.type === "public_service") return null;
                        return (
                          <div
                            className={`mt-2 flex items-start gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium ${rdColor}`}
                            title={rdEntry.summary}
                          >
                            <span className="shrink-0">{rdIcon}</span>
                            <div className="min-w-0">
                              <span className="font-bold">{rdLabel}</span>
                              {rdDesc && (
                                <p className="opacity-80 mt-0.5 leading-tight truncate">{rdDesc}</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                      {member.conflicts_of_interest && member.conflicts_of_interest.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.conflicts_of_interest.slice(0, 2).map((conflict, idx: number) => (
                            <ConflictBadge key={idx} severity={conflict.severity} />
                          ))}
                          {member.conflicts_of_interest.length > 2 && (
                            <Caption>
                              +{member.conflicts_of_interest.length - 2} more
                            </Caption>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => {
                const alignmentScore = calculateAlignmentScore(member);
                const alignmentColor = getAlignmentColor(alignmentScore);
                const conflictScore = calculateConflictScore(member.conflicts_of_interest || []);
                const tenure = formatTenure(member.appointed_date);
                
                return (
                  <Link
                    key={member.id}
                    href={`/executive/cabinet/${member.id}`}
                    className="group block bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="flex gap-6 items-center">
                      {/* Photo */}
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
                      />
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-slate-700">{member.role}</p>
                        <p className="text-sm text-slate-500">{member.department}</p>
                        <p className="text-sm text-slate-500">{tenure} in office</p>
                      </div>
                      
                      {/* Metrics */}
                      <div className="flex gap-4 items-center">
                        <div className="text-center">
                          <div className={`text-2xl font-black px-4 py-2 rounded-lg ${alignmentColor}`}>
                            {alignmentScore}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Alignment</div>
                        </div>
                        
                        {member.conflicts_of_interest && member.conflicts_of_interest.length > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-black text-red-600 px-4 py-2 rounded-lg bg-red-50">
                              {member.conflicts_of_interest.length}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Conflicts</div>
                          </div>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex-shrink-0">
                        →
                      </div>
                    </div>
                    
                    {/* Conflicts Preview */}
                    {member.conflicts_of_interest && member.conflicts_of_interest.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex flex-wrap gap-2">
                          {member.conflicts_of_interest.slice(0, 3).map((conflict, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <ConflictBadge severity={conflict.severity} />
                              <span className="text-slate-600 truncate max-w-md">
                                {conflict.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No cabinet members found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("all");
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Legend */}
      <section className="py-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h3 className="font-bold text-slate-900 mb-4">Alignment Score Legend</h3>
          <div className="inline-flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-slate-600">High Alignment (70-100): Few or minor conflicts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-slate-600">Medium Alignment (40-69): Moderate conflicts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-slate-600">Low Alignment (&lt;40): Significant conflicts of interest</span>
            </div>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
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
