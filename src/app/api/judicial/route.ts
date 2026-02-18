import { NextRequest, NextResponse } from 'next/server';
import { getSupremeCourtJustices } from '@/lib/data';

/**
 * GET /api/judicial
 * List Supreme Court justices
 */
export async function GET(request: NextRequest) {
  try {
    const justices = getSupremeCourtJustices();

    return NextResponse.json({
      data: justices,
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
