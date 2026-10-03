export type PreferenceMode = 'cheapest' | 'fastest' | 'balanced';

export type TransportMode = 
  | 'metro_multimodal' 
  | 'auto' 
  | 'cab' 
  | 'walking';

export interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
  landmarkType?: 'it_park' | 'station' | 'commercial' | 'suburb' | 'metro';
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare?: number;
  totalFare: number;
  formulaDescription: string;
}

export interface RouteLeg {
  id: string;
  mode: TransportMode;
  title: string;
  durationMinutes: number;
  distanceKm: number;
  cost: number;
  fromName: string;
  toName: string;
  instruction: string;
  badge?: string;
  stopsCount?: number;
  isFeeder?: boolean;
  fromCoords?: [number, number]; // [lat, lng]
  toCoords?: [number, number];   // [lat, lng]
}

export interface StationWaypoint {
  name: string;
  lat: number;
  lng: number;
  type: 'board' | 'interchange' | 'deboard';
  line?: 'purple' | 'aqua';
  instruction: string;
}

export interface RouteOption {
  id: string;
  mode: TransportMode;
  title: string;
  subtitle: string;
  durationMinutes: number;
  distanceKm: number;
  cost: FareBreakdown;
  isOverBudget: boolean;
  budgetDelta: number; // positive = over budget, negative/0 = within budget
  isFeasible: boolean;
  unfeasibleReason?: string;
  coordinates: [number, number][]; // [lng, lat] for map
  legs: RouteLeg[];
  stationWaypoints?: StationWaypoint[];
  score: number; // Normalized multi-objective score
  isRecommended: boolean;
  recommendationReason?: string;
  carbonKg: number;
}

export interface MetroStation {
  id: string;
  name: string;
  marathiName: string;
  line: 'purple' | 'aqua';
  lat: number;
  lng: number;
  order: number;
  isInterchange?: boolean;
}

export interface PunePresetTrip {
  id: string;
  label: string;
  origin: LocationPoint;
  destination: LocationPoint;
  budget: number;
}
