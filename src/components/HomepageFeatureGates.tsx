'use client';

import { ReactNode } from 'react';
import { useFeatureFlag } from '@/context/FeatureFlagContext';

export function LeaderboardGate({ children }: { children: ReactNode }) {
  const enabled = useFeatureFlag('leaderboard');
  return enabled ? <>{children}</> : null;
}

export function JudicialGate({ children }: { children: ReactNode }) {
  const enabled = useFeatureFlag('judicial');
  return enabled ? <>{children}</> : null;
}
