// @ts-nocheck
/**
 * Executive branch data utilities
 * Functions for working with executive officials, actions, and metrics
 */

import type {
  ExecutiveOfficial,
  ExecutiveAction,
  OfficialMetrics,
  DepartmentMetrics,
  ConflictSeverity,
  ActionType,
} from '@/types/executive';
import cabinetData from '@/data/cabinet.json';

/**
 * Get all executive officials
 */
export function getAllOfficials(): ExecutiveOfficial[] {
  // Map cabinet data to ExecutiveOfficial type
  return cabinetData.members.map((member): ExecutiveOfficial => ({
    id: member.id,
    name: member.name,
    role: member.role,
    official_role: "cabinet_secretary",
    department: member.department as any,
    photo_url: member.photo_url,
    appointed_date: member.appointed_date,
    confirmation_vote: member.confirmation_vote,
    tenure_start: member.appointed_date,
    bio: member.bio,
    prior_positions: member.prior_positions || [],
    net_worth: member.net_worth || "Unknown",
    financial_disclosures: [],
    conflicts_of_interest: member.conflicts_of_interest || [],
    policy_positions: member.policy_positions || [],
  }));
}

/**
 * Get official by ID
 */
export function getOfficialById(id: string): ExecutiveOfficial | undefined {
  const officials = getAllOfficials();
  return officials.find(o => o.id === id);
}

/**
 * Get officials by department
 */
export function getOfficialsByDepartment(department: string): ExecutiveOfficial[] {
  const officials = getAllOfficials();
  return officials.filter(o => o.department === department);
}

/**
 * Calculate conflict severity score
 */
export function calculateConflictScore(conflicts: Array<{ severity: ConflictSeverity }>): number {
  const weights = {
    low: 1,
    medium: 3,
    high: 7,
    critical: 10,
  };
  
  return conflicts.reduce((total, c) => total + weights[c.severity], 0);
}

/**
 * Get conflict severity label
 */
export function getConflictSeverityLabel(score: number): string {
  if (score === 0) return "None";
  if (score < 5) return "Low";
  if (score < 15) return "Medium";
  if (score < 25) return "High";
  return "Critical";
}

/**
 * Get conflict severity color
 */
export function getConflictSeverityColor(severity: ConflictSeverity): string {
  const colors = {
    low: "text-yellow-600 bg-yellow-50 border-yellow-200",
    medium: "text-orange-600 bg-orange-50 border-orange-200",
    high: "text-red-600 bg-red-50 border-red-200",
    critical: "text-red-900 bg-red-100 border-red-300",
  };
  
  return colors[severity];
}

// Re-export from shared formatting utilities
export { formatCurrencyShort as formatCurrency } from './formatting';

/**
 * Calculate days in office
 */
export function calculateDaysInOffice(appointedDate: string, endDate?: string): number {
  const start = new Date(appointedDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format tenure duration
 */
export function formatTenure(appointedDate: string, endDate?: string): string {
  const days = calculateDaysInOffice(appointedDate, endDate);
  
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Get department description
 */
export function getDepartmentDescription(department: string): string {
  const descriptions: Record<string, string> = {
    "Department of State": "The Department of State advises the President on foreign policy, conducts diplomatic relations, issues passports, and protects U.S. citizens abroad.",
    "Department of Defense": "The Department of Defense provides military forces to deter war and protect national security, overseeing the Army, Navy, Air Force, Marine Corps, and Space Force.",
    "Department of Justice": "The Department of Justice ensures public safety, enforces federal laws, defends U.S. interests, and administers the federal prison system.",
    "Department of the Treasury": "The Department of the Treasury manages federal finances, collects taxes, produces currency, and enforces economic sanctions.",
    "Department of Health and Human Services": "The Department of Health and Human Services protects public health, ensures food and drug safety, and administers Medicare and Medicaid.",
    "Department of Homeland Security": "The Department of Homeland Security protects the nation from threats, secures borders, enforces immigration laws, and responds to disasters.",
    "Environmental Protection Agency": "The EPA protects human health and the environment through regulations on air quality, water safety, and hazardous waste management.",
    "Department of the Interior": "The Department of the Interior manages federal lands, protects natural resources, and oversees relations with Native American tribes.",
    "Department of Agriculture": "The Department of Agriculture supports farmers, ensures food safety, manages national forests, and administers nutrition assistance programs.",
    "Department of Commerce": "The Department of Commerce promotes economic growth, job creation, international trade, and technological innovation.",
    "Department of Labor": "The Department of Labor protects workers' rights, enforces labor standards, and administers unemployment benefits and job training programs.",
    "Department of Transportation": "The Department of Transportation ensures safe, efficient transportation systems including highways, railroads, aviation, and public transit.",
    "Department of Energy": "The Department of Energy addresses energy security, nuclear safety, and scientific research related to energy and national security.",
    "Department of Education": "The Department of Education promotes educational excellence, ensures equal access to education, and administers federal student aid.",
    "Department of Veterans Affairs": "The Department of Veterans Affairs provides healthcare, benefits, and memorial services to military veterans and their families.",
    "Department of Housing and Urban Development": "The Department of Housing and Urban Development promotes homeownership, supports community development, and ensures access to affordable housing.",
  };
  
  return descriptions[department] || "Information about this department's responsibilities.";
}

/**
 * Sort officials by conflict score
 */
export function sortByConflictScore(officials: ExecutiveOfficial[]): ExecutiveOfficial[] {
  return [...officials].sort((a, b) => {
    const scoreA = calculateConflictScore(a.conflicts_of_interest);
    const scoreB = calculateConflictScore(b.conflicts_of_interest);
    return scoreB - scoreA;
  });
}

/**
 * Group conflicts by category
 */
export function groupConflictsByCategory(conflicts: Array<{ category: string }>) {
  return conflicts.reduce((acc, conflict) => {
    const category = conflict.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(conflict);
    return acc;
  }, {} as Record<string, typeof conflicts>);
}

/**
 * Get conflict category label
 */
export function getConflictCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    financial: "💰 Financial",
    political: "🎯 Political",
    corporate: "🏢 Corporate",
    foreign_influence: "🌍 Foreign Influence",
    personal_conduct: "👤 Personal Conduct",
    qualifications: "📋 Qualifications",
    independence: "⚖️ Independence",
    corruption: "🚨 Corruption",
    ideology: "💭 Ideology",
    public_health: "🏥 Public Health",
    labor: "👷 Labor",
    policy: "📜 Policy",
  };
  
  return labels[category] || category;
}
