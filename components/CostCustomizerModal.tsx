'use client';

import React, { useState } from 'react';
import { EngineParameters } from '@/lib/types';
import { DEFAULT_ENGINE_PARAMS } from '@/lib/routing/cost-engine';
import { Sliders, RotateCcw, Check, X, Fuel, Car, Gauge, DollarSign } from 'lucide-react';

interface CostCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParams: EngineParameters;
  onSaveParams: (params: EngineParameters) => void;
  currency: string;
}

export default function CostCustomizerModal({
  isOpen,
  onClose,
  currentParams,
  onSaveParams,
  currency,
}: CostCustomizerModalProps) {
  const [params, setParams] = useState<EngineParameters>(currentParams);

  if (!isOpen) return null;

  const handleChange = (key: keyof EngineParameters, value: number) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setParams(DEFAULT_ENGINE_PARAMS);
  };

  const handleSave = () => {
    onSaveParams(params);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Deterministic Fare Matrix Parameters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust regional cost coefficients and surge multipliers in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders and Input Groups */}
        <div className="space-y-6 my-6 text-sm">
          
          {/* Group 1: Driving Costs */}
          <div className="space-y-4">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-blue-500" />
              <span>Personal Driving Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fuel Price (per Liter)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={params.fuelPricePerLiter}
                    onChange={(e) => handleChange('fuelPricePerLiter', parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-slate-400">USD/L</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fuel Efficiency (km per Liter)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="4"
                    value={params.fuelEfficiencyKmPerLiter}
                    onChange={(e) => handleChange('fuelEfficiencyKmPerLiter', parseFloat(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-xs text-slate-400">km/L</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Highway Tolls ($ per 100 km)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={params.tollEstimatePer100Km}
                  onChange={(e) => handleChange('tollEstimatePer100Km', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Rideshare & Surge */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-purple-500" />
              <span>Rideshare & On-Demand Engine</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Surge Multiplier ($S_surge$)
                </label>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
                  {params.rideshareSurgeMultiplier.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={params.rideshareSurgeMultiplier}
                onChange={(e) => handleChange('rideshareSurgeMultiplier', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1.0x (Standard)</span>
                <span>1.5x (Peak)</span>
                <span>2.0x (High Demand)</span>
                <span>3.0x (Severe Surge)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Fare
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={params.rideshareBaseFare}
                  onChange={(e) => handleChange('rideshareBaseFare', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rate Per Km ($R_dist$)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={params.ridesharePerKmRate}
                  onChange={(e) => handleChange('ridesharePerKmRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Balanced Scoring & Value of Time */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-500" />
              <span>Economic Value of Time (Balanced Priority)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Opportunity Cost of Travel Time ($/hour)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={params.valueOfTimePerHour}
                onChange={(e) => handleChange('valueOfTimePerHour', parseFloat(e.target.value) || 15)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Higher time value prioritizes faster modes in the balanced ranking.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Fare Matrix</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
