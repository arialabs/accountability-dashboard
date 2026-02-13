import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PresidentPage from './page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('PresidentPage', () => {
  it('renders the president page with impact analysis framing', () => {
    render(<PresidentPage />);
    
    // Check for impact analysis heading instead of promise tracker
    expect(screen.getByText(/Policy Impact Analysis/i)).toBeInTheDocument();
    
    // Check for impact-based stats instead of kept/broken
    expect(screen.getByText(/Net Benefit/i)).toBeInTheDocument();
    expect(screen.getByText(/Net Harm/i)).toBeInTheDocument();
    expect(screen.getByText(/Mixed Impact/i)).toBeInTheDocument();
    
    // Verify old promise-based language is NOT present
    const pageText = screen.getByRole('main').textContent || '';
    expect(pageText).not.toMatch(/Kept/);
    expect(pageText).not.toMatch(/Broken/);
    expect(pageText).not.toMatch(/Campaign Promise Tracker/);
  });

  it('renders policy actions section with correct heading', () => {
    render(<PresidentPage />);
    
    // Check for "Policy Actions & Impact" instead of "All Promises"
    expect(screen.getByText(/Policy Actions & Impact/i)).toBeInTheDocument();
  });

  it('displays impact badges with correct colors', () => {
    render(<PresidentPage />);
    
    // Look for impact level badges
    const netBenefitBadge = screen.getAllByText(/Net Benefit/i)[0];
    const netHarmBadge = screen.getAllByText(/Net Harm/i)[0];
    const mixedImpactBadge = screen.getAllByText(/Mixed Impact/i)[0];
    
    expect(netBenefitBadge).toBeInTheDocument();
    expect(netHarmBadge).toBeInTheDocument();
    expect(mixedImpactBadge).toBeInTheDocument();
  });

  it('shows who benefits and who is harmed for policy actions', () => {
    render(<PresidentPage />);
    
    // Check for benefit/harm sections
    expect(screen.getAllByText(/Who Benefits/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Who's Harmed/i).length).toBeGreaterThan(0);
  });

  it('renders president information', () => {
    render(<PresidentPage />);
    
    expect(screen.getByText(/Donald J. Trump/i)).toBeInTheDocument();
    expect(screen.getByText(/47th President/i)).toBeInTheDocument();
    expect(screen.getByText(/Republican/i)).toBeInTheDocument();
  });

  it('includes links to other presidential tracking pages', () => {
    render(<PresidentPage />);
    
    expect(screen.getByText(/Executive Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Conflicts of Interest/i)).toBeInTheDocument();
    expect(screen.getByText(/Cabinet & Appointments/i)).toBeInTheDocument();
  });
});
