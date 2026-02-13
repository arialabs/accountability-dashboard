'use client';

import { useState } from 'react';
import { useFeatureFlags } from '@/context/FeatureFlagContext';
import { FEATURE_FLAGS, FeatureFlagName } from '@/config/feature-flags';

const ADMIN_PASSWORD = 'reps2026';

export default function FeatureFlagsAdmin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { flags, setFlag, resetToDefaults } = useFeatureFlags();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Feature Flags Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const flagsByCategory = {
    branches: Object.values(FEATURE_FLAGS).filter((f) => f.category === 'branches'),
    features: Object.values(FEATURE_FLAGS).filter((f) => f.category === 'features'),
    components: Object.values(FEATURE_FLAGS).filter((f) => f.category === 'components'),
  };

  const renderFlagToggle = (flagName: FeatureFlagName) => {
    const config = FEATURE_FLAGS[flagName];
    const isEnabled = flags[flagName];

    return (
      <div key={flagName} className="flex items-center justify-between py-3 border-b border-gray-200">
        <div>
          <label htmlFor={flagName} className="font-medium text-gray-900">
            {flagName}
          </label>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
        <button
          id={flagName}
          onClick={() => setFlag(flagName, !isEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            isEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Feature Flags</h1>
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Reset to Defaults
            </button>
          </div>

          {/* Branches */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Branches</h2>
            <div className="space-y-2">
              {flagsByCategory.branches.map((config) => renderFlagToggle(config.name))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Features</h2>
            <div className="space-y-2">
              {flagsByCategory.features.map((config) => renderFlagToggle(config.name))}
            </div>
          </section>

          {/* Components */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Components</h2>
            <div className="space-y-2">
              {flagsByCategory.components.map((config) => renderFlagToggle(config.name))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
