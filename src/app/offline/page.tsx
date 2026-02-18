"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-lg text-slate-600 mb-8">
          It looks like you've lost your internet connection. Please check your network and try again.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <a
            href="/"
            className="block w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Homepage
          </a>
        </div>
        
        <div className="mt-8 text-sm text-slate-500">
          <p>Some previously visited pages may be available offline.</p>
        </div>
      </div>
    </div>
  );
}
