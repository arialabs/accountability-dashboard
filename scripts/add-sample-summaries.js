/**
 * Add sample plain English summaries to demonstrate the feature
 * This adds summaries for common vote patterns
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'key-votes.json');
const votes = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Manual summaries for specific patterns
const summaryRules = [
  {
    pattern: (v) => v.description?.includes('Medicaid') && v.description?.includes('rescind'),
    summary: 'Cut Medicaid and immigration enforcement funding'
  },
  {
    pattern: (v) => v.description?.includes('Consolidated Appropriations Act'),
    summary: 'Passed government funding bill'
  },
  {
    pattern: (v) => v.description?.includes('Department of Homeland Security Appropriations'),
    summary: 'Funded Department of Homeland Security'
  },
  {
    pattern: (v) => v.title?.includes('Cloture') && v.category === 'Economy & Taxes',
    summary: 'Advanced spending bill to final vote'
  },
  {
    pattern: (v) => v.title?.includes('Previous Question'),
    summary: 'Procedural vote to advance legislation'
  },
  {
    pattern: (v) => v.description?.includes('debt limit'),
    summary: 'Raised the national debt ceiling'
  },
  {
    pattern: (v) => v.description?.includes('tax relief') || v.description?.includes('Tax relief'),
    summary: 'Provided tax cuts'
  },
  {
    pattern: (v) => v.description?.includes('Affordable Care Act') && v.description?.includes('repeal'),
    summary: 'Attempted to repeal Obamacare'
  },
  {
    pattern: (v) => v.description?.includes('immigration') && v.description?.includes('border'),
    summary: 'Increased border security and immigration enforcement'
  },
  {
    pattern: (v) => v.description?.includes('climate') || v.description?.includes('environmental protection'),
    summary: 'Addressed climate change and environmental protections'
  },
  {
    pattern: (v) => v.description?.includes('minimum wage'),
    summary: 'Raised the federal minimum wage'
  },
  {
    pattern: (v) => v.description?.includes('gun') && v.description?.includes('background check'),
    summary: 'Expanded background checks for gun purchases'
  },
  {
    pattern: (v) => v.description?.includes('infrastructure'),
    summary: 'Funded infrastructure improvements'
  },
  {
    pattern: (v) => v.description?.includes('student loan'),
    summary: 'Addressed student loan debt'
  },
  {
    pattern: (v) => v.description?.includes('Medicare') && !v.description?.includes('Medicaid'),
    summary: 'Modified Medicare benefits or funding'
  },
  {
    pattern: (v) => v.description?.includes('Social Security'),
    summary: 'Changed Social Security program'
  },
  {
    pattern: (v) => v.description?.includes('veterans') || v.description?.includes('VA '),
    summary: 'Enhanced veterans benefits'
  },
  {
    pattern: (v) => v.description?.includes('defense authorization') || v.description?.includes('military spending'),
    summary: 'Authorized military spending'
  },
];

let updated = 0;

for (const vote of votes) {
  if (vote.plainEnglishSummary) continue; // Skip if already has summary
  
  for (const rule of summaryRules) {
    if (rule.pattern(vote)) {
      vote.plainEnglishSummary = rule.summary;
      updated++;
      console.log(`✓ ${vote.id}: "${rule.summary}"`);
      break;
    }
  }
}

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(votes, null, 2));
console.log(`\n✅ Added ${updated} plain English summaries`);
