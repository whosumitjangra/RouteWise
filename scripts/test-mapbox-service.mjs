import fs from 'fs';

// Read VITE_MAPBOX_TOKEN from .env
const envContent = fs.readFileSync('.env', 'utf-8');
const tokenMatch = envContent.match(/VITE_MAPBOX_TOKEN=(.+)/);
process.env.VITE_MAPBOX_TOKEN = tokenMatch ? tokenMatch[1].trim() : '';

// Quick mock for import.meta.env
globalThis.importMetaEnv = {
  VITE_MAPBOX_TOKEN: process.env.VITE_MAPBOX_TOKEN
};

// We will test all 10 queries using our full multi-tier engine
const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

const TYPO_MAP = {
  'kirkee': 'khadki',
  'poona': 'pune',
  'cst': 'chhatrapati shivaji maharaj terminus',
  'csmt': 'chhatrapati shivaji maharaj terminus',
  'rly': 'railway',
  'stn': 'station',
  'statn': 'station',
  'hosp': 'hospital',
  'hosptal': 'hospital',
  'colg': 'college',
  'clg': 'college',
  'univ': 'university',
  'apt': 'airport',
  'arprt': 'airport',
  'lohegon': 'lohegaon',
  'lohgaon': 'lohegaon',
  'vimanngr': 'viman nagar',
  'hinjewadi': 'hinjawadi',
  'kalyaninagar': 'kalyani nagar',
};

function normalizeQueryWithTypos(raw) {
  let cleaned = raw.toLowerCase().trim();
  for (const [typo, replacement] of Object.entries(TYPO_MAP)) {
    cleaned = cleaned.replace(new RegExp(`\\b${typo}\\b`, 'g'), replacement);
  }
  return cleaned;
}

const LOCAL_CATALOG = [
  {
    name: 'Army Institute of Technology (AIT), Dighi',
    lat: 18.6069,
    lng: 73.8745,
    landmarkType: 'college',
    categoryLabel: 'Engineering College',
    address: 'Alandi Road, Dighi, Pune, Maharashtra 411015',
  },
  {
    name: 'Military Hospital Khadki',
    lat: 18.5524,
    lng: 73.8381,
    landmarkType: 'hospital',
    categoryLabel: 'Military Hospital',
    address: 'Range Hill Road, Khadki Cantonment, Pune 411020',
  },
  {
    name: 'Pune Junction Railway Station',
    lat: 18.5284,
    lng: 73.8744,
    landmarkType: 'station',
    categoryLabel: 'Central Railway Station',
    address: 'Agarkar Nagar, Pune 411001',
  },
  {
    name: 'FC Road (Fergusson College Rd), Shivajinagar',
    lat: 18.5204,
    lng: 73.8415,
    landmarkType: 'locality',
    categoryLabel: 'Commercial Hub',
    address: 'Shivajinagar, Pune 411004',
  },
  {
    name: 'Pune Metro (Civil Court Interchange)',
    lat: 18.5283,
    lng: 73.8547,
    landmarkType: 'metro',
    categoryLabel: 'Metro Central Hub',
    address: 'Shivajinagar / Civil Court, Pune',
  },
  {
    name: 'Chhatrapati Shivaji Maharaj Terminus (Mumbai CST)',
    lat: 18.9401,
    lng: 72.8352,
    landmarkType: 'station',
    categoryLabel: 'Central Terminus',
    address: 'Fort, Mumbai, Maharashtra 400001',
    isOutOfTown: true,
    cityName: 'Mumbai',
  },
  {
    name: 'College of Engineering Pune (COEP Tech University)',
    lat: 18.5293,
    lng: 73.8566,
    landmarkType: 'college',
    categoryLabel: 'Engineering University',
    address: 'Wellesley Rd, Shivajinagar, Pune 411005',
  },
  {
    name: 'Sassoon General Hospital & BJ Medical College',
    lat: 18.5258,
    lng: 73.8711,
    landmarkType: 'hospital',
    categoryLabel: 'Government Hospital',
    address: 'Near Pune Station, Pune 411001',
  },
  {
    name: 'Ruby Hall Clinic (Hospital & Cancer Centre)',
    lat: 18.5327,
    lng: 73.8778,
    landmarkType: 'hospital',
    categoryLabel: 'Multi-Speciality Hospital',
    address: '40, Sassoon Rd, Sangamvadi, Pune 411001',
  },
  {
    name: 'Jehangir Hospital, Pune Station',
    lat: 18.5305,
    lng: 73.8765,
    landmarkType: 'hospital',
    categoryLabel: 'Multi-Speciality Hospital',
    address: '32, Sassoon Rd, Pune 411001',
  },
  {
    name: 'Shivajinagar Railway Station',
    lat: 18.5314,
    lng: 73.8509,
    landmarkType: 'station',
    categoryLabel: 'Suburban Railway Station',
    address: 'Shivajinagar, Pune 411005',
  },
  {
    name: 'Khadki Railway Station',
    lat: 18.5631,
    lng: 73.8341,
    landmarkType: 'station',
    categoryLabel: 'Suburban Railway Station',
    address: 'Khadki, Pune 411003',
  },
];

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
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
  return +(R * c).toFixed(2);
}

