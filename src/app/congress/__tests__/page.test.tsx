import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CongressPage from '../page';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock data modules
vi.mock('@/lib/data', () => ({
  getMembers: vi.fn(() => [
    {
      bioguide_id: 'S000148',
      first_name: 'Charles',
      last_name: 'Schumer',
      full_name: 'Charles Schumer',
      party: 'D',
      state: 'NY',
      district: null,
      chamber: 'senate',
      photo_url: null,
      bills_sponsored: 50,
      bills_cosponsored: 200,
      committees: [],
      party_alignment_pct: 95,
      ideology_score: -2.5,
      votes_cast: 300,
    },
    {
      bioguide_id: 'A000370',
      first_name: 'Alma',
      last_name: 'Adams',
      full_name: 'Alma Adams',
      party: 'D',
      state: 'NC',
      district: 12,
      chamber: 'house',
      photo_url: null,
      bills_sponsored: 25,
      bills_cosponsored: 150,
      committees: [],
      party_alignment_pct: 92,
      ideology_score: -1.8,
      votes_cast: 500,
    },
    {
      bioguide_id: 'M000355',
      first_name: 'Mitch',
      last_name: 'McConnell',
      full_name: 'Mitch McConnell',
      party: 'R',
      state: 'KY',
      district: null,
      chamber: 'senate',
      photo_url: null,
      bills_sponsored: 30,
      bills_cosponsored: 100,
      committees: [],
      party_alignment_pct: 93,
      ideology_score: 2.1,
      votes_cast: 290,
    },
    {
      bioguide_id: 'P000197',
      first_name: 'Nancy',
      last_name: 'Pelosi',
      full_name: 'Nancy Pelosi',
      party: 'D',
      state: 'CA',
      district: 11,
      chamber: 'house',
      photo_url: null,
      bills_sponsored: 40,
      bills_cosponsored: 180,
      committees: [],
      party_alignment_pct: 96,
      ideology_score: -2.2,
      votes_cast: 520,
    },
  ]),
  getPartyBreakdown: vi.fn(() => ({
    total: 4,
    democrats: 3,
    republicans: 1,
    independents: 0,
    other: 0,
    house: 2,
    senate: 2,
  })),
  getStates: vi.fn(() => [
    { abbrev: 'CA', name: 'California', count: 1 },
    { abbrev: 'KY', name: 'Kentucky', count: 1 },
    { abbrev: 'NC', name: 'North Carolina', count: 1 },
    { abbrev: 'NY', name: 'New York', count: 1 },
  ]),
  getMemberFinanceStatic: vi.fn(() => ({
    candidate_id: 'TEST123',
    cycle: 2024,
    total_raised: 1000000,
    pac_percentage: 25,
    large_donor_percentage: 40,
  })),
}));

vi.mock('@/lib/grading', () => ({
  calculateGrade: vi.fn(() => ({
    letter: 'B',
    score: 85,
    breakdown: {
      donorScore: 75,
      votingScore: 90,
      tradingScore: 85,
      disclosureScore: 88,
    },
  })),
}));

vi.mock('@/components/RepresentativeImage', () => ({
  default: ({ fullName }: { fullName: string }) => <div>{fullName} Image</div>,
}));

vi.mock('@/components/PartyLoyaltyChart', () => ({
  default: () => <div>Party Loyalty Chart</div>,
}));

vi.mock('@/components/IdeologySpectrumChart', () => ({
  default: () => <div>Ideology Spectrum Chart</div>,
}));

