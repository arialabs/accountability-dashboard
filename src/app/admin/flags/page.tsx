'use client';

import { useState, useEffect } from 'react';
import { useFeatureFlags } from '@/context/FeatureFlagContext';
import { flagDescriptions, FeatureFlags } from '@/config/feature-flags';

const PASSWORD = 'reps2026';

export default function FeatureFlagsAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { flags, toggleFlag, resetFlags } = useFeatureFlags();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-white p-8 rounded-lg shadow-xl w-96">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Feature Flags Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                placeholder="Enter password"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const categories = {
    'Branches': ['judicial', 'executive'] as (keyof FeatureFlags)[],
    'Features': ['keyVoteRecord', 'stockTrades', 'scandals', 'alignmentScore', 'billSummaries', 'searchByZip'] as (keyof FeatureFlags)[],
    'Components': ['dogeTracker', 'dogeStaff'] as (keyof FeatureFlags)[],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Feature Flags</h1>
            <button
              onClick={resetFlags}
              className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors font-medium"
            >
              Reset to Defaults
            </button>
          </div>

          {Object.entries(categories).map(([category, flagNames]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">{category}</h2>
              <div className="space-y-3">
                {flagNames.map((flag) => (
                  <div
                    key={flag}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{flag}</div>
                      <div className="text-sm text-slate-600">{flagDescriptions[flag]}</div>
                    </div>
                    <button
                      onClick={() => toggleFlag(flag)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        flags[flag] ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          flags[flag] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changes are saved to localStorage and will persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
