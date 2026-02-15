import type { ConflictSeverity } from "@/types/executive";
import { getConflictSeverityColor } from "@/lib/executive-data";

interface ConflictBadgeProps {
  severity: ConflictSeverity;
  label?: string;
}

export default function ConflictBadge({ severity, label }: ConflictBadgeProps) {
  const color = getConflictSeverityColor(severity);
  const text = label || severity.charAt(0).toUpperCase() + severity.slice(1);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {text}
    </span>
  );
}
