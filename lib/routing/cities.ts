import { LocationPoint } from '../types';

export interface TripPreset {
  id: string;
  label: string;
  region: string;
  origin: LocationPoint;
  destination: LocationPoint;
  recommendedBudget: number;
  currency: string;
}

export const POPULAR_PRESETS: TripPreset[] = [
  {
    id: 'nyc-boston',
    label: 'New York ➔ Boston',
    region: 'USA Northeast',
    origin: {
      name: 'Times Square, New York, NY',
      lat: 40.7580,
      lng: -73.9855,
      city: 'New York',
      country: 'USA',
    },
    destination: {
      name: 'Boston Common, Boston, MA',
      lat: 42.3550,
      lng: -71.0656,
      city: 'Boston',
      country: 'USA',
    },
    recommendedBudget: 95,
    currency: 'USD',
  },
  {
    id: 'sf-sanjose',
    label: 'San Francisco ➔ San Jose',
    region: 'California Bay Area',
    origin: {
      name: 'Downtown San Francisco, CA',
      lat: 37.7879,
      lng: -122.4075,
      city: 'San Francisco',
      country: 'USA',
    },
    destination: {
      name: 'Downtown San Jose, CA',
      lat: 37.3382,
      lng: -121.8863,
      city: 'San Jose',
      country: 'USA',
    },
    recommendedBudget: 45,
    currency: 'USD',
  },
  {
    id: 'london-oxford',
    label: 'London ➔ Oxford',
    region: 'United Kingdom',
    origin: {
      name: 'London Paddington Station',
      lat: 51.5154,
      lng: -0.1755,
      city: 'London',
      country: 'UK',
    },
    destination: {
      name: 'Oxford Railway Station',
      lat: 51.7535,
      lng: -1.2701,
      city: 'Oxford',
      country: 'UK',
    },
    recommendedBudget: 40,
    currency: 'GBP',
  },
  {
    id: 'delhi-agra',
    label: 'New Delhi ➔ Agra',
    region: 'India NCR',
    origin: {
      name: 'Connaught Place, New Delhi',
      lat: 28.6315,
      lng: 77.2167,
      city: 'New Delhi',
      country: 'India',
    },
    destination: {
      name: 'Taj Mahal, Agra, UP',
      lat: 27.1751,
      lng: 78.0421,
      city: 'Agra',
      country: 'India',
    },
    recommendedBudget: 2200,
    currency: 'INR',
  },
  {
    id: 'paris-lyon',
    label: 'Paris ➔ Lyon',
    region: 'France TGV',
    origin: {
      name: 'Gare de Lyon, Paris',
      lat: 48.8448,
      lng: 2.3735,
      city: 'Paris',
      country: 'France',
    },
    destination: {
      name: 'Gare de la Part-Dieu, Lyon',
      lat: 45.7606,
      lng: 4.8594,
      city: 'Lyon',
      country: 'France',
    },
    recommendedBudget: 80,
    currency: 'EUR',
  },
  {
    id: 'tokyo-kyoto',
    label: 'Tokyo ➔ Kyoto',
    region: 'Japan Shinkansen',
    origin: {
      name: 'Tokyo Station, Chiyoda',
      lat: 35.6812,
      lng: 139.7671,
      city: 'Tokyo',
      country: 'Japan',
    },
    destination: {
      name: 'Kyoto Station, Shimogyo',
      lat: 34.9858,
      lng: 135.7588,
      city: 'Kyoto',
      country: 'Japan',
    },
    recommendedBudget: 15000,
    currency: 'JPY',
  },
];
