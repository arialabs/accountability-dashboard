import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PolicyDetailPage from './page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock the policy data module
vi.mock('@/lib/policy-data', () => ({
  getPolicy: vi.fn((slug: string) => {
    if (slug === 'test-policy') {
      return {
        slug: 'test-policy',
        title: 'Test Policy',
        summary: 'A test policy for verification',
        category: 'economy',
        promise_alignment: 75,
        impact_score: 58,
        americans_affected: 100000000,
        last_updated: '2025-02-01',
        what_was_promised: 'This was the campaign promise',
        what_actually_happened: ['Action 1', 'Action 2'],
        impact_factors: {
          economic: 5,
          social: -3,
          polling: 2,
          expert: -2,
        },
        economic_data: [
          {
            metric: 'Job Growth',
            value: '+150K',
            source: 'BLS',
            source_url: 'https://bls.gov',
            date: '2025-01-31',
          },
        ],
        polling_data: [
          {
            pollster: 'Test Poll',
            approve: 45,
            disapprove: 50,
            no_opinion: 5,
            sample_size: 1000,
            date: '2025-01-31',
          },
        ],
        expert_analyses: [],
        timeline: [],
      };
    }
    return null;
  }),
  getPolicies: vi.fn(() => [{ slug: 'test-policy' }]),
  POLICY_CATEGORIES: {
    economy: { name: 'Economy', icon: '💰' },
  },
  formatNumber: vi.fn((n: number) => n.toLocaleString()),
  getPromiseQuadrant: vi.fn(() => ({
    label: 'Mixed Results',
    description: 'Partially aligned with moderate impact',
    icon: '⚠️',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  })),
}));

describe('PolicyDetailPage', () => {
  const mockParams = { slug: 'test-policy' };

  it('removes promise fulfillment framing', () => {
    render(<PolicyDetailPage params={mockParams} />);
    
    const pageText = document.body.textContent || '';
    
    // Should NOT contain promise fulfillment language
    expect(pageText).not.toMatch(/Mostly kept/i);
    expect(pageText).not.toMatch(/Partially kept/i);
    expect(pageText).not.toMatch(/Broken/i);
    expect(pageText).not.toMatch(/Promise vs Reality/i);
    expect(pageText).not.toMatch(/What Was Promised/i);
  });

  it('uses impact-focused language', () => {
    render(<PolicyDetailPage params={mockParams} />);
    
    // Should contain impact-focused headings
    expect(screen.getByText(/Policy vs Campaign Rhetoric/i)).toBeInTheDocument();
    expect(screen.getByText(/Campaign Rhetoric/i)).toBeInTheDocument();
    expect(screen.getByText(/Actual Policy Actions/i)).toBeInTheDocument();
  });

  it('shows campaign alignment instead of promise kept/broken', () => {
    render(<PolicyDetailPage params={mockParams} />);
    
    // Check for "Campaign Alignment" label
    expect(screen.getAllByText(/Campaign Alignment/i).length).toBeGreaterThan(0);
    
    // Should show alignment levels, not kept/broken
    const pageText = document.body.textContent || '';
    expect(pageText).toMatch(/alignment/i);
  });

  it('displays impact score with proper context', () => {
    render(<PolicyDetailPage params={mockParams} />);
    
    // Should show impact score
    expect(screen.getByText(/Impact Score/i)).toBeInTheDocument();
  });

  it('renders measurable outcomes section', () => {
    render(<PolicyDetailPage params={mockParams} />);
    
    expect(screen.getByText(/Measurable Outcomes/i)).toBeInTheDocument();
    expect(screen.getByText(/Job Growth/i)).toBeInTheDocument();
  });

  it('renders public polling section', () => {
    render(<PolicyDetailPage params={mockParams} />);
    
    expect(screen.getByText(/Public Polling/i)).toBeInTheDocument();
    expect(screen.getByText(/Approve/i)).toBeInTheDocument();
    expect(screen.getByText(/Disapprove/i)).toBeInTheDocument();
  });

  it('shows how the score was calculated', () => {
    render(<PolicyDetailPage params={mockParams} />);
    
    expect(screen.getByText(/How This Score Was Calculated/i)).toBeInTheDocument();
    expect(screen.getByText(/Economic Impact/i)).toBeInTheDocument();
    expect(screen.getByText(/Social Impact/i)).toBeInTheDocument();
  });
});
