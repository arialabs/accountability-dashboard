"use client";

/**
 * Stock Trades Section - Shows congressional stock trading activity
 */
import React, { useState } from "react";

export interface StockTrade {
  ticker: string;
  company: string | null;
  tradedDate: string;
  filedDate: string;
  transaction: "Purchase" | "Sale";
  tradeSizeUsd: number;
  excessReturn: number | null;
}

interface StockTradesProps {
  trades: StockTrade[];
  memberName: string;
}

// Warren Buffett's average annual return (Berkshire Hathaway benchmark)
const BUFFETT_ANNUAL_RETURN = 19.8; // ~20% annual average

export default function StockTradesSection({ trades, memberName }: StockTradesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;
  
  // Calculate summary stats
  // Normalize transaction types to handle inconsistent data
  // Raw data contains: "Purchase", "PURCHASE", "Sale", "SALE", "Sale (Full)", "Sale (Partial)", "Exchange"
  const normalizedTrades = trades.map(t => {
    const raw = t.transaction?.trim().toLowerCase() || '';
    let normalized: "Purchase" | "Sale" | "Exchange";
    if (raw === 'purchase' || raw === 'buy') {
      normalized = 'Purchase';
    } else if (raw.startsWith('sale') || raw === 'sell') {
      normalized = 'Sale';
    } else if (raw === 'exchange') {
      normalized = 'Exchange';
    } else {
      normalized = 'Purchase'; // Default fallback
    }
    return { ...t, transaction: normalized };
  });
  
  const purchases = normalizedTrades.filter(t => t.transaction === "Purchase");
  const sales = normalizedTrades.filter(t => t.transaction === "Sale");
  const exchanges = normalizedTrades.filter(t => t.transaction === "Exchange");
  const totalValue = normalizedTrades.reduce((sum, t) => sum + t.tradeSizeUsd, 0);
  
  // Get unique tickers
  const uniqueTickers = [...new Set(normalizedTrades.map(t => t.ticker))];
  
  // Calculate average excess return (performance vs market)
  const tradesWithReturn = normalizedTrades.filter(t => t.excessReturn !== null);
  const avgExcessReturn = tradesWithReturn.length > 0
    ? tradesWithReturn.reduce((sum, t) => sum + (t.excessReturn || 0), 0) / tradesWithReturn.length
    : null;
  
  // Compare to Warren Buffett benchmark
  const beatsBuffett = avgExcessReturn !== null && avgExcessReturn > BUFFETT_ANNUAL_RETURN;
  const suspiciouslyGood = avgExcessReturn !== null && avgExcessReturn > BUFFETT_ANNUAL_RETURN * 1.5; // 50% better than Buffett

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

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
          📊 Stock Trades
        </h3>
        {avgExcessReturn !== null && (
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl font-mono text-lg font-bold ${
              avgExcessReturn > 0 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {avgExcessReturn > 0 ? "+" : ""}{avgExcessReturn.toFixed(1)}% vs Market
            </div>
            {beatsBuffett && (
              <div 
                title={suspiciouslyGood 
                  ? "Significantly outperforming Warren Buffett — potential insider trading?" 
                  : "Outperforming Warren Buffett's historical average"
                }
                className={`px-3 py-2 rounded-xl text-sm font-bold cursor-help ${
                  suspiciouslyGood 
                    ? "bg-amber-100 text-amber-800 border-2 border-amber-300" 
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {suspiciouslyGood ? "⚠️ " : ""}Beats Buffett
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Buffett Comparison Banner */}
      {avgExcessReturn !== null && beatsBuffett && (
        <div className={`mb-6 p-4 rounded-xl border-2 ${
          suspiciouslyGood 
            ? "bg-amber-50 border-amber-200" 
            : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">{suspiciouslyGood ? "🚨" : "📈"}</div>
            <div>
              <div className="font-bold text-slate-900">
                {suspiciouslyGood 
                  ? "Suspiciously High Returns" 
                  : "Outperforming Professional Investors"}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                This representative's stock trades average <strong>+{avgExcessReturn.toFixed(1)}%</strong> vs market.
                Warren Buffett — widely considered the greatest investor of all time — averages ~{BUFFETT_ANNUAL_RETURN}% annually.
                {suspiciouslyGood && (
                  <span className="block mt-2 text-amber-800 font-medium">
                    Performance this high without insider information would be statistically remarkable.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {normalizedTrades.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <div className="text-xl font-bold text-slate-700 mb-2">No Stock Trades Found</div>
          <div className="text-slate-500">
            {memberName} has no disclosed stock trades in our database.
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-mono font-black text-slate-900">{normalizedTrades.length}</div>
              <div className="text-sm font-medium text-slate-600">Total Trades</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-mono font-black text-emerald-700">{purchases.length}</div>
              <div className="text-sm font-medium text-emerald-600">Purchases</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-mono font-black text-red-700">{sales.length}</div>
              <div className="text-sm font-medium text-red-600">Sales</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-mono font-black text-blue-700">{uniqueTickers.length}</div>
              <div className="text-sm font-medium text-blue-600">Unique Stocks</div>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-black uppercase tracking-wider text-slate-700">
                Recent Trades
              </div>
              <div className="text-sm text-slate-500">
                Showing {((currentPage - 1) * tradesPerPage) + 1} to {Math.min(currentPage * tradesPerPage, normalizedTrades.length)} of {normalizedTrades.length} trades
              </div>
            </div>
            <div className="space-y-3">
              {normalizedTrades.slice((currentPage - 1) * tradesPerPage, currentPage * tradesPerPage).map((trade, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border-2 transition-all ${
                    trade.transaction === "Purchase"
                      ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                      : "bg-red-50 border-red-200 hover:border-red-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 min-w-[48px] rounded-lg flex items-center justify-center font-bold text-white ${
                      trade.transaction === "Purchase" ? "bg-emerald-500" : "bg-red-500"
                    }`}>
                      {trade.transaction === "Purchase" ? "↑" : "↓"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {trade.ticker}
                        {trade.company && (
                          <span className="font-normal text-slate-500 ml-2">
                            {trade.company}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600">
                        {formatDate(trade.tradedDate)}
                        <span className="text-slate-400 mx-2">•</span>
                        Filed {formatDate(trade.filedDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center sm:text-right">
                    <div className="font-mono font-bold text-lg text-slate-900">
                      {formatCurrency(trade.tradeSizeUsd)}
                    </div>
                    {trade.excessReturn !== null && (
                      <div className={`text-sm font-medium ${
                        trade.excessReturn > 0 ? "text-emerald-600" : "text-red-600"
                      }`}>
                        {trade.excessReturn > 0 ? "+" : ""}{trade.excessReturn.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {normalizedTrades.length > tradesPerPage && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 min-h-[44px] rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:hover:bg-slate-100"
              >
                ← Previous
              </button>
              <div className="text-sm text-slate-600">
                Page {currentPage} of {Math.ceil(normalizedTrades.length / tradesPerPage)}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(normalizedTrades.length / tradesPerPage), p + 1))}
                disabled={currentPage === Math.ceil(normalizedTrades.length / tradesPerPage)}
                className="px-6 py-3 min-h-[44px] rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:hover:bg-slate-100"
              >
                Next →
              </button>
            </div>
          )}

          {/* Data Source */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-400 text-center">
              Data from Quiver Quant • Congressional financial disclosures
            </div>
          </div>
        </>
      )}
    </div>
  );
}
