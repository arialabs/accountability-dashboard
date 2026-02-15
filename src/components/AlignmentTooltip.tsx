"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface AlignmentTooltipProps {
  /** Average alignment score (optional, for context) */
  averageScore?: number;
  /** Show extended content */
  extended?: boolean;
}

export default function AlignmentTooltip({ averageScore, extended = false }: AlignmentTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        aria-label="How is this scored?"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <span>How is this scored?</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 p-4 animate-fadeIn">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-sm font-bold text-slate-900 mb-3">
            🎯 Alignment Score Explained
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <p>
              <strong>What it measures:</strong> How often a politician's votes match their publicly stated positions.
            </p>

            <p>
              <strong>How it's calculated:</strong> We compare public statements (from campaigns, interviews, and voting guides) against actual congressional votes on related bills.
            </p>

            {averageScore !== undefined && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-blue-700">
                <strong>Average alignment:</strong> {averageScore}%
              </div>
            )}

            {extended && (
              <>
                <div className="pt-2 border-t border-slate-200">
                  <p className="font-semibold text-slate-700 mb-1">Score ranges:</p>
                  <ul className="space-y-1 pl-3">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span><strong>70-100%:</strong> Very/Mostly Consistent</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span><strong>40-69%:</strong> Mixed Record</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span><strong>0-39%:</strong> Inconsistent</span>
                    </li>
                  </ul>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-slate-200">
              <Link
                href="/methodology"
                className="text-blue-600 hover:text-blue-700 font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Full methodology →
              </Link>
            </div>
          </div>

          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.15s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
