/**
 * Centralized Fare Assumptions & Formula Configurations for Pune, Maharashtra
 * All assumptions are consolidated in this single file for rapid modification.
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

  // 2. Bike Taxi (Rapido-style Pune market estimates)
  bike: {
    label: 'Bike Taxi (Estimated Fare)',
    baseFare: 20, // covers first 1.0 km
    baseDistanceKm: 1.0,
    perKmRate: 9.0, // ₹9/km
    perMinuteRate: 0.75, // ₹0.75/minute traffic buffer
    platformFee: 2.0,
  },

  // 3. On-Demand Cab / Car (Uber Go / Ola Mini Pune market estimates)
  cab: {
    label: 'Cab / Car (Estimated Fare)',
    baseFare: 60, // base unlock & pickup
    baseDistanceKm: 0,
    perKmRate: 15.5, // ₹15.50/km
    perMinuteRate: 1.50, // ₹1.50/minute city transit
    bookingFee: 15.0,
  },

  // 4. Pune Metro (Maha Metro Official Fare Slabs)
  // Distance / station count based structure approved by Maha Metro Rail Corporation
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
    averageOperatingSpeedKmh: 36, // Commercial average speed including acceleration/braking
    stationDwellTimeMinutes: 0.5, // 30 seconds stop per station
    interchangeTransferBufferMinutes: 3.5, // Walking between District Court line 1 and line 2 concourses
    maxFeederWalkDistanceKm: 4.5, // Beyond 4.5 km from a metro station, metro is deemed not practical
  },

  // 5. Walking / Active
  walking: {
    label: 'Walking (Free)',
    cost: 0,
    averageSpeedKmh: 4.8, // standard pedestrian pace
    maxReasonableDistanceKm: 3.5, // Walks longer than this are flagged as high fatigue
  },
};
