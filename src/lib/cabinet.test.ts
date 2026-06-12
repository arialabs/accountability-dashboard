import { describe, it, expect } from 'vitest';
import cabinetData from '../data/cabinet.json';

describe('Cabinet Data', () => {
  it('has members array', () => {
    expect(cabinetData).toHaveProperty('members');
    expect(Array.isArray(cabinetData.members)).toBe(true);
    expect(cabinetData.members.length).toBeGreaterThan(0);
  });

  describe('enriched member data', () => {
    it('each member has required base fields', () => {
      for (const member of cabinetData.members) {
        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('name');
        expect(member).toHaveProperty('role');
        expect(member).toHaveProperty('department');
      }
    });

    it('each member has enriched bio field', () => {
      for (const member of cabinetData.members) {
        expect(member).toHaveProperty('bio');
        expect(typeof member.bio).toBe('string');
        expect(member.bio.length).toBeGreaterThan(50); // Detailed bio
      }
    });

    it('each member has prior_positions array', () => {
      for (const member of cabinetData.members) {
        expect(member).toHaveProperty('prior_positions');
        expect(Array.isArray(member.prior_positions)).toBe(true);
        if (member.prior_positions.length > 0) {
          for (const position of member.prior_positions) {
            expect(position).toHaveProperty('title');
            expect(position).toHaveProperty('organization');
          }
        }
      }
    });

    it('each member has conflicts_of_interest array', () => {
      for (const member of cabinetData.members) {
        expect(member).toHaveProperty('conflicts_of_interest');
        expect(Array.isArray(member.conflicts_of_interest)).toBe(true);
      }
    });

    it('members carry no unsourced net_worth field', () => {
      for (const member of cabinetData.members) {
        expect(member).not.toHaveProperty('net_worth');
      }
    });

    it('each member has policy_positions array', () => {
      for (const member of cabinetData.members) {
        expect(member).toHaveProperty('policy_positions');
        expect(Array.isArray(member.policy_positions)).toBe(true);
      }
    });
  });

  describe('conflicts of interest detail', () => {
    it('conflicts have required fields when present', () => {
      for (const member of cabinetData.members) {
        if (member.conflicts_of_interest.length > 0) {
          for (const conflict of member.conflicts_of_interest) {
            expect(conflict).toHaveProperty('description');
            expect(conflict).toHaveProperty('severity');
            expect(typeof conflict.description).toBe('string');
            expect(['low', 'medium', 'high', 'critical']).toContain(conflict.severity);
          }
        }
      }
    });
  });

  describe('policy positions detail', () => {
    it('policy positions have required fields when present', () => {
      for (const member of cabinetData.members) {
        if (member.policy_positions.length > 0) {
          for (const position of member.policy_positions) {
            expect(position).toHaveProperty('topic');
            expect(position).toHaveProperty('stance');
            expect(typeof position.topic).toBe('string');
            expect(typeof position.stance).toBe('string');
          }
        }
      }
    });
  });

  describe('data quality', () => {
    it('has reasonable cabinet size', () => {
      // Cabinet typically has 15-25 members
      expect(cabinetData.members.length).toBeGreaterThanOrEqual(10);
      expect(cabinetData.members.length).toBeLessThanOrEqual(30);
    });

    it('all members have non-empty names', () => {
      for (const member of cabinetData.members) {
        expect(member.name.length).toBeGreaterThan(0);
      }
    });

    it('all members have confirmation vote data when applicable', () => {
      for (const member of cabinetData.members) {
        if (member.confirmation_vote) {
          expect(member.confirmation_vote).toMatch(/^\d+-\d+$/); // Format: 99-0
        }
      }
    });
  });
});
