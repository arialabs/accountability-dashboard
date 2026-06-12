import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MemberCard from './MemberCard';
import type { Member } from '@/lib/types';
import type { CampaignFinance } from '@/lib/types';
import * as dataModule from '@/lib/data';

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock child components that have complex dependencies
vi.mock('@/components/RepresentativeImage', () => ({
  default: ({ fullName }: { fullName: string }) => <div data-testid="rep-image">{fullName}</div>,
}));

vi.mock('@/components/VotingSparkline', () => ({
  default: () => <svg data-testid="voting-sparkline" />,
}));

// Mock grading
vi.mock('@/lib/grading', () => ({
  calculateGrade: () => ({
    letter: 'C',
    overall: 50,
    breakdown: { donorScore: 50, votingScore: 50, tradingScore: 50, disclosureScore: 50 },
    explanation: { donor: '', voting: '', trading: '', disclosure: '' },
  }),
}));

// Mock the data module — we'll override getMemberFinanceStatic per test
vi.mock('@/lib/data', () => ({
  getMemberFinanceStatic: vi.fn(),
}));

const makeFinance = (pacPct: number, largeDonorPct: number): CampaignFinance => ({
  candidate_id: 'P00000001',
  cycle: 2024,
  total_raised: 5000000,
  total_spent: 4000000,
  cash_on_hand: 1000000,
  individual_contributions: 3000000,
  pac_contributions: pacPct * 50000,
  party_contributions: 0,
  candidate_self_funding: 0,
  small_donors: 1000000,
  large_donors: 2000000,
  pac_percentage: pacPct,
  small_donor_percentage: 100 - pacPct - largeDonorPct,
  large_donor_percentage: largeDonorPct,
  top_industries: [],
  top_contributors: [],
});

const baseMember: Member = {
  bioguide_id: 'T000001',
  full_name: 'Jane Test',
  first_name: 'Jane',
  last_name: 'Test',
  party: 'D',
  state: 'CA',
  district: 12,
  chamber: 'house',
  bills_sponsored: 5,
  bills_cosponsored: 20,
  votes_cast: 400,
  photo_url: null,
  committees: [],
  party_loyalty_pct: 0,
  ideology_score: null,
};

describe('MemberCard — Donor Verdict Badge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows CONSTITUENT FOCUSED badge when PAC% is low', () => {
    vi.mocked(dataModule.getMemberFinanceStatic).mockReturnValue(makeFinance(15, 30));
    render(<MemberCard member={baseMember} userState={null} currentStateFilter="" />);
    expect(screen.getByText(/CONSTITUENT FOCUSED/i)).toBeInTheDocument();
  });

  it('shows MIXED ALLEGIANCE badge when PAC% is between 30 and 59', () => {
    vi.mocked(dataModule.getMemberFinanceStatic).mockReturnValue(makeFinance(45, 25));
    render(<MemberCard member={baseMember} userState={null} currentStateFilter="" />);
    expect(screen.getByText(/MIXED ALLEGIANCE/i)).toBeInTheDocument();
  });

  it('shows DONOR CAPTURED badge when PAC% >= 60', () => {
    vi.mocked(dataModule.getMemberFinanceStatic).mockReturnValue(makeFinance(65, 20));
    render(<MemberCard member={baseMember} userState={null} currentStateFilter="" />);
    expect(screen.getByText(/DONOR CAPTURED/i)).toBeInTheDocument();
  });

  it('shows DONOR CAPTURED badge when large_donor_percentage >= 75 even if PAC% is low', () => {
    vi.mocked(dataModule.getMemberFinanceStatic).mockReturnValue(makeFinance(20, 80));
    render(<MemberCard member={baseMember} userState={null} currentStateFilter="" />);
    expect(screen.getByText(/DONOR CAPTURED/i)).toBeInTheDocument();
  });

  it('shows no verdict badge when finance data is null', () => {
    vi.mocked(dataModule.getMemberFinanceStatic).mockReturnValue(null);
    render(<MemberCard member={baseMember} userState={null} currentStateFilter="" />);
    expect(screen.queryByText(/DONOR CAPTURED/i)).toBeNull();
    expect(screen.queryByText(/MIXED ALLEGIANCE/i)).toBeNull();
    expect(screen.queryByText(/CONSTITUENT FOCUSED/i)).toBeNull();
  });

  it('shows no verdict badge when PAC% and large_donor_percentage are both 0', () => {
    vi.mocked(dataModule.getMemberFinanceStatic).mockReturnValue(makeFinance(0, 0));
    render(<MemberCard member={baseMember} userState={null} currentStateFilter="" />);
    expect(screen.queryByText(/DONOR CAPTURED/i)).toBeNull();
    expect(screen.queryByText(/MIXED ALLEGIANCE/i)).toBeNull();
    expect(screen.queryByText(/CONSTITUENT FOCUSED/i)).toBeNull();
  });

  it('renders member name regardless of finance data', () => {
    vi.mocked(dataModule.getMemberFinanceStatic).mockReturnValue(null);
    render(<MemberCard member={baseMember} userState={null} currentStateFilter="" />);
    // Name may appear in multiple elements (photo alt, heading) — check at least one exists
    expect(screen.getAllByText('Jane Test').length).toBeGreaterThan(0);
  });
});
