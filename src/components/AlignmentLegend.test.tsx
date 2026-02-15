import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlignmentLegend from './AlignmentLegend';

describe('AlignmentLegend', () => {
  it('renders legend in compact mode', () => {
    render(<AlignmentLegend compact />);
    
    expect(screen.getByText('Legend:')).toBeInTheDocument();
    expect(screen.getByText('Aligned')).toBeInTheDocument();
    expect(screen.getByText('Misaligned')).toBeInTheDocument();
    expect(screen.getByText('Mixed')).toBeInTheDocument();
  });

  it('renders full legend by default', () => {
    render(<AlignmentLegend />);
    
    expect(screen.getByText('📊 Score Legend')).toBeInTheDocument();
    expect(screen.getByText('High Alignment')).toBeInTheDocument();
    expect(screen.getByText('Mixed Record')).toBeInTheDocument();
    expect(screen.getByText('Low Alignment')).toBeInTheDocument();
  });

  it('shows score ranges in full mode', () => {
    render(<AlignmentLegend />);
    
    expect(screen.getByText('70-100%')).toBeInTheDocument();
    expect(screen.getByText('40-69%')).toBeInTheDocument();
    expect(screen.getByText('0-39%')).toBeInTheDocument();
  });

  it('shows explanation text in full mode', () => {
    render(<AlignmentLegend />);
    
    // Text is broken up by <strong> tags, so we check for parts
    expect(screen.getByText(/= votes match stated positions/i)).toBeInTheDocument();
    expect(screen.getByText(/Green/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<AlignmentLegend className="custom-class" />);
    
    const legend = container.querySelector('.custom-class');
    expect(legend).toBeInTheDocument();
  });
});
