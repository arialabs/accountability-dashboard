/**
 * Vote-Based Category Scoring
 * 
 * Calculates category scores based ONLY on actual voting records,
 * not on stated positions. This is the ground truth.
 */

export interface VoteRecord {
  bill: string;
  title: string;
  category: string;
  vote: 'Yea' | 'Nay' | 'Not Voting' | 'Present';
  date: string;
  description: string;
}

export interface CategoryVoteScore {
  category: string;
  votesFor: number;        // Votes supporting the category's typical progressive stance
  votesAgainst: number;    // Votes opposing the category's typical progressive stance
  abstentions: number;     // Not Voting or Present
  totalVotes: number;
  score: number;           // 0-100, higher = more progressive/supportive
  direction: 'progressive' | 'conservative' | 'mixed';
}

export interface VotingRecordSummary {
  bioguideId: string;
  categoryScores: Record<string, CategoryVoteScore>;
  recentVotes: VoteRecord[];
  overallProgressiveScore: number; // 0-100
}

/**
 * Determine if a vote is progressive based on party voting patterns
 * 
 * Uses Democratic party voting patterns as the baseline for progressive direction.
 * This works because on most policy votes, Democrats tend to support progressive
 * positions (healthcare expansion, climate action, etc.) while Republicans oppose.
 * 
 * Returns:
 * - 'yea': A Yea vote is the progressive position (Democrats vote Yea)
 * - 'nay': A Nay vote is the progressive position (Democrats vote Nay, likely opposing a conservative bill)
 * - 'unclear': Bipartisan or mixed voting pattern
 */
export function getProgressiveVoteDirection(
  yeaVotes: string[],
  nayVotes: string[],
  members: Array<{ bioguide_id: string; party: string }>
): 'yea' | 'nay' | 'unclear' {
  const demYea = yeaVotes.filter(id => 
    members.find(m => m.bioguide_id === id)?.party === 'D'
  ).length;
  
  const repYea = yeaVotes.filter(id => 
    members.find(m => m.bioguide_id === id)?.party === 'R'
  ).length;
  
  const demNay = nayVotes.filter(id => 
    members.find(m => m.bioguide_id === id)?.party === 'D'
  ).length;
  
  const repNay = nayVotes.filter(id => 
    members.find(m => m.bioguide_id === id)?.party === 'R'
  ).length;
  
  const totalDem = demYea + demNay;
  const totalRep = repYea + repNay;
  
  // Need meaningful sample sizes
  if (totalDem < 10 || totalRep < 10) return 'unclear';
  
  const demYeaPct = demYea / totalDem;
  const repYeaPct = repYea / totalRep;
  
  const difference = demYeaPct - repYeaPct;
  
  // Strong Democratic support for Yea = progressive Yea vote
  // Example: Healthcare expansion, climate bills
  if (difference > 0.25 && demYeaPct > 0.5) return 'yea';
  
  // Strong Democratic support for Nay = progressive Nay vote
  // Example: Voting against Republican healthcare cuts, opposing conservative bills
  if (difference < -0.25 && demYeaPct < 0.5) return 'nay';
  
  // Strong Democratic Yea support even if Republicans also support (but less)
  if (demYeaPct > 0.75 && difference > 0.1) return 'yea';
  
  // Strong Democratic Nay support (opposing a bill)
  if (demYeaPct < 0.25 && difference < -0.1) return 'nay';
  
  return 'unclear';
}

/**
 * Calculate category scores from actual votes
 */
