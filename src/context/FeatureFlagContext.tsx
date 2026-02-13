'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FeatureFlags, defaultFlags } from '@/config/feature-flags';

type FeatureFlagContextType = {
  flags: FeatureFlags;
  setFlags: (flags: FeatureFlags) => void;
  toggleFlag: (flag: keyof FeatureFlags) => void;
  resetFlags: () => void;
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlagsState] = useState<FeatureFlags>(defaultFlags);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage
    const stored = localStorage.getItem('feature-flags');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new flags
        setFlagsState({ ...defaultFlags, ...parsed });
      } catch (e) {
        console.error('Failed to parse feature flags from localStorage', e);
      }
    }
  }, []);

  const setFlags = (newFlags: FeatureFlags) => {
    setFlagsState(newFlags);
    if (mounted) {
      localStorage.setItem('feature-flags', JSON.stringify(newFlags));
    }
  };

  const toggleFlag = (flag: keyof FeatureFlags) => {
    const newFlags = { ...flags, [flag]: !flags[flag] };
    setFlags(newFlags);
  };

  const resetFlags = () => {
    setFlags(defaultFlags);
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, setFlags, toggleFlag, resetFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
}

export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  const { flags } = useFeatureFlags();
  return flags[flag];
}

export function FeatureFlag({ 
  name, 
  children 
}: { 
  name: keyof FeatureFlags; 
  children: ReactNode;
}) {
  const enabled = useFeatureFlag(name);
  return enabled ? <>{children}</> : null;
}
