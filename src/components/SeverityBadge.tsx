import type { SeverityLevel } from "@/lib/types";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const severityConfig = {
  conviction: {
    label: "CONVICTION",
    icon: "●",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-300",
    badgeColor: "bg-red-600",
  },
  indictment: {
    label: "INDICTMENT",
    icon: "●",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    badgeColor: "bg-orange-600",
  },
  criminal_investigation: {
    label: "CRIMINAL INVESTIGATION",
    icon: "●",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-300",
    badgeColor: "bg-amber-600",
  },
  ethics_violation: {
    label: "ETHICS VIOLATION",
    icon: "⚠️",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-300",
    badgeColor: "bg-yellow-600",
  },
  ethics_investigation: {
    label: "ETHICS INVESTIGATION",
    icon: "●",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    badgeColor: "bg-blue-600",
  },
  allegation: {
    label: "CREDIBLE ALLEGATION",
    icon: "○",
    bgColor: "bg-slate-50",
    textColor: "text-slate-700",
    borderColor: "border-slate-300",
    badgeColor: "bg-slate-600",
  },
};

export default function SeverityBadge({ 
  severity, 
  size = "md", 
  showLabel = true 
}: SeverityBadgeProps) {
  const config = severityConfig[severity];
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };
  
  const iconSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="flex items-center gap-2">
      <span 
        className={`${config.textColor} ${iconSizes[size]} font-black`}
        aria-label={`Severity: ${config.label}`}
      >
        {config.icon}
      </span>
      {showLabel && (
        <span 
          className={`
            ${config.textColor} 
            ${sizeClasses[size]} 
            font-black 
            uppercase 
            tracking-wider
          `}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

export { severityConfig };
