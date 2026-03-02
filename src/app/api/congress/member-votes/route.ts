import { NextRequest, NextResponse } from 'next/server';
import { getMemberVotes } from '@/lib/congress';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bioguideId = searchParams.get('bioguideId');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (!bioguideId) {
    return NextResponse.json(
      { success: false, error: 'bioguideId is required' },
      { status: 400 }
    );
  }

  try {
    const result = await getMemberVotes(bioguideId, limit, offset);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, votes: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in member-votes API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
