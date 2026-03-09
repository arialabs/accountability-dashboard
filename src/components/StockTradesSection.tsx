"use client";

/**
 * Stock Trades Section - Shows congressional stock trading activity
 * Loads trade data client-side from /data/trades/[bioguideId].json
 * (trades-by-member.json is 75MB — too large for Cloudflare Pages static deployment)
 */
import React, { useState, useEffect } from "react";

export interface StockTrade {
  ticker: string;
  company: string | null;
  tradedDate: string;
  filedDate: string;
  transaction: "Purchase" | "Sale";
  tradeSizeUsd: number;
  excessReturn: number | null;
}

interface StockTradesBaseProps {
  memberName: string;
  /** Optional pre-loaded trades (used in tests and SSR contexts). If provided, skips the fetch. */
  trades?: StockTrade[];
}

interface StockTradesByIdProps extends StockTradesBaseProps {
  bioguideId: string;
}

type StockTradesProps = StockTradesBaseProps | StockTradesByIdProps;

// Warren Buffett's average annual return (Berkshire Hathaway benchmark)
const BUFFETT_ANNUAL_RETURN = 19.8;

/** Normalize transaction type — case-insensitive, trimmed */
function isPurchase(tx: string): boolean {
  return tx.trim().toLowerCase() === "purchase";
}
function isSale(tx: string): boolean {
  return tx.trim().toLowerCase() === "sale";
}

export default function StockTradesSection(props: StockTradesProps) {
  const { memberName } = props;
  const bioguideId = "bioguideId" in props ? props.bioguideId : undefined;
  const propTrades = props.trades;

  const [fetchedTrades, setFetchedTrades] = useState<StockTrade[]>([]);
  const [loading, setLoading] = useState(propTrades === undefined && !!bioguideId);
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;

  useEffect(() => {
    // If trades were passed directly, don't fetch
    if (propTrades !== undefined || !bioguideId) return;

    setLoading(true);
    fetch(`/data/trades/${bioguideId}.json`)
      .then(r => {
        if (!r.ok) throw new Error("no trades");
        return r.json();
      })
      .then((data: StockTrade[]) => setFetchedTrades(data))
      .catch(() => setFetchedTrades([]))
      .finally(() => setLoading(false));
  }, [bioguideId, propTrades]);

  const trades = propTrades !== undefined ? propTrades : fetchedTrades;

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">Loading trade data…</div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center">
        <p className="text-sm font-semibold text-slate-600">Stock Trade Data Being Compiled</p>
        <p className="mt-1 text-xs text-slate-400">
          Trade records are sourced from STOCK Act disclosures and may take time to process.
        </p>
      </div>
    );
  }

  // Calculate summary stats — normalize transaction types for robustness
  const purchases = trades.filter(t => isPurchase(t.transaction as string));
  const sales = trades.filter(t => isSale(t.transaction as string));
  const totalVolume = trades.reduce((sum, t) => sum + (t.tradeSizeUsd || 0), 0);
  const tradesWithReturn = trades.filter(t => t.excessReturn !== null);
  const avgExcessReturn = tradesWithReturn.length > 0
    ? tradesWithReturn.reduce((sum, t) => sum + (t.excessReturn ?? 0), 0) / tradesWithReturn.length
    : null;

  const totalPages = Math.ceil(trades.length / tradesPerPage);
  const paginated = trades.slice((currentPage - 1) * tradesPerPage, currentPage * tradesPerPage);

  const formatVolume = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  };

  return (
    <section aria-label="Stock trades" className="space-y-4">
      {/* Summary cards — font-mono font-black used so tests can select stat boxes by class */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Total Trades</p>
          <p className="mt-0.5 text-xl font-mono font-black text-slate-800">{trades.length}</p>
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Purchases</p>
          <p className="mt-0.5 text-xl font-mono font-black text-green-700">{purchases.length}</p>
        </div>
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Sales</p>
          <p className="mt-0.5 text-xl font-mono font-black text-red-700">{sales.length}</p>
        </div>
        {avgExcessReturn !== null ? (
          <div className={`rounded-lg border px-3 py-2.5 ${avgExcessReturn > 0 ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Avg Excess Return</p>
            <p className={`mt-0.5 text-xl font-mono font-black ${avgExcessReturn > 0 ? "text-red-700" : "text-slate-800"}`}>
              {avgExcessReturn > 0 ? "+" : ""}{avgExcessReturn.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-400">vs S&P 500</p>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Volume</p>
            <p className="mt-0.5 text-xl font-mono font-black text-slate-800">{formatVolume(totalVolume)}</p>
          </div>
        )}
      </div>

      {avgExcessReturn !== null && avgExcessReturn > BUFFETT_ANNUAL_RETURN && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          ⚠️ {memberName}&apos;s average excess return ({avgExcessReturn.toFixed(1)}%) beats Warren Buffett&apos;s lifetime average ({BUFFETT_ANNUAL_RETURN}%). Statistically unlikely without an informational edge.
        </div>
      )}

      {/* Trade table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Ticker</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-right">Size</th>
              {tradesWithReturn.length > 0 && <th className="px-3 py-2 text-right">Excess Return</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.map((trade, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{trade.tradedDate}</td>
                <td className="px-3 py-2 font-mono font-semibold text-slate-800">
                  {trade.ticker}
                  {trade.company && <span className="ml-1.5 text-[11px] font-normal text-slate-400 hidden sm:inline">{trade.company}</span>}
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                    isPurchase(trade.transaction as string) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {isPurchase(trade.transaction as string) ? "Buy" : "Sell"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-slate-600">{formatVolume(trade.tradeSizeUsd)}</td>
                {tradesWithReturn.length > 0 && (
                  <td className={`px-3 py-2 text-right font-medium ${
                    (trade.excessReturn ?? 0) > 5 ? "text-red-600" : (trade.excessReturn ?? 0) > 0 ? "text-amber-600" : "text-slate-500"
                  }`}>
                    {trade.excessReturn !== null ? `${trade.excessReturn > 0 ? "+" : ""}${trade.excessReturn.toFixed(1)}%` : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{trades.length} trades total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              ←
            </button>
            <span className="px-2 py-1">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
