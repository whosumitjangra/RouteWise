import { PreferenceMode, RouteOption } from '../types';

export interface RecommendationResult {
  rankedRoutes: RouteOption[];
  recommendedRoute: RouteOption | null;
  explanationText: string;
}

/**
 * Calculates transfer friction, mode counts, and user-facing clarity labels
 */
export function enrichRouteTransferMetadata(route: RouteOption): void {
  if (route.mode === 'cab') {
    route.modeCount = 1;
    route.transferCount = 0;
    route.transferLabel = '0 Transfers • Direct AC Cab';
    route.aiTag = 'Direct AC Door-to-Door';
  } else if (route.mode === 'auto') {
    route.modeCount = 1;
    route.transferCount = 0;
    route.transferLabel = '0 Transfers • Direct Auto Meter';
    route.aiTag = 'Direct Door-to-Door';
  } else if (route.mode === 'walking') {
    route.modeCount = 1;
    route.transferCount = 0;
    route.transferLabel = '0 Transfers • Pedestrian Walk';
    route.aiTag = 'Zero Cost Walk';
  } else if (route.mode === 'bus') {
    route.modeCount = 1;
    route.transferCount = 0;
    route.transferLabel = 'Single Bus • No Transfers';
    route.aiTag = 'Direct City Transit';
  } else if (route.mode === 'metro_multimodal') {
    const feederLegs = route.legs.filter(
      (l) => l.isFeeder || l.badge === 'Feeder Auto' || l.title.toLowerCase().includes('feeder')
    );
    const hasInterchange = route.legs.some(
      (l) =>
        l.badge?.includes('Transfer') ||
        l.title.includes('District Court') ||
        l.title.toLowerCase().includes('interchange')
    );

    // Calculate total distinct vehicular modes
    // e.g. Feeder Auto (1) + Metro Train (2) + Feeder Auto (3)
    const feederCount = feederLegs.length;
    const modeCount = 1 + feederCount;
    const transferCount = Math.max(0, modeCount - 1 + (hasInterchange ? 1 : 0));

    route.modeCount = modeCount;
    route.transferCount = transferCount;

    if (modeCount >= 3 || transferCount >= 2) {
      route.transferLabel = `3 Modes • ${transferCount} Switches (Auto + Metro + Auto)`;
      route.aiTag = '3-Mode Multi-Transit';
    } else if (modeCount === 2 || transferCount === 1) {
      route.transferLabel = '2 Modes • 1 Switch (Feeder + Metro)';
      route.aiTag = '2-Mode Transit';
    } else {
      route.transferLabel = 'Direct Metro • Walkable Stations';
      route.aiTag = 'Direct Rail Transit';
    }
  }
}

/**
 * AI Commute Recommendation Engine & Plain-English Explainer
 * Dynamically prioritizes:
 * 1. Customer Budget & Willingness to Pay (Cabs/Autos preferred when budget allows)
 * 2. Mode Switching Friction (Penalizes changing 3 modes when direct single bus/cab/auto exists)
 * 3. Travel Time & Directness
 */
