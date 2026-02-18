#!/usr/bin/env tsx

/**
 * OnTheIssues.org Position Scraper
 * 
 * Scrapes politician positions from OnTheIssues.org for members of Congress.
 * Outputs structured data to src/data/positions.json
 * 
 * Usage:
 *   tsx scripts/scrape-positions.ts [--limit N] [--bioguide-id ID]
 */

import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { Member, MemberPositions, Position, PositionData } from '../src/lib/types';

// ==================== Configuration ====================

const RATE_LIMIT_MS = 2000; // 2 seconds between requests (polite scraping)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const STATE_ABBREV_MAP: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'
};

// ==================== Utilities ====================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeStance(stanceText: string): Position['stance'] {
  const normalized = stanceText.trim();
  if (normalized.includes('Strongly Favors') || normalized.includes('Strongly Supports')) {
    return 'Strongly Supports';
  }
  if (normalized.includes('Favors') || normalized.includes('Supports')) {
    return 'Supports';
  }
  if (normalized.includes('Strongly Opposes')) {
    return 'Strongly Opposes';
  }
  if (normalized.includes('Opposes')) {
    return 'Opposes';
  }
  return 'Neutral';
}

function stanceToIntensity(stance: Position['stance']): number {
  const map: Record<Position['stance'], number> = {
    'Strongly Opposes': 1,
    'Opposes': 2,
    'Neutral': 3,
    'Supports': 4,
    'Strongly Supports': 5,
  };
  return map[stance] || 3;
}

function extractBillNumbers(text: string): string[] {
  // Match patterns like HR123, S456, H.R. 123, S. 456
  const billPattern = /\b([HS]\.?R?\.?\s*\d+)\b/gi;
  const matches = text.match(billPattern) || [];
  return [...new Set(matches.map(m => m.replace(/\s+/g, '').toUpperCase()))];
}

function buildOnTheIssuesUrl(member: Member): string {
  const firstName = member.first_name.replace(/\s+/g, '_');
  const lastName = member.last_name.replace(/\s+/g, '_');
  const nameSlug = `${firstName}_${lastName}`;
  
  if (member.chamber === 'senate') {
    return `https://www.ontheissues.org/Senate/${nameSlug}.htm`;
  } else {
    const stateAbbrev = STATE_ABBREV_MAP[member.state] || member.state;
    return `https://www.ontheissues.org/${stateAbbrev}/${nameSlug}.htm`;
  }
}

// ==================== Scraper ====================

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AccountabilityDashboard/1.0; +https://github.com/arialabs/accountability-dashboard)',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Page not found: ${url}`);
        }
        if (response.status === 429) {
          console.warn(`Rate limited on ${url}, waiting ${RETRY_DELAY_MS}ms...`);
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.warn(`Attempt ${attempt}/${retries} failed for ${url}: ${error}`);
      await sleep(RETRY_DELAY_MS);
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

async function scrapeMemberPositions(member: Member): Promise<MemberPositions | null> {
  const url = buildOnTheIssuesUrl(member);
  console.log(`Scraping ${member.full_name} (${member.bioguide_id}): ${url}`);

  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    const positions: Position[] = [];

    // Find all position tables
    // OnTheIssues uses tables with specific structure for positions
    $('table').each((_, table) => {
      const $table = $(table);
      
      // Look for tables with stance information
      $table.find('tr').each((_, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        if (cells.length < 2) return;

        const $stanceCell = $(cells[0]);
        const $detailsCell = $(cells[1]);

        // Check if this row contains a stance (has bold text with position)
        const $stanceBold = $stanceCell.find('b').first();
        if ($stanceBold.length === 0) return;

        const stanceText = $stanceBold.text().trim();
        const stance = normalizeStance(stanceText);

        // Extract topic from link
        const $topicLink = $stanceCell.find('a[href*="VoteMatch"]').first();
        if ($topicLink.length === 0) return;

        const topic = $topicLink.text().trim();
        if (!topic) return;

        // Extract details and quotes from the details cell
        const quotes: string[] = [];
        const votes: string[] = [];

        // Get all text content from details cell
        $detailsCell.contents().each((_, node) => {
          const text = $(node).text().trim();
          if (!text || text.startsWith('topic')) return;

          // Extract quotes (longer statements)
          if (text.length > 20 && !text.match(/^(Rated|Voted)/)) {
            quotes.push(text);
          }

          // Extract bill numbers
          const bills = extractBillNumbers(text);
          votes.push(...bills);
        });

        // Only add position if we have meaningful data
        if (quotes.length > 0 || votes.length > 0) {
          positions.push({
            topic,
            stance,
            intensity: stanceToIntensity(stance),
            quotes: [...new Set(quotes)].slice(0, 5), // Max 5 quotes
            votes: [...new Set(votes)],
          });
        }
      });
    });

    // Deduplicate positions by topic (keep the one with most data)
    const positionsByTopic = new Map<string, Position>();
    positions.forEach(pos => {
      const existing = positionsByTopic.get(pos.topic);
      if (!existing || (pos.quotes.length + pos.votes.length) > (existing.quotes.length + existing.votes.length)) {
        positionsByTopic.set(pos.topic, pos);
      }
    });

    const uniquePositions = Array.from(positionsByTopic.values());

    if (uniquePositions.length === 0) {
      console.warn(`  ⚠ No positions found for ${member.full_name}`);
      return null;
    }

    console.log(`  ✓ Found ${uniquePositions.length} positions`);

    return {
      bioguide_id: member.bioguide_id,
      name: member.full_name,
      source: 'ontheissues',
      source_url: url,
      last_updated: new Date().toISOString(),
      positions: uniquePositions,
    };
  } catch (error) {
    console.error(`  ✗ Failed to scrape ${member.full_name}: ${error}`);
    return null;
  }
}

