export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export const MAJOR_AIRPORTS: Airport[] = [
  // North America
  { iata: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781 },
  { iata: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA', lat: 40.7769, lng: -73.8740 },
  { iata: 'EWR', name: 'Newark Liberty Intl', city: 'Newark', country: 'USA', lat: 40.6895, lng: -74.1745 },
  { iata: 'BOS', name: 'Boston Logan Intl', city: 'Boston', country: 'USA', lat: 42.3656, lng: -71.0096 },
  { iata: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'USA', lat: 37.6213, lng: -122.3790 },
  { iata: 'SJC', name: 'San Jose Mineta Intl', city: 'San Jose', country: 'USA', lat: 37.3639, lng: -121.9289 },
  { iata: 'OAK', name: 'Oakland Intl', city: 'Oakland', country: 'USA', lat: 37.7214, lng: -122.2208 },
  { iata: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'USA', lat: 33.9416, lng: -118.4085 },
  { iata: 'ORD', name: "O'Hare Intl", city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073 },
  { iata: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas', country: 'USA', lat: 32.8998, lng: -97.0403 },
  { iata: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle', country: 'USA', lat: 47.4502, lng: -122.3088 },
  { iata: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'USA', lat: 25.7959, lng: -80.2870 },
  { iata: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', country: 'USA', lat: 33.6407, lng: -84.4277 },
  { iata: 'YYZ', name: 'Toronto Pearson Intl', city: 'Toronto', country: 'Canada', lat: 43.6777, lng: -79.6248 },
  { iata: 'YVR', name: 'Vancouver Intl', city: 'Vancouver', country: 'Canada', lat: 49.1967, lng: -123.1815 },

  // Europe
  { iata: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK', lat: 51.4700, lng: -0.4543 },
  { iata: 'LGW', name: 'London Gatwick', city: 'London', country: 'UK', lat: 51.1537, lng: -0.1821 },
  { iata: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479 },
  { iata: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'France', lat: 48.7262, lng: 2.3652 },
  { iata: 'LYS', name: 'Lyon Saint-Exupéry', city: 'Lyon', country: 'France', lat: 45.7256, lng: 5.0811 },
  { iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683 },
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622 },
  { iata: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany', lat: 52.3667, lng: 13.5033 },
  { iata: 'MAD', name: 'Madrid-Barajas', city: 'Madrid', country: 'Spain', lat: 40.4839, lng: -3.5679 },
  { iata: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'Spain', lat: 41.2974, lng: 2.0833 },
  { iata: 'FCO', name: 'Rome Fiumicino', city: 'Rome', country: 'Italy', lat: 41.8003, lng: 12.2389 },
  { iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', lat: 47.4582, lng: 8.5555 },

  // Asia & India
  { iata: 'DEL', name: 'Indira Gandhi Intl', city: 'New Delhi', country: 'India', lat: 28.5562, lng: 77.1000 },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India', lat: 19.0896, lng: 72.8656 },
  { iata: 'BLR', name: 'Kempegowda Intl', city: 'Bengaluru', country: 'India', lat: 13.1986, lng: 77.7066 },
  { iata: 'MAA', name: 'Chennai Intl', city: 'Chennai', country: 'India', lat: 12.9941, lng: 80.1709 },
  { iata: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India', lat: 18.5821, lng: 73.9197 },
  { iata: 'HYD', name: 'Rajiv Gandhi Intl', city: 'Hyderabad', country: 'India', lat: 17.2403, lng: 78.4294 },
  { iata: 'CCU', name: 'Netaji Subhash Chandra Bose', city: 'Kolkata', country: 'India', lat: 22.6547, lng: 88.4467 },
  { iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', lat: 35.5494, lng: 139.7798 },
  { iata: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan', lat: 35.7720, lng: 140.3929 },
  { iata: 'KIX', name: 'Kansai Intl', city: 'Osaka', country: 'Japan', lat: 34.4320, lng: 135.2304 },
  { iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915 },
  { iata: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657 },
  { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753 },
  { iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', lat: -37.6690, lng: 144.8410 },
];

export function findClosestAirport(lat: number, lng: number): { airport: Airport; distanceKm: number } {
  let closest = MAJOR_AIRPORTS[0];
  let minDistance = Infinity;

  for (const airport of MAJOR_AIRPORTS) {
    const dist = haversineDistance(lat, lng, airport.lat, airport.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = airport;
    }
  }

  // If closest is further than 150km, create a local municipal/regional airport anchor
  if (minDistance > 180) {
    return {
      airport: {
        iata: 'LOC',
        name: 'Regional Airport Hub',
        city: 'Nearby Metro',
        country: 'Global',
        lat: lat + 0.15,
        lng: lng + 0.15,
      },
      distanceKm: 25,
    };
  }

  return { airport: closest, distanceKm: minDistance };
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
