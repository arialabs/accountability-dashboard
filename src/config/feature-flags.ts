/**
 * Feature Flags Configuration
 * 
 * Central registry for all feature flags with defaults and descriptions.
 */

export type FeatureFlagName =
  | 'judicial'
  | 'executive'
  | 'keyVoteRecord'
  | 'stockTrades'
  | 'scandals'
  | 'dogeTracker'
  | 'dogeStaff'
  | 'alignmentScore'
  | 'billSummaries'
  | 'searchByZip';

export interface FeatureFlagConfig {
  name: FeatureFlagName;
  description: string;
  defaultEnabled: boolean;
  category: 'branches' | 'features' | 'components';
}

export const FEATURE_FLAGS: Record<FeatureFlagName, FeatureFlagConfig> = {
  // Branches
  judicial: {
    name: 'judicial',
    description: 'Judicial branch section',
    defaultEnabled: false,
    category: 'branches',
  },
  executive: {
    name: 'executive',
    description: 'Executive branch section',
    defaultEnabled: true,
    category: 'branches',
  },

  // Features
  keyVoteRecord: {
    name: 'keyVoteRecord',
    description: 'Key vote record scoring',
    defaultEnabled: false,
    category: 'features',
  },
  stockTrades: {
    name: 'stockTrades',
    description: 'Stock trading data',
    defaultEnabled: true,
    category: 'features',
  },
  scandals: {
    name: 'scandals',
    description: 'Scandals section',
    defaultEnabled: true,
    category: 'features',
  },
  dogeTracker: {
    name: 'dogeTracker',
    description: 'DOGE tracker page',
    defaultEnabled: true,
    category: 'features',
  },
  dogeStaff: {
    name: 'dogeStaff',
    description: 'DOGE staff roster',
    defaultEnabled: true,
    category: 'features',
  },

  // Components
  alignmentScore: {
    name: 'alignmentScore',
    description: 'Alignment scores',
    defaultEnabled: false,
    category: 'components',
  },
  billSummaries: {
    name: 'billSummaries',
    description: 'Bill detail pages',
    defaultEnabled: false,
    category: 'components',
  },
  searchByZip: {
    name: 'searchByZip',
    description: 'ZIP code search',
    defaultEnabled: false,
    category: 'components',
  },
};

export const DEFAULT_FLAGS: Record<FeatureFlagName, boolean> = Object.fromEntries(
  Object.values(FEATURE_FLAGS).map((flag) => [flag.name, flag.defaultEnabled])
) as Record<FeatureFlagName, boolean>;
