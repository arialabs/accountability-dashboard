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
  // Removed: scoring algorithm needs redesign (#84)
  it('should not render the Say vs Do leaderboard (issue #84)', () => {
    const { container } = render(<AlignmentLeaderboard />);
    expect(container.innerHTML).toBe('');
    expect(screen.queryByText('Say vs. Do Leaderboard')).toBeNull();
  });

  it('should return null until scoring algorithm is redesigned', () => {
    const { container } = render(<AlignmentLeaderboard />);
    expect(container.firstChild).toBeNull();
  });
});
