"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ordersData from "@/data/executive-orders.json";

interface ExecutiveOrder {
  document_number: string;
  eo_number: string | number | null;
  title: string;
  signing_date: string;
  abstract: string;
  html_url: string;
  agencies: string[];
  topics: string[];
  category: string;
}

const orders = (ordersData as { orders: ExecutiveOrder[] }).orders;

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  "Immigration & Border":  { bg: "bg-red-50",    text: "text-red-800",    border: "border-red-200",    dot: "bg-red-500" },
  "National Security":     { bg: "bg-slate-100", text: "text-slate-800",  border: "border-slate-300",  dot: "bg-slate-600" },
  "Trade & Tariffs":       { bg: "bg-amber-50",  text: "text-amber-800",  border: "border-amber-200",  dot: "bg-amber-500" },
  "Energy & Environment":  { bg: "bg-green-50",  text: "text-green-800",  border: "border-green-200",  dot: "bg-green-600" },
  "Government Reform":     { bg: "bg-blue-50",   text: "text-blue-800",   border: "border-blue-200",   dot: "bg-blue-500" },
  "Civil Rights":          { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200", dot: "bg-purple-500" },
  "Healthcare":            { bg: "bg-teal-50",   text: "text-teal-800",   border: "border-teal-200",   dot: "bg-teal-500" },
  "Technology":            { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200", dot: "bg-indigo-500" },
  "Finance & Economy":     { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200", dot: "bg-yellow-600" },
  "Other":                 { bg: "bg-slate-50",  text: "text-slate-600",  border: "border-slate-200",  dot: "bg-slate-400" },
};

function getColors(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Other"];
}

// All unique categories sorted by count
const categoryCounts = orders.reduce<Record<string, number>>((acc, o) => {
  acc[o.category] = (acc[o.category] || 0) + 1;
  return acc;
}, {});
const ALL_CATEGORIES = ["All", ...Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])];

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function ExecutiveOrdersPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showCount, setShowCount] = useState(50);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (category !== "All" && o.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.title.toLowerCase().includes(q) || o.abstract.toLowerCase().includes(q);
      }
      return true;
    });
  }, [category, search]);

  // Group by month for timeline display
  const byMonth = useMemo(() => {
    const map = new Map<string, ExecutiveOrder[]>();
    for (const o of filtered.slice(0, showCount)) {
      const month = o.signing_date.slice(0, 7); // "YYYY-MM"
      if (!map.has(month)) map.set(month, []);
      map.get(month)!.push(o);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered, showCount]);

  function formatMonth(ym: string) {
    const [year, month] = ym.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
      year: "numeric", month: "long",
    });
  }

  const pace = useMemo(() => {
    if (orders.length === 0) return null;
    const newest = new Date(orders[0].signing_date);
    const oldest = new Date(orders[orders.length - 1].signing_date);
    const days = Math.max(1, (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24));
    return (orders.length / days * 7).toFixed(1); // per week
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-2">
            <Link href="/executive" className="text-slate-400 hover:text-white text-sm transition-colors">
              ← Executive Branch
            </Link>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            📋 Executive Orders
          </h1>
          <p className="text-slate-300 text-lg max-w-3xl">
            Every executive order signed since January 20, 2025. Sourced directly from the
            Federal Register — the official daily journal of the U.S. government.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-slate-800 text-white border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="text-center">
              <div className="text-3xl font-black" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {orders.length}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {pace}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Per week</div>
            </div>
            <div className="flex flex-wrap gap-2 flex-1">
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cat, count]) => {
                  const c = getColors(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        category === cat ? `${c.bg} ${c.text} ring-1 ring-current` : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                      {cat} ({count})
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowCount(50); }}
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setShowCount(50); }}
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm bg-white"
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All categories" : `${c} (${categoryCounts[c] ?? 0})`}
              </option>
            ))}
          </select>
          {(category !== "All" || search) && (
            <button
              onClick={() => { setCategory("All"); setSearch(""); setShowCount(50); }}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="mt-2 text-sm text-slate-500">
          {filtered.length === orders.length
            ? `Showing all ${orders.length} orders`
            : `${filtered.length} of ${orders.length} orders`}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {byMonth.map(([month, monthOrders]) => (
          <div key={month} className="mb-10">
            {/* Month header */}
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-base font-black uppercase tracking-widest text-slate-500"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {formatMonth(month)}
              </h2>
              <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {monthOrders.length} orders
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="space-y-3">
              {monthOrders.map((order) => {
                const colors = getColors(order.category);
                return (
                  <a
                    key={order.document_number}
                    href={order.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex gap-4 rounded-lg border ${colors.border} ${colors.bg} p-4 hover:shadow-sm transition-shadow group`}
                  >
                    {/* Category dot */}
                    <div className={`flex-shrink-0 w-3 h-3 rounded-full ${colors.dot} mt-1.5`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-1">
                        {order.eo_number && (
                          <span
                            className={`text-xs font-bold ${colors.text} uppercase tracking-wider`}
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            E.O. {order.eo_number}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${colors.border} ${colors.text} font-semibold`}
                        >
                          {order.category}
                        </span>
                      </div>
                      <h3
                        className="font-bold text-slate-900 group-hover:text-slate-700 leading-snug"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {order.title}
                      </h3>
                      {order.abstract && (
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {order.abstract}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(order.signing_date)}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 group-hover:text-slate-600 transition-colors">
                        Federal Register ↗
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ))}

        {/* Load more */}
        {filtered.length > showCount && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowCount((n) => n + 50)}
              className="px-6 py-3 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              Load more ({filtered.length - showCount} remaining)
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-semibold">No orders match your filters</p>
            <p className="text-sm mt-1">Try broadening your search</p>
          </div>
        )}

        {/* Source note */}
        <div className="mt-12 bg-slate-50 rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-2">📋 About this data</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Executive orders are official presidential directives that carry the force of law.
            This data is sourced from the{" "}
            <a href="https://www.federalregister.gov" className="underline" target="_blank" rel="noopener noreferrer">
              Federal Register API
            </a>{" "}
            and includes all presidential documents classified as executive orders since January 20, 2025.
            Federal Register publication typically lags signing by 3–7 days.
          </p>
        </div>
      </div>
    </main>
  );
}
