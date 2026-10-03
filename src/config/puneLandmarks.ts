import { LocationPoint, PunePresetTrip } from '../types';

export interface PuneLandmarkWithAliases extends LocationPoint {
  aliases: string[];
}

export const PUNE_LANDMARKS: PuneLandmarkWithAliases[] = [
  // Colleges & Educational Institutes
  {
    name: 'Army Institute of Technology (AIT), Alandi Road, Dighi',
    lat: 18.6069,
    lng: 73.8745,
    landmarkType: 'it_park',
    aliases: ['ait', 'ait pune', 'army institute of technology', 'dighi', 'alandi road ait'],
  },
  {
    name: 'College of Engineering Pune (COEP), Shivajinagar',
    lat: 18.5293,
    lng: 73.8565,
    landmarkType: 'station',
    aliases: ['coep', 'coep pune', 'college of engineering pune'],
  },
  {
    name: 'MIT World Peace University (MIT WPU), Kothrud',
    lat: 18.5178,
    lng: 73.8151,
    landmarkType: 'commercial',
    aliases: ['mit', 'mit wpu', 'mit kothrud', 'mit college'],
  },
  {
    name: 'Pune Institute of Computer Technology (PICT), Dhankawadi',
    lat: 18.4575,
    lng: 73.8508,
    landmarkType: 'commercial',
    aliases: ['pict', 'pict pune', 'dhankawadi pict', 'katraj pict'],
  },
  {
    name: 'Vishwakarma Institute of Technology (VIT), Bibwewadi',
    lat: 18.4637,
    lng: 73.8682,
    landmarkType: 'commercial',
    aliases: ['vit', 'vit pune', 'bibwewadi vit'],
  },
  {
    name: 'Savitribai Phule Pune University (SPPU), Ganeshkhind',
    lat: 18.5529,
    lng: 73.8262,
    landmarkType: 'commercial',
    aliases: ['pune university', 'sppu', 'university circle', 'ganeshkhind'],
  },
  {
    name: 'Symbiosis International University, Viman Nagar',
    lat: 18.5645,
    lng: 73.9125,
    landmarkType: 'commercial',
    aliases: ['symbiosis', 'symbi', 'symbiosis viman nagar'],
  },

  // Railway Stations & Transit Hubs
  {
    name: 'Pune Junction Railway Station (Pune Station)',
    lat: 18.5285,
    lng: 73.8735,
    landmarkType: 'station',
    aliases: ['pune junction', 'pune junctin', 'pune station', 'pune rly stn', 'junction', 'station'],
  },
  {
    name: 'Shivajinagar Bus & Railway Terminal',
    lat: 18.5314,
    lng: 73.8524,
    landmarkType: 'station',
    aliases: ['shivajinagar', 'shivaji nagar', 'shivajinagar station', 'shivajinagar bus stand'],
  },
  {
    name: 'Swargate MSRTC Bus Stand & Concourse',
    lat: 18.5018,
    lng: 73.8588,
    landmarkType: 'station',
    aliases: ['swargate', 'swargate bus stand', 'swargate metro'],
  },
  {
    name: 'Pune Airport (PNQ), Lohegaon',
    lat: 18.5821,
    lng: 73.9197,
    landmarkType: 'station',
    aliases: ['pune airport', 'pnq', 'lohegaon airport', 'airport'],
  },

  // IT Hubs & Business Parks
  {
    name: 'Hinjewadi Phase 1 (Rajiv Gandhi Infotech Park)',
    lat: 18.5913,
    lng: 73.7389,
    landmarkType: 'it_park',
    aliases: ['hinjewadi', 'hinjewadi phase 1', 'hinjawadi', 'rgip'],
  },
  {
    name: 'Hinjewadi Phase 3 (Megapolis Circle)',
    lat: 18.5772,
    lng: 73.6890,
    landmarkType: 'it_park',
    aliases: ['hinjewadi phase 3', 'megapolis', 'tech mahindra phase 3'],
  },
  {
    name: 'Magarpatta City (Cybercity), Hadapsar',
    lat: 18.5140,
    lng: 73.9310,
    landmarkType: 'it_park',
    aliases: ['magarpatta', 'magarpatta city', 'cybercity', 'hadapsar'],
  },
  {
    name: 'Kalyani Nagar (Cerebrum IT Park)',
    lat: 18.5480,
    lng: 73.9025,
    landmarkType: 'it_park',
    aliases: ['kalyani nagar', 'cerebrum', 'cerebrum it park'],
  },

  // Suburbs & Commercial Centers
  {
    name: 'Kothrud (Karve Statue & Chandani Chowk)',
    lat: 18.5074,
    lng: 73.8077,
    landmarkType: 'suburb',
    aliases: ['kothrud', 'karve road', 'chandani chowk', 'paud road'],
  },
  {
    name: 'Viman Nagar (Phoenix Marketcity)',
    lat: 18.5620,
    lng: 73.9168,
    landmarkType: 'commercial',
    aliases: ['viman nagar', 'phoenix marketcity', 'phoenix mall'],
  },
  {
    name: 'PCMC (Pimpri Chinchwad Municipal Corp)',
    lat: 18.6288,
    lng: 73.8052,
    landmarkType: 'suburb',
    aliases: ['pcmc', 'pimpri', 'chinchwad', 'pcmc bhavan'],
  },
  {
    name: 'FC Road (Fergusson College), Deccan',
    lat: 18.5204,
    lng: 73.8415,
    landmarkType: 'commercial',
    aliases: ['fc road', 'fergusson college', 'deccan', 'deccan gymkhana', 'jm road'],
  },
  {
    name: 'Baner (High Street)',
    lat: 18.5590,
    lng: 73.7788,
    landmarkType: 'commercial',
    aliases: ['baner', 'baner high street', 'balewadi high street'],
  },
  {
    name: 'Wakad (Datta Mandir Road / Bridge)',
    lat: 18.5987,
    lng: 73.7635,
    landmarkType: 'suburb',
    aliases: ['wakad', 'wakad bridge', 'dange chowk'],
  },
  {
    name: 'Koregaon Park (North Main Road)',
    lat: 18.5362,
    lng: 73.8940,
    landmarkType: 'commercial',
    aliases: ['koregaon park', 'kp', 'north main road'],
  },
  {
    name: 'Katraj (Snake Park & Wonder World)',
    lat: 18.4530,
    lng: 73.8640,
    landmarkType: 'suburb',
    aliases: ['katraj', 'katraj zoo', 'katraj bus stand'],
  },
  {
    name: 'Hadapsar (Gadital)',
    lat: 18.5020,
    lng: 73.9280,
    landmarkType: 'suburb',
    aliases: ['hadapsar', 'gadital', 'hadapsar bus stand'],
  },
];

export const PUNE_PRESET_TRIPS: PunePresetTrip[] = [
  {
    id: 'ait-fc-road',
    label: 'AIT Pune ➔ FC Road',
    origin: PUNE_LANDMARKS[0], // AIT Pune
    destination: PUNE_LANDMARKS.find((l) => l.aliases.includes('fc road')) || PUNE_LANDMARKS[18],
    budget: 100,
  },
  {
    id: 'ait-pune-junction',
    label: 'AIT Pune ➔ Pune Junction',
    origin: PUNE_LANDMARKS[0], // AIT Pune
    destination: PUNE_LANDMARKS[7], // Pune Junction
    budget: 150,
  },
  {
    id: 'hinjewadi-shivajinagar',
    label: 'Hinjewadi ➔ Shivajinagar',
    origin: PUNE_LANDMARKS[11], // Hinjewadi Phase 1
    destination: PUNE_LANDMARKS[8], // Shivajinagar
    budget: 150,
  },
  {
    id: 'swargate-pcmc',
    label: 'Swargate ➔ PCMC (Metro)',
    origin: PUNE_LANDMARKS[9], // Swargate
    destination: PUNE_LANDMARKS[17], // PCMC
    budget: 60,
  },
];
