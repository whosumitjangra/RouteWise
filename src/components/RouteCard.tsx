import React, { useState } from 'react';
import { 
  Train, 
  Car, 
  Footprints, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shuffle,
  ExternalLink,
  MapPin,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { RouteOption } from '../types';
import { getUberBookingUrl, getRapidoBookingUrl } from '../utils/feederLinks';

interface RouteCardProps {
  route: RouteOption;
  budget: number;
  isSelected: boolean;
  onSelect: () => void;
  onOpenFareDetails: (route: RouteOption) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  budget,
  isSelected,
  onSelect,
  onOpenFareDetails,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCardOpen = isSelected || isExpanded;

  const renderIcon = () => {
    switch (route.mode) {
      case 'metro_multimodal':
        return <Train className="w-4 h-4 text-indigo-600" />;
      case 'auto':
        return (
          <span className="font-bold text-xs text-amber-700 font-mono tracking-tighter">
            🛺
          </span>
        );
      case 'cab':
        return <Car className="w-4 h-4 text-zinc-800" />;
      case 'walking':
        return <Footprints className="w-4 h-4 text-zinc-600" />;
      default:
        return <Car className="w-4 h-4 text-zinc-600" />;
    }
  };

  const handleCardClick = () => {
    onSelect();
    // Toggle path in brief on tap as requested by user
    setIsExpanded((prev) => !prev);
  };

  if (!route.isFeasible) {
    return (
      <div className="bg-zinc-50/70 border border-zinc-200/60 rounded-xl p-3.5 text-zinc-400 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="opacity-50">{renderIcon()}</div>
          <div>
            <span className="font-semibold text-zinc-500 line-through mr-2">
              {route.title}
            </span>
            <span className="text-[11px] text-zinc-400 block sm:inline">
              {route.unfeasibleReason || 'Not practical for this route'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className={`rounded-xl border transition-all cursor-pointer select-none ${
        isSelected
          ? 'bg-white border-zinc-950 ring-1 ring-zinc-950 shadow-sm'
          : 'bg-white border-zinc-200/90 hover:border-zinc-300 shadow-2xs'
      }`}
    >
      <div className="p-3.5 sm:p-4">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
              {renderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-xs sm:text-sm text-zinc-900">
                  {route.title}
                </h3>
                {route.isRecommended && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ★ Best Choice
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                {route.subtitle}
              </p>
            </div>
          </div>

          {/* Fare display */}
          <div className="text-right shrink-0">
            <div className="font-mono font-extrabold text-base sm:text-lg text-zinc-950">
              ₹{route.cost.totalFare}
            </div>
            <div className="text-[10px] text-zinc-400">
              {route.mode === 'metro_multimodal' || route.mode === 'auto'
                ? 'Standard tariff'
                : 'Live market fare'}
            </div>
          </div>

        </div>

        {/* Primary Metrics: Duration, Distance, Budget status */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-100 text-xs">
          
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="font-semibold text-zinc-800">
              {route.durationMinutes} min
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-500">
              {route.distanceKm} km
            </span>
          </div>

          {/* Budget delta indicator */}
          <div className="text-[11px]">
            {route.isOverBudget ? (
              <span className="font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>+₹{route.budgetDelta} over budget</span>
              </span>
            ) : (
              <span className="font-medium text-emerald-700">
                ₹{Math.abs(route.budgetDelta)} under budget
              </span>
            )}
          </div>

        </div>

        {/* Quick Path Indicator & Tap instruction */}
        <div className="mt-2.5 pt-2 border-t border-zinc-50 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
            <span>{isCardOpen ? 'Tap to collapse path' : 'Tap to open train route chain'}</span>
            {isCardOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFareDetails(route);
            }}
            className="hover:text-zinc-700 flex items-center gap-0.5 transition-colors underline-offset-2 hover:underline"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Fare info</span>
          </button>
        </div>

      </div>

      {/* Train-Like Long Chain Diagram (Opens automatically when selected or tapped) */}
      {isCardOpen && (
        <div className="p-3.5 sm:p-5 bg-zinc-50/95 border-t border-zinc-200/90 rounded-b-xl space-y-4 text-xs animate-in fade-in">
          
          {/* Train Chain Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200/70">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                <Train className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
                  <span>Transit Train-Track Chain</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                    Step-by-Step Path
                  </span>
                </span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              Total {route.durationMinutes} min • {route.distanceKm} km
            </span>
          </div>

          {/* Connected Train-Carriage Rail Track */}
          <div className="relative pl-6 sm:pl-7 space-y-4">
            
            {/* Visual Rail Track Connecting Line */}
            <div className="absolute left-[11px] sm:left-[13px] top-3 bottom-4 w-1 bg-gradient-to-b from-emerald-500 via-indigo-600 to-zinc-900 rounded-full" />

            {route.legs.map((leg, idx) => {
              const isInterchange = leg.title.includes('District Court') || leg.title.includes('Transfer');
              const isMetro = leg.mode === 'metro_multimodal';
              const isFeeder = leg.isFeeder || leg.badge === 'Feeder Auto';

              return (
                <div key={leg.id || idx} className="relative group">
                  
                  {/* Station Node Pip on Rail Track */}
                  <div
                    className={`absolute -left-[23px] sm:-left-[25px] top-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shadow-2xs z-10 ${
                      isInterchange
                        ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                        : isMetro
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                        : isFeeder
                        ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-200'
                        : 'bg-zinc-800 text-white'
                    }`}
                  >
                    {isInterchange ? (
                      <Shuffle className="w-3 h-3" />
                    ) : isMetro ? (
                      <Train className="w-2.5 h-2.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Carriage Card */}
                  <div
                    className={`p-3 sm:p-3.5 rounded-xl border text-xs shadow-2xs transition-all ${
                      isInterchange
                        ? 'bg-amber-50/90 border-amber-200/90 text-amber-950'
                        : isMetro
                        ? 'bg-white border-indigo-200/80 text-zinc-900'
                        : 'bg-white border-zinc-200/80 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 pb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-xs text-zinc-950 truncate">
                          {leg.title}
                        </span>
                      </div>

                      {leg.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                            leg.badge.includes('Purple')
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : leg.badge.includes('Aqua')
                              ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                              : leg.badge.includes('Transfer')
                              ? 'bg-amber-200 text-amber-950 font-bold'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {leg.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-600 leading-relaxed mt-0.5">
                      {leg.instruction}
                    </p>

                    {/* Metrics bar */}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-400 font-mono">
                      <span>{leg.durationMinutes} mins</span>
                      <span>•</span>
                      <span>{leg.distanceKm} km</span>
                      {leg.cost > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">₹{leg.cost}</span>
                        </>
                      )}
                      {leg.stopsCount && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-semibold">{leg.stopsCount} stops</span>
                        </>
                      )}
                    </div>

                    {/* TRAIN STOPS CHAIN: Visual Linked Railway Train Carriages */}
                    {leg.stationList && leg.stationList.length > 0 && (
                      <div className="mt-2.5 p-2.5 sm:p-3 bg-zinc-900 text-white rounded-xl shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                            <span>🚆</span>
                            <span>Train Stops Chain ({leg.stationList.length} Stations):</span>
                          </span>
                          <span className="text-zinc-400 font-mono text-[10px]">
                            ~{Math.round(leg.stationList.length * 2.1)} min on train
                          </span>
                        </div>

                        {/* Connected Train Carriage Chain */}
                        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-thin scrollbar-thumb-zinc-700">
                          {leg.stationList.map((stnName, sIdx) => {
                            const isFirst = sIdx === 0;
                            const isLast = sIdx === leg.stationList!.length - 1;

                            return (
                              <React.Fragment key={sIdx}>
                                <div
                                  className={`flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                                    isFirst
                                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                                      : isLast
                                      ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                                      : 'bg-zinc-800/90 border-zinc-700 text-zinc-200'
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isFirst
                                        ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                                        : isLast
                                        ? 'bg-rose-400 ring-2 ring-rose-400/30'
                                        : 'bg-indigo-400'
                                    }`}
                                  />
                                  <span className="whitespace-nowrap">{stnName}</span>
                                  {isFirst && <span className="text-[9px] text-emerald-400 font-mono font-bold">(Board)</span>}
                                  {isLast && <span className="text-[9px] text-rose-400 font-mono font-bold">(Exit)</span>}
                                </div>

                                {sIdx < leg.stationList!.length - 1 && (
                                  <div className="flex items-center text-zinc-600 font-mono shrink-0 select-none">
                                    <span className="text-xs font-bold text-zinc-500">═══</span>
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Feeder Booking Links (Uber & Rapido) */}
                    {(leg.isFeeder || leg.badge === 'Feeder Auto' || leg.title.toLowerCase().includes('feeder')) && (
                      <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                            <span>🛺</span>
                            <span>Book Feeder Auto to connect with Metro:</span>
                          </span>
                          <span className="text-[10px] text-amber-800 font-mono font-bold">
                            ₹{leg.cost}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={getUberBookingUrl(
                              { lat: leg.fromCoords?.[0] || 18.52, lng: leg.fromCoords?.[1] || 73.85, name: leg.fromName },
                              { lat: leg.toCoords?.[0] || 18.53, lng: leg.toCoords?.[1] || 73.86, name: leg.toName }
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <span className="font-bold">Uber</span> Auto
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                          </a>

                          <a
                            href={getRapidoBookingUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#F9C900] hover:bg-[#E5B800] text-zinc-950 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <span>Rapido</span> Auto
                            <ExternalLink className="w-3 h-3 text-zinc-800" />
                          </a>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

          {/* Direct Auto Rickshaw Booking if mode is auto */}
          {route.mode === 'auto' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span>🛺</span>
                  <span>Book City Auto Ride:</span>
                </span>
                <span className="text-[11px] text-amber-800 font-mono font-bold">
                  Meter Fare ₹{route.cost.totalFare}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getUberBookingUrl(
                    { lat: route.coordinates[0]?.[1] || 18.52, lng: route.coordinates[0]?.[0] || 73.85, name: 'Pickup' },
                    { lat: route.coordinates[route.coordinates.length - 1]?.[1] || 18.53, lng: route.coordinates[route.coordinates.length - 1]?.[0] || 73.86, name: 'Dropoff' }
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="font-bold">Uber</span> Auto
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>

                <a
                  href={getRapidoBookingUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#F9C900] hover:bg-[#E5B800] text-zinc-950 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Rapido</span> Auto
                  <ExternalLink className="w-3 h-3 text-zinc-800" />
                </a>
              </div>
            </div>
          )}

          {/* Quick Tariff Summary */}
          <div className="p-2.5 bg-white rounded-lg border border-zinc-200/80 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Tariff Rule:</span>
            <span className="font-medium text-zinc-800">{route.cost.formulaDescription}</span>
          </div>

        </div>
      )}

    </div>
  );
};
