import Link from "next/link";
import { notFound } from "next/navigation";
import { getPolicy, getPolicies, POLICY_CATEGORIES, formatNumber, getPromiseQuadrant } from "@/lib/policy-data";
import ImpactBadge from "@/components/ImpactBadge";

export function generateStaticParams() {
  return getPolicies().map((policy) => ({
    slug: policy.slug,
  }));
}

export default async function PolicyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  
  if (!policy) {
    notFound();
  }
  
  const category = POLICY_CATEGORIES[policy.category];
  const quadrant = getPromiseQuadrant(policy.promise_alignment, policy.impact_score);
  const daysAgo = Math.floor(
    (Date.now() - new Date(policy.last_updated).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link 
            href="/executive/president/policies"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
          >
            ← Back to Policies
          </Link>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {category.icon} {category.name}
            </span>
            <span className="text-sm text-slate-400">•</span>
            <span className="text-sm text-slate-500">
              Updated {daysAgo === 0 ? 'today' : `${daysAgo} days ago`}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            {policy.title}
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed">
            {policy.summary}
          </p>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-8 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Impact Score
              </div>
              <ImpactBadge score={policy.impact_score} size="lg" />
              <div className="text-sm text-slate-600 mt-2">
                {policy.impact_score >= 60 ? 'Positive' : 
                 policy.impact_score >= 50 ? 'Mixed' : 'Negative'} impact
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Americans Affected
              </div>
              <div className="text-3xl font-black text-slate-900">
                {formatNumber(policy.americans_affected)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Campaign Alignment
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1">
                {policy.promise_alignment}%
              </div>
              <div className="text-sm text-slate-600">
                {policy.promise_alignment >= 80 ? 'High alignment' :
                 policy.promise_alignment >= 60 ? 'Moderate alignment' : 'Low alignment'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy vs Campaign Rhetoric */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Policy vs Campaign Rhetoric</h2>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            {/* Campaign Alignment Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Campaign Alignment</span>
                <span className="text-sm font-bold text-slate-900">{policy.promise_alignment}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${policy.promise_alignment}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Policy {policy.promise_alignment >= 80 ? 'closely' : policy.promise_alignment >= 60 ? 'partially' : 'minimally'} matched campaign rhetoric
              </p>
            </div>
            
            {/* Impact Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Impact on Americans</span>
                <ImpactBadge score={policy.impact_score} size="sm" />
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    policy.impact_score >= 70 ? 'bg-green-500' :
                    policy.impact_score >= 60 ? 'bg-yellow-500' :
                    policy.impact_score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${policy.impact_score}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {policy.impact_score >= 60 ? 'Positive' : 
                 policy.impact_score >= 50 ? 'Mixed' : 'Negative'} measurable outcomes
              </p>
            </div>
            
            {/* Quadrant Assessment */}
            <div className={`rounded-lg p-4 border ${quadrant.color}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{quadrant.icon}</span>
                <div className="text-sm">
                  <div className="font-bold mb-1">{quadrant.label}</div>
                  <div>{quadrant.description}</div>
                </div>
              </div>
            </div>
            
            {/* Details */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                  Campaign Rhetoric
                </div>
                <div className="text-sm text-slate-700 bg-slate-50 rounded p-3 border border-slate-200">
                  "{policy.what_was_promised}"
                </div>
              </div>
              
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                  Actual Policy Actions
                </div>
                <div className="text-sm text-slate-700 bg-slate-50 rounded p-3 border border-slate-200">
                  <ul className="space-y-1">
                    {policy.what_actually_happened.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Measurable Outcomes */}
      {policy.economic_data && policy.economic_data.length > 0 && (
        <section className="py-12 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Measurable Outcomes</h2>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="space-y-4">
                {policy.economic_data.map((metric, idx) => (
                  <div key={idx} className="pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">
                          {metric.metric}
                        </div>
                        <div className="text-2xl font-black text-slate-900 mb-2">
                          {metric.value}
                        </div>
                        <div className="text-xs text-slate-500">
                          📊 Source: {metric.source} • {new Date(metric.date).toLocaleDateString()}
                        </div>
                      </div>
                      <a 
                        href={metric.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex-shrink-0"
                      >
                        View Data →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Public Polling */}
      {policy.polling_data && policy.polling_data.length > 0 && (
        <section className="py-12 bg-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Public Polling</h2>
            
            {policy.polling_data.map((poll, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Approve</span>
                      <span className="text-sm font-bold text-green-700">{poll.approve}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${poll.approve}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Disapprove</span>
                      <span className="text-sm font-bold text-red-700">{poll.disapprove}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${poll.disapprove}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">No Opinion</span>
                      <span className="text-sm font-bold text-slate-600">{poll.no_opinion}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400" style={{ width: `${poll.no_opinion}%` }} />
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 pt-2">
                    📊 {poll.pollster} • Sample: {poll.sample_size.toLocaleString()} • {new Date(poll.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Expert Analysis */}
      {policy.expert_analyses && policy.expert_analyses.length > 0 && (
        <section className="py-12 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Expert Analysis</h2>
            
            <div className="space-y-4">
              {policy.expert_analyses.map((analysis, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">
                        {analysis.type === 'Government' ? '🏛️' :
                         analysis.type === 'Think Tank' ? '💡' :
                         analysis.type === 'Research' ? '🔬' : '🎓'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 mb-1">
                        {analysis.organization}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          analysis.bias === 'Non-partisan' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {analysis.bias}
                        </span>
                        <span className="text-xs text-slate-500">{analysis.type}</span>
                      </div>
                      
                      <p className="text-sm text-slate-700 mb-3">
                        {analysis.summary}
                      </p>
                      
                      {analysis.methodology && analysis.methodology.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                          {analysis.methodology.map((method, midx) => (
                            <span key={midx} className="bg-slate-100 px-2 py-1 rounded">
                              {method}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <a 
                        href={analysis.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Read full analysis →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      {policy.timeline && policy.timeline.length > 0 && (
        <section className="py-12 bg-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Policy Timeline</h2>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="space-y-4">
                {policy.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-24 text-sm text-slate-600">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 mb-1">{event.title}</div>
                      <div className="text-sm text-slate-600">{event.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Impact Score Breakdown */}
      <section className="py-12 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">How This Score Was Calculated</h2>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Economic Impact</span>
                <span className={`font-mono text-sm font-semibold ${
                  policy.impact_factors.economic >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {policy.impact_factors.economic > 0 ? '+' : ''}{policy.impact_factors.economic}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Social Impact</span>
                <span className={`font-mono text-sm font-semibold ${
                  policy.impact_factors.social >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {policy.impact_factors.social > 0 ? '+' : ''}{policy.impact_factors.social}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Public Polling</span>
                <span className={`font-mono text-sm font-semibold ${
                  policy.impact_factors.polling >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {policy.impact_factors.polling > 0 ? '+' : ''}{policy.impact_factors.polling}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Expert Analysis</span>
                <span className={`font-mono text-sm font-semibold ${
                  policy.impact_factors.expert >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {policy.impact_factors.expert > 0 ? '+' : ''}{policy.impact_factors.expert}
                </span>
              </div>
              
              <div className="border-t border-slate-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Final Impact Score</span>
                  <ImpactBadge score={policy.impact_score} size="lg" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-slate-600 bg-slate-50 rounded p-3">
              <strong>Methodology:</strong> Impact scores are calculated using a multi-factor model that weighs 
              economic data (GDP, jobs, prices), social outcomes, public polling, and expert analysis from 
              non-partisan institutions. Scores range from 0-100, with higher scores indicating more positive 
              outcomes for Americans.
            </div>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <Link 
            href="/executive/president/policies"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to All Policies
          </Link>
        </div>
      </section>
    </div>
  );
}
