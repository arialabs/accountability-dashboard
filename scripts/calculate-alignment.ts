#!/usr/bin/env npx ts-node
/**
 * Calculate alignment scores between stated positions and actual votes
 * Maps position topics to vote categories and calculates how often members
 * vote consistently with their stated positions.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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

interface MemberPositions {
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

// Map position topics to vote categories
const TOPIC_TO_CATEGORY: Record<string, string[]> = {
  'Abortion is a woman\'s unrestricted right': ['Healthcare', 'Civil Rights'],
  'Expand ObamaCare': ['Healthcare'],
  'Privatize Social Security': ['Economy & Taxes'],
  'Vouchers for school choice': ['Education'],
  'Fight EPA regulatory over-reach': ['Climate & Environment'],
  'Drug use is immoral': ['Civil Rights', 'Healthcare'],
  'Allow churches to provide welfare': ['Government Ethics'],
  'More federal funding for health coverage': ['Healthcare'],
  'Stricter punishment reduces crime': ['Civil Rights', 'National Security'],
  'Absolute right to gun ownership': ['Civil Rights'],
  'Higher taxes on the wealthy': ['Economy & Taxes'],
  'Pathway to citizenship for illegal aliens': ['Immigration'],
  'Support & expand free trade': ['Economy & Taxes'],
  'Expand the military': ['National Security'],
  'Make voter registration easier': ['Voting Rights'],
};

// Determine expected vote based on stance and vote's public benefit
function getExpectedVote(stance: string, publicBenefit: string | undefined): 'Yea' | 'Nay' | null {
  // Stances: "Strongly Supports", "Supports", "Neutral", "Opposes", "Strongly Opposes"
  const isProgressive = stance.includes('Supports') || stance.includes('Favors');
  const isConservative = stance.includes('Opposes');
  
  if (!publicBenefit || publicBenefit === 'mixed') return null;
  
  // For votes that benefit the public, progressives vote Yea, conservatives vote Nay
  // This is a simplification - in reality it depends on the specific issue
  if (publicBenefit === 'positive') {
    return isProgressive ? 'Yea' : isConservative ? 'Nay' : null;
  } else {
    return isProgressive ? 'Nay' : isConservative ? 'Yea' : null;
  }
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
  const positionsData: { members: MemberPositions[] } = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'positions.json'), 'utf-8')
  );
  const votesData: Vote[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'key-votes.json'), 'utf-8')
  );

  const results: AlignmentResult[] = [];

  for (const member of positionsData.members) {
    const result: AlignmentResult = {
      bioguide_id: member.bioguide_id,
      name: member.name,
      total_votes_analyzed: 0,
      aligned_votes: 0,
      misaligned_votes: 0,
      alignment_score: 0,
      category_breakdown: {},
      notable_misalignments: [],
    };

    // For each position, find matching votes
    for (const position of member.positions) {
      const matchingCategories = TOPIC_TO_CATEGORY[position.topic];
      if (!matchingCategories) continue;

      // Find votes in matching categories
      const matchingVotes = votesData.filter(v => 
        matchingCategories.includes(v.category) &&
        v.votes[member.bioguide_id]
      );

      for (const vote of matchingVotes) {
        const actualVote = vote.votes[member.bioguide_id];
        if (!actualVote || actualVote === 'Not Voting') continue;

        const expectedVote = getExpectedVote(position.stance, vote.publicBenefit);
        if (!expectedVote) continue;

        result.total_votes_analyzed++;

        // Track by category
        if (!result.category_breakdown[vote.category]) {
          result.category_breakdown[vote.category] = { aligned: 0, total: 0, score: 0 };
        }
        result.category_breakdown[vote.category].total++;

        if (actualVote === expectedVote) {
          result.aligned_votes++;
          result.category_breakdown[vote.category].aligned++;
        } else {
          result.misaligned_votes++;
          
          // Track notable misalignments
          if (result.notable_misalignments.length < 5) {
            result.notable_misalignments.push({
              vote_id: vote.id,
              topic: position.topic,
              stated_stance: position.stance,
              actual_vote: actualVote,
              expected_vote: expectedVote,
            });
          }
        }
      }
    }

    // Calculate scores
    if (result.total_votes_analyzed > 0) {
      result.alignment_score = Math.round(
        (result.aligned_votes / result.total_votes_analyzed) * 100
      );
    }

    for (const cat of Object.keys(result.category_breakdown)) {
      const breakdown = result.category_breakdown[cat];
      breakdown.score = breakdown.total > 0 
        ? Math.round((breakdown.aligned / breakdown.total) * 100)
        : 0;
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
