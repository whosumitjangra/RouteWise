import React from 'react';
import { 
  ArrowLeft, 
  ArrowUpDown, 
  Clock, 
  Coins, 
  MapPin, 
  Bus, 
  Train, 
  Bike, 
  Car, 
  ChevronRight, 
  Leaf, 
  ArrowRight
} from 'lucide-react';
import { LocationPoint, RouteOption } from '../types';

interface RouteOptionsPanelProps {
  origin: LocationPoint;
  destination: LocationPoint;
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onOpenFareDetails?: (route: RouteOption) => void;
  onSwapLocations?: () => void;
  onBackMobile?: () => void;
  onViewOnMapMobile?: () => void;
}

export const RouteOptionsPanel: React.FC<RouteOptionsPanelProps> = ({
  origin,
  destination,
  routes,
  selectedRouteId,
  onSelectRoute,
  onOpenFareDetails,
  onSwapLocations,
  onBackMobile,
  onViewOnMapMobile,
}) => {
  // Derive key stats across routes
  const feasibleRoutes = routes.filter((r) => r.isFeasible);
  const fastestDuration = feasibleRoutes.length > 0 
    ? Math.min(...feasibleRoutes.map((r) => r.durationMinutes)) 
    : 12;
  const cheapestCost = feasibleRoutes.length > 0 
    ? Math.min(...feasibleRoutes.map((r) => r.cost.totalFare)) 
    : 20;
  const routeDistance = feasibleRoutes.length > 0 
    ? feasibleRoutes[0].distanceKm 
    : 3.8;

  // Find standard options
  const busRoute = routes.find((r) => r.mode === 'bus') || routes[1];
  const metroRoute = routes.find((r) => r.mode === 'metro_multimodal') || routes[0];
  const autoRoute = routes.find((r) => r.mode === 'auto') || routes[2];
  const cabRoute = routes.find((r) => r.mode === 'cab') || routes[3];

  return (
    <div className="w-full lg:w-[380px] shrink-0 bg-white border-l border-zinc-200/80 flex flex-col h-full overflow-y-auto p-5 pb-32 sm:pb-6 space-y-4">
      
      {/* 1. Top Header with Back Arrow and Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackMobile}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Back to search"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-zinc-900 tracking-tight">
            Route Options
          </h2>
        </div>
        {onViewOnMapMobile && (
          <button
            type="button"
            onClick={onViewOnMapMobile}
            className="lg:hidden px-3 py-1.5 rounded-lg bg-[#0d5c46] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-[#094232] transition-colors"
          >
            <span>🗺️</span>
            <span>View Map</span>
          </button>
        )}
      </div>

      {/* 2. Origin & Destination Corridor Bar with Swap */}
      <div className="bg-zinc-50/70 rounded-xl border border-zinc-200/80 p-3 flex items-center justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-100 shrink-0" />
            <span className="truncate">{origin.name.split(',')[0]}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate">{destination.name.split(',')[0]}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwapLocations}
          title="Swap Locations"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors shrink-0 cursor-pointer"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Key Metrics Pills Row (Fastest, Budget, Distance) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl border border-zinc-200/70 bg-white shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-xs font-bold text-zinc-900">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>{fastestDuration} min</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium mt-0.5">Fastest</span>
        </div>

        <div className="p-2.5 rounded-xl border border-zinc-200/70 bg-white shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-xs font-bold text-zinc-900">
            <Coins className="w-3.5 h-3.5 text-zinc-400" />
            <span>₹ {cheapestCost}</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium mt-0.5">Budget</span>
        </div>

        <div className="p-2.5 rounded-xl border border-zinc-200/70 bg-white shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1 text-xs font-bold text-zinc-900">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span>{routeDistance} km</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium mt-0.5">Distance</span>
        </div>
      </div>

      {/* 4. Comparison Cards List */}
      <div className="space-y-3 pt-1">
        
        {/* Card 1: Bus (Best for Budget) - Highlighted in soft mint as shown in image */}
        {busRoute && (
          <div
            onClick={() => {
              onSelectRoute(busRoute.id);
              onOpenFareDetails?.(busRoute);
            }}
            className={`
              rounded-2xl p-4 transition-all cursor-pointer relative
              ${selectedRouteId === busRoute.id
                ? 'bg-[#f0fdf4] border-2 border-[#10b981] shadow-xs'
                : 'bg-[#f0fdf4] border border-[#a7f3d0] hover:border-[#10b981]'
              }
            `}
          >
            {/* Header: Title & Price Pill */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#dcfce7] flex items-center justify-center text-[#15803d]">
                  <Bus className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-zinc-900">
                  Bus (Best for Budget)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#dcfce7] text-[#15803d]">
                ₹ 10 – {Math.max(20, busRoute.cost.totalFare)}
              </span>
            </div>

            {/* Content: Left Metrics & Right Legs */}
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-bold text-sm text-zinc-900">
                  {busRoute.durationMinutes} min
                </div>
                <div className="text-[11px] text-zinc-500">
                  {busRoute.distanceKm} km
                </div>
              </div>

              <div className="min-w-0 flex-1 px-3 space-y-1 text-right sm:text-left">
                <div className="text-[11px] text-zinc-600 truncate flex items-center justify-end sm:justify-start gap-1">
                  <span>🚏</span>
                  <span>{origin.name.split(',')[0]} Bus Stop → {destination.name.split(',')[0]}</span>
                </div>
                <div className="text-[11px] font-semibold text-zinc-900 truncate flex items-center justify-end sm:justify-start gap-1">
                  <span>🚌</span>
                  <span>Bus No. {busRoute.busNumber || '102, 104, 108'}</span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        )}

        {/* Card 2: Metro + Walk */}
        {metroRoute && (
          <div
            onClick={() => {
              onSelectRoute(metroRoute.id);
              onOpenFareDetails?.(metroRoute);
            }}
            className={`
              rounded-2xl p-4 bg-white border transition-all cursor-pointer shadow-2xs
              ${selectedRouteId === metroRoute.id
                ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/20'
                : 'border-zinc-200/90 hover:border-zinc-300'
              }
            `}
          >
            {/* Header: Title & Price Pill */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Train className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-zinc-900">
                  Metro + Walk
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700">
                ₹ 20 – {Math.max(30, metroRoute.cost.totalFare)}
              </span>
            </div>

            {/* Content: Left Metrics & Right Legs */}
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-bold text-sm text-zinc-900">
                  {metroRoute.durationMinutes} min
                </div>
                <div className="text-[11px] text-zinc-500">
                  {metroRoute.distanceKm} km
                </div>
              </div>

              <div className="min-w-0 flex-1 px-3 space-y-1 text-right sm:text-left">
                <div className="text-[11px] text-zinc-700 truncate flex items-center justify-end sm:justify-start gap-1">
                  <span>🚇</span>
                  <span>Pune Metro ({metroRoute.stationWaypoints?.[0]?.name?.split(' ')[0] || 'Shivajinagar'}) →</span>
                </div>
                <div className="text-[11px] text-zinc-500 truncate flex items-center justify-end sm:justify-start gap-1">
                  <span>🚶</span>
                  <span>Walk (8 min)</span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        )}

        {/* Card 3: Rapido (Bike/Auto) */}
        {autoRoute && (
          <div
            onClick={() => {
              onSelectRoute(autoRoute.id);
              onOpenFareDetails?.(autoRoute);
            }}
            className={`
              rounded-2xl p-4 bg-white border transition-all cursor-pointer shadow-2xs
              ${selectedRouteId === autoRoute.id
                ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/20'
                : 'border-zinc-200/90 hover:border-zinc-300'
              }
            `}
          >
            {/* Header: Title & Price Pill */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Bike className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-zinc-900">
                  Rapido (Bike/Auto)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700">
                ₹ 40 – {Math.max(60, autoRoute.cost.totalFare)}
              </span>
            </div>

            {/* Content: Left Metrics & Right Legs */}
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-bold text-sm text-zinc-900">
                  {autoRoute.durationMinutes} min
                </div>
                <div className="text-[11px] text-zinc-500">
                  {autoRoute.distanceKm} km
                </div>
              </div>

              <div className="min-w-0 flex-1 px-3 space-y-1 text-right sm:text-left">
                <div className="text-[11px] text-zinc-700 truncate flex items-center justify-end sm:justify-start gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span>Direct ride via Rapido</span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  Estimated fare
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        )}

        {/* Card 4: Uber (Car) */}
        {cabRoute && (
          <div
            onClick={() => {
              onSelectRoute(cabRoute.id);
              onOpenFareDetails?.(cabRoute);
            }}
            className={`
              rounded-2xl p-4 bg-white border transition-all cursor-pointer shadow-2xs
              ${selectedRouteId === cabRoute.id
                ? 'border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50/50'
                : 'border-zinc-200/90 hover:border-zinc-300'
              }
            `}
          >
            {/* Header: Title & Price Pill */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <Car className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-zinc-900">
                  Uber (Car)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-700">
                ₹ 80 – {Math.max(120, cabRoute.cost.totalFare)}
              </span>
            </div>

            {/* Content: Left Metrics & Right Legs */}
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-bold text-sm text-zinc-900">
                  {cabRoute.durationMinutes} min
                </div>
                <div className="text-[11px] text-zinc-500">
                  {cabRoute.distanceKm} km
                </div>
              </div>

              <div className="min-w-0 flex-1 px-3 space-y-1 text-right sm:text-left">
                <div className="text-[11px] text-zinc-700 truncate flex items-center justify-end sm:justify-start gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span>Direct ride via Uber</span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  Estimated fare
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        )}

      </div>

      {/* 5. Bottom Comparison Promo Banner */}
      <div className="bg-[#f0fdf4] border border-[#d1fae5] rounded-2xl p-3.5 flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-zinc-900">
              Choose what works for you
            </h4>
            <p className="text-[10px] text-zinc-500">
              Compare time, cost and comfort — all in one place.
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
      </div>

    </div>
  );
};
