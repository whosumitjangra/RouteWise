import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { LocationPoint, RouteOption } from '../types';
import { getMapboxToken, hasValidMapboxToken } from '../services/mapbox';
import { PUNE_METRO_STATIONS } from '../config/metroData';

interface MapViewProps {
  origin: LocationPoint;
  destination: LocationPoint;
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

const MODE_COLORS: Record<string, string> = {
  metro_multimodal: '#4f46e5', // Indigo
  auto: '#d97706',             // Amber
  bike: '#059669',             // Emerald
  cab: '#18181b',              // Zinc
  walking: '#0d9488',          // Teal
};

export const MapView: React.FC<MapViewProps> = ({
  origin,
  destination,
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const isMapboxAvailable = hasValidMapboxToken();

  useEffect(() => {
    if (!isMapboxAvailable || !mapContainerRef.current) return;

    mapboxgl.accessToken = getMapboxToken();

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [73.8567, 18.5204], // Pune center
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      mapInstanceRef.current = map;
      updateMapLayers();
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isMapboxAvailable]);

  // Update markers and layers when props change
  useEffect(() => {
    if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
      updateMapLayers();
    }
  }, [origin, destination, routes, selectedRouteId]);

  const updateMapLayers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add Start Marker (Green)
    const elStart = document.createElement('div');
    elStart.className = 'w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold';
    elStart.innerText = 'A';
    const markerStart = new mapboxgl.Marker(elStart)
      .setLngLat([origin.lng, origin.lat])
      .addTo(map);
    markersRef.current.push(markerStart);

    // Add Destination Marker (Red)
    const elDest = document.createElement('div');
    elDest.className = 'w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold';
    elDest.innerText = 'B';
    const markerDest = new mapboxgl.Marker(elDest)
      .setLngLat([destination.lng, destination.lat])
      .addTo(map);
    markersRef.current.push(markerDest);

    // Remove existing route layers
    routes.forEach((r) => {
      const layerId = `route-layer-${r.id}`;
      const sourceId = `route-source-${r.id}`;
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    });

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([origin.lng, origin.lat]);
    bounds.extend([destination.lng, destination.lat]);

    // Draw lines for feasible routes
    routes.forEach((r) => {
      if (!r.isFeasible || r.coordinates.length < 2) return;

      const sourceId = `route-source-${r.id}`;
      const layerId = `route-layer-${r.id}`;
      const isSelected = r.id === selectedRouteId;
      const color = MODE_COLORS[r.mode] || '#71717a';

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: r.coordinates,
          },
        },
      });

      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': isSelected ? 5.5 : 2.5,
          'line-opacity': isSelected ? 1.0 : 0.45,
          ...(r.mode === 'metro_multimodal' ? { 'line-dasharray': [1, 1.5] } : {}),
        },
      });

      r.coordinates.forEach((coord) => bounds.extend(coord));
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  };

  // If Mapbox token is not configured, show clean SVG vector map with Pune Metro alignment
  if (!isMapboxAvailable) {
    const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
    
    // Bounds normalization for SVG canvas
    const lats = [origin.lat, destination.lat, ...PUNE_METRO_STATIONS.map((s) => s.lat)];
    const lngs = [origin.lng, destination.lng, ...PUNE_METRO_STATIONS.map((s) => s.lng)];
    const minLat = Math.min(...lats) - 0.02;
    const maxLat = Math.max(...lats) + 0.02;
    const minLng = Math.min(...lngs) - 0.02;
    const maxLng = Math.max(...lngs) + 0.02;

    const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 560 + 20;
    const toY = (lat: number) => 380 - ((lat - minLat) / (maxLat - minLat)) * 340 - 20;

    return (
      <div className="relative w-full h-[400px] sm:h-full min-h-[380px] bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner flex flex-col justify-between p-4">
        
        {/* Vector SVG */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
            
            {/* Grid Lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Pune Metro Lines Background */}
            {/* Purple Line */}
            <polyline
              points={PUNE_METRO_STATIONS.filter((s) => s.line === 'purple')
                .map((s) => `${toX(s.lng)},${toY(s.lat)}`)
                .join(' ')}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />

            {/* Aqua Line */}
            <polyline
              points={PUNE_METRO_STATIONS.filter((s) => s.line === 'aqua')
                .map((s) => `${toX(s.lng)},${toY(s.lat)}`)
                .join(' ')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="4,4"
              opacity="0.6"
            />

            {/* Metro Station Dots */}
            {PUNE_METRO_STATIONS.map((station) => (
              <circle
                key={station.id}
                cx={toX(station.lng)}
                cy={toY(station.lat)}
                r={station.isInterchange ? 5 : 2.5}
                fill={station.isInterchange ? '#f59e0b' : '#a1a1aa'}
              />
            ))}

            {/* Selected Route Polyline */}
            {selectedRoute && selectedRoute.coordinates.length > 1 && (
              <polyline
                points={selectedRoute.coordinates
                  .map((c) => `${toX(c[0])},${toY(c[1])}`)
                  .join(' ')}
                fill="none"
                stroke={MODE_COLORS[selectedRoute.mode] || '#10b981'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Origin Pin */}
            <g transform={`translate(${toX(origin.lng)}, ${toY(origin.lat)})`}>
              <circle r="7" fill="#059669" stroke="#ffffff" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">A</text>
            </g>

            {/* Destination Pin */}
            <g transform={`translate(${toX(destination.lng)}, ${toY(destination.lat)})`}>
              <circle r="7" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
              <text y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">B</text>
            </g>

          </svg>
        </div>

        {/* Top Overlay Notice */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-zinc-200">Pune Spatial Transit Canvas</span>
          </div>

          <div className="text-[10px] text-zinc-500 hidden sm:block">
            {origin.name.split(',')[0]} ➔ {destination.name.split(',')[0]}
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="relative z-10 bg-zinc-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#4f46e5]" />
              <span className="text-[10px]">Metro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#d97706]" />
              <span className="text-[10px]">Auto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#059669]" />
              <span className="text-[10px]">Bike</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-[#18181b] border-t border-zinc-500" />
              <span className="text-[10px]">Cab</span>
            </div>
          </div>
          <span className="text-[10px] text-zinc-500">
            Add <code className="text-zinc-300">VITE_MAPBOX_TOKEN</code> in .env for live tiles
          </span>
        </div>

      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] sm:h-full min-h-[380px] bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
