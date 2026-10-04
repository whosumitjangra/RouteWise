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

const TYPO_MAP: Record<string, string> = {
  lheogaon: 'lohegaon',
  lohgaon: 'lohegaon',
  lohegao: 'lohegaon',
  lhegaon: 'lohegaon',
  lahogaon: 'lohegaon',
  kotrud: 'kothrud',
  kothrod: 'kothrud',
  hadpsar: 'hadapsar',
  hadapser: 'hadapsar',
  hinjwadi: 'hinjewadi',
  hnjewadi: 'hinjewadi',
  wakkad: 'wakad',
  wkad: 'wakad',
  vimannagar: 'viman nagar',
  vimanngr: 'viman nagar',
  khradi: 'kharadi',
  digh: 'dighi',
  digi: 'dighi',
  alndi: 'alandi',
  shwaji: 'shivajinagar',
  swargat: 'swargate',
  swarget: 'swargate',
  decan: 'deccan',
  bhosri: 'bhosari',
  ngdi: 'nigdi',
  ktrj: 'katraj',
  aund: 'aundh',
  yerwada: 'yerawada',
  kondwa: 'kondhwa',
};

function normalizeQueryWithTypos(raw: string): string[] {
  const cleaned = cleanQuery(raw);
  const variants = new Set<string>([cleaned]);

  const tokens = cleaned.split(/\s+/);
  const correctedTokens = tokens.map((t) => TYPO_MAP[t] || t);
  const corrected = correctedTokens.join(' ');
  if (corrected !== cleaned) {
    variants.add(corrected);
  }

  for (const [typo, fix] of Object.entries(TYPO_MAP)) {
    if (cleaned.includes(typo)) {
      variants.add(cleaned.replace(new RegExp(typo, 'g'), fix));
    }
  }

  return Array.from(variants);
}

function matchesFuzzyToken(queryVariants: string[], targetName: string, aliases: string[]): boolean {
  const t = cleanQuery(targetName);
  const allTargetAliases = aliases.map(cleanQuery);
  const allTargetTexts = [t, ...allTargetAliases];

  for (const q of queryVariants) {
    if (!q) continue;

    // 1. Direct substring match in target name or any alias
    if (allTargetTexts.some((text) => text.includes(q) || q.includes(text))) {
      return true;
    }

    // 2. Word-level token match with Levenshtein tolerance
    const qTokens = q.split(/\s+/).filter((tok) => tok.length >= 2);
    const targetWords = allTargetTexts.join(' ').split(/\s+/).filter((tok) => tok.length >= 2);

    const matchesAllTokens = qTokens.every((qTok) =>
      targetWords.some(
        (tWord) =>
          tWord.includes(qTok) ||
          qTok.includes(tWord) ||
          (qTok.length >= 4 && tWord.length >= 4 && levenshteinDistance(qTok, tWord) <= 2)
      )
    );

    if (matchesAllTokens) return true;
  }

  return false;
}

/**
 * Search Pune locations with rich multi-tier cascade:
 * 1. Out-of-town cities & getaways
 * 2. Curated Pune Landmark Catalog & Aliases with fuzzy typo matching
 * 3. Pune Metro Stations
 * 4. Mapbox Geocoding API (discovers sub-streets, colonies, societies)
 * 5. OpenStreetMap Nominatim Live Geocoder
 */
