"use client";

import { useApi } from "./useApi";
import { fetchMembers, type ApiMember } from "../lib/api-client";
import type { Member } from "../lib/types";

// State name to abbreviation mapping
const STATE_ABBREV: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
  "Puerto Rico": "PR", "Guam": "GU", "American Samoa": "AS",
  "Virgin Islands": "VI", "Northern Mariana Islands": "MP",
};

const ABBREV_TO_NAME = Object.fromEntries(
  Object.entries(STATE_ABBREV).map(([name, abbrev]) => [abbrev, name])
);

/** Transform API member to app Member type */
function transformApiMember(raw: ApiMember): Member {
  return {
    bioguide_id: raw.bioguide_id,
    first_name: raw.first_name,
    last_name: raw.last_name,
    full_name: raw.full_name,
    party: raw.party as Member["party"],
    state: STATE_ABBREV[raw.state] || raw.state,
    district: raw.district,
    chamber: raw.chamber,
    photo_url: raw.photo_url,
    bills_sponsored: raw.bills_sponsored || 0,
    bills_cosponsored: raw.bills_cosponsored || 0,
    committees: raw.committees || [],
    party_alignment_pct: raw.party_loyalty_pct ?? 0,
    ideology_score: raw.ideology_score ?? null,
    votes_cast: raw.votes_cast || 0,
  };
}

/** Compute party breakdown from members array */
function computePartyBreakdown(members: Member[]) {
  return {
    total: members.length,
    democrats: members.filter(m => m.party === "D").length,
    republicans: members.filter(m => m.party === "R").length,
    independents: members.filter(m => m.party === "I").length,
    other: members.filter(m => !["D", "R", "I"].includes(m.party)).length,
    house: members.filter(m => m.chamber === "house").length,
    senate: members.filter(m => m.chamber === "senate").length,
  };
}

/** Compute states list from members array */
function computeStates(members: Member[]): Array<{ abbrev: string; name: string; count: number }> {
  const stateCount = new Map<string, number>();
  for (const member of members) {
    stateCount.set(member.state, (stateCount.get(member.state) || 0) + 1);
  }
  return Array.from(stateCount.entries())
    .map(([abbrev, count]) => ({
      abbrev,
      name: ABBREV_TO_NAME[abbrev] || abbrev,
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Hook that fetches members from API and provides the same interface as the static data functions */
export function useLiveMembers() {
  const { data: rawMembers, loading, error, refetch } = useApi<ApiMember[]>(
    (signal) => fetchMembers(signal),
    []
  );

  const members = rawMembers ? rawMembers.map(transformApiMember) : [];
  const stats = computePartyBreakdown(members);
  const states = computeStates(members);

  return {
    members,
    stats,
    states,
    loading,
    error,
    refetch,
  };
}
