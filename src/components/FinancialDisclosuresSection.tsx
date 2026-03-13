"use client";

/**
 * Financial Disclosures Section - Shows House member financial disclosure filings
 */
import React, { useState } from "react";

export interface FinancialDisclosure {
  last: string;
  first: string;
  prefix: string;
  suffix: string;
  filingType: string;
  stateDst: string;
  year: number;
  filingDate: string;
  docId: string;
  pdfUrl: string;
}

interface FinancialDisclosuresSectionProps {
  disclosures: FinancialDisclosure[];
  memberName: string;
}

const getFilingTypeLabel = (type: string) => {
  switch (type) {
    case "O": return "Original";
    case "A": return "Amendment";
    case "N": return "New Filer";
    case "T": return "Termination";
    default: return type;
  }
};

const getFilingTypeBadgeColor = (type: string) => {
  switch (type) {
    case "O": return "bg-blue-100 text-blue-700";
    case "A": return "bg-amber-100 text-amber-700";
    case "N": return "bg-green-100 text-green-700";
    case "T": return "bg-slate-100 text-slate-700";
    default: return "bg-slate-100 text-slate-700";
  }
};

function FinancialDisclosuresContent({
  disclosures,
  formatDate,
  getFilingTypeLabel,
  getFilingTypeBadgeColor,
}: {
  disclosures: FinancialDisclosure[];
  formatDate: (dateStr: string) => string;
  getFilingTypeLabel: (type: string) => string;
  getFilingTypeBadgeColor: (type: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...disclosures].sort((a, b) => b.year - a.year);
  const displayItems = expanded ? sorted : sorted.slice(0, 3);
  const years = sorted.map(d => d.year);
  const yearRange = years.length > 1 ? `${years[years.length - 1]}–${years[0]}` : `${years[0]}`;

  return (
    <>
      <p className="text-slate-700 mb-6">
        {disclosures.length} financial disclosure filing{disclosures.length !== 1 ? "s" : ""} on record ({yearRange}).
      </p>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" aria-hidden="true" />
        <div className="space-y-4">
          {displayItems.map((filing, idx) => (
            <div key={idx} className="relative flex gap-4">
              <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-slate-300 shrink-0">
                <span className="text-sm font-bold text-slate-600">{String(filing.year).slice(-2)}</span>
              </div>
              <a
                href={filing.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{filing.year} Financial Disclosure</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getFilingTypeBadgeColor(filing.filingType)}`}>
                      {getFilingTypeLabel(filing.filingType)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Filed {formatDate(filing.filingDate)}</p>
                </div>
                <span className="text-blue-600 font-semibold text-sm group-hover:underline shrink-0">
                  View PDF →
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {sorted.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {expanded ? "Show fewer" : `Show all ${sorted.length} filings`}
        </button>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Data from House Clerk Financial Disclosures •{" "}
          <a href="https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure"
             target="_blank" rel="noopener noreferrer"
             className="text-blue-400 hover:text-blue-500 underline">
            Official Source
          </a>
        </p>
      </div>
    </>
  );
}

export default function FinancialDisclosuresSection({
  disclosures,
  memberName
}: FinancialDisclosuresSectionProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
          Financial Disclosures
        </h3>
        <div className="text-sm text-slate-500">
          {disclosures.length} filing{disclosures.length !== 1 ? "s" : ""}
        </div>
      </div>

      {disclosures.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-xl font-bold text-slate-700 mb-2">Financial Disclosures Being Compiled</div>
          <div className="text-slate-500">
            Financial disclosure filings for {memberName} are being indexed from House Clerk records. Check back soon.
          </div>
        </div>
      ) : (
        <FinancialDisclosuresContent
          disclosures={disclosures}
          formatDate={formatDate}
          getFilingTypeLabel={getFilingTypeLabel}
          getFilingTypeBadgeColor={getFilingTypeBadgeColor}
        />
      )}
    </div>
  );
}