export async function searchPuneLocations(rawQuery: string): Promise<LocationPoint[]> {
  const q = cleanQuery(rawQuery);
  if (!q || q.length < 2) return [];

  const queryVariants = normalizeQueryWithTypos(rawQuery);
  const matchedPoints: LocationPoint[] = [];

  const isDuplicate = (lat: number, lng: number, name: string) => {
    return matchedPoints.some(
      (p) =>
        (Math.abs(p.lat - lat) < 0.003 && Math.abs(p.lng - lng) < 0.003) ||
        cleanQuery(p.name) === cleanQuery(name)
    );
  };

  // Tier 0: Out-of-Town Cities & Getaways
  for (const city of OUT_OF_TOWN_CITIES) {
    const cityName = cleanQuery(city.name);
    const hasAliasMatch = city.aliases.some((alias) => {
      const a = cleanQuery(alias);
      return queryVariants.some((qv) => qv.includes(a) || a.includes(qv) || levenshteinDistance(qv, a) <= 1);
    });

    if (queryVariants.some((qv) => cityName.includes(qv) || qv.includes(cityName)) || hasAliasMatch) {
      if (!isDuplicate(city.lat, city.lng, city.name)) {
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

  // Tier 1: Local curated Pune landmarks with fuzzy aliases & token matching
  for (const item of PUNE_LANDMARKS) {
    if (matchesFuzzyToken(queryVariants, item.name, item.aliases)) {
      if (!isDuplicate(item.lat, item.lng, item.name)) {
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
    if (
      queryVariants.some((qv) => sName.includes(qv) || qv.includes(sName)) ||
      station.marathiName.includes(rawQuery)
    ) {
      const stationFullName = `${station.name} (${station.line === 'purple' ? 'Purple Line' : 'Aqua Line'})`;
      if (!isDuplicate(station.lat, station.lng, stationFullName)) {
        matchedPoints.push({
          name: stationFullName,
          lat: station.lat,
          lng: station.lng,
          landmarkType: 'metro',
        });
      }
    }
  }

  // Tier 3: Mapbox Geocoding (always query in background to discover sub-streets/colonies)
  if (hasValidMapboxToken()) {
    try {
      const token = getMapboxToken();
      const bbox = '73.65,18.35,74.15,18.75';
      const searchTerm = queryVariants[queryVariants.length - 1] || rawQuery;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchTerm
      )}.json?access_token=${token}&country=IN&bbox=${bbox}&limit=8&types=poi,address,neighborhood,locality`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1600);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          for (const feat of data.features) {
            const cleanName = feat.place_name.replace(', Maharashtra, India', '').replace(', India', '');
            const lat = feat.center[1];
            const lng = feat.center[0];
            if (!isDuplicate(lat, lng, cleanName)) {
              matchedPoints.push({
                name: cleanName,
                lat,
                lng,
                landmarkType: 'commercial',
              });
            }
          }
        }
      }
    } catch (e) {
      // Continue silently
    }
  }

  // Tier 4: OpenStreetMap Nominatim Live Geocoding (if results are fewer than 8)
  if (matchedPoints.length < 8) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1400);
      const searchTerm = queryVariants[queryVariants.length - 1] || rawQuery;
      const osmQuery = `${searchTerm}, Pune, Maharashtra`;
      const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        osmQuery
      )}&limit=6&countrycodes=in&viewbox=73.65,18.75,74.15,18.35`;

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
          
          if (!isDuplicate(lat, lng, shortName)) {
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

  return matchedPoints.slice(0, 16);
}

/**
 * Resolves any raw query string into a concrete LocationPoint
 * Used when the user submits without selecting from dropdown
 */
export async function resolveLocationQuery(query: string, fallbackDefault?: LocationPoint): Promise<LocationPoint> {
  const safeFallback: LocationPoint = fallbackDefault || {
    name: 'Pune, Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
  };

  if (!query || query.trim().length === 0) return safeFallback;

  const qClean = cleanQuery(query);

  if (fallbackDefault && cleanQuery(fallbackDefault.name) === qClean) {
    return fallbackDefault;
  }

  const queryVariants = normalizeQueryWithTypos(query);

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

  // Check PUNE_LANDMARKS with fuzzy matching
  const landmarkMatch = PUNE_LANDMARKS.find((p) =>
    matchesFuzzyToken(queryVariants, p.name, p.aliases)
  );
  if (landmarkMatch) {
    return {
      name: landmarkMatch.name,
      lat: landmarkMatch.lat,
      lng: landmarkMatch.lng,
      landmarkType: landmarkMatch.landmarkType,
    };
  }

  // Check Pune Metro stations
  const metroMatch = PUNE_METRO_STATIONS.find((s) => {
    const sClean = cleanQuery(s.name);
    return queryVariants.some((qv) => sClean.includes(qv) || qv.includes(sClean));
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

  return safeFallback;
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
