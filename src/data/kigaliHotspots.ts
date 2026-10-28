import type { KigaliHotspot } from '../types';

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
  },
  {
    id: 'spot-gishushu',
    name: 'Gishushu / RDB Corridor',
    area: 'Gasabo',
    lat: -1.9482,
    lng: 30.0898,
    status: 'clear',
    currentDelayMinutes: 3,
    description: 'Smooth flow towards KCC and Nyarutarama.',
  },
  {
    id: 'spot-kcc',
    name: 'KCC Roundabout',
    area: 'Kimihurura',
    lat: -1.9534,
    lng: 30.0934,
    status: 'slow',
    currentDelayMinutes: 8,
    description: 'Moderate queues at Kimihurura exit.',
  },
  {
    id: 'spot-prince-house',
    name: 'Prince House / Giporoso',
    area: 'Remera',
    lat: -1.9575,
    lng: 30.1147,
    status: 'congested',
    currentDelayMinutes: 15,
    description: 'Moto clusters and coaster drop-offs restricting right lane.',
  },
  {
    id: 'spot-kinamba',
    name: 'Kinamba Valley (Poids Lourds)',
    area: 'Gisozi - CBD',
    lat: -1.9389,
    lng: 30.0578,
    status: 'clear',
    currentDelayMinutes: 4,
    description: 'Alternative valley route connecting Nyabugogo to Kacyiru is open.',
  },
];
