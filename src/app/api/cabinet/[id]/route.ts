import { NextResponse } from 'next/server';
import cabinetData from '@/data/cabinet.json';
import promisesData from '@/data/presidential-promises.json';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/cabinet/[id]
 * Returns detailed information for a specific cabinet member including alignment scores
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const member = cabinetData.members.find(m => m.id === id);
    
    if (!member) {
      return NextResponse.json(
        { error: 'Cabinet member not found' },
        { status: 404 }
      );
    }
    
    // Calculate alignment scores with relevant promises
    const alignmentScores = calculateAlignmentScores(member);
    
    // Get related promises
    const relatedPromises = promisesData.promises.filter(promise => 
      isPromiseRelevant(promise, member)
    );
    
    // Calculate overall stats
    const stats = {
      overall_alignment_score: calculateOverallAlignment(alignmentScores),
      total_actions: 0, // TODO: count from database when available
      recent_actions_30d: 0,
      promises_aligned: alignmentScores.filter(s => s.score > 50).length,
      promises_conflicted: alignmentScores.filter(s => s.score < 0).length,
      promises_neutral: alignmentScores.filter(s => s.score >= 0 && s.score <= 50).length,
    };
    
    return NextResponse.json({
      member,
      stats,
      alignment_scores: alignmentScores,
      related_promises: relatedPromises,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching cabinet member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cabinet member details' },
      { status: 500 }
    );
  }
}

/**
 * Determine if a promise is relevant to a cabinet member based on their department
 */
function isPromiseRelevant(promise: any, member: any): boolean {
  const departmentKeywords: Record<string, string[]> = {
    'Department of State': ['foreign', 'ukraine', 'russia', 'china', 'trade', 'diplomat'],
    'Department of Defense': ['military', 'defense', 'ukraine', 'war'],
    'Department of Justice': ['justice', 'prosecute', 'pardon', 'january 6', 'legal'],
    'Department of the Treasury': ['tax', 'tariff', 'trade', 'economy', 'fiscal'],
    'Department of Health and Human Services': ['health', 'fda', 'medicare', 'vaccine', 'drug'],
    'Department of Homeland Security': ['immigration', 'border', 'deportation', 'wall', 'security'],
    'Environmental Protection Agency': ['environment', 'climate', 'epa', 'emission', 'energy'],
    'Department of the Interior': ['energy', 'oil', 'gas', 'drill', 'public land'],
    'Department of Agriculture': ['farm', 'agriculture', 'food', 'rural'],
    'Department of Commerce': ['trade', 'tariff', 'business', 'commerce'],
    'Department of Labor': ['worker', 'labor', 'union', 'wage', 'tip', 'overtime'],
    'Department of Transportation': ['infrastructure', 'transport', 'highway', 'aviation'],
    'Department of Energy': ['energy', 'oil', 'gas', 'climate', 'fossil', 'renewable'],
    'Department of Education': ['education', 'school', 'student', 'college'],
    'Department of Veterans Affairs': ['veteran', 'va', 'military'],
    'Department of Housing and Urban Development': ['housing', 'urban', 'homeless'],
  };
  
  const keywords = departmentKeywords[member.department] || [];
  const promiseText = promise.promise_text.toLowerCase();
  
  return keywords.some(keyword => promiseText.includes(keyword));
}

/**
 * Calculate alignment scores for relevant promises
 * Returns array of {promise_id, score, rationale}
 */
function calculateAlignmentScores(member: any): Array<{
  promise_id: number;
  score: number;
  confidence: 'low' | 'medium' | 'high';
  rationale: string;
}> {
  const scores: Array<any> = [];
  
  promisesData.promises.forEach(promise => {
    if (isPromiseRelevant(promise, member)) {
      // Calculate score based on policy positions and conflicts
      let score = 50; // Start neutral
      let rationale = '';
      
      // Check if member has relevant policy positions
      if (member.policy_positions) {
        const relevantPositions = member.policy_positions.filter((pos: any) =>
          promise.promise_text.toLowerCase().includes(pos.topic.toLowerCase()) ||
          promise.category.toLowerCase().includes(pos.topic.toLowerCase())
        );
        
        if (relevantPositions.length > 0) {
          // Assume alignment unless there are critical conflicts
          score = 70;
          rationale = `Policy positions align with ${promise.category} promises`;
        }
      }
      
      // Check conflicts of interest that might affect promise execution
      if (member.conflicts_of_interest) {
        const relevantConflicts = member.conflicts_of_interest.filter((conflict: any) =>
          promise.promise_text.toLowerCase().includes(conflict.category.toLowerCase()) ||
          conflict.description.toLowerCase().includes(promise.category.toLowerCase())
        );
        
        if (relevantConflicts.length > 0) {
          const hasCritical = relevantConflicts.some((c: any) => c.severity === 'critical');
          if (hasCritical) {
            score = -50;
            rationale = 'Critical conflicts of interest may prevent proper execution';
          } else {
            score = 30;
            rationale = 'Potential conflicts of interest present';
          }
        }
      }
      
      scores.push({
        promise_id: promise.id,
        score,
        confidence: 'medium',
        rationale: rationale || 'Based on department responsibilities',
      });
    }
  });
  
  return scores;
}

/**
 * Calculate overall alignment score from individual promise scores
 */
function calculateOverallAlignment(scores: Array<{ score: number }>): number {
  if (scores.length === 0) return 50; // Neutral if no data
  
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  return Math.round(total / scores.length);
}
