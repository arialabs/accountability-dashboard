import { describe, it, expect } from 'vitest';
import committeesData from '../data/committees.json';

describe('Committees Data', () => {
  it('has committees array', () => {
    expect(committeesData).toHaveProperty('committees');
    expect(Array.isArray(committeesData.committees)).toBe(true);
  });

  it('has member_assignments object (keyed by bioguide_id)', () => {
    expect(committeesData).toHaveProperty('member_assignments');
    // member_assignments is a dict: { [bioguide_id]: assignment[] }
    expect(typeof committeesData.member_assignments).toBe('object');
    expect(Array.isArray(committeesData.member_assignments)).toBe(false);
  });

  describe('committees', () => {
    it('each committee has required fields', () => {
      if (committeesData.committees.length > 0) {
        for (const committee of committeesData.committees) {
          expect(committee).toHaveProperty('id');
          expect(committee).toHaveProperty('name');
          expect(committee).toHaveProperty('chamber');
          expect(committee).toHaveProperty('type');
        }
      }
    });

    it('chamber values are valid', () => {
      const validChambers = ['house', 'senate', 'joint'];
      for (const committee of committeesData.committees) {
        expect(validChambers).toContain(committee.chamber);
      }
    });

    it('type values are valid', () => {
      const validTypes = ['standing', 'select', 'joint', 'special'];
      for (const committee of committeesData.committees) {
        expect(validTypes).toContain(committee.type);
      }
    });
  });

  describe('member_assignments', () => {
    it('each assignment has required fields', () => {
      const entries = Object.entries(committeesData.member_assignments as Record<string, { committee_id: string; role: string }[]>);
      if (entries.length > 0) {
        for (const [bioguideId, assignments] of entries) {
          expect(bioguideId).toMatch(/^[A-Z]\d{6}$/);
          for (const assignment of assignments) {
            expect(assignment).toHaveProperty('committee_id');
            expect(assignment).toHaveProperty('role');
          }
        }
      }
    });

    it('role values are valid', () => {
      // Roles use full words (chairman, vice_chair, etc.)
      const validRoles = ['chair', 'ranking_member', 'vice_chair', 'member',
        'chairman', 'chairwoman', 'vice_chairman', 'vice_chairwoman',
        'cochairman', 'cochairwoman', 'ex_officio', 'ranking_minority_member'];
      const entries = Object.values(committeesData.member_assignments as Record<string, { role: string }[]>);
      for (const assignments of entries) {
        for (const assignment of assignments) {
          expect(validRoles).toContain(assignment.role);
        }
      }
    });

    it('bioguide IDs are valid format', () => {
      for (const bioguideId of Object.keys(committeesData.member_assignments as Record<string, unknown>)) {
        expect(bioguideId).toMatch(/^[A-Z]\d{6}$/);
      }
    });
  });

  describe('data quality', () => {
    it('has reasonable number of committees', () => {
      // The dataset includes standing committees, subcommittees, and related bodies
      expect(committeesData.committees.length).toBeGreaterThan(20);
    });

    it('has assignments object', () => {
      // member_assignments is a dict keyed by bioguide_id
      expect(typeof committeesData.member_assignments).toBe('object');
      expect(Object.keys(committeesData.member_assignments as Record<string, unknown>).length).toBeGreaterThan(0);
    });

    it('has valid member assignments when present', () => {
      // Keys are bioguide IDs, values are arrays of assignments
      const keys = Object.keys(committeesData.member_assignments as Record<string, unknown>);
      expect(keys.length).toBeGreaterThanOrEqual(0);
      if (keys.length > 0) {
        expect(keys[0]).toMatch(/^[A-Z]\d{6}$/);
      }
    });
  });

  describe('metadata', () => {
    it('has last_updated timestamp', () => {
      expect(committeesData).toHaveProperty('last_updated');
      expect(typeof committeesData.last_updated).toBe('string');
    });

    it('has source information', () => {
      expect(committeesData).toHaveProperty('source');
      expect(typeof committeesData.source).toBe('string');
    });
  });
});
