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
            <span>Calculated Fare</span>
            <span className="font-mono text-emerald-700">₹{route.cost.totalFare}</span>
          </div>
        </div>

        {/* Transparency note */}
        <div className="p-3 bg-zinc-50 rounded-xl text-[11px] text-zinc-500 flex items-start gap-2 border border-zinc-100">
          <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
          <span>
            {route.mode === 'auto'
              ? 'Calculated strictly per official Pune RTO meter rates (₹25 for first 1.5 km, ₹17/km thereafter).'
              : route.mode === 'metro_multimodal'
              ? 'Calculated strictly per official Maha Metro Pune station distance slabs (₹10 to ₹35 max).'
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