describe('CongressPage', () => {
  const mockReplace = vi.fn();
  const mockGet = vi.fn();
  
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    
    // Reset mocks
    mockReplace.mockClear();
    mockGet.mockReset().mockReturnValue(null);
    
    // Setup navigation mocks
    (useRouter as any).mockReturnValue({
      replace: mockReplace,
    });
    (usePathname as any).mockReturnValue('/congress');
    (useSearchParams as any).mockReturnValue({
      get: mockGet,
    });
    
    // Mock fetch for geolocation
    global.fetch = vi.fn();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Filter Functionality', () => {
    it('filters members by state', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      // Select NY state
      const stateDropdown = screen.getByLabelText(/state/i);
      fireEvent.change(stateDropdown, { target: { value: 'NY' } });
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
        expect(screen.queryByText('Alma Adams')).not.toBeInTheDocument();
      });
    });

    it('filters members by chamber', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      const chamberDropdown = screen.getByLabelText(/chamber/i);
      fireEvent.change(chamberDropdown, { target: { value: 'senate' } });
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
        expect(screen.getByText('Mitch McConnell')).toBeInTheDocument();
        expect(screen.queryByText('Alma Adams')).not.toBeInTheDocument();
      });
    });

    it('filters members by party', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      const republicanButton = screen.getByRole('button', { name: /Republican/i });
      fireEvent.click(republicanButton);
      
      await waitFor(() => {
        expect(screen.getByText('Mitch McConnell')).toBeInTheDocument();
        expect(screen.queryByText('Charles Schumer')).not.toBeInTheDocument();
      });
    });

    it('searches by member name', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'Pelosi' } });
      
      await waitFor(() => {
        expect(screen.getByText('Nancy Pelosi')).toBeInTheDocument();
        expect(screen.queryByText('Charles Schumer')).not.toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('searches by district (e.g., NC-12)', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Alma Adams')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'NC-12' } });
      
      await waitFor(() => {
        expect(screen.getByText('Alma Adams')).toBeInTheDocument();
        expect(screen.queryByText('Nancy Pelosi')).not.toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Filter Chips', () => {
    it('displays active filter chips', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      // Add state filter
      const stateDropdown = screen.getByLabelText(/state/i);
      fireEvent.change(stateDropdown, { target: { value: 'CA' } });
      
      await waitFor(() => {
        expect(screen.getByText(/State: CA/i)).toBeInTheDocument();
      });
    });

    it('removes individual filter chips', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      // Add state filter
      const stateDropdown = screen.getByLabelText(/state/i);
      fireEvent.change(stateDropdown, { target: { value: 'CA' } });
      
      await waitFor(() => {
        const chipButton = screen.getByRole('button', { name: /State: CA/i });
        expect(chipButton).toBeInTheDocument();
        
        // Click the chip to remove it
        fireEvent.click(chipButton);
      });
      
      await waitFor(() => {
        expect(screen.queryByText(/State: CA/i)).not.toBeInTheDocument();
      });
    });

    it('clears all filters with "Clear all" button', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      // Add multiple filters
      const stateDropdown = screen.getByLabelText(/state/i);
      fireEvent.change(stateDropdown, { target: { value: 'CA' } });
      
      const chamberDropdown = screen.getByLabelText(/chamber/i);
      fireEvent.change(chamberDropdown, { target: { value: 'house' } });
      
      await waitFor(() => {
        expect(screen.getByText(/State: CA/i)).toBeInTheDocument();
        expect(screen.getByText(/Chamber: House/i)).toBeInTheDocument();
      });
      
      // Clear all
      const clearAllButton = screen.getByRole('button', { name: /Clear all/i });
      fireEvent.click(clearAllButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/State: CA/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Chamber: House/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('URL State Management', () => {
    it('reads filters from URL params on mount', async () => {
      mockGet.mockImplementation((param: string) => {
        if (param === 'state') return 'NY';
        if (param === 'party') return 'D';
        return null;
      });
      
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
        expect(screen.queryByText('Mitch McConnell')).not.toBeInTheDocument();
      });
    });

    it('updates URL when filters change', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      const stateDropdown = screen.getByLabelText(/state/i);
      fireEvent.change(stateDropdown, { target: { value: 'NY' } });
      
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining('state=NY'),
          expect.anything()
        );
      });
    });
  });

  describe('Find My Representatives', () => {
    it('shows "Find My Reps" button', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Find My Reps/i });
        expect(button).toBeInTheDocument();
      });
    });

    it('calls geolocation API and filters by detected state', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ region_code: 'CA' }),
      });
      
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      const findMyRepsButton = screen.getByRole('button', { name: /Find My Reps/i });
      fireEvent.click(findMyRepsButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('https://ipapi.co/json/');
        expect(screen.getByText('Nancy Pelosi')).toBeInTheDocument();
      });
    });

    it('saves user state to localStorage', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ region_code: 'NY' }),
      });
      
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      const findMyRepsButton = screen.getByRole('button', { name: /Find My Reps/i });
      fireEvent.click(findMyRepsButton);
      
      await waitFor(() => {
        expect(localStorage.getItem('userHomeState')).toBe('NY');
      });
    });

    it('shows user representative badge when viewing user state', async () => {
      // Pre-populate localStorage
      localStorage.setItem('userHomeState', 'NY');
      
      mockGet.mockImplementation((param: string) => {
        if (param === 'state') return 'NY';
        return null;
      });
      
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/Your Representatives \(NY\)/i)).toBeInTheDocument();
      });
    });

    it('handles geolocation API failure gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      // Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      const findMyRepsButton = screen.getByRole('button', { name: /Find My Reps/i });
      fireEvent.click(findMyRepsButton);
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('Could not detect your location')
        );
      });
      
      alertMock.mockRestore();
    });
  });

  describe('Result Count Display', () => {
    it('shows total count when no filters active', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.textContent === 'All 4 members of the 119th United States Congress';
        })).toBeInTheDocument();
      });
    });

    it('shows filtered count when filters are active', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      const stateDropdown = screen.getByLabelText(/state/i);
      fireEvent.change(stateDropdown, { target: { value: 'CA' } });
      
      await waitFor(() => {
        expect(screen.getByText(/Showing 1 of 4 members/i)).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('renders filter UI with mobile-friendly classes', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search by name/i);
        expect(searchInput).toHaveClass('min-h-[44px]'); // Touch-friendly height
      });
    });
  });

  describe('Clear Search Button', () => {
    it('clears search input when X button is clicked', async () => {
      render(<CongressPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Charles Schumer')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'Schumer' } });
      
      await waitFor(() => {
        const clearButton = screen.getByLabelText(/clear search/i);
        expect(clearButton).toBeInTheDocument();
        fireEvent.click(clearButton);
      });
      
      expect((searchInput as HTMLInputElement).value).toBe('');
    });
  });
});
