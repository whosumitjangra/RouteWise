import { LocationPoint } from '../types';
import { PUNE_LANDMARKS, PuneLandmarkWithAliases } from '../config/puneLandmarks';
import { PUNE_METRO_STATIONS } from '../config/metroData';
import { OUT_OF_TOWN_CITIES, matchOutOfTownCity } from '../config/outOfTownCities';

export interface RoadRouteResult {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lng, lat]
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
 * Normalize search strings for fuzzy Indian place name matching
 */
function cleanQuery(str: string): string {
  return str
    .toLowerCase()
    .replace(/[,\.\-\(\)\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search Pune locations with 3-tier cascade:
 * 1. Curated Pune Landmark Catalog & Aliases (instant local matches for AIT, Pune Junction, COEP, etc.)
 * 2. Pune Metro Stations
 * 3. OpenStreetMap Nominatim Live Geocoder (Zero key required, finds any Pune colony/street)
 * 4. Mapbox Geocoding API (if token provided)
 */
export async function searchPuneLocations(rawQuery: string): Promise<LocationPoint[]> {
  const q = cleanQuery(rawQuery);
  if (!q || q.length < 2) return [];

  const matchedPoints: LocationPoint[] = [];

  // Tier 0: Out-of-Town Cities & Getaways (Lonavala, Khandala, Mumbai, etc.)
  for (const city of OUT_OF_TOWN_CITIES) {
    const cityName = cleanQuery(city.name);
    const hasAliasMatch = city.aliases.some((alias) => {
      const a = cleanQuery(alias);
      return q.includes(a) || a.includes(q) || levenshteinDistance(q, a) <= 1;
    });

    if (cityName.includes(q) || q.includes(cityName) || hasAliasMatch) {
      if (!matchedPoints.some((p) => p.name.includes(city.name))) {
        matchedPoints.push({
          name: `${city.name}, ${city.state}`,
          lat: city.lat,
          lng: city.lng,
          landmarkType: 'out_of_town',
          isOutOfTown: true,
          cityName: city.name,
        });
      }
    }
  }

  // Tier 1: Local curated Pune landmarks with fuzzy aliases
  for (const item of PUNE_LANDMARKS) {
    const itemName = cleanQuery(item.name);
    const hasAliasMatch = item.aliases.some((alias) => {
      const a = cleanQuery(alias);
      return q.includes(a) || a.includes(q) || levenshteinDistance(q, a) <= 2;
    });

    if (itemName.includes(q) || q.includes(itemName) || hasAliasMatch) {
      if (!matchedPoints.some((p) => p.name === item.name)) {
        matchedPoints.push({
          name: item.name,
          lat: item.lat,
          lng: item.lng,
          landmarkType: item.landmarkType,
        });
      }
    }
  }

  // Tier 2: Search Pune Metro stations
  for (const station of PUNE_METRO_STATIONS) {
    const sName = cleanQuery(station.name);
    if (sName.includes(q) || q.includes(sName) || station.marathiName.includes(rawQuery)) {
      if (!matchedPoints.some((p) => p.name.includes(station.name))) {
        matchedPoints.push({
          name: `${station.name} (${station.line === 'purple' ? 'Purple Line' : 'Aqua Line'})`,
          lat: station.lat,
          lng: station.lng,
          landmarkType: 'metro',
        });
      }
    }
  }

  // Tier 3: Mapbox Geocoding (if token is available and no local matches found)
  if (matchedPoints.length === 0 && hasValidMapboxToken()) {
    try {
      const token = getMapboxToken();
      const bbox = '73.65,18.35,74.15,18.75';
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        rawQuery
      )}.json?access_token=${token}&country=IN&bbox=${bbox}&limit=5&types=poi,address,neighborhood,locality`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          for (const feat of data.features) {
            const cleanName = feat.place_name.replace(', Maharashtra, India', '').replace(', India', '');
            if (!matchedPoints.some((p) => Math.abs(p.lat - feat.center[1]) < 0.005 && Math.abs(p.lng - feat.center[0]) < 0.005)) {
              matchedPoints.push({
                name: cleanName,
                lat: feat.center[1],
                lng: feat.center[0],
                landmarkType: 'commercial',
              });
            }
          }
        }
      }
    } catch (e) {
      // Continue to OSM Nominatim
    }
  }

  // Tier 4: OpenStreetMap Nominatim Live Geocoding (Only if zero local matches found, with strict 1.5s timeout)
  if (matchedPoints.length === 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const osmQuery = `${rawQuery}, Pune, Maharashtra`;
      const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        osmQuery
      )}&limit=4&countrycodes=in&viewbox=73.65,18.75,74.15,18.35`;

      const res = await fetch(osmUrl, {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const shortName = item.display_name.split(',').slice(0, 3).join(', ');
          
          if (!matchedPoints.some((p) => Math.abs(p.lat - lat) < 0.005 && Math.abs(p.lng - lng) < 0.005)) {
            matchedPoints.push({
              name: shortName,
              lat,
              lng,
              landmarkType: 'commercial',
            });
          }
        }
      }
    } catch (e) {
      // Fallback completed
    }
  }

  return matchedPoints.slice(0, 7);
}

/**
 * Resolves any raw query string into a concrete LocationPoint
 * Used when the user submits without selecting from dropdown
 */
export async function resolveLocationQuery(query: string, fallbackDefault: LocationPoint): Promise<LocationPoint> {
  if (!query || query.trim().length === 0) return fallbackDefault;

  // If query already matches fallback name, return it
  if (cleanQuery(query) === cleanQuery(fallbackDefault.name)) {
    return fallbackDefault;
  }

  // Check if query is an out-of-town city (e.g. Lonavala, Mumbai)
  const outOfTownCity = matchOutOfTownCity(query);
  if (outOfTownCity) {
    return {
      name: `${outOfTownCity.name}, ${outOfTownCity.state}`,
      lat: outOfTownCity.lat,
      lng: outOfTownCity.lng,
      landmarkType: 'out_of_town',
      isOutOfTown: true,
      cityName: outOfTownCity.name,
    };
  }

  const qClean = cleanQuery(query);

  // Instant local landmark resolution
  const landmarkMatch = PUNE_LANDMARKS.find((p) => {
    const pClean = cleanQuery(p.name);
    return (
      pClean === qClean ||
      pClean.includes(qClean) ||
      qClean.includes(pClean) ||
      p.aliases.some((a) => {
        const aClean = cleanQuery(a);
        return aClean === qClean || qClean.includes(aClean) || aClean.includes(qClean);
      })
    );
  });
  if (landmarkMatch) {
    return {
      name: landmarkMatch.name,
      lat: landmarkMatch.lat,
      lng: landmarkMatch.lng,
      landmarkType: landmarkMatch.landmarkType,
    };
  }

  // Instant metro station resolution
  const metroMatch = PUNE_METRO_STATIONS.find((s) => {
    const sClean = cleanQuery(s.name);
    return sClean === qClean || sClean.includes(qClean) || qClean.includes(sClean);
  });
  if (metroMatch) {
    return {
      name: `${metroMatch.name} (${metroMatch.line === 'purple' ? 'Purple Line' : 'Aqua Line'})`,
      lat: metroMatch.lat,
      lng: metroMatch.lng,
      landmarkType: 'metro',
    };
  }

  const results = await searchPuneLocations(query);
  if (results && results.length > 0) {
    return results[0];
  }

  return fallbackDefault;
}

/**
 * Fetch road route distance, duration and geometry
 */
export async function getRoadRoute(
  origin: LocationPoint,
  destination: LocationPoint,
  profile: 'driving-traffic' | 'driving' | 'cycling' | 'walking' = 'driving-traffic'
): Promise<RoadRouteResult> {
  // If Mapbox token is present, try Directions API
  if (hasValidMapboxToken()) {
    try {
      const token = getMapboxToken();
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=geojson&overview=full&access_token=${token}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

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
      // Fall through to spatial routing
    }
  }

  // Real-world Pune road circuity calculation
  const straightLine = haversineDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const circuity = profile === 'walking' ? 1.18 : 1.28;
  const distanceKm = +(straightLine * circuity).toFixed(1);

  // Pune traffic speeds
  let avgSpeedKmh = 26; // Pune city arterial average
  if (profile === 'cycling') avgSpeedKmh = 28; // Bike taxi filters traffic
  else if (profile === 'walking') avgSpeedKmh = 4.8;
  else if (distanceKm > 14) avgSpeedKmh = 33; // Highway bypass

  const durationMinutes = Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));

  // Intermediate road geometry
  const coordinates: [number, number][] = [];
  const pointsCount = Math.min(40, Math.max(8, Math.round(distanceKm * 2.5)));
  const dLng = destination.lng - origin.lng;
  const dLat = destination.lat - origin.lat;
  const deflection = Math.sin(origin.lat * 40 + destination.lng * 40) * 0.007;

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

/**
 * Levenshtein distance for typo tolerance (e.g. 'junctin' -> 'junction')
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
