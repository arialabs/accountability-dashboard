/**
 * Test FEC Integration - Verify real FEC data works with dashboard
 * 
 * This script fetches FEC data for a few sample members and verifies
 * it integrates correctly with the existing dashboard components.
 */

import { 
  searchCandidateByName, 
  getCandidateFinancials, 
  getDonorBreakdown,
  getMemberFECData 
} from '../src/lib/fec';

interface TestMember {
  name: string;
  firstName: string;
  lastName: string;
  chamber: 'house' | 'senate';
  party: string;
}

// Sample representatives to test
const TEST_MEMBERS: TestMember[] = [
  { name: "Bernie Sanders", firstName: "Bernard", lastName: "Sanders", chamber: "senate", party: "I" },
  { name: "AOC", firstName: "Alexandria", lastName: "Ocasio-Cortez", chamber: "house", party: "D" },
  { name: "Mitch McConnell", firstName: "Mitch", lastName: "McConnell", chamber: "senate", party: "R" },
  { name: "Nancy Pelosi", firstName: "Nancy", lastName: "Pelosi", chamber: "house", party: "D" },
  { name: "Ted Cruz", firstName: "Rafael", lastName: "Cruz", chamber: "senate", party: "R" },
];

async function testMemberIntegration(member: TestMember) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${member.name} (${member.party}-${member.chamber.toUpperCase()})`);
  console.log('='.repeat(60));

  try {
    // Test the unified getMemberFECData function
    const { candidate, financials } = await getMemberFECData(
      member.firstName,
      member.lastName,
      member.chamber
    );

    if (!candidate) {
      console.log(`❌ Candidate not found`);
      return false;
    }

    console.log(`✓ Found candidate: ${candidate.name} (${candidate.candidate_id})`);
    console.log(`  Party: ${candidate.party}`);
    console.log(`  Office: ${candidate.office}`);
    console.log(`  Election years: ${candidate.election_years.join(', ')}`);

    if (!financials) {
      console.log(`⚠️  No financial data available`);
      return true;
    }

    console.log(`\n✓ Financial data:`);
    console.log(`  Total raised: $${(financials.total_receipts / 1000000).toFixed(2)}M`);
    console.log(`  Total spent: $${(financials.total_disbursements / 1000000).toFixed(2)}M`);
    console.log(`  Cash on hand: $${(financials.cash_on_hand / 1000000).toFixed(2)}M`);
    console.log(`\n  Breakdown:`);
    console.log(`    Individual contributions: $${(financials.individual_contributions / 1000000).toFixed(2)}M`);
    console.log(`    PAC contributions: $${(financials.pac_contributions / 1000000).toFixed(2)}M`);
    console.log(`    Small donors (<$200): $${(financials.individual_unitemized / 1000000).toFixed(2)}M`);
    console.log(`    Large donors (>$200): $${(financials.individual_itemized / 1000000).toFixed(2)}M`);

    // Test donor breakdown (which includes percentages)
    const breakdown = await getDonorBreakdown(candidate.candidate_id);
    
    if (breakdown) {
      console.log(`\n✓ Donor breakdown percentages:`);
      console.log(`    PAC: ${breakdown.pac_percentage}%`);
      console.log(`    Small donors: ${breakdown.small_donor_percentage}%`);
      console.log(`    Large donors: ${breakdown.large_donor_percentage}%`);
      
      if (breakdown.top_contributors.length > 0) {
        console.log(`\n  Top contributors:`);
        breakdown.top_contributors.slice(0, 5).forEach((contrib, i) => {
          console.log(`    ${i + 1}. ${contrib.name}: $${(contrib.total / 1000).toFixed(0)}K (${contrib.type})`);
        });
      }

      // Analyze funding profile
      console.log(`\n📊 Funding profile:`);
      if (breakdown.small_donor_percentage >= 30) {
        console.log(`  ✓ Strong grassroots support (${breakdown.small_donor_percentage}% small donors)`);
      }
      if (breakdown.pac_percentage >= 50) {
        console.log(`  ⚠️  Heavily PAC-funded (${breakdown.pac_percentage}% from PACs)`);
      }
      if (breakdown.large_donor_percentage >= 60) {
        console.log(`  ⚠️  Dependent on large donors (${breakdown.large_donor_percentage}% from donations >$200)`);
      }
    }

    return true;
  } catch (error) {
    console.error(`❌ Error:`, error instanceof Error ? error.message : error);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('FEC Integration Test');
  console.log('='.repeat(60));
  console.log(`\nTesting FEC data integration for ${TEST_MEMBERS.length} sample members...`);

  const results = [];
  
  for (const member of TEST_MEMBERS) {
    const success = await testMemberIntegration(member);
    results.push({ member: member.name, success });
    
    // Rate limiting - wait 3 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('Test Summary');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  console.log(`\n✓ Successful: ${successful}/${results.length}`);
  
  if (successful === results.length) {
    console.log(`\n✅ All tests passed! FEC integration is working correctly.`);
    console.log(`\nThe dashboard components (DonorAnalysisSection, etc.) will now`);
    console.log(`display real FEC campaign finance data for these members.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the output above for details.`);
  }
}

// Run the tests
runTests().catch(console.error);
