import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ArrowDownUp, IndianRupee, Zap, PiggyBank, Scale, Search, Loader2 } from 'lucide-react';
import { LocationPoint, PreferenceMode } from '../types';
import { searchPuneLocations } from '../services/mapbox';
import { PUNE_PRESET_TRIPS } from '../config/puneLandmarks';

interface SearchCardProps {
  origin: LocationPoint;
  destination: LocationPoint;
  budget: number;
  preference: PreferenceMode;
  isLoading: boolean;
  onOriginChange: (loc: LocationPoint) => void;
  onDestinationChange: (loc: LocationPoint) => void;
  onBudgetChange: (val: number) => void;
  onPreferenceChange: (pref: PreferenceMode) => void;
  onSubmit: () => void;
}

export const SearchCard: React.FC<SearchCardProps> = ({
  origin,
  destination,
  budget,
  preference,
  isLoading,
  onOriginChange,
  onDestinationChange,
  onBudgetChange,
  onPreferenceChange,
  onSubmit,
}) => {
  const [fromQuery, setFromQuery] = useState(origin.name);
  const [toQuery, setToQuery] = useState(destination.name);
  const [fromSuggestions, setFromSuggestions] = useState<LocationPoint[]>([]);
  const [toSuggestions, setToSuggestions] = useState<LocationPoint[]>([]);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Sync state if props change (e.g. from presets)
  useEffect(() => {
    setFromQuery(origin.name);
  }, [origin.name]);

  useEffect(() => {
    setToQuery(destination.name);
  }, [destination.name]);

  // Click outside listener
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setIsFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setIsToOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Debounced search
  const handleSearchFrom = async (val: string) => {
    setFromQuery(val);
    if (val.trim().length >= 2) {
      const results = await searchPuneLocations(val);
      setFromSuggestions(results);
      setIsFromOpen(true);
    } else {
      setFromSuggestions([]);
      setIsFromOpen(false);
    }
  };

  const handleSearchTo = async (val: string) => {
    setToQuery(val);
    if (val.trim().length >= 2) {
      const results = await searchPuneLocations(val);
      setToSuggestions(results);
      setIsToOpen(true);
    } else {
      setToSuggestions([]);
      setIsToOpen(false);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    onOriginChange(destination);
    onDestinationChange(temp);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Preset pills for instant testing */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
          Popular:
        </span>
        {PUNE_PRESET_TRIPS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              onOriginChange(preset.origin);
              onDestinationChange(preset.destination);
              onBudgetChange(preset.budget);
            }}
            className="px-2.5 py-1 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border border-zinc-200/70 text-[11px] font-medium shrink-0 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-3.5"
      >
        {/* Origin & Destination Inputs */}
        <div className="space-y-2">
          
          {/* Starting Location */}
          <div ref={fromRef} className="relative">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-400">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </span>
              <input
                type="text"
                value={fromQuery}
                onChange={(e) => handleSearchFrom(e.target.value)}
                onFocus={() => {
                  if (fromSuggestions.length > 0) setIsFromOpen(true);
                }}
                placeholder="Starting location in Pune (e.g. Hinjewadi, Kothrud)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Suggestions Dropdown */}
            {isFromOpen && fromSuggestions.length > 0 && (
              <div className="absolute z-40 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-zinc-200 max-h-48 overflow-y-auto divide-y divide-zinc-100">
                {fromSuggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onOriginChange(item);
                      setFromQuery(item.name);
                      setIsFromOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-zinc-800 hover:bg-zinc-50 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Trigger row */}
          <div className="flex justify-end pr-2 -my-1">
            <button
              type="button"
              onClick={handleSwap}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              title="Reverse route"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination Location */}
          <div ref={toRef} className="relative">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-400">
                <MapPin className="w-4 h-4 text-rose-500" />
              </span>
              <input
                type="text"
                value={toQuery}
                onChange={(e) => handleSearchTo(e.target.value)}
                onFocus={() => {
                  if (toSuggestions.length > 0) setIsToOpen(true);
                }}
                placeholder="Destination in Pune (e.g. Shivajinagar, Swargate)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Suggestions Dropdown */}
            {isToOpen && toSuggestions.length > 0 && (
              <div className="absolute z-40 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-zinc-200 max-h-48 overflow-y-auto divide-y divide-zinc-100">
                {toSuggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onDestinationChange(item);
                      setToQuery(item.name);
                      setIsToOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-zinc-800 hover:bg-zinc-50 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Budget & Preference Row */}
        <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-3 pt-1">
          
          {/* Budget */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Budget (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-400 font-bold text-xs">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="10"
                value={budget}
                onChange={(e) => onBudgetChange(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 font-mono text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Preference Segmented Tabs */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100/80 rounded-xl">
              <button
                type="button"
                onClick={() => onPreferenceChange('cheapest')}
                className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  preference === 'cheapest'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <PiggyBank className="w-3 h-3 text-emerald-600" />
                <span>Cheapest</span>
              </button>

              <button
                type="button"
                onClick={() => onPreferenceChange('fastest')}
                className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  preference === 'fastest'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Fastest</span>
              </button>

              <button
                type="button"
                onClick={() => onPreferenceChange('balanced')}
                className={`py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  preference === 'balanced'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Scale className="w-3 h-3 text-zinc-800" />
                <span>Balanced</span>
              </button>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              <span>Comparing Pune Transit Options...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Compare Transport Options</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};
