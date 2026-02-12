import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EpsteinFilesCard from './EpsteinFilesCard';

describe('EpsteinFilesCard', () => {
  it('renders the full variant with correct content', () => {
    render(<EpsteinFilesCard variant="full" />);
    
    expect(screen.getByText('Epstein Files Explorer')).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive investigation into the Jeffrey Epstein case/)).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
  });

  it('renders the compact variant with correct content', () => {
    render(<EpsteinFilesCard variant="compact" />);
    
    expect(screen.getByText('Epstein Files Explorer')).toBeInTheDocument();
    expect(screen.getByText(/Dive deep into the Jeffrey Epstein case files/)).toBeInTheDocument();
    expect(screen.getByText('Explore Deep Dive')).toBeInTheDocument();
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

  it('has proper hover states and transition classes', () => {
    const { container } = render(<EpsteinFilesCard />);
    const link = container.querySelector('a');
    
    expect(link).toHaveClass('hover:-translate-y-2');
    expect(link).toHaveClass('transition-all');
    expect(link).toHaveClass('hover:border-purple-400');
  });
});