export function calculateVoteBasedScores(
  bioguideId: string,
  keyVotes: Array<{
    id: string;
    bill: string;
    title: string;
    category: string;
    date: string;
    description: string;
    votes: Record<string, string>;
    yea_count: number;
    nay_count: number;
  }>,
  allMembers: Array<{ bioguide_id: string; party: string }>
): VotingRecordSummary {
  const categoryScores: Record<string, CategoryVoteScore> = {};
  const recentVotes: VoteRecord[] = [];
  
  // Get member's party for overall direction calculation
  const member = allMembers.find(m => m.bioguide_id === bioguideId);
  const memberParty = member?.party || 'Unknown';
  
  // Group votes by category
  for (const vote of keyVotes) {
    const memberVote = vote.votes[bioguideId];
    if (!memberVote) continue;
    
    const category = vote.category;
    
    // Initialize category score if needed
    if (!categoryScores[category]) {
      categoryScores[category] = {
        category,
        votesFor: 0,
        votesAgainst: 0,
        abstentions: 0,
        totalVotes: 0,
        score: 50,
        direction: 'mixed',
      };
    }
    
    const catScore = categoryScores[category];
    catScore.totalVotes++;
    
    // Determine progressive direction for this vote
    const yeaVoters = Object.entries(vote.votes)
      .filter(([_, v]) => v === 'Yea')
      .map(([id]) => id);
    const nayVoters = Object.entries(vote.votes)
      .filter(([_, v]) => v === 'Nay')
      .map(([id]) => id);
    
    const progressiveDirection = getProgressiveVoteDirection(yeaVoters, nayVoters, allMembers);
    
    // Score the vote
    if (memberVote === 'Not Voting' || memberVote === 'Present') {
      catScore.abstentions++;
    } else if (progressiveDirection === 'yea' && memberVote === 'Yea') {
      catScore.votesFor++;
    } else if (progressiveDirection === 'nay' && memberVote === 'Nay') {
      catScore.votesFor++;
    } else if (progressiveDirection !== 'unclear') {
      catScore.votesAgainst++;
    }
    
    // Add to recent votes
    recentVotes.push({
      bill: vote.bill,
      title: vote.title,
      category: vote.category,
      vote: memberVote as VoteRecord['vote'],
      date: vote.date,
      description: vote.description,
    });
  }
  
  // Calculate scores and directions
  let totalProgressiveVotes = 0;
  let totalScoredVotes = 0;
  
  for (const catScore of Object.values(categoryScores)) {
    const scored = catScore.votesFor + catScore.votesAgainst;
    if (scored > 0) {
      catScore.score = Math.round((catScore.votesFor / scored) * 100);
      
      if (catScore.score >= 65) {
        catScore.direction = 'progressive';
      } else if (catScore.score <= 35) {
        catScore.direction = 'conservative';
      } else {
        catScore.direction = 'mixed';
      }
      
      totalProgressiveVotes += catScore.votesFor;
      totalScoredVotes += scored;
    }
  }
  
  const overallProgressiveScore = totalScoredVotes > 0 
    ? Math.round((totalProgressiveVotes / totalScoredVotes) * 100)
    : 50;
  
  // Sort recent votes by date
  recentVotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return {
    bioguideId,
    categoryScores,
    recentVotes: recentVotes.slice(0, 20), // Keep 20 most recent
    overallProgressiveScore,
  };
}

/**
 * Compare stated position to voting record
 */
export interface ContradictionAnalysis {
  category: string;
  statedStance: string;
  statedIntensity: number;
  votingScore: number;
  votingDirection: 'progressive' | 'conservative' | 'mixed';
  isContradiction: boolean;
  contradictionSeverity: 'none' | 'mild' | 'moderate' | 'severe';
  message: string;
}

export function analyzeContradiction(
  statedStance: string,
  statedIntensity: number,
  votingScore: number,
  votingDirection: 'progressive' | 'conservative' | 'mixed',
  category: string
): ContradictionAnalysis {
  const isSupporting = statedStance.toLowerCase().includes('support') || 
                       statedStance.toLowerCase().includes('favor');
  const isOpposing = statedStance.toLowerCase().includes('oppose');
  
  let isContradiction = false;
  let severity: ContradictionAnalysis['contradictionSeverity'] = 'none';
  let message = '';
  
  if (isSupporting) {
    // Says they support, but voting score is low
    if (votingScore < 40) {
      isContradiction = true;
      severity = statedIntensity >= 4 ? 'severe' : 'moderate';
      message = `Says "${statedStance}" but votes against ${category} issues ${100 - votingScore}% of the time`;
    } else if (votingScore < 60) {
      isContradiction = true;
      severity = 'mild';
      message = `Says "${statedStance}" but has mixed voting record on ${category}`;
    }
  } else if (isOpposing) {
    // Says they oppose, but voting score is high
    if (votingScore > 60) {
      isContradiction = true;
      severity = statedIntensity >= 4 ? 'severe' : 'moderate';
      message = `Says "${statedStance}" but votes for ${category} issues ${votingScore}% of the time`;
    } else if (votingScore > 40) {
      isContradiction = true;
      severity = 'mild';
      message = `Says "${statedStance}" but has mixed voting record on ${category}`;
    }
  }
  
  if (!isContradiction) {
    message = 'Voting record aligns with stated position';
  }
  
  return {
    category,
    statedStance,
    statedIntensity,
    votingScore,
    votingDirection,
    isContradiction,
    contradictionSeverity: severity,
    message,
  };
}
