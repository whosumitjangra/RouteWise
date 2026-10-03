import { LocationPoint, MetroStation, RouteLeg, RouteOption, StationWaypoint } from '../types';
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
 * Generates exact First-Mile, Metro Line boarding, District Court transfer, and Last-Mile path
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
  // If origin or destination is too far (> 5.5 km), flag unfeasible
  const maxFeederDist = FARE_CONFIG.metro.maxFeederWalkDistanceKm;
  const isDirectlyAccessible = originToStationKm <= maxFeederDist || destToStationKm <= maxFeederDist;
  const isSameStation = startStation.id === endStation.id;

  if (!isDirectlyAccessible || isSameStation) {
    return {
      id: 'opt-metro',
      mode: 'metro_multimodal',
      title: 'Pune Metro + Feeder',
      subtitle: `${startStation.name} ➔ ${endStation.name}`,
      durationMinutes: 0,
      distanceKm: 0,
      cost: {
        baseFare: 0,
        distanceFare: 0,
        totalFare: 0,
        formulaDescription: 'Not practical for this corridor',
      },
      isOverBudget: false,
      budgetDelta: 0,
      isFeasible: false,
      unfeasibleReason: isSameStation
        ? 'Both endpoints are adjacent to the same metro station; direct road commute is faster.'
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
  const stationWaypoints: StationWaypoint[] = [];

  const districtCourtStation = PUNE_METRO_STATIONS.find(
    (s) => s.name.includes('District Court') || s.name.includes('Civil Court')
  )!;

  let leg1MetroStationsCount = 0;
  let leg2MetroStationsCount = 0;

  if (startStation.line === endStation.line) {
    // Direct journey on same line
    stationsCount = Math.abs(startStation.order - endStation.order);
    leg1MetroStationsCount = stationsCount;
    
    // Collect stations along route for polyline
    const lineStations = PUNE_METRO_STATIONS.filter((s) => s.line === startStation.line);
    const minOrder = Math.min(startStation.order, endStation.order);
    const maxOrder = Math.max(startStation.order, endStation.order);
    const segment = lineStations.filter((s) => s.order >= minOrder && s.order <= maxOrder);
    
    if (startStation.order > endStation.order) {
      segment.reverse();
    }
    segment.forEach((s) => intermediateCoords.push([s.lng, s.lat]));

    // Waypoints for Map
    stationWaypoints.push({
      name: startStation.name,
      lat: startStation.lat,
      lng: startStation.lng,
      type: 'board',
      line: startStation.line,
      instruction: `Board ${startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'} towards ${
        startStation.order < endStation.order
          ? startStation.line === 'purple'
            ? 'Swargate'
            : 'Ramwadi'
          : startStation.line === 'purple'
          ? 'PCMC'
          : 'Vanaz'
      }`,
    });

    stationWaypoints.push({
      name: endStation.name,
      lat: endStation.lat,
      lng: endStation.lng,
      type: 'deboard',
      line: endStation.line,
      instruction: `Deboard at ${endStation.name}`,
    });

  } else {
    // Transfer required at District Court (Civil Court) Interchange
    hasInterchange = true;
    const startCourtOrder = startStation.line === 'purple' ? 11 : 9;
    const endCourtOrder = endStation.line === 'purple' ? 11 : 9;

    leg1MetroStationsCount = Math.abs(startStation.order - startCourtOrder);
    leg2MetroStationsCount = Math.abs(endStation.order - endCourtOrder);
    stationsCount = leg1MetroStationsCount + leg2MetroStationsCount;

    // Segment 1 (Start to District Court)
    const startLineStations = PUNE_METRO_STATIONS.filter((s) => s.line === startStation.line);
    const minStart = Math.min(startStation.order, startCourtOrder);
    const maxStart = Math.max(startStation.order, startCourtOrder);
    const seg1 = startLineStations.filter((s) => s.order >= minStart && s.order <= maxStart);
    if (startStation.order > startCourtOrder) seg1.reverse();
    seg1.forEach((s) => intermediateCoords.push([s.lng, s.lat]));

    // Segment 2 (District Court to Destination)
    const endLineStations = PUNE_METRO_STATIONS.filter((s) => s.line === endStation.line);
    const minEnd = Math.min(endCourtOrder, endStation.order);
    const maxEnd = Math.max(endCourtOrder, endStation.order);
    const seg2 = endLineStations.filter((s) => s.order >= minEnd && s.order <= maxEnd);
    if (endCourtOrder > endStation.order) seg2.reverse();
    seg2.forEach((s) => intermediateCoords.push([s.lng, s.lat]));

    // Waypoints for Map
    stationWaypoints.push({
      name: startStation.name,
      lat: startStation.lat,
      lng: startStation.lng,
      type: 'board',
      line: startStation.line,
      instruction: `Board ${startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'}`,
    });

    stationWaypoints.push({
      name: 'District Court (Interchange)',
      lat: districtCourtStation.lat,
      lng: districtCourtStation.lng,
      type: 'interchange',
      instruction: `Switch from ${
        startStation.line === 'purple' ? 'Purple Line ➔ Aqua Line' : 'Aqua Line ➔ Purple Line'
      } at Concourse`,
    });

    stationWaypoints.push({
      name: endStation.name,
      lat: endStation.lat,
      lng: endStation.lng,
      type: 'deboard',
      line: endStation.line,
      instruction: `Deboard at ${endStation.name}`,
    });
  }

  stationsCount = Math.max(1, stationsCount);

  // Metro Slab Fare Calculation
  let metroTicketFare = 35;
  for (const slab of FARE_CONFIG.metro.slabs) {
    if (stationsCount <= slab.maxStations) {
      metroTicketFare = slab.fare;
      break;
    }
  }

  // Metro Ride Duration: ~2.1 mins per station stop + dwell time + transfer
  const metroRideMinutes = Math.round(
    stationsCount * 2.1 + (hasInterchange ? FARE_CONFIG.metro.interchangeTransferBufferMinutes : 0)
  );

  // First-Mile Leg
  let firstMileMode: 'walking' | 'auto' = 'walking';
  let firstMileMinutes = 0;
  let firstMileCost = 0;
  let firstMileTitle = '';
  let firstMileInstruction = '';

  if (originToStationKm <= 1.0) {
    firstMileMode = 'walking';
    firstMileMinutes = Math.max(3, Math.round((originToStationKm / 4.8) * 60));
    firstMileCost = 0;
    firstMileTitle = `Walk to ${startStation.name}`;
    firstMileInstruction = `Walk ${originToStationKm} km from ${origin.name.split(',')[0]} to ${startStation.name}`;
  } else {
    firstMileMode = 'auto';
    firstMileMinutes = Math.max(4, Math.round((originToStationKm / 24) * 60));
    firstMileCost = 15; // Shared auto / e-rickshaw feeder in Pune
    firstMileTitle = `Feeder / Auto to ${startStation.name}`;
    firstMileInstruction = `Take a shared auto or e-rickshaw (${originToStationKm} km) to ${startStation.name}`;
  }

  // Last-Mile Leg (walking if <= 1.0 km, shared auto feeder if > 1.0 km)
  let lastMileMode: 'walking' | 'auto' = 'walking';
  let lastMileMinutes = 0;
  let lastMileCost = 0;
  let lastMileTitle = '';
  let lastMileInstruction = '';

  if (destToStationKm <= 1.0) {
    lastMileMode = 'walking';
    lastMileMinutes = Math.max(3, Math.round((destToStationKm / 4.8) * 60));
    lastMileCost = 0;
    lastMileTitle = `Walk to Destination`;
    lastMileInstruction = `Exit ${endStation.name} and walk ${destToStationKm} km to ${destination.name.split(',')[0]}`;
  } else {
    lastMileMode = 'auto';
    lastMileMinutes = Math.max(4, Math.round((destToStationKm / 24) * 60));
    lastMileCost = 15; // Shared auto / feeder at destination
    lastMileTitle = `Feeder / Auto to Destination`;
    lastMileInstruction = `Exit ${endStation.name} and take a shared auto or e-rickshaw (${destToStationKm} km) to ${destination.name.split(',')[0]}`;
  }

  // Boarding & entry buffer
  const stationEntryExitBuffer = 4;
  const totalDurationMinutes = firstMileMinutes + metroRideMinutes + lastMileMinutes + stationEntryExitBuffer;
  const totalFare = metroTicketFare + firstMileCost + lastMileCost;

  const metroDistanceKm = +(stationsCount * 1.25).toFixed(1);
  const totalDistanceKm = +(originToStationKm + metroDistanceKm + destToStationKm).toFixed(1);

  // Build Detailed Step-by-Step Legs
  const legs: RouteLeg[] = [];

  // Leg 1: Feeder
  legs.push({
    id: 'leg-1-feeder',
    mode: firstMileMode,
    title: firstMileTitle,
    durationMinutes: firstMileMinutes,
    distanceKm: originToStationKm,
    cost: firstMileCost,
    fromName: origin.name.split(',')[0],
    toName: startStation.name,
    instruction: firstMileInstruction,
    badge: firstMileMode === 'walking' ? 'Walk' : 'Feeder Auto',
    isFeeder: firstMileMode === 'auto',
    fromCoords: [origin.lat, origin.lng],
    toCoords: [startStation.lat, startStation.lng],
  });

  if (!hasInterchange) {
    // Direct Train Leg
    legs.push({
      id: 'leg-2-metro-direct',
      mode: 'metro_multimodal',
      title: `${startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'} Direct Train`,
      durationMinutes: metroRideMinutes,
      distanceKm: metroDistanceKm,
      cost: metroTicketFare,
      fromName: startStation.name,
      toName: endStation.name,
      instruction: `Board ${startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'} at ${startStation.name}. Travel ${stationsCount} stations directly to ${endStation.name}.`,
      badge: startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line',
      stopsCount: stationsCount,
    });
  } else {
    // Metro Leg 1 to District Court
    legs.push({
      id: 'leg-2-metro-part1',
      mode: 'metro_multimodal',
      title: `${startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'} to District Court`,
      durationMinutes: Math.round(leg1MetroStationsCount * 2.1),
      distanceKm: +(leg1MetroStationsCount * 1.25).toFixed(1),
      cost: 0,
      fromName: startStation.name,
      toName: 'District Court',
      instruction: `Board ${startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'} at ${startStation.name} towards District Court (${leg1MetroStationsCount} stops).`,
      badge: startStation.line === 'purple' ? 'Purple Line' : 'Aqua Line',
      stopsCount: leg1MetroStationsCount,
    });

    // Metro Interchange Transfer Leg
    legs.push({
      id: 'leg-2-metro-transfer',
      mode: 'walking',
      title: 'Transfer at District Court Interchange',
      durationMinutes: 4,
      distanceKm: 0.1,
      cost: 0,
      fromName: 'District Court (Level 1)',
      toName: 'District Court (Level 2)',
      instruction: `Get down at District Court Interchange. Follow overhead signs to switch from ${
        startStation.line === 'purple' ? 'Purple Line ➔ Aqua Line' : 'Aqua Line ➔ Purple Line'
      }. No extra ticket required.`,
      badge: '🔄 Line Transfer',
    });

    // Metro Leg 2 from District Court to Destination Station
    legs.push({
      id: 'leg-2-metro-part2',
      mode: 'metro_multimodal',
      title: `${endStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'} to ${endStation.name}`,
      durationMinutes: Math.round(leg2MetroStationsCount * 2.1),
      distanceKm: +(leg2MetroStationsCount * 1.25).toFixed(1),
      cost: metroTicketFare,
      fromName: 'District Court',
      toName: endStation.name,
      instruction: `Board ${endStation.line === 'purple' ? 'Purple Line' : 'Aqua Line'} at District Court and travel ${leg2MetroStationsCount} stops to ${endStation.name}.`,
      badge: endStation.line === 'purple' ? 'Purple Line' : 'Aqua Line',
      stopsCount: leg2MetroStationsCount,
    });
  }

  // Leg 3: Last-Mile Leg
  legs.push({
    id: 'leg-3-feeder',
    mode: lastMileMode,
    title: lastMileTitle,
    durationMinutes: lastMileMinutes,
    distanceKm: destToStationKm,
    cost: lastMileCost,
    fromName: endStation.name,
    toName: destination.name.split(',')[0],
    instruction: lastMileInstruction,
    badge: lastMileMode === 'walking' ? 'Walk' : 'Feeder Auto',
    isFeeder: lastMileMode === 'auto',
    fromCoords: [endStation.lat, endStation.lng],
    toCoords: [destination.lat, destination.lng],
  });

  // Polyline coordinates
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
      timeFare: firstMileCost + lastMileCost,
      totalFare: totalFare,
      formulaDescription: `Maha Metro Fare ₹${metroTicketFare} (${stationsCount} stations)${
        firstMileCost > 0 ? ` + ₹${firstMileCost} first-mile` : ''
      }${lastMileCost > 0 ? ` + ₹${lastMileCost} last-mile` : ''}`,
    },
    isOverBudget: false,
    budgetDelta: 0,
    isFeasible: true,
    coordinates,
    legs,
    stationWaypoints,
    score: 0,
    isRecommended: false,
    carbonKg: +(totalDistanceKm * 0.015).toFixed(2),
  };
}
