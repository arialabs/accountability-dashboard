'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FeatureFlagName, DEFAULT_FLAGS } from '@/config/feature-flags';

interface FeatureFlagContextValue {
  flags: Record<FeatureFlagName, boolean>;
  setFlag: (name: FeatureFlagName, enabled: boolean) => void;
  resetToDefaults: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

const STORAGE_KEY = 'feature-flags';

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<FeatureFlagName, boolean>>(DEFAULT_FLAGS);

  // Load flags from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new flags
        setFlags({ ...DEFAULT_FLAGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    }
  }, []);

  const setFlag = (name: FeatureFlagName, enabled: boolean) => {
    setFlags((prev) => {
      const updated = { ...prev, [name]: enabled };
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save feature flags:', error);
      }
      return updated;
    });
  };

  const resetToDefaults = () => {
    setFlags(DEFAULT_FLAGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset feature flags:', error);
    }
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, setFlag, resetToDefaults }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to check if a feature flag is enabled
 */
export function useFeatureFlag(name: FeatureFlagName): boolean {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }
  return context.flags[name] ?? DEFAULT_FLAGS[name];
}

/**
 * Hook to access all feature flag operations
 */
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}

/**
 * Component wrapper that conditionally renders children based on feature flag
 */
export function FeatureFlag({
  name,
  children,
  fallback = null,
}: {
  name: FeatureFlagName;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const enabled = useFeatureFlag(name);
  return <>{enabled ? children : fallback}</>;
}
