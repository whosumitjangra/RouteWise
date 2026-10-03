import React, { useState } from 'react';
import { 
  Train, 
  Car, 
  Footprints, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shuffle
} from 'lucide-react';
import { RouteOption } from '../types';

interface RouteCardProps {
  route: RouteOption;
  budget: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenFareDetails: (route: RouteOption) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  budget,
  isSelected,
  onSelect,
  onOpenFareDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderIcon = () => {
    switch (route.mode) {
      case 'metro_multimodal':
        return <Train className="w-4 h-4 text-indigo-600" />;
      case 'auto':
        return (
          <span className="font-bold text-xs text-amber-700 font-mono tracking-tighter">
            🛺
          </span>
        );
      case 'cab':
        return <Car className="w-4 h-4 text-zinc-800" />;
      case 'walking':
        return <Footprints className="w-4 h-4 text-zinc-600" />;
      default:
        return <Car className="w-4 h-4 text-zinc-600" />;
    }
  };

  const handleCardClick = () => {
    onSelect();
    // Toggle path in brief on tap as requested by user
    setIsExpanded((prev) => !prev);
  };

  if (!route.isFeasible) {
    return (
      <div className="bg-zinc-50/70 border border-zinc-200/60 rounded-xl p-3.5 text-zinc-400 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="opacity-50">{renderIcon()}</div>
          <div>
            <span className="font-semibold text-zinc-500 line-through mr-2">
              {route.title}
            </span>
            <span className="text-[11px] text-zinc-400 block sm:inline">
              {route.unfeasibleReason || 'Not practical for this route'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className={`rounded-xl border transition-all cursor-pointer select-none ${
        isSelected
          ? 'bg-white border-zinc-950 ring-1 ring-zinc-950 shadow-sm'
          : 'bg-white border-zinc-200/90 hover:border-zinc-300 shadow-2xs'
      }`}
    >
      <div className="p-3.5 sm:p-4">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
              {renderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-900">
                  {route.title}
                </h3>
                {route.isRecommended && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ★ Best Choice
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                {route.subtitle}
              </p>
            </div>
          </div>

          {/* Fare display */}
          <div className="text-right shrink-0">
            <div className="font-mono font-extrabold text-base sm:text-lg text-zinc-950">
              ₹{route.cost.totalFare}
            </div>
            <div className="text-[10px] text-zinc-400">
              {route.mode === 'metro_multimodal' || route.mode === 'auto'
                ? 'Standard tariff'
                : 'Live market fare'}
            </div>
          </div>

        </div>

        {/* Primary Metrics: Duration, Distance, Budget status */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-100 text-xs">
          
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="font-semibold text-zinc-800">
              {route.durationMinutes} min
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-500">
              {route.distanceKm} km
            </span>
          </div>

          {/* Budget delta indicator */}
          <div className="text-[11px]">
            {route.isOverBudget ? (
              <span className="font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>+₹{route.budgetDelta} over budget</span>
              </span>
            ) : (
              <span className="font-medium text-emerald-700">
                ₹{Math.abs(route.budgetDelta)} under budget
              </span>
            )}
          </div>

        </div>

        {/* Quick Path Indicator & Tap instruction */}
        <div className="mt-2.5 pt-2 border-t border-zinc-50 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1 text-zinc-600 font-medium">
            <span>{isExpanded ? 'Tap to collapse path' : 'Tap to view full path & transfers'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFareDetails(route);
            }}
            className="hover:text-zinc-700 flex items-center gap-0.5 transition-colors underline-offset-2 hover:underline"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Fare info</span>
          </button>
        </div>

      </div>

      {/* Expanded Brief Path Breakdown (Tap to open) */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 bg-zinc-50/90 border-t border-zinc-200/80 rounded-b-xl space-y-3 text-xs animate-in fade-in">
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-700">
              Complete Path & Transit Steps
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              Total {route.durationMinutes} min • {route.distanceKm} km
            </span>
          </div>

          {/* Step-by-Step Path Timeline */}
          <div className="space-y-2.5">
            {route.legs.map((leg, idx) => {
              const isInterchange = leg.title.includes('District Court') || leg.title.includes('Transfer');

              return (
                <div
                  key={leg.id || idx}
                  className={`p-3 rounded-xl border text-xs ${
                    isInterchange
                      ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
                      : 'bg-white border-zinc-200/80 text-zinc-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                        isInterchange
                          ? 'bg-amber-500 text-white'
                          : 'bg-zinc-200 text-zinc-800'
                      }`}
                    >
                      {isInterchange ? <Shuffle className="w-3 h-3" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-zinc-900 truncate">
                          {leg.title}
                        </span>
                        {leg.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0 ${
                              leg.badge.includes('Purple')
                                ? 'bg-indigo-100 text-indigo-800'
                                : leg.badge.includes('Aqua')
                                ? 'bg-cyan-100 text-cyan-800'
                                : leg.badge.includes('Transfer')
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {leg.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                        {leg.instruction}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-400 font-mono">
                        <span>{leg.durationMinutes} mins</span>
                        <span>•</span>
                        <span>{leg.distanceKm} km</span>
                        {leg.cost > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">₹{leg.cost}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Tariff Summary */}
          <div className="p-2.5 bg-white rounded-lg border border-zinc-200/80 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Tariff Rule:</span>
            <span className="font-medium text-zinc-800">{route.cost.formulaDescription}</span>
          </div>

        </div>
      )}

    </div>
  );
};
