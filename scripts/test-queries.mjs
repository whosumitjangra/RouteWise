import fs from 'fs';

// Read VITE_MAPBOX_TOKEN from .env
const envContent = fs.readFileSync('.env', 'utf-8');
const tokenMatch = envContent.match(/VITE_MAPBOX_TOKEN=(.+)/);
const token = tokenMatch ? tokenMatch[1].trim() : '';

console.log('Testing queries with token prefix:', token.slice(0, 15) + '...');

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

function normalizeQuery(raw) {
  let cleaned = raw.toLowerCase().trim();
  for (const [typo, replacement] of Object.entries(TYPO_MAP)) {
    cleaned = cleaned.replace(new RegExp(`\\b${typo}\\b`, 'g'), replacement);
  }
  return cleaned;
}

async function searchMapboxSearchBox(query) {
  const url = new URL('https://api.mapbox.com/search/searchbox/v1/forward');
  url.searchParams.set('q', query);
  url.searchParams.set('access_token', token);
  url.searchParams.set('proximity', '73.8567,18.5204');
  url.searchParams.set('country', 'IN');
  url.searchParams.set('limit', '5');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Mapbox status ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();
  return (data.features || []).map((f) => ({
    name: f.properties?.name || f.properties?.name_preferred || f.properties?.full_address,
    address: f.properties?.full_address || f.properties?.place_formatted,
    lat: f.geometry?.coordinates[1],
    lng: f.geometry?.coordinates[0],
    category: f.properties?.poi_category?.[0] || f.properties?.feature_type
  }));
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
  console.log('\n========================================');
  console.log('TESTING 10 REQUIRED PLACE SEARCH QUERIES');
  console.log('========================================\n');

  for (const q of queriesToTest) {
    const normalized = normalizeQuery(q);
    const results = await searchMapboxSearchBox(normalized);
    console.log(`QUERY: "${q}" (Normalized: "${normalized}")`);
    if (results.length > 0) {
      const top = results[0];
      console.log(`  Top Result: "${top.name}"`);
      console.log(`  Address:    ${top.address || 'N/A'}`);
      console.log(`  Coords:     [${top.lat.toFixed(4)}, ${top.lng.toFixed(4)}]`);
      console.log(`  Category:   ${top.category || 'N/A'}`);
      console.log(`  STATUS:     SUCCESS (${results.length} results returned)\n`);
    } else {
      console.log(`  STATUS:     NO RESULTS\n`);
    }
  }
}

run();
