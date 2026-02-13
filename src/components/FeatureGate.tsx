'use client';

import { ReactNode } from 'react';
import { useFeatureFlag } from '@/context/FeatureFlagContext';
import { FeatureFlags } from '@/config/feature-flags';

export function FeatureGate({ 
  flag, 
  children 
}: { 
  flag: keyof FeatureFlags; 
  children: ReactNode;
}) {
  const enabled = useFeatureFlag(flag);
  return enabled ? <>{children}</> : null;
}
