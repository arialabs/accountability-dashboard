import Link from "next/link";
import cabinetData from "@/data/cabinet.json";

// Calculate a basic alignment score based on conflicts
function calculateAlignmentScore(member: any): number {
  let score = 100;
  
  if (member.conflicts_of_interest) {
    member.conflicts_of_interest.forEach((conflict: any) => {
      switch (conflict.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });
  }
  
  return Math.max(0, Math.min(100, score));
}

function getAlignmentColor(score: number): string {
  if (score >= 70) return 'text-green-600 bg-green-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

export default function CabinetPage() {
  const { members } = cabinetData;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50 to-white border-b border-slate-200 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4">
              Cabinet Members
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
              The President's Cabinet advises on matters related to the duties of their respective offices. 
              Below are the members of President Trump's Cabinet with alignment scores based on conflicts of interest.
            </p>
            <div className="inline-flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-slate-600">High Alignment (70+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-slate-600">Medium (40-69)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-slate-600">Low (&lt;40)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cabinet Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div 
            data-testid="cabinet-grid"
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {members.map((member) => {
              const alignmentScore = calculateAlignmentScore(member);
              const alignmentColor = getAlignmentColor(alignmentScore);
              
              return (
                <Link
                  key={member.id}
                  href={`/executive/cabinet/${member.id}`}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Photo */}
                  <div className="aspect-square overflow-hidden bg-slate-100 relative">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Alignment Badge */}
                    <div className="absolute top-2 right-2">
                      <div className={`px-3 py-1 rounded-full font-bold text-sm ${alignmentColor}`}>
                        {alignmentScore}
                      </div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">
                      {member.role}
                    </p>
                    <p className="text-xs text-slate-400">
                      {member.department}
                    </p>
                    {member.conflicts_of_interest && member.conflicts_of_interest.length > 0 && (
                      <p className="text-xs text-orange-600 mt-2">
                        {member.conflicts_of_interest.length} conflict{member.conflicts_of_interest.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <Link 
            href="/executive"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Executive Branch
          </Link>
        </div>
      </section>
    </div>
  );
}
