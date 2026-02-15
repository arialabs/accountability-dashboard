/**
 * Deep dives data loader
 * Provides access to investigation articles and analysis
 */

import deepDivesData from '@/data/deep-dives.json';

export interface DeepDive {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  publishedDate: string;
  readTimeMinutes: number;
  tags: string[];
  summary: string;
  keyFindings: string[];
  sections?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}

/**
 * Get all deep dive investigations
 */
export function getAllDeepDives(): DeepDive[] {
  return deepDivesData as DeepDive[];
}

/**
 * Get a specific deep dive by slug
 */
export function getDeepDiveBySlug(slug: string): DeepDive | undefined {
  return getAllDeepDives().find(dv => dv.slug === slug);
}

/**
 * Get related deep dives by tag
 */
export function getDeepDivesByTag(tag: string): DeepDive[] {
  return getAllDeepDives().filter(dv => dv.tags?.includes(tag));
}
