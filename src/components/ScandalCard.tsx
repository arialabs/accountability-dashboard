import type { ScandalEntry } from "@/lib/types";
import SeverityBadge, { severityConfig } from "./SeverityBadge";
import SourceList from "./SourceList";
import Link from "next/link";
import { BodyText } from "@/components/ui";

interface ScandalCardProps {
  scandal: ScandalEntry;
  compact?: boolean;
  showMember?: boolean;
}

export default function ScandalCard({ 
  scandal, 
  compact = false, 
  showMember = true 
}: ScandalCardProps) {
  const config = severityConfig[scandal.severity];
  
  const getPartyBadgeClass = (party: string) => {
    switch (party) {
      case "D":
        return "bg-blue-100 text-blue-700";
      case "R":
        return "bg-red-100 text-red-700";
      case "I":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <article
      className={`
        bg-white 
        border-2 
        ${config.borderColor}
        rounded-xl 
        p-6 
        shadow-sm 
        hover:shadow-lg 
        transition-all 
        duration-300
        hover:border-slate-300
        ${config.bgColor}
      `}
      aria-label={`${scandal.severity}: ${scandal.title}, ${formatDate(scandal.date)}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
        {/* Left: Severity + Date */}
        <div className="flex flex-col gap-1">
          <SeverityBadge severity={scandal.severity} size="md" showLabel={true} />
          <div className="text-sm text-slate-500 font-mono">
            {formatDate(scandal.date)}
          </div>
        </div>
        
        {/* Right: Member Info */}
        {showMember && (
          <div className="flex flex-col items-start md:items-end gap-1">
            {scandal.bioguide_id ? (
              <Link 
                href={`/rep/${scandal.bioguide_id}`}
                className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-lg"
              >
                {scandal.member_name}
              </Link>
            ) : (
              <span className="font-bold text-slate-900 text-lg">
                {scandal.member_name}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${getPartyBadgeClass(scandal.party)}
              `}>
                {scandal.party}
              </span>
              <BodyText as="span">
                {scandal.chamber === "executive" ? "President" : scandal.chamber === "house" ? "Rep" : "Sen"}{scandal.state ? `, ${scandal.state}` : ''}
                {scandal.district ? `-${scandal.district}` : ''}
              </BodyText>
            </div>
          </div>
        )}
      </div>
      
      {/* Title */}
      <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
        {scandal.title}
      </h3>
      
      {/* Description */}
      <p className="text-slate-700 leading-relaxed text-base mb-4">
        {scandal.description}
      </p>
      
      {/* Status Badge */}
      {scandal.status === "ongoing" && (
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            ONGOING
          </span>
        </div>
      )}
      
      {scandal.status === "resolved" && scandal.outcome && (
        <div className="mb-4 p-3 bg-slate-100 rounded-lg">
          <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
            Outcome
          </div>
          <div className="text-sm text-slate-700 leading-relaxed">
            {scandal.outcome}
          </div>
        </div>
      )}
      
      {/* Sources */}
      <SourceList sources={scandal.sources} maxVisible={compact ? 2 : 3} />
    </article>
  );
}
