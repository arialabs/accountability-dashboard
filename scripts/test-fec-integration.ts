/**
 * Test script for OpenFEC API integration
 * Run with: FEC_API_KEY=<your-key> tsx scripts/test-fec-integration.ts
 * Or: source .env.local && tsx scripts/test-fec-integration.ts
 */

import { searchCandidateByName, getCandidateFinancials, getDonorBreakdown } from '../src/lib/fec';
import { getMember } from '../src/lib/data';

async function testFECIntegration() {
  console.log('🧪 Testing OpenFEC API Integration\n');

  // Test with a well-known representative
  const bioguideId = 'P000197'; // Nancy Pelosi
  const member = getMember(bioguideId);

  if (!member) {
    console.error('❌ Could not find member');
    process.exit(1);
  }

  console.log(`Testing with: ${member.full_name} (${member.party}-${member.state})`);
  console.log(`Chamber: ${member.chamber}\n`);

  try {
    // Step 1: Search for candidate
    console.log('Step 1: Searching for FEC candidate...');
    const office = member.chamber === 'house' ? 'H' : 'S';
    const candidate = await searchCandidateByName(
      member.first_name,
      member.last_name,
      office as 'H' | 'S'
    );

    if (!candidate) {
      console.error('❌ No FEC candidate found');
      process.exit(1);
    }

    console.log(`✅ Found candidate: ${candidate.candidate_id}`);
    console.log(`   Name: ${candidate.name}`);
    console.log(`   Party: ${candidate.party}`);
    console.log(`   Election years: ${candidate.election_years.join(', ')}\n`);

    // Step 2: Get financial summary
    console.log('Step 2: Fetching financial summary...');
    const financials = await getCandidateFinancials(candidate.candidate_id);

    if (!financials) {
      console.error('❌ No financial data found');
      process.exit(1);
    }

    console.log(`✅ Financial Summary (${financials.cycle} cycle):`);
    console.log(`   Total receipts: $${financials.total_receipts.toLocaleString()}`);
    console.log(`   Total disbursements: $${financials.total_disbursements.toLocaleString()}`);
    console.log(`   Cash on hand: $${financials.cash_on_hand.toLocaleString()}`);
    console.log(`   Individual contributions: $${financials.individual_contributions.toLocaleString()}`);
    console.log(`   PAC contributions: $${financials.pac_contributions.toLocaleString()}\n`);

    // Step 3: Get donor breakdown
    console.log('Step 3: Fetching donor breakdown...');
    const breakdown = await getDonorBreakdown(candidate.candidate_id);

    if (!breakdown) {
      console.error('❌ No donor breakdown found');
      process.exit(1);
    }

    console.log(`✅ Donor Breakdown:`);
    console.log(`   PAC percentage: ${breakdown.pac_percentage.toFixed(1)}%`);
    console.log(`   Small donor percentage: ${breakdown.small_donor_percentage.toFixed(1)}%`);
    console.log(`   Large donor percentage: ${breakdown.large_donor_percentage.toFixed(1)}%`);
    console.log(`\n   Top Contributors:`);
    
    breakdown.top_contributors.slice(0, 5).forEach((contrib, i) => {
      console.log(`   ${i + 1}. ${contrib.name} - $${contrib.total.toLocaleString()} (${contrib.type})`);
    });

    console.log('\n✅ All tests passed! OpenFEC integration is working correctly.');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during testing:');
    console.error(error);
    process.exit(1);
  }
}

testFECIntegration();
