import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  ArrowUpDown, 
  Wallet, 
  ChevronDown, 
  ArrowRight, 
  X, 
  Loader2, 
  Sparkles,
  Building2,
  Train,
  GraduationCap,
  HeartPulse,
  Utensils,
  AlertCircle
} from 'lucide-react';
import { LocationPoint, PreferenceMode } from '../types';
import { searchPuneLocationsWithStatus, resolveLocationQuery } from '../services/mapbox';

interface FindYourWayPanelProps {
  origin: LocationPoint;
  destination: LocationPoint;
  budget: number;
  preference: PreferenceMode;
  isLoading: boolean;
  onOriginChange: (loc: LocationPoint) => void;
  onDestinationChange: (loc: LocationPoint) => void;
  onBudgetChange: (val: number) => void;
  onPreferenceChange: (pref: PreferenceMode) => void;
  onSubmit: (resolvedOrigin?: LocationPoint, resolvedDestination?: LocationPoint) => Promise<void> | void;
  onSelectLocation?: (loc: LocationPoint, field: 'origin' | 'destination') => void;
}

export const FindYourWayPanel: React.FC<FindYourWayPanelProps> = ({
  origin,
  destination,
  budget,
  isLoading,
  onOriginChange,
  onDestinationChange,
  onBudgetChange,
  onSubmit,
  onSelectLocation,
}) => {
  const [fromQuery, setFromQuery] = useState(origin.name);
  const [toQuery, setToQuery] = useState(destination.name);
  const [fromSuggestions, setFromSuggestions] = useState<LocationPoint[]>([]);
  const [toSuggestions, setToSuggestions] = useState<LocationPoint[]>([]);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  const [fromSearchState, setFromSearchState] = useState<{
    isLoading: boolean;
    status: 'idle' | 'ok' | 'no_results' | 'no_token' | 'api_error' | 'network_error';
    errorMessage?: string;
  }>({ isLoading: false, status: 'idle' });

  const [toSearchState, setToSearchState] = useState<{
    isLoading: boolean;
    status: 'idle' | 'ok' | 'no_results' | 'no_token' | 'api_error' | 'network_error';
    errorMessage?: string;
  }>({ isLoading: false, status: 'idle' });

  const selectedFromPointRef = useRef<LocationPoint | null>(origin);
  const selectedToPointRef = useRef<LocationPoint | null>(destination);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);
  const fromDebounceRef = useRef<any>(null);
  const toDebounceRef = useRef<any>(null);

  // Sync state if props change externally
  useEffect(() => {
    setFromQuery(origin.name);
  }, [origin.name]);

  useEffect(() => {
    setToQuery(destination.name);
  }, [destination.name]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setIsFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setIsToOpen(false);
      }
      if (budgetRef.current && !budgetRef.current.contains(e.target as Node)) {
        setIsBudgetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSearchFrom = (val: string) => {
    setFromQuery(val);
    clearTimeout(fromDebounceRef.current);
    if (val.trim().length >= 1) {
      setFromSearchState({ isLoading: true, status: 'idle' });
      setIsFromOpen(true);
      fromDebounceRef.current = setTimeout(async () => {
        const { results, status, errorMessage } = await searchPuneLocationsWithStatus(val);
        setFromSuggestions(results);
        setFromSearchState({ isLoading: false, status, errorMessage });
      }, 150);
    } else {
      setFromSuggestions([]);
      setFromSearchState({ isLoading: false, status: 'idle' });
      setIsFromOpen(false);
    }
  };

  const handleSearchTo = (val: string) => {
    setToQuery(val);
    clearTimeout(toDebounceRef.current);
    if (val.trim().length >= 1) {
      setToSearchState({ isLoading: true, status: 'idle' });
      setIsToOpen(true);
      toDebounceRef.current = setTimeout(async () => {
        const { results, status, errorMessage } = await searchPuneLocationsWithStatus(val);
        setToSuggestions(results);
        setToSearchState({ isLoading: false, status, errorMessage });
      }, 150);
    } else {
      setToSuggestions([]);
      setToSearchState({ isLoading: false, status: 'idle' });
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
    onSubmit(tempDest, tempOrigin);
  };

  const handleGetRoutes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsFromOpen(false);
    setIsToOpen(false);

    let resolvedFrom = origin;
    if (fromQuery.trim() && fromQuery.toLowerCase().trim() !== origin.name.toLowerCase().trim()) {
      resolvedFrom = await resolveLocationQuery(fromQuery, origin);
    }

    let resolvedTo = destination;
    if (toQuery.trim() && toQuery.toLowerCase().trim() !== destination.name.toLowerCase().trim()) {
      resolvedTo = await resolveLocationQuery(toQuery, destination);
    }

    onOriginChange(resolvedFrom);
    onDestinationChange(resolvedTo);
    await onSubmit(resolvedFrom, resolvedTo);
  };

  // Popular search items as shown in the design image
  const POPULAR_SEARCH_ITEMS = [
    {
      label: 'Military Hospital Khadki Pune',
      icon: HeartPulse,
      location: {
        name: 'Military Hospital Khadki',
        lat: 18.5524,
        lng: 73.8381,
        address: 'Range Hill Road, Khadki Cantonment, Pune 411020',
        landmarkType: 'hospital' as const,
      },
    },
    {
      label: 'Pune Railway Station',
      icon: Train,
      location: {
        name: 'Pune Junction Railway Station',
        lat: 18.5284,
        lng: 73.8744,
        address: 'Agarkar Nagar, Pune 411001',
        landmarkType: 'station' as const,
      },
    },
    {
      label: 'Pune Metro',
      icon: Train,
      location: {
        name: 'Pune Metro (Civil Court Interchange)',
        lat: 18.5283,
        lng: 73.8547,
        address: 'Shivajinagar / Civil Court, Pune',
        landmarkType: 'metro' as const,
      },
    },
    {
      label: 'Aundh',
      icon: MapPin,
      location: {
        name: 'Aundh, Pune',
        lat: 18.5580,
        lng: 73.8075,
        address: 'Aundh, Pune, Maharashtra 411007',
        landmarkType: 'locality' as const,
      },
    },
    {
      label: 'College near me',
      icon: GraduationCap,
      location: {
        name: 'COEP Technological University',
        lat: 18.5293,
        lng: 73.8566,
        address: 'Wellesley Rd, Shivajinagar, Pune 411005',
        landmarkType: 'college' as const,
      },
    },
    {
      label: 'Hospitals near me',
      icon: HeartPulse,
      location: {
        name: 'Ruby Hall Clinic (Hospital)',
        lat: 18.5327,
        lng: 73.8778,
        address: '40, Sassoon Rd, Sangamvadi, Pune 411001',
        landmarkType: 'hospital' as const,
      },
    },
    {
      label: 'Restaurants near me',
      icon: Utensils,
      location: {
        name: 'FC Road Food & Dining Hub',
        lat: 18.5204,
        lng: 73.8415,
        address: 'Fergusson College Rd, Shivajinagar, Pune 411004',
        landmarkType: 'restaurant' as const,
      },
    },
  ];

  const budgetOptions = [
    { label: 'Any Budget', value: 0 },
    { label: 'Under ₹50', value: 50 },
    { label: 'Under ₹100', value: 100 },
    { label: 'Under ₹150', value: 150 },
    { label: 'Under ₹250', value: 250 },
  ];

  const currentBudgetLabel = budget === 0 
    ? 'Any Budget' 
    : budgetOptions.find((b) => b.value === budget)?.label || `₹${budget}`;

  return (
    <div className="w-full lg:w-[350px] shrink-0 bg-white border-r border-zinc-200/80 flex flex-col h-full overflow-y-auto p-5 pb-32 sm:pb-8 space-y-6">
      
      {/* 1. Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          Find your way
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Search for places, set your budget and get the best route options.
        </p>
      </div>

      {/* 2. Route Inputs & Action Card */}
      <form onSubmit={handleGetRoutes} className="space-y-3.5">
        
        {/* Origin & Destination Container with Swap button */}
        <div className="relative bg-zinc-50/60 rounded-2xl border border-zinc-200 p-1.5 space-y-1.5">
          
          {/* Origin Input */}
          <div ref={fromRef} className="relative">
            <div className="relative flex items-center bg-white rounded-xl border border-zinc-200/80 px-3 py-2.5 focus-within:border-[#0d5c46] focus-within:ring-1 focus-within:ring-[#0d5c46] transition-all">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100 shrink-0 mr-2.5" />
              <input
                type="text"
                value={fromQuery}
                onChange={(e) => handleSearchFrom(e.target.value)}
                onFocus={() => {
                  if (fromSuggestions.length > 0) setIsFromOpen(true);
                  else if (fromQuery.length >= 1) handleSearchFrom(fromQuery);
                }}
                placeholder="Starting location..."
                className="w-full text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none pr-6"
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

            {/* Suggestions Dropdown */}
            {isFromOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 max-h-60 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in">
                {fromSearchState.isLoading && (
                  <div className="p-3 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    <span>Searching places...</span>
                  </div>
                )}
                {!fromSearchState.isLoading && fromSuggestions.length > 0 && (
                  fromSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        selectedFromPointRef.current = item;
                        onOriginChange(item);
                        setFromQuery(item.name);
                        setIsFromOpen(false);
                        onSelectLocation?.(item, 'origin');
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-emerald-50/70 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-zinc-900">{item.name}</div>
                        {item.address && (
                          <div className="truncate text-[10px] text-zinc-500">{item.address}</div>
                        )}
                      </div>
                    </button>
                  ))
                )}
                {!fromSearchState.isLoading && fromSuggestions.length === 0 && fromSearchState.status === 'no_results' && (
                  <div className="p-3 text-center text-xs text-zinc-500">
                    No places found for &quot;{fromQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Swap Button on Right */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Start and Destination"
              className="w-7 h-7 rounded-full bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination Input */}
          <div ref={toRef} className="relative">
            <div className="relative flex items-center bg-white rounded-xl border border-zinc-200/80 px-3 py-2.5 focus-within:border-[#0d5c46] focus-within:ring-1 focus-within:ring-[#0d5c46] transition-all">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mr-2.5" />
              <input
                type="text"
                value={toQuery}
                onChange={(e) => handleSearchTo(e.target.value)}
                onFocus={() => {
                  if (toSuggestions.length > 0) setIsToOpen(true);
                  else if (toQuery.length >= 1) handleSearchTo(toQuery);
                }}
                placeholder="Destination location..."
                className="w-full text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none pr-6"
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

            {/* Suggestions Dropdown */}
            {isToOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 max-h-60 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in">
                {toSearchState.isLoading && (
                  <div className="p-3 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    <span>Searching places...</span>
                  </div>
                )}
                {!toSearchState.isLoading && toSuggestions.length > 0 && (
                  toSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        selectedToPointRef.current = item;
                        onDestinationChange(item);
                        setToQuery(item.name);
                        setIsToOpen(false);
                        onSelectLocation?.(item, 'destination');
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-rose-50/70 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-zinc-900">{item.name}</div>
                        {item.address && (
                          <div className="truncate text-[10px] text-zinc-500">{item.address}</div>
                        )}
                      </div>
                    </button>
                  ))
                )}
                {!toSearchState.isLoading && toSuggestions.length === 0 && toSearchState.status === 'no_results' && (
                  <div className="p-3 text-center text-xs text-zinc-500">
                    No places found for &quot;{toQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Budget Preference Dropdown */}
        <div ref={budgetRef} className="relative">
          <button
            type="button"
            onClick={() => setIsBudgetOpen(!isBudgetOpen)}
            className="w-full bg-white rounded-xl border border-zinc-200/90 px-3.5 py-2.5 flex items-center justify-between text-left hover:border-zinc-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Wallet className="w-4 h-4 text-zinc-400 shrink-0" />
              <div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none">
                  Budget Preference
                </div>
                <div className="text-xs font-semibold text-zinc-900 mt-1">
                  {currentBudgetLabel}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
          </button>

          {isBudgetOpen && (
            <div className="absolute z-40 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-zinc-200 py-1 divide-y divide-zinc-100">
              {budgetOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onBudgetChange(opt.value);
                    setIsBudgetOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 text-xs font-semibold text-left transition-colors flex items-center justify-between cursor-pointer ${
                    budget === opt.value
                      ? 'bg-emerald-50 text-[#0d5c46]'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {budget === opt.value && <span className="text-[#0d5c46]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Action Button: "Get Routes →" */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-[#0d5c46] hover:bg-[#094232] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white/80" />
              <span>Finding Routes...</span>
            </>
          ) : (
            <>
              <span>Get Routes</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>

      </form>

      {/* 3. Section: Popular Searches */}
      <div className="space-y-2.5 pt-1">
        <h3 className="text-xs font-bold text-zinc-900 tracking-tight">
          Popular Searches
        </h3>
        <div className="space-y-1.5">
          {POPULAR_SEARCH_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onDestinationChange(item.location);
                  setToQuery(item.location.name);
                  onSelectLocation?.(item.location, 'destination');
                  onSubmit(origin, item.location);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-zinc-200/70 bg-white hover:bg-zinc-50/80 hover:border-zinc-300 text-xs font-semibold text-zinc-800 transition-all flex items-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tip Card */}
      <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-3.5 space-y-1 mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tip</span>
        </div>
        <p className="text-[11px] text-emerald-900/80 leading-relaxed">
          You can search for places like hospitals, metro stations, railway stations, colleges, restaurants, and more.
        </p>
      </div>

    </div>
  );
};
