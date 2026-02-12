import { getMemberScandals } from "@/lib/data";
import ScandalCard from "./ScandalCard";
import Link from "next/link";

interface ScandalsSectionProps {
  bioguideId: string;
  memberName: string;
  maxVisible?: number;
}

export default function ScandalsSection({ 
  bioguideId, 
  memberName,
  maxVisible = 3 
}: ScandalsSectionProps) {
  const scandals = getMemberScandals(bioguideId);
  const visibleScandals = scandals.slice(0, maxVisible);
  const hasMore = scandals.length > maxVisible;

  return (
    <section className="mt-12" aria-label="Scandals and controversies">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2 flex items-center gap-2">
          ⚠️ Scandals & Controversies
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Verified incidents with sources
        </p>
      </div>
      
      {/* Content */}
      {scandals.length === 0 ? (
        // Clean record message
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">✓</div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            No verified incidents on record
          </h3>
          <p className="text-green-700 leading-relaxed max-w-2xl mx-auto">
            This member has no documented scandals, ethics violations, or investigations 
            meeting our sourcing requirements.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Scandal Cards */}
          {visibleScandals.map((scandal) => (
            <ScandalCard 
              key={scandal.id}
              scandal={scandal}
              showMember={false}
            />
          ))}
          
          {/* View All Link */}
          {hasMore && (
            <div className="text-center pt-4">
              <Link
                href={`/scandals?member=${bioguideId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                View All ({scandals.length}) Incidents →
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
