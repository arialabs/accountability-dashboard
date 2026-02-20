"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export default function Pagination({ currentPage, totalItems, itemsPerPage, className = "" }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const createPageURL = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const qs = params.toString();
      return `${pathname}${qs ? `?${qs}` : ""}`;
    },
    [pathname, searchParams]
  );

  const goToPage = (page: number) => {
    router.push(createPageURL(page), { scroll: true });
  };

  if (totalPages <= 1) return null;

  // Build page number array with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const delta = 2; // pages on each side of current

    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (rangeStart > 2) pages.push("...");
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col items-center gap-4 py-6 ${className}`}>
      {/* Count label */}
      <p className="text-sm text-slate-500 font-medium" style={{ fontFamily: "var(--font-source-sans-3, 'Source Sans 3', sans-serif)" }}>
        Showing{" "}
        <span className="font-mono font-bold text-slate-700" style={{ fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)" }}>
          {startItem}–{endItem}
        </span>{" "}
        of{" "}
        <span className="font-mono font-bold text-slate-700" style={{ fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)" }}>
          {totalItems}
        </span>{" "}
        members
      </p>

      {/* Page controls */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Previous */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, i) =>
            page === "..." ? (
              <span key={`ellipsis-${i}`} className="px-3 py-2 text-slate-400 text-sm select-none">
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page as number)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`min-w-[40px] px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  currentPage === page
                    ? "bg-teal-700 border-teal-700 text-white shadow-sm"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
                style={{
                  fontFamily: currentPage === page
                    ? "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)"
                    : undefined,
                  backgroundColor: currentPage === page ? "#0F766E" : undefined,
                  borderColor: currentPage === page ? "#0F766E" : undefined,
                }}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
