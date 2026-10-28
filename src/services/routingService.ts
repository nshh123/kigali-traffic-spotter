import type { Coordinates, RouteOption, TrafficIncident } from '../types';

// Haversine distance in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class RoutingService {
  static async calculateRoutes(
    origin: Coordinates,
    destination: Coordinates,
    activeIncidents: TrafficIncident[],
    avoidTraffic: boolean = true,
    transportMode: 'car' | 'moto' = 'car'
  ): Promise<RouteOption[]> {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('OSRM service response not ok');
      }

      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route returned by OSRM');
      }

      const routes: RouteOption[] = [];
      const isMoto = transportMode === 'moto';

      for (let i = 0; i < data.routes.length; i++) {
        const rawRoute = data.routes[i];
        const coords: [number, number][] = rawRoute.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        const distanceKm = Number((rawRoute.distance / 1000).toFixed(1));
        
        // Base duration: motos weave faster through Kigali turns (approx 15% speed advantage)
        let baseDurationMin = Math.round(rawRoute.duration / 60);
        if (isMoto) {
          baseDurationMin = Math.max(5, Math.round(baseDurationMin * 0.85));
        }

        // Check if route passes near any active traffic incident (within 350 meters)
        const impactedBy: TrafficIncident[] = [];
        for (const inc of activeIncidents) {
          const isNear = coords.some(([lat, lng]) => getDistanceMeters(lat, lng, inc.lat, inc.lng) < 350);
          if (isNear) {
            impactedBy.push(inc);
          }
        }

        // Delay calculation: Cars get stuck in full queue; Motos filter through traffic (75% less delay)
        let delayMinutes = 0;
        impactedBy.forEach((inc) => {
          let baseIncidentDelay = 0;
          if (inc.severity === 'blocked') baseIncidentDelay = 25;
          else if (inc.severity === 'severe') baseIncidentDelay = 15;
          else if (inc.severity === 'moderate') baseIncidentDelay = 8;

          if (isMoto) {
            // Motos bypass jams with ease, except full roadblocks
            delayMinutes += inc.severity === 'blocked' ? 10 : Math.ceil(baseIncidentDelay * 0.25);
          } else {
            delayMinutes += baseIncidentDelay;
          }
        });

        const totalDuration = baseDurationMin + delayMinutes;
        const condition = delayMinutes > 15 ? 'heavy' : delayMinutes > 5 ? 'moderate' : 'good';

        const routeName = isMoto
          ? i === 0
            ? '🏍️ Moto Direct Corridor'
            : '🏍️ Fast Moto Hill Shortcut'
          : i === 0
          ? '🚗 Primary Arterial Route'
          : '🚗 Scenic Hillside Bypass';

        const summary = isMoto
          ? i === 0
            ? 'Fast lane filtering past vehicle queues'
            : 'Paved cobblestone (amapave) shortcut bypassing choke points'
          : i === 0
          ? 'Standard paved arterial avenue'
          : 'Alternative collector bypass avoiding valley queue';

        routes.push({
          id: `route-${i + 1}`,
          name: routeName,
          distanceKm,
          durationMinutes: totalDuration,
          summary,
          coordinates: coords,
          isAlternative: i > 0,
          avoidsHotspots: impactedBy.map((inc) => inc.locationName),
          trafficCondition: condition,
          surfaceType: isMoto ? 'mixed_amapave' : i === 0 ? 'asphalt' : 'mixed_amapave',
        });
      }

      // If only 1 route was returned, synthesize an alternative tailored to mode
      if (routes.length === 1) {
        const primary = routes[0];
        const bypassCoords = this.createSyntheticBypass(origin, destination, primary.coordinates);
        const bypassDist = Number((primary.distanceKm * (isMoto ? 1.08 : 1.15)).toFixed(1));
        
        // Moto hill shortcut is snappy
        const bypassDuration = isMoto
          ? Math.max(6, Math.round(primary.durationMinutes * 0.8))
          : Math.max(10, Math.round(primary.durationMinutes * 0.95));

        routes.push({
          id: 'route-alt',
          name: isMoto ? '🏍️ Moto Hill Ridge Shortcut' : '🚗 Hillside Ridge Bypass',
          distanceKm: bypassDist,
          durationMinutes: bypassDuration,
          summary: isMoto
            ? 'Cuts through residential amapave streets avoiding valley chokepoint'
            : 'Bypasses major valley bottleneck via hillside collector road',
          coordinates: bypassCoords,
          isAlternative: true,
          avoidsHotspots: primary.avoidsHotspots,
          trafficCondition: 'good',
          surfaceType: 'mixed_amapave',
        });
      }

      if (avoidTraffic) {
        routes.sort((a, b) => a.durationMinutes - b.durationMinutes);
      }

      return routes;
    } catch (err) {
      console.warn('Falling back to local route generator:', err);
      return this.generateFallbackRoutes(origin, destination, activeIncidents, transportMode);
    }
  }

  // Generates a hillside curved bypass curve between origin and destination
  private static createSyntheticBypass(
    origin: Coordinates,
    destination: Coordinates,
    primaryCoords: [number, number][]
  ): [number, number][] {
    const midIndex = Math.floor(primaryCoords.length / 2);
    const midPoint = primaryCoords[midIndex] || [
      (origin.lat + destination.lat) / 2,
      (origin.lng + destination.lng) / 2,
    ];

    // Offset perpendicularly by ~1.2 km to simulate hill bypass
    const offsetLat = midPoint[0] + 0.012;
    const offsetLng = midPoint[1] + 0.012;

    const points: [number, number][] = [];
    const steps = 15;
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const lat =
        (1 - t) * (1 - t) * origin.lat + 2 * (1 - t) * t * offsetLat + t * t * destination.lat;
      const lng =
        (1 - t) * (1 - t) * origin.lng + 2 * (1 - t) * t * offsetLng + t * t * destination.lng;
      points.push([lat, lng]);
    }
    return points;
  }

  private static generateFallbackRoutes(
    origin: Coordinates,
    destination: Coordinates,
    _activeIncidents: TrafficIncident[],
    transportMode: 'car' | 'moto' = 'car'
  ): RouteOption[] {
    const isMoto = transportMode === 'moto';
    const distDirect = getDistanceMeters(origin.lat, origin.lng, destination.lat, destination.lng) / 1000;
    const estPrimaryKm = Number((distDirect * 1.3).toFixed(1));
    const estAltKm = Number((distDirect * 1.5).toFixed(1));

    const primaryPoints: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      primaryPoints.push([
        origin.lat + (destination.lat - origin.lat) * t,
        origin.lng + (destination.lng - origin.lng) * t,
      ]);
    }

    const altPoints = this.createSyntheticBypass(origin, destination, primaryPoints);

    const primaryTime = isMoto
      ? Math.round(estPrimaryKm * 1.8)
      : Math.round(estPrimaryKm * 2.8);

    const altTime = isMoto
      ? Math.round(estAltKm * 1.4)
      : Math.round(estAltKm * 2.2);

    return [
      {
        id: 'route-1',
        name: isMoto ? '🏍️ Moto Direct Lane' : '🚗 Direct Arterial Corridor',
        distanceKm: estPrimaryKm,
        durationMinutes: primaryTime,
        summary: isMoto ? 'Filtering through main traffic' : 'Direct route via main avenue',
        coordinates: primaryPoints,
        isAlternative: false,
        avoidsHotspots: [],
        trafficCondition: 'moderate',
        surfaceType: 'asphalt',
      },
      {
        id: 'route-2',
        name: isMoto ? '🏍️ Moto Hillside Shortcut' : '🚗 Hill Ridge Bypass',
        distanceKm: estAltKm,
        durationMinutes: altTime,
        summary: isMoto
          ? 'Fast amapave shortcut avoiding major car queues'
          : 'Avoids known valley bottlenecks with smooth flowing side-streets',
        coordinates: altPoints,
        isAlternative: true,
        avoidsHotspots: ['Nyabugogo Corridor', 'Sonatubes Junction'],
        trafficCondition: 'good',
        surfaceType: 'mixed_amapave',
      },
    ];
  }
}
