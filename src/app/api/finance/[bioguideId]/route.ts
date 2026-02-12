/**
 * API Route: /api/finance/[bioguideId]
 * Fetches campaign finance data from OpenFEC for a given representative
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDonorBreakdown, searchCandidateByName, getCandidateFinancials } from '@/lib/fec';
import { getMember } from '@/lib/data';
import type { CampaignFinance } from '@/lib/types';

// Enable caching for 1 hour
export const revalidate = 3600;

export async function GET(
  request: NextRequest,
  { params }: { params: { bioguideId: string } }
) {
  const { bioguideId } = params;

  // Get member info to search FEC
  const member = getMember(bioguideId);
  
  if (!member) {
    return NextResponse.json(
      { error: 'Member not found' },
      { status: 404 }
    );
  }

  try {
    // Search for candidate by name
    const office = member.chamber === 'house' ? 'H' : 'S';
    const candidate = await searchCandidateByName(
      member.first_name,
      member.last_name,
      office
    );

    if (!candidate) {
      return NextResponse.json(
        { 
          error: 'No FEC candidate found',
          message: `Could not find FEC data for ${member.full_name}`
        },
        { status: 404 }
      );
    }

    // Get both donor breakdown and financial summary
    const [breakdown, financials] = await Promise.all([
      getDonorBreakdown(candidate.candidate_id),
      getCandidateFinancials(candidate.candidate_id),
    ]);

    if (!breakdown) {
      return NextResponse.json(
        { 
          error: 'No finance data available',
          message: `Finance data not available for ${member.full_name}`
        },
        { status: 404 }
      );
    }

    // Transform to our CampaignFinance format
    const finance: CampaignFinance = {
      candidate_id: candidate.candidate_id,
      cycle: breakdown.cycle,
      total_raised: breakdown.total_raised,
      total_spent: financials?.total_disbursements || 0,
      cash_on_hand: financials?.cash_on_hand || 0,
      individual_contributions: breakdown.individual_total,
      pac_contributions: breakdown.pac_total,
      party_contributions: financials?.party_contributions || 0,
      candidate_self_funding: financials?.candidate_contributions || 0,
      small_donors: breakdown.small_donor_total,
      large_donors: breakdown.large_donor_total,
      pac_percentage: breakdown.pac_percentage,
      small_donor_percentage: breakdown.small_donor_percentage,
      large_donor_percentage: breakdown.large_donor_percentage,
      top_contributors: breakdown.top_contributors,
      top_industries: [], // Would need OpenSecrets API for this
    };

    return NextResponse.json(finance, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });

  } catch (error) {
    console.error('Error fetching FEC data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch finance data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
