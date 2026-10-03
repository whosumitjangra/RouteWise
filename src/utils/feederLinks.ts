/**
 * Deep-linking and Booking URLs for feeder rides (Uber & Rapido)
 */

export interface RideLocation {
  lat: number;
  lng: number;
  name: string;
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
