#!/usr/bin/env tsx
/**
 * Generate AI summaries for all bills in key-votes.json
 * This script can be run periodically to update summaries
 */

import fs from 'fs/promises';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const VOTES_FILE = path.join(process.cwd(), 'src', 'data', 'key-votes.json');
const CACHE_DIR = path.join(process.cwd(), 'data', 'bill-summaries');
const CACHE_FILE = path.join(CACHE_DIR, 'summaries.json');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface KeyVote {
  id: string;
  bill: string;
  title: string;
  description: string;
  category: string;
}

interface BillSummary {
  billId: string;
  summary: string;
  impactTags: string[];
  generatedAt: string;
}

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

function determineImpactTags(description: string, category?: string): string[] {
  const tags = new Set<string>();
  const lowerDesc = description.toLowerCase();

  if (category && category !== 'Other') {
    tags.add(category);
  }

  for (const [tag, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) {
        tags.add(tag);
        break;
      }
    }
  }

  return Array.from(tags).slice(0, 3);
}

async function generateSummary(vote: KeyVote): Promise<BillSummary> {
  const prompt = `You are helping citizens understand congressional bills. 

Bill: ${vote.bill}
Title: ${vote.title}
Full Description: ${vote.description}

Please provide a clear, 2-3 sentence plain-English summary that:
1. Explains what this bill actually does in simple terms
2. Mentions who would be affected (working families, businesses, specific groups)
3. Avoids jargon and legislative language

Keep it neutral and factual. Make it understandable to someone with no legal background.`;

  try {
    console.log(`Generating summary for ${vote.bill}...`);
    
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
      : vote.description;

    const impactTags = determineImpactTags(vote.description, vote.category);

    return {
      billId: vote.id,
      summary: summaryText,
      impactTags,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error generating summary for ${vote.bill}:`, error);
    return {
      billId: vote.id,
      summary: vote.description.substring(0, 200) + (vote.description.length > 200 ? '...' : ''),
      impactTags: determineImpactTags(vote.description, vote.category),
      generatedAt: new Date().toISOString(),
    };
  }
}

async function loadCache(): Promise<Record<string, BillSummary>> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveCache(cache: Record<string, BillSummary>): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

async function main() {
  console.log('📊 Loading key votes...');
  const votesData = await fs.readFile(VOTES_FILE, 'utf-8');
  const votes: KeyVote[] = JSON.parse(votesData);
  
  console.log(`Found ${votes.length} votes`);

  console.log('💾 Loading existing cache...');
  const cache = await loadCache();
  const existingCount = Object.keys(cache).length;
  console.log(`Found ${existingCount} existing summaries`);

  // Filter votes that need summaries
  const votesNeedingSummaries = votes.filter(v => !cache[v.id]);
  console.log(`${votesNeedingSummaries.length} votes need summaries`);

  if (votesNeedingSummaries.length === 0) {
    console.log('✅ All votes already have summaries!');
    return;
  }

  // Generate summaries (with rate limiting)
  let generated = 0;
  for (const vote of votesNeedingSummaries.slice(0, 10)) { // Start with 10 for testing
    try {
      const summary = await generateSummary(vote);
      cache[vote.id] = summary;
      generated++;
      
      // Rate limit: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to generate summary for ${vote.bill}:`, error);
    }
  }

  console.log(`\n💾 Saving ${generated} new summaries...`);
  await saveCache(cache);
  
  console.log('✅ Done!');
  console.log(`Total summaries in cache: ${Object.keys(cache).length}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
