import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getMembers,
  getMember,
  getMembersByState,
  getMembersByChamber,
  getMembersByParty,
  getStates,
  getPartyBreakdown,
  getOfficialAgencySpending,
  type Member,
} from './data';

describe('data utilities', () => {
  describe('getMembers', () => {
    it('returns an array of members', () => {
      const members = getMembers();
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThan(0);
    });

    it('transforms state names to abbreviations', () => {
      const members = getMembers();
      // All states should be 2-letter abbreviations
      for (const member of members) {
        expect(member.state.length).toBeLessThanOrEqual(2);
      }
    });

    it('returns members with required fields', () => {
      const members = getMembers();
      const first = members[0];
      
      expect(first).toHaveProperty('bioguide_id');
      expect(first).toHaveProperty('first_name');
      expect(first).toHaveProperty('last_name');
      expect(first).toHaveProperty('full_name');
      expect(first).toHaveProperty('party');
      expect(first).toHaveProperty('state');
      expect(first).toHaveProperty('chamber');
      expect(first).toHaveProperty('bills_sponsored');
      expect(first).toHaveProperty('bills_cosponsored');
      expect(first).toHaveProperty('committees');
      expect(first).toHaveProperty('party_alignment_pct');
      expect(first).toHaveProperty('votes_cast');
    });

    it('returns the same data on subsequent calls', () => {
      const first = getMembers();
      const second = getMembers();
      // Module-level caching was removed (issue #67): JSON imports are already
      // module-cached by the bundler, so each call produces a fresh array with
      // identical data.  Deep equality is the correct assertion here.
      expect(first).toStrictEqual(second);
    });
  });

  describe('getMember', () => {
    it('finds a member by bioguide ID', () => {
      const member = getMember('C001118');
      expect(member).toBeDefined();
      expect(member?.first_name).toBe('Ben');
      expect(member?.last_name).toBe('Cline');
    });

    it('returns undefined for unknown ID', () => {
      const member = getMember('UNKNOWN123');
      expect(member).toBeUndefined();
    });
  });

  describe('getMembersByState', () => {
    it('filters members by state abbreviation', () => {
      const vaMembers = getMembersByState('VA');
      expect(vaMembers.length).toBeGreaterThan(0);
      for (const member of vaMembers) {
        expect(member.state).toBe('VA');
      }
    });

    it('returns empty array for unknown state', () => {
      const members = getMembersByState('ZZ');
      expect(members).toEqual([]);
    });
  });

  describe('getMembersByChamber', () => {
    it('filters house members', () => {
      const houseMembers = getMembersByChamber('house');
      expect(houseMembers.length).toBeGreaterThan(0);
      for (const member of houseMembers) {
        expect(member.chamber).toBe('house');
      }
    });

    it('filters senate members', () => {
      const senateMembers = getMembersByChamber('senate');
      expect(senateMembers.length).toBeGreaterThan(0);
      for (const member of senateMembers) {
        expect(member.chamber).toBe('senate');
      }
    });

    it('has reasonable chamber counts', () => {
      const house = getMembersByChamber('house');
      const senate = getMembersByChamber('senate');
      
      // House should have ~435 members, Senate ~100
      expect(house.length).toBeGreaterThan(400);
      expect(house.length).toBeLessThan(450);
      expect(senate.length).toBeGreaterThanOrEqual(90);
      expect(senate.length).toBeLessThanOrEqual(110);
    });
  });

  describe('getMembersByParty', () => {
    it('filters Democrats', () => {
      const dems = getMembersByParty('D');
      expect(dems.length).toBeGreaterThan(0);
      for (const member of dems) {
        expect(member.party).toBe('D');
      }
    });

    it('filters Republicans', () => {
      const reps = getMembersByParty('R');
      expect(reps.length).toBeGreaterThan(0);
      for (const member of reps) {
        expect(member.party).toBe('R');
      }
    });
  });

  describe('getStates', () => {
    it('returns array of states with counts', () => {
      const states = getStates();
      expect(Array.isArray(states)).toBe(true);
      expect(states.length).toBeGreaterThan(0);
    });

    it('each state has abbrev, name, and count', () => {
      const states = getStates();
      for (const state of states) {
        expect(state).toHaveProperty('abbrev');
        expect(state).toHaveProperty('name');
        expect(state).toHaveProperty('count');
        expect(typeof state.count).toBe('number');
      }
    });

    it('is sorted alphabetically by name', () => {
      const states = getStates();
      const names = states.map(s => s.name);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    });

    it('includes major states', () => {
      const states = getStates();
      const abbrevs = states.map(s => s.abbrev);
      expect(abbrevs).toContain('CA');
      expect(abbrevs).toContain('TX');
      expect(abbrevs).toContain('NY');
      expect(abbrevs).toContain('FL');
    });
  });

  describe('getPartyBreakdown', () => {
    it('returns breakdown with all expected fields', () => {
      const breakdown = getPartyBreakdown();
      
      expect(breakdown).toHaveProperty('total');
      expect(breakdown).toHaveProperty('democrats');
      expect(breakdown).toHaveProperty('republicans');
      expect(breakdown).toHaveProperty('independents');
      expect(breakdown).toHaveProperty('other');
      expect(breakdown).toHaveProperty('house');
      expect(breakdown).toHaveProperty('senate');
    });

    it('total equals sum of parties', () => {
      const b = getPartyBreakdown();
      expect(b.total).toBe(b.democrats + b.republicans + b.independents + b.other);
    });

    it('total equals sum of chambers', () => {
      const b = getPartyBreakdown();
      expect(b.total).toBe(b.house + b.senate);
    });

    it('has reasonable total (around 535)', () => {
      const { total } = getPartyBreakdown();
      expect(total).toBeGreaterThan(500);
      expect(total).toBeLessThan(550);
    });
  });

  describe('member data quality', () => {
    it('all members have valid bioguide IDs', () => {
      const members = getMembers();
      for (const member of members) {
        expect(member.bioguide_id).toMatch(/^[A-Z]\d{6}$/);
      }
    });

    it('all members have non-empty names', () => {
      const members = getMembers();
      for (const member of members) {
        expect(member.first_name.length).toBeGreaterThan(0);
        expect(member.last_name.length).toBeGreaterThan(0);
        expect(member.full_name.length).toBeGreaterThan(0);
      }
    });

    it('party alignment is within valid range', () => {
      const members = getMembers();
      for (const member of members) {
        expect(member.party_alignment_pct).toBeGreaterThanOrEqual(0);
        expect(member.party_alignment_pct).toBeLessThanOrEqual(100);
      }
    });

    it('bills counts are non-negative', () => {
      const members = getMembers();
      for (const member of members) {
        expect(member.bills_sponsored).toBeGreaterThanOrEqual(0);
        expect(member.bills_cosponsored).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('USASpending data access', () => {
    it('returns null when no agency spending profile exists for an official', () => {
      const data = getOfficialAgencySpending('non-existent-official');
      expect(data).toBeNull();
    });
  });
});
