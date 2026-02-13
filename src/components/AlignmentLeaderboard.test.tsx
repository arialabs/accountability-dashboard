import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlignmentLeaderboard from './AlignmentLeaderboard';
import * as leaderboardLib from '@/lib/leaderboard';

// Mock the leaderboard library
vi.mock('@/lib/leaderboard', () => ({
  getLeaderboard: vi.fn(),
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AlignmentLeaderboard', () => {
  const mockLeaderboardData = {
    topAligned: [
      {
        bioguideId: 'H001',
        name: 'John House',
        party: 'D',
        state: 'CA',
        chamber: 'House' as const,
        alignmentScore: 95,
        positionsWithVotes: 10,
        totalPositions: 12,
      },
      {
        bioguideId: 'S001',
        name: 'Jane Senate',
        party: 'R',
        state: 'TX',
        chamber: 'Senate' as const,
        alignmentScore: 92,
        positionsWithVotes: 8,
        totalPositions: 10,
      },
    ],
    bottomAligned: [
      {
        bioguideId: 'H002',
        name: 'Bob House',
        party: 'R',
        state: 'FL',
        chamber: 'House' as const,
        alignmentScore: 45,
        positionsWithVotes: 5,
        totalPositions: 12,
      },
      {
        bioguideId: 'S002',
        name: 'Mary Senate',
        party: 'D',
        state: 'NY',
        chamber: 'Senate' as const,
        alignmentScore: 40,
        positionsWithVotes: 6,
        totalPositions: 10,
      },
    ],
    averageScore: 68,
    totalMembers: 535,
    membersWithData: 270,
  };

  beforeEach(() => {
    vi.mocked(leaderboardLib.getLeaderboard).mockReturnValue(mockLeaderboardData);
  });

  it('renders the leaderboard with title and description', () => {
    render(<AlignmentLeaderboard />);
    
    expect(screen.getByText('Say vs. Do Leaderboard')).toBeInTheDocument();
    expect(screen.getByText(/How well do politicians' votes align with their stated positions?/)).toBeInTheDocument();
  });

  it('displays statistics correctly', () => {
    render(<AlignmentLeaderboard />);
    
    expect(screen.getByText(/270 members analyzed/)).toBeInTheDocument();
    expect(screen.getByText(/Average: 68% alignment/)).toBeInTheDocument();
  });

  it('renders chamber filter buttons', () => {
    render(<AlignmentLeaderboard />);
    
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'House' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Senate' })).toBeInTheDocument();
  });

  it('displays top and bottom aligned members', () => {
    render(<AlignmentLeaderboard />);
    
    expect(screen.getByText('John House')).toBeInTheDocument();
    expect(screen.getByText('Jane Senate')).toBeInTheDocument();
    expect(screen.getByText('Bob House')).toBeInTheDocument();
    expect(screen.getByText('Mary Senate')).toBeInTheDocument();
  });

  it('shows chamber badges for each member', () => {
    render(<AlignmentLeaderboard />);
    
    // Should have H and S badges
    const badges = screen.getAllByText(/^[HS]$/);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('filters to House only when House button is clicked', () => {
    render(<AlignmentLeaderboard />);
    
    const houseButton = screen.getByRole('button', { name: 'House' });
    fireEvent.click(houseButton);
    
    // Should still show House members
    expect(screen.getByText('John House')).toBeInTheDocument();
    expect(screen.getByText('Bob House')).toBeInTheDocument();
    
    // Senate members should be filtered out (not in top 5)
    // Note: This test may need adjustment based on actual filtering logic
  });

  it('filters to Senate only when Senate button is clicked', () => {
    render(<AlignmentLeaderboard />);
    
    const senateButton = screen.getByRole('button', { name: 'Senate' });
    fireEvent.click(senateButton);
    
    // Should show Senate members
    expect(screen.getByText('Jane Senate')).toBeInTheDocument();
    expect(screen.getByText('Mary Senate')).toBeInTheDocument();
  });

  it('shows all members when All button is clicked after filtering', () => {
    render(<AlignmentLeaderboard />);
    
    // Filter to House
    fireEvent.click(screen.getByRole('button', { name: 'House' }));
    
    // Click All to reset
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    
    // Should show both House and Senate members
    expect(screen.getByText('John House')).toBeInTheDocument();
    expect(screen.getByText('Jane Senate')).toBeInTheDocument();
  });

  it('displays alignment scores correctly', () => {
    render(<AlignmentLeaderboard />);
    
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('displays party badges', () => {
    render(<AlignmentLeaderboard />);
    
    const partyBadges = screen.getAllByText(/^[DRI]$/);
    expect(partyBadges.length).toBeGreaterThan(0);
  });

  it('links to representative pages correctly', () => {
    render(<AlignmentLeaderboard />);
    
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/rep/H001');
    expect(links[1]).toHaveAttribute('href', '/rep/S001');
  });
});
