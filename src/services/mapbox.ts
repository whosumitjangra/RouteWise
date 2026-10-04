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
  kirkee: 'khadki',
  poona: 'pune',
  cst: 'chhatrapati shivaji maharaj terminus',
  vt: 'chhatrapati shivaji maharaj terminus',
  rly: 'railway',
  stn: 'station',
  hosp: 'hospital',
  hosptl: 'hospital',
  clg: 'college',
  coll: 'college',
  univ: 'university',
  apt: 'airport',
  arpt: 'airport',
  mh: 'military hospital',
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

  // Strip natural language prepositions (e.g. "Hospitals near Khadki" -> "Hospitals Khadki")
  const stripped = cleaned
    .replace(/\b(near|in|at|around|towards|opp|opposite|beside)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped && stripped !== cleaned) {
    variants.add(stripped);
  }

  const tokens = cleaned.split(/\s+/);
  const correctedTokens = tokens.map((t) => TYPO_MAP[t] || t);
  const corrected = correctedTokens.join(' ');
  if (corrected !== cleaned) {
    variants.add(corrected);
  }

  for (const [typo, fix] of Object.entries(TYPO_MAP)) {
    const wordRegex = new RegExp(`\\b${typo}\\b`, 'g');
    if (wordRegex.test(cleaned)) {
      variants.add(cleaned.replace(wordRegex, fix));
    }
  }

  if (stripped && stripped !== cleaned) {
    for (const [typo, fix] of Object.entries(TYPO_MAP)) {
      const wordRegex = new RegExp(`\\b${typo}\\b`, 'g');
      if (wordRegex.test(stripped)) {
        variants.add(stripped.replace(wordRegex, fix));
      }
    }
  }

  // Also retain the exact raw query string
  if (raw.trim()) {
    variants.add(raw.trim());
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
export function detectLandmarkTypeAndLabel(
  name: string,
  featureType?: string,
  address?: string,
  categories?: string[]
): { landmarkType: LocationPoint['landmarkType']; categoryLabel: string } {
  const text = `${name} ${featureType || ''} ${address || ''} ${(categories || []).join(' ')}`.toLowerCase();

  if (text.includes('military hospital')) {
    return { landmarkType: 'hospital', categoryLabel: 'Military Hospital' };
  }
  if (
    text.includes('hospital') ||
    text.includes('clinic') ||
    text.includes('medical') ||
    text.includes('dispensary') ||
    text.includes('healthcare') ||
    text.includes('health centre') ||
    text.includes('nursing')
  ) {
    return { landmarkType: 'hospital', categoryLabel: 'Hospital' };
  }
  if (text.includes('metro') || text.includes('metro station')) {
    return { landmarkType: 'metro', categoryLabel: 'Metro' };
  }
  if (
    text.includes('railway') ||
    text.includes('train') ||
    text.includes('junction') ||
    text.includes('terminus') ||
    text.includes('station') ||
    text.includes('cst')
  ) {
    return { landmarkType: 'station', categoryLabel: 'Railway Station' };
  }
  if (
    text.includes('bus stand') ||
    text.includes('bus stop') ||
    text.includes('bus depot') ||
    text.includes('pmt') ||
    text.includes('pmpml') ||
    text.includes('msrtc')
  ) {
    return { landmarkType: 'bus_stand', categoryLabel: 'Bus Stand' };
  }
  if (text.includes('airport') || text.includes('aerodrome') || text.includes('aeromall')) {
    return { landmarkType: 'airport', categoryLabel: 'Airport' };
  }
  if (
    text.includes('college') ||
    text.includes('university') ||
    text.includes('institute') ||
    text.includes('school') ||
    text.includes('campus') ||
    text.includes('vidyalaya') ||
    text.includes('ait')
  ) {
    return { landmarkType: 'college', categoryLabel: 'College / School' };
  }
  if (
    text.includes('restaurant') ||
    text.includes('cafe') ||
    text.includes('pizza') ||
    text.includes('hotel') ||
    text.includes('bakery') ||
    text.includes('dining') ||
    text.includes('bar')
  ) {
    return { landmarkType: 'restaurant', categoryLabel: 'Food & Dining' };
  }
  if (
    text.includes('court') ||
    text.includes('collector') ||
    text.includes('police') ||
    text.includes('government') ||
    text.includes('rto') ||
    text.includes('cantonment') ||
    text.includes('secretariat')
  ) {
    return { landmarkType: 'government', categoryLabel: 'Govt & Cantonment' };
  }
  if (featureType === 'locality' || featureType === 'neighborhood' || featureType === 'suburb') {
    return { landmarkType: 'locality', categoryLabel: 'Locality' };
  }
  return { landmarkType: 'poi', categoryLabel: 'Landmark' };
}

export interface SearchLocationsResponse {
  results: LocationPoint[];
  status: 'ok' | 'no_results' | 'no_token' | 'api_error' | 'network_error';
  errorMessage?: string;
  source?: 'mapbox_searchbox' | 'mapbox_geocoding' | 'photon_osm' | 'local_catalogue';
}

/**
 * Search Pune and regional locations with rich multi-provider cascade:
 * 1. Mapbox Search Box API (modern place/POI search with proximity bias)
 * 2. Mapbox Geocoding v5 API fallback
 * 3. Photon (Komoot OSM full-text POI geocoder)
 * 4. Curated local catalog (Metro stations, AIT Pune, landmarks, out-of-town cities)
 */
export async function searchPuneLocationsWithStatus(rawQuery: string): Promise<SearchLocationsResponse> {
  const q = cleanQuery(rawQuery);
  if (!q || q.length < 2) {
    return { results: [], status: 'no_results' };
  }

  const token = getMapboxToken();
  const hasToken = hasValidMapboxToken();
  const queryVariants = normalizeQueryWithTypos(rawQuery);
  const matchedPoints: LocationPoint[] = [];
  let apiEncounteredError = false;
  let networkFailed = false;

  const isDuplicate = (lat: number, lng: number, name: string) => {
    const n = cleanQuery(name);
    return matchedPoints.some((p) => {
      const pName = cleanQuery(p.name);
      if (pName === n) return true;
      const isVeryClose = Math.abs(p.lat - lat) < 0.0015 && Math.abs(p.lng - lng) < 0.0015;
      return isVeryClose && (pName.includes(n) || n.includes(pName));
    });
  };

  // Tier 0: Curated Pune Landmarks, Out-of-Town Cities & Metro Stations (Zero-latency instant matching)
  for (const item of PUNE_LANDMARKS) {
    if (matchesFuzzyToken(queryVariants, item.name, item.aliases)) {
      if (!isDuplicate(item.lat, item.lng, item.name)) {
        const { landmarkType, categoryLabel } = detectLandmarkTypeAndLabel(item.name);
        matchedPoints.push({
          name: item.name,
          lat: item.lat,
          lng: item.lng,
          address: `${item.name}, Pune`,
          landmarkType: item.landmarkType || landmarkType,
          categoryLabel: categoryLabel || 'Landmark',
        });
      }
    }
  }

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
          address: `Pune Metro ${station.line === 'purple' ? 'Purple Line' : 'Aqua Line'}, Pune`,
          landmarkType: 'metro',
          categoryLabel: 'Metro Station',
        });
      }
    }
  }

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
          address: `${city.name}, Maharashtra`,
          landmarkType: 'out_of_town',
          isOutOfTown: true,
          cityName: city.name,
          categoryLabel: 'Getaway Destination',
        });
      }
    }
  }

  // Collect search terms to try (exact raw query + typo-corrected variants)
  const searchTermsToTry: string[] = [];
  if (rawQuery.trim()) searchTermsToTry.push(rawQuery.trim());
  for (const v of queryVariants) {
    if (v && !searchTermsToTry.includes(v)) {
      searchTermsToTry.push(v);
    }
  }

  // Tier 1: Modern Mapbox Search Box API (Official POI/Address Engine)
  if (hasToken) {
    try {
      for (const term of searchTermsToTry.slice(0, 2)) {
        const url = `https://api.mapbox.com/search/searchbox/v1/forward?q=${encodeURIComponent(
          term
        )}&access_token=${token}&proximity=73.8567,18.5204&country=IN&limit=10&types=poi,address,street,neighborhood,locality,place,district`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.features && Array.isArray(data.features)) {
            for (const f of data.features) {
              const name = f.properties?.name || '';
              const address = f.properties?.place_formatted || f.properties?.full_address || '';
              const featureType = f.properties?.feature_type || '';
              const categories = f.properties?.poi_category || [];
              const coords = f.geometry?.coordinates;

              if (name && coords && coords.length >= 2) {
                const lng = coords[0];
                const lat = coords[1];
                if (!isDuplicate(lat, lng, name)) {
                  const { landmarkType, categoryLabel } = detectLandmarkTypeAndLabel(
                    name,
                    featureType,
                    address,
                    categories
                  );
                  matchedPoints.push({
                    name,
                    lat,
                    lng,
                    address,
                    landmarkType,
                    categoryLabel,
                  });
                }
              }
            }
          }
        } else if (res.status === 401 || res.status === 403) {
          apiEncounteredError = true;
        }
      }
    } catch (e: any) {
      if (e?.name === 'TypeError' || e?.message?.includes('network') || e?.message?.includes('fetch failed')) {
        networkFailed = true;
      } else {
        apiEncounteredError = true;
      }
    }
  }

  // Tier 2: OpenStreetMap Photon POI Engine (Live deep category search & zero-token resilience)
  if (matchedPoints.length < 6) {
    try {
      const photonTerm = searchTermsToTry.find((t) => t.includes(' ') && !t.includes('near')) || searchTermsToTry[0] || rawQuery;
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
        photonTerm
      )}&lat=18.5204&lon=73.8567&limit=8`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2200);
      const res = await fetch(photonUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.features && Array.isArray(data.features)) {
          for (const f of data.features) {
            const props = f.properties || {};
            const name = props.name || '';
            const addressParts = [props.street, props.district, props.city, props.state].filter(Boolean);
            const address = addressParts.join(', ');
            const coords = f.geometry?.coordinates;

            if (name && coords && coords.length >= 2) {
              const lng = coords[0];
              const lat = coords[1];
              if (!isDuplicate(lat, lng, name)) {
                const { landmarkType, categoryLabel } = detectLandmarkTypeAndLabel(
                  name,
                  props.osm_value || props.osm_key,
                  address
                );
                matchedPoints.push({
                  name,
                  lat,
                  lng,
                  address,
                  landmarkType,
                  categoryLabel,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      // Continue gracefully to next tier
    }
  }

  // Tier 3: Mapbox Geocoding v5 Fallback (if still sparse)
  if (hasToken && matchedPoints.length < 6) {
    try {
      const geocodeTerm = searchTermsToTry[0] || rawQuery;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        geocodeTerm
      )}.json?access_token=${token}&country=IN&proximity=73.8567,18.5204&limit=8`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.features && Array.isArray(data.features)) {
          for (const feat of data.features) {
            const cleanName = feat.text || feat.place_name.replace(', Maharashtra, India', '').replace(', India', '');
            const address = feat.place_name || '';
            const lat = feat.center[1];
            const lng = feat.center[0];
            if (!isDuplicate(lat, lng, cleanName)) {
              const { landmarkType, categoryLabel } = detectLandmarkTypeAndLabel(
                cleanName,
                feat.place_type?.[0],
                address
              );
              matchedPoints.push({
                name: cleanName,
                lat,
                lng,
                address,
                landmarkType,
                categoryLabel,
              });
            }
          }
        }
      }
    } catch (e) {
      // Continue to local catalogue
    }
  }

  // Rank results by relevance across query words and synonym variants (e.g. kirkee -> khadki)
  const allQueryVariants = normalizeQueryWithTypos(rawQuery).map(cleanQuery);
  const primaryClean = cleanQuery(rawQuery);
  const allKeywords = Array.from(
    new Set(allQueryVariants.flatMap((v) => v.split(/\s+/)).filter((w) => w.length >= 2))
  );

  matchedPoints.sort((a, b) => {
    const aName = cleanQuery(a.name);
    const bName = cleanQuery(b.name);

    // 1. Exact query match
    if (aName === primaryClean && bName !== primaryClean) return -1;
    if (bName === primaryClean && aName !== primaryClean) return 1;

    // 2. Starts with query
    const aStarts = aName.startsWith(primaryClean);
    const bStarts = bName.startsWith(primaryClean);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // 2.5. Acronym / Parenthesis match (e.g. '(ait)', 'coep', 'cst')
    const firstWord = primaryClean.split(/\s+/)[0];
    if (firstWord && firstWord.length >= 2) {
      const aHasAcronym = aName.includes(`(${firstWord})`) || aName.split(/\s+/).includes(firstWord);
      const bHasAcronym = bName.includes(`(${firstWord})`) || bName.split(/\s+/).includes(firstWord);
      if (aHasAcronym && !bHasAcronym) return -1;
      if (!aHasAcronym && bHasAcronym) return 1;
    }

    // 3. Keyword matches across all variants
    const aMatches = allKeywords.filter((w) => aName.includes(w)).length;
    const bMatches = allKeywords.filter((w) => bName.includes(w)).length;
    if (aMatches !== bMatches) return bMatches - aMatches;

    return 0;
  });

  // Determine overall status
  const finalResults = matchedPoints.slice(0, 16);

  if (finalResults.length > 0) {
    return { results: finalResults, status: 'ok' };
  }

  if (!hasToken) {
    return {
      results: [],
      status: 'no_token',
      errorMessage: 'Mapbox API token (VITE_MAPBOX_TOKEN) is not configured in .env',
    };
  }

  if (networkFailed) {
    return {
      results: [],
      status: 'network_error',
      errorMessage: 'Network connection failed. Unable to reach map providers.',
    };
  }

  if (apiEncounteredError) {
    return {
      results: [],
      status: 'api_error',
      errorMessage: 'Search API returned an authorization or server error.',
    };
  }

  return { results: [], status: 'no_results' };
}

