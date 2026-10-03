import { LocationPoint, RouteCostBreakdown, RouteLeg, RouteOption } from '../types';
import { findClosestAirport, haversineDistance } from './airports';

/**
 * Deterministic flight pricing and flight physics engine.
 * Computes origin hub, destination hub, door-to-door ground transfers, and flight curve polyline.
 */
export function calculateFlightOption(
  origin: LocationPoint,
  destination: LocationPoint,
  currency: string = 'USD',
  flightBaseTax: number = 42.0,
  flightPerKmRate: number = 0.092
): RouteOption | null {
  const directDistance = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);

  // Commercial flights are only viable for distances > 140 km
  if (directDistance < 140) {
    return null;
  }

  const originAirport = findClosestAirport(origin.lat, origin.lng);
  const destAirport = findClosestAirport(destination.lat, destination.lng);

  // Distance between airport hubs
  const flightDistanceKm = haversineDistance(
    originAirport.airport.lat,
    originAirport.airport.lng,
    destAirport.airport.lat,
    destAirport.airport.lng
  );

  // Flight duration physics:
  // 35 mins climb/descent/air traffic control + cruise at 780 km/h
  const airborneMinutes = Math.round(35 + (flightDistanceKm / 780) * 60);

  // Door-to-door ground buffers:
  // 75 mins check-in / security clearance + 30 mins baggage & deplaning + ground travel to/from airports
  const toAirportMinutes = Math.max(25, Math.round((originAirport.distanceKm / 45) * 60));
  const fromAirportMinutes = Math.max(25, Math.round((destAirport.distanceKm / 45) * 60));
  const airportSecurityAndBoardingMinutes = 80;
  const airportArrivalAndExitMinutes = 30;

  const totalDurationMinutes =
    toAirportMinutes +
    airportSecurityAndBoardingMinutes +
    airborneMinutes +
    airportArrivalAndExitMinutes +
    fromAirportMinutes;

  // Generalized Cost Engine for Flight:
  // C_flight = C_tax + (D * R_km)
  // Plus ground connection costs: ~$20 to origin airport, ~$18 to destination
  const groundCabOriginCost = +(12.0 + originAirport.distanceKm * 0.9).toFixed(2);
  const groundCabDestCost = +(10.0 + destAirport.distanceKm * 0.85).toFixed(2);

  const baseFare = +(flightDistanceKm * flightPerKmRate).toFixed(2);
  const taxesAndFees = flightBaseTax;
  const bookingFee = 9.50;
  const totalCost = +(baseFare + taxesAndFees + bookingFee + groundCabOriginCost + groundCabDestCost).toFixed(2);

  const costBreakdown: RouteCostBreakdown = {
    baseFare,
    distanceCost: baseFare,
    timeCost: 0,
    taxesAndFees: taxesAndFees + bookingFee,
    totalCost,
  };

  // Aviation emissions: ~ 0.165 kg CO2 per passenger-km
  const co2Kg = +(flightDistanceKm * 0.165).toFixed(1);

  // Flight polyline: Great circle curve between airport coordinates
  const flightCoordinates = generateFlightArc(
    [origin.lat, origin.lng],
    [originAirport.airport.lat, originAirport.airport.lng],
    [destAirport.airport.lat, destAirport.airport.lng],
    [destination.lat, destination.lng]
  );

  const now = new Date();
  const formatTime = (minutesFromNow: number) => {
    const d = new Date(now.getTime() + minutesFromNow * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const legs: RouteLeg[] = [
    {
      id: 'flight-leg-1',
      mode: 'rideshare',
      title: `Cab to ${originAirport.airport.name} (${originAirport.airport.iata})`,
      instruction: `Depart origin via express shuttle or rideshare to Terminal 1 departures`,
      durationMinutes: toAirportMinutes,
      distanceKm: +originAirport.distanceKm.toFixed(1),
      cost: groundCabOriginCost,
      departureTime: formatTime(15),
      arrivalTime: formatTime(15 + toAirportMinutes),
    },
    {
      id: 'flight-leg-2',
      mode: 'flight',
      title: `Flight ${originAirport.airport.iata} ➔ ${destAirport.airport.iata}`,
      instruction: `Commercial nonstop / regional link (Airborne ${airborneMinutes}m, cruising altitude 33,000 ft)`,
      durationMinutes: airborneMinutes + airportSecurityAndBoardingMinutes + airportArrivalAndExitMinutes,
      distanceKm: +flightDistanceKm.toFixed(1),
      cost: +(baseFare + taxesAndFees + bookingFee).toFixed(2),
      departureTime: formatTime(15 + toAirportMinutes + airportSecurityAndBoardingMinutes),
      arrivalTime: formatTime(15 + toAirportMinutes + airportSecurityAndBoardingMinutes + airborneMinutes),
      fromName: `${originAirport.airport.name} (${originAirport.airport.iata})`,
      toName: `${destAirport.airport.name} (${destAirport.airport.iata})`,
    },
    {
      id: 'flight-leg-3',
      mode: 'transit',
      title: `Airport Express / Shuttle from ${destAirport.airport.iata} to Destination`,
      instruction: `Rail link or express connector to city center`,
      durationMinutes: fromAirportMinutes,
      distanceKm: +destAirport.distanceKm.toFixed(1),
      cost: groundCabDestCost,
      departureTime: formatTime(totalDurationMinutes - fromAirportMinutes),
      arrivalTime: formatTime(totalDurationMinutes),
    },
  ];

  return {
    id: 'mode-flight',
    mode: 'flight',
    title: 'Commercial Flight + Transfers',
    subTitle: `${originAirport.airport.iata} ➔ ${destAirport.airport.iata}`,
    provider: `${originAirport.airport.iata} Express Air`,
    iconName: 'Plane',
    durationMinutes: totalDurationMinutes,
    distanceKm: +(originAirport.distanceKm + flightDistanceKm + destAirport.distanceKm).toFixed(1),
    cost: costBreakdown,
    co2Kg,
    isOverBudget: false,
    budgetDelta: 0,
    score: 0,
    badges: [],
    coordinates: flightCoordinates,
    legs,
    highlights: [
      `Airports: ${originAirport.airport.iata} (${originAirport.airport.city}) to ${destAirport.airport.iata} (${destAirport.airport.city})`,
      `Fastest travel over long distances (${airborneMinutes} mins in air)`,
      'Door-to-door ground connections included in price and timetable',
    ],
    reliabilityScore: 89,
    departureTimeFormatted: formatTime(15),
    arrivalTimeFormatted: formatTime(15 + totalDurationMinutes),
  };
}

/**
 * Generate a curved flight path polyline with takeoff and landing arcs
 */
function generateFlightArc(
  origin: [number, number],
  originAirport: [number, number],
  destAirport: [number, number],
  dest: [number, number]
): [number, number][] {
  const points: [number, number][] = [origin, originAirport];

  const steps = 35;
  const dLat = destAirport[0] - originAirport[0];
  const dLng = destAirport[1] - originAirport[1];

  // Great circle curvature bow
  const chordLen = Math.sqrt(dLat * dLat + dLng * dLng);
  const bowFactor = Math.min(0.2, chordLen * 0.08);

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    // Parabolic arc deflection
    const arcHeight = Math.sin(t * Math.PI) * bowFactor;
    // Deflect perpendicular to direction
    const lat = originAirport[0] + t * dLat + arcHeight * 0.5;
    const lng = originAirport[1] + t * dLng + arcHeight * 0.8;
    points.push([+lat.toFixed(5), +lng.toFixed(5)]);
  }

  points.push(destAirport);
  points.push(dest);
  return points;
}
