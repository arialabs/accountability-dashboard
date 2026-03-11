import { describe, it, expect } from 'vitest';
import approvalData from '../data/trump-approval.json';

describe('Trump Approval Data (updated)', () => {
  it('current entry matches March 11 2026 values', () => {
    expect(approvalData.current.date).toBe('2026-03-11');
    expect(approvalData.current.approve).toBe(42.8);
    expect(approvalData.current.disapprove).toBe(55.6);
    expect(approvalData.current.net).toBeCloseTo(-12.8, 1);
  });

  it('has at least 30 history entries for sparkline rendering', () => {
    expect(approvalData.history.length).toBeGreaterThanOrEqual(30);
  });

  it('most recent history entry matches current', () => {
    const first = approvalData.history[0];
    expect(first.date).toBe(approvalData.current.date);
    expect(first.approve).toBe(approvalData.current.approve);
    expect(first.disapprove).toBe(approvalData.current.disapprove);
  });

  it('last_updated reflects 2026-03-11', () => {
    expect(approvalData.last_updated).toMatch(/^2026-03-11/);
  });

  it('history contains the new weekly anchor points', () => {
    const dates = approvalData.history.map(h => h.date);
    expect(dates).toContain('2026-02-13');
    expect(dates).toContain('2026-02-20');
    expect(dates).toContain('2026-02-27');
    expect(dates).toContain('2026-03-06');
    expect(dates).toContain('2026-03-11');
  });
});
