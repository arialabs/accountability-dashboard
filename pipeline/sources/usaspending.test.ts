import { describe, expect, it } from 'vitest';
import {
  calculateYoYChange,
  normalizeSpendingOverTimeResponse,
  normalizeProgramFundingChanges,
  normalizeAwardsResponse,
} from './usaspending';

describe('USASpending parsing', () => {
  it('calculates YoY percentage change', () => {
    expect(calculateYoYChange(120, 100)).toBe(20);
    expect(calculateYoYChange(80, 100)).toBe(-20);
    expect(calculateYoYChange(100, 0)).toBeNull();
  });

  it('normalizes fiscal-year totals and computes YoY from obligations', () => {
    const response = {
      results: [
        { fiscal_year: 2022, obligated_amount: 1000, outlay_amount: 800, budget_authority: 1200 },
        { fiscal_year: 2023, obligated_amount: 1500, outlay_amount: 1200, budget_authority: 1600 },
        { fiscal_year: 2024, obligated_amount: 1200, outlay_amount: 1000, budget_authority: 1300 },
      ],
    };

    const normalized = normalizeSpendingOverTimeResponse(response, [2022, 2023, 2024]);

    expect(normalized).toHaveLength(3);
    expect(normalized[0]).toMatchObject({ fiscal_year: 2022, total_obligations: 1000, yoy_change_pct: null });
    expect(normalized[1]).toMatchObject({ fiscal_year: 2023, total_obligations: 1500, yoy_change_pct: 50 });
    expect(normalized[2]).toMatchObject({ fiscal_year: 2024, total_obligations: 1200, yoy_change_pct: -20 });
  });

  it('computes program-level funding changes between fiscal years', () => {
    const currentYear = [
      { name: 'Health Insurance Assistance', amount: 2200000 },
      { name: 'STEM Education Grants', amount: 500000 },
    ];
    const previousYear = [
      { name: 'Health Insurance Assistance', amount: 2000000 },
      { name: 'Broadband Access', amount: 700000 },
    ];

    const changes = normalizeProgramFundingChanges(currentYear, previousYear, 2024);

    const health = changes.find((item) => item.program_name === 'Health Insurance Assistance');
    const stem = changes.find((item) => item.program_name === 'STEM Education Grants');
    const broadband = changes.find((item) => item.program_name === 'Broadband Access');

    expect(health).toMatchObject({
      current_amount: 2200000,
      previous_amount: 2000000,
      change_amount: 200000,
      change_pct: 10,
    });

    expect(stem).toMatchObject({
      current_amount: 500000,
      previous_amount: 0,
      change_amount: 500000,
      change_pct: null,
    });

    expect(broadband).toMatchObject({
      current_amount: 0,
      previous_amount: 700000,
      change_amount: -700000,
      change_pct: -100,
    });
  });

  it('normalizes award rows and classifies contract vs grant awards', () => {
    const response = {
      results: [
        {
          'Award ID': 'ABC-123',
          'Recipient Name': 'Acme Federal Systems',
          'Award Amount': 1250000,
          'Award Type': 'Contract',
          'Awarding Agency': 'Department of Defense',
          'Action Date': '2024-07-14',
          Description: 'Cloud migration support',
        },
        {
          'Award ID': 'XYZ-789',
          'Recipient Name': 'State University',
          'Award Amount': 420000,
          'Award Type': 'Grant',
          'Awarding Agency': 'Department of Education',
          'Action Date': '2024-04-01',
          Description: 'Research grant',
        },
      ],
    };

    const awards = normalizeAwardsResponse(response);

    expect(awards).toHaveLength(2);
    expect(awards[0]).toMatchObject({
      award_id: 'ABC-123',
      recipient_name: 'Acme Federal Systems',
      amount: 1250000,
      award_type: 'contract',
    });
    expect(awards[1]).toMatchObject({
      award_id: 'XYZ-789',
      award_type: 'grant',
    });
  });
});
