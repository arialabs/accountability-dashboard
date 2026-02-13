import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CongressPage from "./page";

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => '/congress',
}));

// Mock data functions
vi.mock('@/lib/data', () => ({
  getMembers: () => [
    {
      bioguide_id: 'P000197',
      first_name: 'Nancy',
      last_name: 'Pelosi',
      full_name: 'Nancy Pelosi',
      party: 'D',
      state: 'CA',
      district: 12,
      chamber: 'house',
      photo_url: null,
      bills_sponsored: 10,
      bills_cosponsored: 50,
      committees: [],
      party_alignment_pct: 95,
      ideology_score: -0.5,
      votes_cast: 500,
    },
    {
      bioguide_id: 'S000344',
      first_name: 'Adam',
      last_name: 'Schiff',
      full_name: 'Adam Schiff',
      party: 'D',
      state: 'CA',
      district: 30,
      chamber: 'house',
      photo_url: null,
      bills_sponsored: 15,
      bills_cosponsored: 60,
      committees: [],
      party_alignment_pct: 92,
      ideology_score: -0.6,
      votes_cast: 480,
    },
    {
      bioguide_id: 'C001118',
      first_name: 'Ted',
      last_name: 'Cruz',
      full_name: 'Ted Cruz',
      party: 'R',
      state: 'TX',
      district: null,
      chamber: 'senate',
      photo_url: null,
      bills_sponsored: 20,
      bills_cosponsored: 70,
      committees: [],
      party_alignment_pct: 90,
      ideology_score: 1.2,
      votes_cast: 450,
    },
  ],
  getPartyBreakdown: () => ({
    total: 535,
    democrats: 213,
    republicans: 222,
    independents: 0,
    other: 0,
    house: 435,
    senate: 100,
  }),
  getStates: () => [
    { abbrev: 'CA', name: 'California', count: 52 },
    { abbrev: 'TX', name: 'Texas', count: 38 },
    { abbrev: 'NY', name: 'New York', count: 26 },
  ],
  getMemberFinanceStatic: () => ({
    pac_percentage: 30,
    large_donor_percentage: 45,
  }),
}));

vi.mock('@/lib/grading', () => ({
  calculateGrade: () => ({
    letter: 'B',
    breakdown: {
      donorScore: 75,
      votingScore: 80,
      tradingScore: 70,
      disclosureScore: 85,
    },
  }),
}));

