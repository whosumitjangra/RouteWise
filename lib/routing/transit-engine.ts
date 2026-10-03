import { LocationPoint, RouteCostBreakdown, RouteLeg, RouteOption } from '../types';
import { haversineDistance } from './airports';

export interface TransitRouteResult {
  trainOption: RouteOption | null;
  busOption: RouteOption | null;
  metroOption: RouteOption | null;
}

/**
 * Deterministic GTFS / Transit simulation engine.
 * Calculates station routing, headways, realistic timetables, and tiered fare matrices.
 */
export function calculateTransitRoutes(
  origin: LocationPoint,
  destination: LocationPoint,
  drivingCoordinates: [number, number][],
  currency: string = 'USD'
): TransitRouteResult {
  const directDistance = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  const now = new Date();

  // Helper to format departure and arrival
  const formatTime = (minutesFromNow: number) => {
    const d = new Date(now.getTime() + minutesFromNow * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 1. Intercity / Regional Rail (Train)
  let trainOption: RouteOption | null = null;
  if (directDistance >= 20) {
    const railCircuity = 1.15;
    const distanceKm = +(directDistance * railCircuity).toFixed(1);
    
    // Average train speed: 95 km/h for regional, up to 160 km/h for longer distances
    const speedKmh = distanceKm > 150 ? 130 : 90;
    const travelMinutes = Math.round((distanceKm / speedKmh) * 60);
    const stationTransferBufferMinutes = 25; // Getting to station & board
    const durationMinutes = travelMinutes + stationTransferBufferMinutes;

    // Deterministic Tiered Fare Matrix
    // Base: $8.50, Tier 1 (<50km): $0.18/km, Tier 2 (50-200km): $0.14/km, Tier 3 (>200km): $0.10/km
    let baseFare = 8.50;
    let distanceCost = 0;
    if (distanceKm <= 50) {
      distanceCost = distanceKm * 0.18;
    } else if (distanceKm <= 200) {
      distanceCost = 50 * 0.18 + (distanceKm - 50) * 0.14;
    } else {
      distanceCost = 50 * 0.18 + 150 * 0.14 + (distanceKm - 200) * 0.10;
    }

    const bookingFee = 1.50;
    const totalCost = +(baseFare + distanceCost + bookingFee).toFixed(2);

    const costBreakdown: RouteCostBreakdown = {
      baseFare,
      distanceCost: +distanceCost.toFixed(2),
      timeCost: 0,
      bookingFee,
      totalCost,
    };

    // Eco impact: Rail is very low carbon ~ 0.035 kg CO2 per passenger-km
    const co2Kg = +(distanceKm * 0.035).toFixed(1);

    // Create train polyline (smoother rail corridor)
    const trainCoords = generateRailCorridor(origin, destination, drivingCoordinates);

    const originStation = `${origin.city || origin.name.split(',')[0]} Central Station`;
    const destStation = `${destination.city || destination.name.split(',')[0]} Main Terminal`;

    const legs: RouteLeg[] = [
      {
        id: 'train-leg-1',
        mode: 'transit',
        title: `Transfer to ${originStation}`,
        instruction: 'Subway or commuter shuttle to primary rail concourse',
        durationMinutes: 15,
        distanceKm: 3.5,
        cost: 2.75,
        departureTime: formatTime(10),
        arrivalTime: formatTime(25),
      },
      {
        id: 'train-leg-2',
        mode: 'train',
        title: `Intercity Express Train (${originStation} ➔ ${destStation})`,
        instruction: `Direct high-frequency rail express corridor`,
        durationMinutes: travelMinutes,
        distanceKm: distanceKm,
        cost: +(totalCost - 2.75).toFixed(2),
        departureTime: formatTime(35),
        arrivalTime: formatTime(35 + travelMinutes),
        fromName: originStation,
        toName: destStation,
      },
      {
        id: 'train-leg-3',
        mode: 'walking',
        title: `Walk from ${destStation} to final arrival`,
        instruction: `Exit north gate and walk to destination`,
        durationMinutes: 10,
        distanceKm: 0.8,
        cost: 0,
        departureTime: formatTime(35 + travelMinutes),
        arrivalTime: formatTime(45 + travelMinutes),
      },
    ];

    trainOption = {
      id: 'mode-train',
      mode: 'train',
      title: 'Regional / Intercity Rail',
      subTitle: `${originStation} ➔ ${destStation}`,
      provider: 'National Rail / Express Line',
      iconName: 'Train',
      durationMinutes,
      distanceKm,
      cost: costBreakdown,
      co2Kg,
      isOverBudget: false,
      budgetDelta: 0,
      score: 0,
      badges: [],
      coordinates: trainCoords,
      legs,
      highlights: [
        'Dedicated right-of-way (zero highway traffic delays)',
        'Onboard Wi-Fi and power outlets standard',
        'Spacious legroom and luggage storage',
      ],
      reliabilityScore: 94,
      departureTimeFormatted: formatTime(25),
      arrivalTimeFormatted: formatTime(25 + durationMinutes),
    };
  }

  // 2. Intercity / Long-Distance Bus (Coach)
  let busOption: RouteOption | null = null;
  if (directDistance >= 15) {
    const coachCircuity = 1.22;
    const distanceKm = +(directDistance * coachCircuity).toFixed(1);
    
    // Coach speed ~ 60 km/h (with intermediate pickup stops)
    const speedKmh = distanceKm > 100 ? 70 : 50;
    const travelMinutes = Math.round((distanceKm / speedKmh) * 60);
    const bufferMinutes = 15;
    const durationMinutes = travelMinutes + bufferMinutes;

    // Bus Fare: Budget friendly
    // Base: $4.50 + $0.065 per km
    const baseFare = 4.50;
    const distanceCost = +(distanceKm * 0.065).toFixed(2);
    const bookingFee = 1.00;
    const totalCost = +(baseFare + distanceCost + bookingFee).toFixed(2);

    const costBreakdown: RouteCostBreakdown = {
      baseFare,
      distanceCost,
      timeCost: 0,
      bookingFee,
      totalCost,
    };

    // Bus CO2: ~ 0.055 kg CO2/passenger-km
    const co2Kg = +(distanceKm * 0.055).toFixed(1);

    const originBusDepot = `${origin.city || origin.name.split(',')[0]} Intercity Coach Hub`;
    const destBusDepot = `${destination.city || destination.name.split(',')[0]} Transit Plaza`;

    const legs: RouteLeg[] = [
      {
        id: 'bus-leg-1',
        mode: 'walking',
        title: `Walk to ${originBusDepot}`,
        instruction: 'Short walk or transit feeder to boarding platform',
        durationMinutes: 10,
        distanceKm: 0.6,
        cost: 0,
      },
      {
        id: 'bus-leg-2',
        mode: 'bus',
        title: `Intercity Express Coach`,
        instruction: `Highway coach via expressway corridor`,
        durationMinutes: travelMinutes,
        distanceKm,
        cost: totalCost,
        fromName: originBusDepot,
        toName: destBusDepot,
      },
      {
        id: 'bus-leg-3',
        mode: 'walking',
        title: `Arrival connection`,
        instruction: `Walk to destination from ${destBusDepot}`,
        durationMinutes: 5,
        distanceKm: 0.4,
        cost: 0,
      },
    ];

    busOption = {
      id: 'mode-bus',
      mode: 'bus',
      title: 'Intercity Bus / Coach',
      subTitle: `${originBusDepot} ➔ ${destBusDepot}`,
      provider: 'Regional Express Coach',
      iconName: 'Bus',
      durationMinutes,
      distanceKm,
      cost: costBreakdown,
      co2Kg,
      isOverBudget: false,
      budgetDelta: 0,
      score: 0,
      badges: [],
      coordinates: drivingCoordinates, // follows highway
      legs,
      highlights: [
        'Most economical long-distance motorized travel',
        'Guaranteed seat with climate control',
        'Frequent scheduled departures',
      ],
      reliabilityScore: 86,
      departureTimeFormatted: formatTime(20),
      arrivalTimeFormatted: formatTime(20 + durationMinutes),
    };
  }

  // 3. Urban Metro / City Transit (for urban/suburban distance < 65 km)
  let metroOption: RouteOption | null = null;
  if (directDistance <= 65) {
    const metroCircuity = 1.20;
    const distanceKm = +(directDistance * metroCircuity).toFixed(1);
    
    // Metro speed: ~32 km/h (including 1.5m stop dwell times)
    const travelMinutes = Math.max(12, Math.round((distanceKm / 32) * 60));
    const durationMinutes = travelMinutes + 12; // 12 min walk & turnstile transfer

    // Tiered Metro Fare: $2.50 base (up to 8km), then $0.25 per 4km
    const baseFare = 2.50;
    const extraDistance = Math.max(0, distanceKm - 8);
    const distanceCost = +(extraDistance * 0.08).toFixed(2);
    const totalCost = +(baseFare + distanceCost).toFixed(2);

    const costBreakdown: RouteCostBreakdown = {
      baseFare,
      distanceCost,
      timeCost: 0,
      totalCost,
    };

    const co2Kg = +(distanceKm * 0.028).toFixed(1);

    const legs: RouteLeg[] = [
      {
        id: 'metro-leg-1',
        mode: 'walking',
        title: 'Walk to nearest Metro / Subway station',
        instruction: 'Head to entrance concourse',
        durationMinutes: 6,
        distanceKm: 0.4,
        cost: 0,
      },
      {
        id: 'metro-leg-2',
        mode: 'transit',
        title: 'Metro Blue / Line 1 Rapid Transit',
        instruction: `${Math.round(distanceKm / 1.6)} stations along urban transit line`,
        durationMinutes: travelMinutes,
        distanceKm,
        cost: totalCost,
      },
      {
        id: 'metro-leg-3',
        mode: 'walking',
        title: 'Walk to destination',
        instruction: 'Exit station via south portal and walk 500m',
        durationMinutes: 6,
        distanceKm: 0.5,
        cost: 0,
      },
    ];

    metroOption = {
      id: 'mode-transit',
      mode: 'transit',
      title: 'Urban Metro & Rapid Transit',
      subTitle: 'City Rail / Subway Network',
      provider: 'Metropolitan Transit Authority',
      iconName: 'Tram',
      durationMinutes,
      distanceKm,
      cost: costBreakdown,
      co2Kg,
      isOverBudget: false,
      budgetDelta: 0,
      score: 0,
      badges: [],
      coordinates: drivingCoordinates,
      legs,
      highlights: [
        'Avoid all surface street congestion',
        'Consistent departure headways every 6-8 minutes',
        'Standard tap-to-pay contact card fare',
      ],
      reliabilityScore: 96,
      departureTimeFormatted: formatTime(6),
      arrivalTimeFormatted: formatTime(6 + durationMinutes),
    };
  }

  return {
    trainOption,
    busOption,
    metroOption,
  };
}

/**
 * Generate a gentle, track-like curve corridor for train routes
 */
function generateRailCorridor(
  origin: LocationPoint,
  dest: LocationPoint,
  fallbackCoords: [number, number][]
): [number, number][] {
  if (fallbackCoords && fallbackCoords.length > 5) {
    // Smooth out street turns to look like a dedicated rail right-of-way
    const res: [number, number][] = [];
    const step = Math.max(1, Math.floor(fallbackCoords.length / 30));
    for (let i = 0; i < fallbackCoords.length; i += step) {
      res.push(fallbackCoords[i]);
    }
    if (res[res.length - 1] !== fallbackCoords[fallbackCoords.length - 1]) {
      res.push(fallbackCoords[fallbackCoords.length - 1]);
    }
    return res;
  }

  // Bezier corridor
  const points: [number, number][] = [];
  const steps = 30;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = origin.lat + t * (dest.lat - origin.lat);
    const lng = origin.lng + t * (dest.lng - origin.lng);
    points.push([+lat.toFixed(5), +lng.toFixed(5)]);
  }
  return points;
}
