#!/usr/bin/env npx ts-node
/**
 * Calculate alignment scores between stated positions and actual votes
 * Maps position topics to vote categories and calculates how often members
 * vote consistently with their stated positions.
 * 
 * Uses lib/alignment.ts as the single source of truth for alignment logic.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { calculateMemberAlignment, isVoteAligned, getRelevantCategories } from '../src/lib/alignment.js';
import type { MemberPositions, Position as LibPosition } from '../src/lib/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../src/data');

interface Position {
  topic: string;
  stance: string;
  intensity: number;
  quotes: string[];
  votes: string[];
}

interface MemberPositionsFile {
  bioguide_id: string;
  name: string;
  source: string;
  source_url: string;
  last_updated: string;
  positions: Position[];
}

interface Vote {
  id: string;
  congress: number;
  chamber: string;
  rollnumber: number;
  date: string;
  bill: string;
  title: string;
  description: string;
  category: string;
  yea_count: number;
  nay_count: number;
  result: string;
  votes: Record<string, string>;
  publicBenefit?: 'positive' | 'negative' | 'mixed';
}

interface AlignmentResult {
  bioguide_id: string;
  name: string;
  total_votes_analyzed: number;
  aligned_votes: number;
  misaligned_votes: number;
  alignment_score: number;
  category_breakdown: Record<string, { aligned: number; total: number; score: number }>;
  notable_misalignments: Array<{
    vote_id: string;
    topic: string;
    stated_stance: string;
    actual_vote: string;
    expected_vote: string;
  }>;
}

function calculateAlignment(): AlignmentResult[] {
  // Load data
  const positionsData: { members: MemberPositionsFile[] } = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'positions.json'), 'utf-8')
  );
  const votesData: Vote[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'key-votes.json'), 'utf-8')
  );

  const results: AlignmentResult[] = [];

  for (const member of positionsData.members) {
    // Convert to MemberPositions type for lib/alignment.ts
    const memberPositions: MemberPositions = {
      bioguide_id: member.bioguide_id,
      name: member.name,
      source: member.source,
      source_url: member.source_url,
      last_updated: member.last_updated,
      positions: member.positions as LibPosition[],
    };

    // Prepare key votes in the format expected by calculateMemberAlignment
    const keyVotes = votesData.map(v => ({
      category: v.category,
      publicBenefit: v.publicBenefit || 'positive',
      votes: v.votes,
      date: v.date,
    }));

    // Use the lib/alignment.ts function (single source of truth!)
    const alignmentSummary = calculateMemberAlignment(memberPositions, keyVotes);

    // Convert to the AlignmentResult format for the JSON file
    const result: AlignmentResult = {
      bioguide_id: member.bioguide_id,
      name: member.name,
      total_votes_analyzed: 0,
      aligned_votes: 0,
      misaligned_votes: 0,
      alignment_score: alignmentSummary.overallAlignmentScore || 0,
      category_breakdown: {},
      notable_misalignments: [],
    };

    // Calculate totals from results
    for (const positionResult of alignmentSummary.results) {
      result.aligned_votes += positionResult.alignedVotes;
      result.misaligned_votes += positionResult.opposedVotes;
    }
    result.total_votes_analyzed = result.aligned_votes + result.misaligned_votes;

    // Build category breakdown
    for (const [category, score] of Object.entries(alignmentSummary.categoryScores)) {
      // Count aligned and total votes for this category
      let aligned = 0;
      let total = 0;
      
      for (const positionResult of alignmentSummary.results) {
        const categories = getRelevantCategories(positionResult.position.topic);
        if (categories.includes(category)) {
          aligned += positionResult.alignedVotes;
          total += positionResult.alignedVotes + positionResult.opposedVotes;
        }
      }

      if (total > 0) {
        result.category_breakdown[category] = {
          aligned,
          total,
          score,
        };
      }
    }

    // Track notable misalignments (positions where they voted opposite)
    for (const positionResult of alignmentSummary.results) {
      if (positionResult.opposedVotes > 0 && result.notable_misalignments.length < 5) {
        // Find a specific vote where they misaligned
        const relevantCategories = getRelevantCategories(positionResult.position.topic);
        const misalignedVote = votesData.find(v => {
          if (!relevantCategories.includes(v.category)) return false;
          if (!v.votes[member.bioguide_id]) return false;
          
          const actualVote = v.votes[member.bioguide_id];
          if (actualVote === 'Not Voting') return false;
          
          const alignment = isVoteAligned(
            positionResult.position.stance,
            actualVote,
            v.publicBenefit || 'positive'
          );
          
          return alignment === false; // Explicitly misaligned
        });

        if (misalignedVote) {
          const actualVote = misalignedVote.votes[member.bioguide_id];
          // Determine expected vote
          const isProgressive = positionResult.position.stance.toLowerCase().includes('supports') ||
                                positionResult.position.stance.toLowerCase().includes('favors');
          const isConservative = positionResult.position.stance.toLowerCase().includes('opposes');
          const billIsProgressive = misalignedVote.publicBenefit === 'positive';
          
          let expectedVote: string;
          if (isProgressive) {
            expectedVote = billIsProgressive ? 'Yea' : 'Nay';
          } else if (isConservative) {
            expectedVote = billIsProgressive ? 'Nay' : 'Yea';
          } else {
            expectedVote = 'Unknown';
          }

          result.notable_misalignments.push({
            vote_id: misalignedVote.id,
            topic: positionResult.position.topic,
            stated_stance: positionResult.position.stance,
            actual_vote: actualVote,
            expected_vote: expectedVote,
          });
        }
      }
    }

    // Only include members with analyzed votes
    if (result.total_votes_analyzed > 0) {
      results.push(result);
    }
  }

  // Sort by alignment score
  results.sort((a, b) => b.alignment_score - a.alignment_score);

  return results;
}

// Run and save results
const results = calculateAlignment();

// Save full results
fs.writeFileSync(
  path.join(DATA_DIR, 'alignment-scores.json'),
  JSON.stringify(results, null, 2)
);

// Create summary for easy display
const summary = results.map(r => ({
  bioguide_id: r.bioguide_id,
  name: r.name,
  alignment_score: r.alignment_score,
  votes_analyzed: r.total_votes_analyzed,
}));

fs.writeFileSync(
  path.join(DATA_DIR, 'alignment-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log(`Calculated alignment for ${results.length} members`);
console.log(`\nTop 10 Most Aligned:`);
results.slice(0, 10).forEach((r, i) => {
  console.log(`${i + 1}. ${r.name}: ${r.alignment_score}% (${r.total_votes_analyzed} votes)`);
});

console.log(`\nBottom 10 Least Aligned:`);
results.slice(-10).reverse().forEach((r, i) => {
  console.log(`${i + 1}. ${r.name}: ${r.alignment_score}% (${r.total_votes_analyzed} votes)`);
});
