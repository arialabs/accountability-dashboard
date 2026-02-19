import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AccountabilityDataCard from './AccountabilityDataCard';

describe('AccountabilityDataCard', () => {
  it('renders value and label', () => {
    render(<AccountabilityDataCard value="$21.3M" label="PAC Donations" />);
    expect(screen.getByText('$21.3M')).toBeInTheDocument();
    expect(screen.getByText('PAC Donations')).toBeInTheDocument();
  });

  it('renders trend-up indicator with context', () => {
    render(
      <AccountabilityDataCard
        value="65%"
        label="Portfolio return"
        indicator="up"
        context="above median"
      />
    );
    expect(screen.getByLabelText('trending up')).toBeInTheDocument();
    expect(screen.getByText('above median')).toBeInTheDocument();
  });

  it('renders trend-down indicator', () => {
    render(
      <AccountabilityDataCard
        value="12%"
        label="Attendance rate"
        indicator="down"
        context="below average"
      />
    );
    expect(screen.getByLabelText('trending down')).toBeInTheDocument();
  });

  it('renders flag indicator', () => {
    render(
      <AccountabilityDataCard
        value="87%"
        label="Bills opposed"
        indicator="flag"
        context="Flagged: exceeds threshold"
      />
    );
    expect(screen.getByLabelText('flagged')).toBeInTheDocument();
    expect(screen.getByText('Flagged: exceeds threshold')).toBeInTheDocument();
  });

  it('renders light variant with border accent', () => {
    const { container } = render(
      <AccountabilityDataCard value="2,100+" label="Documents" light />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains('border-l-2')).toBe(true);
    expect(screen.getByText('2,100+')).toBeInTheDocument();
  });

  it('renders dark variant with teal value color', () => {
    render(<AccountabilityDataCard value="535" label="Members tracked" />);
    const valueEl = screen.getByText('535');
    expect(valueEl).toHaveStyle({ color: '#5EEAD4' });
  });

  it('does not show indicator aria-label when neutral', () => {
    render(<AccountabilityDataCard value="9" label="Justices" indicator="neutral" />);
    // No trending up/down/flagged labels
    expect(screen.queryByLabelText('trending up')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('trending down')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('flagged')).not.toBeInTheDocument();
  });
});
