import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EpsteinFilesCard from './EpsteinFilesCard';

describe('EpsteinFilesCard', () => {
  it('renders the full variant with correct content', () => {
    render(<EpsteinFilesCard variant="full" />);
    
    expect(screen.getByText('Epstein Files Explorer')).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive investigation into the Jeffrey Epstein case/)).toBeInTheDocument();
    expect(screen.getByText(/Explore full investigation/)).toBeInTheDocument();
  });

  it('renders the compact variant with correct content', () => {
    render(<EpsteinFilesCard variant="compact" />);
    
    expect(screen.getByText('Epstein Files Explorer')).toBeInTheDocument();
    expect(screen.getByText(/Interactive timeline, network connections/)).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
  });

  it('renders as an external link with correct attributes', () => {
    const { container } = render(<EpsteinFilesCard />);
    const link = container.querySelector('a');
    
    expect(link).toHaveAttribute('href', 'https://epstein.arialabs.ai');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies custom className', () => {
    const { container } = render(<EpsteinFilesCard className="custom-class" />);
    const link = container.querySelector('a');
    
    expect(link).toHaveClass('custom-class');
  });

  it('renders card accent bar', () => {
    const { container } = render(<EpsteinFilesCard />);
    // Full card has a purple accent bar at top
    const accentBar = container.querySelector('.h-1');
    expect(accentBar).not.toBeNull();
  });

  it('shows document stats in full variant', () => {
    render(<EpsteinFilesCard variant="full" />);
    expect(screen.getByText('2,100+')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
    expect(screen.getByText('Named individuals')).toBeInTheDocument();
  });

  it('uses JetBrains Mono for stat numbers', () => {
    const { container } = render(<EpsteinFilesCard variant="full" />);
    const monoElements = container.querySelectorAll('[style*="JetBrains Mono"]');
    expect(monoElements.length).toBeGreaterThan(0);
  });

  it('uses Newsreader for the card title', () => {
    const { container } = render(<EpsteinFilesCard variant="full" />);
    const heading = container.querySelector('h3');
    expect(heading?.getAttribute('style')).toContain('Newsreader');
  });
});
