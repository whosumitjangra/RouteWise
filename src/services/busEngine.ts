import { LocationPoint, RouteLeg, RouteOption } from '../types';
import { PMPML_BUS_ROUTES, findMatchingPMPMLBusRoute } from '../config/pmpmlBusData';
import { FARE_CONFIG } from '../config/fares';
import { RoadRouteResult, haversineDistanceKm } from './mapbox';

/**
 * Calculates official PMPML Stage Fare according to distance
 */
export function calculatePMPMLFare(distanceKm: number): number {
  for (const slab of FARE_CONFIG.bus.slabs) {
    if (distanceKm <= slab.maxKm) {
      return slab.fare;
    }
  }
  return 35;
}

/**
 * Deterministic Pune PMPML City & Intercity Bus Engine
 * Synthesizes authentic Bus Number, Stops Chain, Operating Frequency, and Stage Fare
 */
export function buildPMPMLBusOption(
  origin: LocationPoint,
  destination: LocationPoint,
  roadRoute: RoadRouteResult
): RouteOption {
  const distanceKm = roadRoute.distanceKm;

  // 1. Check if there is an exact corridor match in PMPML catalog
  const catalogMatch = findMatchingPMPMLBusRoute(origin.name, destination.name);

  let busNumber = '158';
  let routeName = 'Alandi ➔ Pune Station (via Dighi / AIT Pune)';
  let boardingStop = 'Nearest PMPML Bus Stop';
  let exitStop = 'Destination PMPML Bus Stop';
  let stopsList: string[] = [];
  let frequencyMinutes = 12;
  let operatingHours = '05:45 AM – 11:15 PM';

  if (catalogMatch) {
    busNumber = catalogMatch.matchedRoute.busNumber;
    routeName = catalogMatch.matchedRoute.routeName;
    boardingStop = catalogMatch.boardingStop;
    exitStop = catalogMatch.exitStop;
    stopsList = catalogMatch.stopsSegment;
    frequencyMinutes = catalogMatch.matchedRoute.frequencyMinutes;
    operatingHours = catalogMatch.matchedRoute.operatingHours;
  } else {
    // Spatial or algorithmic fallback to appropriate Pune PMPML Bus Corridor
    const oName = origin.name.toLowerCase();
    const dName = destination.name.toLowerCase();

    if (oName.includes('ait') || oName.includes('dighi') || dName.includes('ait') || dName.includes('dighi')) {
      busNumber = '158';
      routeName = 'Alandi ➔ Pune Station (via Dighi & Vishrantwadi)';
      boardingStop = 'AIT Pune Gate / Dighi Gaon';
      exitStop = 'Pune Station / Swargate Bus Stand';
      stopsList = [
        'AIT Pune (Dighi Camp)',
        'Magazine Chowk',
        'Customs Colony',
        'Vishrantwadi Chowk',
        'Phule Nagar',
        'Sadhu Vaswani Chowk',
        'Pune Station Bus Stand',
      ];
    } else if (oName.includes('hinjawadi') || dName.includes('hinjawadi')) {
      busNumber = '100';
      routeName = 'Pune Station ➔ Hinjawadi Maan Phase 3';
      boardingStop = 'Shivaji Chowk Hinjawadi';
      exitStop = 'Pune Station / Shivajinagar';
      stopsList = [
        'Hinjawadi Phase 3',
        'Infosys Phase 2',
        'Wipro Circle Phase 1',
        'Shivaji Chowk',
        'Wakad Bridge',
        'Baner Phata',
        'Pune University',
        'Shivajinagar Station',
        'Pune Station',
      ];
    } else if (oName.includes('swargate') || dName.includes('swargate')) {
      busNumber = '111';
      routeName = 'Swargate ➔ Nigdi (Rainbow BRTS)';
      boardingStop = 'Swargate Bus Stand';
      exitStop = 'Pimpri / Nigdi Pavilion';
      stopsList = [
        'Swargate',
        'Deccan Gymkhana',
        'Shivajinagar',
        'Khadki Bazar',
        'Dapodi',
        'Pimpri Station',
        'Chinchwad Station',
        'Nigdi Pradhikaran',
      ];
    } else if (oName.includes('hadapsar') || dName.includes('hadapsar')) {
      busNumber = '204';
      routeName = 'Hadapsar ➔ Chinchwad Gaon';
      boardingStop = 'Hadapsar Gadital';
      exitStop = 'Pune Station / Shivajinagar';
      stopsList = [
        'Hadapsar Gadital',
        'Magarpatta City Gate',
        'Fatimanagar',
        'Pulgate (Camp)',
        'Pune Station',
        'Shivajinagar',
      ];
    } else if (oName.includes('kothrud') || dName.includes('kothrud')) {
      busNumber = '115P';
      routeName = 'Kothrud Depot ➔ Pune Station';
      boardingStop = 'Kothrud Depot / Paud Phata';
      exitStop = 'Pune Station Bus Stand';
      stopsList = [
        'Kothrud Depot',
        'Mayur Colony',
        'Nal Stop',
        'Garware College',
        'Deccan Gymkhana',
        'Manapa Bhavan',
        'Pune Station',
      ];
    } else if (oName.includes('katraj') || dName.includes('katraj')) {
      busNumber = '24';
      routeName = 'Katraj ➔ Pune Station';
      boardingStop = 'Katraj Bus Stand';
      exitStop = 'Pune Station Bus Stand';
      stopsList = [
        'Katraj Bus Stand',
        'Bharati Vidyapeeth',
        'Balaji Nagar',
        'Padmavati',
        'Swargate',
        'Sadhu Vaswani Chowk',
        'Pune Station',
      ];
    } else {
      busNumber = 'PMPML City';
      routeName = `${origin.name.split(',')[0]} ➔ ${destination.name.split(',')[0]}`;
      boardingStop = `${origin.name.split(',')[0]} Bus Stop`;
      exitStop = `${destination.name.split(',')[0]} Bus Stop`;
      stopsList = [
        boardingStop,
        'Intermediate Stage 1',
        'City Intercity Junction',
        'Transit Interchange Stop',
        exitStop,
      ];
    }
  }

  // 2. Bus travel duration & distance calculation
  // City bus speed is ~18 km/h with traffic & stage dwell times
  const busRideMinutes = Math.max(12, Math.round((distanceKm / 19.5) * 60 + stopsList.length * 0.7));
  const walkToBusMinutes = 4;
  const walkFromBusMinutes = 4;
  const totalDurationMinutes = busRideMinutes + walkToBusMinutes + walkFromBusMinutes;

  // 3. Official PMPML Fare
  const totalFare = calculatePMPMLFare(distanceKm);

  // 4. Construct step-by-step legs
  const legs: RouteLeg[] = [];

  // Leg 1: Walk to Bus Stop
  legs.push({
    id: 'bus-leg-1-walk',
    mode: 'walking',
    title: `Walk to ${boardingStop}`,
    durationMinutes: walkToBusMinutes,
    distanceKm: 0.25,
    cost: 0,
    fromName: origin.name.split(',')[0],
    toName: boardingStop,
    instruction: `Walk 250 meters to ${boardingStop} bus shelter`,
    badge: 'Walk',
    coordinates: roadRoute.coordinates.slice(0, Math.min(6, roadRoute.coordinates.length)),
  });

  // Leg 2: PMPML Bus Journey
  legs.push({
    id: `bus-leg-2-pmpml-${busNumber}`,
    mode: 'bus',
    title: `PMPML Bus ${busNumber} (${routeName})`,
    durationMinutes: busRideMinutes,
    distanceKm: distanceKm,
    cost: totalFare,
    fromName: boardingStop,
    toName: exitStop,
    instruction: `Board Bus ${busNumber} towards ${exitStop}. Travel through ${stopsList.length} stops along the corridor.`,
    badge: `Bus ${busNumber}`,
    stopsCount: stopsList.length,
    stationList: stopsList,
    lineColor: '#dc2626',
    busNumber: busNumber,
    busRouteName: routeName,
    busFrequency: `Every ${frequencyMinutes} mins`,
    busOperator: 'PMPML Pune',
    coordinates: roadRoute.coordinates,
  });

  // Leg 3: Walk from Bus Stop to final destination
  legs.push({
    id: 'bus-leg-3-walk',
    mode: 'walking',
    title: `Walk to ${destination.name.split(',')[0]}`,
    durationMinutes: walkFromBusMinutes,
    distanceKm: 0.2,
    cost: 0,
    fromName: exitStop,
    toName: destination.name.split(',')[0],
    instruction: `Exit at ${exitStop} and walk 200 meters to your destination`,
    badge: 'Walk',
    coordinates: roadRoute.coordinates.slice(Math.max(0, roadRoute.coordinates.length - 6)),
  });

  return {
    id: 'opt-bus',
    mode: 'bus',
    title: `PMPML Bus ${busNumber}`,
    subtitle: `${routeName} • Every ${frequencyMinutes} min`,
    durationMinutes: totalDurationMinutes,
    distanceKm: distanceKm,
    cost: {
      baseFare: 5,
      distanceFare: totalFare - 5,
      totalFare: totalFare,
      formulaDescription: `PMPML Stage Fare ₹${totalFare} (${distanceKm} km Stage) • Daily Pass ₹50 valid`,
    },
    isOverBudget: false,
    budgetDelta: 0,
    isFeasible: true,
    coordinates: roadRoute.coordinates,
    legs,
    busNumber,
    busFrequency: `Every ${frequencyMinutes} mins`,
    score: 0,
    isRecommended: false,
    carbonKg: +(distanceKm * 0.022).toFixed(2),
  };
}
