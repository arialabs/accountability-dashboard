import { NextResponse } from 'next/server';
import promisesData from '@/data/presidential-promises.json';

/**
 * GET /api/promises
 * Returns presidential promises, optionally filtered by category or status
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    let promises = promisesData.promises;
    
    // Filter by category if specified
    if (category) {
      promises = promises.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by status if specified
    if (status) {
      promises = promises.filter(p => 
        p.status === status
      );
    }
    
    // Group by category for summary stats
    const categorySummary = promises.reduce((acc: any, promise) => {
      if (!acc[promise.category]) {
        acc[promise.category] = {
          category: promise.category,
          total: 0,
          pending: 0,
          in_progress: 0,
          achieved: 0,
          broken: 0,
          modified: 0,
        };
      }
      
      acc[promise.category].total++;
      acc[promise.category][promise.status]++;
      
      return acc;
    }, {});
    
    return NextResponse.json({
      president: promisesData.president,
      term: promisesData.term,
      promises,
      total: promises.length,
      category_summary: Object.values(categorySummary),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching promises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch presidential promises' },
      { status: 500 }
    );
  }
}
