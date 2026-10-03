/**
 * Centralized Fare Assumptions & Formula Configurations for Pune, Maharashtra
 * Strictly anonymous - no third-party branding (Rapido/Uber/Ola omitted).
 */

export const FARE_CONFIG = {
  currencySymbol: '₹',
  currencyCode: 'INR',

  // 1. Auto Rickshaw (Pune RTO Official Regulated Meter Tariffs)
  auto: {
    label: 'Auto Rickshaw (RTO Meter Fare)',
    baseFare: 25, // ₹25 for first 1.5 km
    baseDistanceKm: 1.5,
    perKmRate: 17.0, // ₹17.00 per km after 1.5 km
    nightSurchargeMultiplier: 1.0, // 1.25x between midnight and 5:00 AM
  },

  // 2. Economy Cab (Live City Cab Market Formula)
  cab: {
    label: 'Economy Cab (AC)',
    baseFare: 65, // base pickup
    baseDistanceKm: 0,
    perKmRate: 16.0, // distance rate
    perMinuteRate: 1.50, // traffic duration buffer
    bookingFee: 15.0,
  },

  // 3. PMPML Pune City & Intercity Bus (Official PMPML Stage Tariff)
  bus: {
    label: 'PMPML Pune Bus',
    operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
    slabs: [
      { maxKm: 2, fare: 5 },
      { maxKm: 4, fare: 10 },
      { maxKm: 8, fare: 15 },
      { maxKm: 12, fare: 20 },
      { maxKm: 16, fare: 25 },
      { maxKm: 20, fare: 30 },
      { maxKm: 999, fare: 35 },
    ],
    dailyPassFare: 50,
    dailyPassIntercityFare: 70,
    averageOperatingSpeedKmh: 20,
    stopDwellTimeMinutes: 0.8,
  },

  // 4. Pune Metro (Maha Metro Official Fare Slabs)
  metro: {
    label: 'Pune Metro (Maha Metro Fare)',
    slabs: [
      { maxStations: 3, fare: 10 },
      { maxStations: 6, fare: 15 },
      { maxStations: 10, fare: 20 },
      { maxStations: 14, fare: 25 },
      { maxStations: 18, fare: 30 },
      { maxStations: 999, fare: 35 },
    ],
    averageOperatingSpeedKmh: 36,
    stationDwellTimeMinutes: 0.5,
    interchangeTransferBufferMinutes: 4.0, // District Court interchange walk
    maxFeederWalkDistanceKm: 4.5,
  },

  // 5. Walking / Active (Only practical for short strolls under 1.0 km)
  walking: {
    label: 'Walking (Free)',
    cost: 0,
    averageSpeedKmh: 4.8,
    maxReasonableDistanceKm: 1.0,
  },
};
