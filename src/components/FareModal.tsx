import React from 'react';
import { X, Check, Calculator, Info } from 'lucide-react';
import { RouteOption } from '../types';
import { FARE_CONFIG } from '../config/fares';

interface FareModalProps {
  route: RouteOption | null;
  onClose: () => void;
}

export const FareModal: React.FC<FareModalProps> = ({ route, onClose }) => {
  if (!route) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-zinc-200 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-zinc-950">
              Fare Estimation Breakdown
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Mode Summary */}
        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
          <div className="text-xs font-semibold text-zinc-900">
            {route.title}
          </div>
          <div className="font-mono text-lg font-extrabold text-zinc-950 mt-0.5">
            ₹{route.cost.totalFare}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {route.cost.formulaDescription}
          </p>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-600">
            <span>Base Unlock / Station Slab</span>
            <span className="font-mono font-medium text-zinc-900">₹{route.cost.baseFare}</span>
          </div>

          <div className="flex items-center justify-between text-zinc-600">
            <span>Distance Traveled</span>
            <span className="font-mono font-medium text-zinc-900">{route.distanceKm} km</span>
          </div>

          <div className="flex items-center justify-between text-zinc-600">
            <span>Estimated Duration</span>
            <span className="font-mono font-medium text-zinc-900">{route.durationMinutes} min</span>
          </div>

          {route.cost.timeFare !== undefined && route.cost.timeFare > 0 && (
            <div className="flex items-center justify-between text-zinc-600">
              <span>Traffic Buffer / Feeder</span>
              <span className="font-mono font-medium text-zinc-900">₹{route.cost.timeFare}</span>
            </div>
          )}

          <div className="flex items-center justify-between font-bold text-zinc-950 pt-2 border-t border-zinc-100">
            <span>Estimated Fare</span>
            <span className="font-mono text-emerald-700">₹{route.cost.totalFare}</span>
          </div>
        </div>

        {/* Estimated Provider Rates Breakdown for Auto */}
        {route.mode === 'auto' && (
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-2">
            <span className="text-[11px] font-bold text-amber-950 block">
              Estimated Provider Comparison:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-zinc-200">
                <span className="text-[10px] text-zinc-500 block font-medium">Uber Auto (Est.)</span>
                <span className="font-mono font-bold text-zinc-900">
                  ₹{Math.round(route.cost.totalFare * 1.05 + 4)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-zinc-200">
                <span className="text-[10px] text-zinc-500 block font-medium">Rapido Auto (Est.)</span>
                <span className="font-mono font-bold text-zinc-900">
                  ₹{Math.max(25, Math.round(route.cost.totalFare * 0.96))}
                </span>
              </div>
            </div>
            {route.distanceKm <= 10 ? (
              <div className="bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-900 font-semibold block">Manual Offline Booking</span>
                  <span className="text-[9px] text-amber-700 font-bold">Price may vary</span>
                </div>
                <span className="font-mono font-bold text-amber-950">
                  ₹{Math.max(15, Math.round(route.cost.totalFare / 3.5))}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-zinc-500 block">
                Offline shared auto unavailable for &gt;10 km.
              </span>
            )}
          </div>
        )}

        {/* Transparency note */}
        <div className="p-3 bg-zinc-50 rounded-xl text-[11px] text-zinc-500 flex items-start gap-2 border border-zinc-100">
          <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
          <span>
            {route.mode === 'auto'
              ? 'Calculated strictly per official Pune RTO meter rates (₹25 for first 1.5 km, ₹17/km thereafter).'
              : route.mode === 'metro_multimodal'
              ? 'Calculated strictly per official Maha Metro Pune station distance slabs (₹10 to ₹35 max).'
              : route.mode === 'bus'
              ? 'Calculated strictly per official PMPML Pune distance stage slabs (₹5 to ₹35 max). Daily pass (₹50) is also accepted on all city & BRTS routes.'
              : 'Clearly labelled estimated fare based on standard Pune market rates. Actual app surge may vary.'}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-zinc-950 text-white text-xs font-semibold rounded-xl hover:bg-zinc-800 transition-colors"
        >
          Close
        </button>

      </div>
    </div>
  );
};
