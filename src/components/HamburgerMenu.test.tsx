import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HamburgerMenu from './HamburgerMenu';

describe('HamburgerMenu', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    document.body.style.overflow = '';
  });

  describe('Desktop view (≥768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('renders all navigation links', () => {
      render(<HamburgerMenu />);
      
      const links = ['Home', 'Executive', 'Legislative', 'Judicial', 'Bills', 'Scandals'];
      links.forEach(link => {
        expect(screen.getByText(link)).toBeInTheDocument();
      });
    });

    it('does not show hamburger button', () => {
      render(<HamburgerMenu />);
      const button = screen.getByTestId('hamburger-button');
      expect(button).toHaveClass('md:hidden');
    });
  });

  describe('Mobile view (320px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
    });

    it('shows hamburger button', () => {
      render(<HamburgerMenu />);
      const button = screen.getByTestId('hamburger-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Open menu');
    });

    it('opens menu when hamburger is clicked', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      expect(button).toHaveAttribute('aria-label', 'Close menu');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });

    it('closes menu when close button is clicked', async () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-label', 'Open menu');
      }, { timeout: 300 });
    });

    it('closes menu when overlay is clicked', async () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      const overlay = screen.getByTestId('menu-overlay');
      fireEvent.click(overlay);
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-label', 'Open menu');
      }, { timeout: 300 });
    });

    it('closes menu when a link is clicked', async () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      const homeLink = screen.getAllByText('Home').find(el => 
        el.closest('[data-testid="mobile-menu"]')
      );
      
      if (homeLink) {
        fireEvent.click(homeLink);
        
        await waitFor(() => {
          expect(button).toHaveAttribute('aria-label', 'Open menu');
        }, { timeout: 300 });
      }
    });

    it('prevents body scroll when menu is open', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when menu is closed', async () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('');
      }, { timeout: 300 });
    });

    it('has proper ARIA attributes when closed', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      expect(button).toHaveAttribute('aria-label', 'Open menu');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('has proper ARIA attributes when open', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      expect(button).toHaveAttribute('aria-label', 'Close menu');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('has focus styles for accessibility', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });
  });

  describe('Mobile view (375px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('shows hamburger button at 375px', () => {
      render(<HamburgerMenu />);
      const button = screen.getByTestId('hamburger-button');
      expect(button).toBeInTheDocument();
    });

    it('renders mobile menu with all links', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      const menu = screen.getByTestId('mobile-menu');
      expect(menu).toBeInTheDocument();
      
      const links = ['Home', 'Executive', 'Legislative', 'Judicial', 'Bills', 'Scandals'];
      links.forEach(link => {
        const elements = screen.getAllByText(link);
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Tablet view (768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('shows hamburger button at 768px breakpoint', () => {
      render(<HamburgerMenu />);
      const button = screen.getByTestId('hamburger-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Window resize behavior', () => {
    it('closes menu when window is resized to desktop width', async () => {
      // Start at mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      expect(button).toHaveAttribute('aria-expanded', 'true');
      
      // Resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-label', 'Open menu');
      }, { timeout: 300 });
    });

    it('does not close menu when resized within mobile range', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      // Resize to another mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      
      fireEvent(window, new Event('resize'));
      
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Animations', () => {
    it('applies transition classes to hamburger icon', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      const spans = button.querySelectorAll('span');
      
      expect(spans.length).toBe(3);
      spans.forEach(span => {
        expect(span).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
      });
    });

    it('transforms hamburger to X when open', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      const spans = button.querySelectorAll('span');
      expect(spans[0]).toHaveClass('rotate-45', 'translate-y-2');
      expect(spans[1]).toHaveClass('opacity-0');
      expect(spans[2]).toHaveClass('-rotate-45', '-translate-y-2');
    });

    it('applies slide animation to mobile menu', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      const menu = screen.getByTestId('mobile-menu');
      expect(menu).toHaveClass('transition-transform', 'duration-200');
    });

    it('applies fade animation to overlay', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      const overlay = screen.getByTestId('menu-overlay');
      expect(overlay).toHaveClass('transition-opacity', 'duration-200');
    });
  });

  describe('Touch target sizes', () => {
    it('has minimum 44px touch targets for mobile links', () => {
      render(<HamburgerMenu />);
      
      const button = screen.getByTestId('hamburger-button');
      fireEvent.click(button);
      
      const menu = screen.getByTestId('mobile-menu');
      const links = menu.querySelectorAll('a');
      
      links.forEach(link => {
        expect(link).toHaveClass('min-h-[44px]');
      });
    });

    it('has minimum 44px touch target for desktop links', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<HamburgerMenu />);
      
      const desktopNav = screen.getByText('Home').closest('div');
      if (desktopNav) {
        const links = desktopNav.querySelectorAll('a');
        links.forEach(link => {
          expect(link).toHaveClass('min-w-[44px]', 'min-h-[44px]');
        });
      }
    });
  });
});
