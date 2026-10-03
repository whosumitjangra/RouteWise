import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchCard } from './components/SearchCard';
import { RecommendationBanner } from './components/RecommendationBanner';
import { RouteCard } from './components/RouteCard';
import { MapView } from './components/MapView';
import { FareModal } from './components/FareModal';
import { LocationPoint, PreferenceMode, RouteOption } from './types';
import { PUNE_PRESET_TRIPS } from './config/puneLandmarks';
import { getRoadRoute } from './services/mapbox';
import { buildPuneMetroOptionAsync } from './services/metroEngine';
import { calculateRoadFare } from './services/fareEngine';
import { evaluateAndRankRoutes } from './services/recommender';
import { FARE_CONFIG } from './config/fares';
import { ListFilter, Map as MapIcon, ArrowLeftRight } from 'lucide-react';

export default function App() {
  // Default to AIT Pune -> Pune Junction as requested
  const defaultPreset = PUNE_PRESET_TRIPS[0];

  const [origin, setOrigin] = useState<LocationPoint>(defaultPreset.origin);
  const [destination, setDestination] = useState<LocationPoint>(defaultPreset.destination);
  const [budget, setBudget] = useState<number>(defaultPreset.budget);
  const [preference, setPreference] = useState<PreferenceMode>('balanced');

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [recommendedRoute, setRecommendedRoute] = useState<RouteOption | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Smooth layout shift state: map on left, details on right when route is selected
  const [isLayoutShifted, setIsLayoutShifted] = useState<boolean>(false);

  // Modals
  const [fareModalRoute, setFareModalRoute] = useState<RouteOption | null>(null);

  // Mobile layout tab
  const [mobileTab, setMobileTab] = useState<'routes' | 'map'>('routes');

  const calculateTransitOptions = useCallback(
    async (customOrigin?: LocationPoint, customDest?: LocationPoint) => {
      const activeOrigin = customOrigin || origin;
      const activeDest = customDest || destination;

      setIsLoading(true);
      try {
        // 1. Parallel execution: Fetch road routing for Driving, Walking, and Metro with feeder streets
        const [roadDriving, roadWalking, metroOption] = await Promise.all([
          getRoadRoute(activeOrigin, activeDest, 'driving-traffic'),
          getRoadRoute(activeOrigin, activeDest, 'walking'),
          buildPuneMetroOptionAsync(activeOrigin, activeDest),
        ]);

        const evaluatedRoutes: RouteOption[] = [];

        // A. PUNE METRO + WALKING / FEEDER (Street-snapped geometry)
        evaluatedRoutes.push(metroOption);

        // B. AUTO RICKSHAW (Pune RTO Regulated Meter Tariff)
        const autoFare = calculateRoadFare('auto', roadDriving.distanceKm, roadDriving.durationMinutes);
        evaluatedRoutes.push({
          id: 'opt-auto',
          mode: 'auto',
          title: 'Auto Rickshaw',
          subtitle: 'Pune RTO Regulated Meter Tariff',
          durationMinutes: roadDriving.durationMinutes,
          distanceKm: roadDriving.distanceKm,
          cost: autoFare,
          isOverBudget: false,
          budgetDelta: 0,
          isFeasible: true,
          coordinates: roadDriving.coordinates,
          legs: [
            {
              id: 'auto-direct',
              mode: 'auto',
              title: `Direct Meter Auto (${roadDriving.distanceKm} km)`,
              durationMinutes: roadDriving.durationMinutes,
              distanceKm: roadDriving.distanceKm,
              cost: autoFare.totalFare,
              fromName: activeOrigin.name.split(',')[0],
              toName: activeDest.name.split(',')[0],
              instruction: 'Direct meter auto via city arterial corridor',
            },
          ],
          score: 0,
          isRecommended: false,
          carbonKg: +(roadDriving.distanceKm * 0.08).toFixed(2),
        });

        // C. CAB / CAR (Live economy AC cab market rate)
        const cabFare = calculateRoadFare('cab', roadDriving.distanceKm, roadDriving.durationMinutes);
        evaluatedRoutes.push({
          id: 'opt-cab',
          mode: 'cab',
          title: 'Economy Cab',
          subtitle: 'Air-Conditioned 4-Seater Cab',
          durationMinutes: roadDriving.durationMinutes,
          distanceKm: roadDriving.distanceKm,
          cost: cabFare,
          isOverBudget: false,
          budgetDelta: 0,
          isFeasible: true,
          coordinates: roadDriving.coordinates,
          legs: [
            {
              id: 'cab-direct',
              mode: 'cab',
              title: `Private AC Cab (${roadDriving.distanceKm} km)`,
              durationMinutes: roadDriving.durationMinutes,
              distanceKm: roadDriving.distanceKm,
              cost: cabFare.totalFare,
              fromName: activeOrigin.name.split(',')[0],
              toName: activeDest.name.split(',')[0],
              instruction: 'Comfortable air-conditioned door-to-door city cab',
            },
          ],
          score: 0,
          isRecommended: false,
          carbonKg: +(roadDriving.distanceKm * 0.16).toFixed(2),
        });

        // D. WALKING (Strictly practical for short strolls <= 1.0 km)
        if (roadWalking.distanceKm <= FARE_CONFIG.walking.maxReasonableDistanceKm) {
          evaluatedRoutes.push({
            id: 'opt-walk',
            mode: 'walking',
            title: 'Walking',
            subtitle: 'Active Pedestrian Route (Zero Cost)',
            durationMinutes: roadWalking.durationMinutes,
            distanceKm: roadWalking.distanceKm,
            cost: calculateRoadFare('walking', roadWalking.distanceKm, roadWalking.durationMinutes),
            isOverBudget: false,
            budgetDelta: -budget,
            isFeasible: true,
            coordinates: roadWalking.coordinates,
            legs: [
              {
                id: 'walk-direct',
                mode: 'walking',
                title: `Direct Walk (${roadWalking.distanceKm} km)`,
                durationMinutes: roadWalking.durationMinutes,
                distanceKm: roadWalking.distanceKm,
                cost: 0,
                fromName: activeOrigin.name.split(',')[0],
                toName: activeDest.name.split(',')[0],
                instruction: 'Pedestrian pathways and sidewalk connections',
              },
            ],
            score: 0,
            isRecommended: false,
            carbonKg: 0,
          });
        }

        // 2. Deterministic Ranking & Plain-English Explanation
        const { rankedRoutes, recommendedRoute: winner, explanationText } = evaluateAndRankRoutes(
          evaluatedRoutes,
          budget,
          preference
        );

        setRoutes(rankedRoutes);
        setRecommendedRoute(winner);
        setExplanation(explanationText);

        // Default selected route on map to recommended route
        if (winner) {
          setSelectedRouteId(winner.id);
        }
      } catch (err) {
        console.error('Transit calculation error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [origin, destination, budget, preference]
  );

  // Initial calculation on load
  useEffect(() => {
    calculateTransitOptions();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-zinc-900 flex flex-col font-sans">
      
      {/* Minimal Header */}
      <Header />

      {/* Main Content Area: Responsive half-and-half desktop layout */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Search & Query Input */}
        <SearchCard
          origin={origin}
          destination={destination}
          budget={budget}
          preference={preference}
          isLoading={isLoading}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          onBudgetChange={setBudget}
          onPreferenceChange={setPreference}
          onSubmit={(resolvedOrigin, resolvedDest) => {
            calculateTransitOptions(resolvedOrigin, resolvedDest);
          }}
        />

        {/* Mobile View Toggle Bar */}
        <div className="flex sm:hidden items-center justify-center p-1 bg-zinc-100 rounded-xl">
          <button
            onClick={() => setMobileTab('routes')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'routes'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Options ({routes.filter((r) => r.isFeasible).length})</span>
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'map'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>

        {/* Dynamic Layout Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-900">
              Transit Options ({routes.filter((r) => r.isFeasible).length})
            </span>
            {isLayoutShifted && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in">
                <span>Map shifted to Left • Route details on Right</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsLayoutShifted((prev) => !prev)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:text-zinc-950 text-xs font-semibold shadow-2xs transition-all"
            title="Switch Map and Details sides"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-500" />
            <span>{isLayoutShifted ? 'Reset View (Cards on Left)' : 'Shift Map to Left'}</span>
          </button>
        </div>

        {/* 2-Column Split: Routes List vs Map with smooth animated shift and 3D rotation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative [perspective:1200px]">
          
          {/* Routes Column: shifts and rotates to right when a card is selected */}
          <div
            className={`lg:col-span-6 space-y-3.5 transition-all duration-700 ease-in-out ${
              isLayoutShifted
                ? 'lg:translate-x-[calc(100%+1.5rem)] lg:[transform:rotateY(2deg)]'
                : 'lg:translate-x-0 lg:[transform:rotateY(0deg)]'
            } ${mobileTab === 'map' ? 'hidden lg:block' : 'block'}`}
          >
            
            {/* Recommendation Banner */}
            <RecommendationBanner
              recommendedRoute={recommendedRoute}
              explanationText={explanation}
              onSelectRoute={(id) => {
                setSelectedRouteId(id);
                setIsLayoutShifted(true);
                setMobileTab('map');
              }}
            />

            {/* Alternatives List Header */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Available Alternatives ({routes.filter((r) => r.isFeasible).length})
              </span>
              <span className="text-[11px] text-zinc-400">
                Sorted by {preference}
              </span>
            </div>

            {/* List of Cards */}
            <div className="space-y-2.5">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  budget={budget}
                  isSelected={selectedRouteId === route.id}
                  onSelect={() => {
                    setSelectedRouteId(route.id);
                    setIsLayoutShifted(true);
                  }}
                  onOpenFareDetails={(r) => setFareModalRoute(r)}
                />
              ))}
            </div>

          </div>

          {/* Map Column: rotates and shifts to left when a card is selected; commands half the viewport */}
          <div
            className={`lg:col-span-6 lg:sticky lg:top-20 h-[480px] sm:h-[580px] lg:h-[calc(100vh-130px)] lg:min-h-[660px] lg:max-h-[880px] transition-all duration-700 ease-in-out ${
              isLayoutShifted
                ? 'lg:-translate-x-[calc(100%+1.5rem)] lg:[transform:rotateY(-3deg)_scale(1.01)] shadow-md rounded-2xl ring-1 ring-zinc-300'
                : 'lg:translate-x-0 lg:[transform:rotateY(0deg)]'
            } ${mobileTab === 'routes' ? 'hidden lg:block' : 'block'}`}
          >
            <MapView
              origin={origin}
              destination={destination}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => {
                setSelectedRouteId(id);
                setIsLayoutShifted(true);
              }}
              isLayoutShifted={isLayoutShifted}
            />
          </div>

        </div>

      </main>

      {/* Modals */}
      <FareModal
        route={fareModalRoute}
        onClose={() => setFareModalRoute(null)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-5 text-center text-xs text-zinc-400">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium text-zinc-600">
            <span>RouteWise</span>
            <span>•</span>
            <span>Pune Multimodal Transit Engine</span>
          </div>
          <div className="text-[11px] text-zinc-400">
            Deterministic fares • Pune RTO & Maha Metro compliant • Zero LLM hallucinations
          </div>
        </div>
      </footer>

    </div>
  );
}
