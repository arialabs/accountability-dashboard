import { NextRequest, NextResponse } from 'next/server';
import { getExecutiveOfficials } from '@/lib/executive-data';

/**
 * GET /api/executive
 * List executive branch officials
 */
export async function GET(request: NextRequest) {
  try {
    const officials = getExecutiveOfficials();

    return NextResponse.json({
      data: officials,
    }, {
      headers: {
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
