import { 
  EngineParameters, 
  LocationPoint, 
  PriorityMode, 
  RouteCostBreakdown, 
  RouteOption, 
  RouteSearchRequest, 
  RouteSearchResponse 
} from '../types';
import { haversineDistance } from './airports';
import { fetchOSRMRoute, generateSyntheticRoute } from './osrm';
import { calculateTransitRoutes } from './transit-engine';
import { calculateFlightOption } from './flight-engine';

export const DEFAULT_ENGINE_PARAMS: EngineParameters = {
  fuelPricePerLiter: 1.25, // ~$4.70/gal or ~€1.15/L or normalized USD
  fuelEfficiencyKmPerLiter: 13.5, // ~31.7 MPG
  tollEstimatePer100Km: 4.50,
  rideshareBaseFare: 3.50,
  ridesharePerKmRate: 1.15,
  ridesharePerMinuteRate: 0.32,
  rideshareSurgeMultiplier: 1.0,
  rideshareBookingFee: 2.25,
  flightBaseTax: 42.0,
  flightPerKmRate: 0.092,
  valueOfTimePerHour: 18.0, // Used for generalized economic cost
};

/**
 * Main Deterministic Engine orchestrator.
 * Computes all transport modes in parallel, calculates exact costs,
 * filters against maxBudget, ranks based on priority, and assigns dynamic badges.
 */
