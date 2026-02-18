import { NextRequest, NextResponse } from 'next/server';
import { getAllMembers } from '@/lib/data';

const RATE_LIMIT = {
  unauthenticated: 100, // per hour
  authenticated: 1000,  // per hour
};

/**
 * GET /api/congress
 * List all Congress members with pagination
 * 
 * Query params:
 * - limit: number (default 20, max 100)
 * - offset: number (default 0)
 * - chamber: "house" | "senate"
 * - state: two-letter state code
 * - party: "D" | "R" | "I"
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  const chamber = searchParams.get('chamber');
  const state = searchParams.get('state');
  const party = searchParams.get('party');

  try {
    let members = getAllMembers();

    // Apply filters
    if (chamber) {
      members = members.filter(m => m.chamber === chamber);
    }
    if (state) {
      members = members.filter(m => m.state === state.toUpperCase());
    }
    if (party) {
      members = members.filter(m => m.party === party.toUpperCase());
    }

    const total = members.length;
    const paginatedMembers = members.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedMembers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    }, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT.unauthenticated.toString(),
        'X-RateLimit-Remaining': (RATE_LIMIT.unauthenticated - 1).toString(),
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
