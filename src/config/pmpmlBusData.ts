import { PMPMLBusRoute } from '../types';
import pmpmlGtfsRoutesData from './pmpmlGtfsRoutes.json';
import pmpmlStopsData from './pmpmlStops.json';

export interface PMPMLGtfsRouteRecord {
  routeId: string;
  busNumber: string;
  routeName: string;
  routeNameMr?: string;
  origin: string;
  dest: string;
  originCoords: { lat: number; lon: number } | null;
  destCoords: { lat: number; lon: number } | null;
  headsigns: {
    dir0: string[];
    dir1: string[];
  };
  km: number;
  tripsCount: number;
  frequencyMinutes: number;
}

export interface PMPMLStopRecord {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export const PMPML_GTFS_ROUTES: PMPMLGtfsRouteRecord[] = pmpmlGtfsRoutesData as PMPMLGtfsRouteRecord[];
export const PMPML_STOPS: PMPMLStopRecord[] = pmpmlStopsData as PMPMLStopRecord[];

/**
 * Curated PMPML (Pune Mahanagar Parivahan Mahamandal Limited) 
 * City & Intercity / Suburban Bus Routes Catalog
 * 100% authentic Pune bus routes, numbers, terminals, and stops
 */
export const PMPML_BUS_ROUTES: PMPMLBusRoute[] = [
  // 1. AIT Pune / Dighi / Alandi Corridors
  {
    busNumber: '158',
    routeName: 'Alandi ➔ Pune Station (via Dighi / AIT Pune)',
    originTerminal: 'Alandi Devachi ST Stand',
    destinationTerminal: 'Pune Station Bus Stand',
    viaStops: [
      'Alandi Devachi',
      'Charholi Phata',
      'Dighi Gaon',
      'AIT Pune (Dighi Camp)',
      'Magazine Corner',
      'Customs Colony',
      'Vishrantwadi Chowk',
      'Phule Nagar',
      'Shanti Nagar',
      'Sadhu Vaswani Chowk',
      'Pune Station Bus Stand',
    ],
    frequencyMinutes: 12,
    operatingHours: '05:45 AM – 11:15 PM',
    isIntercity: true,
    approxDistanceKm: 14.5,
  },
  {
    busNumber: '158A',
    routeName: 'Alandi ➔ Manapa (PMC Bhavan via AIT Pune / COEP)',
    originTerminal: 'Alandi Devachi',
    destinationTerminal: 'Manapa Bhavan (PMC)',
    viaStops: [
      'Alandi Devachi',
      'Dighi Gaon',
      'AIT Pune (Dighi Camp)',
      'Magazine Corner',
      'Vishrantwadi Chowk',
      'RTO Pune',
      'COEP Hostel',
      'Manapa Bhavan (PMC)',
    ],
    frequencyMinutes: 15,
    operatingHours: '06:00 AM – 10:45 PM',
    isIntercity: true,
    approxDistanceKm: 13.0,
  },
  {
    busNumber: '357',
    routeName: 'AIT / Vishrantwadi ➔ Hinjawadi Phase 3 (IT Express)',
    originTerminal: 'AIT Pune Gate (Dighi)',
    destinationTerminal: 'Hinjawadi Phase 3 (Maan)',
    viaStops: [
      'AIT Pune (Dighi Camp)',
      'Vishrantwadi Chowk',
      'Khadki Bazar',
      'Aundh Bremen Chowk',
      'Baner Phata',
      'Wakad Bridge',
      'Hinjawadi Shivaji Chowk',
      'Hinjawadi Phase 1 (Wipro Circle)',
      'Hinjawadi Phase 2 (Infosys Circle)',
      'Hinjawadi Phase 3 (Maan Circle)',
    ],
    frequencyMinutes: 12,
    operatingHours: '06:30 AM – 10:30 PM',
    isIntercity: true,
    approxDistanceKm: 24.0,
  },
  {
    busNumber: '165',
    routeName: 'AIT / Vishrantwadi ➔ Kharadi EON IT Hub',
    originTerminal: 'AIT Pune Gate (Dighi)',
    destinationTerminal: 'Kharadi EON Free Zone IT Park',
    viaStops: [
      'AIT Pune (Dighi Camp)',
      'Magazine Corner',
      'Vishrantwadi Chowk',
      'Yerwada Golf Club',
      'Shastri Nagar',
      'Viman Nagar Corner',
      'Chandan Nagar Bypass',
      'World Trade Center Pune',
      'Kharadi EON IT Park',
    ],
    frequencyMinutes: 15,
    operatingHours: '06:15 AM – 10:45 PM',
    isIntercity: true,
    approxDistanceKm: 14.0,
  },
  {
    busNumber: '168',
    routeName: 'AIT / Vishrantwadi ➔ Hadapsar Gadital (Magarpatta)',
    originTerminal: 'AIT Pune Gate (Dighi)',
    destinationTerminal: 'Hadapsar Gadital Bus Stand',
    viaStops: [
      'AIT Pune (Dighi Camp)',
      'Vishrantwadi Chowk',
      'Sangamwadi Concourse',
      'Pune Station',
      'Pulgate (Camp)',
      'Fatimanagar',
      'Magarpatta City Gate',
      'Hadapsar Gadital',
    ],
    frequencyMinutes: 18,
    operatingHours: '06:00 AM – 10:30 PM',
    isIntercity: true,
    approxDistanceKm: 17.5,
  },
  {
    busNumber: '120',
    routeName: 'AIT / Dighi ➔ Bhosari / PCMC Concourse',
    originTerminal: 'AIT Pune (Dighi Camp)',
    destinationTerminal: 'Pimpri / PCMC Metro Stand',
    viaStops: [
      'AIT Pune (Dighi Camp)',
      'Dighi Gaon',
      'Magazine Corner',
      'Bhosari Gaon',
      'Nashik Phata',
      'Kasarwadi',
      'Pimpri Station',
      'PCMC Concourse',
    ],
    frequencyMinutes: 15,
    operatingHours: '06:00 AM – 11:00 PM',
    isIntercity: true,
    approxDistanceKm: 12.0,
  },
  {
    busNumber: '29',
    routeName: 'Swargate ➔ Alandi (via Shivajinagar / Vishrantwadi)',
    originTerminal: 'Swargate Bus Stand',
    destinationTerminal: 'Alandi Devachi',
    viaStops: [
      'Swargate Bus Stand',
      'Sarasbaug',
      'Shanipar',
      'Manapa Bhavan',
      'Shivajinagar Station',
      'COEP College',
      'Sangamwadi',
      'Vishrantwadi Chowk',
      'Magazine Corner',
      'Dighi Gaon',
      'AIT Pune (Dighi Camp)',
      'Alandi Devachi',
    ],
    frequencyMinutes: 15,
    operatingHours: '05:30 AM – 11:00 PM',
    isIntercity: true,
    approxDistanceKm: 18.0,
  },

  // 2. Hinjewadi IT Corridors
  {
    busNumber: '100',
    routeName: 'Pune Station ➔ Hinjawadi Maan Phase 3',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Hinjawadi Maan Phase 3',
    viaStops: [
      'Pune Station',
      'RTO Pune',
      'Shivajinagar Station',
      'Sancheti Hospital',
      'Pune University Main Gate',
      'Baner Phata',
      'Wakad Bridge',
      'Hinjawadi Shivaji Chowk',
      'Hinjawadi Phase 1 (Wipro Circle)',
      'Hinjawadi Phase 2 (Infosys Circle)',
      'Hinjawadi Phase 3 (Tech Mahindra / Maan)',
    ],
    frequencyMinutes: 10,
    operatingHours: '05:30 AM – 11:30 PM',
    isIntercity: true,
    approxDistanceKm: 21.0,
  },
  {
    busNumber: '258',
    routeName: 'Manapa Bhavan ➔ Hinjawadi Phase 3 (via Aundh & Wakad)',
    originTerminal: 'Manapa Bhavan (PMC)',
    destinationTerminal: 'Hinjawadi Phase 3 (Maan)',
    viaStops: [
      'Manapa Bhavan (PMC)',
      'Shivajinagar Station',
      'Pune University Main Gate',
      'Aundh Bremen Chowk',
      'Jagtap Dairy',
      'Dange Chowk',
      'Hinjawadi Shivaji Chowk',
      'Hinjawadi Phase 1 (Wipro Circle)',
      'Hinjawadi Phase 2 (Infosys Circle)',
      'Hinjawadi Phase 3 (Maan)',
    ],
    frequencyMinutes: 12,
    operatingHours: '06:00 AM – 11:00 PM',
    isIntercity: true,
    approxDistanceKm: 20.0,
  },
  {
    busNumber: '208',
    routeName: 'Hinjawadi Phase 3 ➔ Hadapsar Gadital / Bhekrainagar',
    originTerminal: 'Hinjawadi Phase 3 (Maan)',
    destinationTerminal: 'Hadapsar Gadital Bus Stand',
    viaStops: [
      'Hinjawadi Phase 3 (Maan)',
      'Hinjawadi Phase 2 (Infosys Circle)',
      'Hinjawadi Phase 1 (Wipro Circle)',
      'Wakad Bridge',
      'Balewadi Stadium',
      'Baner High Street',
      'Pune University Main Gate',
      'Shivajinagar Station',
      'Pune Station',
      'Pulgate (Camp)',
      'Fatimanagar',
      'Magarpatta City Gate',
      'Hadapsar Gadital',
    ],
    frequencyMinutes: 15,
    operatingHours: '06:00 AM – 10:30 PM',
    isIntercity: true,
    approxDistanceKm: 26.5,
  },
  {
    busNumber: '341',
    routeName: 'Bhosari ➔ Hinjawadi Phase 3 (via Jagtap Dairy)',
    originTerminal: 'Bhosari Gaon',
    destinationTerminal: 'Hinjawadi Phase 3 (Maan)',
    viaStops: [
      'Bhosari Gaon',
      'Nashik Phata',
      'Pimple Saudagar',
      'Jagtap Dairy',
      'Dange Chowk',
      'Hinjawadi Shivaji Chowk',
      'Hinjawadi Phase 1 (Wipro Circle)',
      'Hinjawadi Phase 2 (Infosys Circle)',
      'Hinjawadi Phase 3 (Maan)',
    ],
    frequencyMinutes: 15,
    operatingHours: '06:00 AM – 10:45 PM',
    isIntercity: true,
    approxDistanceKm: 19.5,
  },

  // 3. Central & BRTS Rainbow Corridors
  {
    busNumber: '111',
    routeName: 'Swargate ➔ Nigdi (Rainbow BRTS Corridor)',
    originTerminal: 'Swargate Bus Stand',
    destinationTerminal: 'Nigdi Pradhikaran Pavananagar',
    viaStops: [
      'Swargate Bus Stand',
      'Deccan Gymkhana',
      'Shivajinagar Station',
      'Wakdewadi',
      'Khadki Bazar',
      'Bopodi',
      'Dapodi Metro',
      'Kasarwadi',
      'Pimpri Station',
      'Chinchwad Station',
      'Akurdi Station',
      'Nigdi Pradhikaran',
    ],
    frequencyMinutes: 8,
    operatingHours: '05:00 AM – 11:45 PM',
    isIntercity: true,
    approxDistanceKm: 22.5,
  },
  {
    busNumber: '43',
    routeName: 'Katraj ➔ Nigdi (via Swargate & Pimpri)',
    originTerminal: 'Katraj Bus Stand',
    destinationTerminal: 'Nigdi Pavananagar',
    viaStops: [
      'Katraj Bus Stand',
      'Bharati Vidyapeeth',
      'Balaji Nagar',
      'Padmavati',
      'Swargate Bus Stand',
      'Shivajinagar Station',
      'Dapodi',
      'Pimpri Station',
      'Chinchwad Station',
      'Nigdi',
    ],
    frequencyMinutes: 12,
    operatingHours: '05:15 AM – 11:15 PM',
    isIntercity: true,
    approxDistanceKm: 26.0,
  },
  {
    busNumber: '2',
    routeName: 'Swargate ➔ Shivajinagar (Direct Core Trunk)',
    originTerminal: 'Swargate Bus Stand',
    destinationTerminal: 'Shivajinagar Bus Stand',
    viaStops: [
      'Swargate Bus Stand',
      'Sarasbaug',
      'Shanipar',
      'Appa Balwant Chowk',
      'Manapa Bhavan (PMC)',
      'Shivajinagar Station',
    ],
    frequencyMinutes: 6,
    operatingHours: '05:00 AM – 11:45 PM',
    isIntercity: false,
    approxDistanceKm: 5.5,
  },
  {
    busNumber: '13',
    routeName: 'Swargate ➔ Pune Station (via Camp)',
    originTerminal: 'Swargate Bus Stand',
    destinationTerminal: 'Pune Station Bus Stand',
    viaStops: [
      'Swargate Bus Stand',
      'Golibar Maidan',
      'Pulgate (Camp)',
      'MG Road (Camp)',
      'Sadhu Vaswani Chowk',
      'Pune Station Bus Stand',
    ],
    frequencyMinutes: 10,
    operatingHours: '05:30 AM – 11:30 PM',
    isIntercity: false,
    approxDistanceKm: 6.0,
  },

  // 4. Kothrud & Western Suburbs Corridors
  {
    busNumber: '94',
    routeName: 'Kothrud Depot ➔ Pune Station (via Deccan)',
    originTerminal: 'Kothrud Depot',
    destinationTerminal: 'Pune Station Bus Stand',
    viaStops: [
      'Kothrud Depot',
      'Vanaz Metro Station',
      'Ideal Colony',
      'Paud Phata',
      'Nal Stop',
      'SNDT Women College',
      'Garware College',
      'Deccan Gymkhana',
      'Appa Balwant Chowk',
      'Phadke Haud',
      'KEM Hospital',
      'Pune Station Bus Stand',
    ],
    frequencyMinutes: 10,
    operatingHours: '05:30 AM – 11:30 PM',
    isIntercity: false,
    approxDistanceKm: 10.5,
  },
  {
    busNumber: '115P',
    routeName: 'Pune Station ➔ Kothrud Depot (via Manapa & Karve Road)',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Kothrud Depot',
    viaStops: [
      'Pune Station',
      'Sadhu Vaswani Chowk',
      'RTO Pune',
      'Manapa Bhavan',
      'Deccan Gymkhana',
      'Garware College',
      'Nal Stop',
      'Paud Phata',
      'Mayur Colony',
      'Kothrud Depot',
    ],
    frequencyMinutes: 12,
    operatingHours: '06:00 AM – 11:00 PM',
    isIntercity: false,
    approxDistanceKm: 9.5,
  },
  {
    busNumber: '9',
    routeName: 'Kothrud Depot ➔ Swargate (via Nal Stop & Sarasbaug)',
    originTerminal: 'Kothrud Depot',
    destinationTerminal: 'Swargate Bus Stand',
    viaStops: [
      'Kothrud Depot',
      'Karve Statue',
      'Nal Stop',
      'Deccan Gymkhana',
      'Alka Talkies',
      'Sarasbaug',
      'Swargate Bus Stand',
    ],
    frequencyMinutes: 12,
    operatingHours: '06:00 AM – 10:45 PM',
    isIntercity: false,
    approxDistanceKm: 7.5,
  },
  {
    busNumber: '256',
    routeName: 'Kothrud Depot ➔ Baner / Balewadi (via Pashan)',
    originTerminal: 'Kothrud Depot',
    destinationTerminal: 'Balewadi Phata',
    viaStops: [
      'Kothrud Depot',
      'Chandani Chowk',
      'Bavdhan',
      'Pashan Circle',
      'Baner Road',
      'Baner High Street',
      'Balewadi Phata',
    ],
    frequencyMinutes: 18,
    operatingHours: '06:15 AM – 10:15 PM',
    isIntercity: false,
    approxDistanceKm: 12.0,
  },
  {
    busNumber: '170',
    routeName: 'Kothrud Depot ➔ Hadapsar Gadital (via Deccan & Swargate)',
    originTerminal: 'Kothrud Depot',
    destinationTerminal: 'Hadapsar Gadital',
    viaStops: [
      'Kothrud Depot',
      'Karve Road',
      'Deccan Gymkhana',
      'Swargate Bus Stand',
      'Golibar Maidan',
      'Pulgate (Camp)',
      'Fatimanagar',
      'Magarpatta Corner',
      'Hadapsar Gadital',
    ],
    frequencyMinutes: 15,
    operatingHours: '06:00 AM – 10:45 PM',
    isIntercity: true,
    approxDistanceKm: 16.0,
  },

  // 5. Eastern, Viman Nagar & Airport Corridors
  {
    busNumber: '166',
    routeName: 'Pune Station ➔ Viman Nagar (Phoenix Marketcity)',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Symbiosis Viman Nagar',
    viaStops: [
      'Pune Station',
      'Ruby Hall Clinic',
      'Bund Garden',
      'Yerwada',
      'Gunjan Chowk',
      'Shastri Nagar',
      'Ramwadi Metro',
      'Viman Nagar Corner',
      'Phoenix Marketcity',
      'Symbiosis Viman Nagar',
    ],
    frequencyMinutes: 12,
    operatingHours: '06:00 AM – 11:15 PM',
    isIntercity: false,
    approxDistanceKm: 9.0,
  },
  {
    busNumber: '149',
    routeName: 'Pune Station ➔ Wagholi (via Viman Nagar & Kharadi)',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Wagholi Bus Stand',
    viaStops: [
      'Pune Station',
      'Ruby Hall Clinic',
      'Bund Garden',
      'Yerwada',
      'Shastri Nagar',
      'Ramwadi Metro',
      'Viman Nagar Corner',
      'Chandan Nagar Bypass',
      'Kharadi Bypass',
      'Wagholi',
    ],
    frequencyMinutes: 12,
    operatingHours: '05:45 AM – 11:00 PM',
    isIntercity: true,
    approxDistanceKm: 15.0,
  },
  {
    busNumber: '163',
    routeName: 'Pune Station ➔ Kharadi Gaon (via Kalyani Nagar)',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Kharadi Gaon',
    viaStops: [
      'Pune Station',
      'Bund Garden',
      'Yerwada',
      'Kalyani Nagar',
      'Viman Nagar Bypass',
      'Chandan Nagar',
      'World Trade Center Pune',
      'Kharadi Gaon',
    ],
    frequencyMinutes: 15,
    operatingHours: '06:00 AM – 10:45 PM',
    isIntercity: true,
    approxDistanceKm: 12.5,
  },
  {
    busNumber: '187',
    routeName: 'Pune Station ➔ Kharadi EON IT Park',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Kharadi EON IT Park',
    viaStops: [
      'Pune Station',
      'Ruby Hall Clinic',
      'Yerwada',
      'Kalyani Nagar',
      'Viman Nagar',
      'Kharadi Bypass',
      'World Trade Center Pune',
      'EON IT Park Phase 1 & 2',
    ],
    frequencyMinutes: 12,
    operatingHours: '06:15 AM – 11:00 PM',
    isIntercity: true,
    approxDistanceKm: 13.5,
  },
  {
    busNumber: '144',
    routeName: 'Pune Station ➔ Pune Airport / Lohegaon',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Lohegaon Gaon',
    viaStops: [
      'Pune Station',
      'Ruby Hall Clinic',
      'Bund Garden',
      'Yerwada',
      'Gunjan Chowk',
      'Nagpur Chawl',
      'Tingre Nagar',
      'Pune Airport Terminal',
      'Lohegaon',
    ],
    frequencyMinutes: 15,
    operatingHours: '05:30 AM – 11:30 PM',
    isIntercity: false,
    approxDistanceKm: 11.5,
  },
  {
    busNumber: '102',
    routeName: 'Swargate ➔ Pune Airport (Lohegaon)',
    originTerminal: 'Swargate Bus Stand',
    destinationTerminal: 'Pune Airport Terminal',
    viaStops: [
      'Swargate Bus Stand',
      'Nana Peth',
      'Pune Station',
      'Ruby Hall Clinic',
      'Yerwada',
      'Tingre Nagar',
      'Pune Airport Terminal',
    ],
    frequencyMinutes: 20,
    operatingHours: '06:00 AM – 10:30 PM',
    isIntercity: false,
    approxDistanceKm: 14.0,
  },

  // 6. Hadapsar & Magarpatta Corridors
  {
    busNumber: '204',
    routeName: 'Hadapsar ➔ Chinchwad Gaon (via Pune Station)',
    originTerminal: 'Hadapsar Gadital',
    destinationTerminal: 'Chinchwad Gaon',
    viaStops: [
      'Hadapsar Gadital',
      'Magarpatta City Main Gate',
      'Fatimanagar',
      'Pulgate (Camp)',
      'Pune Station',
      'RTO Pune',
      'Shivajinagar Station',
      'Dapodi',
      'Pimpri Station',
      'Chinchwad Gaon',
    ],
    frequencyMinutes: 15,
    operatingHours: '05:45 AM – 10:45 PM',
    isIntercity: true,
    approxDistanceKm: 24.0,
  },

  // 7. Southern Corridors
  {
    busNumber: '24',
    routeName: 'Pune Station ➔ Katraj Bus Stand (via Swargate)',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Katraj Bus Stand',
    viaStops: [
      'Pune Station',
      'Sadhu Vaswani Chowk',
      'Swargate Bus Stand',
      'Padmavati',
      'Balaji Nagar',
      'Bharati Vidyapeeth',
      'Katraj Snake Park',
      'Katraj Bus Stand',
    ],
    frequencyMinutes: 10,
    operatingHours: '05:30 AM – 11:30 PM',
    isIntercity: false,
    approxDistanceKm: 11.0,
  },
  {
    busNumber: '50',
    routeName: 'Swargate ➔ Sinhagad Fort / Khadakwasla',
    originTerminal: 'Swargate Bus Stand',
    destinationTerminal: 'Sinhagad Paytha',
    viaStops: [
      'Swargate Bus Stand',
      'Sarasbaug',
      'Dandekar Pul',
      'Vitthalwadi',
      'Anand Nagar',
      'Dhayari Phata',
      'Khadakwasla Dam',
      'Donje Phata',
      'Sinhagad Paytha',
    ],
    frequencyMinutes: 20,
    operatingHours: '06:00 AM – 09:30 PM',
    isIntercity: true,
    approxDistanceKm: 23.0,
  },
  {
    busNumber: '174',
    routeName: 'Pune Station ➔ Khadakwasla Dam / NDA Gate',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Khadakwasla Dam (NDA Gate)',
    viaStops: [
      'Pune Station',
      'Swargate Bus Stand',
      'Sarasbaug',
      'Dandekar Pul',
      'Vitthalwadi',
      'Anand Nagar',
      'Manik Baug',
      'Dhayari Phata',
      'Khadakwasla Dam',
    ],
    frequencyMinutes: 18,
    operatingHours: '06:00 AM – 10:15 PM',
    isIntercity: true,
    approxDistanceKm: 16.5,
  },

  // 8. Northern, PCMC & Suburban Corridors
  {
    busNumber: '148',
    routeName: 'Pune Station ➔ Bhosari Gaon',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Bhosari Bus Stand',
    viaStops: [
      'Pune Station',
      'RTO Pune',
      'Wakdewadi',
      'Khadki',
      'Dapodi',
      'Phugewadi',
      'Nashik Phata',
      'Kasarwadi',
      'Landewadi',
      'Bhosari Gaon',
    ],
    frequencyMinutes: 12,
    operatingHours: '05:30 AM – 11:15 PM',
    isIntercity: true,
    approxDistanceKm: 13.5,
  },
  {
    busNumber: '276',
    routeName: 'Pune Station ➔ Baner Gaon (via University)',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Baner Gaon',
    viaStops: [
      'Pune Station',
      'RTO Pune',
      'Shivajinagar Station',
      'Pune University Main Gate',
      'Aundh Bremen Chowk',
      'Sanewadi',
      'Baner Phata',
      'Baner Gaon',
    ],
    frequencyMinutes: 15,
    operatingHours: '06:00 AM – 10:30 PM',
    isIntercity: false,
    approxDistanceKm: 12.5,
  },
  {
    busNumber: '315',
    routeName: 'Manapa ➔ Talegaon Dabhade (Intercity Suburban)',
    originTerminal: 'Manapa Bhavan (PMC)',
    destinationTerminal: 'Talegaon Dabhade Station',
    viaStops: [
      'Manapa Bhavan',
      'Khadki Bazar',
      'Dapodi',
      'Pimpri',
      'Chinchwad Station',
      'Nigdi',
      'Dehu Road',
      'Gahunje Cricket Stadium',
      'Talegaon Dabhade',
    ],
    frequencyMinutes: 20,
    operatingHours: '05:30 AM – 10:30 PM',
    isIntercity: true,
    approxDistanceKm: 33.0,
  },
  {
    busNumber: '364',
    routeName: 'Swargate ➔ Saswad (Intercity Suburban)',
    originTerminal: 'Swargate Bus Stand',
    destinationTerminal: 'Saswad ST Stand',
    viaStops: [
      'Swargate Bus Stand',
      'Hadapsar Gadital',
      'Fursungi',
      'Dive Ghat Base',
      'Wadki Nala',
      'Saswad ST Stand',
    ],
    frequencyMinutes: 25,
    operatingHours: '06:00 AM – 09:30 PM',
    isIntercity: true,
    approxDistanceKm: 29.0,
  },
];

/**
 * Key locality keywords to map Pune neighborhoods precisely
 */
/**
 * Key locality keywords to map Pune neighborhoods precisely
 */
export const PUNE_LOCALITY_KEYWORDS: { [key: string]: string[] } = {
  ait: ['ait', 'army institute of technology', 'dighi', 'alandi road ait'],
  alandi: ['alandi', 'alandi devachi', 'charholi'],
  pune_station: ['pune station', 'pune junction', 'sadhu vaswani', 'station road', 'ruby hall', 'moledina', 'railway station'],
  shivajinagar: ['shivajinagar', 'shivaji nagar', 'coep', 'manapa', 'sancheti', 'pmc bhavan', 'wakdewadi', 'ma na pa', 'pmc'],
  hinjawadi: ['hinjawadi', 'hinjewadi', 'maan', 'wipro circle', 'infosys', 'wakad', 'megapolis', 'tech mahindra', 'phase 1', 'phase 2', 'phase 3'],
  swargate: ['swargate', 'sarasbaug', 'shanipar', 'golibar maidan'],
  kothrud: ['kothrud', 'karve road', 'karve statue', 'nal stop', 'mayur colony', 'garware', 'paud', 'vanaz', 'ideal colony', 'chandani chowk', 'mit'],
  viman_nagar: ['viman nagar', 'vimannagar', 'symbiosis', 'ramwadi', 'aeromall', 'phoenix marketcity', 'phoenix mall'],
  airport: ['airport', 'pnq', 'lohegaon', 'tingre nagar'],
  hadapsar: ['hadapsar', 'magarpatta', 'fursungi', 'fatimanagar', 'gadital', 'bhekrainagar'],
  pcmc: ['pcmc', 'pimpri', 'chinchwad', 'nigdi', 'akurdi', 'kasarwadi', 'bhosari', 'bhakti shakti'],
  baner: ['baner', 'balewadi', 'aundh', 'bremen chowk', 'pune university', 'sppu', 'ganeshkhind'],
  katraj: ['katraj', 'bharati vidyapeeth', 'balaji nagar', 'dhankawadi', 'pict', 'padmavati'],
  kharadi: ['kharadi', 'eon it park', 'world trade center', 'chandan nagar'],
  khadki: ['khadki', 'bopodi', 'dapodi'],
  camp: ['camp', 'pulgate', 'mg road', 'east street'],
  bavdhan: ['bavdhan', 'chandani chowk', 'pashan'],
  dhayari: ['dhayari', 'dhayari maruti mandir', 'sinhagad road', 'narhe', 'ambegaon'],
  warje: ['warje', 'warje malwadi', 'karvenagar'],
  kondhwa: ['kondhwa', 'kondhwa bk', 'nibm', 'salunke vihar'],
  bhosari: ['bhosari', 'bhosari terminal', 'bhosarigaon'],
  lohgaon: ['lohgaon', 'd y patil', 'dy patil'],
  marketyard: ['marketyard', 'bibwewadi', 'upper depot'],
  deccan: ['deccan', 'deccan gymkhana', 'fc road', 'jm road'],
  kesnand: ['kesnand', 'kesnand phata', 'wagholi'],
};

export function extractLocalityKeys(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const [key, aliases] of Object.entries(PUNE_LOCALITY_KEYWORDS)) {
    if (aliases.some((alias) => lower.includes(alias))) {
      matched.push(key);
    }
  }
  return matched;
}

