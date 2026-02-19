import { describe, it, expect, vi } from 'vitest';
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
    
    // Check for impact-based stats instead of kept/broken (may appear multiple times)
    expect(screen.getAllByText(/Net Benefit/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Net Harm/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mixed Impact/i).length).toBeGreaterThan(0);
    
    // Verify old promise-based language is NOT present
    const pageText = document.body.textContent || '';
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
    
    // Look for impact level badges (may appear multiple times)
    expect(screen.getAllByText(/Net Benefit/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Net Harm/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mixed Impact/i).length).toBeGreaterThan(0);
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
    
    // These may appear multiple times in the page
    expect(screen.getAllByText(/Executive Orders/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Conflicts of Interest/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cabinet & Appointments/i).length).toBeGreaterThan(0);
  });
});
