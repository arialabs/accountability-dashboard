import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'data', 'bill-summaries');
const CACHE_FILE = path.join(CACHE_DIR, 'summaries.json');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Category keywords for impact classification
const CATEGORY_KEYWORDS = {
  'Healthcare': ['health', 'medicare', 'medicaid', 'hospital', 'insurance', 'medical'],
  'Economy & Taxes': ['tax', 'economy', 'budget', 'finance', 'fiscal', 'revenue', 'spending'],
  'Environment': ['climate', 'environment', 'energy', 'carbon', 'emission', 'renewable'],
  'Education': ['education', 'school', 'student', 'university', 'college'],
  'Immigration': ['immigration', 'border', 'visa', 'citizenship', 'refugee'],
  'Defense': ['military', 'defense', 'veteran', 'armed forces', 'security'],
  'Civil Rights': ['rights', 'discrimination', 'equality', 'voting', 'justice'],
  'Transportation': ['transportation', 'infrastructure', 'highway', 'transit'],
};

interface BillSummary {
  billId: string;
  summary: string;
  impactTags: string[];
  generatedAt: string;
}

interface SummaryCache {
  [billId: string]: BillSummary;
}

/**
 * Load summaries from cache
 */
async function loadCache(): Promise<SummaryCache> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

/**
 * Save summaries to cache
 */
async function saveCache(cache: SummaryCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

/**
 * Determine impact tags based on bill description
 */
function determineImpactTags(description: string, category?: string): string[] {
  const tags = new Set<string>();
  const lowerDesc = description.toLowerCase();

  // Add category as a tag if provided
  if (category && category !== 'Other') {
    tags.add(category);
  }

  // Check for keyword matches
  for (const [tag, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        tags.add(tag);
        break;
      }
    }
  }

  // Return up to 3 tags
  return Array.from(tags).slice(0, 3);
}

/**
 * Generate AI summary using Claude
 */
async function generateSummary(
  billId: string,
  title: string,
  description: string,
  category?: string
): Promise<BillSummary> {
  const prompt = `You are helping citizens understand congressional bills. 

Bill: ${billId}
Title: ${title}
Full Description: ${description}

Please provide a clear, 2-3 sentence plain-English summary that:
1. Explains what this bill actually does in simple terms
2. Mentions who would be affected (working families, businesses, specific groups)
3. Avoids jargon and legislative language

Keep it neutral and factual. Make it understandable to someone with no legal background.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const summaryText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : description;

    const impactTags = determineImpactTags(description, category);

    return {
      billId,
      summary: summaryText,
      impactTags,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    // Fallback to shortened description
    return {
      billId,
      summary: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
      impactTags: determineImpactTags(description, category),
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * POST /api/bills/summary
 * Generate or retrieve a bill summary
 * Body: { billId, title, description, category? }
 */
export async function POST(request: NextRequest) {
  try {
    const { billId, title, description, category } = await request.json();

    if (!billId || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: billId, title, description' },
        { status: 400 }
      );
    }

    // Check cache first
    const cache = await loadCache();
    
    if (cache[billId]) {
      return NextResponse.json(cache[billId]);
    }

    // Generate new summary
    const summary = await generateSummary(billId, title, description, category);

    // Save to cache
    cache[billId] = summary;
    await saveCache(cache);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error in bill summary API:', error);
    return NextResponse.json(
      { error: 'Failed to generate bill summary' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bills/summary?billId=xxx
 * Retrieve a cached bill summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const billId = searchParams.get('billId');

    if (!billId) {
      return NextResponse.json(
        { error: 'Missing billId parameter' },
        { status: 400 }
      );
    }

    const cache = await loadCache();
    
    if (cache[billId]) {
      return NextResponse.json(cache[billId]);
    }

    return NextResponse.json(
      { error: 'Summary not found in cache' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error retrieving bill summary:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bill summary' },
      { status: 500 }
    );
  }
}