/**
 * Convenience wrapper returning LocationPoint array
 */
export async function searchPuneLocations(rawQuery: string): Promise<LocationPoint[]> {
  const resp = await searchPuneLocationsWithStatus(rawQuery);
  return resp.results;
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
    address: 'Pune, Maharashtra, India',
    categoryLabel: 'City',
  };

  if (!query || query.trim().length === 0) return safeFallback;

  const qClean = cleanQuery(query);

  if (fallbackDefault && cleanQuery(fallbackDefault.name) === qClean) {
    return fallbackDefault;
  }

  const queryVariants = normalizeQueryWithTypos(query);

  // 1. Check Out of town cities
  const outOfTownCity = matchOutOfTownCity(query);
  if (outOfTownCity) {
    return {
      name: `${outOfTownCity.name}, ${outOfTownCity.state}`,
      lat: outOfTownCity.lat,
      lng: outOfTownCity.lng,
      address: `${outOfTownCity.name}, ${outOfTownCity.state}`,
      landmarkType: 'out_of_town',
      isOutOfTown: true,
      cityName: outOfTownCity.name,
      categoryLabel: 'Getaway Destination',
    };
  }

  // 2. Perform live multi-provider search (finds Military Hospital Khadki, colleges, stations, etc.)
  const results = await searchPuneLocations(query);
  if (results && results.length > 0) {
    return results[0];
  }

  // 3. Check PUNE_LANDMARKS with fuzzy matching
  const landmarkMatch = PUNE_LANDMARKS.find((p) =>
    matchesFuzzyToken(queryVariants, p.name, p.aliases)
  );
  if (landmarkMatch) {
    return {
      name: landmarkMatch.name,
      lat: landmarkMatch.lat,
      lng: landmarkMatch.lng,
      address: `${landmarkMatch.name}, Pune`,
      landmarkType: landmarkMatch.landmarkType,
      categoryLabel: 'Landmark',
    };
  }

  // 4. Check Pune Metro stations
  const metroMatch = PUNE_METRO_STATIONS.find((s) => {
    const sClean = cleanQuery(s.name);
    return queryVariants.some((qv) => sClean.includes(qv) || qv.includes(sClean));
  });
  if (metroMatch) {
    return {
      name: `${metroMatch.name} (${metroMatch.line === 'purple' ? 'Purple Line' : 'Aqua Line'})`,
      lat: metroMatch.lat,
      lng: metroMatch.lng,
      address: `Pune Metro ${metroMatch.line === 'purple' ? 'Purple Line' : 'Aqua Line'}, Pune`,
      landmarkType: 'metro',
      categoryLabel: 'Metro Station',
    };
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
