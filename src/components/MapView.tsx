import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint, RouteOption } from '../types';
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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylinesRef = useRef<Record<string, L.Polyline>>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map centered on central Pune
      const map = L.map(mapContainerRef.current, {
        center: [18.5204, 73.8567],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Positron Light Tiles — Ultra-clean, Xeroxic minimal aesthetic, 100% free with zero API key
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    renderMapData();
  }, [origin, destination, routes]);

  // Update selection styles without recreating map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    Object.entries(polylinesRef.current).forEach(([routeId, polyline]) => {
      const isSelected = routeId === selectedRouteId;
      polyline.setStyle({
        weight: isSelected ? 5.5 : 2.5,
        opacity: isSelected ? 1.0 : 0.45,
      });
      if (isSelected) {
        polyline.bringToFront();
      }
    });
  }, [selectedRouteId]);

  const renderMapData = () => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    polylinesRef.current = {};

    const allLatLngs: L.LatLngExpression[] = [];

    // 1. Draw Pune Metro network faintly in the background for spatial context
    // Purple Line
    const purpleCoords = PUNE_METRO_STATIONS.filter((s) => s.line === 'purple').map(
      (s) => [s.lat, s.lng] as [number, number]
    );
    L.polyline(purpleCoords, {
      color: '#6366f1',
      weight: 2,
      opacity: 0.35,
      dashArray: '3, 4',
    }).addTo(group);

    // Aqua Line
    const aquaCoords = PUNE_METRO_STATIONS.filter((s) => s.line === 'aqua').map(
      (s) => [s.lat, s.lng] as [number, number]
    );
    L.polyline(aquaCoords, {
      color: '#06b6d4',
      weight: 2,
      opacity: 0.35,
      dashArray: '3, 4',
    }).addTo(group);

    // 2. Add Start Marker (Point A - Emerald)
    const iconStart = L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="
          background-color: #059669; 
          color: white; 
          width: 26px; 
          height: 26px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-weight: 800; font-size: 11px;">A</span>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
    });

    const markerA = L.marker([origin.lat, origin.lng], { icon: iconStart }).addTo(group);
    markerA.bindPopup(`<strong>Origin:</strong><br/>${origin.name}`);
    allLatLngs.push([origin.lat, origin.lng]);

    // 3. Add Destination Marker (Point B - Rose)
    const iconDest = L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="
          background-color: #e11d48; 
          color: white; 
          width: 26px; 
          height: 26px; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-weight: 800; font-size: 11px;">B</span>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
    });

    const markerB = L.marker([destination.lat, destination.lng], { icon: iconDest }).addTo(group);
    markerB.bindPopup(`<strong>Destination:</strong><br/>${destination.name}`);
    allLatLngs.push([destination.lat, destination.lng]);

    // 4. Draw Polylines for Feasible Route Alternatives
    routes.forEach((route) => {
      if (!route.isFeasible || route.coordinates.length < 2) return;

      // Note: route.coordinates are [lng, lat] -> Leaflet requires [lat, lng]
      const latLngs: [number, number][] = route.coordinates.map((c) => [c[1], c[0]]);
      latLngs.forEach((pt) => allLatLngs.push(pt));

      const isSelected = route.id === selectedRouteId;
      const color = MODE_COLORS[route.mode] || '#71717a';

      const polyline = L.polyline(latLngs, {
        color: color,
        weight: isSelected ? 5.5 : 2.5,
        opacity: isSelected ? 1.0 : 0.45,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: route.mode === 'metro_multimodal' ? '6, 6' : undefined,
      }).addTo(group);

      polyline.on('click', () => {
        onSelectRoute(route.id);
      });

      polyline.bindTooltip(
        `<strong>${route.title}</strong><br/>${route.durationMinutes} min • ₹${route.cost.totalFare}`,
        { sticky: true }
      );

      polylinesRef.current[route.id] = polyline;
    });

    // 5. Fit bounds to comfortably show all routes and endpoints
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-full min-h-[380px] bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden shadow-xs flex flex-col justify-between">
      
      {/* Real Interactive Leaflet Street Tile Container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Top Street Map Indicator */}
      <div className="relative z-10 p-3 pointer-events-none flex items-center justify-between">
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-200/90 shadow-2xs text-[11px] font-semibold text-zinc-800 flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pune Street & Transit Map</span>
        </div>
      </div>

      {/* Bottom Mode Legend */}
      <div className="relative z-10 m-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-200/90 shadow-2xs text-xs text-zinc-700 pointer-events-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-[#4f46e5]" />
            <span className="text-[11px]">Metro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-[#d97706]" />
            <span className="text-[11px]">Auto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-[#059669]" />
            <span className="text-[11px]">Bike</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-[#18181b]" />
            <span className="text-[11px]">Cab</span>
          </div>
        </div>

        <span className="text-[10px] text-zinc-400">
          Click lines or cards to focus
        </span>
      </div>

    </div>
  );
};