describe('Congress Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the main heading', () => {
    render(<CongressPage />);
    expect(screen.getByText('Congress Members')).toBeDefined();
  });

  it('displays search input with correct placeholder', () => {
    render(<CongressPage />);
    const searchInput = screen.getByPlaceholderText(/Search by name, state, or district/i);
    expect(searchInput).toBeDefined();
  });

  it('renders Find My Reps button', () => {
    render(<CongressPage />);
    const findMyRepsButton = screen.getByText('Find My Reps');
    expect(findMyRepsButton).toBeDefined();
  });

  it('shows all party filter buttons', () => {
    render(<CongressPage />);
    expect(screen.getByText(/All \(/)).toBeDefined();
    expect(screen.getByText(/Democrat \(/)).toBeDefined();
    expect(screen.getByText(/Republican \(/)).toBeDefined();
    expect(screen.getByText(/Independent \(/)).toBeDefined();
  });

  it('renders state dropdown', () => {
    render(<CongressPage />);
    const stateSelect = screen.getByLabelText('State');
    expect(stateSelect).toBeDefined();
  });

  it('renders chamber dropdown', () => {
    render(<CongressPage />);
    const chamberSelect = screen.getByLabelText('Chamber');
    expect(chamberSelect).toBeDefined();
  });

  it('displays member cards with names', () => {
    render(<CongressPage />);
    expect(screen.getByText('Nancy Pelosi')).toBeDefined();
    expect(screen.getByText('Adam Schiff')).toBeDefined();
    expect(screen.getByText('Ted Cruz')).toBeDefined();
  });

  it('filters by state correctly', async () => {
    render(<CongressPage />);
    
    const stateSelect = screen.getByLabelText('State');
    fireEvent.change(stateSelect, { target: { value: 'CA' } });

    await waitFor(() => {
      expect(screen.getByText('Nancy Pelosi')).toBeDefined();
      expect(screen.getByText('Adam Schiff')).toBeDefined();
      expect(screen.queryByText('Ted Cruz')).toBeNull();
    });
  });

  it('filters by party correctly', async () => {
    render(<CongressPage />);
    
    const republicanButton = screen.getByText(/Republican \(/);
    fireEvent.click(republicanButton);

    await waitFor(() => {
      expect(screen.queryByText('Nancy Pelosi')).toBeNull();
      expect(screen.queryByText('Adam Schiff')).toBeNull();
      expect(screen.getByText('Ted Cruz')).toBeDefined();
    });
  });

  it('filters by chamber correctly', async () => {
    render(<CongressPage />);
    
    const chamberSelect = screen.getByLabelText('Chamber');
    fireEvent.change(chamberSelect, { target: { value: 'senate' } });

    await waitFor(() => {
      expect(screen.queryByText('Nancy Pelosi')).toBeNull();
      expect(screen.queryByText('Adam Schiff')).toBeNull();
      expect(screen.getByText('Ted Cruz')).toBeDefined();
    });
  });

  it('searches by name', async () => {
    render(<CongressPage />);
    
    const searchInput = screen.getByPlaceholderText(/Search by name, state, or district/i);
    fireEvent.change(searchInput, { target: { value: 'Pelosi' } });

    await waitFor(() => {
      expect(screen.getByText('Nancy Pelosi')).toBeDefined();
      expect(screen.queryByText('Adam Schiff')).toBeNull();
      expect(screen.queryByText('Ted Cruz')).toBeNull();
    }, { timeout: 500 });
  });

  it('searches by state abbreviation', async () => {
    render(<CongressPage />);
    
    const searchInput = screen.getByPlaceholderText(/Search by name, state, or district/i);
    fireEvent.change(searchInput, { target: { value: 'TX' } });

    await waitFor(() => {
      expect(screen.queryByText('Nancy Pelosi')).toBeNull();
      expect(screen.queryByText('Adam Schiff')).toBeNull();
      expect(screen.getByText('Ted Cruz')).toBeDefined();
    }, { timeout: 500 });
  });

  it('searches by district (e.g., CA-12)', async () => {
    render(<CongressPage />);
    
    const searchInput = screen.getByPlaceholderText(/Search by name, state, or district/i);
    fireEvent.change(searchInput, { target: { value: 'CA-12' } });

    await waitFor(() => {
      expect(screen.getByText('Nancy Pelosi')).toBeDefined();
      expect(screen.queryByText('Adam Schiff')).toBeNull();
      expect(screen.queryByText('Ted Cruz')).toBeNull();
    }, { timeout: 500 });
  });

  it('shows filter chips when filters are active', async () => {
    render(<CongressPage />);
    
    const stateSelect = screen.getByLabelText('State');
    fireEvent.change(stateSelect, { target: { value: 'CA' } });

    await waitFor(() => {
      expect(screen.getByText('Active filters:')).toBeDefined();
      expect(screen.getByText(/State: CA/)).toBeDefined();
    });
  });

  it('removes filter when clicking chip close button', async () => {
    render(<CongressPage />);
    
    // Set state filter
    const stateSelect = screen.getByLabelText('State');
    fireEvent.change(stateSelect, { target: { value: 'CA' } });

    await waitFor(() => {
      expect(screen.getByText(/State: CA/)).toBeDefined();
    });

    // Click the close button on the chip
    const stateChip = screen.getByText(/State: CA/).closest('button');
    if (stateChip) fireEvent.click(stateChip);

    await waitFor(() => {
      expect(screen.queryByText(/State: CA/)).toBeNull();
      // All members should be visible again
      expect(screen.getByText('Ted Cruz')).toBeDefined();
    });
  });

  it('clears all filters when clicking clear filters button', async () => {
    render(<CongressPage />);
    
    // Set multiple filters
    const stateSelect = screen.getByLabelText('State');
    fireEvent.change(stateSelect, { target: { value: 'CA' } });
    
    const democratButton = screen.getByText(/Democrat \(/);
    fireEvent.click(democratButton);

    await waitFor(() => {
      expect(screen.getByText('Clear filters ✕')).toBeDefined();
    });

    // Clear all filters
    const clearButton = screen.getByText('Clear filters ✕');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText('Active filters:')).toBeNull();
      // All members should be visible
      expect(screen.getByText('Nancy Pelosi')).toBeDefined();
      expect(screen.getByText('Ted Cruz')).toBeDefined();
    });
  });

  it('shows "YOUR REP" badge for user representatives', async () => {
    // Set user state in localStorage
    localStorage.setItem('userState', 'CA');
    
    render(<CongressPage />);
    
    await waitFor(() => {
      const badges = screen.getAllByText('YOUR REP');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('highlights user representatives with special styling', async () => {
    localStorage.setItem('userState', 'CA');
    
    const { container } = render(<CongressPage />);
    
    await waitFor(() => {
      const highlightedCards = container.querySelectorAll('.ring-blue-200');
      expect(highlightedCards.length).toBeGreaterThan(0);
    });
  });

  it('displays stats cards with correct counts', () => {
    render(<CongressPage />);
    
    expect(screen.getByText('535')).toBeDefined();
    expect(screen.getByText('213')).toBeDefined();
    expect(screen.getByText('222')).toBeDefined();
  });

  it('shows member grade badges', () => {
    render(<CongressPage />);
    
    const gradeBadges = screen.getAllByText('B');
    expect(gradeBadges.length).toBeGreaterThan(0);
  });

  it('displays "No members match" message when no results', async () => {
    render(<CongressPage />);
    
    const searchInput = screen.getByPlaceholderText(/Search by name, state, or district/i);
    fireEvent.change(searchInput, { target: { value: 'ZZZZZZZ' } });

    await waitFor(() => {
      expect(screen.getByText(/No members match your filters/i)).toBeDefined();
    }, { timeout: 500 });
  });
});