// ==================== Main ====================

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const bioguideArg = args.find(a => a.startsWith('--bioguide-id='));

  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;
  const bioguideFilter = bioguideArg ? bioguideArg.split('=')[1] : undefined;

  // Load members data
  const membersPath = join(__dirname, '../src/data/members.json');
  if (!existsSync(membersPath)) {
    console.error('Error: members.json not found. Run the members pipeline first.');
    process.exit(1);
  }

  const members: Member[] = JSON.parse(readFileSync(membersPath, 'utf-8'));
  console.log(`Loaded ${members.length} members from members.json`);

  // Filter members
  let targetMembers = members;

  if (bioguideFilter) {
    targetMembers = members.filter(m => m.bioguide_id === bioguideFilter);
    console.log(`Filtering to bioguide_id: ${bioguideFilter}`);
  } else {
    // Get ALL members
    const senators = members.filter(m => m.chamber === 'senate');
    const reps = members.filter(m => m.chamber === 'house');
    targetMembers = [...senators, ...reps];
    console.log(`Selected ${targetMembers.length} members (${senators.length} senators + ${reps.length} reps)`);
  }

  if (limit) {
    targetMembers = targetMembers.slice(0, limit);
    console.log(`Limited to ${limit} members`);
  }

  // Load existing positions and skip already-scraped members
  const outputPath = join(__dirname, '../src/data/positions.json');
  let existingPositions: MemberPositions[] = [];
  if (existsSync(outputPath)) {
    const existing: PositionData = JSON.parse(readFileSync(outputPath, 'utf-8'));
    existingPositions = existing.members || [];
    const existingIds = new Set(existingPositions.map(p => p.bioguide_id));
    const before = targetMembers.length;
    targetMembers = targetMembers.filter(m => !existingIds.has(m.bioguide_id));
    console.log(`Skipping ${before - targetMembers.length} already-scraped members, ${targetMembers.length} remaining`);
  }

  // Scrape positions
  const results: MemberPositions[] = [...existingPositions];
  let successCount = existingPositions.length;
  let failCount = 0;

  for (let i = 0; i < targetMembers.length; i++) {
    const member = targetMembers[i];
    console.log(`\n[${i + 1}/${targetMembers.length}] Processing ${member.full_name}...`);

    const memberPositions = await scrapeMemberPositions(member);
    
    if (memberPositions && memberPositions.positions.length >= 5) {
      results.push(memberPositions);
      successCount++;
      
      // Incremental save every 10 successful scrapes
      if (successCount % 10 === 0) {
        const incrementalOutput: PositionData = {
          members: results,
          generated_at: new Date().toISOString(),
          total_members: results.length,
          total_positions: results.reduce((sum, r) => sum + r.positions.length, 0),
        };
        writeFileSync(outputPath, JSON.stringify(incrementalOutput, null, 2), 'utf-8');
        console.log(`  💾 Saved checkpoint: ${results.length} members`);
      }
    } else {
      failCount++;
    }

    // Rate limiting
    if (i < targetMembers.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  // Calculate stats
  const totalPositions = results.reduce((sum, r) => sum + r.positions.length, 0);

  // Build output
  const output: PositionData = {
    members: results,
    generated_at: new Date().toISOString(),
    total_members: results.length,
    total_positions: totalPositions,
  };

  // Save to file
  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SCRAPING COMPLETE');
  console.log('='.repeat(60));
  console.log(`✓ Successfully scraped: ${successCount} members`);
  console.log(`✗ Failed or insufficient data: ${failCount} members`);
  console.log(`📊 Total positions collected: ${totalPositions}`);
  console.log(`📁 Output saved to: ${outputPath}`);
  console.log('='.repeat(60));

  // Validation check
  const membersWithEnoughPositions = results.filter(r => r.positions.length >= 5);
  if (membersWithEnoughPositions.length >= 50) {
    console.log('✅ ACCEPTANCE CRITERIA MET: 50+ members with 5+ positions each');
  } else {
    console.log(`⚠️  WARNING: Only ${membersWithEnoughPositions.length} members with 5+ positions (need 50)`);
  }
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
