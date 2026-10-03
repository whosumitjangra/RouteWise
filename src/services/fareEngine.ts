import { FareBreakdown, TransportMode } from '../types';
import { FARE_CONFIG } from '../config/fares';

/**
 * Calculates deterministic fare breakdown for any Pune road transport mode
 */
export function calculateRoadFare(
  mode: TransportMode,
  distanceKm: number,
  durationMinutes: number
): FareBreakdown {
  if (mode === 'auto') {
    const { baseFare, baseDistanceKm, perKmRate, nightSurchargeMultiplier } = FARE_CONFIG.auto;
    const billableKm = Math.max(0, distanceKm - baseDistanceKm);
    const distanceCost = billableKm * perKmRate;
    const total = Math.round((baseFare + distanceCost) * nightSurchargeMultiplier);

    return {
      baseFare,
      distanceFare: Math.round(distanceCost),
      totalFare: total,
      formulaDescription: `Pune RTO Meter: ₹${baseFare} for 1st ${baseDistanceKm} km + ₹${perKmRate}/km thereafter`,
    };
  }

  if (mode === 'cab') {
    const { baseFare, perKmRate, perMinuteRate, bookingFee } = FARE_CONFIG.cab;
    const distanceCost = distanceKm * perKmRate;
    const timeCost = durationMinutes * perMinuteRate;
    const total = Math.round(baseFare + distanceCost + timeCost + bookingFee);

    return {
      baseFare,
      distanceFare: Math.round(distanceCost),
      timeFare: Math.round(timeCost + bookingFee),
      totalFare: total,
      formulaDescription: `Estimated Fare: ₹${baseFare} base + ₹${perKmRate}/km + ₹${perMinuteRate}/min traffic buffer`,
    };
  }

  if (mode === 'walking') {
    return {
      baseFare: 0,
      distanceFare: 0,
      totalFare: 0,
      formulaDescription: 'Active Pedestrian Walk (100% Free, Zero Emissions)',
    };
  }

  return {
    baseFare: 0,
    distanceFare: 0,
    totalFare: 0,
    formulaDescription: 'Standard transit tariff',
  };
}
