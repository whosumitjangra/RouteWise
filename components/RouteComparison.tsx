'use client';

import React from 'react';
import { RouteOption } from '@/lib/types';
import { formatCurrency } from '@/lib/currencies';
import { X, Check, ArrowRight, Zap, PiggyBank, Scale, Leaf, Clock, Coins } from 'lucide-react';

interface RouteComparisonProps {
  selectedRoutes: RouteOption[];
  currency: string;
  onRemoveRoute: (id: string) => void;
  onClearAll: () => void;
}

export default function RouteComparison({
  selectedRoutes,
  currency,
  onRemoveRoute,
  onClearAll,
}: RouteComparisonProps) {
  if (selectedRoutes.length === 0) return null;

  // Find min cost & min duration among compared
  const minCost = Math.min(...selectedRoutes.map((r) => r.cost.totalCost));
  const minDuration = Math.min(...selectedRoutes.map((r) => r.durationMinutes));
  const minCo2 = Math.min(...selectedRoutes.map((r) => r.co2Kg));

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 text-white shadow-2xl transition-all animate-in slide-in-from-bottom-5">
      <div className="max-w-7xl mx-auto">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base sm:text-lg">
              Side-by-Side Mode Comparison ({selectedRoutes.length} selected)
            </h3>
          </div>
          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
            <span>Close Comparison</span>
          </button>
        </div>

        {/* Side-by-Side Grid */}
        <div className={`grid gap-4 ${
          selectedRoutes.length === 1
            ? 'grid-cols-1'
            : selectedRoutes.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-3'
        }`}>
          {selectedRoutes.map((route) => {
            const isLowestCost = route.cost.totalCost === minCost;
            const isFastest = route.durationMinutes === minDuration;
            const isEcoBest = route.co2Kg === minCo2;

            const hours = Math.floor(route.durationMinutes / 60);
            const mins = route.durationMinutes % 60;

            return (
              <div
                key={route.id}
                className="relative rounded-xl p-4 bg-slate-800/80 border border-slate-700 flex flex-col justify-between"
              >
                <button
                  onClick={() => onRemoveRoute(route.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700"
                  title="Remove from comparison"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <h4 className="font-bold text-sm sm:text-base text-emerald-400 pr-6">
                    {route.title}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {route.provider || route.subTitle}
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                    
                    {/* Cost */}
                    <div className={`p-2 rounded-lg border ${
                      isLowestCost
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        <span>Cost</span>
                        {isLowestCost && <span className="text-emerald-400">★ Cheapest</span>}
                      </div>
                      <div className="text-base font-extrabold mt-0.5">
                        {formatCurrency(route.cost.totalCost, currency)}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className={`p-2 rounded-lg border ${
                      isFastest
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Duration</span>
                        {isFastest && <span className="text-amber-400">⚡ Fastest</span>}
                      </div>
                      <div className="text-base font-extrabold mt-0.5">
                        {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
                      </div>
                    </div>

                    {/* CO2 */}
                    <div className={`p-2 rounded-lg border ${
                      isEcoBest
                        ? 'bg-teal-950/60 border-teal-500 text-teal-300 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        <span>Emissions</span>
                      </div>
                      <div className="text-sm font-bold mt-0.5">
                        {route.co2Kg} kg CO₂
                      </div>
                    </div>

                    {/* Distance */}
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                      <div className="text-[10px] text-slate-400">
                        Distance
                      </div>
                      <div className="text-sm font-bold mt-0.5">
                        {route.distanceKm} km
                      </div>
                    </div>

                  </div>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-700/60 pt-2 flex items-center justify-between">
                  <span>Reliability: {route.reliabilityScore}%</span>
                  <span className="text-emerald-400 font-medium">
                    {route.departureTimeFormatted} departure
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
