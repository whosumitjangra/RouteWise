import assert from 'node:assert';

// 1. Test Pune RTO Auto Fare logic
function calculateAutoFare(distKm) {
  const baseFare = 25;
  const baseDist = 1.5;
  const perKm = 17.0;
  if (distKm <= baseDist) return baseFare;
  return Math.round(baseFare + (distKm - baseDist) * perKm);
}

// 2. Test Pune Metro Slab logic
const METRO_SLABS = [
  { maxStations: 3, fare: 10 },
  { maxStations: 6, fare: 15 },
  { maxStations: 10, fare: 20 },
  { maxStations: 14, fare: 25 },
  { maxStations: 18, fare: 30 },
  { maxStations: 999, fare: 35 },
];

function getMetroFare(stationsCount) {
  for (const slab of METRO_SLABS) {
    if (stationsCount <= slab.maxStations) return slab.fare;
  }
  return 35;
}

console.log("=== RUNNING ROUTEWISE UNIT & INTEGRATION TESTS ===");

// Test 1: Auto Fare
assert.strictEqual(calculateAutoFare(1.0), 25, "Short auto ride should be ₹25 base");
assert.strictEqual(calculateAutoFare(1.5), 25, "1.5 km auto ride should be ₹25 base");
assert.strictEqual(calculateAutoFare(5.0), 85, "5 km auto ride should be ₹85 (25 + 3.5*17)");
console.log("✔ Auto RTO fare test passed");

// Test 2: Metro Slabs
assert.strictEqual(getMetroFare(1), 10, "1 station should be ₹10");
assert.strictEqual(getMetroFare(3), 10, "3 stations should be ₹10");
assert.strictEqual(getMetroFare(4), 15, "4 stations should be ₹15");
assert.strictEqual(getMetroFare(6), 15, "6 stations should be ₹15");
assert.strictEqual(getMetroFare(7), 20, "7 stations should be ₹20");
assert.strictEqual(getMetroFare(10), 20, "10 stations should be ₹20");
assert.strictEqual(getMetroFare(14), 25, "14 stations should be ₹25");
assert.strictEqual(getMetroFare(18), 30, "18 stations should be ₹30");
assert.strictEqual(getMetroFare(22), 35, "22 stations should be ₹35");
console.log("✔ Pune Metro fare slab test passed");

// Test 3: Walking Distance Threshold Rules (Realistic Urban Mobility)
const MAX_WALKING_KM = 1.0;
function isWalkingOptionIncluded(distanceKm) {
  return distanceKm <= MAX_WALKING_KM;
}

assert.strictEqual(isWalkingOptionIncluded(0.8), true, "800m walk should be included");
assert.strictEqual(isWalkingOptionIncluded(1.0), true, "1.0 km walk should be included");
assert.strictEqual(isWalkingOptionIncluded(1.2), false, "1.2 km walk should be excluded");
assert.strictEqual(isWalkingOptionIncluded(4.0), false, "4.0 km walk must NEVER be included as walking option");
assert.strictEqual(isWalkingOptionIncluded(9.5), false, "9.5 km (AIT to Pune Jdn) walk must NEVER be included");
console.log("✔ Walking threshold (<= 1.0 km) rule verified");

// Test 4: Recommendation Explanation generator
function generateExplanation(winner, runnerUp, preference, budget) {
  if (winner.totalFare > budget) {
    return `All viable options exceed your ₹${budget} budget. ${winner.title} is most economical.`;
  }
  const costDiff = runnerUp.totalFare - winner.totalFare;
  const timeDiff = runnerUp.duration - winner.duration;
  
  if (preference === 'cheapest') {
    return `Recommended because it is ₹${costDiff} cheaper and only ${Math.abs(timeDiff)} minutes slower.`;
  }
  if (preference === 'fastest') {
    return `Recommended because it is ${Math.abs(timeDiff)} minutes faster and fits your ₹${budget} budget.`;
  }
  return `Recommended as the best balance of cost (₹${winner.totalFare}) and time (${winner.duration} min).`;
}

const mockMetro = { title: 'Pune Metro + Feeder', totalFare: 35, duration: 32 };
const mockAuto = { title: 'Auto Rickshaw', totalFare: 95, duration: 25 };

const cheapestExpl = generateExplanation(mockMetro, mockAuto, 'cheapest', 150);
console.log("Explanation ('cheapest'):", cheapestExpl);
assert.ok(cheapestExpl.includes("₹60 cheaper"), "Explanation should highlight ₹60 savings");
assert.ok(cheapestExpl.includes("7 minutes slower"), "Explanation should highlight 7 minutes difference");
console.log("✔ Natural language explainer test passed");

// Test 5: Auto Ride Provider Pricing Formula & Constraints
function calculateProviderPricing(distKm, baseMeterFare) {
  const uberFare = Math.round(baseMeterFare * 1.05 + 4);
  const rapidoFare = Math.max(25, Math.round(baseMeterFare * 0.96));
  const isOfflineAvailable = distKm <= 10;
  const offlineFare = isOfflineAvailable ? Math.max(15, Math.round(baseMeterFare / 3.5)) : undefined;
  return {
    uberFare,
    rapidoFare,
    offlineFare,
    isOfflineAvailable,
    disclaimer: "Price may vary"
  };
}

