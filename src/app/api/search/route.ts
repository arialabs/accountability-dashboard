import { NextRequest, NextResponse } from 'next/server';
import { getAllMembers, getAllScandals } from '@/lib/data';

/**
 * GET /api/search
 * Search across all data
 * 
 * Query params:
 * - q: search query (required)
 * - type: "members" | "scandals" | "all" (default: "all")
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'all';

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  const lowerQuery = query.toLowerCase();
  const results: any = {};

  try {
    // Search members
    if (type === 'all' || type === 'members') {
      const members = getAllMembers();
      results.members = members.filter(m =>
        m.full_name.toLowerCase().includes(lowerQuery) ||
        m.state.toLowerCase().includes(lowerQuery) ||
        m.bioguide_id.toLowerCase().includes(lowerQuery)
      ).slice(0, 20); // Limit results
    }

    // Search scandals
    if (type === 'all' || type === 'scandals') {
      const scandals = getAllScandals();
      results.scandals = scandals.filter(s =>
        s.title?.toLowerCase().includes(lowerQuery) ||
        s.description?.toLowerCase().includes(lowerQuery)
      ).slice(0, 20);
    }

    return NextResponse.json({
      query,
      results,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
