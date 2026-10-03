import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint, RouteOption } from '../types';
import { PUNE_METRO_STATIONS } from '../config/metroData';
import { getMapboxToken, hasValidMapboxToken } from '../services/mapbox';

interface MapViewProps {
  origin: LocationPoint;
  destination: LocationPoint;
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  isLayoutShifted?: boolean;
}

const MODE_COLORS: Record<string, string> = {
  metro_multimodal: '#4f46e5', // Indigo
  auto: '#d97706',             // Amber
  cab: '#18181b',              // Zinc
  walking: '#0d9488',          // Teal
};

export const MapView: React.FC<MapViewProps> = ({
  origin,
  destination,
  routes,
  selectedRouteId,
  onSelectRoute,
  isLayoutShifted,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylinesRef = useRef<Record<string, L.Polyline>>({});

  // Auto-recalibrate Leaflet on resize or layout shift
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 720);
    return () => clearTimeout(timer);
  }, [isLayoutShifted, selectedRouteId]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [18.5204, 73.8567],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      // Integrate Mapbox Streets-v12 high-resolution tiles using user's token, with CartoDB fallback
      const token = getMapboxToken();
      const tileUrl = hasValidMapboxToken()
        ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${token}`
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        tileSize: hasValidMapboxToken() ? 512 : 256,
        zoomOffset: hasValidMapboxToken() ? -1 : 0,
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    renderMapData();
  }, [origin, destination, routes]);

  // Update selection styles without full recreation
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

    // 1. Draw Pune Metro network corridors in background
    // Purple Line
    const purpleCoords = PUNE_METRO_STATIONS.filter((s) => s.line === 'purple').map(
      (s) => [s.lat, s.lng] as [number, number]
    );
    L.polyline(purpleCoords, {
      color: '#6366f1',
      weight: 2.5,
      opacity: 0.4,
      dashArray: '4, 4',
    }).addTo(group);

    // Aqua Line
    const aquaCoords = PUNE_METRO_STATIONS.filter((s) => s.line === 'aqua').map(
      (s) => [s.lat, s.lng] as [number, number]
    );
    L.polyline(aquaCoords, {
      color: '#06b6d4',
      weight: 2.5,
      opacity: 0.4,
      dashArray: '4, 4',
    }).addTo(group);

    // 2. Add Start Marker with written label
    const iconStart = L.divIcon({
      className: 'custom-pin-start',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
          <div style="
            background: #ffffff; 
            color: #059669; 
            font-size: 10px; 
            font-weight: 700; 
            padding: 2px 7px; 
            border-radius: 6px; 
            border: 1px solid #10b981; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.15); 
            white-space: nowrap;
            margin-bottom: 3px;
          ">
            📍 Start: ${origin.name.split(',')[0].slice(0, 18)}
          </div>
          <div style="
            background-color: #059669; 
            color: white; 
            width: 22px; 
            height: 22px; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            border: 2px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-weight: 800; font-size: 10px;">A</span>
          </div>
        </div>
      `,
      iconSize: [120, 48],
      iconAnchor: [60, 48],
    });

    const markerA = L.marker([origin.lat, origin.lng], { icon: iconStart }).addTo(group);
    markerA.bindPopup(`<strong>Start:</strong><br/>${origin.name}`);
    allLatLngs.push([origin.lat, origin.lng]);

    // 3. Add Destination Marker with written label
    const iconDest = L.divIcon({
      className: 'custom-pin-dest',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
          <div style="
            background: #ffffff; 
            color: #e11d48; 
            font-size: 10px; 
            font-weight: 700; 
            padding: 2px 7px; 
            border-radius: 6px; 
            border: 1px solid #f43f5e; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.15); 
            white-space: nowrap;
            margin-bottom: 3px;
          ">
            🏁 Destination: ${destination.name.split(',')[0].slice(0, 18)}
          </div>
          <div style="
            background-color: #e11d48; 
            color: white; 
            width: 22px; 
            height: 22px; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            border: 2px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-weight: 800; font-size: 10px;">B</span>
          </div>
        </div>
      `,
      iconSize: [120, 48],
      iconAnchor: [60, 48],
    });

    const markerB = L.marker([destination.lat, destination.lng], { icon: iconDest }).addTo(group);
    markerB.bindPopup(`<strong>Destination:</strong><br/>${destination.name}`);
    allLatLngs.push([destination.lat, destination.lng]);

    // 4. Highlight Selected Route & Add Station Written Marks
    const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

    // If Metro route is selected, annotate the exact boarding, interchange, and deboard stations!
    if (selectedRoute && selectedRoute.mode === 'metro_multimodal' && selectedRoute.stationWaypoints) {
      selectedRoute.stationWaypoints.forEach((wp) => {
        allLatLngs.push([wp.lat, wp.lng]);

        const isInterchange = wp.type === 'interchange';
        const isBoard = wp.type === 'board';
        const badgeBg = isInterchange ? '#fef3c7' : isBoard ? '#e0e7ff' : '#f0fdf4';
        const badgeColor = isInterchange ? '#b45309' : isBoard ? '#4338ca' : '#15803d';
        const badgeBorder = isInterchange ? '#f59e0b' : isBoard ? '#6366f1' : '#22c55e';
        const iconSymbol = isInterchange ? '🔄' : '🚊';

        const stationIcon = L.divIcon({
          className: 'station-callout-pin',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
              <div style="
                background: ${badgeBg}; 
                color: ${badgeColor}; 
                font-size: 10px; 
                font-weight: 700; 
                padding: 2.5px 8px; 
                border-radius: 8px; 
                border: 1.5px solid ${badgeBorder}; 
                box-shadow: 0 3px 8px rgba(0,0,0,0.18); 
                white-space: nowrap;
                margin-bottom: 2px;
                display: flex;
                align-items: center;
                gap: 3px;
              ">
                <span>${iconSymbol}</span>
                <span>${wp.name}</span>
              </div>
              <div style="
                width: 10px; 
                height: 10px; 
                border-radius: 50%; 
                background: ${badgeBorder}; 
                border: 2px solid white;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
              "></div>
            </div>
          `,
          iconSize: [140, 36],
          iconAnchor: [70, 36],
        });

        const stMarker = L.marker([wp.lat, wp.lng], { icon: stationIcon }).addTo(group);
        stMarker.bindPopup(`<strong>${wp.name}</strong><br/>${wp.instruction}`);
      });
    }

    // 5. Draw Polylines for Feasible Route Alternatives
    routes.forEach((route) => {
      if (!route.isFeasible || route.coordinates.length < 2) return;

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

    // 6. Fit bounds to comfortably display all endpoints and path
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14 });
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-full min-h-[380px] bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden shadow-xs flex flex-col justify-between">
      
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Top Map Indicator */}
      <div className="relative z-10 p-3 pointer-events-none flex items-center justify-between">
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-200/90 shadow-2xs text-[11px] font-semibold text-zinc-800 flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pune Live Map (Mapbox Integrated)</span>
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
