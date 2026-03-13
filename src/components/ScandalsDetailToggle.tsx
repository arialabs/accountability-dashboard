"use client";

import { useState } from "react";
import type { ScandalEntry } from "@/lib/types";
import ScandalCard from "./ScandalCard";
import Link from "next/link";

interface ScandalsDetailToggleProps {
  scandals: ScandalEntry[];
  maxVisible: number;
  bioguideId: string;
}

export default function ScandalsDetailToggle({
  scandals,
  maxVisible,
  bioguideId,
}: ScandalsDetailToggleProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleScandals = scandals.slice(0, maxVisible);
  const hasMore = scandals.length > maxVisible;

  return (
    <>
      {/* Details toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mb-4"
      >
        {expanded ? "Hide incident details" : "Show all incidents"}
      </button>

      {/* Detail layer — expandable */}
      {expanded && (
        <div className="space-y-6 mt-4">
          {/* Scandal Cards */}
          {visibleScandals.map((scandal) => (
            <ScandalCard
              key={scandal.id}
              scandal={scandal}
              showMember={false}
            />
          ))}

          {/* View All Link */}
          {hasMore && (
            <div className="text-center pt-4">
              <Link
                href={`/scandals?member=${bioguideId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                View All ({scandals.length}) Incidents
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
