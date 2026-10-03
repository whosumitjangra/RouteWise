/**
 * Deep-linking and Booking URLs + Provider Pricing for feeder and direct auto rides
 * Supports separate pricing for:
 * 1. Uber Auto
 * 2. Rapido Auto
 * 3. Manually Offline Booking (Shared / Street Auto hail)
 */

export interface RideLocation {
  lat: number;
  lng: number;
  name: string;
}

export interface AutoProviderPricing {
  uberFare: number;
  rapidoFare: number;
  offlineFare?: number;
  isOfflineAvailable: boolean;
  offlineDisclaimer: string;
  uberBookingUrl: string;
  rapidoBookingUrl: string;
}

export function getUberBookingUrl(pickup: RideLocation, dropoff: RideLocation): string {
  const pickupAddr = encodeURIComponent(pickup.name || 'Current Location');
  const dropoffAddr = encodeURIComponent(dropoff.name || 'Metro Station');
  
  // Uber Universal Web & App Intent
  return `https://m.uber.com/ul/?action=setPickup&client_id=routewise_pune&pickup[latitude]=${pickup.lat}&pickup[longitude]=${pickup.lng}&pickup[formatted_address]=${pickupAddr}&dropoff[latitude]=${dropoff.lat}&dropoff[longitude]=${dropoff.lng}&dropoff[formatted_address]=${dropoffAddr}`;
}

export function getRapidoBookingUrl(): string {
  // Rapido Auto booking web/app portal
  return 'https://rapido.bike';
}

/**
 * Calculates separate fares for Uber Auto, Rapido Auto, and Manual Offline Booking
 * - Offline fare is estimated by dividing the base meter fare by 3.5 (Pune shared auto rate for short distances 4-5 km)
 * - Beneath offline price, shows "Price may vary"
 * - For distances > 10 km, offline booking is suppressed, showing only Uber and Rapido
 */
export function calculateAutoProviderPricing(
  distanceKm: number,
  baseMeterFare: number,
  pickup: RideLocation = { lat: 18.52, lng: 73.85, name: 'Pickup' },
  dropoff: RideLocation = { lat: 18.53, lng: 73.86, name: 'Dropoff' }
): AutoProviderPricing {
  // 1. Uber Auto
  const uberFare = Math.round(baseMeterFare * 1.05 + 4);

  // 2. Rapido Auto
  const rapidoFare = Math.max(25, Math.round(baseMeterFare * 0.96));

  // 3. Manually Offline Booking (Pune Shared / Local Street Auto)
  // Distance strictly <= 10 km; for > 10 km, only show Uber and Rapido
  const isOfflineAvailable = distanceKm <= 10;
  const offlineFare = isOfflineAvailable
    ? Math.max(15, Math.round(baseMeterFare / 3.5))
    : undefined;

  return {
    uberFare,
    rapidoFare,
    offlineFare,
    isOfflineAvailable,
    offlineDisclaimer: 'Price may vary',
    uberBookingUrl: getUberBookingUrl(pickup, dropoff),
    rapidoBookingUrl: getRapidoBookingUrl(),
  };
}