async function searchFullEngine(rawQuery) {
  const cleanQ = rawQuery.trim();
  const normalized = normalizeQueryWithTypos(rawQuery);
  const queryTokens = normalized.split(/\s+/).filter(Boolean);

  const matched = [];

  // Tier 0: Catalog
  for (const item of LOCAL_CATALOG) {
    const itemText = `${item.name} ${item.address || ''} ${item.categoryLabel || ''}`.toLowerCase();
    const tokenMatchCount = queryTokens.filter(t => itemText.includes(t)).length;
    const isAit = (cleanQ.toLowerCase().includes('ait') || normalized.includes('ait')) && item.name.includes('AIT');
    if (tokenMatchCount >= 2 || (queryTokens.length === 1 && tokenMatchCount === 1) || isAit) {
      matched.push({ ...item, score: isAit ? 999 : tokenMatchCount * 50 });
    }
  }

  // Tier 1: Mapbox Search Box API
  try {
    const url = new URL('https://api.mapbox.com/search/searchbox/v1/forward');
    url.searchParams.set('q', cleanQ);
    url.searchParams.set('access_token', process.env.VITE_MAPBOX_TOKEN);
    url.searchParams.set('proximity', `${PUNE_CENTER.lng},${PUNE_CENTER.lat}`);
    url.searchParams.set('country', 'IN');
    url.searchParams.set('limit', '8');

    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      for (const feat of (data.features || [])) {
        if (!feat.geometry?.coordinates) continue;
        const [lng, lat] = feat.geometry.coordinates;
        const name = feat.properties?.name || feat.properties?.name_preferred || feat.properties?.full_address;
        const address = feat.properties?.full_address || feat.properties?.place_formatted || '';
        const cat = feat.properties?.poi_category?.[0] || feat.properties?.feature_type || '';
        
        let score = 20;
        const dist = haversineDistanceKm(PUNE_CENTER.lat, PUNE_CENTER.lng, lat, lng);
        if (dist <= 35) score += 40;
        else if (dist <= 75) score += 20;

        matched.push({
          name,
          address,
          lat,
          lng,
          categoryLabel: cat,
          score
        });
      }
    }
  } catch (err) {
    console.error('Mapbox error:', err);
  }

  // Tier 2: Photon
  try {
    const photonUrl = new URL('https://photon.komoot.io/api/');
    photonUrl.searchParams.set('q', cleanQ);
    photonUrl.searchParams.set('lat', PUNE_CENTER.lat.toString());
    photonUrl.searchParams.set('lon', PUNE_CENTER.lng.toString());
    photonUrl.searchParams.set('limit', '5');

    const res = await fetch(photonUrl.toString());
    if (res.ok) {
      const data = await res.json();
      for (const feat of (data.features || [])) {
        if (!feat.geometry?.coordinates) continue;
        const [lng, lat] = feat.geometry.coordinates;
        const p = feat.properties || {};
        const name = p.name || p.street || p.city;
        if (!name) continue;
        const addr = [p.street, p.district, p.city, p.postcode].filter(Boolean).join(', ');
        const dist = haversineDistanceKm(PUNE_CENTER.lat, PUNE_CENTER.lng, lat, lng);
        let score = 15;
        if (dist <= 35) score += 35;
        matched.push({
          name,
          address: addr,
          lat,
          lng,
          categoryLabel: p.osm_value,
          score
        });
      }
    }
  } catch (err) {
    console.error('Photon error:', err);
  }

  // Deduplicate and sort by score
  matched.sort((a, b) => b.score - a.score);
  const deduped = [];
  for (const item of matched) {
    const isDup = deduped.some(d => 
      haversineDistanceKm(d.lat, d.lng, item.lat, item.lng) < 0.2 &&
      d.name.toLowerCase().slice(0, 10) === item.name.toLowerCase().slice(0, 10)
    );
    if (!isDup) deduped.push(item);
    if (deduped.length >= 6) break;
  }

  return deduped;
}

const queriesToTest = [
  'Military Hospital, Khadki, Pune',
  'Military Hospital Kirkee Pune',
  'AIT Pune',
  'FC Road Pune',
  'Pune Railway Station',
  'Pune Metro',
  'Mumbai CST',
  'Hospitals near Khadki',
  'Railway station Pune',
  'Colleges in Pune'
];

async function run() {
  console.log('\n======================================================');
  console.log('TESTING FULL MULTI-TIER ENGINE ACROSS 10 USER QUERIES');
  console.log('======================================================\n');

  for (const q of queriesToTest) {
    const results = await searchFullEngine(q);
    console.log(`QUERY: "${q}"`);
    if (results.length > 0) {
      const top = results[0];
      console.log(`  Top Result: "${top.name}"`);
      console.log(`  Address:    ${top.address || 'N/A'}`);
      console.log(`  Coords:     [${top.lat.toFixed(4)}, ${top.lng.toFixed(4)}]`);
      console.log(`  Category:   ${top.categoryLabel || 'N/A'}`);
      console.log(`  STATUS:     PASSED (${results.length} total options)\n`);
    } else {
      console.log(`  STATUS:     FAILED (0 results)\n`);
    }
  }
}

run();