/**
 * Clean search token for Indian stop matching
 */
function normalizeStopName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/[,\.\-\(\)\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matches a catalog terminal against a search query
 */
function terminalMatchesQuery(termName: string, query: string, qKeys: string[]): boolean {
  if (!termName || !query) return false;
  const nTerm = normalizeStopName(termName);
  const nQuery = normalizeStopName(query);

  if (nTerm === nQuery || nTerm.includes(nQuery) || nQuery.includes(nTerm)) {
    return true;
  }

  // Locality key overlap
  const tKeys = extractLocalityKeys(termName);
  if (qKeys.some((k) => tKeys.includes(k))) {
    return true;
  }

  // Specific alias mappings (e.g. AIT Pune is on Alandi Road / Dighi corridor)
  if (qKeys.includes('ait') && (nTerm.includes('alandi') || nTerm.includes('vishrantwadi') || nTerm.includes('dighi'))) {
    return true;
  }

  return false;
}

/**
 * Calculates stop match affinity score
 */
function calculateStopScore(stop: string, targetName: string, targetKeys: string[]): number {
  const sClean = normalizeStopName(stop);
  const tClean = normalizeStopName(targetName);
  const sKeys = extractLocalityKeys(stop);

  // Exact phrase match
  if (tClean.includes(sClean) || sClean.includes(tClean)) {
    return 4;
  }

  // Locality key match
  const hasKeyOverlap = targetKeys.some((k) => sKeys.includes(k));
  if (hasKeyOverlap) {
    const wordsT = tClean.split(' ');
    const wordsS = sClean.split(' ');
    const wordOverlap = wordsT.filter((w) => w.length > 3 && wordsS.includes(w)).length;
    return 2 + wordOverlap;
  }

  return 0;
}

export interface MatchedPMPMLResult {
  matchedRoute: PMPMLBusRoute;
  boardingStop: string;
  exitStop: string;
  stopsSegment: string[];
  isTransfer?: boolean;
  transferHub?: string;
  firstBusNumber?: string;
  secondBusNumber?: string;
  officialKm?: number;
  officialRouteId?: string;
  marathiDescription?: string;
}

// Major interchange hubs in Pune for 1-transfer connections
const MAJOR_HUBS = [
  { name: 'Pune Station', key: 'pune_station' },
  { name: 'Ma Na Pa', key: 'shivajinagar' },
  { name: 'Swargate', key: 'swargate' },
  { name: 'Shivajinagar', key: 'shivajinagar' },
  { name: 'Katraj', key: 'katraj' },
  { name: 'Hadapsar Gadital', key: 'hadapsar' },
  { name: 'Deccan Gymkhana', key: 'deccan' },
];

function haversineDistKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distToLineSegment(
  p: { lat: number; lon: number },
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const l2 = (b.lat - a.lat) ** 2 + (b.lon - a.lon) ** 2;
  if (l2 === 0) return haversineDistKm(p.lat, p.lon, a.lat, a.lon);
  let t = ((p.lat - a.lat) * (b.lat - a.lat) + (p.lon - a.lon) * (b.lon - a.lon)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { lat: a.lat + t * (b.lat - a.lat), lon: a.lon + t * (b.lon - a.lon) };
  return haversineDistKm(p.lat, p.lon, proj.lat, proj.lon);
}

const STOP_BY_NAME_MAP = new Map<string, PMPMLStopRecord>();
PMPML_STOPS.forEach((s) => {
  STOP_BY_NAME_MAP.set(s.name.toLowerCase().trim(), s);
});

export function getStopByName(name: string): PMPMLStopRecord | undefined {
  const clean = name.toLowerCase().trim();
  const direct = STOP_BY_NAME_MAP.get(clean);
  if (direct) return direct;
  return PMPML_STOPS.find(
    (s) => s.name.toLowerCase().includes(clean) || clean.includes(s.name.toLowerCase())
  );
}

export function getStopsAlongCorridor(
  originName: string,
  destName: string,
  origCoords?: { lat: number; lng?: number; lon?: number } | null,
  destCoords?: { lat: number; lng?: number; lon?: number } | null
): string[] {
  let a: { lat: number; lon: number } | null = null;
  let b: { lat: number; lon: number } | null = null;

  if (origCoords) {
    a = { lat: origCoords.lat, lon: origCoords.lng ?? origCoords.lon ?? 0 };
  } else if (originName) {
    const s = getStopByName(originName);
    if (s) a = { lat: s.lat, lon: s.lon };
  }

  if (destCoords) {
    b = { lat: destCoords.lat, lon: destCoords.lng ?? destCoords.lon ?? 0 };
  } else if (destName) {
    const s = getStopByName(destName);
    if (s) b = { lat: s.lat, lon: s.lon };
  }

  if (!a || !b) return [originName, destName];

  const totalD = haversineDistKm(a.lat, a.lon, b.lat, b.lon);
  const corridorWidth = Math.min(1.8, Math.max(0.6, totalD * 0.08));

  const candidateStops = PMPML_STOPS.filter((s) => {
    const da = haversineDistKm(s.lat, s.lon, a!.lat, a!.lon);
    const db = haversineDistKm(s.lat, s.lon, b!.lat, b!.lon);
    if (da > totalD + 2.0 || db > totalD + 2.0) return false;
    return distToLineSegment(s, a!, b!) <= corridorWidth;
  });

  candidateStops.sort(
    (x, y) =>
      haversineDistKm(x.lat, x.lon, a!.lat, a!.lon) - haversineDistKm(y.lat, y.lon, a!.lat, a!.lon)
  );

  const res: string[] = [originName];
  const step = Math.max(1, Math.floor(candidateStops.length / 7));
  for (let i = step; i < candidateStops.length - 1; i += step) {
    const sName = candidateStops[i].name;
    if (!res.includes(sName) && sName !== destName && sName !== originName) {
      res.push(sName);
    }
  }
  if (!res.includes(destName)) res.push(destName);
  return res;
}

/**
 * Searches the official PMPML GTFS catalog (309 canonical routes + 1,030 full routes)
 * to find a direct bus route or authentic 1-transfer connection
 */
export function findMatchingPMPMLBusRoute(
  originName: string,
  destName: string,
  originCoords?: { lat: number; lng?: number; lon?: number } | null,
  destCoords?: { lat: number; lng?: number; lon?: number } | null
): MatchedPMPMLResult | null {
  const oKeys = extractLocalityKeys(originName);
  const dKeys = extractLocalityKeys(destName);

  // 1. FIRST PRIORITY: Direct match from Official GTFS 309 Routes Catalog
  const directGtfs = PMPML_GTFS_ROUTES.find((r) => {
    const origMatch = terminalMatchesQuery(r.origin, originName, oKeys);
    const destMatch = terminalMatchesQuery(r.dest, destName, dKeys);
    if (origMatch && destMatch) return true;

    // Check headsign match
    const h0Match = r.headsigns.dir0.some((h) => terminalMatchesQuery(h, destName, dKeys));
    const h1Match = r.headsigns.dir1.some((h) => terminalMatchesQuery(h, originName, oKeys));
    if (h0Match && h1Match) return true;

    // Check coordinate proximity if coordinates provided
    if (originCoords && destCoords && r.originCoords && r.destCoords) {
      const oLon = originCoords.lng ?? originCoords.lon ?? 0;
      const dLon = destCoords.lng ?? destCoords.lon ?? 0;
      const dOrigin = haversineDistKm(originCoords.lat, oLon, r.originCoords.lat, r.originCoords.lon);
      const dDest = haversineDistKm(destCoords.lat, dLon, r.destCoords.lat, r.destCoords.lon);
      if (dOrigin <= 1.8 && dDest <= 1.8) return true;
    }

    return false;
  });

  if (directGtfs) {
    const stopsSegment = getStopsAlongCorridor(
      directGtfs.origin,
      directGtfs.dest,
      originCoords || (directGtfs.originCoords ? { lat: directGtfs.originCoords.lat, lon: directGtfs.originCoords.lon } : null),
      destCoords || (directGtfs.destCoords ? { lat: directGtfs.destCoords.lat, lon: directGtfs.destCoords.lon } : null)
    );

    const isNight = directGtfs.busNumber.toLowerCase().includes('ratrani') || directGtfs.routeName.toLowerCase().includes('night');
    const isIntercity = directGtfs.km > 25 || directGtfs.routeName.toLowerCase().includes('intercity');

    const matchedRoute: PMPMLBusRoute = {
      busNumber: directGtfs.busNumber,
      routeName: directGtfs.routeName,
      routeNameMr: directGtfs.routeNameMr,
      originTerminal: directGtfs.origin,
      destinationTerminal: directGtfs.dest,
      viaStops: stopsSegment,
      frequencyMinutes: directGtfs.frequencyMinutes || 12,
      operatingHours: isNight ? '11:00 PM – 05:00 AM' : '05:30 AM – 11:15 PM',
      isIntercity,
      approxDistanceKm: directGtfs.km,
      officialRouteId: directGtfs.routeId,
    };

    return {
      matchedRoute,
      boardingStop: directGtfs.origin,
      exitStop: directGtfs.dest,
      stopsSegment,
      officialKm: directGtfs.km,
      officialRouteId: directGtfs.routeId,
      marathiDescription: directGtfs.routeNameMr,
    };
  }

  // 2. SECOND PRIORITY: Check curated corridor routes with viaStops scoring
  let bestCuratedMatch: {
    matchedRoute: PMPMLBusRoute;
    boardingStop: string;
    exitStop: string;
    stopsSegment: string[];
    score: number;
  } | null = null;

  for (const route of PMPML_BUS_ROUTES) {
    let bestBoardIdx = -1;
    let bestExitIdx = -1;
    let highestBoardScore = 0;
    let highestExitScore = 0;

    route.viaStops.forEach((stop, idx) => {
      const bScore = calculateStopScore(stop, originName, oKeys);
      if (bScore > highestBoardScore) {
        highestBoardScore = bScore;
        bestBoardIdx = idx;
      }

      const eScore = calculateStopScore(stop, destName, dKeys);
      if (eScore > highestExitScore) {
        highestExitScore = eScore;
        bestExitIdx = idx;
      }
    });

    if (
      bestBoardIdx !== -1 &&
      bestExitIdx !== -1 &&
      bestBoardIdx !== bestExitIdx &&
      highestBoardScore >= 2 &&
      highestExitScore >= 2
    ) {
      const totalScore = highestBoardScore + highestExitScore;
      if (!bestCuratedMatch || totalScore > bestCuratedMatch.score) {
        const minI = Math.min(bestBoardIdx, bestExitIdx);
        const maxI = Math.max(bestBoardIdx, bestExitIdx);
        const stopsSegment = route.viaStops.slice(minI, maxI + 1);
        if (bestBoardIdx > bestExitIdx) stopsSegment.reverse();

        bestCuratedMatch = {
          matchedRoute: route,
          boardingStop: route.viaStops[bestBoardIdx],
          exitStop: route.viaStops[bestExitIdx],
          stopsSegment,
          score: totalScore,
        };
      }
    }
  }

  if (bestCuratedMatch) {
    return {
      matchedRoute: bestCuratedMatch.matchedRoute,
      boardingStop: bestCuratedMatch.boardingStop,
      exitStop: bestCuratedMatch.exitStop,
      stopsSegment: bestCuratedMatch.stopsSegment,
      officialKm: bestCuratedMatch.matchedRoute.approxDistanceKm,
      marathiDescription: bestCuratedMatch.matchedRoute.routeNameMr,
    };
  }

  // 3. THIRD PRIORITY: 1-Transfer connection via Official GTFS Routes
  for (const hub of MAJOR_HUBS) {
    const hubKeys = extractLocalityKeys(hub.name);
    const leg1 = PMPML_GTFS_ROUTES.find(
      (r) =>
        terminalMatchesQuery(r.origin, originName, oKeys) &&
        terminalMatchesQuery(r.dest, hub.name, hubKeys)
    );

    const leg2 = PMPML_GTFS_ROUTES.find(
      (r) =>
        terminalMatchesQuery(r.origin, hub.name, hubKeys) &&
        terminalMatchesQuery(r.dest, destName, dKeys)
    );

    if (leg1 && leg2 && leg1.busNumber !== leg2.busNumber) {
      const leg1Km = leg1.km || 10;
      const leg2Km = leg2.km || 10;
      const totalKm = +(leg1Km + leg2Km).toFixed(1);
      const combinedStops = [
        leg1.origin,
        `${hub.name} (Transfer: Bus ${leg1.busNumber} ➔ Bus ${leg2.busNumber})`,
        leg2.dest,
      ];

      const synthesizedRoute: PMPMLBusRoute = {
        busNumber: `${leg1.busNumber} ➔ ${leg2.busNumber}`,
        routeName: `${leg1.origin} ➔ ${leg2.dest} (via ${hub.name})`,
        routeNameMr: `${leg1.routeNameMr || ''} + ${leg2.routeNameMr || ''}`,
        originTerminal: leg1.origin,
        destinationTerminal: leg2.dest,
        viaStops: combinedStops,
        frequencyMinutes: 12,
        operatingHours: '05:30 AM – 11:00 PM',
        isIntercity: totalKm > 25,
        approxDistanceKm: totalKm,
      };

      return {
        matchedRoute: synthesizedRoute,
        boardingStop: leg1.origin,
        exitStop: leg2.dest,
        stopsSegment: combinedStops,
        isTransfer: true,
        transferHub: hub.name,
        firstBusNumber: leg1.busNumber,
        secondBusNumber: leg2.busNumber,
        officialKm: totalKm,
        marathiDescription: `${leg1.routeNameMr || ''} + ${leg2.routeNameMr || ''}`,
      };
    }
  }

  return null;
}
