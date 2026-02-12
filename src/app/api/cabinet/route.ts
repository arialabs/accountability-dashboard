import { NextResponse } from 'next/server';
import cabinetData from '@/data/cabinet.json';
import promisesData from '@/data/presidential-promises.json';

/**
 * GET /api/cabinet
 * Returns all cabinet members with basic alignment data
 */
export async function GET() {
  try {
    // TODO: Once we have a database, fetch from there
    // For now, return the JSON data with calculated stats
    
    const membersWithStats = cabinetData.members.map(member => {
      // Calculate basic alignment score based on conflicts and policy positions
      // This is a placeholder - real implementation would use database
      const alignmentScore = calculateBasicAlignment(member);
      
      return {
        ...member,
        stats: {
          overall_alignment_score: alignmentScore,
          total_actions: 0, // TODO: count from database
          recent_actions_30d: 0,
          promises_aligned: 0,
          promises_conflicted: 0,
        }
      };
    });

    return NextResponse.json({
      members: membersWithStats,
      total: membersWithStats.length,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching cabinet members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cabinet members' },
      { status: 500 }
    );
  }
}

/**
 * Basic alignment calculation based on conflicts of interest
 * Returns a score from 0-100
 */
function calculateBasicAlignment(member: any): number {
  let score = 100;
  
  // Deduct points for conflicts of interest
  if (member.conflicts_of_interest) {
    member.conflicts_of_interest.forEach((conflict: any) => {
      switch (conflict.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
  }
  
  // Ensure score stays within 0-100
  return Math.max(0, Math.min(100, score));
}
