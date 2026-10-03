import { LocationPoint, MetroStation, RouteLeg, RouteOption } from '../types';
import { PUNE_METRO_STATIONS } from '../config/metroData';
import { FARE_CONFIG } from '../config/fares';
import { haversineDistanceKm } from './mapbox';

export interface NearestStationResult {
  station: MetroStation;
  distanceKm: number;
}

export function findNearestMetroStation(point: LocationPoint): NearestStationResult {
  let closest = PUNE_METRO_STATIONS[0];
  let minDistance = Infinity;

  for (const station of PUNE_METRO_STATIONS) {
    const dist = haversineDistanceKm(point.lat, point.lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = station;
    }
  }

  return {
    station: closest,
    distanceKm: +minDistance.toFixed(1),
  };
}

/**
 * Deterministic Pune Metro Multi-Modal Route Generator
 * Combines First-Mile Feeder ➔ Pune Metro Train ➔ Last-Mile Walk
 */
export function buildPuneMetroOption(
  origin: LocationPoint,
  destination: LocationPoint
): RouteOption {
  const originStationInfo = findNearestMetroStation(origin);
  const destStationInfo = findNearestMetroStation(destination);

  const startStation = originStationInfo.station;
  const endStation = destStationInfo.station;
  const originToStationKm = originStationInfo.distanceKm;
  const destToStationKm = destStationInfo.distanceKm;

  // Feasibility Check
  // If origin or destination is too far from any metro line (> 5.5 km), flag unfeasible
  const maxFeederDist = FARE_CONFIG.metro.maxFeederWalkDistanceKm;
  const isDirectlyAccessible = originToStationKm <= maxFeederDist || destToStationKm <= maxFeederDist;
  const isSameStation = startStation.id === endStation.id;

  if (!isDirectlyAccessible || isSameStation) {
    return {
      id: 'opt-metro',
      mode: 'metro_multimodal',
      title: 'Pune Metro + Walking',
      subtitle: `${startStation.name} ➔ ${endStation.name}`,
      durationMinutes: 0,
      distanceKm: 0,
      cost: {
        baseFare: 0,
        distanceFare: 0,
        totalFare: 0,
        formulaDescription: 'Not applicable for this corridor',
      },
      isOverBudget: false,
      budgetDelta: 0,
      isFeasible: false,
      unfeasibleReason: isSameStation
        ? 'Both endpoints are near the same station; walking or auto is recommended.'
        : `Nearest metro station (${startStation.name}) is ${originToStationKm} km away. Road travel is faster.`,
      coordinates: [],
      legs: [],
      score: 999,
      isRecommended: false,
      carbonKg: 0,
    };
  }

  // Calculate Station Traversal on Metro Graph
  let stationsCount = 0;
  let hasInterchange = false;
  const intermediateCoords: [number, number][] = [];

  const districtCourtStation = PUNE_METRO_STATIONS.find(
    (s) => s.name.includes('District Court') || s.name.includes('Civil Court')
  )!;

  if (startStation.line === endStation.line) {
    // Direct journey on same line
    stationsCount = Math.abs(startStation.order - endStation.order);
    
    // Collect stations along route for polyline
    const lineStations = PUNE_METRO_STATIONS.filter((s) => s.line === startStation.line);
    const minOrder = Math.min(startStation.order, endStation.order);
    const maxOrder = Math.max(startStation.order, endStation.order);
    const segment = lineStations.filter((s) => s.order >= minOrder && s.order <= maxOrder);
    
    if (startStation.order > endStation.order) {
      segment.reverse();
    }
    segment.forEach((s) => intermediateCoords.push([s.lng, s.lat]));
  } else {
    // Transfer required at District Court (Civil Court) Interchange
    hasInterchange = true;
    const startLegStations = Math.abs(startStation.order - (startStation.line === 'purple' ? 11 : 9));
    const endLegStations = Math.abs(endStation.order - (endStation.line === 'purple' ? 11 : 9));
    stationsCount = startLegStations + endLegStations;

    // Collect coordinates along start line to interchange, then to destination
    const startLineStations = PUNE_METRO_STATIONS.filter((s) => s.line === startStation.line);
    const startCourtOrder = startStation.line === 'purple' ? 11 : 9;
    const minStart = Math.min(startStation.order, startCourtOrder);
    const maxStart = Math.max(startStation.order, startCourtOrder);
    const seg1 = startLineStations.filter((s) => s.order >= minStart && s.order <= maxStart);
    if (startStation.order > startCourtOrder) seg1.reverse();
    seg1.forEach((s) => intermediateCoords.push([s.lng, s.lat]));

    const endLineStations = PUNE_METRO_STATIONS.filter((s) => s.line === endStation.line);
    const endCourtOrder = endStation.line === 'purple' ? 11 : 9;
    const minEnd = Math.min(endCourtOrder, endStation.order);
    const maxEnd = Math.max(endCourtOrder, endStation.order);
    const seg2 = endLineStations.filter((s) => s.order >= minEnd && s.order <= maxEnd);
    if (endCourtOrder > endStation.order) seg2.reverse();
    seg2.forEach((s) => intermediateCoords.push([s.lng, s.lat]));
  }

  // Ensure at least 1 station if adjacent
  stationsCount = Math.max(1, stationsCount);

  // Metro Slab Fare Calculation
  let metroTicketFare = 35;
  for (const slab of FARE_CONFIG.metro.slabs) {
    if (stationsCount <= slab.maxStations) {
      metroTicketFare = slab.fare;
      break;
    }
  }

  // Metro Train Duration: ~2.1 minutes per station stop + dwell time + transfer
  const metroRideMinutes = Math.round(
    stationsCount * 2.1 + (hasInterchange ? FARE_CONFIG.metro.interchangeTransferBufferMinutes : 0)
  );

  // First-Mile Leg (Origin ➔ Start Station)
  let firstMileMode: 'walking' | 'auto' = 'walking';
  let firstMileMinutes = 0;
  let firstMileCost = 0;
  let firstMileInstruction = '';

  if (originToStationKm <= 1.2) {
    firstMileMode = 'walking';
    firstMileMinutes = Math.max(3, Math.round((originToStationKm / 4.8) * 60));
    firstMileCost = 0;
    firstMileInstruction = `Walk ${originToStationKm} km to ${startStation.name}`;
  } else {
    firstMileMode = 'auto';
    firstMileMinutes = Math.max(4, Math.round((originToStationKm / 24) * 60));
    firstMileCost = 15; // Shared auto / e-rickshaw feeder fare in Pune
    firstMileInstruction = `E-Rickshaw / Shared Auto to ${startStation.name}`;
  }

  // Last-Mile Leg (End Station ➔ Destination)
  const lastMileMinutes = Math.max(3, Math.round((destToStationKm / 4.8) * 60));
  const lastMileInstruction = `Walk ${destToStationKm} km from ${endStation.name} to destination`;

  // Boarding & concourse buffer (turnstiles, escalator)
  const stationEntryExitBuffer = 4;
  const totalDurationMinutes = firstMileMinutes + metroRideMinutes + lastMileMinutes + stationEntryExitBuffer;
  const totalFare = metroTicketFare + firstMileCost;

  // Approximate Metro Corridor Distance
  const metroDistanceKm = +(stationsCount * 1.25).toFixed(1);
  const totalDistanceKm = +(originToStationKm + metroDistanceKm + destToStationKm).toFixed(1);

  const legs: RouteLeg[] = [
    {
      id: 'leg-1-feeder',
      mode: firstMileMode,
      title: `First-Mile: ${firstMileInstruction}`,
      durationMinutes: firstMileMinutes,
      distanceKm: originToStationKm,
      cost: firstMileCost,
      fromName: origin.name.split(',')[0],
      toName: startStation.name,
      instruction: firstMileInstruction,
    },
    {
      id: 'leg-2-metro',
      mode: 'metro_multimodal',
      title: `Pune Metro (${startStation.name} ➔ ${endStation.name})`,
      durationMinutes: metroRideMinutes,
      distanceKm: metroDistanceKm,
      cost: metroTicketFare,
      fromName: startStation.name,
      toName: endStation.name,
      instruction: hasInterchange
        ? `Board ${startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'}, interchange at District Court, continue to ${endStation.name} (${stationsCount} stations)`
        : `Direct train on ${startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'} (${stationsCount} stations)`,
    },
    {
      id: 'leg-3-walk',
      mode: 'walking',
      title: `Last-Mile: ${lastMileInstruction}`,
      durationMinutes: lastMileMinutes,
      distanceKm: destToStationKm,
      cost: 0,
      fromName: endStation.name,
      toName: destination.name.split(',')[0],
      instruction: lastMileInstruction,
    },
  ];

  // Assemble Complete Polyline Coordinates: Origin ➔ StartStation ➔ Metro Alignment ➔ EndStation ➔ Destination
  const coordinates: [number, number][] = [
    [origin.lng, origin.lat],
    ...intermediateCoords,
    [destination.lng, destination.lat],
  ];

  const lineDesc = hasInterchange
    ? 'Interchange via District Court'
    : startStation.line === 'purple'
    ? 'Purple Line (Direct)'
    : 'Aqua Line (Direct)';

  return {
    id: 'opt-metro',
    mode: 'metro_multimodal',
    title: 'Pune Metro + Feeder',
    subtitle: `${startStation.name} ➔ ${endStation.name} (${lineDesc})`,
    durationMinutes: totalDurationMinutes,
    distanceKm: totalDistanceKm,
    cost: {
      baseFare: metroTicketFare,
      distanceFare: 0,
      timeFare: firstMileCost,
      totalFare: totalFare,
      formulaDescription: `Metro ticket ₹${metroTicketFare} (${stationsCount} stations) ${
        firstMileCost > 0 ? `+ ₹${firstMileCost} feeder` : '+ Walking'
      }`,
    },
    isOverBudget: false,
    budgetDelta: 0,
    isFeasible: true,
    coordinates,
    legs,
    score: 0,
    isRecommended: false,
    carbonKg: +(totalDistanceKm * 0.015).toFixed(2), // Very low carbon
  };
}
