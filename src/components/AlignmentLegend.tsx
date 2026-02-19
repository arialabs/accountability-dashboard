"use client";

import { Caption } from "@/components/ui";

interface AlignmentLegendProps {
  /** Show in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export default function AlignmentLegend({ compact = false, className = "" }: AlignmentLegendProps) {
  if (compact) {
    return (
      <div className={`flex flex-wrap items-center gap-3 text-xs ${className}`}>
        <span className="text-slate-500 font-medium">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Aligned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-slate-600">Misaligned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span className="text-slate-600">Mixed</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-bold text-slate-700 mb-3">
        📊 Score Legend
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span className="font-medium text-emerald-700">High Alignment</span>
          </div>
          <Caption>70-100%</Caption>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="font-medium text-amber-700">Mixed Record</span>
          </div>
          <Caption>40-69%</Caption>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="font-medium text-red-700">Low Alignment</span>
          </div>
          <Caption>0-39%</Caption>
        </div>
      </div>
      
      <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
        <strong>Green</strong> = votes match stated positions. <strong>Red</strong> = votes contradict stated positions.
      </p>
    </div>
  );
}
