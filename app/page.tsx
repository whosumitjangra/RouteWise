'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import SearchForm from '@/components/SearchForm';
import RouteCard from '@/components/RouteCard';
import RouteComparison from '@/components/RouteComparison';
import TradeoffChart from '@/components/TradeoffChart';
import CostCustomizerModal from '@/components/CostCustomizerModal';
import SupabaseModal from '@/components/SupabaseModal';
import SavedRoutesDrawer from '@/components/SavedRoutesDrawer';

import { 
  LocationPoint, 
  PriorityMode, 
  RouteOption, 
  RouteSearchResponse, 
  EngineParameters, 
  SavedRouteRecord 
} from '@/lib/types';
import { POPULAR_PRESETS } from '@/lib/routing/cities';
import { DEFAULT_ENGINE_PARAMS } from '@/lib/routing/cost-engine';
import { 
  getSupabaseCredentials, 
  fetchAllSavedRoutes, 
  saveRouteToDatabase, 
  deleteSavedRoute 
} from '@/lib/supabase';
import { 
  Zap, 
  PiggyBank, 
  Scale, 
  Clock, 
  Share2, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Layers, 
  BarChart3,
  Check
} from 'lucide-react';

// Dynamically import MapView to prevent SSR window reference in Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Loading Interactive Vector Map...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const defaultPreset = POPULAR_PRESETS[0];

  const [origin, setOrigin] = useState<LocationPoint>(defaultPreset.origin);
  const [destination, setDestination] = useState<LocationPoint>(defaultPreset.destination);
  const [maxBudget, setMaxBudget] = useState<number>(defaultPreset.recommendedBudget);
  const [priority, setPriority] = useState<PriorityMode>('balanced');
  const [currency, setCurrency] = useState<string>('USD');
  const [customParams, setCustomParams] = useState<EngineParameters>(DEFAULT_ENGINE_PARAMS);
  const [showOverBudget, setShowOverBudget] = useState<boolean>(true);

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [comparedRouteIds, setComparedRouteIds] = useState<string[]>([]);
  const [routeResult, setRouteResult] = useState<RouteSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Modals state
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState<SavedRouteRecord[]>([]);

  // Active View Tab on mobile/desktop (Map vs Tradeoff Chart)
  const [activeVisualTab, setActiveVisualTab] = useState<'map' | 'chart'>('map');

  // Check Supabase connection and load saved routes on mount
  useEffect(() => {
    const creds = getSupabaseCredentials();
    setIsSupabaseConnected(!!(creds.url && creds.anonKey));

    fetchAllSavedRoutes().then(({ records }) => {
      setSavedRoutes(records);
    });
  }, []);

  // Execute Route Search
  const runRouteSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/route/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          maxBudget,
          priority,
          currency,
          customParams,
        }),
      });

      if (res.ok) {
        const data: RouteSearchResponse = await res.json();
        setRouteResult(data);
        if (data.routes.length > 0) {
          // Default selection to first/optimal route
          setSelectedRouteId(data.routes[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to calculate routes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination, maxBudget, priority, currency, customParams]);

  // Run calculation on initial load
  useEffect(() => {
    runRouteSearch();
  }, []);

  // Toggle head-to-head comparison
  const handleToggleComparison = (id: string) => {
    setComparedRouteIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rId) => rId !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  // Save Route Action
  const handleSaveRoute = async (route: RouteOption) => {
    if (!routeResult) return;
    const res = await saveRouteToDatabase({
      origin: origin.name,
      destination: destination.name,
      maxBudget,
      priorityMode: priority,
      selectedMode: route.mode,
      routePayload: routeResult,
    });

    if (res.success) {
      setSavedRoutes((prev) => [res.record, ...prev.filter((r) => r.id !== res.record.id)]);
    }
  };

  const handleDeleteSavedRoute = async (id: string) => {
    await deleteSavedRoute(id);
    setSavedRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleLoadSavedRoute = (payload: RouteSearchResponse) => {
    setOrigin(payload.origin);
    setDestination(payload.destination);
    setMaxBudget(payload.maxBudget);
    setPriority(payload.priority);
    setCurrency(payload.currency);
    setRouteResult(payload);
    if (payload.routes.length > 0) {
      setSelectedRouteId(payload.routes[0].id);
    }
  };

  // Share link with encoded params
  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('origLat', origin.lat.toString());
    url.searchParams.set('origLng', origin.lng.toString());
    url.searchParams.set('origName', origin.name);
    url.searchParams.set('destLat', destination.lat.toString());
    url.searchParams.set('destLng', destination.lng.toString());
    url.searchParams.set('destName', destination.name);
    url.searchParams.set('budget', maxBudget.toString());
    url.searchParams.set('priority', priority);

    navigator.clipboard.writeText(url.toString());
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Filter routes based on over-budget toggle
  const visibleRoutes = routeResult
    ? showOverBudget
      ? routeResult.routes
      : routeResult.routes.filter((r) => !r.isOverBudget)
    : [];

  const comparedRoutes = routeResult
    ? routeResult.routes.filter((r) => comparedRouteIds.includes(r.id))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Top Navigation */}
      <Navbar
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        savedCount={savedRoutes.length}
        onOpenSavedModal={() => setIsSavedDrawerOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
      />

      {/* Hero Header & Value Proposition */}
      <section className="bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50 dark:from-emerald-950/20 dark:via-slate-950 dark:to-slate-950 pt-6 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 mb-2 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deterministic Multi-Modal Routing Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Compare Travel Modes & Fares Side-by-Side
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Driving, Flights, Trains, Buses, Rideshare, and Active Transit calculated deterministically with real GTFS timetable and spatial road routing. Zero LLM hallucinations.
              </p>
            </div>

            {/* Execution & Algorithm Stat Pills */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
              {routeResult && (
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Execution: {routeResult.executionTimeMs} ms</span>
                </div>
              )}
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium shadow-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>OSRM + GTFS Spatial Feeds</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Search & Query Config Form */}
        <SearchForm
          origin={origin}
          destination={destination}
          maxBudget={maxBudget}
          priority={priority}
          currency={currency}
          showOverBudget={showOverBudget}
          isLoading={isLoading}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onBudgetChange={setMaxBudget}
          onPriorityChange={setPriority}
          onToggleOverBudget={setShowOverBudget}
          onSubmit={runRouteSearch}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* Results Workspace: 2-Column Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Visual Map / Tradeoff Chart (Sticky on large screens) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            
            {/* Visual View Mode Tabs */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveVisualTab('map')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeVisualTab === 'map'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Interactive Map</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveVisualTab('chart')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeVisualTab === 'chart'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Tradeoff Plot</span>
                </button>
              </div>

              {/* Share Journey button */}
              <button
                type="button"
                onClick={handleShare}
                className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                title="Copy shareable trip URL"
              >
                {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{shareCopied ? 'Link Copied' : 'Share'}</span>
              </button>
            </div>

            {/* Render Map or Tradeoff Chart */}
            <div className="h-[440px] sm:h-[480px]">
              {activeVisualTab === 'map' ? (
                <MapView
                  origin={origin}
                  destination={destination}
                  routes={visibleRoutes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
                />
              ) : (
                <TradeoffChart
                  routes={visibleRoutes}
                  currency={currency}
                  maxBudget={maxBudget}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
                />
              )}
            </div>

            {/* Route Stats Summary Box */}
            {routeResult && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Direct Geodesic Distance</span>
                  <span>{routeResult.directDistanceKm} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Evaluated Modes</span>
                  <span>{routeResult.routes.length} options computed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Optimization</span>
                  <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">{priority} priority</span>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Comparison Cards List */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Header with counter */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Available Modes Ranked
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {visibleRoutes.length}
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Sorted by {priority === 'fastest' ? 'lowest duration' : priority === 'cheapest' ? 'lowest cost' : 'optimal value'}
              </div>
            </div>

            {/* List of Mode Cards */}
            {visibleRoutes.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <PiggyBank className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  No modes match within your budget ({currency} {maxBudget})
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Try checking "Show over-budget options" above to compare available transport methods and explore pricing tradeoffs.
                </p>
                <button
                  type="button"
                  onClick={() => setShowOverBudget(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  Show all transport modes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    currency={currency}
                    maxBudget={maxBudget}
                    isSelectedOnMap={selectedRouteId === route.id}
                    isInComparison={comparedRouteIds.includes(route.id)}
                    onSelectOnMap={(id) => {
                      setSelectedRouteId(id);
                      setActiveVisualTab('map');
                    }}
                    onToggleComparison={handleToggleComparison}
                    onSaveRoute={handleSaveRoute}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Floating Head-to-Head Comparison Drawer */}
      <RouteComparison
        selectedRoutes={comparedRoutes}
        currency={currency}
        onRemoveRoute={(id) => setComparedRouteIds((prev) => prev.filter((rId) => rId !== id))}
        onClearAll={() => setComparedRouteIds([])}
      />

      {/* Modals */}
      <CostCustomizerModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentParams={customParams}
        onSaveParams={(params) => {
          setCustomParams(params);
          runRouteSearch();
        }}
        currency={currency}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionStatusChange={setIsSupabaseConnected}
      />

      <SavedRoutesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedRoutes={savedRoutes}
        onLoadRoute={handleLoadSavedRoute}
        onDeleteRoute={handleDeleteSavedRoute}
        currency={currency}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">RouteWise</span>
            <span>•</span>
            <span>Sub-50ms Multi-Modal Spatial Engine</span>
          </div>
          <div>
            Powered by Next.js, Supabase, Tailwind CSS, OpenStreetMap, OSRM & GTFS Feeds
          </div>
        </div>
      </footer>

    </div>
  );
}
