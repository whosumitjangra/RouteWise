import { LocationPoint } from '../types';
import { PUNE_LANDMARKS } from '../config/puneLandmarks';
import { PUNE_METRO_STATIONS } from '../config/metroData';

export interface RoadRouteResult {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lng, lat] for Mapbox
  isEstimatedFallback: boolean;
}

export function getMapboxToken(): string {
  const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
  return typeof token === 'string' ? token.trim() : '';
}

export function hasValidMapboxToken(): boolean {
  const token = getMapboxToken();
  return token.length > 20 && token.startsWith('pk.');
}

/**
 * Spatial Haversine distance in kilometers
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Search Pune addresses and landmarks with Mapbox Geocoding
 * Falls back seamlessly to local Pune landmarks directory
 */
export async function searchPuneLocations(query: string): Promise<LocationPoint[]> {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const matchedLocal: LocationPoint[] = [];

  // Search curated Pune landmarks
  for (const item of PUNE_LANDMARKS) {
    if (item.name.toLowerCase().includes(q)) {
      matchedLocal.push(item);
    }
  }

  // Search Pune Metro stations
  for (const station of PUNE_METRO_STATIONS) {
    if (
      station.name.toLowerCase().includes(q) ||
      station.marathiName.includes(q)
    ) {
      matchedLocal.push({
        name: `${station.name} (${station.line === 'purple' ? 'Purple Line' : 'Aqua Line'})`,
        lat: station.lat,
        lng: station.lng,
        landmarkType: 'metro',
      });
    }
  }

  // If Mapbox token is available, query Mapbox Geocoding API bounded to Pune
  if (hasValidMapboxToken()) {
    try {
      const token = getMapboxToken();
      // Pune metropolitan bounding box: [minLng, minLat, maxLng, maxLat]
      const bbox = '73.65,18.35,74.15,18.75';
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${token}&country=IN&bbox=${bbox}&limit=5&types=poi,address,neighborhood,locality`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const apiResults: LocationPoint[] = data.features.map((feat: any) => ({
            name: feat.place_name.replace(', Maharashtra, India', '').replace(', India', ''),
            lat: feat.center[1],
            lng: feat.center[0],
            landmarkType: 'commercial',
          }));

          // Merge without exact duplicates
          const combined = [...apiResults];
          for (const local of matchedLocal) {
            if (!combined.some((c) => Math.abs(c.lat - local.lat) < 0.005 && Math.abs(c.lng - local.lng) < 0.005)) {
              combined.push(local);
            }
          }
          return combined.slice(0, 7);
        }
      }
    } catch (e) {
      // Return local matches on network error
    }
  }

  return matchedLocal.slice(0, 7);
}

/**
 * Fetch road route distance, duration and geometry from Mapbox Directions API
 * Gracefully falls back to deterministic road detour calculation
 */
export async function getRoadRoute(
  origin: LocationPoint,
  destination: LocationPoint,
  profile: 'driving-traffic' | 'driving' | 'cycling' | 'walking' = 'driving-traffic'
): Promise<RoadRouteResult> {
  if (hasValidMapboxToken()) {
    try {
      const token = getMapboxToken();
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&overview=full&access_token=${token}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          return {
            distanceKm: +(route.distance / 1000).toFixed(1),
            durationMinutes: Math.max(1, Math.round(route.duration / 60)),
            coordinates: route.geometry.coordinates as [number, number][],
            isEstimatedFallback: false,
          };
        }
      }
    } catch (e) {
      // Proceed to deterministic fallback
    }
  }

  // Deterministic Spatial Graph Fallback for Pune road network
  const straightLine = haversineDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  
  // Real-world Pune road circuity factors (accounting for rivers, bridges, highway flyovers)
  const circuity = profile === 'walking' ? 1.18 : 1.28;
  const distanceKm = +(straightLine * circuity).toFixed(1);

  // Speed assumptions based on mode in Pune traffic conditions
  let avgSpeedKmh = 26; // Pune city car traffic average
  if (profile === 'cycling') avgSpeedKmh = 28; // Bike taxi filters through traffic bottlenecks
  else if (profile === 'walking') avgSpeedKmh = 4.8;
  else if (distanceKm > 15) avgSpeedKmh = 34; // Outer ring / bypass expressway

  const durationMinutes = Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));

  // Generate smooth intermediate road geometry between origin and destination
  const coordinates: [number, number][] = [];
  const pointsCount = Math.min(45, Math.max(10, Math.round(distanceKm * 3)));
  
  const dLng = destination.lng - origin.lng;
  const dLat = destination.lat - origin.lat;

  // Gentle natural curve offset
  const deflection = Math.sin(origin.lat * 50 + destination.lng * 50) * 0.008;

  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    const arc = Math.sin(t * Math.PI) * deflection;
    const lng = origin.lng + t * dLng + arc;
    const lat = origin.lat + t * dLat + arc * 0.6;
    coordinates.push([+lng.toFixed(5), +lat.toFixed(5)]);
  }

  return {
    distanceKm,
    durationMinutes,
    coordinates,
    isEstimatedFallback: true,
  };
}
