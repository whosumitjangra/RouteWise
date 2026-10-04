import assert from 'node:assert';
import fs from 'node:fs';

console.log("=== RUNNING PMPML GTFS BUS & STOPS VERIFICATION ===");

// 1. Verify GTFS Routes
const gtfsRoutes = JSON.parse(fs.readFileSync(new URL('../src/config/pmpmlGtfsRoutes.json', import.meta.url), 'utf-8'));
assert.strictEqual(gtfsRoutes.length, 309, "Must contain 309 GTFS canonical routes");

// Verify high-traffic routes exist in the dataset
const expectedBuses = [
  '100', '103', '104', '107', '108', '111M', '113', '114', '115', '117',
  '118A', '118', '119A', '119', '120', '121', '122', '123', '124', '126',
  '130', '139A', '139', '140', '148', '149', '151', '158', '165', '166',
  '208', '213', '301', '304', '312', '324', '357', 'METRO SHUTTLE 13',
  'METRO SHUTTLE 17', 'METRO SHUTTLE 2', 'METRO SHUTTLE 31', 'METRO SHUTTLE 32',
  'RATRANI 1', 'RATRANI 2', 'RATRANI 3', 'RATRANI 4', 'RATRANI 7'
];

expectedBuses.forEach(bNum => {
  const found = gtfsRoutes.find(r => r.busNumber === bNum);
  assert.ok(found, `Bus route ${bNum} must exist in GTFS routes dataset`);
});
console.log(`✔ Verified ${expectedBuses.length} key GTFS bus routes and specialized fleets`);

// 2. Verify GTFS Stops dataset
const stops = JSON.parse(fs.readFileSync(new URL('../src/config/pmpmlStops.json', import.meta.url), 'utf-8'));
assert.strictEqual(stops.length, 3811, "Must contain 3,811 unique consolidated stops");

const sampleStops = [
  'Pune Station Moledina Road',
  'Income Tax Office',
  'Gpo',
  'Zilla Parishad',
  'Vasant Talkies',
  'Appa Balwant Chowk',
  'Deccan Corner',
  'Garware College',
  'Nal Stop',
  'Sutardara',
  'Kothrud Depot',
  'Vanaj Company',
  'Swargate',
  'Sarasbaug',
  'Hinjawadi Maan Phase 3',
  'Bremen Chowk',
  'Aundhgaon',
  'Military Hospital Rangehills',
  'Military Hospital Vanawadi',
  'Lohgaon Airport',
  'Katraj',
  'Hadapsar Gadital'
];

sampleStops.forEach(sName => {
  const found = stops.find(s => s.name.toLowerCase() === sName.toLowerCase());
  assert.ok(found, `Stop '${sName}' must exist in official stop database`);
  assert.ok(typeof found.lat === 'number' && found.lat > 17 && found.lat < 20, `Stop '${sName}' must have valid Pune latitude`);
  assert.ok(typeof found.lon === 'number' && found.lon > 72 && found.lon < 75, `Stop '${sName}' must have valid Pune longitude`);
});
console.log(`✔ Verified sample of ${sampleStops.length} stops with valid geographic coordinates`);

// 3. Verify Route Terminals coordinate binding
const r100 = gtfsRoutes.find(r => r.busNumber === '100');
assert.ok(r100.originCoords, "Route 100 origin must have coords");
assert.ok(r100.destCoords, "Route 100 dest must have coords");
assert.strictEqual(r100.origin, 'Hinjawadi Maan Phase 3');
assert.strictEqual(r100.dest, 'Ma Na Pa Dengle Pul Nadikathi');
console.log("✔ Route 100 terminal coordinate binding verified");

const r108 = gtfsRoutes.find(r => r.busNumber === '108');
assert.ok(r108.originCoords, "Route 108 origin must have coords");
assert.ok(r108.destCoords, "Route 108 dest must have coords");
assert.strictEqual(r108.origin, 'Pune Station Moledina Road');
assert.strictEqual(r108.dest, 'Sutardara');
console.log("✔ Route 108 (Pune Station ⇆ Sutardara) terminal binding verified");

console.log("=== ALL PMPML GTFS VERIFICATIONS PASSED! ===");
