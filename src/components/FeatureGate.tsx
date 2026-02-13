'use client';

import { ReactNode } from 'react';
import { useFeatureFlag } from '@/context/FeatureFlagContext';
import { FeatureFlagName } from '@/config/feature-flags';

export function FeatureGate({ 
  flag, 
  children 
}: { 
  flag: FeatureFlagName; 
  children: ReactNode;
}) {
  const enabled = useFeatureFlag(flag);
  return enabled ? <>{children}</> : null;
}
