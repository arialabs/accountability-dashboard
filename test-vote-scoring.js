// Quick test of vote-based scoring logic
const membersData = require('./src/data/members.json');
const keyVotesData = require('./src/data/key-votes.json');
const positionsData = require('./src/data/positions.json');

// Test subject: J000309 (Jonathan Jackson)
const testBioguide = 'J000309';

console.log('Testing vote-based scoring for', testBioguide);
console.log('='.repeat(60));

// Find member
const member = membersData.find(m => m.bioguide_id === testBioguide);
console.log('\n✓ Member found:', member.full_name, '-', member.party);

// Find positions
const memberPositions = positionsData.members.find(m => m.bioguide_id === testBioguide);
console.log('✓ Positions found:', memberPositions?.positions.length || 0);

// Find healthcare position
const healthcarePos = memberPositions?.positions.find(p => 
  p.topic.toLowerCase().includes('obamacare') || p.topic.toLowerCase().includes('healthcare')
);
if (healthcarePos) {
  console.log('\n📋 STATED POSITION on Healthcare:');
  console.log('   Topic:', healthcarePos.topic);
  console.log('   Stance:', healthcarePos.stance);
  console.log('   Intensity:', healthcarePos.intensity, '/5');
}

// Find healthcare votes
const healthcareVotes = keyVotesData.filter(v => 
  v.category === 'Healthcare' && v.votes[testBioguide]
);
console.log('\n🗳️  ACTUAL VOTING RECORD on Healthcare:');
console.log('   Total healthcare votes:', healthcareVotes.length);

// Analyze voting patterns
let yeaVotes = 0, nayVotes = 0, abstentions = 0;
healthcareVotes.forEach(vote => {
  const memberVote = vote.votes[testBioguide];
  if (memberVote === 'Yea') yeaVotes++;
  else if (memberVote === 'Nay') nayVotes++;
  else abstentions++;
});

console.log('   Yea:', yeaVotes);
console.log('   Nay:', nayVotes);
console.log('   Abstentions:', abstentions);

// Sample votes
console.log('\n📊 Sample Healthcare Votes:');
healthcareVotes.slice(0, 5).forEach(vote => {
  const memberVote = vote.votes[testBioguide];
  
  // Calculate party breakdown
  const yeaCount = Object.entries(vote.votes).filter(([id, v]) => {
    const m = membersData.find(mem => mem.bioguide_id === id);
    return v === 'Yea' && m?.party === 'D';
  }).length;
  
  const nayCount = Object.entries(vote.votes).filter(([id, v]) => {
    const m = membersData.find(mem => mem.bioguide_id === id);
    return v === 'Nay' && m?.party === 'D';
  }).length;
  
  const demYeaPct = yeaCount / (yeaCount + nayCount) * 100;
  
  console.log('\n   Bill:', vote.bill);
  console.log('   Description:', vote.description.substring(0, 60) + '...');
  console.log('   Member voted:', memberVote);
  console.log('   Dem Yea support:', demYeaPct.toFixed(0) + '%');
  console.log('   Result:', vote.result);
});

console.log('\n' + '='.repeat(60));
console.log('🎯 ANALYSIS:');
console.log('   Stated: "' + (healthcarePos?.stance || 'No position') + '"');
console.log('   Voting: Yea ' + yeaVotes + ' times, Nay ' + nayVotes + ' times');

// Simple contradiction detection
if (healthcarePos) {
  const supportsHealthcare = healthcarePos.stance.toLowerCase().includes('support');
  const votingScore = (yeaVotes / (yeaVotes + nayVotes)) * 100;
  
  console.log('   Voting score:', votingScore.toFixed(0) + '% Yea');
  
  if (supportsHealthcare && nayVotes > yeaVotes) {
    console.log('   ⚠️  CONTRADICTION: Says supports but votes against more often');
  } else if (!supportsHealthcare && yeaVotes > nayVotes) {
    console.log('   ⚠️  CONTRADICTION: Says opposes but votes for more often');
  } else {
    console.log('   ✓ Aligned: Voting matches stated position');
  }
}
