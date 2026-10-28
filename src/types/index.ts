export type IncidentType = 'gridlock' | 'police' | 'closure' | 'accident' | 'hazard';

export type IncidentSeverity = 'low' | 'moderate' | 'severe' | 'blocked';

export interface TrafficIncident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  reportedAt: string;
  confirmations: number;
  clearedVotes: number;
  roadType?: 'asphalt' | 'amapave' | 'dirt';
}

export interface KigaliHotspot {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  status: 'clear' | 'slow' | 'congested' | 'blocked';
  currentDelayMinutes: number;
  description: string;
}

export interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  durationMinutes: number;
  summary: string;
  coordinates: [number, number][]; // [lat, lng]
  isAlternative: boolean;
  avoidsHotspots: string[];
  trafficCondition: 'good' | 'moderate' | 'heavy';
  surfaceType: 'asphalt' | 'mixed_amapave';
}

export interface Coordinates {
  lat: number;
  lng: number;
  label?: string;
}
