#!/usr/bin/env node

/**
 * Fetch Senate member data from Congress.gov API
 * Adds Senate Class (I/II/III) and next election year
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.CONGRESS_API_KEY;
if (!API_KEY) {
  console.error('Error: CONGRESS_API_KEY environment variable not set');
  console.error('Run: source ~/.secrets && export CONGRESS_API_KEY=$(op read "op://Aria Labs/Congress.gov API Key/credential")');
  process.exit(1);
}

const MEMBERS_FILE = path.join(__dirname, '../src/data/members.json');
const CONGRESS_NUM = 119; // 119th Congress (2025-2027)

// Senate classes and their next election years
// Class I: 2024, 2030, 2036...
// Class II: 2026, 2032, 2038...
// Class III: 2028, 2034, 2040...
const SENATE_CLASSES = {
  'I': 2030,   // Next election after 2025
  'II': 2026,  // Next election
  'III': 2028  // Next election after 2025
};

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function fetchSenateMembers() {
  console.log('Fetching Senate members from Congress.gov API...');
  
  const url = `https://api.congress.gov/v3/member/congress/${CONGRESS_NUM}/senate?api_key=${API_KEY}&limit=250`;
  
  try {
    const response = await httpsGet(url);
    
    if (!response.members) {
      throw new Error('No members found in API response');
    }
    
    console.log(`✓ Fetched ${response.members.length} senators`);
    
    // Map senators with their class and next election
    const senatorData = {};
    
    for (const member of response.members) {
      const bioguideId = member.bioguideId;
      const terms = member.terms?.item || [];
      
      // Find current Senate term to get class
      const currentTerm = terms.find(t => 
        t.chamber === 'Senate' && 
        parseInt(t.congress) === CONGRESS_NUM
      );
      
      if (currentTerm) {
        const senateClass = currentTerm.stateRank?.replace('Class ', '').trim() || null;
        const nextElection = senateClass ? SENATE_CLASSES[senateClass] : null;
        
        senatorData[bioguideId] = {
          senateClass,
          nextElection,
          termStart: currentTerm.startYear,
          termEnd: currentTerm.endYear
        };
        
        console.log(`  ${member.name}: Class ${senateClass}, next election ${nextElection}`);
      }
    }
    
    return senatorData;
  } catch (error) {
    console.error('Error fetching Senate data:', error.message);
    throw error;
  }
}

async function updateMembersFile(senatorData) {
  console.log('\nUpdating members.json...');
  
  const members = JSON.parse(fs.readFileSync(MEMBERS_FILE, 'utf8'));
  let updatedCount = 0;
  
  for (const member of members) {
    if (member.chamber === 'senate' && senatorData[member.bioguide_id]) {
      const data = senatorData[member.bioguide_id];
      member.senate_class = data.senateClass;
      member.next_election = data.nextElection;
      updatedCount++;
    }
  }
  
  fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2));
  console.log(`✓ Updated ${updatedCount} senators with class and election data`);
}

async function main() {
  try {
    const senatorData = await fetchSenateMembers();
    await updateMembersFile(senatorData);
    console.log('\n✓ Senate data fetch complete!');
  } catch (error) {
    console.error('\n✗ Failed:', error.message);
    process.exit(1);
  }
}

main();
