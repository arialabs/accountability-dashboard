/**
 * Executive Branch Conflict of Interest Detector
 * Cross-references financial disclosures with government decisions and actions
 */

import type { 
  ExecutiveOfficial, 
  ExecutiveAction, 
  ConflictOfInterest,
  ConflictSeverity 
} from "@/types/executive";

export interface DetectedConflict {
  id: string;
  official_id: string;
  official_name: string;
  department: string;
  severity: ConflictSeverity;
  category: string;
  title: string;
  description: string;
  evidence: {
    financial?: string;
    action?: string;
    overlap: string;
  };
  date_detected: string;
  status: "active" | "resolved" | "under_investigation";
}

/**
 * Analyze an official's conflicts with their actions
 */
export function analyzeOfficialConflicts(
  official: ExecutiveOfficial,
  actions?: ExecutiveAction[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];
  
  // Convert existing conflicts to detected format
  official.conflicts_of_interest.forEach((conflict, idx) => {
    conflicts.push({
      id: `${official.id}-conflict-${idx}`,
      official_id: official.id,
      official_name: official.name,
      department: official.department,
      severity: conflict.severity,
      category: conflict.category,
      title: getConflictTitle(conflict),
      description: conflict.description,
      evidence: {
        overlap: conflict.description,
      },
      date_detected: new Date().toISOString(),
      status: (conflict.status === "resolved" ? "resolved" : conflict.status === "under_investigation" ? "under_investigation" : "active") as "resolved" | "active" | "under_investigation",
    });
  });
  
  // Analyze actions for potential new conflicts
  if (actions && official.financial_disclosures.length > 0) {
    const actionConflicts = detectActionConflicts(official, actions);
    conflicts.push(...actionConflicts);
  }
  
  return conflicts.sort((a, b) => {
    const severityOrder: Record<ConflictSeverity, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

/**
 * Detect conflicts between financial holdings and policy actions
 */
function detectActionConflicts(
  official: ExecutiveOfficial,
  actions: ExecutiveAction[]
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];
  
  // Get latest financial disclosure
  if (official.financial_disclosures.length === 0) {
    return conflicts;
  }
  
  const latestDisclosure = official.financial_disclosures.sort((a, b) => b.year - a.year)[0];
  
  // Industry keywords to match against actions and assets
  const industryMappings: Record<string, string[]> = {
    oil_gas: ["oil", "gas", "energy", "petroleum", "fossil", "drilling", "fracking"],
    pharma: ["pharmaceutical", "drug", "vaccine", "medicine", "health"],
    defense: ["defense", "military", "weapons", "aerospace"],
    finance: ["bank", "financial", "investment", "securities", "trading"],
    tech: ["technology", "software", "data", "digital", "internet"],
    agriculture: ["farm", "agriculture", "crop", "livestock"],
  };
  
  // Check each asset against actions
  latestDisclosure.assets.forEach((asset) => {
    actions.forEach((action) => {
      // Check if asset type matches action impact
      for (const [industry, keywords] of Object.entries(industryMappings)) {
        const assetMatches = keywords.some(kw => 
          asset.description.toLowerCase().includes(kw)
        );
        
        const actionMatches = keywords.some(kw =>
          action.title.toLowerCase().includes(kw) ||
          action.description.toLowerCase().includes(kw)
        );
        
        if (assetMatches && actionMatches) {
          // Potential conflict detected
          const severity = calculateConflictSeverity(asset.value_max, action.budget_impact);
          
          conflicts.push({
            id: `${official.id}-action-${action.id}`,
            official_id: official.id,
            official_name: official.name,
            department: official.department,
            severity,
            category: "financial",
            title: `${industry.toUpperCase()} Holdings vs Policy Action`,
            description: `Official holds ${asset.description} valued at $${asset.value_min.toLocaleString()}-$${asset.value_max.toLocaleString()} while implementing policy that may benefit this sector.`,
            evidence: {
              financial: `Asset: ${asset.description} ($${asset.value_min.toLocaleString()}-$${asset.value_max.toLocaleString()})`,
              action: `Action: ${action.title} (${action.date})`,
              overlap: `Both relate to ${industry} industry`,
            },
            date_detected: new Date().toISOString(),
            status: "active",
          });
        }
      }
    });
  });
  
  return conflicts;
}

/**
 * Calculate conflict severity based on financial amounts
 */
function calculateConflictSeverity(
  assetValue: number,
  budgetImpact?: number
): ConflictSeverity {
  const totalImpact = assetValue + Math.abs(budgetImpact || 0);
  
  if (totalImpact > 10000000 || assetValue > 5000000) {
    return "critical";
  } else if (totalImpact > 1000000 || assetValue > 500000) {
    return "high";
  } else if (totalImpact > 100000 || assetValue > 50000) {
    return "medium";
  } else {
    return "low";
  }
}

/**
 * Generate a title for a conflict
 */
function getConflictTitle(conflict: ConflictOfInterest): string {
  const categoryTitles: Record<string, string> = {
    financial: "Financial Conflict",
    political: "Political Conflict",
    corporate: "Corporate Ties",
    foreign_influence: "Foreign Influence",
    personal_conduct: "Conduct Issues",
    qualifications: "Qualification Concerns",
    independence: "Independence Issues",
    corruption: "Corruption Allegations",
    ideology: "Ideological Conflict",
    public_health: "Public Health Risk",
    labor: "Labor Conflict",
    policy: "Policy Conflict",
  };
  
  return categoryTitles[conflict.category] || "Conflict of Interest";
}

/**
 * Score overall conflict risk for an official
 */
export function scoreConflictRisk(conflicts: DetectedConflict[]): {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  summary: string;
} {
  const weights = {
    critical: 10,
    high: 7,
    medium: 4,
    low: 2,
  };
  
  const score = conflicts.reduce((total, c) => total + weights[c.severity], 0);
  
  let level: "low" | "medium" | "high" | "critical";
  if (score >= 25) {
    level = "critical";
  } else if (score >= 15) {
    level = "high";
  } else if (score >= 8) {
    level = "medium";
  } else {
    level = "low";
  }
  
  const summary = generateRiskSummary(conflicts, level);
  
  return { score, level, summary };
}

/**
 * Generate a summary of conflict risk
 */
function generateRiskSummary(
  conflicts: DetectedConflict[],
  level: string
): string {
  const criticalCount = conflicts.filter(c => c.severity === "critical").length;
  const highCount = conflicts.filter(c => c.severity === "high").length;
  
  if (level === "critical") {
    return `${criticalCount} critical conflict${criticalCount !== 1 ? 's' : ''} detected. Immediate review recommended.`;
  } else if (level === "high") {
    return `${highCount + criticalCount} serious conflict${highCount + criticalCount !== 1 ? 's' : ''} identified. Further investigation warranted.`;
  } else if (level === "medium") {
    return `${conflicts.length} potential conflict${conflicts.length !== 1 ? 's' : ''} found. Monitoring recommended.`;
  } else {
    return `Low conflict risk. ${conflicts.length} minor issue${conflicts.length !== 1 ? 's' : ''} noted.`;
  }
}

/**
 * Group conflicts by category
 */
export function groupConflictsByCategory(
  conflicts: DetectedConflict[]
): Record<string, DetectedConflict[]> {
  return conflicts.reduce((acc, conflict) => {
    if (!acc[conflict.category]) {
      acc[conflict.category] = [];
    }
    acc[conflict.category].push(conflict);
    return acc;
  }, {} as Record<string, DetectedConflict[]>);
}

/**
 * Filter conflicts by severity
 */
export function filterBySeverity(
  conflicts: DetectedConflict[],
  minSeverity: ConflictSeverity
): DetectedConflict[] {
  const severityOrder: Record<ConflictSeverity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  
  const threshold = severityOrder[minSeverity];
  return conflicts.filter(c => severityOrder[c.severity] >= threshold);
}
