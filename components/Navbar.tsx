'use client';

import React from 'react';
import { Compass, Database, Bookmark, Settings2, Sparkles } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';

interface NavbarProps {
  currentCurrency: string;
  onCurrencyChange: (code: string) => void;
  savedCount: number;
  onOpenSavedModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenSettingsModal: () => void;
  isSupabaseConnected: boolean;
}

export default function Navbar({
  currentCurrency,
  onCurrencyChange,
  savedCount,
  onOpenSavedModal,
  onOpenSupabaseModal,
  onOpenSettingsModal,
  isSupabaseConnected,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Route<span className="text-emerald-600 dark:text-emerald-400">Wise</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                v1.0 GTFS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Multi-Modal Travel & Budget Comparison Engine
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Currency Selector */}
          <div className="relative">
            <select
              value={currentCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="text-xs sm:text-sm font-medium py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer"
              title="Select Currency"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code}
                </option>
              ))}
            </select>
          </div>

          {/* Engine Parameters Customizer */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-sm"
            title="Custom Cost Parameters (Fuel, Surge, Rates)"
          >
            <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Fare Matrix</span>
          </button>

          {/* Supabase Connection Status */}
          <button
            onClick={onOpenSupabaseModal}
            className={`px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all shadow-sm ${
              isSupabaseConnected
                ? 'border-emerald-300 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-amber-300 bg-amber-50/80 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
            title="Supabase Database Configuration"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isSupabaseConnected ? 'Supabase Active' : 'Offline / Local'}
            </span>
          </button>

          {/* Saved Trips Counter */}
          <button
            onClick={onOpenSavedModal}
            className="relative px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20"
            title="Saved Routes"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-white text-emerald-800 font-bold text-[11px] rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
