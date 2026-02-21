/**
 * Congressional leadership data for the 119th Congress (2025-2027)
 * Highlights party leaders across House and Senate
 */

export interface LeadershipRole {
  bioguide_id: string;
  name: string;
  role: string;
  party: "R" | "D";
  chamber: "house" | "senate";
  category: "majority" | "minority";
  order: number; // Display order within category
}

/**
 * 119th Congress Leadership
 * House: R majority (221-215), Senate: R majority (53-47)
 */
export const CONGRESSIONAL_LEADERSHIP: LeadershipRole[] = [
  // ── House Republican Leadership (Majority) ──
  {
    bioguide_id: "J000299",
    name: "Mike Johnson",
    role: "Speaker of the House",
    party: "R",
    chamber: "house",
    category: "majority",
    order: 1,
  },
  {
    bioguide_id: "S001176",
    name: "Steve Scalise",
    role: "House Majority Leader",
    party: "R",
    chamber: "house",
    category: "majority",
    order: 2,
  },
  {
    bioguide_id: "E000294",
    name: "Tom Emmer",
    role: "House Majority Whip",
    party: "R",
    chamber: "house",
    category: "majority",
    order: 3,
  },

  // ── House Democratic Leadership (Minority) ──
  {
    bioguide_id: "J000294",
    name: "Hakeem Jeffries",
    role: "House Minority Leader",
    party: "D",
    chamber: "house",
    category: "minority",
    order: 1,
  },
  {
    bioguide_id: "C001101",
    name: "Katherine Clark",
    role: "House Minority Whip",
    party: "D",
    chamber: "house",
    category: "minority",
    order: 2,
  },

  // ── Senate Republican Leadership (Majority) ──
  {
    bioguide_id: "T000250",
    name: "John Thune",
    role: "Senate Majority Leader",
    party: "R",
    chamber: "senate",
    category: "majority",
    order: 1,
  },

  // ── Senate Democratic Leadership (Minority) ──
  {
    bioguide_id: "S000148",
    name: "Chuck Schumer",
    role: "Senate Minority Leader",
    party: "D",
    chamber: "senate",
    category: "minority",
    order: 2,
  },
  {
    bioguide_id: "D000563",
    name: "Dick Durbin",
    role: "Senate Minority Whip",
    party: "D",
    chamber: "senate",
    category: "minority",
    order: 3,
  },
];

/** Get all leaders for a given chamber */
export function getLeadershipByChamber(chamber: "house" | "senate"): LeadershipRole[] {
  return CONGRESSIONAL_LEADERSHIP
    .filter((l) => l.chamber === chamber)
    .sort((a, b) => a.order - b.order);
}

/** Get all leaders for a given party */
export function getLeadershipByParty(party: "R" | "D"): LeadershipRole[] {
  return CONGRESSIONAL_LEADERSHIP
    .filter((l) => l.party === party)
    .sort((a, b) => a.order - b.order);
}

/** Check if a member is in leadership */
export function isLeader(bioguideId: string): LeadershipRole | undefined {
  return CONGRESSIONAL_LEADERSHIP.find((l) => l.bioguide_id === bioguideId);
}

/** Get all leadership bioguide IDs for quick lookups */
export const LEADERSHIP_IDS = new Set(
  CONGRESSIONAL_LEADERSHIP.map((l) => l.bioguide_id)
);
