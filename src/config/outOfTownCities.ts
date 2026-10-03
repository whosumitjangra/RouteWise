import { LocationPoint } from '../types';

export interface OutOfTownCity {
  name: string;
  state: string;
  lat: number;
  lng: number;
  aliases: string[];
  description: string;
  isPopularGetaway?: boolean;
}

export const OUT_OF_TOWN_CITIES: OutOfTownCity[] = [
  {
    name: 'Lonavala',
    state: 'Maharashtra',
    lat: 18.7557,
    lng: 73.4091,
    aliases: ['lonavala', 'lonavla', 'khandala', 'lonavala station', 'bhushi dam', 'tiger point', 'karla caves', 'ins shivaji'],
    description: 'Scenic Western Ghats Hill Station (~65 km from Pune) • Local Suburban Rail & Highway corridor',
    isPopularGetaway: true,
  },
  {
    name: 'Khandala',
    state: 'Maharashtra',
    lat: 18.7614,
    lng: 73.3752,
    aliases: ['khandala', 'khandala ghat', 'duke nose'],
    description: 'Hill Station & Ghat corridor (~70 km from Pune)',
    isPopularGetaway: true,
  },
  {
    name: 'Mahabaleshwar',
    state: 'Maharashtra',
    lat: 17.9237,
    lng: 73.6586,
    aliases: ['mahabaleshwar', 'panchgani', 'venna lake'],
    description: 'Highland strawberry town & hill getaway (~120 km from Pune)',
    isPopularGetaway: true,
  },
  {
    name: 'Lavasa',
    state: 'Maharashtra',
    lat: 18.4091,
    lng: 73.5074,
    aliases: ['lavasa', 'lavasa city', 'dasve'],
    description: 'Planned lakeside hill station in Mose valley (~58 km from Pune)',
    isPopularGetaway: true,
  },
  {
    name: 'Alibaug',
    state: 'Maharashtra',
    lat: 18.6414,
    lng: 72.8722,
    aliases: ['alibaug', 'alibag', 'varsoli', 'nagaon', 'mandwa'],
    description: 'Coastal coastal getaway & beach town (~140 km from Pune)',
    isPopularGetaway: true,
  },
  {
    name: 'Shirdi',
    state: 'Maharashtra',
    lat: 19.7645,
    lng: 74.4762,
    aliases: ['shirdi', 'sai baba temple', 'shirdi temple'],
    description: 'Pilgrimage spiritual center (~185 km from Pune)',
    isPopularGetaway: true,
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    aliases: ['mumbai', 'bombay', 'navi mumbai', 'thane', 'bandra', 'andheri', 'dadar', 'csmt', 'vashi', 'panvel'],
    description: 'Financial capital of India (~150 km from Pune via Expressway) • Local Trains & Metro',
  },
  {
    name: 'Nashik',
    state: 'Maharashtra',
    lat: 19.9975,
    lng: 73.7898,
    aliases: ['nashik', 'nasik', 'panchavati', 'trimbakeshwar'],
    description: 'Wine capital of India (~210 km from Pune) • Citilinc city buses',
  },
  {
    name: 'Nagpur',
    state: 'Maharashtra',
    lat: 21.1458,
    lng: 79.0882,
    aliases: ['nagpur', 'sitabuldi'],
    description: 'Winter capital & Orange City • Maha Metro Nagpur & Aapli Bus',
  },
  {
    name: 'Chhatrapati Sambhajinagar (Aurangabad)',
    state: 'Maharashtra',
    lat: 19.8762,
    lng: 75.3433,
    aliases: ['aurangabad', 'sambhajinagar', 'chhatrapati sambhajinagar', 'ellora', 'ajanta'],
    description: 'Historic city & World Heritage corridors (~230 km from Pune)',
  },
  {
    name: 'Kolhapur',
    state: 'Maharashtra',
    lat: 16.7050,
    lng: 74.2433,
    aliases: ['kolhapur', 'mahalaxmi temple'],
    description: 'Cultural & historic city in Southern Maharashtra (~230 km from Pune)',
  },
  {
    name: 'Solapur',
    state: 'Maharashtra',
    lat: 17.6599,
    lng: 75.9064,
    aliases: ['solapur', 'sholapur'],
    description: 'Textile hub & pilgrimage gateway (~250 km from Pune)',
  },
  {
    name: 'Goa',
    state: 'Goa',
    lat: 15.2993,
    lng: 74.1240,
    aliases: ['goa', 'panaji', 'panjim', 'margao', 'vasco', 'calangute', 'anjuna'],
    description: 'Coastal paradise • Intercity ferries & shuttle networks (~440 km from Pune)',
  },
  {
    name: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    aliases: ['bengaluru', 'bangalore', 'whitefield', 'koramangala', 'indiranagar', 'electronic city', 'hsr'],
    description: 'Silicon Valley of India • Namma Metro & BMTC',
  },
  {
    name: 'Delhi NCR',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    aliases: ['delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram', 'ghaziabad', 'faridabad', 'cp'],
    description: 'National Capital Region • Delhi Metro & DTC Buses',
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    aliases: ['hyderabad', 'secunderabad', 'hitec city', 'gachibowli', 'madhapur', 'charminar'],
    description: 'Cyberabad • Hyderabad Metro & TSRTC',
  },
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    aliases: ['chennai', 'madras', 't nagar', 'velachery', 'adyar'],
    description: 'Detroit of Asia • Chennai Metro & MTC',
  },
  {
    name: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    aliases: ['kolkata', 'calcutta', 'howrah', 'salt lake', 'park street'],
    description: 'City of Joy • Kolkata Metro & Tramways',
  },
  {
    name: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    aliases: ['ahmedabad', 'amdavad', 'gandhinagar', 'maninagar', 'sg highway'],
    description: 'Heritage city • Ahmedabad Metro & BRTS Janmarg',
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    aliases: ['jaipur', 'pink city'],
    description: 'Pink City • Jaipur Metro & JCTSL',
  },
  {
    name: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lng: 75.8577,
    aliases: ['indore', 'vijay nagar'],
    description: 'Cleanest City of India • iBus BRTS & Metro',
  },
];

