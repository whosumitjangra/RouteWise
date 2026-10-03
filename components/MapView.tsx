'use client';

import React, { useEffect, useRef } from 'react';
import { RouteOption, LocationPoint } from '@/lib/types';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  origin: LocationPoint;
  destination: LocationPoint;
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

const MODE_COLORS: Record<string, string> = {
  driving: '#2563eb',     // Blue
  rideshare: '#9333ea',   // Purple
  train: '#d97706',       // Amber
  bus: '#0d9488',         // Teal
  transit: '#0284c7',     // Sky
  flight: '#6366f1',      // Indigo
  walking: '#16a34a',     // Emerald
  bicycling: '#10b981',   // Mint
};

export default function MapView({
  origin,
  destination,
  routes,
  selectedRouteId,
  onSelectRoute,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineLayersRef = useRef<{ [key: string]: any }>({});
  const markersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically require Leaflet inside browser
    const L = require('leaflet');

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [origin.lat, origin.lng],
        zoom: 10,
        zoomControl: true,
      });

      // High-quality OpenStreetMap carto tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Clear old polylines
    Object.values(polylineLayersRef.current).forEach((layer: any) => map.removeLayer(layer));
    polylineLayersRef.current = {};

    // Custom Origin SVG Pin
    const originIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          background-color: #16a34a; 
          color: white; 
          width: 32px; 
          height: 32px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); font-weight: bold; font-size: 13px;">A</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Custom Destination SVG Pin
    const destIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          background-color: #dc2626; 
          color: white; 
          width: 32px; 
          height: 32px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); font-weight: bold; font-size: 13px;">B</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon }).addTo(markersLayer);
    originMarker.bindPopup(`<strong>Origin:</strong> ${origin.name}`);

    const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(markersLayer);
    destMarker.bindPopup(`<strong>Destination:</strong> ${destination.name}`);

    // Draw all routes with mode colors
    const allLatLngs: [number, number][] = [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ];

    routes.forEach((route) => {
      const isSelected = selectedRouteId === route.id;
      const color = MODE_COLORS[route.mode] || '#4b5563';
      const isFlight = route.mode === 'flight';
      const isWalking = route.mode === 'walking';

      const polyline = L.polyline(route.coordinates, {
        color: color,
        weight: isSelected ? 6 : 3.5,
        opacity: isSelected ? 1.0 : 0.65,
        dashArray: isFlight ? '8, 8' : isWalking ? '4, 6' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      polyline.on('click', () => {
        onSelectRoute(route.id);
      });

      polyline.bindTooltip(`<strong>${route.title}</strong><br/>${Math.floor(route.durationMinutes / 60)}h ${route.durationMinutes % 60}m • $${route.cost.totalCost}`, {
        sticky: true,
      });

      polylineLayersRef.current[route.id] = polyline;

      route.coordinates.forEach((pt) => allLatLngs.push(pt));
    });

    // Fit bounds to show entire journey
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }

    return () => {
      // Cleanup on unmount handled by ref
    };
  }, [origin, destination, routes]);

  // Handle selected route highlight updates without full re-render
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    Object.entries(polylineLayersRef.current).forEach(([id, layer]: [string, any]) => {
      const isSelected = id === selectedRouteId;
      layer.setStyle({
        weight: isSelected ? 6.5 : 3,
        opacity: isSelected ? 1.0 : 0.5,
      });
      if (isSelected) {
        layer.bringToFront();
      }
    });

    if (selectedRouteId && polylineLayersRef.current[selectedRouteId]) {
      const activeLayer = polylineLayersRef.current[selectedRouteId];
      map.fitBounds(activeLayer.getBounds(), { padding: [50, 50], maxZoom: 14 });
    }
  }, [selectedRouteId]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 pointer-events-auto">
        <div className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Route Network
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-[#2563eb]"></span>
            <span>Driving</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-[#9333ea]"></span>
            <span>Rideshare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-[#d97706]"></span>
            <span>Train / Rail</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-[#0d9488]"></span>
            <span>Intercity Bus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 border-b border-dashed border-[#6366f1]"></span>
            <span>Flight Arc</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded bg-[#16a34a]"></span>
            <span>Walking / Bike</span>
          </div>
        </div>
      </div>
    </div>
  );
}
