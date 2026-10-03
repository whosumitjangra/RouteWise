import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  ArrowDownUp, 
  Zap, 
  PiggyBank, 
  Scale, 
  Search, 
  Loader2, 
  Train, 
  GraduationCap, 
  Building2, 
  X,
  Navigation,
  CheckCircle2 
} from 'lucide-react';
import { LocationPoint, PreferenceMode } from '../types';
import { searchPuneLocations, resolveLocationQuery, getRoadRoute, haversineDistanceKm } from '../services/mapbox';
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
  onSubmit: (resolvedOrigin?: LocationPoint, resolvedDestination?: LocationPoint) => void;
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
  const [isResolving, setIsResolving] = useState(false);

  // Corridor distance calculator state
  const [feasibleDistanceKm, setFeasibleDistanceKm] = useState<number | null>(null);
  const [feasibleDurationMin, setFeasibleDurationMin] = useState<number | null>(null);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const fromDebounceRef = useRef<any>(null);
  const toDebounceRef = useRef<any>(null);

  // Dynamic Corridor Distance Calculator
  useEffect(() => {
    let isCancelled = false;
    async function calculateCorridor() {
      if (!origin || !destination) return;
      try {
        const road = await getRoadRoute(origin, destination, 'driving');
        if (!isCancelled) {
          setFeasibleDistanceKm(road.distanceKm);
          setFeasibleDurationMin(road.durationMinutes);
        }
      } catch (err) {
        const straight = haversineDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
        const distKm = +(straight * 1.28).toFixed(1);
        if (!isCancelled) {
          setFeasibleDistanceKm(distKm);
          setFeasibleDurationMin(Math.round((distKm / 26) * 60));
        }
      }
    }
    calculateCorridor();
    return () => {
      isCancelled = true;
    };
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

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

  // Fast debounced predictive search
  const handleSearchFrom = (val: string) => {
    setFromQuery(val);
    clearTimeout(fromDebounceRef.current);
    
    if (val.trim().length >= 1) {
      fromDebounceRef.current = setTimeout(async () => {
        const results = await searchPuneLocations(val);
        setFromSuggestions(results);
        setIsFromOpen(true);
      }, 100);
    } else {
      setFromSuggestions([]);
      setIsFromOpen(false);
    }
  };

  const handleSearchTo = (val: string) => {
    setToQuery(val);
    clearTimeout(toDebounceRef.current);

    if (val.trim().length >= 1) {
      toDebounceRef.current = setTimeout(async () => {
        const results = await searchPuneLocations(val);
        setToSuggestions(results);
        setIsToOpen(true);
      }, 100);
    } else {
      setToSuggestions([]);
      setIsToOpen(false);
    }
  };

  const handleSwap = () => {
    const tempOrigin = origin;
    const tempDest = destination;
    onOriginChange(tempDest);
    onDestinationChange(tempOrigin);
    setFromQuery(tempDest.name);
    setToQuery(tempOrigin.name);
  };

  // Handle Form Submit with automatic query resolution
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResolving(true);
    setIsFromOpen(false);
    setIsToOpen(false);

    try {
      // Resolve "From" query if user typed something custom
      let resolvedFrom = origin;
      if (fromQuery.trim() && fromQuery.trim().toLowerCase() !== origin.name.toLowerCase()) {
        resolvedFrom = await resolveLocationQuery(fromQuery, origin);
        onOriginChange(resolvedFrom);
        setFromQuery(resolvedFrom.name);
      }

      // Resolve "To" query if user typed something custom
      let resolvedTo = destination;
      if (toQuery.trim() && toQuery.trim().toLowerCase() !== destination.name.toLowerCase()) {
        resolvedTo = await resolveLocationQuery(toQuery, destination);
        onDestinationChange(resolvedTo);
        setToQuery(resolvedTo.name);
      }

      // Execute calculation with resolved coordinates
      onSubmit(resolvedFrom, resolvedTo);
    } finally {
      setIsResolving(false);
    }
  };

  const renderBadge = (item: LocationPoint) => {
    if (item.landmarkType === 'metro') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Train className="w-2.5 h-2.5" /> Metro
        </span>
      );
    }
    if (item.name.toLowerCase().includes('ait') || item.name.toLowerCase().includes('college') || item.name.toLowerCase().includes('university') || item.name.toLowerCase().includes('institute')) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <GraduationCap className="w-2.5 h-2.5" /> Institute
        </span>
      );
    }
    if (item.name.toLowerCase().includes('station') || item.name.toLowerCase().includes('junction') || item.name.toLowerCase().includes('terminal')) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Transit Hub
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-600">
        <Building2 className="w-2.5 h-2.5" /> Pune
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Preset pills for instant testing */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
          Quick Demo:
        </span>
        {PUNE_PRESET_TRIPS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              onOriginChange(preset.origin);
              onDestinationChange(preset.destination);
              onBudgetChange(preset.budget);
              setFromQuery(preset.origin.name);
              setToQuery(preset.destination.name);
              onSubmit(preset.origin, preset.destination);
            }}
            className="px-2.5 py-1 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border border-zinc-200/70 text-[11px] font-medium shrink-0 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-3.5">
        
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
                  else if (fromQuery.length >= 1) handleSearchFrom(fromQuery);
                }}
                placeholder="Starting location (e.g. AIT Pune, Hinjewadi, Kothrud)..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
              {fromQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setFromQuery('');
                    setFromSuggestions([]);
                  }}
                  className="absolute right-2.5 text-zinc-400 hover:text-zinc-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Predictive Suggestions Dropdown */}
            {isFromOpen && fromSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 max-h-56 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in">
                {fromSuggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onOriginChange(item);
                      setFromQuery(item.name);
                      setIsFromOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-800 hover:bg-emerald-50/60 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium text-zinc-900">{item.name}</span>
                    </div>
                    {renderBadge(item)}
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
                  else if (toQuery.length >= 1) handleSearchTo(toQuery);
                }}
                placeholder="Destination (e.g. Pune Junction, Shivajinagar, Swargate)..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
              {toQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setToQuery('');
                    setToSuggestions([]);
                  }}
                  className="absolute right-2.5 text-zinc-400 hover:text-zinc-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Predictive Suggestions Dropdown */}
            {isToOpen && toSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 max-h-56 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in">
                {toSuggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onDestinationChange(item);
                      setToQuery(item.name);
                      setIsToOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-800 hover:bg-rose-50/60 transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate font-medium text-zinc-900">{item.name}</span>
                    </div>
                    {renderBadge(item)}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Distance Calculator: Corridor Minimum Feasible Path */}
        {feasibleDistanceKm !== null && (
          <div className="p-3 bg-zinc-50 border border-zinc-200/90 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Navigation className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <span>Minimum Feasible Path:</span>
                  <span className="font-mono text-emerald-700 font-extrabold text-sm">
                    ~{feasibleDistanceKm} km
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Estimated shortest corridor road connection: ~{feasibleDurationMin} mins
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Corridor Calculated</span>
            </div>
          </div>
        )}

        {/* Budget & Preference Options */}
        <div className="p-3.5 bg-zinc-50/70 rounded-xl border border-zinc-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
              Travel Budget & Priority
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400">Quick set:</span>
              {[50, 100, 150, 250].map((presetVal) => (
                <button
                  key={presetVal}
                  type="button"
                  onClick={() => onBudgetChange(presetVal)}
                  className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded-md border transition-all ${
                    budget === presetVal
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  ₹{presetVal}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-3">
            {/* Budget Input */}
            <div>
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
                  placeholder="e.g. 150"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-zinc-200 bg-white font-mono text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-2xs"
                />
              </div>
            </div>

            {/* Preference Segmented Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-200/70 rounded-xl">
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
          disabled={isLoading || isResolving}
          className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99]"
        >
          {isLoading || isResolving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              <span>Predicting & Routing Pune Transit...</span>
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
