import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlignmentLeaderboard from './AlignmentLeaderboard';

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
  it('should not render the Say vs Do leaderboard (issue #84)', () => {
    const { container } = render(<AlignmentLeaderboard />);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByText('Say vs. Do Leaderboard')).toBeNull();
  });

  it('should not render any leaderboard content when feature flag is off', () => {
    const { container } = render(<AlignmentLeaderboard />);
    expect(container.firstChild).toBeNull();
  });
});
