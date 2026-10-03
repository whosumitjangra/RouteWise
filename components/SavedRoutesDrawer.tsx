'use client';

import React from 'react';
import { SavedRouteRecord, RouteSearchResponse } from '@/lib/types';
import { X, Trash2, ArrowUpRight, Download, Calendar, DollarSign, Bookmark, Compass } from 'lucide-react';
import { formatCurrency } from '@/lib/currencies';

interface SavedRoutesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedRoutes: SavedRouteRecord[];
  onLoadRoute: (payload: RouteSearchResponse) => void;
  onDeleteRoute: (id: string) => void;
  currency: string;
}

export default function SavedRoutesDrawer({
  isOpen,
  onClose,
  savedRoutes,
  onLoadRoute,
  onDeleteRoute,
  currency,
}: SavedRoutesDrawerProps) {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedRoutes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `routewise_saved_routes_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Saved Journeys & Trips ({savedRoutes.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedRoutes.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Compass className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                No saved journeys yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Click the bookmark icon on any transport card to save trips to your profile or local vault.
              </p>
            </div>
          ) : (
            savedRoutes.map((item) => {
              const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {item.origin.split(',')[0]} ➔ {item.destination.split(',')[0]}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="capitalize">{item.priority_mode} Priority</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteRoute(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                      title="Delete saved route"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Budget: {formatCurrency(item.max_budget, currency)}
                    </span>

                    <button
                      onClick={() => {
                        onLoadRoute(item.route_payload);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <span>Load Trip</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {savedRoutes.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Trips (JSON)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
