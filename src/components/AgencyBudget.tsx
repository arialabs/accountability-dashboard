/**
 * AgencyBudget — Displays real USASpending.gov budget data for a cabinet agency.
 * Shows budget authority, obligated amount, % of federal budget, and top contracts.
 */

import usaspendingData from "@/data/cabinet-spending.json";

interface AgencyBudgetProps {
  cabinetId: string; // e.g. "secretary-of-defense"
}

interface ContractAward {
  award_id: string;
  recipient: string;
  amount: number;
  date: string;
  description: string;
}

interface AgencyRecord {
  code: string;
  name: string;
  cabinet_id: string;
  slug: string;
  budget_authority_fy2026: number;
  obligated_fy2026: number;
  outlay_fy2026: number;
  percentage_of_total: number;
  total_federal_budget: number;
  pct_display: string;
  top_contracts: ContractAward[];
}

function formatBillions(amount: number): string {
  if (amount >= 1e12) return `$${(amount / 1e12).toFixed(1)}T`;
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(0)}M`;
  return `$${amount.toLocaleString()}`;
}

function BudgetBar({ pct }: { pct: number }) {
  // pct is a decimal (0–1), cap at 0.5 for display sanity (Treasury is 37%)
  const displayPct = Math.min(pct * 100, 50);
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full bg-blue-600"
        style={{ width: `${Math.max(displayPct * 2, 2)}%` }}
        aria-label={`${(pct * 100).toFixed(1)}% of federal budget`}
      />
    </div>
  );
}

export function AgencyBudget({ cabinetId }: AgencyBudgetProps) {
  const agency = (usaspendingData.agencies as unknown as AgencyRecord[]).find(
    (a) => a.cabinet_id === cabinetId
  );

  if (!agency || agency.budget_authority_fy2026 === 0) return null;

  const topContracts = agency.top_contracts.slice(0, 3);

  return (
    <div className="bg-blue-50 rounded-2xl border border-blue-200 p-8 mb-12">
      <h2 className="text-2xl font-black text-blue-900 mb-1 flex items-center gap-2">
        💰 Agency Budget — FY2026
      </h2>
      <p className="text-sm text-blue-600 mb-6">
        Source:{" "}
        <a
          href={`https://www.usaspending.gov/agency/${agency.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-800"
        >
          USASpending.gov
        </a>
      </p>

      {/* Budget figures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-blue-200 p-4 text-center">
          <div className="text-3xl font-black text-slate-900">
            {formatBillions(agency.budget_authority_fy2026)}
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Budget Authority
          </div>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4 text-center">
          <div className="text-3xl font-black text-slate-900">
            {formatBillions(agency.obligated_fy2026)}
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Obligated
          </div>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4 text-center">
          <div className="text-3xl font-black text-blue-700">
            {(agency.percentage_of_total * 100).toFixed(1)}%
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            of Federal Budget
          </div>
        </div>
      </div>

      {/* Budget bar showing proportion of federal spend */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{agency.name}</span>
          <span>{(agency.percentage_of_total * 100).toFixed(2)}% of total</span>
        </div>
        <BudgetBar pct={agency.percentage_of_total} />
      </div>

      {/* Top contracts */}
      {topContracts.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3">
            Top Contract Awards (FY2023–2026)
          </h3>
          <div className="space-y-2">
            {topContracts.map((contract, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-blue-100 px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 text-sm truncate">
                    {contract.recipient}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {contract.description?.replace(/IGF::OT::IGF/g, "").trim() || "Contract award"}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="font-black text-slate-900 text-sm">
                    {formatBillions(contract.amount)}
                  </div>
                  {contract.date && (
                    <div className="text-xs text-slate-400">{contract.date.slice(0, 7)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
