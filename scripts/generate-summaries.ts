/**
 * Generate plain English summaries for all votes in key-votes.json
 * Uses Claude API to create concise, neutral summaries
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

interface Vote {
  id: string;
  bill: string;
  title: string;
  plainEnglishSummary?: string | null;
  description?: string;
  category?: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a non-partisan legislative analyst. Your job is to translate complex legislative titles into plain English summaries that ordinary voters can understand.

Guidelines:
- One sentence, under 20 words
- Neutral and factual (no partisan spin)
- Focus on what the bill actually does, not political theater
- Use simple, direct language
- Avoid jargon and legal terminology

Examples:
Input: "A joint resolution providing for congressional disapproval under chapter 8 of title 5, United States Code, of the rule submitted by the EPA relating to Extension of Deadlines..."
Output: "Voted to block EPA environmental regulations"

Input: "H.R. 1234: An Act to amend the Internal Revenue Code of 1986 to provide for tax-preferred savings accounts for education expenses..."
Output: "Created tax-free education savings accounts"

Input: "S. 567: A bill to provide for reconciliation pursuant to titles II and V of the concurrent resolution on the budget for fiscal year 2026..."
Output: "Raised the debt ceiling through 2026"`;

async function generateSummary(vote: Vote): Promise<string> {
  const prompt = `Legislative title: "${vote.title}"
${vote.description ? `Description: "${vote.description}"` : ''}
${vote.category ? `Category: ${vote.category}` : ''}

Generate a plain English summary (one sentence, <20 words):`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const summary = response.content[0].type === 'text' 
      ? response.content[0].text.trim() 
      : '';

    // Remove quotes if present
    return summary.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error(`Error generating summary for ${vote.id}:`, error);
    return '';
  }
}

async function main() {
  console.log('🚀 Generating plain English summaries for votes...\n');

  // Load key-votes.json
  const dataPath = path.join(process.cwd(), 'src', 'data', 'key-votes.json');
  const votes: Vote[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`📊 Found ${votes.length} votes to process\n`);

  // Filter votes that need summaries
  const votesToProcess = votes.filter(v => !v.plainEnglishSummary);
  console.log(`✏️  ${votesToProcess.length} votes need summaries\n`);

  if (votesToProcess.length === 0) {
    console.log('✅ All votes already have summaries!');
    return;
  }

  // Process in batches with rate limiting
  const batchSize = 5;
  let processed = 0;

  for (let i = 0; i < votesToProcess.length; i += batchSize) {
    const batch = votesToProcess.slice(i, i + batchSize);
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(votesToProcess.length / batchSize)}...`);

    // Generate summaries in parallel for batch
    const summaries = await Promise.all(
      batch.map(vote => generateSummary(vote))
    );

    // Update votes with summaries
    batch.forEach((vote, idx) => {
      const voteIndex = votes.findIndex(v => v.id === vote.id);
      if (voteIndex !== -1 && summaries[idx]) {
        votes[voteIndex].plainEnglishSummary = summaries[idx];
        processed++;
        console.log(`  ✓ ${vote.bill || vote.id}: "${summaries[idx]}"`);
      }
    });

    // Rate limiting: wait 1 second between batches
    if (i + batchSize < votesToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Save updated data
  fs.writeFileSync(dataPath, JSON.stringify(votes, null, 2));
  console.log(`\n✅ Generated ${processed} summaries and saved to ${dataPath}`);
}

main().catch(console.error);
