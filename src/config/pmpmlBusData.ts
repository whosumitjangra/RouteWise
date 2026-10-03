import { PMPMLBusRoute } from '../types';

/**
 * Curated PMPML (Pune Mahanagar Parivahan Mahamandal Limited) 
 * City & Intercity / Suburban Bus Routes Catalog
 */
export const PMPML_BUS_ROUTES: PMPMLBusRoute[] = [
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
      'Vishrantwadi',
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
      'Alandi Devachi',
    ],
    frequencyMinutes: 15,
    operatingHours: '05:30 AM – 11:00 PM',
    isIntercity: true,
    approxDistanceKm: 18.0,
  },
  {
    busNumber: '100',
    routeName: 'Pune Station ➔ Hinjawadi Maan Phase 3',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Hinjawadi Maan Phase 3',
    viaStops: [
      'Pune Station',
      'RTO Pune',
      'Shivajinagar Station',
      'Pune University Main Gate',
      'Sancheti Hospital',
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
      'Swargate',
      'Shivajinagar',
      'Dapodi',
      'Pimpri',
      'Chinchwad Station',
      'Nigdi',
    ],
    frequencyMinutes: 12,
    operatingHours: '05:15 AM – 11:15 PM',
    isIntercity: true,
    approxDistanceKm: 26.0,
  },
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
      'RTO',
      'Shivajinagar',
      'Dapodi',
      'Pimpri',
      'Chinchwad Gaon',
    ],
    frequencyMinutes: 15,
    operatingHours: '05:45 AM – 10:45 PM',
    isIntercity: true,
    approxDistanceKm: 24.0,
  },
  {
    busNumber: '115P',
    routeName: 'Pune Station ➔ Kothrud Depot',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Kothrud Depot',
    viaStops: [
      'Pune Station',
      'Sadhu Vaswani Chowk',
      'RTO',
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
    busNumber: '148',
    routeName: 'Pune Station ➔ Bhosari Gaon',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Bhosari Bus Stand',
    viaStops: [
      'Pune Station',
      'RTO',
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
    busNumber: '149',
    routeName: 'Pune Station ➔ Wagholi (via Viman Nagar & Kharadi)',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Wagholi Bus Stand',
    viaStops: [
      'Pune Station',
      'Ruby Hall Clinic',
      'Yerwada',
      'Shastri Nagar',
      'Ramwadi',
      'Viman Nagar Corner',
      'Chandan Nagar',
      'Kharadi Bypass',
      'Wagholi',
    ],
    frequencyMinutes: 12,
    operatingHours: '05:45 AM – 11:00 PM',
    isIntercity: true,
    approxDistanceKm: 15.0,
  },
  {
    busNumber: '24',
    routeName: 'Pune Station ➔ Katraj Bus Stand',
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
  {
    busNumber: '144',
    routeName: 'Pune Station ➔ Pune Airport / Lohegaon',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Lohegaon Gaon',
    viaStops: [
      'Pune Station',
      'Ruby Hall Clinic',
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
    busNumber: '341',
    routeName: 'Bhosari ➔ Hinjawadi Phase 3',
    originTerminal: 'Bhosari Gaon',
    destinationTerminal: 'Hinjawadi Phase 3 (Maan)',
    viaStops: [
      'Bhosari Gaon',
      'Nashik Phata',
      'Pimple Saudagar',
      'Jagtap Dairy',
      'Dange Chowk',
      'Hinjawadi Shivaji Chowk',
      'Hinjawadi Phase 1',
      'Hinjawadi Phase 2',
      'Hinjawadi Phase 3',
    ],
    frequencyMinutes: 15,
    operatingHours: '06:00 AM – 10:45 PM',
    isIntercity: true,
    approxDistanceKm: 19.5,
  },
  {
    busNumber: '170',
    routeName: 'Kothrud Depot ➔ Hadapsar Gadital',
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
  {
    busNumber: '276',
    routeName: 'Pune Station ➔ Baner Gaon (via University)',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Baner Gaon',
    viaStops: [
      'Pune Station',
      'RTO Pune',
      'Shivajinagar',
      'Pune University Main Gate',
      'Bremen Chowk (Aundh)',
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
    busNumber: '187',
    routeName: 'Pune Station ➔ Kharadi EON Free Zone IT Park',
    originTerminal: 'Pune Station Bus Stand',
    destinationTerminal: 'Kharadi EON IT Park',
    viaStops: [
      'Pune Station',
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
 * Clean search token for Indian stop matching
 */
function normalizeStopName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,\.\-\(\)\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches the PMPML catalog to find a direct or matching bus route
 */
export function findMatchingPMPMLBusRoute(
  originName: string,
  destName: string
): {
  matchedRoute: PMPMLBusRoute;
  boardingStop: string;
  exitStop: string;
  stopsSegment: string[];
} | null {
  const oClean = normalizeStopName(originName);
  const dClean = normalizeStopName(destName);

  for (const route of PMPML_BUS_ROUTES) {
    let boardIdx = -1;
    let exitIdx = -1;

    route.viaStops.forEach((stop, idx) => {
      const sClean = normalizeStopName(stop);
      if (
        boardIdx === -1 &&
        (oClean.includes(sClean) ||
          sClean.includes(oClean) ||
          (oClean.includes('ait') && sClean.includes('ait')) ||
          (oClean.includes('dighi') && sClean.includes('dighi')) ||
          (oClean.includes('pune junction') && sClean.includes('pune station')) ||
          (oClean.includes('station') && sClean.includes('station')) ||
          (oClean.includes('swargate') && sClean.includes('swargate')) ||
          (oClean.includes('hinjawadi') && sClean.includes('hinjawadi')) ||
          (oClean.includes('hadapsar') && sClean.includes('hadapsar')) ||
          (oClean.includes('chinchwad') && sClean.includes('chinchwad')) ||
          (oClean.includes('pimpri') && sClean.includes('pimpri')) ||
          (oClean.includes('nigdi') && sClean.includes('nigdi')) ||
          (oClean.includes('kothrud') && sClean.includes('kothrud')) ||
          (oClean.includes('katraj') && sClean.includes('katraj')) ||
          (oClean.includes('wagholi') && sClean.includes('wagholi')) ||
          (oClean.includes('airport') && sClean.includes('airport')) ||
          (oClean.includes('viman nagar') && sClean.includes('viman nagar')) ||
          (oClean.includes('kharadi') && sClean.includes('kharadi')))
      ) {
        boardIdx = idx;
      }

      if (
        exitIdx === -1 &&
        (dClean.includes(sClean) ||
          sClean.includes(dClean) ||
          (dClean.includes('ait') && sClean.includes('ait')) ||
          (dClean.includes('dighi') && sClean.includes('dighi')) ||
          (dClean.includes('pune junction') && sClean.includes('pune station')) ||
          (dClean.includes('station') && sClean.includes('station')) ||
          (dClean.includes('swargate') && sClean.includes('swargate')) ||
          (dClean.includes('hinjawadi') && sClean.includes('hinjawadi')) ||
          (dClean.includes('hadapsar') && sClean.includes('hadapsar')) ||
          (dClean.includes('chinchwad') && sClean.includes('chinchwad')) ||
          (dClean.includes('pimpri') && sClean.includes('pimpri')) ||
          (dClean.includes('nigdi') && sClean.includes('nigdi')) ||
          (dClean.includes('kothrud') && sClean.includes('kothrud')) ||
          (dClean.includes('katraj') && sClean.includes('katraj')) ||
          (dClean.includes('wagholi') && sClean.includes('wagholi')) ||
          (dClean.includes('airport') && sClean.includes('airport')) ||
          (dClean.includes('viman nagar') && sClean.includes('viman nagar')) ||
          (dClean.includes('kharadi') && sClean.includes('kharadi')))
      ) {
        exitIdx = idx;
      }
    });

    if (boardIdx !== -1 && exitIdx !== -1 && boardIdx !== exitIdx) {
      const minI = Math.min(boardIdx, exitIdx);
      const maxI = Math.max(boardIdx, exitIdx);
      const stopsSegment = route.viaStops.slice(minI, maxI + 1);
      if (boardIdx > exitIdx) stopsSegment.reverse();

      return {
        matchedRoute: route,
        boardingStop: route.viaStops[boardIdx],
        exitStop: route.viaStops[exitIdx],
        stopsSegment,
      };
    }
  }

  return null;
}
