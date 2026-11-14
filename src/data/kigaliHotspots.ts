import type { KigaliHotspot, TrafficCorridor, TrafficIncident } from '../types';

export const KIGALI_CENTER = {
  lat: -1.9441,
  lng: 30.0619,
  zoom: 13,
};

export const KIGALI_BOUNDS = {
  north: -1.88,
  south: -2.03,
  west: 29.98,
  east: 30.18,
};

export const POPULAR_LOCATIONS = [
  { name: 'Downtown CBD (City Center)', lat: -1.9536, lng: 30.0606 },
  { name: 'Nyabugogo Bus Park & Hub', lat: -1.9366, lng: 30.0444 },
  { name: 'Kigali Convention Centre (KCC)', lat: -1.9534, lng: 30.0934 },
  { name: 'Kimironko Market', lat: -1.9439, lng: 30.1265 },
  { name: 'Remera / Prince House', lat: -1.9575, lng: 30.1147 },
  { name: 'Sonatubes Roundabout (Kicukiro)', lat: -1.9753, lng: 30.0945 },
  { name: 'Gishushu / RDB Junction', lat: -1.9482, lng: 30.0898 },
  { name: 'Kigali International Airport (Kanombe)', lat: -1.9686, lng: 30.1395 },
  { name: 'Kacyiru (Ministries / Telecom)', lat: -1.9392, lng: 30.0769 },
  { name: 'Gitikinyoni (Rubavu Gateway)', lat: -1.9324, lng: 30.0212 },
  { name: 'Gikondo (Rwandex)', lat: -1.9678, lng: 30.0772 },
  { name: 'Nyamirambo (Biryogo/Stadium)', lat: -1.9825, lng: 30.0489 },
];

export const BASE_CHOKEPOINTS = [
  {
    id: 'spot-nyabugogo',
    name: 'Nyabugogo Valley Hub',
    area: 'Nyabugogo',
    lat: -1.9366,
    lng: 30.0444,
  },
  {
    id: 'spot-sonatubes',
    name: 'Sonatubes Roundabout',
    area: 'Kicukiro',
    lat: -1.9753,
    lng: 30.0945,
  },
  {
    id: 'spot-gishushu',
    name: 'Gishushu / RDB Corridor',
    area: 'Gasabo',
    lat: -1.9482,
    lng: 30.0898,
  },
  {
    id: 'spot-kcc',
    name: 'KCC Roundabout',
    area: 'Kimihurura',
    lat: -1.9534,
    lng: 30.0934,
  },
  {
    id: 'spot-prince-house',
    name: 'Prince House / Giporoso',
    area: 'Remera',
    lat: -1.9575,
    lng: 30.1147,
  },
  {
    id: 'spot-kinamba',
    name: 'Kinamba Valley (Poids Lourds)',
    area: 'Gisozi - CBD',
    lat: -1.9389,
    lng: 30.0578,
  },
];