export function evaluateAndRankRoutes(
  routes: RouteOption[],
  budget: number,
  preference: PreferenceMode
): RecommendationResult {
  // Separate feasible vs unfeasible options
  const feasible = routes.filter((r) => r.isFeasible);
  const unfeasible = routes.filter((r) => !r.isFeasible);

  if (feasible.length === 0) {
    return {
      rankedRoutes: routes,
      recommendedRoute: null,
      explanationText: 'No transit alternatives found for this path.',
    };
  }

  // 1. Enrich all routes with transfer friction metadata
  feasible.forEach(enrichRouteTransferMetadata);
  unfeasible.forEach(enrichRouteTransferMetadata);

  // 2. Calculate budget deltas
  feasible.forEach((route) => {
    route.isOverBudget = route.cost.totalFare > budget;
    route.budgetDelta = route.cost.totalFare - budget;
  });

  // Find candidate options
  const cabRoute = feasible.find((r) => r.mode === 'cab');
  const autoRoute = feasible.find((r) => r.mode === 'auto');
  const busRoute = feasible.find((r) => r.mode === 'bus');
  const metroRoute = feasible.find((r) => r.mode === 'metro_multimodal');
  const walkRoute = feasible.find((r) => r.mode === 'walking');

  // Customer budget affordability signals
  const canAffordCab = Boolean(cabRoute && !cabRoute.isOverBudget);
  const canAffordAuto = Boolean(autoRoute && !autoRoute.isOverBudget);

  // 3. Normalization for duration and costs
  const costs = feasible.map((r) => r.cost.totalFare);
  const durations = feasible.map((r) => r.durationMinutes);

  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs, minCost + 1);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations, minDuration + 1);

  // 4. Compute AI Commute Utility Score for each route
  feasible.forEach((route) => {
    const normCost = (route.cost.totalFare - minCost) / (maxCost - minCost);
    const normDuration = (route.durationMinutes - minDuration) / (maxDuration - minDuration);

    // Transfer friction penalty:
    // Changing 3 modes is exhausting (waiting for auto, security check at metro, waiting for train, deboarding, hailing another auto).
    // Direct single bus or private car/auto has 0 transfer fatigue.
    let transferPenalty = 0.0;
    if ((route.transferCount ?? 0) >= 2 || (route.modeCount ?? 1) >= 3) {
      transferPenalty = 0.55; // Heavy friction penalty for changing 3 modes
    } else if ((route.transferCount ?? 0) === 1) {
      transferPenalty = 0.20;
    }

    // Budget willingness factor:
    // If the customer entered a higher budget and can afford a Cab or Auto,
    // they deliberately chose to pay more for speed & 0-transfer comfort!
    let budgetAffordabilityBonus = 0.0;
    if (canAffordCab && route.mode === 'cab') {
      budgetAffordabilityBonus = -0.45; // Strongly reward Cab when customer budget allows it
    } else if (canAffordAuto && route.mode === 'auto') {
      budgetAffordabilityBonus = canAffordCab ? -0.30 : -0.45; // Strongly reward Auto
    } else if (!canAffordAuto && route.mode === 'bus') {
      budgetAffordabilityBonus = -0.40; // Strongly reward single Bus for budget-conscious commuters
    }

    // Walking penalty if walking is excessive
    let walkPenalty = 0.0;
    if (route.mode === 'walking') {
      walkPenalty = route.distanceKm > 0.8 ? 0.40 : 0.05;
    }

    // Congestion bypass reward for Metro if road traffic is severe
    let trafficBypassBonus = 0.0;
    if (route.mode === 'metro_multimodal' && cabRoute) {
      const timeSaved = cabRoute.durationMinutes - route.durationMinutes;
      if (timeSaved >= 15) {
        trafficBypassBonus = -0.25;
      }
    }

    // Over-budget penalty
    const overBudgetPenalty = route.isOverBudget
      ? 2.0 + (route.cost.totalFare - budget) * 0.01
      : 0.0;

    // AI Commute Score (lower is better)
    if (preference === 'cheapest') {
      // Prioritize low cost, but penalize high transfer friction
      route.score = +(
        normCost * 0.65 +
        transferPenalty * 0.25 +
        normDuration * 0.10 +
        overBudgetPenalty
      ).toFixed(4);
    } else if (preference === 'fastest') {
      // Prioritize speed, but reward 0 transfers
      route.score = +(
        normDuration * 0.70 +
        transferPenalty * 0.20 +
        normCost * 0.10 +
        overBudgetPenalty
      ).toFixed(4);
    } else {
      // 'balanced' AI recommendation:
      // Dynamically balances customer budget willingness, transfer friction, time, and cost
      route.score = +(
        normCost * 0.25 +
        normDuration * 0.30 +
        transferPenalty * 0.35 +
        budgetAffordabilityBonus +
        walkPenalty +
        trafficBypassBonus +
        overBudgetPenalty
      ).toFixed(4);
    }
  });

  // 5. Sort feasible options according to AI priority
  feasible.sort((a, b) => {
    // Under-budget routes always precede over-budget routes
    if (a.isOverBudget && !b.isOverBudget) return 1;
    if (!a.isOverBudget && b.isOverBudget) return -1;

    if (preference === 'cheapest') {
      if (a.cost.totalFare !== b.cost.totalFare) {
        return a.cost.totalFare - b.cost.totalFare;
      }
      return a.score - b.score;
    }

    if (preference === 'fastest') {
      if (a.durationMinutes !== b.durationMinutes) {
        return a.durationMinutes - b.durationMinutes;
      }
      return a.score - b.score;
    }

    // 'balanced' AI Priority
    return a.score - b.score;
  });

  // 6. Pick AI Recommended Winner
  const winner = feasible[0];
  const runnerUp = feasible.length > 1 ? feasible[1] : null;

  // Clear previous recommendation flags
  routes.forEach((r) => {
    r.isRecommended = false;
    r.recommendationReason = undefined;
    r.aiExplanation = undefined;
  });

  winner.isRecommended = true;

  // 7. Generate Plain-English Explanation (Strictly ONE short sentence based on preference & budget)
  let explanationText = '';

  if (winner.isOverBudget) {
    explanationText = `${winner.title} is the closest match to your ₹${budget} budget at an estimated ₹${winner.cost.totalFare}.`;
  } else if (preference === 'cheapest') {
    explanationText = `${winner.title} gives you the lowest travel cost at an estimated ₹${winner.cost.totalFare}.`;
  } else if (preference === 'fastest') {
    explanationText = `${winner.title} is your quickest option, reaching the destination in ${winner.durationMinutes} minutes.`;
  } else if (winner.mode === 'walking') {
    explanationText = `A short ${winner.durationMinutes}-minute walk (${winner.distanceKm} km) reaches your destination at zero cost.`;
  } else if (winner.mode === 'cab') {
    explanationText = `Direct AC cab gives you zero transfers and door-to-door comfort within your ₹${budget} budget.`;
  } else if (winner.mode === 'auto') {
    explanationText = `Direct meter auto provides a fast, zero-transfer trip within your ₹${budget} budget.`;
  } else if (winner.mode === 'bus') {
    const busNum = winner.busNumber ? `Bus ${winner.busNumber}` : 'Bus';
    explanationText = `Direct PMPML ${busNum} is the most affordable route at an estimated ₹${winner.cost.totalFare} with zero transfers.`;
  } else if (winner.mode === 'metro_multimodal') {
    explanationText = `Pune Metro bypasses road congestion to provide reliable, fast transit on this corridor.`;
  } else {
    explanationText = `${winner.title} offers the best balance of travel time, directness, and estimated cost.`;
  }

  winner.recommendationReason = explanationText;
  winner.aiExplanation = explanationText;

  return {
    rankedRoutes: [...feasible, ...unfeasible],
    recommendedRoute: winner,
    explanationText,
  };
}
