import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { RouteOption } from '../types';

interface RecommendationBannerProps {
  recommendedRoute: RouteOption | null;
  explanationText: string;
  onSelectRoute: (id: string) => void;
}

export const RecommendationBanner: React.FC<RecommendationBannerProps> = ({
  recommendedRoute,
  explanationText,
  onSelectRoute,
}) => {
  if (!recommendedRoute || !explanationText) return null;

  return (
    <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-4 sm:p-5 text-emerald-950 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-extrabold text-sm">
            ★
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-[10px] sm:text-[11px] tracking-wider uppercase text-emerald-900 bg-emerald-200/90 border border-emerald-300 px-2 py-0.5 rounded-full">
                Recommended for you
              </span>
              <span className="font-bold text-xs sm:text-sm text-zinc-950">
                {recommendedRoute.title}
              </span>
              <span className="font-mono font-bold text-xs text-emerald-900 bg-white/90 px-2 py-0.5 rounded-md border border-emerald-200">
                ₹{recommendedRoute.cost.totalFare} Estimated fare
              </span>
            </div>

            <p className="text-xs sm:text-[13px] text-zinc-800 leading-snug font-medium">
              {explanationText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectRoute(recommendedRoute.id)}
          className="self-start sm:self-center shrink-0 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>View on Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
