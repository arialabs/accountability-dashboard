import policyData from "@/data/policy-impacts.json";
import type { PolicyImpact, PolicySummary, PolicyCategory, PolicyCategoryInfo, ImpactGrade } from "@/lib/types";

export const POLICY_CATEGORIES: Record<PolicyCategory, PolicyCategoryInfo> = {
  'economy': {
    slug: 'economy',
    name: 'Economy & Jobs',
    icon: '💼',
    description: 'GDP, employment, inflation, trade',
    subcategories: ['Jobs', 'Inflation', 'Trade', 'GDP Growth']
  },
  'healthcare': {
    slug: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    description: 'Coverage, costs, outcomes',
    subcategories: ['Coverage', 'Drug Prices', 'Outcomes', 'Access']
  },
  'immigration': {
    slug: 'immigration',
    name: 'Immigration',
    icon: '🛂',
    description: 'Border policy, asylum, enforcement',
    subcategories: ['Border Security', 'Asylum', 'Legal Immigration', 'Enforcement']
  },
  'environment': {
    slug: 'environment',
    name: 'Environment & Energy',
    icon: '🌍',
    description: 'Climate, pollution, energy policy',
    subcategories: ['Climate', 'Air Quality', 'Energy', 'Conservation']
  },
  'education': {
    slug: 'education',
    name: 'Education',
    icon: '📚',
    description: 'Schools, student loans, outcomes',
    subcategories: ['K-12', 'Higher Ed', 'Student Loans', 'Outcomes']
  },
  'foreign-policy': {
    slug: 'foreign-policy',
    name: 'Foreign Policy',
    icon: '🌐',
    description: 'Diplomacy, defense, alliances',
    subcategories: ['Diplomacy', 'Defense', 'Alliances', 'Trade Relations']
  },
  'civil-rights': {
    slug: 'civil-rights',
    name: 'Civil Rights & Justice',
    icon: '⚖️',
    description: 'Voting rights, criminal justice, equality',
    subcategories: ['Voting Rights', 'Criminal Justice', 'Equality', 'Free Speech']
  },
  'infrastructure': {
    slug: 'infrastructure',
    name: 'Infrastructure',
    icon: '🏗️',
    description: 'Transportation, utilities, broadband',
    subcategories: ['Transportation', 'Broadband', 'Utilities', 'Public Works']
  }
};

export function getPolicies(): PolicyImpact[] {
  return policyData.policies as PolicyImpact[];
}

export function getPolicy(slug: string): PolicyImpact | undefined {
  return getPolicies().find(p => p.slug === slug);
}

export function getPolicySummary(): PolicySummary {
  const policies = getPolicies();
  const summary: PolicySummary = {
    total_policies: policies.length,
    overall_impact_score: policyData.summary.overall_impact_score,
    overall_grade: policyData.summary.overall_grade as ImpactGrade,
    americans_affected: policyData.summary.americans_affected,
    categories: {}
  };
  
  // Calculate category statistics
  for (const category of Object.keys(POLICY_CATEGORIES) as PolicyCategory[]) {
    const categoryPolicies = policies.filter(p => p.category === category);
    if (categoryPolicies.length > 0) {
      const avgScore = Math.round(
        categoryPolicies.reduce((sum, p) => sum + p.impact_score, 0) / categoryPolicies.length
      );
      summary.categories[category] = {
        count: categoryPolicies.length,
        avg_impact_score: avgScore,
        grade: getImpactGrade(avgScore)
      };
    }
  }
  
  return summary;
}

export function getImpactGrade(score: number): 'A' | 'B' | 'C+' | 'C' | 'C-' | 'D' | 'F' | 'F-' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 40) return 'D';
  if (score >= 30) return 'F';
  return 'F-';
}

// Re-export from shared formatting utilities
export { formatNumber } from './formatting';

export function getPromiseQuadrant(promiseAlignment: number, impactScore: number): {
  label: string;
  icon: string;
  color: string;
  description: string;
} {
  const keptPromise = promiseAlignment >= 60;
  const goodImpact = impactScore >= 60;
  
  if (keptPromise && goodImpact) {
    return {
      label: 'Delivered as Promised',
      icon: '🟢',
      color: 'bg-green-50 border-green-200 text-green-900',
      description: 'This policy was implemented as promised during the campaign with positive results for Americans.'
    };
  }
  
  if (!keptPromise && goodImpact) {
    return {
      label: 'Deviated, But Beneficial',
      icon: '🟡',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      description: 'This policy deviated from the campaign promise, but the outcome has been beneficial for Americans.'
    };
  }
  
  if (keptPromise && !goodImpact) {
    return {
      label: 'Kept Promise, Harmful Outcome',
      icon: '🔴',
      color: 'bg-red-50 border-red-200 text-red-900',
      description: 'This policy was implemented as promised during the campaign, but measurable outcomes show negative impact on Americans.'
    };
  }
  
  return {
    label: 'Failed Promise, Negative Impact',
    icon: '🔴',
    color: 'bg-red-50 border-red-200 text-red-900',
    description: 'This policy both deviated from the campaign promise and has shown negative impact on Americans.'
  };
}
