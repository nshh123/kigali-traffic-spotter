import type { TrafficIncident } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'kigali_traffic_incidents_v2';

const SEED_INCIDENTS: TrafficIncident[] = [
  {
    id: 'inc-1',
    type: 'gridlock',
    severity: 'severe',
    title: 'Severe Valley Chokepoint Gridlock',
    description: 'Bumper-to-bumper queue heading down to Nyabugogo terminal from Muhima. Estimated delay 25+ mins.',
    locationName: 'Nyabugogo / Muhima Slope (KN 1 Rd)',
    lat: -1.9412,
    lng: 30.0498,
    reportedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    confirmations: 18,
    clearedVotes: 1,
    roadType: 'asphalt',
  },
  {
    id: 'inc-2',
    type: 'police',
    severity: 'moderate',
    title: 'Traffic Police & Document Control',
    description: 'Moto helmet and papers inspection after Prince House junction heading towards Giporoso.',
    locationName: 'Remera / Prince House (KG 11 Ave)',
    lat: -1.9568,
    lng: 30.1162,
    reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    confirmations: 12,
    clearedVotes: 2,
    roadType: 'asphalt',
  },
  {
    id: 'inc-3',
    type: 'closure',
    severity: 'blocked',
    title: 'Road Closed & Traffic Diversion',
    description: 'Section temporarily blocked for maintenance diversion. Use Kimicanga or Kacyiru bypass.',
    locationName: 'Kigali Convention Centre (KG 2 Roundabout)',
    lat: -1.9542,
    lng: 30.0921,
    reportedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    confirmations: 26,
    clearedVotes: 3,
    roadType: 'asphalt',
  },
  {
    id: 'inc-4',
    type: 'hazard',
    severity: 'moderate',
    title: 'Heavy Mud & Slippery Cobblestone (Amapave)',
    description: 'Valley bypass road has heavy mud runoff after rain. Risky for low sedans, 4WD and motos okay.',
    locationName: 'Kimihurura - Rugunga Valley Feeder Rd',
    lat: -1.9612,
    lng: 30.0784,
    reportedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    confirmations: 9,
    clearedVotes: 0,
    roadType: 'amapave',
  },
  {
    id: 'inc-5',
    type: 'accident',
    severity: 'moderate',
    title: 'Minor Coaster / Moto Collision',
    description: 'Vehicles off to the shoulder, causing rubbernecking slow-down heading towards Kicukiro center.',
    locationName: 'Sonatubes - Rwandex Flyover',
    lat: -1.9721,
    lng: 30.0882,
    reportedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    confirmations: 14,
    clearedVotes: 2,
    roadType: 'asphalt',
  },
];

export class IncidentService {
  private static getStoredIncidents(): TrafficIncident[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INCIDENTS));
        return SEED_INCIDENTS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_INCIDENTS;
    }
  }

  private static saveIncidents(incidents: TrafficIncident[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  static async fetchActiveIncidents(): Promise<TrafficIncident[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('traffic_incidents')
          .select('*')
          .order('reported_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: TrafficIncident[] = data.map((row: any) => ({
            id: row.id,
            type: row.type,
            severity: row.severity,
            title: row.title,
            description: row.description || '',
            locationName: row.location_name,
            lat: row.lat,
            lng: row.lng,
            reportedAt: row.reported_at,
            confirmations: row.confirmations || 1,
            clearedVotes: row.cleared_votes || 0,
            roadType: row.road_type || 'asphalt',
          }));
          this.saveIncidents(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local cache', err);
      }
    }

    // Local fallback
    const incidents = this.getStoredIncidents();
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    return incidents.filter((inc) => {
      const reportTime = new Date(inc.reportedAt).getTime();
      const isExpired = reportTime < sixHoursAgo;
      const isCleared = inc.clearedVotes >= inc.confirmations + 3;
      return !isExpired && !isCleared;
    });
  }

  static async reportIncident(
    newIncident: Omit<TrafficIncident, 'id' | 'reportedAt' | 'confirmations' | 'clearedVotes'>
  ): Promise<TrafficIncident> {
    const incident: TrafficIncident = {
      ...newIncident,
      id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      reportedAt: new Date().toISOString(),
      confirmations: 1,
      clearedVotes: 0,
    };

    // Save locally first
    const current = this.getStoredIncidents();
    const updated = [incident, ...current];
    this.saveIncidents(updated);

    // Sync to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('traffic_incidents').insert([
          {
            type: incident.type,
            severity: incident.severity,
            title: incident.title,
            description: incident.description,
            location_name: incident.locationName,
            lat: incident.lat,
            lng: incident.lng,
            geom: `POINT(${incident.lng} ${incident.lat})`,
            road_type: incident.roadType || 'asphalt',
            confirmations: 1,
            cleared_votes: 0,
          },
        ]);
      } catch (e) {
        console.error('Supabase sync insert failed', e);
      }
    }

    return incident;
  }

  static async vote(incidentId: string, type: 'confirm' | 'cleared'): Promise<TrafficIncident | null> {
    const current = this.getStoredIncidents();
    let updatedIncident: TrafficIncident | null = null;

    const next = current.map((inc) => {
      if (inc.id === incidentId) {
        updatedIncident = {
          ...inc,
          confirmations: type === 'confirm' ? inc.confirmations + 1 : inc.confirmations,
          clearedVotes: type === 'cleared' ? inc.clearedVotes + 1 : inc.clearedVotes,
        };
        return updatedIncident;
      }
      return inc;
    });

    this.saveIncidents(next);

    if (isSupabaseConfigured && supabase && updatedIncident) {
      try {
        const payload =
          type === 'confirm'
            ? { confirmations: (updatedIncident as TrafficIncident).confirmations }
            : { cleared_votes: (updatedIncident as TrafficIncident).clearedVotes };

        await supabase
          .from('traffic_incidents')
          .update(payload)
          .eq('id', incidentId);
      } catch (e) {
        console.error('Supabase update vote error', e);
      }
    }

    return updatedIncident;
  }

  static subscribeToRealtime(onNewIncident: (inc: TrafficIncident) => void) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const channel = supabase
      .channel('realtime_incidents')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'traffic_incidents' },
        (payload: any) => {
          const row = payload.new;
          const mapped: TrafficIncident = {
            id: row.id,
            type: row.type,
            severity: row.severity,
            title: row.title,
            description: row.description || '',
            locationName: row.location_name,
            lat: row.lat,
            lng: row.lng,
            reportedAt: row.reported_at,
            confirmations: row.confirmations || 1,
            clearedVotes: row.cleared_votes || 0,
            roadType: row.road_type || 'asphalt',
          };
          onNewIncident(mapped);
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }
}
