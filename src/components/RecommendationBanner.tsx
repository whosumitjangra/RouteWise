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
    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 sm:p-4 text-emerald-950 transition-all">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs tracking-wider uppercase text-emerald-800">
              AI Commute Intelligence
            </span>
            <span className="text-zinc-300">•</span>
            <span className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
              {recommendedRoute.title} (₹{recommendedRoute.cost.totalFare})
            </span>
          </div>

          <p className="text-xs sm:text-[13px] text-emerald-900/90 mt-1 leading-relaxed font-normal">
            {explanationText}
          </p>
        </div>

        <button
          onClick={() => onSelectRoute(recommendedRoute.id)}
          className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 shrink-0 self-center hover:underline underline-offset-4"
        >
          <span>View on Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