/**
 * Checks if a given query matches any known out-of-town city
 */
export function matchOutOfTownCity(rawQuery: string): OutOfTownCity | null {
  if (!rawQuery) return null;
  const q = rawQuery.toLowerCase().trim();
  if (q.length < 2) return null;

  // Exact name or alias match
  for (const city of OUT_OF_TOWN_CITIES) {
    const cName = city.name.toLowerCase();
    if (cName === q || q.includes(cName) || cName.includes(q)) {
      return city;
    }
    const aliasMatch = city.aliases.some((alias) => q.includes(alias) || alias.includes(q));
    if (aliasMatch) {
      return city;
    }
  }

  return null;
}

/**
 * Determines whether a location is outside the active Pune operating area
 */
export function isLocationOutOfTown(loc?: LocationPoint | null): {
  isOutOfTown: boolean;
  cityName?: string;
  matchedCity?: OutOfTownCity;
  distanceFromPuneKm?: number;
} {
  if (!loc) return { isOutOfTown: false };

  // Explicit flag
  if (loc.isOutOfTown) {
    return {
      isOutOfTown: true,
      cityName: loc.cityName || loc.name.split(',')[0],
      matchedCity: matchOutOfTownCity(loc.name) || undefined,
    };
  }

  // Name match against out-of-town cities
  const matched = matchOutOfTownCity(loc.name);
  if (matched) {
    return {
      isOutOfTown: true,
      cityName: matched.name,
      matchedCity: matched,
    };
  }

  // Spatial threshold: Pune Center is at (18.5204, 73.8567)
  // Any location > 52 km away is out of town (e.g. Lonavala is ~65 km)
  const R = 6371;
  const dLat = ((loc.lat - 18.5204) * Math.PI) / 180;
  const dLon = ((loc.lng - 73.8567) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((18.5204 * Math.PI) / 180) *
      Math.cos((loc.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const distanceKm = +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);

  if (distanceKm > 52) {
    const cleanName = loc.name.split(',')[0].trim();
    return {
      isOutOfTown: true,
      cityName: cleanName,
      distanceFromPuneKm: distanceKm,
    };
  }

  return { isOutOfTown: false, distanceFromPuneKm: distanceKm };
}
