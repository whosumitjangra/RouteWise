import { PMPMLBusRoute } from '../types';

/**
 * Curated PMPML (Pune Mahanagar Parivahan Mahamandal Limited) 
 * City & Intercity / Suburban Bus Routes Catalog
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
    frequencyMinutes: 15,
    operatingHours: '06:30 AM – 10:30 PM',
    isIntercity: true,
    approxDistanceKm: 24.0,
  },
  {
    busNumber: '165',
    routeName: 'AIT / Vishrantwadi ➔ Viman Nagar / Kharadi IT Hub',
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
      'Hinjawadi Phase 1',
      'Hinjawadi Phase 2',
      'Hinjawadi Phase 3',
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

  // 4. Hadapsar & Magarpatta Corridors
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

  // 5. Kothrud & Western Suburbs
  {
    busNumber: '115P',
    routeName: 'Pune Station ➔ Kothrud Depot (via Deccan)',
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

  // 6. Northern & Eastern Corridors
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
    busNumber: '187',
    routeName: 'Pune Station ➔ Kharadi EON IT Park',
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

  // 8. Airport & Aundh Corridors
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

  // 9. Intercity Suburban Corridors
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
const PUNE_LOCALITY_KEYWORDS: { [key: string]: string[] } = {
  ait: ['ait', 'army institute of technology', 'dighi', 'alandi road ait'],
  alandi: ['alandi', 'alandi devachi', 'charholi'],
  pune_station: ['pune station', 'pune junction', 'sadhu vaswani', 'station road', 'ruby hall'],
  shivajinagar: ['shivajinagar', 'shivaji nagar', 'coep', 'manapa', 'sancheti', 'pmc bhavan'],
  hinjawadi: ['hinjawadi', 'hinjewadi', 'maan', 'wipro circle', 'infosys', 'wakad'],
  swargate: ['swargate', 'sarasbaug', 'shanipar'],
  kothrud: ['kothrud', 'karve road', 'nal stop', 'mayur colony', 'garware', 'paud'],
  viman_nagar: ['viman nagar', 'vimannagar', 'symbiosis', 'ramwadi', 'aeromall'],
  airport: ['airport', 'pnq', 'lohegaon', 'tingre nagar'],
  hadapsar: ['hadapsar', 'magarpatta', 'fursungi', 'fatimanagar', 'gadital'],
  pcmc: ['pcmc', 'pimpri', 'chinchwad', 'nigdi', 'akurdi', 'kasarwadi', 'bhosari'],
  baner: ['baner', 'balewadi', 'aundh', 'bremen chowk', 'pune university', 'sppu'],
  katraj: ['katraj', 'bharati vidyapeeth', 'balaji nagar', 'dhankawadi', 'pict'],
  kharadi: ['kharadi', 'eon it park', 'world trade center', 'chandan nagar'],
  khadki: ['khadki', 'bopodi', 'dapodi'],
  camp: ['camp', 'pulgate', 'mg road', 'east street'],
};

function extractLocalityKeys(text: string): string[] {
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
  return name
    .toLowerCase()
    .replace(/[,\.\-\(\)\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches the PMPML catalog to find a direct or best matching bus route
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
  const oKeys = extractLocalityKeys(originName);
  const dKeys = extractLocalityKeys(destName);

  let bestMatch: {
    matchedRoute: PMPMLBusRoute;
    boardingStop: string;
    exitStop: string;
    stopsSegment: string[];
    score: number;
  } | null = null;

  for (const route of PMPML_BUS_ROUTES) {
    let bestBoardIdx = -1;
    let bestExitIdx = -1;
    let boardScore = 0;
    let exitScore = 0;

    route.viaStops.forEach((stop, idx) => {
      const sKeys = extractLocalityKeys(stop);
      const sClean = normalizeStopName(stop);

      // Check origin match
      const oKeyOverlap = oKeys.some((k) => sKeys.includes(k));
      if (oKeyOverlap) {
        bestBoardIdx = idx;
        boardScore = 2;
      } else if (bestBoardIdx === -1) {
        const oClean = normalizeStopName(originName);
        if (sClean.length > 3 && (oClean.includes(sClean) || sClean.includes(oClean))) {
          bestBoardIdx = idx;
          boardScore = 1;
        }
      }

      // Check destination match
      const dKeyOverlap = dKeys.some((k) => sKeys.includes(k));
      if (dKeyOverlap) {
        bestExitIdx = idx;
        exitScore = 2;
      } else if (bestExitIdx === -1) {
        const dClean = normalizeStopName(destName);
        if (sClean.length > 3 && (dClean.includes(sClean) || sClean.includes(dClean))) {
          bestExitIdx = idx;
          exitScore = 1;
        }
      }
    });

    if (bestBoardIdx !== -1 && bestExitIdx !== -1 && bestBoardIdx !== bestExitIdx) {
      const score = boardScore + exitScore;
      if (!bestMatch || score > bestMatch.score) {
        const minI = Math.min(bestBoardIdx, bestExitIdx);
        const maxI = Math.max(bestBoardIdx, bestExitIdx);
        const stopsSegment = route.viaStops.slice(minI, maxI + 1);
        if (bestBoardIdx > bestExitIdx) stopsSegment.reverse();

        bestMatch = {
          matchedRoute: route,
          boardingStop: route.viaStops[bestBoardIdx],
          exitStop: route.viaStops[bestExitIdx],
          stopsSegment,
          score,
        };
      }
    }
  }

  if (bestMatch && bestMatch.score >= 2) {
    return {
      matchedRoute: bestMatch.matchedRoute,
      boardingStop: bestMatch.boardingStop,
      exitStop: bestMatch.exitStop,
      stopsSegment: bestMatch.stopsSegment,
    };
  }

  return null;
}
