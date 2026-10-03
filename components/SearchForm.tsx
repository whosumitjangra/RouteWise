'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  ArrowRightLeft, 
  DollarSign, 
  Zap, 
  PiggyBank, 
  Scale, 
  Search, 
  Sparkles, 
  Loader2, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { LocationPoint, PriorityMode } from '@/lib/types';
import { POPULAR_PRESETS, TripPreset } from '@/lib/routing/cities';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';

interface SearchFormProps {
  origin: LocationPoint;
  destination: LocationPoint;
  maxBudget: number;
  priority: PriorityMode;
  currency: string;
  showOverBudget: boolean;
  isLoading: boolean;
  onOriginChange: (loc: LocationPoint) => void;
  onDestinationChange: (loc: LocationPoint) => void;
  onBudgetChange: (val: number) => void;
  onPriorityChange: (mode: PriorityMode) => void;
  onToggleOverBudget: (show: boolean) => void;
  onSubmit: () => void;
  onOpenSettings: () => void;
}

export default function SearchForm({
  origin,
  destination,
  maxBudget,
  priority,
  currency,
  showOverBudget,
  isLoading,
  onOriginChange,
  onDestinationChange,
  onBudgetChange,
  onPriorityChange,
  onToggleOverBudget,
  onSubmit,
  onOpenSettings,
}: SearchFormProps) {
  const [originInput, setOriginInput] = useState(origin.name);
  const [destInput, setDestInput] = useState(destination.name);
  const [originSuggestions, setOriginSuggestions] = useState<LocationPoint[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationPoint[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Sync inputs when props change
  useEffect(() => {
    setOriginInput(origin.name);
  }, [origin.name]);

  useEffect(() => {
    setDestInput(destination.name);
  }, [destination.name]);

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search geocode API with debounce
  const searchLocations = async (query: string, target: 'origin' | 'dest') => {
    if (!query || query.length < 2) {
      if (target === 'origin') setOriginSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    if (target === 'origin') setIsSearchingOrigin(true);
    else setIsSearchingDest(true);

    try {
      const res = await fetch(`/api/route/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (target === 'origin') {
          setOriginSuggestions(data.results || []);
          setShowOriginDropdown(true);
        } else {
          setDestSuggestions(data.results || []);
          setShowDestDropdown(true);
        }
      }
    } catch (e) {
      // Ignore geocode error
    } finally {
      if (target === 'origin') setIsSearchingOrigin(false);
      else setIsSearchingDest(false);
    }
  };

  const handleSwap = () => {
    const tempOrigin = origin;
    onOriginChange(destination);
    onDestinationChange(tempOrigin);
  };

  const applyPreset = (preset: TripPreset) => {
    onOriginChange(preset.origin);
    onDestinationChange(preset.destination);
    onBudgetChange(preset.recommendedBudget);
  };

  const currSymbol = SUPPORTED_CURRENCIES[currency]?.symbol || '$';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-all">
      
      {/* Preset Quick Badges */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Demo Routes</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 font-medium transition-all flex items-center gap-1 shadow-sm"
            >
              <span>{preset.label}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                ({currSymbol}{preset.recommendedBudget})
              </span>
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-5"
      >
        {/* Origin & Destination Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] items-center gap-3">
          
          {/* Origin Input */}
          <div ref={originRef} className="relative">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Origin Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={originInput}
                onChange={(e) => {
                  setOriginInput(e.target.value);
                  searchLocations(e.target.value, 'origin');
                }}
                onFocus={() => {
                  if (originSuggestions.length > 0) setShowOriginDropdown(true);
                }}
                placeholder="Search origin city, station, or airport..."
                className="w-full pl-10 pr-9 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
              />
              {originInput && (
                <button
                  type="button"
                  onClick={() => {
                    setOriginInput('');
                    setOriginSuggestions([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Origin Autocomplete Dropdown */}
            {showOriginDropdown && originSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {originSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onOriginChange(item);
                      setOriginInput(item.name);
                      setShowOriginDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/80 transition-colors flex items-start gap-2.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</div>
                      {item.country && <div className="text-[11px] text-slate-400">{item.country}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1 lg:my-0 lg:pt-5">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:scale-105 active:scale-95"
              title="Reverse Origin and Destination"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Input */}
          <div ref={destRef} className="relative">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Destination Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-500">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={destInput}
                onChange={(e) => {
                  setDestInput(e.target.value);
                  searchLocations(e.target.value, 'dest');
                }}
                onFocus={() => {
                  if (destSuggestions.length > 0) setShowDestDropdown(true);
                }}
                placeholder="Search destination city, station, or airport..."
                className="w-full pl-10 pr-9 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
              />
              {destInput && (
                <button
                  type="button"
                  onClick={() => {
                    setDestInput('');
                    setDestSuggestions([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Destination Autocomplete Dropdown */}
            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {destSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onDestinationChange(item);
                      setDestInput(item.name);
                      setShowDestDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/80 transition-colors flex items-start gap-2.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</div>
                      {item.country && <div className="text-[11px] text-slate-400">{item.country}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Budget & Priority Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          
          {/* Max Budget Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Maximum Budget ({currency})
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-slate-500">
                {currSymbol}
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={maxBudget}
                onChange={(e) => onBudgetChange(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {/* Priority Preference Segment */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Optimization Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onPriorityChange('fastest')}
                className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  priority === 'fastest'
                    ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Fastest</span>
              </button>

              <button
                type="button"
                onClick={() => onPriorityChange('cheapest')}
                className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  priority === 'cheapest'
                    ? 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Cheapest</span>
              </button>

              <button
                type="button"
                onClick={() => onPriorityChange('balanced')}
                className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  priority === 'balanced'
                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Balanced</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Row: Filter Toggle & Run Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showOverBudget}
                onChange={(e) => onToggleOverBudget(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Show over-budget options</span>
            </label>

            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors underline-offset-2 hover:underline"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Fuel & Surge Rates</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Graph Feeds...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Compare All Modes</span>
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
}
