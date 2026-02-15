// Test improved vote-based scoring logic
const membersData = require('./src/data/members.json');
const keyVotesData = require('./src/data/key-votes.json');
const positionsData = require('./src/data/positions.json');

// Test subject: J000309 (Jonathan Jackson)
const testBioguide = 'J000309';

console.log('Testing IMPROVED vote-based scoring for', testBioguide);
console.log('='.repeat(70));

const member = membersData.find(m => m.bioguide_id === testBioguide);
const memberPositions = positionsData.members.find(m => m.bioguide_id === testBioguide);

const healthcarePos = memberPositions?.positions.find(p => 
  p.topic.toLowerCase().includes('obamacare') || p.topic.toLowerCase().includes('healthcare')
);

console.log('\n✅ Member:', member.full_name, '-', member.party);
console.log('✅ Stated Position:', healthcarePos?.stance, 'healthcare expansion');

const healthcareVotes = keyVotesData.filter(v => 
  v.category === 'Healthcare' && v.votes[testBioguide]
);

console.log('\n📊 Analyzing', healthcareVotes.length, 'Healthcare Votes...\n');

let progressiveVotes = 0;
let conservativeVotes = 0;
let unclearVotes = 0;

healthcareVotes.forEach(vote => {
  const memberVote = vote.votes[testBioguide];
  
  // Get party breakdown
  const yeaVoters = Object.keys(vote.votes).filter(id => vote.votes[id] === 'Yea');
  const nayVoters = Object.keys(vote.votes).filter(id => vote.votes[id] === 'Nay');
  
  const demYea = yeaVoters.filter(id => {
    const m = membersData.find(mem => mem.bioguide_id === id);
    return m?.party === 'D';
  }).length;
  
  const repYea = yeaVoters.filter(id => {
    const m = membersData.find(mem => mem.bioguide_id === id);
    return m?.party === 'R';
  }).length;
  
  const demNay = nayVoters.filter(id => {
    const m = membersData.find(mem => mem.bioguide_id === id);
    return m?.party === 'D';
  }).length;
  
  const repNay = nayVoters.filter(id => {
    const m = membersData.find(mem => mem.bioguide_id === id);
    return m?.party === 'R';
  }).length;
  
  const totalDem = demYea + demNay;
  const totalRep = repYea + repNay;
  const demYeaPct = demYea / totalDem;
  const repYeaPct = repYea / totalRep;
  
  // Determine progressive direction
  let progressiveDirection = 'unclear';
  const difference = demYeaPct - repYeaPct;
  
  if (totalDem >= 10 && totalRep >= 10) {
    if (difference > 0.25 && demYeaPct > 0.5) {
      progressiveDirection = 'yea';
    } else if (difference < -0.25 && demYeaPct < 0.5) {
      progressiveDirection = 'nay';
    } else if (demYeaPct > 0.75 && difference > 0.1) {
      progressiveDirection = 'yea';
    } else if (demYeaPct < 0.25 && difference < -0.1) {
      progressiveDirection = 'nay';
    }
  }
  
  // Score the vote
  let voteType = '❓ Unclear';
  if (progressiveDirection === 'yea' && memberVote === 'Yea') {
    progressiveVotes++;
    voteType = '✅ Progressive';
  } else if (progressiveDirection === 'nay' && memberVote === 'Nay') {
    progressiveVotes++;
    voteType = '✅ Progressive';
  } else if (progressiveDirection !== 'unclear') {
    conservativeVotes++;
    voteType = '❌ Conservative';
  } else {
    unclearVotes++;
  }
  
  console.log('━'.repeat(70));
  console.log('Bill:', vote.bill, '-', vote.title.substring(0, 40));
  console.log('Description:', vote.description.substring(0, 60));
  console.log('Member voted:', memberVote, '→', voteType);
  console.log('Party patterns:');
  console.log('  Dems:', (demYeaPct * 100).toFixed(0) + '% Yea');
  console.log('  Reps:', (repYeaPct * 100).toFixed(0) + '% Yea');
  console.log('  Progressive direction:', progressiveDirection.toUpperCase());
  console.log('  Difference:', (difference * 100).toFixed(0) + ' percentage points');
});

console.log('\n' + '='.repeat(70));
console.log('🎯 FINAL ANALYSIS:');
console.log('='.repeat(70));
console.log('\nStated Position:', healthcarePos?.stance);
console.log('Stated Intensity:', healthcarePos?.intensity + '/5');
console.log('\nVoting Record:');
console.log('  ✅ Progressive votes:', progressiveVotes);
console.log('  ❌ Conservative votes:', conservativeVotes);
console.log('  ❓ Unclear votes:', unclearVotes);

const scoredVotes = progressiveVotes + conservativeVotes;
if (scoredVotes > 0) {
  const score = Math.round((progressiveVotes / scoredVotes) * 100);
  console.log('\n📈 Progressive Voting Score:', score + '%');
  
  const supportsHealthcare = healthcarePos?.stance.toLowerCase().includes('support');
  
  if (supportsHealthcare && score >= 60) {
    console.log('✅ ALIGNED: Votes match stated support for healthcare');
  } else if (supportsHealthcare && score < 40) {
    console.log('⚠️  CONTRADICTION: Says supports but votes conservatively');
  } else if (!supportsHealthcare && score < 40) {
    console.log('✅ ALIGNED: Votes match stated opposition to healthcare expansion');
  } else if (!supportsHealthcare && score >= 60) {
    console.log('⚠️  CONTRADICTION: Says opposes but votes progressively');
  } else {
    console.log('⚠️  MIXED: Voting record is moderate/unclear');
  }
}