export const INITIAL_KIGALI_HOTSPOTS: KigaliHotspot[] = [
  {
    id: 'spot-nyabugogo',
    name: 'Nyabugogo Valley Hub',
    area: 'Nyabugogo',
    lat: -1.9366,
    lng: 30.0444,
    status: 'congested',
    currentDelayMinutes: 18,
    description: 'Heavy commuter and regional coaster traffic entering the valley.',
    incidentCount: 1,
    averageSpeedKmh: 8,
  },
  {
    id: 'spot-sonatubes',
    name: 'Sonatubes Roundabout',
    area: 'Kicukiro',
    lat: -1.9753,
    lng: 30.0945,
    status: 'slow',
    currentDelayMinutes: 12,
    description: 'Slow crawling traffic from Bugesera road toward Rwandex.',
    incidentCount: 1,
    averageSpeedKmh: 16,
  },
  {
    id: 'spot-gishushu',
    name: 'Gishushu / RDB Corridor',
    area: 'Gasabo',
    lat: -1.9482,
    lng: 30.0898,
    status: 'clear',
    currentDelayMinutes: 2,
    description: 'Smooth flow towards KCC and Nyarutarama.',
    incidentCount: 0,
    averageSpeedKmh: 45,
  },
  {
    id: 'spot-kcc',
    name: 'KCC Roundabout',
    area: 'Kimihurura',
    lat: -1.9534,
    lng: 30.0934,
    status: 'blocked',
    currentDelayMinutes: 25,
    description: 'Section temporarily blocked for maintenance diversion.',
    incidentCount: 1,
    averageSpeedKmh: 4,
  },
  {
    id: 'spot-prince-house',
    name: 'Prince House / Giporoso',
    area: 'Remera',
    lat: -1.9575,
    lng: 30.1147,
    status: 'slow',
    currentDelayMinutes: 10,
    description: 'Moto helmet and papers inspection after Prince House junction.',
    incidentCount: 1,
    averageSpeedKmh: 18,
  },
  {
    id: 'spot-kinamba',
    name: 'Kinamba Valley (Poids Lourds)',
    area: 'Gisozi - CBD',
    lat: -1.9389,
    lng: 30.0578,
    status: 'clear',
    currentDelayMinutes: 3,
    description: 'Alternative valley route connecting Nyabugogo to Kacyiru is open.',
    incidentCount: 0,
    averageSpeedKmh: 42,
  },
];

// Helper: Haversine distance in meters
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Dynamically computes real-time chokepoint status and delay from active incidents.
 */
export function computeDynamicHotspots(incidents: TrafficIncident[]): KigaliHotspot[] {
  return BASE_CHOKEPOINTS.map((base) => {
    // Check all incidents within 700 meters of this chokepoint
    const nearby = incidents.filter(
      (inc) => haversineDistance(base.lat, base.lng, inc.lat, inc.lng) <= 700
    );

    if (nearby.length === 0) {
      return {
        ...base,
        status: 'clear',
        currentDelayMinutes: 0,
        incidentCount: 0,
        averageSpeedKmh: 45,
        description: 'Smooth flowing. Zero active traffic incidents reported in this zone.',
      };
    }

    // Determine highest severity
    let hasBlocked = false;
    let hasSevere = false;
    let hasModerate = false;
    let totalDelay = 0;

    nearby.forEach((inc) => {
      if (inc.severity === 'blocked' || inc.type === 'closure') {
        hasBlocked = true;
        totalDelay += 25;
      } else if (inc.severity === 'severe' || inc.type === 'gridlock') {
        hasSevere = true;
        totalDelay += 15;
      } else {
        hasModerate = true;
        totalDelay += 8;
      }
    });

    // Cap sensible delay
    totalDelay = Math.min(totalDelay, 45);

    let status: KigaliHotspot['status'] = 'slow';
    let speed = 20;

    if (hasBlocked) {
      status = 'blocked';
      speed = 4;
    } else if (hasSevere) {
      status = 'congested';
      speed = 8;
    } else if (hasModerate) {
      status = 'slow';
      speed = 18;
    }

    const primaryInc = nearby[0];
    const desc = `${nearby.length} active report${nearby.length > 1 ? 's' : ''}: ${primaryInc.title}`;

    return {
      ...base,
      status,
      currentDelayMinutes: totalDelay,
      incidentCount: nearby.length,
      averageSpeedKmh: speed,
      description: desc,
    };
  });
}

