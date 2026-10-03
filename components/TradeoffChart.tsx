'use client';

import React from 'react';
import { RouteOption } from '@/lib/types';
import { formatCurrency } from '@/lib/currencies';
import { TrendingUp } from 'lucide-react';

interface TradeoffChartProps {
  routes: RouteOption[];
  currency: string;
  maxBudget: number;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

export default function TradeoffChart({
  routes,
  currency,
  maxBudget,
  selectedRouteId,
  onSelectRoute,
}: TradeoffChartProps) {
  if (routes.length === 0) return null;

  const costs = routes.map((r) => r.cost.totalCost);
  const durations = routes.map((r) => r.durationMinutes);

  const maxCost = Math.max(...costs, maxBudget, 10);
  const minCost = 0;
  const maxDuration = Math.max(...durations, 60);
  const minDuration = 0;

  // Chart padding percentages
  const getX = (duration: number) => {
    const pct = ((duration - minDuration) / (maxDuration - minDuration)) * 82 + 8;
    return Math.min(92, Math.max(8, pct));
  };

  const getY = (cost: number) => {
    // 0 is bottom (y=88%), max is top (y=12%)
    const pct = 88 - ((cost - minCost) / (maxCost - minCost)) * 74;
    return Math.min(88, Math.max(12, pct));
  };

  const budgetY = getY(maxBudget);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 dark:border-slate-800">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Cost vs. Travel Time Tradeoff Matrix (Pareto Frontier)
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Optimal modes cluster bottom-left
        </span>
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full h-64 sm:h-72 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 select-none overflow-hidden">
        
        {/* Budget Line */}
        <div
          className="absolute left-8 right-4 border-b-2 border-dashed border-rose-400/80 z-0 pointer-events-none flex items-center justify-end"
          style={{ top: `${budgetY}%` }}
        >
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 -translate-y-3 mr-2 shadow-xs">
            Max Budget: {formatCurrency(maxBudget, currency)}
          </span>
        </div>

        {/* Axis Labels */}
        <div className="absolute left-2 top-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Cost ({currency}) ↑
        </div>
        <div className="absolute right-3 bottom-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Duration (Time) →
        </div>

        {/* Quadrant Guide Labels */}
        <div className="absolute top-4 left-10 text-[10px] text-slate-400/60 font-semibold pointer-events-none">
          Premium / Fast
        </div>
        <div className="absolute bottom-6 left-10 text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-semibold pointer-events-none">
          ★ Sweet Spot (Cheap & Fast)
        </div>
        <div className="absolute bottom-6 right-8 text-[10px] text-slate-400/60 font-semibold pointer-events-none">
          Economical / Slow
        </div>

        {/* Plot Route Points */}
        {routes.map((route) => {
          const x = getX(route.durationMinutes);
          const y = getY(route.cost.totalCost);
          const isSelected = selectedRouteId === route.id;
          const hours = Math.floor(route.durationMinutes / 60);
          const mins = route.durationMinutes % 60;
          const durStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all z-10"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Bubble Pin */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                  isSelected
                    ? 'ring-4 ring-emerald-500 scale-125 bg-emerald-600 text-white'
                    : route.isOverBudget
                    ? 'bg-rose-500 text-white hover:scale-110'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-emerald-500 hover:scale-110'
                }`}
              >
                {route.mode === 'driving' && '🚗'}
                {route.mode === 'rideshare' && '🚕'}
                {route.mode === 'train' && '🚆'}
                {route.mode === 'bus' && '🚌'}
                {route.mode === 'transit' && '🚊'}
                {route.mode === 'flight' && '✈️'}
                {route.mode === 'walking' && '🚶'}
                {route.mode === 'bicycling' && '🚲'}
              </div>

              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] shadow-xl pointer-events-none transition-opacity z-30">
                <div className="font-bold">{route.title}</div>
                <div className="text-emerald-400">{formatCurrency(route.cost.totalCost, currency)} • {durStr}</div>
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}