export async function calculateAllRoutes(request: RouteSearchRequest): Promise<RouteSearchResponse> {
  const startTime = performance.now();
  const { origin, destination, maxBudget, priority, currency, customParams } = request;
  
  const params: EngineParameters = {
    ...DEFAULT_ENGINE_PARAMS,
    ...(customParams || {}),
  };

  const directDistanceKm = +haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng).toFixed(1);

  // 1. Parallel execution: Fetch driving & walking from OSRM
  const [osrmDriving, osrmWalking] = await Promise.all([
    fetchOSRMRoute(origin, destination, 'driving'),
    directDistanceKm <= 25 
      ? fetchOSRMRoute(origin, destination, 'walking')
      : Promise.resolve(null),
  ]);

  const drivingDistanceKm = osrmDriving.distanceKm;
  const drivingDurationMins = osrmDriving.durationMinutes;

  const routes: RouteOption[] = [];
  const now = new Date();
  const formatTime = (minutesFromNow: number) => {
    const d = new Date(now.getTime() + minutesFromNow * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // -------------------------------------------------------------
  // MODE 1: PERSONAL DRIVING
  // Formula: C_drive = ((D / Fuel Efficiency) * Fuel Price) + C_tolls
  // -------------------------------------------------------------
  {
    const fuelLiters = drivingDistanceKm / Math.max(1, params.fuelEfficiencyKmPerLiter);
    const fuelCost = +(fuelLiters * params.fuelPricePerLiter).toFixed(2);
    const tollsCost = +((drivingDistanceKm / 100) * params.tollEstimatePer100Km).toFixed(2);
    const totalDriveCost = +(fuelCost + tollsCost).toFixed(2);

    const driveCostBreakdown: RouteCostBreakdown = {
      baseFare: 0,
      distanceCost: fuelCost,
      timeCost: 0,
      fuelCost,
      tollsCost,
      totalCost: totalDriveCost,
    };

    // Driving emissions: ~ 0.170 kg CO2 / km
    const co2Kg = +(drivingDistanceKm * 0.170).toFixed(1);

    routes.push({
      id: 'mode-driving',
      mode: 'driving',
      title: 'Personal Vehicle / Driving',
      subTitle: `${drivingDistanceKm} km via highway corridor`,
      provider: 'Personal Car',
      iconName: 'Car',
      durationMinutes: drivingDurationMins,
      distanceKm: drivingDistanceKm,
      cost: driveCostBreakdown,
      co2Kg,
      isOverBudget: totalDriveCost > maxBudget,
      budgetDelta: +(totalDriveCost - maxBudget).toFixed(2),
      score: 0,
      badges: [],
      coordinates: osrmDriving.coordinates,
      legs: osrmDriving.legs,
      highlights: [
        `Direct route with maximum schedule flexibility`,
        `Estimated ${fuelLiters.toFixed(1)} L fuel consumed`,
        `Estimated tolls: $${tollsCost.toFixed(2)}`,
      ],
      reliabilityScore: 92,
      departureTimeFormatted: 'Immediate',
      arrivalTimeFormatted: formatTime(drivingDurationMins),
    });
  }

  // -------------------------------------------------------------
  // MODE 2: RIDESHARE / ON-DEMAND (Uber / Taxi / Rapido)
  // Formula: C_rideshare = (C_base + (D * R_dist) + (T * R_time)) * S_surge + Booking
  // -------------------------------------------------------------
  if (drivingDistanceKm <= 200) {
    const rawRideCost = 
      params.rideshareBaseFare +
      (drivingDistanceKm * params.ridesharePerKmRate) +
      (drivingDurationMins * params.ridesharePerMinuteRate);
    
    const surgedSubtotal = rawRideCost * params.rideshareSurgeMultiplier;
    const totalRideshareCost = +(surgedSubtotal + params.rideshareBookingFee).toFixed(2);

    const rideshareCostBreakdown: RouteCostBreakdown = {
      baseFare: params.rideshareBaseFare,
      distanceCost: +(drivingDistanceKm * params.ridesharePerKmRate).toFixed(2),
      timeCost: +(drivingDurationMins * params.ridesharePerMinuteRate).toFixed(2),
      surgeCost: params.rideshareSurgeMultiplier > 1 ? +((rawRideCost * (params.rideshareSurgeMultiplier - 1))).toFixed(2) : 0,
      bookingFee: params.rideshareBookingFee,
      totalCost: totalRideshareCost,
    };

    const waitTimeMinutes = 4;
    const totalRideshareDuration = drivingDurationMins + waitTimeMinutes;
    const co2Kg = +(drivingDistanceKm * 0.185).toFixed(1);

    routes.push({
      id: 'mode-rideshare',
      mode: 'rideshare',
      title: 'On-Demand Rideshare (Uber / Taxi)',
      subTitle: `Door-to-door on-demand service`,
      provider: 'Uber / Cab Network',
      iconName: 'CarTaxiFront',
      durationMinutes: totalRideshareDuration,
      distanceKm: drivingDistanceKm,
      cost: rideshareCostBreakdown,
      co2Kg,
      isOverBudget: totalRideshareCost > maxBudget,
      budgetDelta: +(totalRideshareCost - maxBudget).toFixed(2),
      score: 0,
      badges: [],
      coordinates: osrmDriving.coordinates,
      legs: [
        {
          id: 'ride-leg-pickup',
          mode: 'rideshare',
          title: `Driver dispatch to pickup spot`,
          instruction: `Vehicle arriving in ~${waitTimeMinutes} mins`,
          durationMinutes: waitTimeMinutes,
          distanceKm: 0.8,
          cost: 0,
        },
        ...osrmDriving.legs,
      ],
      highlights: [
        'Zero parking hassle or vehicle maintenance',
        params.rideshareSurgeMultiplier > 1 ? `⚡ Surge multiplier active: ${params.rideshareSurgeMultiplier}x` : 'Standard off-peak rates',
        `Live GPS tracking and door-to-door delivery`,
      ],
      reliabilityScore: 90,
      departureTimeFormatted: formatTime(waitTimeMinutes),
      arrivalTimeFormatted: formatTime(totalRideshareDuration),
    });

    // MODE 2B: BUDGET RIDESHARE / AUTO / TWO-WHEELER (for trips under 35km)
    if (drivingDistanceKm <= 35) {
      const budgetRateFactor = 0.52; // 48% cheaper than standard cab
      const budgetBase = params.rideshareBaseFare * 0.6;
      const budgetDistCost = drivingDistanceKm * params.ridesharePerKmRate * budgetRateFactor;
      const budgetTimeCost = drivingDurationMins * params.ridesharePerMinuteRate * budgetRateFactor;
      const budgetTotal = +(budgetBase + budgetDistCost + budgetTimeCost + 1.0).toFixed(2);

      routes.push({
        id: 'mode-rideshare-budget',
        mode: 'rideshare',
        title: 'Micro-Mobility / Auto / Rapido',
        subTitle: 'Budget on-demand two-wheeler or auto rickshaw',
        provider: 'Rapido / City Auto',
        iconName: 'Bike',
        durationMinutes: Math.round(drivingDurationMins * 0.95), // splits through traffic
        distanceKm: drivingDistanceKm,
        cost: {
          baseFare: +budgetBase.toFixed(2),
          distanceCost: +budgetDistCost.toFixed(2),
          timeCost: +budgetTimeCost.toFixed(2),
          totalCost: budgetTotal,
        },
        co2Kg: +(drivingDistanceKm * 0.065).toFixed(1), // lower emissions
        isOverBudget: budgetTotal > maxBudget,
        budgetDelta: +(budgetTotal - maxBudget).toFixed(2),
        score: 0,
        badges: [],
        coordinates: osrmDriving.coordinates,
        legs: osrmDriving.legs,
        highlights: [
          'Agile urban transit maneuvers past congestion',
          'Lowest-cost private motorized door-to-door ride',
        ],
        reliabilityScore: 88,
        departureTimeFormatted: formatTime(3),
        arrivalTimeFormatted: formatTime(Math.round(drivingDurationMins * 0.95) + 3),
      });
    }
  }

  // -------------------------------------------------------------
  // MODE 3: TRANSIT (Train, Bus, Metro)
  // Deterministic GTFS / Transitland simulation
  // -------------------------------------------------------------
  const transitResults = calculateTransitRoutes(origin, destination, osrmDriving.coordinates, currency);
  
  if (transitResults.trainOption) {
    transitResults.trainOption.isOverBudget = transitResults.trainOption.cost.totalCost > maxBudget;
    transitResults.trainOption.budgetDelta = +(transitResults.trainOption.cost.totalCost - maxBudget).toFixed(2);
    routes.push(transitResults.trainOption);
  }

  if (transitResults.busOption) {
    transitResults.busOption.isOverBudget = transitResults.busOption.cost.totalCost > maxBudget;
    transitResults.busOption.budgetDelta = +(transitResults.busOption.cost.totalCost - maxBudget).toFixed(2);
    routes.push(transitResults.busOption);
  }

  if (transitResults.metroOption) {
    transitResults.metroOption.isOverBudget = transitResults.metroOption.cost.totalCost > maxBudget;
    transitResults.metroOption.budgetDelta = +(transitResults.metroOption.cost.totalCost - maxBudget).toFixed(2);
    routes.push(transitResults.metroOption);
  }

  // -------------------------------------------------------------
  // MODE 4: COMMERCIAL FLIGHT
  // Deterministic physics + distance regression
  // -------------------------------------------------------------
  const flightOption = calculateFlightOption(
    origin,
    destination,
    currency,
    params.flightBaseTax,
    params.flightPerKmRate
  );

  if (flightOption) {
    flightOption.isOverBudget = flightOption.cost.totalCost > maxBudget;
    flightOption.budgetDelta = +(flightOption.cost.totalCost - maxBudget).toFixed(2);
    routes.push(flightOption);
  }

  // -------------------------------------------------------------
  // MODE 5: WALKING & ACTIVE CYCLING (For distances <= 20 km)
  // -------------------------------------------------------------
  if (directDistanceKm <= 12) {
    const walkingDist = osrmWalking ? osrmWalking.distanceKm : +(directDistanceKm * 1.2).toFixed(1);
    const walkingDuration = osrmWalking ? osrmWalking.durationMinutes : Math.round((walkingDist / 4.8) * 60);
    const walkingCoords = osrmWalking ? osrmWalking.coordinates : generateSyntheticRoute(origin, destination, 'walking').coordinates;

    routes.push({
      id: 'mode-walking',
      mode: 'walking',
      title: 'Active Walking',
      subTitle: 'Zero-emission pedestrian route',
      provider: 'Pedestrian Path',
      iconName: 'Footprints',
      durationMinutes: walkingDuration,
      distanceKm: walkingDist,
      cost: {
        baseFare: 0,
        distanceCost: 0,
        timeCost: 0,
        totalCost: 0,
      },
      co2Kg: 0,
      isOverBudget: false,
      budgetDelta: -maxBudget,
      score: 0,
      badges: [],
      coordinates: walkingCoords,
      legs: osrmWalking?.legs || [
        {
          id: 'walk-1',
          mode: 'walking',
          title: 'Direct pedestrian walk',
          instruction: 'Sidewalk and pedestrian crossing route',
          durationMinutes: walkingDuration,
          distanceKm: walkingDist,
          cost: 0,
        },
      ],
      highlights: [
        '100% Free: $0 cost',
        '0 grams CO2 footprint',
        'Burn approx. ' + Math.round(walkingDist * 55) + ' kcal',
      ],
      reliabilityScore: 99,
      departureTimeFormatted: 'Immediate',
      arrivalTimeFormatted: formatTime(walkingDuration),
    });
  }

  if (directDistanceKm <= 25) {
    const cyclingDist = +(directDistanceKm * 1.15).toFixed(1);
    const cyclingDuration = Math.round((cyclingDist / 16.0) * 60);

    routes.push({
      id: 'mode-bicycling',
      mode: 'bicycling',
      title: 'City Bicycle / Bikeshare',
      subTitle: 'Eco-friendly cycle lane route',
      provider: 'Bikeshare Network',
      iconName: 'Bike',
      durationMinutes: cyclingDuration,
      distanceKm: cyclingDist,
      cost: {
        baseFare: 2.0, // Bikeshare unlock
        distanceCost: +(cyclingDuration * 0.12).toFixed(2),
        timeCost: 0,
        totalCost: +(2.0 + cyclingDuration * 0.12).toFixed(2),
      },
      co2Kg: 0.1,
      isOverBudget: (2.0 + cyclingDuration * 0.12) > maxBudget,
      budgetDelta: +(2.0 + cyclingDuration * 0.12 - maxBudget).toFixed(2),
      score: 0,
      badges: [],
      coordinates: osrmDriving.coordinates,
      legs: [
        {
          id: 'bike-leg-1',
          mode: 'bicycling',
          title: 'Unlock bike & cycle via bike lane',
          instruction: 'Designated bike lane and shared roadways',
          durationMinutes: cyclingDuration,
          distanceKm: cyclingDist,
          cost: +(2.0 + cyclingDuration * 0.12).toFixed(2),
        },
      ],
      highlights: [
        'Healthy cardio commute',
        'Bypass vehicle gridlock in bike corridors',
        'Near-zero carbon footprint',
      ],
      reliabilityScore: 95,
      departureTimeFormatted: 'Immediate',
      arrivalTimeFormatted: formatTime(cyclingDuration),
    });
  }

  // -------------------------------------------------------------
  // STEP B: BUDGET FILTERING & SMART BADGING ALGORITHM
  // -------------------------------------------------------------
  // Calculate Generalized Cost Balanced Score for each route
  // Generalized Cost = Total Cost + (Duration in Hours * Value of Time per Hour) + (CO2 * Carbon Penalty)
  const allCosts = routes.map((r) => r.cost.totalCost);
  const allDurations = routes.map((r) => r.durationMinutes);
  const allCo2 = routes.map((r) => r.co2Kg);

  const minCost = Math.min(...allCosts);
  const maxCostVal = Math.max(...allCosts, minCost + 1);
  const minDuration = Math.min(...allDurations);
  const maxDurationVal = Math.max(...allDurations, minDuration + 1);
  const minCo2 = Math.min(...allCo2);
  const maxCo2Val = Math.max(...allCo2, minCo2 + 1);

  routes.forEach((route) => {
    // Normalized factors [0, 1]
    const normCost = (route.cost.totalCost - minCost) / (maxCostVal - minCost);
    const normDuration = (route.durationMinutes - minDuration) / (maxDurationVal - minDuration);
    const normCo2 = (route.co2Kg - minCo2) / (maxCo2Val - minCo2);

    // Balanced multi-objective Pareto score (lower is superior)
    // 45% Cost, 45% Duration, 10% CO2
    route.score = +(normCost * 0.45 + normDuration * 0.45 + normCo2 * 0.10).toFixed(4);
  });

  // Identify badge winners
  // 1. Cheapest under budget (or overall lowest if none under)
  const eligibleForCheapest = routes.filter((r) => !r.isOverBudget);
  const cheapestCandidatePool = eligibleForCheapest.length > 0 ? eligibleForCheapest : routes;
  const cheapestRoute = cheapestCandidatePool.reduce((min, r) => 
    r.cost.totalCost < min.cost.totalCost ? r : min, cheapestCandidatePool[0]
  );

  // 2. Fastest under budget (or overall fastest if none under)
  const eligibleForFastest = routes.filter((r) => !r.isOverBudget);
  const fastestCandidatePool = eligibleForFastest.length > 0 ? eligibleForFastest : routes;
  const fastestRoute = fastestCandidatePool.reduce((min, r) => 
    r.durationMinutes < min.durationMinutes ? r : min, fastestCandidatePool[0]
  );

  // 3. Best Value (lowest balanced score among under-budget options)
  const eligibleForValue = routes.filter((r) => !r.isOverBudget);
  const valueCandidatePool = eligibleForValue.length > 0 ? eligibleForValue : routes;
  const bestValueRoute = valueCandidatePool.reduce((min, r) => 
    r.score < min.score ? r : min, valueCandidatePool[0]
  );

  // 4. Eco Champion (lowest CO2)
  const ecoRoute = routes.reduce((min, r) => (r.co2Kg < min.co2Kg ? r : min), routes[0]);

  // Assign badges
  routes.forEach((route) => {
    const badges: RouteOption['badges'] = [];

    if (route.isOverBudget) {
      badges.push('over_budget');
    }

    if (route.id === fastestRoute.id) {
      badges.push('fastest');
    }

    if (route.id === cheapestRoute.id) {
      badges.push('cheapest');
    }

    if (route.id === bestValueRoute.id && !badges.includes('fastest') && !badges.includes('cheapest')) {
      badges.push('balanced');
    } else if (route.id === bestValueRoute.id && !badges.includes('balanced')) {
      badges.push('balanced');
    }

    if (route.id === ecoRoute.id && !badges.includes('eco')) {
      badges.push('eco');
    }

    route.badges = badges;
  });

  // -------------------------------------------------------------
  // SORTING ACCORDING TO USER PRIORITY
  // -------------------------------------------------------------
  routes.sort((a, b) => {
    // Under budget items always precede over-budget items
    if (a.isOverBudget && !b.isOverBudget) return 1;
    if (!a.isOverBudget && b.isOverBudget) return -1;

    if (priority === 'fastest') {
      return a.durationMinutes - b.durationMinutes;
    }
    if (priority === 'cheapest') {
      return a.cost.totalCost - b.cost.totalCost;
    }
    // 'balanced'
    return a.score - b.score;
  });

  const executionTimeMs = +(performance.now() - startTime).toFixed(1);

  return {
    origin,
    destination,
    maxBudget,
    priority,
    currency,
    timestamp: new Date().toISOString(),
    directDistanceKm,
    routes,
    executionTimeMs,
  };
}
