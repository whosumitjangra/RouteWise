import { LocationPoint, PunePresetTrip } from '../types';

export const PUNE_LANDMARKS: LocationPoint[] = [
  {
    name: 'Hinjewadi Phase 1 (Rajiv Gandhi Infotech Park)',
    lat: 18.5913,
    lng: 73.7389,
    landmarkType: 'it_park',
  },
  {
    name: 'Hinjewadi Phase 3 (Megapolis Circle)',
    lat: 18.5772,
    lng: 73.6890,
    landmarkType: 'it_park',
  },
  {
    name: 'Shivajinagar Bus & Railway Terminal',
    lat: 18.5314,
    lng: 73.8524,
    landmarkType: 'station',
  },
  {
    name: 'Kothrud (Karve Statue)',
    lat: 18.5074,
    lng: 73.8077,
    landmarkType: 'suburb',
  },
  {
    name: 'Viman Nagar (Phoenix Marketcity)',
    lat: 18.5620,
    lng: 73.9168,
    landmarkType: 'commercial',
  },
  {
    name: 'Swargate Bus Stand',
    lat: 18.5018,
    lng: 73.8588,
    landmarkType: 'station',
  },
  {
    name: 'PCMC (Pimpri Chinchwad Municipal Corp)',
    lat: 18.6288,
    lng: 73.8052,
    landmarkType: 'suburb',
  },
  {
    name: 'Baner (High Street)',
    lat: 18.5590,
    lng: 73.7788,
    landmarkType: 'commercial',
  },
  {
    name: 'Wakad (Datta Mandir Road)',
    lat: 18.5987,
    lng: 73.7635,
    landmarkType: 'suburb',
  },
  {
    name: 'FC Road (Fergusson College), Deccan',
    lat: 18.5204,
    lng: 73.8415,
    landmarkType: 'commercial',
  },
  {
    name: 'Pune Railway Station Central Concourse',
    lat: 18.5285,
    lng: 73.8735,
    landmarkType: 'station',
  },
  {
    name: 'Kalyani Nagar (Cerebrum IT Park)',
    lat: 18.5480,
    lng: 73.9025,
    landmarkType: 'it_park',
  },
  {
    name: 'Amanora Mall & Magarpatta City, Hadapsar',
    lat: 18.5140,
    lng: 73.9310,
    landmarkType: 'it_park',
  },
  {
    name: 'Deccan Gymkhana Bus Station',
    lat: 18.5175,
    lng: 73.8440,
    landmarkType: 'commercial',
  },
  {
    name: 'Pune Airport (PNQ), Lohegaon',
    lat: 18.5821,
    lng: 73.9197,
    landmarkType: 'station',
  },
];

export const PUNE_PRESET_TRIPS: PunePresetTrip[] = [
  {
    id: 'hinjewadi-shivajinagar',
    label: 'Hinjewadi ➔ Shivajinagar',
    origin: PUNE_LANDMARKS[0], // Hinjewadi Phase 1
    destination: PUNE_LANDMARKS[2], // Shivajinagar
    budget: 150,
  },
  {
    id: 'swargate-pcmc',
    label: 'Swargate ➔ PCMC (Metro Corridor)',
    origin: PUNE_LANDMARKS[5], // Swargate
    destination: PUNE_LANDMARKS[6], // PCMC
    budget: 60,
  },
  {
    id: 'kothrud-vimannagar',
    label: 'Kothrud ➔ Viman Nagar (East-West)',
    origin: PUNE_LANDMARKS[3], // Kothrud
    destination: PUNE_LANDMARKS[4], // Viman Nagar
    budget: 120,
  },
  {
    id: 'fcroad-punestation',
    label: 'FC Road ➔ Pune Station',
    origin: PUNE_LANDMARKS[9], // FC Road
    destination: PUNE_LANDMARKS[10], // Pune Station
    budget: 80,
  },
];
