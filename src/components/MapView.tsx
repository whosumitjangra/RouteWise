import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPoint, RouteOption } from '../types';
import { PUNE_METRO_STATIONS } from '../config/metroData';
import { getMapboxToken, hasValidMapboxToken, searchPuneLocationsWithStatus } from '../services/mapbox';
import { Search, MapPin, Crosshair, Plus, Minus, Layers, Loader2 } from 'lucide-react';

interface MapViewProps {
  origin: LocationPoint;
  destination: LocationPoint;
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  focusedLocation?: LocationPoint | null;
  onSetOrigin?: (loc: LocationPoint) => void;
  onSetDestination?: (loc: LocationPoint) => void;
  onSelectSearchLocation?: (loc: LocationPoint) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  origin,
  destination,
  routes,
  selectedRouteId,
  onSelectRoute,
  focusedLocation,
  onSetOrigin,
  onSetDestination,
  onSelectSearchLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylinesRef = useRef<Record<string, L.Polyline>>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Floating Search State
  const [mapSearch, setMapSearch] = useState('');
  const [mapSuggestions, setMapSuggestions] = useState<LocationPoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tileMode, setTileMode] = useState<'streets' | 'satellite'>('streets');

  // Auto-recalibrate Leaflet on resize
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
    mapInstanceRef.current.invalidateSize();
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedRouteId]);

  // Center and fly to focused location when selected from search
  useEffect(() => {
    if (!focusedLocation || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([focusedLocation.lat, focusedLocation.lng], 15, {
      duration: 1.2,
    });
  }, [focusedLocation]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [18.5350, 73.8567],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      const token = getMapboxToken();
      const tileUrl = hasValidMapboxToken()
        ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        tileSize: 512,
        zoomOffset: -1,
        detectRetina: true,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    renderMapData();
  }, [origin, destination, routes, selectedRouteId, focusedLocation]);

  const toggleTileMode = () => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const newMode = tileMode === 'streets' ? 'satellite' : 'streets';
    setTileMode(newMode);

    const token = getMapboxToken();
    let newUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';
    if (hasValidMapboxToken()) {
      newUrl = newMode === 'satellite'
        ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`
        : `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`;
    }

    tileLayerRef.current.setUrl(newUrl);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapInstanceRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
        },
        () => {
          mapInstanceRef.current?.flyTo([origin.lat, origin.lng], 14);
        }
      );
    }
  };

  const handleMapSearchChange = async (val: string) => {
    setMapSearch(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      setIsSearchOpen(true);
      const { results } = await searchPuneLocationsWithStatus(val);
      setMapSuggestions(results);
      setIsSearching(false);
    } else {
      setMapSuggestions([]);
      setIsSearchOpen(false);
    }
  };

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
      weight: 2.5,
      opacity: 0.25,
      dashArray: '4, 4',
    }).addTo(group);

    const aquaCoords = PUNE_METRO_STATIONS.filter((s) => s.line === 'aqua').map(
      (s) => [s.lat, s.lng] as [number, number]
    );
    L.polyline(aquaCoords, {
      color: '#0891b2',
      weight: 2.5,
      opacity: 0.25,
      dashArray: '4, 4',
    }).addTo(group);

    // 2. Add Start Marker with written label matching screenshot (Green circle + "AIT Pune")
    const iconStart = L.divIcon({
      className: 'custom-pin-start',
      html: `
        <div style="display: flex; align-items: center; gap: 6px; pointer-events: auto; cursor: pointer;">
          <div style="
            width: 22px; 
            height: 22px; 
            border-radius: 50%; 
            background: #0d5c46; 
            border: 2.5px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: white;"></div>
          </div>
          <div style="
            background: white; 
            color: #18181b; 
            font-size: 11px; 
            font-weight: 800; 
            padding: 3px 8px; 
            border-radius: 6px; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.15); 
            white-space: nowrap;
            border: 1px solid #10b981;
          ">
            ${origin.name.split(',')[0]}
          </div>
        </div>
      `,
      iconSize: [160, 26],
      iconAnchor: [11, 13],
    });

    const markerA = L.marker([origin.lat, origin.lng], { icon: iconStart }).addTo(group);
    markerA.bindPopup(`
      <div style="font-family: inherit; min-width: 160px;">
        <div style="font-size: 10px; font-weight: 700; color: #0d5c46; text-transform: uppercase;">📍 Start</div>
        <div style="font-size: 12px; font-weight: 700; color: #18181b; margin-top: 2px;">${origin.name}</div>
        ${origin.address ? `<div style="font-size: 11px; color: #71717a; margin-top: 2px;">${origin.address}</div>` : ''}
      </div>
    `);
    allLatLngs.push([origin.lat, origin.lng]);

    // 3. Add Destination Marker matching screenshot (Red pin + "FC Road")
    const iconDest = L.divIcon({
      className: 'custom-pin-dest',
      html: `
        <div style="display: flex; align-items: center; gap: 6px; pointer-events: auto; cursor: pointer;">
          <div style="
            width: 22px; 
            height: 22px; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg);
            background: #e11d48; 
            border: 2px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 5px; height: 5px; border-radius: 50%; background: white; transform: rotate(45deg);"></div>
          </div>
          <div style="
            background: white; 
            color: #18181b; 
            font-size: 11px; 
            font-weight: 800; 
            padding: 3px 8px; 
            border-radius: 6px; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.15); 
            white-space: nowrap;
            border: 1px solid #f43f5e;
          ">
            ${destination.name.split(',')[0]}
          </div>
        </div>
      `,
      iconSize: [160, 26],
      iconAnchor: [11, 13],
    });

    const markerB = L.marker([destination.lat, destination.lng], { icon: iconDest }).addTo(group);
    markerB.bindPopup(`
      <div style="font-family: inherit; min-width: 160px;">
        <div style="font-size: 10px; font-weight: 700; color: #e11d48; text-transform: uppercase;">🏁 Destination</div>
        <div style="font-size: 12px; font-weight: 700; color: #18181b; margin-top: 2px;">${destination.name}</div>
        ${destination.address ? `<div style="font-size: 11px; color: #71717a; margin-top: 2px;">${destination.address}</div>` : ''}
      </div>
    `);
    allLatLngs.push([destination.lat, destination.lng]);

    // 4. Add Landmark POI: Military Hospital Khadki matching screenshot
    const iconMHKhadki = L.divIcon({
      className: 'custom-pin-khadki',
      html: `
        <div style="display: flex; align-items: center; gap: 6px; pointer-events: auto; cursor: pointer;">
          <div style="
            width: 22px; 
            height: 22px; 
            border-radius: 50%; 
            background: #dc2626; 
            border: 2px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 900;
            font-size: 13px;
            line-height: 1;
          ">+</div>
          <div style="
            background: white; 
            color: #18181b; 
            font-size: 11px; 
            font-weight: 700; 
            padding: 3px 8px; 
            border-radius: 6px; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.15); 
            white-space: nowrap;
            border: 1px solid #f43f5e;
          ">
            Military Hospital Khadki
          </div>
        </div>
      `,
      iconSize: [200, 26],
      iconAnchor: [11, 13],
    });

    const markerMH = L.marker([18.5524, 73.8381], { icon: iconMHKhadki }).addTo(group);
    markerMH.bindPopup(`
      <div style="font-family: inherit;">
        <div style="font-size: 10px; font-weight: 700; color: #dc2626; text-transform: uppercase;">🏥 Military Hospital</div>
        <div style="font-size: 12px; font-weight: 700; margin-top: 2px;">Military Hospital Khadki</div>
        <div style="font-size: 11px; color: #71717a; margin-top: 2px;">Range Hill Road, Khadki Cantonment, Pune</div>
      </div>
    `);

    // 5. Draw Primary Route Polyline (Vibrant Blue #2563eb as shown in screenshot)
    const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

    if (selectedRoute && selectedRoute.coordinates.length >= 2) {
      const latLngs: [number, number][] = selectedRoute.coordinates.map((c) => [c[1], c[0]]);
      latLngs.forEach((pt) => allLatLngs.push(pt));

      // Glow / Casing line
      L.polyline(latLngs, {
        color: '#93c5fd',
        weight: 8,
        opacity: 0.6,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      // Core Vibrant Blue route line
      const polyline = L.polyline(latLngs, {
        color: '#2563eb',
        weight: 4.5,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      polyline.bindTooltip(
        `<strong>${selectedRoute.title}</strong> • ${selectedRoute.durationMinutes} min • ₹${selectedRoute.cost.totalFare}`,
        { sticky: true }
      );

      polylinesRef.current[selectedRoute.id] = polyline;
    }

    // 6. Draw Focused Location if inspecting another POI
    if (
      focusedLocation &&
      (Math.abs(focusedLocation.lat - origin.lat) >= 0.001 || Math.abs(focusedLocation.lng - origin.lng) >= 0.001) &&
      (Math.abs(focusedLocation.lat - destination.lat) >= 0.001 || Math.abs(focusedLocation.lng - destination.lng) >= 0.001)
    ) {
      const iconFocused = L.divIcon({
        className: 'custom-pin-focused',
        html: `
          <div style="display: flex; align-items: center; gap: 6px; pointer-events: auto;">
            <div style="
              width: 22px; 
              height: 22px; 
              border-radius: 50%; 
              background: #4f46e5; 
              border: 2px solid white; 
              box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: white;"></div>
            </div>
            <div style="
              background: #4f46e5; 
              color: white; 
              font-size: 11px; 
              font-weight: 700; 
              padding: 3px 8px; 
              border-radius: 6px; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.25); 
              white-space: nowrap;
            ">
              ${focusedLocation.name.split(',')[0]}
            </div>
          </div>
        `,
        iconSize: [180, 26],
        iconAnchor: [11, 13],
      });

      const markerFocused = L.marker([focusedLocation.lat, focusedLocation.lng], { icon: iconFocused }).addTo(group);
      
      const popupDiv = document.createElement('div');
      popupDiv.style.fontFamily = 'inherit';
      popupDiv.style.minWidth = '180px';
      popupDiv.innerHTML = `
        <div style="font-size: 10px; font-weight: 700; color: #4f46e5; text-transform: uppercase;">
          📍 Selected Location
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #18181b; margin-top: 2px;">
          ${focusedLocation.name}
        </div>
        ${focusedLocation.address ? `<div style="font-size: 11px; color: #71717a; margin-top: 2px;">${focusedLocation.address}</div>` : ''}
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          <button id="btn-use-start" style="flex: 1; padding: 5px 6px; font-size: 10px; font-weight: 700; background: #0d5c46; color: white; border: none; border-radius: 4px; cursor: pointer;">Use as Start</button>
          <button id="btn-use-dest" style="flex: 1; padding: 5px 6px; font-size: 10px; font-weight: 700; background: #e11d48; color: white; border: none; border-radius: 4px; cursor: pointer;">Use as Dest</button>
        </div>
      `;
      popupDiv.querySelector('#btn-use-start')?.addEventListener('click', () => {
        onSetOrigin?.(focusedLocation);
        markerFocused.closePopup();
      });
      popupDiv.querySelector('#btn-use-dest')?.addEventListener('click', () => {
        onSetDestination?.(focusedLocation);
        markerFocused.closePopup();
      });
      markerFocused.bindPopup(popupDiv).openPopup();
      allLatLngs.push([focusedLocation.lat, focusedLocation.lng]);
    }

    // 7. Adjust view
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
    }
  };

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const displayDuration = currentRoute?.durationMinutes || 12;
  const displayDistance = currentRoute?.distanceKm || 3.8;

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#eef2f6] overflow-hidden flex-1">
      
      {/* Map Container Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* 1. Floating Top Search Bar matching screenshot */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-center pointer-events-none">
        <div className="relative w-full max-w-sm pointer-events-auto">
          <div className="bg-white rounded-xl shadow-md border border-zinc-200/80 px-3.5 py-2.5 flex items-center gap-2.5">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search on map..."
              value={mapSearch}
              onChange={(e) => handleMapSearchChange(e.target.value)}
              className="w-full text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
            {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 shrink-0" />}
          </div>

          {/* Map Search Suggestions Dropdown */}
          {isSearchOpen && mapSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 max-h-56 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in z-30">
              {mapSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectSearchLocation?.(item);
                    setIsSearchOpen(false);
                    setMapSearch('');
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 flex items-start gap-2 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-900 truncate">{item.name}</div>
                    {item.address && <div className="text-[10px] text-zinc-400 truncate">{item.address}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Floating Bottom-Left Trip Summary Card matching screenshot */}
      <div className="absolute bottom-5 left-5 z-20 pointer-events-auto">
        <div className="bg-white rounded-xl shadow-lg border border-zinc-200/80 p-3 min-w-[210px] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span className="truncate max-w-[110px]">{origin.name.split(',')[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="truncate max-w-[110px]">{destination.name.split(',')[0]}</span>
            </div>
          </div>
          <div className="text-right border-l border-zinc-100 pl-3 shrink-0">
            <div className="text-xs font-bold text-zinc-900">{displayDuration} min</div>
            <div className="text-[10px] text-zinc-500">{displayDistance} km</div>
          </div>
        </div>
      </div>

      {/* 3. Floating Bottom-Right Map Controls matching screenshot */}
      <div className="absolute bottom-5 right-5 z-20 pointer-events-auto flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-md border border-zinc-200 divide-y divide-zinc-100 overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={handleLocateMe}
            title="Locate me"
            className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom in"
            className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom out"
            className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={toggleTileMode}
          title="Toggle Satellite / Streets Layer"
          className="p-2 bg-white rounded-xl shadow-md border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors flex items-center justify-center cursor-pointer"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
