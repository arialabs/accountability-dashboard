import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | Accountability Dashboard",
  description: "Public RESTful API for accessing politician accountability data programmatically. Free for journalists, researchers, and developers.",
};

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-4xl mb-6 shadow-2xl mx-auto">
              🔌
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
              API Documentation
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Access politician accountability data programmatically. Free for journalists, researchers, and developers.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Quick Start</h2>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Example Request</h3>
            <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <code>curl https://reps.arialabs.ai/api/congress?limit=10&chamber=senate</code>
            </pre>
          </div>

          <div className="space-y-4 text-slate-700">
            <p>
              All endpoints return JSON. No API key required for basic access (100 requests/hour).
            </p>
            <p>
              Need higher rate limits? <Link href="#rate-limits" className="text-blue-600 hover:underline">Learn about authentication</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Endpoints</h2>

          <div className="space-y-6">
            {/* Congress Members */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">List Congress Members</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">GET</span>
              </div>
              <code className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded">
                /api/congress
              </code>

              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Query Parameters</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">limit</code> — Number of results (default: 20, max: 100)</li>
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">offset</code> — Pagination offset (default: 0)</li>
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">chamber</code> — Filter by "house" or "senate"</li>
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">state</code> — Two-letter state code (e.g., "CA", "TX")</li>
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">party</code> — Filter by "D", "R", or "I"</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Example</h4>
                  <pre className="text-xs bg-slate-900 text-green-400 p-3 rounded overflow-x-auto">
                    <code>curl https://reps.arialabs.ai/api/congress?state=CA&party=D&limit=5</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Individual Member */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Get Member Details</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">GET</span>
              </div>
              <code className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded">
                /api/congress/[id]
              </code>

              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Example</h4>
                <pre className="text-xs bg-slate-900 text-green-400 p-3 rounded overflow-x-auto">
                  <code>curl https://reps.arialabs.ai/api/congress/S000033</code>
                </pre>
              </div>
            </div>

            {/* Scandals */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">List Scandals</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">GET</span>
              </div>
              <code className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded">
                /api/scandals
              </code>

              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Query Parameters</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">limit</code> — Number of results (default: 20, max: 100)</li>
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">offset</code> — Pagination offset</li>
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">severity</code> — Filter by "high", "medium", or "low"</li>
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">member_id</code> — Filter by bioguide_id</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Search</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">GET</span>
              </div>
              <code className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded">
                /api/search
              </code>

              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Query Parameters</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">q</code> — Search query (required)</li>
                    <li><code className="bg-slate-100 px-2 py-0.5 rounded">type</code> — "members", "scandals", or "all" (default: "all")</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Example</h4>
                  <pre className="text-xs bg-slate-900 text-green-400 p-3 rounded overflow-x-auto">
                    <code>curl https://reps.arialabs.ai/api/search?q=california</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Executive */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">List Executive Officials</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">GET</span>
              </div>
              <code className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded">
                /api/executive
              </code>
            </div>

            {/* Judicial */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">List Supreme Court Justices</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">GET</span>
              </div>
              <code className="text-sm text-slate-600 bg-slate-50 px-3 py-1 rounded">
                /api/judicial
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limiting */}
      <section id="rate-limits" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Rate Limiting</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Unauthenticated</h3>
              <p className="text-3xl font-black text-slate-900 mb-2">100</p>
              <p className="text-sm text-slate-600">requests per hour</p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-2">With API Key</h3>
              <p className="text-3xl font-black text-blue-900 mb-2">1,000</p>
              <p className="text-sm text-blue-700">requests per hour</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-slate-700">
            <p>
              Every response includes rate limit headers:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code className="bg-slate-100 px-2 py-0.5 rounded">X-RateLimit-Limit</code> — Your rate limit</li>
              <li><code className="bg-slate-100 px-2 py-0.5 rounded">X-RateLimit-Remaining</code> — Requests remaining</li>
            </ul>
            <p className="text-sm">
              Requests exceeding the limit will receive a <code className="bg-slate-100 px-2 py-0.5 rounded">429 Too Many Requests</code> response.
            </p>
          </div>
        </div>
      </section>

      {/* Response Format */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Response Format</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Success Response</h3>
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "data": [...],
  "pagination": {
    "total": 535,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Error Response</h3>
              <pre className="bg-slate-900 text-red-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "error": "Member not found"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* HTTP Status Codes */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 mb-6">HTTP Status Codes</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800 w-16 text-center">200</span>
              <span className="text-slate-700">Success</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 w-16 text-center">400</span>
              <span className="text-slate-700">Bad Request — Invalid parameters</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 w-16 text-center">404</span>
              <span className="text-slate-700">Not Found — Resource doesn't exist</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800 w-16 text-center">429</span>
              <span className="text-slate-700">Too Many Requests — Rate limit exceeded</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800 w-16 text-center">500</span>
              <span className="text-slate-700">Internal Server Error</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORS */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 mb-4">CORS Support</h2>
          <p className="text-slate-700">
            All API endpoints support Cross-Origin Resource Sharing (CORS), allowing you to make requests from web applications hosted on any domain.
          </p>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
