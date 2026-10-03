export type PriorityMode = 'fastest' | 'cheapest' | 'balanced';

export type TransportModeType = 
  | 'driving'
  | 'rideshare'
  | 'train'
  | 'transit'
  | 'bus'
  | 'flight'
  | 'walking'
  | 'bicycling';

export type BadgeType = 
  | 'fastest'
  | 'cheapest'
  | 'balanced'
  | 'eco'
  | 'over_budget';

export interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export interface RouteCostBreakdown {
  baseFare: number;
  distanceCost: number;
  timeCost: number;
  fuelCost?: number;
  tollsCost?: number;
  surgeCost?: number;
  taxesAndFees?: number;
  bookingFee?: number;
  totalCost: number;
}

export interface RouteLeg {
  id: string;
  mode: TransportModeType;
  title: string;
  instruction: string;
  durationMinutes: number;
  distanceKm: number;
  cost: number;
  departureTime?: string;
  arrivalTime?: string;
  fromName?: string;
  toName?: string;
}

export interface RouteOption {
  id: string;
  mode: TransportModeType;
  title: string;
  subTitle: string;
  provider?: string;
  iconName: string;
  durationMinutes: number;
  distanceKm: number;
  cost: RouteCostBreakdown;
  co2Kg: number;
  isOverBudget: boolean;
  budgetDelta: number; // totalCost - maxBudget (negative means under budget)
  score: number; // for balanced ranking
  badges: BadgeType[];
  coordinates: [number, number][]; // [lat, lng][] for map polyline
  legs: RouteLeg[];
  highlights: string[];
  reliabilityScore: number; // 0 - 100%
  departureTimeFormatted: string;
  arrivalTimeFormatted: string;
}

export interface EngineParameters {
  fuelPricePerLiter: number; // in current currency
  fuelEfficiencyKmPerLiter: number; // e.g., 14 km/L
  tollEstimatePer100Km: number;
  rideshareBaseFare: number;
  ridesharePerKmRate: number;
  ridesharePerMinuteRate: number;
  rideshareSurgeMultiplier: number;
  rideshareBookingFee: number;
  flightBaseTax: number;
  flightPerKmRate: number;
  valueOfTimePerHour: number; // for balanced score calculation
}

export interface RouteSearchRequest {
  origin: LocationPoint;
  destination: LocationPoint;
  maxBudget: number;
  priority: PriorityMode;
  currency: string;
  customParams?: Partial<EngineParameters>;
}

export interface RouteSearchResponse {
  origin: LocationPoint;
  destination: LocationPoint;
  maxBudget: number;
  priority: PriorityMode;
  currency: string;
  timestamp: string;
  directDistanceKm: number;
  routes: RouteOption[];
  executionTimeMs: number;
}

export interface SavedRouteRecord {
  id: string;
  user_id?: string;
  origin: string;
  destination: string;
  max_budget: number;
  priority_mode: PriorityMode;
  selected_mode?: string;
  route_payload: RouteSearchResponse;
  created_at: string;
}
