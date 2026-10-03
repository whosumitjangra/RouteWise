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

      // Integrate Mapbox Streets-v12 crystal-clear Retina @2x tiles using user's token
      const token = getMapboxToken();
      const tileUrl = hasValidMapboxToken()
        ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        tileSize: 512,
        zoomOffset: -1,
        detectRetina: true,
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    renderMapData();
  }, [origin, destination, routes, selectedRouteId]);

  const renderMapData = () => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    polylinesRef.current = {};

    const allLatLngs: L.LatLngExpression[] = [];

    // 1. Draw Pune Metro network corridors in background (Purple & Aqua Lines)
    const purpleCoords = PUNE_METRO_STATIONS.filter((s) => s.line === 'purple').map(
      (s) => [s.lat, s.lng] as [number, number]
    );
    L.polyline(purpleCoords, {
      color: '#7c3aed',
      weight: 3,
      opacity: 0.35,
      dashArray: '4, 4',
    }).addTo(group);

    const aquaCoords = PUNE_METRO_STATIONS.filter((s) => s.line === 'aqua').map(
      (s) => [s.lat, s.lng] as [number, number]
    );
    L.polyline(aquaCoords, {
      color: '#0891b2',
      weight: 3,
      opacity: 0.35,
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
            font-size: 11px; 
            font-weight: 700; 
            padding: 3px 8px; 
            border-radius: 6px; 
            border: 1px solid #10b981; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.15); 
            white-space: nowrap;
            margin-bottom: 3px;
          ">
            📍 Start: ${origin.name.split(',')[0].slice(0, 20)}
          </div>
          <div style="
            background-color: #059669; 
            color: white; 
            width: 24px; 
            height: 24px; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            border: 2px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-weight: 800; font-size: 11px;">A</span>
          </div>
        </div>
      `,
      iconSize: [130, 52],
      iconAnchor: [65, 52],
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
            font-size: 11px; 
            font-weight: 700; 
            padding: 3px 8px; 
            border-radius: 6px; 
            border: 1px solid #f43f5e; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.15); 
            white-space: nowrap;
            margin-bottom: 3px;
          ">
            🏁 Destination: ${destination.name.split(',')[0].slice(0, 20)}
          </div>
          <div style="
            background-color: #e11d48; 
            color: white; 
            width: 24px; 
            height: 24px; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            border: 2px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-weight: 800; font-size: 11px;">B</span>
          </div>
        </div>
      `,
      iconSize: [130, 52],
      iconAnchor: [65, 52],
    });

    const markerB = L.marker([destination.lat, destination.lng], { icon: iconDest }).addTo(group);
    markerB.bindPopup(`<strong>Destination:</strong><br/>${destination.name}`);
    allLatLngs.push([destination.lat, destination.lng]);

    // 4. Highlight Selected Route & Add Station Written Marks
    const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

    // If Metro route is selected, annotate boarding, interchange, and deboard stations
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
                padding: 3px 8px; 
                border-radius: 8px; 
                border: 1.5px solid ${badgeBorder}; 
                box-shadow: 0 3px 8px rgba(0,0,0,0.18); 
                white-space: nowrap;
                margin-bottom: 2px;
                display: flex;
                align-items: center;
                gap: 4px;
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
          iconSize: [150, 40],
          iconAnchor: [75, 40],
        });

        const stMarker = L.marker([wp.lat, wp.lng], { icon: stationIcon }).addTo(group);
        stMarker.bindPopup(`<strong>${wp.name}</strong><br/>${wp.instruction}`);
      });
    }

    // 5. Draw Feasible Routes
    // Draw unselected routes first in background
    routes.forEach((route) => {
      if (!route.isFeasible || route.coordinates.length < 2) return;
      if (route.id === selectedRouteId) return; // Selected route will be drawn on top

      const latLngs: [number, number][] = route.coordinates.map((c) => [c[1], c[0]]);
      latLngs.forEach((pt) => allLatLngs.push(pt));

      const color = MODE_COLORS[route.mode] || '#71717a';

      const polyline = L.polyline(latLngs, {
        color: color,
        weight: 2.5,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round',
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

    // Draw the SELECTED route prominently on top
    if (selectedRoute && selectedRoute.isFeasible && selectedRoute.coordinates.length >= 2) {
      if (selectedRoute.mode === 'metro_multimodal' && selectedRoute.legs.length > 0) {
        // Multi-modal breakdown: explicitly draw feeder legs across streets and metro train leg
        selectedRoute.legs.forEach((leg) => {
          if (!leg.coordinates || leg.coordinates.length < 2) return;

          const legLatLngs: [number, number][] = leg.coordinates.map((c) => [c[1], c[0]]);
          legLatLngs.forEach((pt) => allLatLngs.push(pt));

          const isFeeder = leg.isFeeder || leg.badge === 'Feeder Auto';
          const isWalking = leg.mode === 'walking';
          const isTrain = leg.mode === 'metro_multimodal';

          const legColor = isTrain
            ? leg.lineColor || '#4f46e5'
            : isWalking
            ? '#0d9488'
            : '#d97706';

          const legPolyline = L.polyline(legLatLngs, {
            color: legColor,
            weight: isTrain ? 6 : 5,
            opacity: 1.0,
            dashArray: isTrain ? undefined : '6, 6',
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(group);

          legPolyline.bindTooltip(
            `<strong>${leg.title}</strong><br/>${leg.instruction}<br/>${leg.durationMinutes} min • ${leg.distanceKm} km`,
            { sticky: true }
          );
        });
      } else {
        // Road direct routes (Auto, Cab, Walking)
        const latLngs: [number, number][] = selectedRoute.coordinates.map((c) => [c[1], c[0]]);
        latLngs.forEach((pt) => allLatLngs.push(pt));

        const color = MODE_COLORS[selectedRoute.mode] || '#71717a';

        const polyline = L.polyline(latLngs, {
          color: color,
          weight: 6,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: selectedRoute.mode === 'walking' ? '4, 4' : undefined,
        }).addTo(group);

        polyline.bindTooltip(
          `<strong>${selectedRoute.title}</strong><br/>${selectedRoute.durationMinutes} min • ₹${selectedRoute.cost.totalFare}`,
          { sticky: true }
        );

        polylinesRef.current[selectedRoute.id] = polyline;
      }
    }

    // 6. Fit bounds to comfortably display all endpoints and path
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden shadow-xs flex flex-col justify-between">
      
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Top Map Indicator */}
      <div className="relative z-10 p-3 pointer-events-none flex items-center justify-between">
        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-200/90 shadow-2xs text-[11px] font-semibold text-zinc-800 flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pune Live Street Map (Retina HD)</span>
        </div>
      </div>

      {/* Bottom Mode Legend (Bike taxi removed per user instruction) */}
      <div className="relative z-10 m-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-zinc-200/90 shadow-2xs text-xs text-zinc-700 pointer-events-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-[#4f46e5]" />
            <span className="text-[11px]">Metro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-[#d97706]" />
            <span className="text-[11px]">Auto (Feeder / City)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-[#18181b]" />
            <span className="text-[11px]">Cab</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded bg-[#0d9488]" />
            <span className="text-[11px]">Walk (&lt; 1km)</span>
          </div>
        </div>

        <span className="text-[10px] text-zinc-400">
          Click lines or cards to focus
        </span>
      </div>

    </div>
  );
};
