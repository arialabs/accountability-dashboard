import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Navigation from './Navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Navigation', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    document.body.style.overflow = '';
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
    document.body.style.overflow = '';
  });

  describe('Desktop view', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    });

    it('renders desktop nav with dropdowns', () => {
      render(<Navigation />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Legislative')).toBeInTheDocument();
      expect(screen.getByText('Executive')).toBeInTheDocument();
      expect(screen.getByText('Judicial')).toBeInTheDocument();
      expect(screen.getByText('Scandals')).toBeInTheDocument();
    });

    it('opens dropdown on click', () => {
      render(<Navigation />);
      // Navigation dropdown opens on click (or mouseEnter)
      fireEvent.click(screen.getByText('Legislative'));
      expect(screen.getByText('House of Representatives')).toBeInTheDocument();
      expect(screen.getByText('Senate')).toBeInTheDocument();
      expect(screen.getByText('Bills & Votes')).toBeInTheDocument();
    });

    it('shows Coming Soon badge on Federal Courts', () => {
      render(<Navigation />);
      // Open the Judicial dropdown via click
      fireEvent.click(screen.getByText('Judicial'));
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('has search button', () => {
      render(<Navigation />);
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
    });
  });

  describe('Mobile view', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    });

    it('shows hamburger button', () => {
      render(<Navigation />);
      expect(screen.getByTestId('hamburger-button')).toBeInTheDocument();
    });

    it('opens mobile menu', () => {
      render(<Navigation />);
      fireEvent.click(screen.getByTestId('hamburger-button'));
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });

    it('expands mobile dropdown sections', () => {
      render(<Navigation />);
      fireEvent.click(screen.getByTestId('hamburger-button'));
      // Click Legislative section
      fireEvent.click(screen.getByText('🏛️ Legislative'));
      expect(screen.getByText('House of Representatives')).toBeInTheDocument();
    });

    it('has search in mobile menu', () => {
      render(<Navigation />);
      fireEvent.click(screen.getByTestId('hamburger-button'));
      expect(screen.getByText('🔍 Search')).toBeInTheDocument();
    });

    it('prevents body scroll when open', () => {
      render(<Navigation />);
      fireEvent.click(screen.getByTestId('hamburger-button'));
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('closes on overlay click', async () => {
      render(<Navigation />);
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      fireEvent.click(screen.getByTestId('menu-overlay'));
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-label', 'Open menu');
      }, { timeout: 300 });
    });
  });
});
