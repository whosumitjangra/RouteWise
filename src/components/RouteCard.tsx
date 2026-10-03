import React, { useState } from 'react';
import { 
  Train, 
  Bike, 
  Car, 
  Footprints, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  AlertCircle,
  HelpCircle
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
      case 'bike':
        return <Bike className="w-4 h-4 text-emerald-600" />;
      case 'cab':
        return <Car className="w-4 h-4 text-zinc-800" />;
      case 'walking':
        return <Footprints className="w-4 h-4 text-zinc-600" />;
      default:
        return <Car className="w-4 h-4 text-zinc-600" />;
    }
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
              {route.unfeasibleReason || 'Not feasible for this route'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border transition-all cursor-pointer ${
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
                : 'Estimated fare'}
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

        {/* Accordion trigger */}
        <div className="mt-2.5 pt-2 border-t border-zinc-50 flex items-center justify-between text-[11px] text-zinc-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="hover:text-zinc-700 flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Hide details' : 'View route steps'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

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

      {/* Expanded Step-by-Step Details */}
      {isExpanded && (
        <div className="p-3.5 bg-zinc-50/80 border-t border-zinc-200/80 rounded-b-xl space-y-2 text-xs">
          <div className="font-semibold text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
            Trip Itinerary
          </div>
          
          {route.legs.length > 0 ? (
            route.legs.map((leg, idx) => (
              <div key={leg.id || idx} className="flex items-start gap-2.5 text-zinc-700">
                <div className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-zinc-900 flex items-center justify-between">
                    <span>{leg.title}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {leg.durationMinutes}m • {leg.distanceKm} km
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {leg.instruction}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-zinc-500">
              Direct highway / city corridor from {route.subtitle}
            </div>
          )}

          <div className="pt-2 border-t border-zinc-200/60 text-[11px] text-zinc-500 italic">
            {route.cost.formulaDescription}
          </div>
        </div>
      )}

    </div>
  );
};
