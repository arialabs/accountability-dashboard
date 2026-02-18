import { NextRequest, NextResponse } from 'next/server';
import { getAllScandals } from '@/lib/data';

/**
 * GET /api/scandals
 * List all scandals with filtering
 * 
 * Query params:
 * - limit: number (default 20, max 100)
 * - offset: number (default 0)
 * - severity: "high" | "medium" | "low"
 * - member_id: bioguide_id to filter by member
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');
  const severity = searchParams.get('severity');
  const memberId = searchParams.get('member_id');

  try {
    let scandals = getAllScandals();

    // Apply filters
    if (severity) {
      scandals = scandals.filter(s => s.severity === severity);
    }
    if (memberId) {
      scandals = scandals.filter(s => 
        s.involved_members?.includes(memberId)
      );
    }

    const total = scandals.length;
    const paginatedScandals = scandals.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedScandals,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
