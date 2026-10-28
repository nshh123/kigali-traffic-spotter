import { useState, useEffect, useCallback, useRef } from 'react';
import type { Coordinates, KigaliHotspot, RouteOption, TrafficIncident } from './types';
import { INITIAL_KIGALI_HOTSPOTS, POPULAR_LOCATIONS } from './data/kigaliHotspots';
import { IncidentService } from './services/incidentService';
import { RoutingService } from './services/routingService';
import { KigaliMap } from './components/KigaliMap';
import { RoutePlanner } from './components/RoutePlanner';
import { SpotterModal } from './components/SpotterModal';
import { IncidentDetailsModal } from './components/IncidentDetailsModal';
import { ChokepointRadar } from './components/ChokepointRadar';
import { AppLogo } from './components/AppLogo';
import { RefreshCw, AlertTriangle, Sun, Moon } from 'lucide-react';

export function App() {
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [hotspots] = useState<KigaliHotspot[]>(INITIAL_KIGALI_HOTSPOTS);

  // Default demo route: Nyabugogo Bus Park -> Kimironko Market
  const [origin, setOrigin] = useState<Coordinates | null>({
    lat: POPULAR_LOCATIONS[1].lat,
    lng: POPULAR_LOCATIONS[1].lng,
    label: POPULAR_LOCATIONS[1].name,
  });

  const [destination, setDestination] = useState<Coordinates | null>({
    lat: POPULAR_LOCATIONS[3].lat,
    lng: POPULAR_LOCATIONS[3].lng,
    label: POPULAR_LOCATIONS[3].name,
  });

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [avoidTraffic, setAvoidTraffic] = useState(true);
  const [transportMode, setTransportMode] = useState<'car' | 'moto'>('car');
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isRouteDrawerExpanded, setIsRouteDrawerExpanded] = useState(false);

  // Theme State: Dark mode (default) vs Light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kigali_theme');
    if (saved) return saved === 'dark';
    return true;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('kigali_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Live GPS Location & Follow Mode State
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Modals & Panels
  const [isSpotterModalOpen, setIsSpotterModalOpen] = useState(false);
  const [spotterCoords, setSpotterCoords] = useState<Coordinates>({
    lat: -1.9441,
    lng: 30.0619,
    label: 'Kigali Center',
  });
  const [selectedIncident, setSelectedIncident] = useState<TrafficIncident | null>(null);

  // Load incidents (Supabase or Local)
  const loadIncidents = useCallback(async () => {
    const list = await IncidentService.fetchActiveIncidents();
    setIncidents(list);
  }, []);

  useEffect(() => {
    loadIncidents();

    const unsubscribe = IncidentService.subscribeToRealtime((newInc) => {
      setIncidents((prev) => [newInc, ...prev.filter((i) => i.id !== newInc.id)]);
    });

    return () => {
      unsubscribe();
    };
  }, [loadIncidents]);

  // Recalculate routes when endpoints, avoidTraffic, or incidents change
  const computeRoutes = useCallback(async () => {
    if (!origin || !destination) {
      setRoutes([]);
      setActiveRouteId(null);
      return;
    }

    setIsLoadingRoutes(true);
    try {
      const calculated = await RoutingService.calculateRoutes(origin, destination, incidents, avoidTraffic, transportMode);
      setRoutes(calculated);
      if (calculated.length > 0) {
        setActiveRouteId(calculated[0].id);
      }
    } catch (e) {
      console.error('Failed to compute routes', e);
    } finally {
      setIsLoadingRoutes(false);
    }
  }, [origin, destination, incidents, avoidTraffic, transportMode]);

  useEffect(() => {
    computeRoutes();
  }, [computeRoutes]);

  // Live GPS Locate Me & Follow Mode Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    if (isFollowingUser) {
      // Toggle off follow mode
      setIsFollowingUser(false);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userCoords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'My Current Location',
        };
        setUserLocation(userCoords);
        setIsFollowingUser(true);

        // Auto-set starting point as My Location
        setOrigin(userCoords);

        // Start watching position continuously for follow mode
        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            setUserLocation({
              lat: watchPos.coords.latitude,
              lng: watchPos.coords.longitude,
              label: 'My Current Location',
            });
          },
          (err) => console.warn('Watch position error:', err),
          { enableHighAccuracy: true, maximumAge: 5000 }
        );
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        // Fallback demo location in Kigali (Kacyiru / Ministries)
        const demoUserCoords: Coordinates = {
          lat: -1.9392,
          lng: 30.0769,
          label: 'Simulated Location (Kacyiru)',
        };
        setUserLocation(demoUserCoords);
        setIsFollowingUser(true);
        setOrigin(demoUserCoords);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleMapClick = (coords: Coordinates) => {
    if (!origin) {
      setOrigin({ ...coords, label: 'Selected Start' });
    } else if (!destination) {
      setDestination({ ...coords, label: 'Selected Destination' });
    } else {
      setSpotterCoords({ ...coords, label: 'Reported Point' });
      setIsSpotterModalOpen(true);
    }
  };

  const handleSwapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleCreateIncident = async (
    newIncData: Omit<TrafficIncident, 'id' | 'reportedAt' | 'confirmations' | 'clearedVotes'>
  ) => {
    const created = await IncidentService.reportIncident(newIncData);
    setIncidents((prev) => [created, ...prev]);
    setIsSpotterModalOpen(false);
  };

  const handleVote = async (incidentId: string, type: 'confirm' | 'cleared') => {
    const updated = await IncidentService.vote(incidentId, type);
    if (updated) {
      setIncidents((prev) => prev.map((item) => (item.id === incidentId ? updated! : item)));
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident(updated);
      }
    }
  };

  const handleNavigateAround = (_incident: TrafficIncident) => {
    setSelectedIncident(null);
    setAvoidTraffic(true);
    computeRoutes();
    setIsRouteDrawerExpanded(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 font-sans select-none">
      {/* 1. Full-Bleed Map Canvas */}
      <div className="absolute inset-0 z-0">
        <KigaliMap
          incidents={incidents}
          hotspots={hotspots}
          selectedOrigin={origin}
          selectedDestination={destination}
          routes={routes}
          activeRouteId={activeRouteId}
          userLocation={userLocation}
          isLocating={isLocating}
          isFollowingUser={isFollowingUser}
          isDarkMode={isDarkMode}
          onLocateMe={handleLocateMe}
          onSelectRoute={setActiveRouteId}
          onMapClick={handleMapClick}
          onIncidentClick={setSelectedIncident}
          onHotspotClick={(spot) => {
            setDestination({ lat: spot.lat, lng: spot.lng, label: spot.name });
            setIsRouteDrawerExpanded(true);
          }}
        />
      </div>

      {/* 2. Top Header & Chokepoint Radar (Mobile-optimised Floating Stack) */}
      <div className="absolute top-2 inset-x-2 sm:top-3 sm:inset-x-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        {/* Header Pill */}
        <div
          className={`backdrop-blur-xl border rounded-2xl px-3 py-2 shadow-2xl flex items-center justify-between pointer-events-auto transition-colors ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-700/80 text-white'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
          }`}
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <AppLogo size={32} className="w-8 h-8 rounded-xl shadow-md ring-1 ring-white/10" />
            <div>
              <h1 className={`font-black text-xs sm:text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Kigali Traffic
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all shadow-sm active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-800/90 hover:bg-slate-750 text-amber-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadIncidents}
              className={`p-2 rounded-xl border transition-all shadow-sm active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
              }`}
              title="Refresh incidents"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chokepoint Radar Horizontal Ticker */}
        <div className="px-0.5">
          <ChokepointRadar
            hotspots={hotspots}
            isDarkMode={isDarkMode}
            onSelectHotspot={(spot) => {
              setDestination({ lat: spot.lat, lng: spot.lng, label: spot.name });
              setIsRouteDrawerExpanded(true);
            }}
          />
        </div>
      </div>

      {/* 3. Waze-Style Floating Action Button (FAB) at Bottom Right */}
      {/* Auto-hides on mobile when route sheet is expanded to eliminate collisions */}
      {(!isRouteDrawerExpanded || window.innerWidth > 640) && (
        <div className="absolute bottom-20 sm:bottom-6 right-3 sm:right-6 z-20 pointer-events-auto transition-all">
          <button
            onClick={() => {
              setSpotterCoords(userLocation || { lat: -1.9441, lng: 30.0619, label: 'Kigali Area' });
              setIsSpotterModalOpen(true);
            }}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-orange-500 via-rose-600 to-amber-500 text-white font-black text-xs px-3.5 sm:px-4 py-3 rounded-2xl shadow-2xl shadow-orange-600/50 hover:shadow-orange-600/70 border border-white/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="absolute -inset-0.5 rounded-2xl bg-orange-500 opacity-30 group-hover:opacity-60 blur-sm animate-pulse" />
            <AlertTriangle className="w-4 h-4 text-white shrink-0 relative z-10" />
            <span className="relative z-10 font-black tracking-wide">Spot Traffic</span>
          </button>
        </div>
      )}

      {/* 4. Bottom Navigation Drawer (Mobile Bottom Sheet / Desktop Card) */}
      <div className="absolute bottom-0 inset-x-0 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md p-2.5 sm:p-0 z-20 pointer-events-none">
        <RoutePlanner
          origin={origin}
          destination={destination}
          routes={routes}
          activeRouteId={activeRouteId}
          userLocation={userLocation}
          avoidTraffic={avoidTraffic}
          transportMode={transportMode}
          isLoadingRoutes={isLoadingRoutes}
          isExpanded={isRouteDrawerExpanded}
          isDarkMode={isDarkMode}
          onToggleExpand={setIsRouteDrawerExpanded}
          onRequestUserLocation={handleLocateMe}
          onSetOrigin={setOrigin}
          onSetDestination={setDestination}
          onSelectRoute={setActiveRouteId}
          onToggleAvoidTraffic={setAvoidTraffic}
          onSetTransportMode={setTransportMode}
          onSwapLocations={handleSwapLocations}
        />
      </div>

      {/* 5. Modals & Drawers */}
      {isSpotterModalOpen && (
        <SpotterModal
          initialCoords={spotterCoords}
          isDarkMode={isDarkMode}
          onClose={() => setIsSpotterModalOpen(false)}
          onSubmit={handleCreateIncident}
        />
      )}

      {selectedIncident && (
        <IncidentDetailsModal
          incident={selectedIncident}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedIncident(null)}
          onVote={handleVote}
          onNavigateAround={handleNavigateAround}
        />
      )}
    </div>
  );
}

export default App;
