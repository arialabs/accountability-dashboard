'use client';

import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/executive', label: 'Executive' },
  { href: '/executive/doge', label: '🐕 DOGE' },
  { href: '/legislative', label: 'Legislative' },
  { href: '/judicial', label: 'Judicial' },
  { href: '/bills', label: 'Bills' },
  { href: '/scandals', label: 'Scandals' },
];

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Close menu on route change
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 200); // Match animation duration
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Desktop navigation - hidden on mobile */}
      <div className="hidden md:flex gap-3 sm:gap-6 text-sm font-medium">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-slate-600 hover:text-slate-900 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Hamburger button - visible on mobile only */}
      <button
        onClick={handleToggle}
        className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        data-testid="hamburger-button"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col gap-1.5">
            <span
              className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                isOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                isOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                isOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </div>
      </button>

      {/* Mobile menu overlay and panel */}
      {(isOpen || isAnimating) && (
        <>
          <div
            className={`fixed inset-0 bg-black z-40 md:hidden transition-opacity duration-200 ease-in-out ${
              isOpen && !isAnimating ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={handleClose}
            data-testid="menu-overlay"
            aria-hidden="true"
          />
          <div
            className={`fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50 md:hidden transform transition-transform duration-200 ease-in-out ${
              isOpen && !isAnimating ? 'translate-y-0' : '-translate-y-full'
            }`}
            data-testid="mobile-menu"
          >
            <nav className="flex flex-col">
              {navLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-4 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 min-h-[44px] flex items-center font-medium ${
                    index < navLinks.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                  style={{
                    transitionDelay: isOpen && !isAnimating ? `${index * 30}ms` : '0ms',
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
