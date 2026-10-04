import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { FindYourWayPanel } from './components/FindYourWayPanel';
import { MapView } from './components/MapView';
import { RouteOptionsPanel } from './components/RouteOptionsPanel';
import { FareModal } from './components/FareModal';
import { LocationPoint, PreferenceMode, RouteOption } from './types';
import { PUNE_PRESET_TRIPS, PUNE_LANDMARKS } from './config/puneLandmarks';
import { isLocationOutOfTown } from './config/outOfTownCities';
import { getRoadRoute } from './services/mapbox';
import { buildPuneMetroOptionAsync } from './services/metroEngine';
import { buildPMPMLBusOption } from './services/busEngine';
import { calculateRoadFare } from './services/fareEngine';
import { evaluateAndRankRoutes } from './services/recommender';
import { FARE_CONFIG } from './config/fares';
import { Menu, MapPin, Search, ListFilter, Map as MapIcon, X, Bookmark, Clock } from 'lucide-react';
import { checkForAppUpdate, UpdateInfo } from './services/updateChecker';
import { UpdateNotificationBanner } from './components/UpdateNotificationBanner';

export default function App() {
  // Default to AIT Pune -> FC Road Pune as shown in the design image
  const defaultOrigin: LocationPoint = {
    name: 'AIT Pune',
    lat: 18.6069,
    lng: 73.8745,
    address: 'Alandi Road, Dighi, Pune 411015',
    landmarkType: 'college',
  };

  const defaultDestination: LocationPoint = {
    name: 'FC Road Pune',
    lat: 18.5204,
    lng: 73.8415,
    address: 'Fergusson College Road, Shivajinagar, Pune 411004',
    landmarkType: 'locality',
  };

  const [origin, setOrigin] = useState<LocationPoint>(defaultOrigin);
  const [destination, setDestination] = useState<LocationPoint>(defaultDestination);
  const [budget, setBudget] = useState<number>(25); // ₹25 as shown in screenshot
  const [preference, setPreference] = useState<PreferenceMode>('balanced');

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals & Navigation
  const [fareModalRoute, setFareModalRoute] = useState<RouteOption | null>(null);
  const [focusedLocation, setFocusedLocation] = useState<LocationPoint | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  
  // Sidebar & Views
  const [activeSidebarTab, setActiveSidebarTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'search' | 'map' | 'routes'>('search');
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Out of town status
  const originOutOfTown = isLocationOutOfTown(origin);
  const destOutOfTown = isLocationOutOfTown(destination);
  const isOutOfTownActive = originOutOfTown.isOutOfTown || destOutOfTown.isOutOfTown;
  const activeOutOfTownCity = destOutOfTown.isOutOfTown ? destOutOfTown.cityName : originOutOfTown.cityName;

  const calculateTransitOptions = useCallback(
    async (customOrigin?: LocationPoint, customDest?: LocationPoint) => {
      const activeOrigin = customOrigin || origin;
      const activeDest = customDest || destination;

      if (customOrigin) setOrigin(customOrigin);
      if (customDest) setDestination(customDest);

      setIsLoading(true);
      try {
        const [roadDriving, roadWalking, metroOption] = await Promise.all([
          getRoadRoute(activeOrigin, activeDest, 'driving-traffic'),
          getRoadRoute(activeOrigin, activeDest, 'walking'),
          buildPuneMetroOptionAsync(activeOrigin, activeDest),
        ]);

        const evaluatedRoutes: RouteOption[] = [];

        // 1. PUNE METRO + WALKING / FEEDER
        evaluatedRoutes.push(metroOption);

        // 2. PMPML PUNE CITY BUS
        const busOption = buildPMPMLBusOption(activeOrigin, activeDest, roadDriving);
        evaluatedRoutes.push(busOption);

        // 3. AUTO RICKSHAW / RAPIDO
        const autoFare = calculateRoadFare('auto', roadDriving.distanceKm, roadDriving.durationMinutes);
        evaluatedRoutes.push({
          id: 'opt-auto',
          mode: 'auto',
          title: 'Rapido (Bike/Auto)',
          subtitle: 'Direct ride via Rapido',
          durationMinutes: Math.max(10, Math.round(roadDriving.durationMinutes * 0.85)),
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
              title: `Direct ride via Rapido (${roadDriving.distanceKm} km)`,
              durationMinutes: roadDriving.durationMinutes,
              distanceKm: roadDriving.distanceKm,
              cost: autoFare.totalFare,
              fromName: activeOrigin.name.split(',')[0],
              toName: activeDest.name.split(',')[0],
              instruction: 'Direct ride via Rapido',
            },
          ],
          score: 0,
          isRecommended: false,
          carbonKg: +(roadDriving.distanceKm * 0.08).toFixed(2),
        });

        // 4. CAB / UBER
        const cabFare = calculateRoadFare('cab', roadDriving.distanceKm, roadDriving.durationMinutes);
        evaluatedRoutes.push({
          id: 'opt-cab',
          mode: 'cab',
          title: 'Uber (Car)',
          subtitle: 'Direct ride via Uber',
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
              title: `Direct ride via Uber (${roadDriving.distanceKm} km)`,
              durationMinutes: roadDriving.durationMinutes,
              distanceKm: roadDriving.distanceKm,
              cost: cabFare.totalFare,
              fromName: activeOrigin.name.split(',')[0],
              toName: activeDest.name.split(',')[0],
              instruction: 'Direct ride via Uber',
            },
          ],
          score: 0,
          isRecommended: false,
          carbonKg: +(roadDriving.distanceKm * 0.16).toFixed(2),
        });

        // 5. Walking
        if (roadWalking.distanceKm <= FARE_CONFIG.walking.maxReasonableDistanceKm) {
          evaluatedRoutes.push({
            id: 'opt-walk',
            mode: 'walking',
            title: 'Walking',
            subtitle: 'Direct Pedestrian Route',
            durationMinutes: roadWalking.durationMinutes,
            distanceKm: roadWalking.distanceKm,
            cost: calculateRoadFare('walking', roadWalking.distanceKm, roadWalking.durationMinutes),
            isOverBudget: false,
            budgetDelta: -budget,
            isFeasible: true,
            coordinates: roadWalking.coordinates,
            legs: [],
            score: 0,
            isRecommended: false,
            carbonKg: 0,
          });
        }

        const { rankedRoutes, recommendedRoute: winner } = evaluateAndRankRoutes(
          evaluatedRoutes,
          budget,
          preference
        );

        setRoutes(rankedRoutes);
        if (winner) {
          setSelectedRouteId(winner.id);
        } else if (rankedRoutes.length > 0) {
          setSelectedRouteId(rankedRoutes[0].id);
        }
      } catch (err) {
        console.error('Transit calculation error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [origin, destination, budget, preference]
  );

  useEffect(() => {
    calculateTransitOptions();
    checkForAppUpdate().then((info) => {
      if (info.hasUpdate) {
        setUpdateInfo(info);
      }
    });
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveSidebarTab(tab);
    if (tab === 'saved') {
      setIsSavedDrawerOpen(true);
    } else if (tab === 'history') {
      setIsHistoryDrawerOpen(true);
    }
  };

  const handleSwap = () => {
    const tempOrigin = origin;
    const tempDest = destination;
    setOrigin(tempDest);
    setDestination(tempOrigin);
    calculateTransitOptions(tempDest, tempOrigin);
  };

  return (
    <div className="h-[100dvh] w-full max-w-full overflow-hidden bg-[#f8fafc] text-zinc-900 flex flex-col font-sans">
      
      {/* Update Available Notification Banner */}
      <UpdateNotificationBanner updateInfo={updateInfo} />

      {/* Mobile Top Header (Visible on < lg) */}
      <header className="lg:hidden bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#0d5c46] flex items-center justify-center text-white">
              <MapPin className="w-4 h-4 fill-white/20" />
            </div>
            <span className="font-extrabold text-base text-zinc-900 tracking-tight">BudWay</span>
          </div>
        </div>

        {/* Mobile View Switcher Buttons */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMobileView('search')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mobileView === 'search' ? 'bg-white text-zinc-950 shadow-2xs font-bold' : 'text-zinc-500'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mobileView === 'map' ? 'bg-white text-zinc-950 shadow-2xs font-bold' : 'text-zinc-500'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMobileView('routes')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mobileView === 'routes' ? 'bg-white text-zinc-950 shadow-2xs font-bold' : 'text-zinc-500'
            }`}
          >
            Routes
          </button>
        </div>
      </header>

      {/* Main 4-Column Workspace Layout */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        
        {/* Column 1: Navigation Sidebar */}
        <Sidebar
          activeTab={activeSidebarTab}
          onSelectTab={handleTabClick}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Column 2: "Find your way" Search & Filter Panel */}
        <div className={`
          h-full z-20 shrink-0
          ${mobileView === 'search' ? 'block w-full' : 'hidden lg:block'}
        `}>
          <FindYourWayPanel
            origin={origin}
            destination={destination}
            budget={budget}
            preference={preference}
            isLoading={isLoading}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onBudgetChange={setBudget}
            onPreferenceChange={setPreference}
            onSubmit={async (newOrigin, newDest) => {
              const o = newOrigin || origin;
              const d = newDest || destination;
              setOrigin(o);
              setDestination(d);
              setFocusedLocation(null);
              await calculateTransitOptions(o, d);
              setMobileView('routes'); // Auto-switch to routes on mobile
            }}
            onSelectLocation={(loc, field) => {
              setFocusedLocation(loc);
              if (field === 'origin') {
                setOrigin(loc);
                calculateTransitOptions(loc, destination);
              } else {
                setDestination(loc);
                calculateTransitOptions(origin, loc);
              }
            }}
          />
        </div>

        {/* Column 3: Center Map View */}
        <div className={`
          flex-1 h-full min-w-0 relative z-10
          ${mobileView === 'map' ? 'block w-full' : 'hidden lg:block'}
        `}>
          <MapView
            origin={origin}
            destination={destination}
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            focusedLocation={focusedLocation}
            isVisible={mobileView === 'map'}
            onViewRoutesMobile={() => setMobileView('routes')}
            onSetOrigin={(loc) => {
              setOrigin(loc);
              setFocusedLocation(null);
              calculateTransitOptions(loc, destination);
            }}
            onSetDestination={(loc) => {
              setDestination(loc);
              setFocusedLocation(null);
              calculateTransitOptions(origin, loc);
            }}
            onSelectSearchLocation={(loc) => {
              setFocusedLocation(loc);
            }}
          />
        </div>

        {/* Column 4: Route Options Panel */}
        <div className={`
          h-full z-20 shrink-0
          ${mobileView === 'routes' ? 'block w-full' : 'hidden lg:block'}
        `}>
          <RouteOptionsPanel
            origin={origin}
            destination={destination}
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => {
              setSelectedRouteId(id);
            }}
            onOpenFareDetails={(route) => setFareModalRoute(route)}
            onSwapLocations={handleSwap}
            onBackMobile={() => setMobileView('search')}
            onViewOnMapMobile={() => setMobileView('map')}
          />
        </div>

      </div>

      {/* Mobile Bottom Navigation Bar (Visible on < lg) */}
      <nav className="lg:hidden bg-white/95 backdrop-blur-md border-t border-zinc-200/90 py-2.5 px-6 flex items-center justify-around shrink-0 z-30 shadow-lg">
        <button
          onClick={() => setMobileView('search')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            mobileView === 'search' ? 'text-[#0d5c46] font-bold scale-105' : 'text-zinc-400 font-medium'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Find Places</span>
        </button>

        <button
          onClick={() => setMobileView('map')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            mobileView === 'map' ? 'text-[#0d5c46] font-bold scale-105' : 'text-zinc-400 font-medium'
          }`}
        >
          <MapIcon className="w-5 h-5" />
          <span className="text-[10px]">Map View</span>
        </button>

        <button
          onClick={() => setMobileView('routes')}
          className={`flex flex-col items-center gap-1 relative transition-all cursor-pointer ${
            mobileView === 'routes' ? 'text-[#0d5c46] font-bold scale-105' : 'text-zinc-400 font-medium'
          }`}
        >
          <div className="relative">
            <ListFilter className="w-5 h-5" />
            {routes.length > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#10b981] text-white text-[9px] font-bold flex items-center justify-center">
                {routes.filter((r) => r.isFeasible).length}
              </span>
            )}
          </div>
          <span className="text-[10px]">Route Options</span>
        </button>
      </nav>

      {/* Fare Calculation Breakdown Modal */}
      <FareModal
        route={fareModalRoute}
        onClose={() => setFareModalRoute(null)}
      />

      {/* Saved Places Drawer / Modal */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-zinc-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#0d5c46]" />
                <h3 className="font-bold text-sm text-zinc-900">Saved Places</h3>
              </div>
              <button onClick={() => setIsSavedDrawerOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { name: 'AIT Pune', tag: 'College', loc: PUNE_LANDMARKS[0] },
                { name: 'FC Road', tag: 'Hangout', loc: PUNE_LANDMARKS[24] },
                { name: 'Pune Junction', tag: 'Station', loc: PUNE_LANDMARKS[10] },
                { name: 'Military Hospital Khadki', tag: 'Hospital', loc: { name: 'Military Hospital Khadki', lat: 18.5524, lng: 73.8381 } },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDestination(item.loc as LocationPoint);
                    calculateTransitOptions(origin, item.loc as LocationPoint);
                    setIsSavedDrawerOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-zinc-200/80 hover:bg-zinc-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-zinc-900">{item.name}</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">{item.tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Drawer / Modal */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl border border-zinc-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0d5c46]" />
                <h3 className="font-bold text-sm text-zinc-900">Recent Trips</h3>
              </div>
              <button onClick={() => setIsHistoryDrawerOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'AIT Pune ➔ FC Road Pune', time: 'Just now' },
                { label: 'Military Hospital Khadki ➔ Shivajinagar', time: 'Yesterday' },
                { label: 'Pune Airport ➔ Swargate', time: '2 days ago' },
              ].map((trip, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50 flex items-center justify-between">
                  <span className="font-semibold text-zinc-900">{trip.label}</span>
                  <span className="text-[10px] text-zinc-400">{trip.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
