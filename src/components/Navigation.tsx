'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavDropdown {
  label: string;
  icon: string;
  href: string;
  items: { href: string; label: string; badge?: string }[];
}

const dropdowns: NavDropdown[] = [
  {
    label: 'Legislative',
    icon: '🏛️',
    href: '/congress',
    items: [
      { href: '/house', label: 'House of Representatives' },
      { href: '/senate', label: 'Senate' },
      { href: '/bills', label: 'Bills & Votes' },
    ],
  },
  {
    label: 'Executive',
    icon: '🏢',
    href: '/executive',
    items: [
      { href: '/executive/president', label: 'President' },
      { href: '/executive/cabinet', label: 'Cabinet' },
      { href: '/executive/agencies/doge', label: '🐕 DOGE (Federal Agencies)' },
    ],
  },
  {
    label: 'Judicial',
    icon: '⚖️',
    href: '/judicial',
    items: [
      { href: '/judicial/supreme-court', label: 'Supreme Court', badge: 'Coming Soon' },
      { href: '/judicial/federal-courts', label: 'Federal Courts', badge: 'Coming Soon' },
    ],
  },
];

function DesktopDropdown({ dropdown }: { dropdown: NavDropdown }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!open);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(!open);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={dropdown.href}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        className="text-slate-600 hover:text-slate-900 transition-colors duration-150 min-h-[44px] flex items-center gap-1 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {dropdown.label}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Link>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">
          {dropdown.items.map((item) => (
            item.badge === 'Coming Soon' ? (
              <span
                key={item.href}
                className="flex items-center justify-between px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
              >
                <span>{item.label}</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
}

function SearchButton() {
  return (
    <Link
      href="/congress?search="
      className="text-slate-600 hover:text-slate-900 transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Search"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </Link>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
        setExpandedMobile(null);
      }, 200);
    }
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsAnimating(false);
          setExpandedMobile(null);
        }, 200);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!isOpen) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
      setExpandedMobile(null);
    }, 200);
  }, [isOpen]);

  const handleToggle = () => {
    if (isOpen) handleClose();
    else setIsOpen(true);
  };

  return (
    <>
      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6">
        <Link
          href="/"
          aria-current={pathname === '/' ? 'page' : undefined}
          className={`text-slate-600 hover:text-slate-900 transition-colors duration-150 min-h-[44px] flex items-center font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${pathname === '/' ? 'text-blue-600 font-bold' : ''}`}
        >
          Dashboard
        </Link>
        {dropdowns.map((d) => (
          <DesktopDropdown key={d.label} dropdown={d} />
        ))}
        <Link
          href="/scandals"
          aria-current={pathname === '/scandals' ? 'page' : undefined}
          className={`text-slate-600 hover:text-slate-900 transition-colors duration-150 min-h-[44px] flex items-center font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${pathname === '/scandals' ? 'text-blue-600 font-bold' : ''}`}
        >
          Scandals
        </Link>
        <SearchButton />
      </div>

      {/* Mobile hamburger button */}
      <button
        onClick={handleToggle}
        className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        data-testid="hamburger-button"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col gap-1.5">
            <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </div>
      </button>

      {/* Mobile menu */}
      {(isOpen || isAnimating) && (
        <>
          <div
            className={`fixed inset-0 bg-black z-40 md:hidden transition-opacity duration-200 ease-in-out ${isOpen && !isAnimating ? 'opacity-50' : 'opacity-0'}`}
            onClick={handleClose}
            data-testid="menu-overlay"
            aria-hidden="true"
          />
          <div
            className={`fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50 md:hidden transform transition-transform duration-200 ease-in-out max-h-[calc(100vh-4rem)] overflow-y-auto ${isOpen && !isAnimating ? 'translate-y-0' : '-translate-y-full'}`}
            data-testid="mobile-menu"
          >
            <nav className="flex flex-col">
              {/* Search */}
              <Link
                href="/congress?search="
                className="px-4 py-4 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 min-h-[44px] flex items-center gap-3 font-medium border-b border-slate-100 focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                🔍 Search
              </Link>

              {/* Dashboard */}
              <Link
                href="/"
                aria-current={pathname === '/' ? 'page' : undefined}
                className={`px-4 py-4 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 min-h-[44px] flex items-center gap-3 font-medium border-b border-slate-100 focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-inset focus:ring-blue-500 ${pathname === '/' ? 'bg-blue-50 text-blue-600 font-bold' : ''}`}
              >
                🏠 Dashboard
              </Link>

              {/* Dropdowns */}
              {dropdowns.map((d) => (
                <div key={d.label} className="border-b border-slate-100">
                  <button
                    onClick={() => setExpandedMobile(expandedMobile === d.label ? null : d.label)}
                    className="w-full px-4 py-4 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 min-h-[44px] flex items-center justify-between font-medium focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-expanded={expandedMobile === d.label}
                    aria-label={`${d.label} navigation menu`}
                  >
                    <span className="flex items-center gap-3">
                      {d.icon} {d.label}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${expandedMobile === d.label ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedMobile === d.label && (
                    <div className="bg-slate-50">
                      {d.items.map((item) => (
                        item.badge === 'Coming Soon' ? (
                          <span
                            key={item.href}
                            className="flex items-center justify-between pl-12 pr-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                          >
                            <span>{item.label}</span>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                              {item.badge}
                            </span>
                          </span>
                        ) : (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between pl-12 pr-4 py-3 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:bg-slate-200 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Scandals */}
              <Link
                href="/scandals"
                aria-current={pathname === '/scandals' ? 'page' : undefined}
                className={`px-4 py-4 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 min-h-[44px] flex items-center gap-3 font-medium focus:outline-none focus:bg-slate-100 focus:ring-2 focus:ring-inset focus:ring-blue-500 ${pathname === '/scandals' ? 'bg-blue-50 text-blue-600 font-bold' : ''}`}
              >
                🚨 Scandals
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
