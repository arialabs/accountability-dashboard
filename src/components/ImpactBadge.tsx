import type { ImpactGrade } from "@/lib/types";

interface ImpactBadgeProps {
  score: number;
  grade?: ImpactGrade;
  size?: 'sm' | 'md' | 'lg';
  showGrade?: boolean;
  className?: string;
}

function getImpactGrade(score: number): ImpactGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 40) return 'D';
  if (score >= 30) return 'F';
  return 'F-';
}

function getColorClasses(score: number): { bg: string; text: string; border: string } {
  if (score >= 90) return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
  if (score >= 80) return { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-200' };
  if (score >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
  if (score >= 60) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
  if (score >= 50) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
  if (score >= 40) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
  if (score >= 30) return { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-300' };
  return { bg: 'bg-red-300', text: 'text-red-950', border: 'border-red-400' };
}

function getSizeClasses(size: 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'sm':
      return 'px-2 py-1 text-sm';
    case 'md':
      return 'px-3 py-1.5 text-base';
    case 'lg':
      return 'px-4 py-2 text-lg';
  }
}

export default function ImpactBadge({ 
  score, 
  grade, 
  size = 'md', 
  showGrade = true,
  className = ''
}: ImpactBadgeProps) {
  const displayGrade = grade || getImpactGrade(score);
  const colors = getColorClasses(score);
  const sizeClass = getSizeClasses(size);
  
  return (
    <div 
      className={`inline-flex items-center gap-1 rounded-lg ${colors.bg} ${colors.text} border ${colors.border} font-bold ${sizeClass} ${className}`}
      aria-label={`Impact score: ${score} out of 100, grade ${displayGrade}`}
    >
      <span>{score}</span>
      {showGrade && (
        <>
          <span className="opacity-50">•</span>
          <span>{displayGrade}</span>
        </>
      )}
    </div>
  );
}
