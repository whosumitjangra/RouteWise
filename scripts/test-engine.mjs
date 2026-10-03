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
console.log("=== ALL TESTS PASSED SUCCESSFULLY! ===");
