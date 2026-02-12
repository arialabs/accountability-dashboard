/**
 * Bill tracking utilities
 * Aggregates vote data by bill to show progression through Congress
 */

import keyVotesData from "../data/key-votes.json";
import type { Bill, BillVote, BillStatus } from "./types";

// Cache for processed bills
let _bills: Bill[] | null = null;

/**
 * Determine bill status based on vote history
 */
function determineBillStatus(
  houseVotes: BillVote[],
  senateVotes: BillVote[],
  passedHouse: boolean,
  passedSenate: boolean
): BillStatus {
  const hasHouseVote = houseVotes.length > 0;
  const hasSenateVote = senateVotes.length > 0;
  
  // Both chambers passed
  if (passedHouse && passedSenate) {
    return "passed_both";
  }
  
  // At least one chamber passed
  if (passedHouse || passedSenate) {
    return "passed_chamber";
  }
  
  // Has floor vote in either chamber
  if (hasHouseVote || hasSenateVote) {
    // Check if any vote failed
    const anyFailed = [...houseVotes, ...senateVotes].some(v => v.result === "Failed");
    if (anyFailed) {
      return "failed";
    }
    return "floor_vote";
  }
  
  // Default to committee stage (though we don't have explicit committee data)
  return "committee";
}

/**
 * Process raw vote data into bill records
 */
function processBills(): Bill[] {
  const votesData = (keyVotesData as unknown) as Array<{
    id: string;
    congress: number;
    chamber: "House" | "Senate";
    rollnumber: number;
    date: string;
    bill: string;
    title: string;
    description: string;
    category: string;
    yea_count: number;
    nay_count: number;
    result: "Passed" | "Failed" | "Unknown";
    votes: Record<string, "Yea" | "Nay" | "Not Voting" | "Present">;
  }>;
  
  // Group votes by bill
  const billMap = new Map<string, BillVote[]>();
  
  for (const vote of votesData) {
    if (!billMap.has(vote.bill)) {
      billMap.set(vote.bill, []);
    }
    billMap.get(vote.bill)!.push(vote as BillVote);
  }
  
  // Transform into Bill objects
  const bills: Bill[] = [];
  
  for (const [billId, votes] of billMap.entries()) {
    // Sort votes by date
    votes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Separate by chamber
    const houseVotes = votes.filter(v => v.chamber === "House");
    const senateVotes = votes.filter(v => v.chamber === "Senate");
    
    // Determine if passed each chamber
    const passedHouse = houseVotes.some(v => v.result === "Passed");
    const passedSenate = senateVotes.some(v => v.result === "Passed");
    const anyFailed = votes.some(v => v.result === "Failed");
    
    // Final result
    let finalResult: "Passed" | "Failed" | "Pending" = "Pending";
    if (passedHouse && passedSenate) {
      finalResult = "Passed";
    } else if (anyFailed) {
      finalResult = "Failed";
    }
    
    // Get the most recent vote for title/description
    const latestVote = votes[votes.length - 1];
    
    // Determine status
    const status = determineBillStatus(houseVotes, senateVotes, passedHouse, passedSenate);
    
    // Extract top supporters and opponents from the latest vote
    const voteEntries = Object.entries(latestVote.votes);
    const supporters = voteEntries
      .filter(([, vote]) => vote === "Yea")
      .map(([bioguide_id, vote]) => ({ bioguide_id, vote }))
      .slice(0, 10);
    
    const opponents = voteEntries
      .filter(([, vote]) => vote === "Nay")
      .map(([bioguide_id, vote]) => ({ bioguide_id, vote }))
      .slice(0, 10);
    
    bills.push({
      bill_id: billId,
      title: latestVote.title,
      description: latestVote.description,
      category: latestVote.category,
      status,
      introduced_date: votes[0].date,
      latest_action_date: latestVote.date,
      votes,
      house_votes: houseVotes,
      senate_votes: senateVotes,
      passed_house: passedHouse,
      passed_senate: passedSenate,
      final_result: finalResult,
      top_supporters: supporters,
      top_opponents: opponents,
    });
  }
  
  // Sort by latest action date (most recent first)
  bills.sort((a, b) => 
    new Date(b.latest_action_date).getTime() - new Date(a.latest_action_date).getTime()
  );
  
  return bills;
}

/**
 * Get all bills with vote history
 */
export function getAllBills(): Bill[] {
  if (!_bills) {
    _bills = processBills();
  }
  return _bills;
}

/**
 * Get a specific bill by ID
 */
export function getBill(billId: string): Bill | undefined {
  return getAllBills().find(b => b.bill_id === billId);
}

/**
 * Get bills by category
 */
export function getBillsByCategory(category: string): Bill[] {
  return getAllBills().filter(b => b.category === category);
}

/**
 * Get bills by status
 */
export function getBillsByStatus(status: BillStatus): Bill[] {
  return getAllBills().filter(b => b.status === status);
}

/**
 * Get category breakdown
 */
export function getBillCategoryBreakdown(): Record<string, number> {
  const bills = getAllBills();
  const breakdown: Record<string, number> = {};
  
  for (const bill of bills) {
    breakdown[bill.category] = (breakdown[bill.category] || 0) + 1;
  }
  
  return breakdown;
}

/**
 * Get status breakdown
 */
export function getBillStatusBreakdown() {
  const bills = getAllBills();
  
  return {
    total: bills.length,
    passed_both: bills.filter(b => b.status === "passed_both").length,
    passed_chamber: bills.filter(b => b.status === "passed_chamber").length,
    floor_vote: bills.filter(b => b.status === "floor_vote").length,
    committee: bills.filter(b => b.status === "committee").length,
    failed: bills.filter(b => b.status === "failed").length,
  };
}