// Major Kigali arterial transit corridors for live traffic flow rendering
export const KIGALI_ARTERIAL_CORRIDORS: Array<{
  id: string;
  name: string;
  roadCode: string;
  coordinates: [number, number][];
}> = [
  {
    id: 'corridor-kn1',
    name: 'Nyabugogo Valley Arterial',
    roadCode: 'KN 1 Rd',
    coordinates: [
      [-1.9366, 30.0444],
      [-1.9405, 30.0482],
      [-1.9442, 30.0528],
      [-1.9480, 30.0565],
      [-1.9536, 30.0606],
    ],
  },
  {
    id: 'corridor-kn3',
    name: 'Sonatubes - Rwandex Expressway',
    roadCode: 'KN 3 Rd',
    coordinates: [
      [-1.9536, 30.0606],
      [-1.9610, 30.0680],
      [-1.9678, 30.0772],
      [-1.9721, 30.0882],
      [-1.9753, 30.0945],
      [-1.9840, 30.1060],
    ],
  },
  {
    id: 'corridor-kg2',
    name: 'KCC - Gishushu Diplomatic Axis',
    roadCode: 'KG 2 Roundabout',
    coordinates: [
      [-1.9490, 30.0810],
      [-1.9534, 30.0934],
      [-1.9482, 30.0898],
      [-1.9440, 30.0940],
    ],
  },
  {
    id: 'corridor-kg11',
    name: 'Remera - Prince House - Airport Arterial',
    roadCode: 'KG 11 Ave',
    coordinates: [
      [-1.9534, 30.0934],
      [-1.9555, 30.1050],
      [-1.9568, 30.1162],
      [-1.9610, 30.1240],
      [-1.9686, 30.1395],
    ],
  },
  {
    id: 'corridor-kinamba',
    name: 'Poids Lourds Industrial Valley',
    roadCode: 'Poids Lourds',
    coordinates: [
      [-1.9366, 30.0444],
      [-1.9375, 30.0510],
      [-1.9389, 30.0578],
      [-1.9392, 30.0769],
    ],
  },
  {
    id: 'corridor-kg7',
    name: 'Kacyiru Ministries - Kimicanga Bypass',
    roadCode: 'KG 7 Ave',
    coordinates: [
      [-1.9389, 30.0578],
      [-1.9392, 30.0710],
      [-1.9392, 30.0769],
      [-1.9490, 30.0810],
      [-1.9534, 30.0934],
    ],
  },
];

/**
 * Dynamically computes the live traffic flow state for each arterial corridor.
 */
export function computeDynamicCorridors(incidents: TrafficIncident[]): TrafficCorridor[] {
  return KIGALI_ARTERIAL_CORRIDORS.map((corridor) => {
    // Find incidents near any segment of this corridor (within 450 meters)
    const matchingIncidents = incidents.filter((inc) => {
      return corridor.coordinates.some(
        ([cLat, cLng]) => haversineDistance(cLat, cLng, inc.lat, inc.lng) <= 450
      );
    });

    if (matchingIncidents.length === 0) {
      return {
        ...corridor,
        status: 'clear',
        delayMinutes: 0,
        activeIncidentCount: 0,
        speedKmh: 48,
        description: 'Smooth free-flow speeds (45-50 km/h).',
      };
    }

    let hasBlocked = false;
    let hasSevere = false;
    let delay = 0;

    matchingIncidents.forEach((inc) => {
      if (inc.severity === 'blocked' || inc.type === 'closure') {
        hasBlocked = true;
        delay += 25;
      } else if (inc.severity === 'severe' || inc.type === 'gridlock') {
        hasSevere = true;
        delay += 15;
      } else {
        delay += 6;
      }
    });

    delay = Math.min(delay, 45);

    let status: TrafficCorridor['status'] = 'slow';
    let speed = 20;

    if (hasBlocked) {
      status = 'blocked';
      speed = 3;
    } else if (hasSevere) {
      status = 'congested';
      speed = 7;
    } else {
      status = 'slow';
      speed = 18;
    }

    return {
      ...corridor,
      status,
      delayMinutes: delay,
      activeIncidentCount: matchingIncidents.length,
      speedKmh: speed,
      description: `${matchingIncidents.length} active incident(s): ${matchingIncidents[0].title}`,
    };
  });
}
