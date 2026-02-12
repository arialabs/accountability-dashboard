/**
 * Confidence Level Calculation
 * 
 * Determines how confident we are in a score based on:
 * - Number of data points
 * - Data recency
 * - Source coverage
 */

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface ConfidenceMetrics {
  level: ConfidenceLevel;
  dataPoints: number;
  recencyScore: number; // 0-100
  sourceCoverage: number; // 0-100
  overall: number; // 0-100
  explanation: string;
}

export interface DataSource {
  name: string;
  available: boolean;
  dataPoints: number;
  lastUpdated?: string;
}

/**
 * Calculate recency score based on last update date
 * Returns 0-100, where 100 is very recent
 */
function calculateRecencyScore(lastUpdated?: string): number {
  if (!lastUpdated) return 0;
  
  const now = new Date();
  const updated = new Date(lastUpdated);
  const daysSince = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
  
  // Perfect score if updated in last 30 days
  if (daysSince <= 30) return 100;
  // Linear decay to 0 over next 335 days (1 year total)
  if (daysSince <= 365) return Math.round(100 - ((daysSince - 30) / 335) * 100);
  // Old data gets 0
  return 0;
}

/**
 * Calculate source coverage score
 * Returns 0-100 based on percentage of available sources used
 */
function calculateSourceCoverage(sources: DataSource[]): number {
  const availableSources = sources.filter(s => s.available).length;
  const totalSources = sources.length;
  return Math.round((availableSources / totalSources) * 100);
}

/**
 * Calculate confidence level for alignment scoring
 */
export function calculateConfidence(
  votesAnalyzed: number,
  sources: DataSource[]
): ConfidenceMetrics {
  // Calculate individual factors
  const totalDataPoints = sources.reduce((sum, s) => sum + s.dataPoints, 0);
  
  // Recency: use most recent source update
  const mostRecentUpdate = sources
    .filter(s => s.lastUpdated)
    .map(s => s.lastUpdated!)
    .sort()
    .reverse()[0];
  const recencyScore = calculateRecencyScore(mostRecentUpdate);
  
  // Source coverage
  const sourceCoverage = calculateSourceCoverage(sources);
  
  // Overall confidence score (weighted)
  // 40% data points, 30% recency, 30% source coverage
  const dataPointScore = Math.min(100, (totalDataPoints / 20) * 100); // Cap at 20+ data points
  const overall = Math.round(
    dataPointScore * 0.4 +
    recencyScore * 0.3 +
    sourceCoverage * 0.3
  );
  
  // Determine confidence level
  let level: ConfidenceLevel;
  let explanation: string;
  
  if (overall >= 70) {
    level = 'high';
    explanation = `High confidence: ${totalDataPoints} data points from ${sources.filter(s => s.available).length} sources`;
  } else if (overall >= 40) {
    level = 'medium';
    explanation = `Medium confidence: Limited to ${totalDataPoints} data points`;
  } else {
    level = 'low';
    explanation = `Low confidence: Only ${totalDataPoints} data points available`;
  }
  
  return {
    level,
    dataPoints: totalDataPoints,
    recencyScore,
    sourceCoverage,
    overall,
    explanation,
  };
}

/**
 * Get confidence indicator color classes for UI
 */
export function getConfidenceColor(level: ConfidenceLevel): {
  text: string;
  bg: string;
  border: string;
} {
  switch (level) {
    case 'high':
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
      };
    case 'medium':
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
      };
    case 'low':
      return {
        text: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
      };
  }
}

/**
 * Get visual indicator (dots) for confidence level
 */
export function getConfidenceDots(level: ConfidenceLevel): string {
  switch (level) {
    case 'high':
      return '●●●';
    case 'medium':
      return '●●○';
    case 'low':
      return '●○○';
  }
}