// 4.0 km short ride: base meter fare = 25 + 2.5*17 = 68
const shortRidePricing = calculateProviderPricing(4.0, 68);
assert.strictEqual(shortRidePricing.isOfflineAvailable, true, "Short distance (4 km) should have offline booking");
assert.strictEqual(shortRidePricing.offlineFare, Math.round(68 / 3.5), "Offline fare should be baseFare / 3.5");
assert.strictEqual(shortRidePricing.disclaimer, "Price may vary", "Offline fare must have 'Price may vary' disclaimer");
assert.ok(shortRidePricing.uberFare > 0, "Uber price should be calculated");
assert.ok(shortRidePricing.rapidoFare > 0, "Rapido price should be calculated");

// 12.0 km long ride (> 10 km): offline booking must be suppressed!
const longRidePricing = calculateProviderPricing(12.0, 204);
assert.strictEqual(longRidePricing.isOfflineAvailable, false, "Long distance (> 10 km) must NOT have offline booking");
assert.strictEqual(longRidePricing.offlineFare, undefined, "Offline fare must be undefined after 10 km");
assert.ok(longRidePricing.uberFare > 0, "Uber price must still be available for > 10 km");
assert.ok(longRidePricing.rapidoFare > 0, "Rapido price must still be available for > 10 km");
console.log("✔ Provider pricing (Uber, Rapido, and Offline base/3.5 with <=10km cap) tests passed");

// Test 6: PMPML Pune Bus Stage Fare & Route Matching
const PMPML_SLABS = [
  { maxKm: 2, fare: 5 },
  { maxKm: 4, fare: 10 },
  { maxKm: 8, fare: 15 },
  { maxKm: 12, fare: 20 },
  { maxKm: 16, fare: 25 },
  { maxKm: 20, fare: 30 },
  { maxKm: 999, fare: 35 },
];

function calculateBusFare(distKm) {
  for (const slab of PMPML_SLABS) {
    if (distKm <= slab.maxKm) return slab.fare;
  }
  return 35;
}

assert.strictEqual(calculateBusFare(1.8), 5, "Stage 1 bus fare should be ₹5");
assert.strictEqual(calculateBusFare(3.5), 10, "Stage 2 bus fare should be ₹10");
assert.strictEqual(calculateBusFare(7.0), 15, "Stage 3 bus fare should be ₹15");
assert.strictEqual(calculateBusFare(10.5), 20, "Stage 4 bus fare should be ₹20 (e.g. AIT to Pune Station)");
assert.strictEqual(calculateBusFare(14.0), 25, "Stage 5 bus fare should be ₹25");
assert.strictEqual(calculateBusFare(18.5), 30, "Stage 6 bus fare should be ₹30");
assert.strictEqual(calculateBusFare(24.0), 35, "Stage 7 bus fare should be ₹35");
console.log("✔ PMPML bus stage fare tests passed");

// Test 7: Feeder Auto Charge (1 km = 10, 2-3 km = 30-40) and Final Price Addition
function calculateFeederCharge(distKm) {
  if (distKm <= 1.0) return 10;
  if (distKm <= 2.0) return Math.round(10 + (distKm - 1.0) * 20);
  if (distKm <= 3.0) return Math.round(30 + (distKm - 2.0) * 10);
  return Math.round(40 + (distKm - 3.0) * 10);
}

// 1 km feeder: charge must be 10
assert.strictEqual(calculateFeederCharge(1.0), 10, "1 km feeder auto charge must be exactly ₹10");
assert.strictEqual(calculateFeederCharge(0.8), 10, "0.8 km feeder auto charge must be ₹10");

// 2 to 3 km feeder: charge must be between 30 and 40
const fee2Km = calculateFeederCharge(2.0);
const fee2_5Km = calculateFeederCharge(2.5);
const fee3Km = calculateFeederCharge(3.0);
assert.strictEqual(fee2Km, 30, "2.0 km feeder auto charge should be ₹30");
assert.ok(fee2_5Km >= 30 && fee2_5Km <= 40, "2.5 km feeder auto charge must be between ₹30 and ₹40");
assert.strictEqual(fee2_5Km, 35, "2.5 km feeder auto charge should be ₹35");
assert.strictEqual(fee3Km, 40, "3.0 km feeder auto charge should be ₹40");

// Final Price Addition verification
const metroTicket = 20;
const firstMile = calculateFeederCharge(2.5); // ₹35
const lastMile = calculateFeederCharge(1.0);  // ₹10
const finalPrice = metroTicket + firstMile + lastMile;
assert.strictEqual(finalPrice, 65, "Final price must add first-mile (₹35) and last-mile (₹10) to metro ticket (₹20)");
console.log("✔ Feeder auto charge (1km: ₹10, 2-3km: ₹30-40) and final price addition tests passed");

console.log("=== ALL TESTS PASSED SUCCESSFULLY! ===");
