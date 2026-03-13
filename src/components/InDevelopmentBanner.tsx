interface InDevelopmentBannerProps {
  features: Array<{ name: string; description: string }>;
}

export default function InDevelopmentBanner({ features }: InDevelopmentBannerProps) {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Coming Soon
      </h4>
      <div className="space-y-3">
        {features.map((feature) => (
          <div key={feature.name} className="flex items-start gap-3">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-slate-700 text-sm">{feature.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
