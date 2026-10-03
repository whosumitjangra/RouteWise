import { PreferenceMode, RouteOption } from '../types';

export interface RecommendationResult {
  rankedRoutes: RouteOption[];
  recommendedRoute: RouteOption | null;
  explanationText: string;
}

/**
 * Deterministic Recommendation Engine & Natural English Explainer
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

  // Calculate budget deltas
  feasible.forEach((route) => {
    route.isOverBudget = route.cost.totalFare > budget;
    route.budgetDelta = route.cost.totalFare - budget;
  });

  // Normalization for Balanced Pareto score
  const costs = feasible.map((r) => r.cost.totalFare);
  const durations = feasible.map((r) => r.durationMinutes);

  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs, minCost + 1);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations, minDuration + 1);

  feasible.forEach((route) => {
    const normCost = (route.cost.totalFare - minCost) / (maxCost - minCost);
    const normDuration = (route.durationMinutes - minDuration) / (maxDuration - minDuration);

    let comfortPenalty = 0.05;
    if (route.mode === 'walking') {
      comfortPenalty = route.durationMinutes > 20 ? 0.45 : 0.15;
    } else if (route.mode === 'metro_multimodal') {
      comfortPenalty = 0.04; // air-conditioned, zero road traffic
    } else if (route.mode === 'cab') {
      comfortPenalty = 0.02; // door-to-door AC
    } else if (route.mode === 'bus') {
      comfortPenalty = 0.06; // public city bus
    }

    route.score = +(normCost * 0.45 + normDuration * 0.45 + comfortPenalty * 0.10).toFixed(4);
  });

  // Sort feasible options based on selected preference
  feasible.sort((a, b) => {
    // Under-budget options always precede over-budget options
    if (a.isOverBudget && !b.isOverBudget) return 1;
    if (!a.isOverBudget && b.isOverBudget) return -1;

    if (preference === 'cheapest') {
      if (a.cost.totalFare !== b.cost.totalFare) {
        return a.cost.totalFare - b.cost.totalFare;
      }
      return a.durationMinutes - b.durationMinutes;
    }

    if (preference === 'fastest') {
      if (a.durationMinutes !== b.durationMinutes) {
        return a.durationMinutes - b.durationMinutes;
      }
      return a.cost.totalFare - b.cost.totalFare;
    }

    // 'balanced'
    return a.score - b.score;
  });

  // Pick winner
  const winner = feasible[0];
  const runnerUp = feasible.length > 1 ? feasible[1] : null;

  // Clear previous recommendation flags
  routes.forEach((r) => {
    r.isRecommended = false;
    r.recommendationReason = undefined;
  });

  winner.isRecommended = true;

  // Generate plain-English explanation
  let explanationText = '';

  if (winner.isOverBudget) {
    explanationText = `All viable options exceed your ₹${budget} budget. ${winner.title} (₹${winner.cost.totalFare}) is the most economical choice.`;
  } else if (winner.mode === 'walking') {
    explanationText = `Recommended because it is completely free (₹0) and only a ${winner.durationMinutes}-minute walk (${winner.distanceKm} km).`;
  } else if (runnerUp) {
    const costDiff = Math.abs(runnerUp.cost.totalFare - winner.cost.totalFare);
    const timeDiff = Math.abs(runnerUp.durationMinutes - winner.durationMinutes);

    if (preference === 'cheapest') {
      if (costDiff > 0) {
        explanationText = `Recommended because it is ₹${costDiff} cheaper than ${runnerUp.title}${
          timeDiff > 0 ? ` and only ${timeDiff} min slower` : ''
        }.`;
      } else {
        explanationText = `Recommended as the lowest cost option (₹${winner.cost.totalFare}) within your ₹${budget} budget.`;
      }
    } else if (preference === 'fastest') {
      if (timeDiff > 0) {
        explanationText = `Recommended because it is ${timeDiff} minutes faster than ${runnerUp.title} (${winner.durationMinutes} min total).`;
      } else {
        explanationText = `Recommended as the fastest option (${winner.durationMinutes} min) within your ₹${budget} budget.`;
      }
    } else {
      // 'balanced'
      if (winner.mode === 'metro_multimodal') {
        const cab = feasible.find((r) => r.mode === 'cab');
        const auto = feasible.find((r) => r.mode === 'auto');
        const comp = auto || cab || runnerUp;
        const diff = Math.abs(comp.cost.totalFare - winner.cost.totalFare);
        explanationText = `Recommended because it avoids road congestion, saves ₹${diff} over ${comp.title}, and takes only ${winner.durationMinutes} mins.`;
      } else if (winner.mode === 'auto') {
        explanationText = `Recommended for reliable direct door-to-door transit at official Pune RTO meter fare (₹${winner.cost.totalFare}).`;
      } else if (winner.mode === 'bus') {
        explanationText = `Recommended as the most economical city transit option via ${winner.title} (₹${winner.cost.totalFare}) across this corridor.`;
      } else {
        explanationText = `Recommended as the best balance of cost (₹${winner.cost.totalFare}) and travel time (${winner.durationMinutes} min).`;
      }
    }
  } else {
    explanationText = `Recommended: Best route fitting your ₹${budget} budget.`;
  }

  winner.recommendationReason = explanationText;

  return {
    rankedRoutes: [...feasible, ...unfeasible],
    recommendedRoute: winner,
    explanationText,
  };
}
