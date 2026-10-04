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
  CheckCircle2,
  Plane,
  Bus,
  HeartPulse,
  Utensils,
  Landmark,
  AlertCircle 
} from 'lucide-react';
import { LocationPoint, PreferenceMode } from '../types';
import { 
  searchPuneLocationsWithStatus, 
  resolveLocationQuery, 
  getRoadRoute, 
  haversineDistanceKm,
  hasValidMapboxToken 
} from '../services/mapbox';
import { PUNE_PRESET_TRIPS } from '../config/puneLandmarks';
import { isLocationOutOfTown } from '../config/outOfTownCities';

const POPULAR_SEARCH_PRESETS: LocationPoint[] = [
  {
    name: 'Military Hospital, Khadki, Pune',
    lat: 18.5524,
    lng: 73.8381,
    landmarkType: 'hospital',
    categoryLabel: 'Military Hospital',
    address: 'Range Hill Road, Khadki Cantonment, Pune',
  },
  {
    name: 'Army Institute of Technology (AIT), Dighi',
    lat: 18.6069,
    lng: 73.8745,
    landmarkType: 'college',
    categoryLabel: 'Engineering College',
    address: 'Alandi Road, Dighi, Pune',
  },
  {
    name: 'FC Road (Fergusson College Rd), Shivajinagar',
    lat: 18.5204,
    lng: 73.8415,
    landmarkType: 'locality',
    categoryLabel: 'Commercial Corridor',
    address: 'Shivajinagar, Pune',
  },
  {
    name: 'Pune Junction Railway Station',
    lat: 18.5284,
    lng: 73.8744,
    landmarkType: 'transit_hub',
    categoryLabel: 'Central Railway Station',
    address: 'Agarkar Nagar, Pune',
  },
  {
    name: 'Pune International Airport (PNQ)',
    lat: 18.5822,
    lng: 73.9197,
    landmarkType: 'airport',
    categoryLabel: 'Airport Terminal',
    address: 'New Airport Rd, Lohegaon, Pune',
  },
  {
    name: 'Swargate Bus Station & Metro Hub',
    lat: 18.5018,
    lng: 73.8586,
    landmarkType: 'bus_stand',
    categoryLabel: 'Intercity Bus Terminal',
    address: 'Swargate, Pune',
  },
];

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
  onSubmit: (resolvedOrigin?: LocationPoint, resolvedDestination?: LocationPoint) => Promise<void> | void;
  onSelectLocation?: (loc: LocationPoint, field: 'origin' | 'destination') => void;
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
  onSelectLocation,
}) => {
  const [fromQuery, setFromQuery] = useState(origin.name);
  const [toQuery, setToQuery] = useState(destination.name);
  const [fromSuggestions, setFromSuggestions] = useState<LocationPoint[]>([]);
  const [toSuggestions, setToSuggestions] = useState<LocationPoint[]>([]);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Search status states for proper UI feedback (loading, empty, no_token, error)
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

  // Direct reference cache for chosen points to avoid redundant network resolving
  const selectedFromPointRef = useRef<LocationPoint | null>(origin);
  const selectedToPointRef = useRef<LocationPoint | null>(destination);

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

  // Fast debounced predictive search with comprehensive status feedback
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
      setIsFromOpen(true);
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
      setIsToOpen(true);
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
      // 1. Resolve "From" query
      let resolvedFrom = origin;
      if (
        selectedFromPointRef.current &&
        selectedFromPointRef.current.name.toLowerCase().trim() === fromQuery.toLowerCase().trim()
      ) {
        resolvedFrom = selectedFromPointRef.current;
      } else if (fromQuery.trim() && fromQuery.trim().toLowerCase() !== origin.name.toLowerCase()) {
        resolvedFrom = await resolveLocationQuery(fromQuery, origin);
      }

      // 2. Resolve "To" query
      let resolvedTo = destination;
      if (
        selectedToPointRef.current &&
        selectedToPointRef.current.name.toLowerCase().trim() === toQuery.toLowerCase().trim()
      ) {
        resolvedTo = selectedToPointRef.current;
      } else if (toQuery.trim() && toQuery.trim().toLowerCase() !== destination.name.toLowerCase()) {
        resolvedTo = await resolveLocationQuery(toQuery, destination);
      }

      selectedFromPointRef.current = resolvedFrom;
      selectedToPointRef.current = resolvedTo;
      onOriginChange(resolvedFrom);
      onDestinationChange(resolvedTo);
      setFromQuery(resolvedFrom.name);
      setToQuery(resolvedTo.name);

      // Execute calculation with resolved coordinates
      await onSubmit(resolvedFrom, resolvedTo);
    } catch (err) {
      console.error('Submit transit calculation error:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const renderBadge = (item: LocationPoint) => {
    if (item.landmarkType === 'out_of_town' || item.isOutOfTown) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
          <span>🚀</span> Reaching Soon
        </span>
      );
    }
    const nameLower = item.name.toLowerCase();
    const catLower = (item.categoryLabel || '').toLowerCase();

    if (
      item.landmarkType === 'hospital' ||
      catLower.includes('hospital') ||
      catLower.includes('health') ||
      nameLower.includes('hospital') ||
      nameLower.includes('clinic') ||
      nameLower.includes('dispensary')
    ) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <HeartPulse className="w-2.5 h-2.5" /> Hospital
        </span>
      );
    }
    if (item.landmarkType === 'airport' || nameLower.includes('airport')) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Plane className="w-2.5 h-2.5" /> Airport
        </span>
      );
    }
    if (item.landmarkType === 'metro' || nameLower.includes('metro')) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Train className="w-2.5 h-2.5" /> Metro
        </span>
      );
    }
    if (
      item.landmarkType === 'college' ||
      item.landmarkType === 'school' ||
      catLower.includes('college') ||
      catLower.includes('school') ||
      catLower.includes('education') ||
      nameLower.includes('ait') ||
      nameLower.includes('college') ||
      nameLower.includes('university') ||
      nameLower.includes('institute') ||
      nameLower.includes('school') ||
      nameLower.includes('vidyalaya')
    ) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <GraduationCap className="w-2.5 h-2.5" /> Institute
        </span>
      );
    }
    if (
      item.landmarkType === 'bus_stand' ||
      catLower.includes('bus') ||
      nameLower.includes('bus stand') ||
      nameLower.includes('bus stop') ||
      nameLower.includes('swargate')
    ) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Bus className="w-2.5 h-2.5" /> Bus Stand
        </span>
      );
    }
    if (
      item.landmarkType === 'transit_hub' ||
      catLower.includes('station') ||
      nameLower.includes('station') ||
      nameLower.includes('junction') ||
      nameLower.includes('terminal') ||
      nameLower.includes('terminus') ||
      nameLower.includes('cst')
    ) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Train className="w-2.5 h-2.5" /> Transit Hub
        </span>
      );
    }
    if (
      item.landmarkType === 'restaurant' ||
      catLower.includes('restaurant') ||
      catLower.includes('food') ||
      catLower.includes('cafe') ||
      nameLower.includes('hotel') ||
      nameLower.includes('restaurant') ||
      nameLower.includes('cafe') ||
      nameLower.includes('pizza')
    ) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
          <Utensils className="w-2.5 h-2.5" /> Dining
        </span>
      );
    }
    if (
      item.landmarkType === 'government' ||
      catLower.includes('government') ||
      nameLower.includes('court') ||
      nameLower.includes('cantonment') ||
      nameLower.includes('collector')
    ) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Landmark className="w-2.5 h-2.5" /> Govt / Office
        </span>
      );
    }
    if (item.landmarkType === 'locality') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
          <Building2 className="w-2.5 h-2.5" /> Locality
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-600">
        <Building2 className="w-2.5 h-2.5" /> Map POI
      </span>
    );
  };

  const originOutOfTown = isLocationOutOfTown(origin);
  const destOutOfTown = isLocationOutOfTown(destination);
  const isOutOfTownActive = originOutOfTown.isOutOfTown || destOutOfTown.isOutOfTown;
  const activeOutOfTownCity = destOutOfTown.isOutOfTown ? destOutOfTown.cityName : originOutOfTown.cityName;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      
      {/* Quick Demo chips with AIT Pune -> FC Road highlighted */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
          Demo:
        </span>
        {PUNE_PRESET_TRIPS.map((preset, index) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              selectedFromPointRef.current = preset.origin;
              selectedToPointRef.current = preset.destination;
              onOriginChange(preset.origin);
              onDestinationChange(preset.destination);
              onBudgetChange(preset.budget);
              setFromQuery(preset.origin.name);
              setToQuery(preset.destination.name);
              onSubmit(preset.origin, preset.destination);
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold shrink-0 transition-all flex items-center gap-1 ${
              index === 0
                ? 'bg-zinc-950 text-white shadow-2xs hover:bg-zinc-800'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border border-zinc-200/70'
            }`}
          >
            {index === 0 && <span>⭐</span>}
            <span>{preset.label}</span>
          </button>
        ))}
        {/* Out of Town Preset Demo: Lonavala */}
        <button
          type="button"
          onClick={() => {
            const lonavalaLoc: LocationPoint = {
              name: 'Lonavala, Maharashtra',
              lat: 18.7557,
              lng: 73.4091,
              landmarkType: 'out_of_town',
              isOutOfTown: true,
              cityName: 'Lonavala',
            };
            selectedToPointRef.current = lonavalaLoc;
            onDestinationChange(lonavalaLoc);
            setToQuery('Lonavala, Maharashtra');
            onSubmit(origin, lonavalaLoc);
          }}
          className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1"
        >
          <span>🚀</span>
          <span>Lonavala (Reaching Soon)</span>
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-3.5">
        
        {/* Step 1: Starting Location (From) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
            <span>From</span>
          </label>
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
                placeholder="Starting location (e.g. AIT Pune, Dighi)..."
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
            {isFromOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in">
                {/* 1. Loading State */}
                {fromSearchState.isLoading && (
                  <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    <span>Searching map locations & POIs across Pune...</span>
                  </div>
                )}

                {/* 2. Missing Token Warning */}
                {!fromSearchState.isLoading && fromSearchState.status === 'no_token' && (
                  <div className="p-3 bg-amber-50 text-xs text-amber-900 border-b border-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[11px]">Mapbox Token Not Configured</div>
                      <div className="text-[10px] text-amber-800 mt-0.5">
                        Set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_MAPBOX_TOKEN</code> in your environment. Using OpenStreetMap & local POI fallback.
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Network Failure */}
                {!fromSearchState.isLoading && fromSearchState.status === 'network_error' && (
                  <div className="p-3 text-center text-xs text-rose-600 flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Network connection failed. Check your connection.</span>
                  </div>
                )}

                {/* 4. API Error */}
                {!fromSearchState.isLoading && fromSearchState.status === 'api_error' && (
                  <div className="p-3 text-center text-xs text-rose-600 flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fromSearchState.errorMessage || 'Search service temporarily unavailable.'}</span>
                  </div>
                )}

                {/* 5. Results List */}
                {!fromSearchState.isLoading && fromSuggestions.length > 0 && (
                  <div className="divide-y divide-zinc-100">
                    {fromSuggestions.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          selectedFromPointRef.current = item;
                          onOriginChange(item);
                          setFromQuery(item.name);
                          setIsFromOpen(false);
                          onSelectLocation?.(item, 'origin');
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-800 hover:bg-emerald-50/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-zinc-900">{item.name}</div>
                            {item.address && (
                              <div className="truncate text-[10px] text-zinc-500 mt-0.5">{item.address}</div>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">{renderBadge(item)}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 6. No Results Found */}
                {!fromSearchState.isLoading && fromSuggestions.length === 0 && fromSearchState.status === 'no_results' && (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    <p className="font-bold text-zinc-700">No places found for &quot;{fromQuery}&quot;</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Try searching for landmarks, hospitals, colleges, stations or roads (e.g. &quot;Military Hospital Khadki&quot;, &quot;FC Road&quot;).
                    </p>
                  </div>
                )}

                {/* 7. Empty Query - Popular Shortcuts */}
                {!fromSearchState.isLoading && fromSuggestions.length === 0 && (!fromQuery || fromQuery.trim().length === 0) && (
                  <div className="p-2.5 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1.5">
                      Popular Pune Locations
                    </div>
                    <div className="space-y-0.5">
                      {POPULAR_SEARCH_PRESETS.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            selectedFromPointRef.current = item;
                            onOriginChange(item);
                            setFromQuery(item.name);
                            setIsFromOpen(false);
                            onSelectLocation?.(item, 'origin');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-zinc-900 text-xs">{item.name}</div>
                              {item.address && (
                                <div className="truncate text-[10px] text-zinc-500 mt-0.5">{item.address}</div>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">{renderBadge(item)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Destination Location (To) with Swap button */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>To</span>
            </label>
            <button
              type="button"
              onClick={handleSwap}
              className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium transition-colors p-0.5"
              title="Swap origin & destination"
            >
              <ArrowDownUp className="w-3 h-3" />
              <span>Swap</span>
            </button>
          </div>

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
                  else setIsToOpen(true);
                }}
                placeholder="Destination (e.g. FC Road, Pune Junction)..."
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
            {isToOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in">
                {/* 1. Loading State */}
                {toSearchState.isLoading && (
                  <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    <span>Searching map locations & POIs across Pune...</span>
                  </div>
                )}

                {/* 2. Missing Token Warning */}
                {!toSearchState.isLoading && toSearchState.status === 'no_token' && (
                  <div className="p-3 bg-amber-50 text-xs text-amber-900 border-b border-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[11px]">Mapbox Token Not Configured</div>
                      <div className="text-[10px] text-amber-800 mt-0.5">
                        Set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_MAPBOX_TOKEN</code> in your environment. Using OpenStreetMap & local POI fallback.
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Network Failure */}
                {!toSearchState.isLoading && toSearchState.status === 'network_error' && (
                  <div className="p-3 text-center text-xs text-rose-600 flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Network connection failed. Check your connection.</span>
                  </div>
                )}

                {/* 4. API Error */}
                {!toSearchState.isLoading && toSearchState.status === 'api_error' && (
                  <div className="p-3 text-center text-xs text-rose-600 flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{toSearchState.errorMessage || 'Search service temporarily unavailable.'}</span>
                  </div>
                )}

                {/* 5. Results List */}
                {!toSearchState.isLoading && toSuggestions.length > 0 && (
                  <div className="divide-y divide-zinc-100">
                    {toSuggestions.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          selectedToPointRef.current = item;
                          onDestinationChange(item);
                          setToQuery(item.name);
                          setIsToOpen(false);
                          onSelectLocation?.(item, 'destination');
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-800 hover:bg-rose-50/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-zinc-900">{item.name}</div>
                            {item.address && (
                              <div className="truncate text-[10px] text-zinc-500 mt-0.5">{item.address}</div>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">{renderBadge(item)}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 6. No Results Found */}
                {!toSearchState.isLoading && toSuggestions.length === 0 && toSearchState.status === 'no_results' && (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    <p className="font-bold text-zinc-700">No places found for &quot;{toQuery}&quot;</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Try searching for landmarks, hospitals, colleges, stations or roads (e.g. &quot;Military Hospital Khadki&quot;, &quot;FC Road&quot;).
                    </p>
                  </div>
                )}

                {/* 7. Empty Query - Popular Shortcuts */}
                {!toSearchState.isLoading && toSuggestions.length === 0 && (!toQuery || toQuery.trim().length === 0) && (
                  <div className="p-2.5 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1.5">
                      Popular Pune Locations
                    </div>
                    <div className="space-y-0.5">
                      {POPULAR_SEARCH_PRESETS.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            selectedToPointRef.current = item;
                            onDestinationChange(item);
                            setToQuery(item.name);
                            setIsToOpen(false);
                            onSelectLocation?.(item, 'destination');
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-zinc-900 text-xs">{item.name}</div>
                              {item.address && (
                                <div className="truncate text-[10px] text-zinc-500 mt-0.5">{item.address}</div>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">{renderBadge(item)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Out of Town City Alert Banner (if applicable) */}
        {isOutOfTownActive && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <span>🚀</span>
                <span>Reaching Soon to {activeOutOfTownCity}!</span>
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                Out of Town
              </span>
            </div>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              BudWay multimodal transit is currently operational across Pune. We are reaching {activeOutOfTownCity} soon!
            </p>
          </div>
        )}

        {/* Step 3: Budget & Step 4: Preference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* Step 3: Budget */}
          <div className="p-3 bg-zinc-50/70 rounded-xl border border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                <span>Max Budget (₹)</span>
              </label>
              <div className="flex items-center gap-1">
                {[50, 100, 150, 250].map((presetVal) => (
                  <button
                    key={presetVal}
                    type="button"
                    onClick={() => onBudgetChange(presetVal)}
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded transition-colors ${
                      budget === presetVal
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                    }`}
                  >
                    ₹{presetVal}
                  </button>
                ))}
              </div>
            </div>

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
                placeholder="100"
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-zinc-200 bg-white font-mono text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900 shadow-2xs"
              />
            </div>
          </div>

          {/* Step 4: Priority / Preference */}
          <div className="p-3 bg-zinc-50/70 rounded-xl border border-zinc-200/80 space-y-2 flex flex-col justify-between">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-zinc-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
              <span>Priority</span>
            </label>

            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-200/60 rounded-lg">
              <button
                type="button"
                onClick={() => onPreferenceChange('cheapest')}
                className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-all ${
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
                className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-all ${
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
                className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition-all ${
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

        {/* Step 5: Primary Find Routes Action Button */}
        <button
          type="submit"
          disabled={isLoading || isResolving}
          className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99] shadow-xs cursor-pointer"
        >
          {isLoading || isResolving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              <span>Finding Routes...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-emerald-400" />
              <span>Find Routes</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};
