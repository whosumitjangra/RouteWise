import { LocationPoint, RouteLeg, TransportModeType } from '../types';
import { haversineDistance } from './airports';

export interface OSRMRouteResult {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lat, lng]
  legs: RouteLeg[];
  isSyntheticFallback: boolean;
}

/**
 * Fetch driving or walking routing from OSRM with graceful synthetic curve fallback.
 */
export async function fetchOSRMRoute(
  origin: LocationPoint,
  destination: LocationPoint,
  profile: 'driving' | 'walking' | 'bicycling' = 'driving'
): Promise<OSRMRouteResult> {
  const osrmProfile = profile === 'bicycling' ? 'driving' : profile; // public osrm has driving & walking
  const url = `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RouteWise-App/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = +(route.distance / 1000).toFixed(1);
        const durationMinutes = Math.round(route.duration / 60);

        // OSRM coordinates are [lng, lat] -> Leaflet requires [lat, lng]
        const rawCoords: [number, number][] = route.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);
        
        // Sample down polyline if too dense (> 400 points) to optimize Leaflet render
        const coordinates = samplePolyline(rawCoords, 300);

        // Extract steps for legs
        const legs: RouteLeg[] = [];
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          const steps = route.legs[0].steps;
          // Group steps into major legs
          const stepCount = steps.length;
          const chunkSize = Math.max(1, Math.floor(stepCount / 4));
          
          for (let i = 0; i < stepCount; i += chunkSize) {
            const step = steps[i];
            const maneuver = step.maneuver ? step.maneuver.instruction || step.maneuver.type : 'Continue';
            const name = step.name || 'Main thoroughfare';
            legs.push({
              id: `leg-${i}`,
              mode: profile as TransportModeType,
              title: `${maneuver} onto ${name}`,
              instruction: `Follow ${name} for ${Math.round(step.distance / 1000)} km`,
              durationMinutes: Math.max(1, Math.round(step.duration / 60)),
              distanceKm: +(step.distance / 1000).toFixed(1),
              cost: 0,
            });
          }
        }

        if (legs.length === 0) {
          legs.push({
            id: 'leg-main',
            mode: profile as TransportModeType,
            title: profile === 'driving' ? 'Standard Highway Route' : 'Walking Pathway',
            instruction: `Direct route from ${origin.name} to ${destination.name}`,
            durationMinutes,
            distanceKm,
            cost: 0,
          });
        }

        return {
          distanceKm,
          durationMinutes,
          coordinates,
          legs,
          isSyntheticFallback: false,
        };
      }
    }
  } catch (err) {
    // Silently proceed to synthetic fallback
  }

  // Deterministic Synthetic Graph Fallback
  return generateSyntheticRoute(origin, destination, profile);
}

/**
 * Generate a realistic multi-segment path along natural road network curves
 */
export function generateSyntheticRoute(
  origin: LocationPoint,
  destination: LocationPoint,
  profile: 'driving' | 'walking' | 'bicycling' = 'driving'
): OSRMRouteResult {
  const directDist = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  
  // Circuity factor for realistic road detours
  const circuity = profile === 'walking' ? 1.18 : profile === 'bicycling' ? 1.22 : 1.28;
  const distanceKm = +(directDist * circuity).toFixed(1);

  // Speed heuristics
  let avgSpeedKmh = 65; // driving default
  if (profile === 'walking') avgSpeedKmh = 4.8;
  else if (profile === 'bicycling') avgSpeedKmh = 16.0;
  else if (distanceKm < 15) avgSpeedKmh = 32; // urban driving
  else if (distanceKm > 100) avgSpeedKmh = 88; // highway driving

  const durationMinutes = Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));

  // Generate intermediate curved points between origin and destination
  const numPoints = Math.min(60, Math.max(12, Math.round(distanceKm / 5)));
  const coordinates: [number, number][] = [];

  const latDiff = destination.lat - origin.lat;
  const lngDiff = destination.lng - origin.lng;

  // Pseudo-random offset based on coordinates to remain 100% deterministic
  const seed = Math.sin(origin.lat * 100 + destination.lng * 100);
  const perpOffset = (Math.abs(seed) % 0.08) - 0.04;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Bezier-like curve deflection
    const arc = Math.sin(t * Math.PI) * perpOffset;
    const lat = origin.lat + t * latDiff + arc;
    const lng = origin.lng + t * lngDiff + arc * 0.7;
    coordinates.push([+lat.toFixed(5), +lng.toFixed(5)]);
  }

  const legs: RouteLeg[] = [
    {
      id: 'leg-start',
      mode: profile as TransportModeType,
      title: `Depart from ${origin.name.split(',')[0]}`,
      instruction: `Head toward major arterial connector`,
      durationMinutes: Math.round(durationMinutes * 0.2),
      distanceKm: +(distanceKm * 0.15).toFixed(1),
      cost: 0,
    },
    {
      id: 'leg-mid',
      mode: profile as TransportModeType,
      title: profile === 'driving' ? 'Interstate / Express Corridor' : 'City Pedestrian Grid',
      instruction: `Continue on main corridor for ${Math.round(distanceKm * 0.7)} km`,
      durationMinutes: Math.round(durationMinutes * 0.6),
      distanceKm: +(distanceKm * 0.7).toFixed(1),
      cost: 0,
    },
    {
      id: 'leg-end',
      mode: profile as TransportModeType,
      title: `Arrive at ${destination.name.split(',')[0]}`,
      instruction: `Take exit and navigate to final arrival point`,
      durationMinutes: Math.round(durationMinutes * 0.2),
      distanceKm: +(distanceKm * 0.15).toFixed(1),
      cost: 0,
    },
  ];

  return {
    distanceKm,
    durationMinutes,
    coordinates,
    legs,
    isSyntheticFallback: true,
  };
}

function samplePolyline(coords: [number, number][], maxPoints: number): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  const step = Math.ceil(coords.length / maxPoints);
  const result: [number, number][] = [];
  for (let i = 0; i < coords.length; i += step) {
    result.push(coords[i]);
  }
  // Ensure destination is included
  if (result[result.length - 1] !== coords[coords.length - 1]) {
    result.push(coords[coords.length - 1]);
  }
  return result;
}
