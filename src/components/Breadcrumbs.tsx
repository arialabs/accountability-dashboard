'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const labelMap: Record<string, string> = {
  executive: 'Executive',
  legislative: 'Legislative',
  judicial: 'Judicial',
  president: 'President',
  cabinet: 'Cabinet',
  agencies: 'Federal Agencies',
  doge: '🐕 DOGE',
  'supreme-court': 'Supreme Court',
  'federal-courts': 'Federal Courts',
  scotus: 'Supreme Court',
  scandals: 'Scandals',
  congress: 'Congress',
  house: 'House',
  senate: 'Senate',
  bills: 'Bills & Votes',
  votes: 'Votes',
  vp: 'Vice President',
  conflicts: 'Conflicts',
  orders: 'Executive Orders',
  policies: 'Policies',
  'deep-dives': 'Deep Dives',
  methodology: 'Methodology',
  about: 'About',
  rep: 'Representative',
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <li>
            <Link href="/" className="hover:text-slate-700 transition-colors">
              Home
            </Link>
          </li>
          {crumbs.map((crumb, i) => (
            <li key={crumb.href} className="flex items-center gap-2">
              <span className="text-slate-300">&gt;</span>
              {i === crumbs.length - 1 ? (
                <span className="text-slate-700 font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-slate-700 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
