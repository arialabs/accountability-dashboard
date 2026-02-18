"use client";

import ErrorBoundary from "./ErrorBoundary";
import { ReactNode } from "react";

/**
 * Client-side wrapper for layout with app-level error boundary
 * Wraps the entire app content to catch unexpected errors
 */
export default function LayoutErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      context="the application"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-lg shadow-xl">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                  Something went wrong
                </h1>
                <p className="text-slate-600 mb-6">
                  We encountered an unexpected error. Our team has been notified. 
                  Please try refreshing the page.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Reload page
                  </button>
                  <a
                    href="/"
                    className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                  >
                    Go home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
