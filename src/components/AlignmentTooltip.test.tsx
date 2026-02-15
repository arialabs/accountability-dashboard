import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlignmentTooltip from './AlignmentTooltip';

describe('AlignmentTooltip', () => {
  it('renders the tooltip button', () => {
    render(<AlignmentTooltip />);
    expect(screen.getByLabelText('How is this scored?')).toBeInTheDocument();
  });

  it('shows tooltip content when clicked', () => {
    render(<AlignmentTooltip averageScore={54} extended />);
    
    const button = screen.getByLabelText('How is this scored?');
    fireEvent.click(button);
    
    expect(screen.getByText(/Alignment Score Explained/i)).toBeInTheDocument();
    // Check that average alignment section is present
    expect(screen.getByText(/Average alignment/i)).toBeInTheDocument();
  });

  it('closes tooltip when close button is clicked', () => {
    render(<AlignmentTooltip />);
    
    const button = screen.getByLabelText('How is this scored?');
    fireEvent.click(button);
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText(/Alignment Score Explained/i)).not.toBeInTheDocument();
  });

  it('shows extended content when extended prop is true', () => {
    render(<AlignmentTooltip extended />);
    
    const button = screen.getByLabelText('How is this scored?');
    fireEvent.click(button);
    
    expect(screen.getByText(/Score ranges:/i)).toBeInTheDocument();
    expect(screen.getByText(/70-100%:/i)).toBeInTheDocument();
  });

  it('links to methodology page', () => {
    render(<AlignmentTooltip />);
    
    const button = screen.getByLabelText('How is this scored?');
    fireEvent.click(button);
    
    const link = screen.getByRole('link', { name: /Full methodology/i });
    expect(link).toHaveAttribute('href', '/methodology');
  });
});
