'use client';

import { useEffect, useState } from 'react';

interface AlignmentScore {
  promise_id: number;
  score: number;
  confidence: 'low' | 'medium' | 'high';
  rationale: string;
}

interface PresidentialPromise {
  id: number;
  promise_text: string;
  category: string;
  subcategory?: string;
  date_made?: string;
  source_url?: string;
  source_type?: string;
  status: string;
  priority?: string;
}

interface AlignmentData {
  stats: {
    overall_alignment_score?: number;
    avg_alignment: number;
    aligned_count: number;
    conflicted_count: number;
    total_promises: number;
    promises_aligned?: number;
    policies_aligned?: number;
    promises_neutral?: number;
    policies_neutral?: number;
    promises_conflicted?: number;
    policies_conflicted?: number;
  };
  alignment_scores: AlignmentScore[];
  related_promises?: PresidentialPromise[];
}

interface AlignmentSectionProps {
  memberId: string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (score >= 0) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'Aligned';
  if (score >= 40) return 'Partial';
  if (score >= 0) return 'Conflicted';
  return 'Opposed';
}

export default function AlignmentSection({ memberId }: AlignmentSectionProps) {
  const [alignmentData, setAlignmentData] = useState<AlignmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlignment() {
      try {
        const response = await fetch(`/api/cabinet/${memberId}`);
        if (response.ok) {
          const data = await response.json();
          setAlignmentData(data);
        }
      } catch (error) {
        // Silently fail - alignment data is optional
      } finally {
        setLoading(false);
      }
    }

    fetchAlignment();
  }, [memberId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!alignmentData || !alignmentData.alignment_scores || alignmentData.alignment_scores.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Policy Alignment
        </h2>
        <p className="text-slate-600">
          No alignment data available yet. Check back soon as we track this cabinet member's actions.
        </p>
      </div>
    );
  }

  const { stats, alignment_scores, related_promises } = alignmentData;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
        <h2 className="text-2xl font-black text-slate-900 mb-6">
          Policy Alignment Summary
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-black text-slate-900 mb-1">
              {stats.overall_alignment_score}
            </div>
            <div className="text-sm text-slate-600">Overall Score</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-black text-green-600 mb-1">
              {stats.promises_aligned || stats.policies_aligned || 0}
            </div>
            <div className="text-sm text-slate-600">Aligned</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-black text-orange-600 mb-1">
              {stats.promises_neutral || stats.policies_neutral || 0}
            </div>
            <div className="text-sm text-slate-600">Neutral</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-black text-red-600 mb-1">
              {stats.promises_conflicted || stats.policies_conflicted || 0}
            </div>
            <div className="text-sm text-slate-600">Conflicted</div>
          </div>
        </div>
      </div>

      {/* Detailed Alignment by Promise */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-2xl font-black text-slate-900 mb-6">
          Alignment with Presidential Policy Agenda
        </h2>
        
        <div className="space-y-4">
          {alignment_scores.map((alignment: AlignmentScore) => {
            const promise = related_promises?.find((p) => p.id === alignment.promise_id);
            if (!promise) return null;
            
            const scoreColor = getScoreColor(alignment.score);
            const scoreLabel = getScoreLabel(alignment.score);
            
            return (
              <div 
                key={alignment.promise_id}
                className={`rounded-xl border-2 p-6 transition-all hover:shadow-md ${scoreColor}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white">
                        {promise.category}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${scoreColor}`}>
                        {scoreLabel}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900 mb-2">
                      {promise.promise_text}
                    </p>
                  </div>
                  
                  <div className="text-center min-w-[60px]">
                    <div className="text-2xl font-black">
                      {alignment.score}
                    </div>
                    <div className="text-xs text-slate-600">Score</div>
                  </div>
                </div>
                
                <p className="text-sm text-slate-700 italic">
                  {alignment.rationale}
                </p>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>Status: <strong>{promise.status.replace('_', ' ')}</strong></span>
                  <span>•</span>
                  <span>Confidence: <strong>{alignment.confidence}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Methodology Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
          <span>ℹ️</span>
          How Alignment is Calculated
        </h3>
        <p className="text-sm text-slate-700">
          Alignment scores (0-100) are calculated based on the cabinet member's policy positions, 
          conflicts of interest, and department responsibilities. Scores above 70 indicate strong 
          alignment, 40-69 show partial alignment, and below 40 suggest conflicts or opposition. 
          This is an initial implementation - scores will become more accurate as we track actual 
          actions and executive orders.
        </p>
      </div>
    </div>
  );
}
