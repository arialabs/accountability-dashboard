"use client";

import type { SeverityLevel } from "@/lib/types";

export interface FilterState {
  search: string;
  party: string;
  severity: SeverityLevel[];
  chamber: string;
  category: string;
  dateStart: string;
  dateEnd: string;
}

export interface FilterStats {
  total: number;
  bySeverity: Record<SeverityLevel, number>;
  byParty: Record<string, number>;
  byChamber: Record<string, number>;
}

interface ScandalFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  stats: FilterStats;
}

const severityLevels: { value: SeverityLevel; label: string }[] = [
  { value: "conviction", label: "Conviction" },
  { value: "indictment", label: "Indictment" },
  { value: "criminal_investigation", label: "Criminal Investigation" },
  { value: "ethics_violation", label: "Ethics Violation" },
  { value: "ethics_investigation", label: "Ethics Investigation" },
  { value: "allegation", label: "Allegation" },
];

const categories = [
  { value: "", label: "All Categories" },
  { value: "bribery", label: "Bribery" },
  { value: "fraud", label: "Fraud" },
  { value: "insider_trading", label: "Insider Trading" },
  { value: "stock_trading", label: "Stock Trading" },
  { value: "campaign_finance", label: "Campaign Finance" },
  { value: "ethics_violation", label: "Ethics Violations" },
  { value: "sexual_harassment", label: "Sexual Harassment" },
  { value: "corruption", label: "Corruption" },
  { value: "dui", label: "DUI" },
  { value: "other", label: "Other" },
];

export default function ScandalFilters({ 
  filters, 
  onFilterChange, 
  stats 
}: ScandalFiltersProps) {
  
  const updateFilter = (key: keyof FilterState, value: string | SeverityLevel[]) => {
    onFilterChange({ ...filters, [key]: value });
  };
  
  const toggleSeverity = (severity: SeverityLevel) => {
    const newSeverities = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    updateFilter("severity", newSeverities);
  };
  
  const clearAllFilters = () => {
    onFilterChange({
      search: "",
      party: "",
      severity: [],
      chamber: "",
      category: "",
      dateStart: "",
      dateEnd: "",
    });
  };
  
  const hasActiveFilters = 
    filters.search || 
    filters.party || 
    filters.severity.length > 0 || 
    filters.chamber || 
    filters.category ||
    filters.dateStart ||
    filters.dateEnd;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black uppercase tracking-wider text-slate-700">
          📍 Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Clear All Filters ✕
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="mb-4">
        <label htmlFor="scandal-search" className="block text-sm font-semibold text-slate-700 mb-2">
          Search by name or keyword
        </label>
        <div className="relative">
          <input
            id="scandal-search"
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
      </div>
      
      {/* Party Filter */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Party
        </label>
        <div className="flex flex-wrap gap-2">
          {["", "D", "R", "I"].map((party) => (
            <button
              key={party || "all"}
              onClick={() => updateFilter("party", party)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition min-h-[44px]
                ${filters.party === party
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }
              `}
            >
              {party === "" ? "All" : party === "D" ? "Democrat" : party === "R" ? "Republican" : "Independent"}
              {party && stats.byParty[party] ? ` (${stats.byParty[party]})` : ""}
            </button>
          ))}
        </div>
      </div>
      
      {/* Severity Checkboxes */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Severity
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {severityLevels.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer min-h-[44px]"
            >
              <input
                type="checkbox"
                checked={filters.severity.includes(value)}
                onChange={() => toggleSeverity(value)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                {label}
                {stats.bySeverity[value] > 0 && (
                  <span className="text-slate-500 ml-1">
                    ({stats.bySeverity[value]})
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Category Dropdown */}
      <div className="mb-4">
        <label htmlFor="category-filter" className="block text-sm font-semibold text-slate-700 mb-2">
          Category
        </label>
        <select
          id="category-filter"
          value={filters.category}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium leading-relaxed focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        >
          {categories.map(({ value, label }) => (
            <option key={value || "all"} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Chamber Filter */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Chamber
        </label>
        <div className="flex flex-wrap gap-2">
          {["", "executive", "house", "senate"].map((chamber) => (
            <button
              key={chamber || "all"}
              onClick={() => updateFilter("chamber", chamber)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition min-h-[44px]
                ${filters.chamber === chamber
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }
              `}
            >
              {chamber === "" ? "All" : chamber === "executive" ? "Executive" : chamber === "house" ? "House" : "Senate"}
              {chamber && stats.byChamber[chamber] ? ` (${stats.byChamber[chamber]})` : ""}
            </button>
          ))}
        </div>
      </div>
      
      {/* Results Count */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-sm font-semibold text-slate-700">
          Showing {stats.total} incident{stats.total !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
