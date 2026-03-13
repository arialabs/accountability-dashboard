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

function FinancialDisclosuresContent({
  disclosures,
  formatDate,
  getFilingTypeLabel,
}: {
  disclosures: FinancialDisclosure[];
  formatDate: (dateStr: string) => string;
  getFilingTypeLabel: (type: string) => string;
}) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  return (
    <>
      {/* Summary layer — always visible */}
      <p className="text-slate-700 mb-4">
        {disclosures.length} financial disclosure filing{disclosures.length !== 1 ? "s" : ""} on record.
      </p>

      {/* Details toggle */}
      <button
        onClick={() => setDetailsExpanded(!detailsExpanded)}
        aria-expanded={detailsExpanded}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-4"
      >
        {detailsExpanded ? "Hide filings" : "Show all filings"}
      </button>

      {/* Detail layer — expandable */}
      {detailsExpanded && (
        <>
          {/* Filings List */}
          <div className="space-y-3">
            {disclosures.map((filing, idx) => (
              <a
                key={idx}
                href={filing.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 min-h-[60px] rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 min-w-[48px] rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-700 group-hover:bg-blue-200 transition-colors">
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                      <span>{filing.year} Annual Financial Disclosure</span>
                      <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded-md font-medium">
                        {getFilingTypeLabel(filing.filingType)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Filed {formatDate(filing.filingDate)}
                      <span className="text-slate-400 mx-2">•</span>
                      Document ID: {filing.docId}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all sm:flex-shrink-0">
                  View PDF
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>

          {/* Data Source */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-400 text-center">
              Data from House Clerk Financial Disclosures •
              <a
                href="https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-400 hover:text-blue-500 underline"
              >
                Official Source
              </a>
            </div>
          </div>
        </>
      )}
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

  const getFilingTypeLabel = (type: string) => {
    switch (type) {
      case "O": return "Original";
      case "A": return "Amendment";
      case "N": return "New Filer";
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
          💰 Financial Disclosures
        </h3>
        <div className="text-sm text-slate-500">
          {disclosures.length} filing{disclosures.length !== 1 ? "s" : ""}
        </div>
      </div>
      
      {disclosures.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
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
        />
      )}
    </div>
  );
}
