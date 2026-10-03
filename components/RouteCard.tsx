'use client';

import React, { useState } from 'react';
import { 
  Car, 
  CarTaxiFront, 
  Train, 
  Bus, 
  TramFront, 
  Plane, 
  Footprints, 
  Bike, 
  Clock, 
  Coins, 
  Leaf, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Bookmark, 
  ShieldCheck, 
  AlertTriangle, 
  Zap, 
  PiggyBank, 
  Scale, 
  ArrowRight,
  Info
} from 'lucide-react';
import { RouteOption, BadgeType, TransportModeType } from '@/lib/types';
import { formatCurrency } from '@/lib/currencies';

interface RouteCardProps {
  route: RouteOption;
  currency: string;
  maxBudget: number;
  isSelectedOnMap: boolean;
  isInComparison: boolean;
  onSelectOnMap: (id: string) => void;
  onToggleComparison: (id: string) => void;
  onSaveRoute: (route: RouteOption) => void;
}

export default function RouteCard({
  route,
  currency,
  maxBudget,
  isSelectedOnMap,
  isInComparison,
  onSelectOnMap,
  onToggleComparison,
  onSaveRoute,
}: RouteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const getModeIcon = (mode: TransportModeType) => {
    switch (mode) {
      case 'driving': return <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'rideshare': return <CarTaxiFront className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'train': return <Train className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'bus': return <Bus className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'transit': return <TramFront className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'flight': return <Plane className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'walking': return <Footprints className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'bicycling': return <Bike className="w-5 h-5 text-emerald-500" />;
      default: return <Car className="w-5 h-5 text-slate-600" />;
    }
  };

  const renderBadge = (badge: BadgeType) => {
    switch (badge) {
      case 'fastest':
        return (
          <span key="badge-fastest" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs">
            <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>Fastest Path</span>
          </span>
        );
      case 'cheapest':
        return (
          <span key="badge-cheapest" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
            <PiggyBank className="w-3 h-3 text-emerald-600" />
            <span>Most Affordable</span>
          </span>
        );
      case 'balanced':
        return (
          <span key="badge-balanced" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 shadow-xs">
            <Scale className="w-3 h-3 text-indigo-600" />
            <span>Best Value</span>
          </span>
        );
      case 'eco':
        return (
          <span key="badge-eco" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-300 dark:border-teal-800 shadow-xs">
            <Leaf className="w-3 h-3 text-teal-600" />
            <span>Eco Champion</span>
          </span>
        );
      case 'over_budget':
        return (
          <span key="badge-over" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-xs">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Over Budget</span>
          </span>
        );
      default:
        return null;
    }
  };

  const hours = Math.floor(route.durationMinutes / 60);
  const minutes = route.durationMinutes % 60;
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveRoute(route);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div
      onClick={() => onSelectOnMap(route.id)}
      className={`relative rounded-2xl transition-all cursor-pointer border ${
        isSelectedOnMap
          ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-xl bg-white dark:bg-slate-900 scale-[1.01]'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
      } ${route.isOverBudget ? 'opacity-85' : ''}`}
    >
      <div className="p-4 sm:p-5">
        
        {/* Top Header: Icon, Titles, Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              {getModeIcon(route.mode)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  {route.title}
                </h3>
                {route.badges.map(renderBadge)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {route.subTitle}
              </p>
            </div>
          </div>

          {/* Action buttons: Compare Checkbox & Save */}
          <div className="flex items-center gap-2 self-end sm:self-start">
            <label
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer select-none transition-colors"
            >
              <input
                type="checkbox"
                checked={isInComparison}
                onChange={() => onToggleComparison(route.id)}
                className="w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
              />
              <span>Compare</span>
            </label>

            <button
              onClick={handleSaveClick}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-all ${
                isSaved
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
              title="Save this route to profile"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Primary Metrics: Duration & Total Cost */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          
          {/* Duration */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Travel Time</span>
            </div>
            <div className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white mt-0.5">
              {durationText}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              {route.departureTimeFormatted} ➔ {route.arrivalTimeFormatted}
            </div>
          </div>

          {/* Cost */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              <span>Total Cost</span>
            </div>
            <div className="font-extrabold text-lg sm:text-xl text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(route.cost.totalCost, currency)}
            </div>
            <div className={`text-[11px] font-medium ${
              route.isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {route.isOverBudget
                ? `+${formatCurrency(route.budgetDelta, currency)} over max`
                : `${formatCurrency(Math.abs(route.budgetDelta), currency)} under budget`}
            </div>
          </div>

          {/* Distance */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>Distance</span>
            </div>
            <div className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200 mt-0.5">
              {route.distanceKm} km
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              {(route.distanceKm * 0.621371).toFixed(1)} miles
            </div>
          </div>

          {/* Emissions & Reliability */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-teal-500" />
              <span>Carbon CO₂</span>
            </div>
            <div className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200 mt-0.5">
              {route.co2Kg} kg
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>{route.reliabilityScore}% reliability</span>
            </div>
          </div>

        </div>

        {/* Highlights List */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-slate-600 dark:text-slate-300">
          {route.highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span>{h}</span>
            </div>
          ))}
        </div>

        {/* Expand / Collapse Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Hide Cost Breakdown & Legs' : 'View Fare Breakdown & Steps'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <span className="text-[11px] text-slate-400">
            Click card to highlight on map
          </span>
        </div>

      </div>

      {/* Expanded Accordion: Fare Breakdown Table & Multi-Leg Itinerary */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl space-y-4">
          
          {/* Detailed Cost Engine Formula Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-500" />
              <span>Deterministic Cost Breakdown (Fare Engine)</span>
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Base Fare</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {formatCurrency(route.cost.baseFare, currency)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Distance Cost</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {formatCurrency(route.cost.distanceCost, currency)}
                </span>
              </div>

              {route.cost.fuelCost !== undefined && (
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fuel Cost</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatCurrency(route.cost.fuelCost, currency)}
                  </span>
                </div>
              )}

              {route.cost.tollsCost !== undefined && (
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Highway Tolls</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatCurrency(route.cost.tollsCost, currency)}
                  </span>
                </div>
              )}

              {route.cost.surgeCost !== undefined && route.cost.surgeCost > 0 && (
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 bg-amber-50/50">
                  <span className="text-amber-700 dark:text-amber-300 block text-[10px] uppercase font-semibold">Surge Surcharge</span>
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    +{formatCurrency(route.cost.surgeCost, currency)}
                  </span>
                </div>
              )}

              {route.cost.taxesAndFees !== undefined && (
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Taxes & Fees</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {formatCurrency(route.cost.taxesAndFees, currency)}
                  </span>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                <span className="text-emerald-700 dark:text-emerald-300 block text-[10px] uppercase font-bold">Total Fare</span>
                <span className="font-extrabold text-emerald-800 dark:text-emerald-200 text-sm">
                  {formatCurrency(route.cost.totalCost, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Leg Step-by-Step Itinerary */}
          {route.legs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>Segmented Itinerary & Transit Legs</span>
              </h4>

              <div className="space-y-2">
                {route.legs.map((leg, idx) => (
                  <div
                    key={leg.id || idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-[11px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{leg.title}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {leg.durationMinutes}m • {leg.distanceKm} km
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {leg.instruction}
                      </p>
                      {leg.departureTime && leg.arrivalTime && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                          {leg.departureTime} ➔ {leg.arrivalTime}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
