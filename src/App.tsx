import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Coordinates, RouteOption, TrafficIncident, TrafficCorridor, KigaliHotspot } from './types';
import {
  POPULAR_LOCATIONS,
  computeDynamicHotspots,
  computeDynamicCorridors,
} from './data/kigaliHotspots';
import { IncidentService } from './services/incidentService';
import { RoutingService } from './services/routingService';
import { AudioAlertService } from './services/audioAlertService';
import { KigaliMap } from './components/KigaliMap';
import { RoutePlanner } from './components/RoutePlanner';
import { SpotterModal } from './components/SpotterModal';
import { IncidentDetailsModal } from './components/IncidentDetailsModal';
import { ChokepointRadar } from './components/ChokepointRadar';
import { AppLogo } from './components/AppLogo';
import { InstallPromptModal } from './components/InstallPromptModal';
import { RefreshCw, AlertTriangle, Sun, Moon, Download, Volume2, VolumeX, Sparkles, X } from 'lucide-react';

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export function App() {
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);

  // Real-time dynamic chokepoint and arterial corridor flow states
  const hotspots = useMemo(() => computeDynamicHotspots(incidents), [incidents]);
  const corridors = useMemo(() => computeDynamicCorridors(incidents), [incidents]);

  // Traffic flow layer visibility toggle
  const [showTrafficFlow, setShowTrafficFlow] = useState(true);

  // Audio / Speech voice alert toggle
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const toggleSound = () => {
    const next = AudioAlertService.toggleSound();
    setIsSoundEnabled(next);
    if (next) {
      AudioAlertService.playChime();
    }
  };

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

  // Theme State: Light mode (default) vs Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kigali_theme');
    if (saved !== null) return saved === 'dark';
    return false; // App starts in light mode by default
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('kigali_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Sync mobile browser status bar / theme color with active theme
  useEffect(() => {
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDarkMode ? '#0f172a' : '#ffffff');
    }
  }, [isDarkMode]);

  // PWA Install State
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Live GPS Location, Velocity Tracking & Follow Mode State
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastGpsUpdateRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  // Proactive Slow Traffic Detection Prompt
  const [proactivePrompt, setProactivePrompt] = useState<{
    locationName: string;
    coords: Coordinates;
    speed: number;
  } | null>(null);

  // Modals & Panels
  const [isSpotterModalOpen, setIsSpotterModalOpen] = useState(false);
  const [spotterCoords, setSpotterCoords] = useState<Coordinates>({
    lat: -1.9441,
    lng: 30.0619,
    label: 'Kigali Area',
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

      // Announce new severe incident if sound enabled
      if (newInc.severity === 'severe' || newInc.severity === 'blocked') {
        AudioAlertService.announceTrafficAlert(
          `New alert: ${newInc.title} reported near ${newInc.locationName}`,
          newInc.id
        );
      }
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
      const calculated = await RoutingService.calculateRoutes(
        origin,
        destination,
        incidents,
        avoidTraffic,
        transportMode
      );
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

  // Check proximity to incidents for live voice alert
  useEffect(() => {
    if (!userLocation || !isFollowingUser || incidents.length === 0) return;

    for (const inc of incidents) {
      const dist = getDistanceMeters(userLocation.lat, userLocation.lng, inc.lat, inc.lng);
      if (dist <= 400 && (inc.severity === 'severe' || inc.severity === 'blocked')) {
        AudioAlertService.announceTrafficAlert(
          `Warning: ${inc.title} is approximately ${Math.round(dist)} meters ahead`,
          inc.id
        );
        break;
      }
    }
  }, [userLocation, isFollowingUser, incidents]);

  // Live GPS Locate Me & Follow Mode Handler with Velocity Calculation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    if (isFollowingUser) {
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
        const now = Date.now();
        lastGpsUpdateRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude, time: now };

        const initialSpeed =
          pos.coords.speed !== null && pos.coords.speed !== undefined && pos.coords.speed > 0
            ? pos.coords.speed * 3.6
            : 0;

        const userCoords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speedKmh: initialSpeed,
          heading: pos.coords.heading ?? undefined,
          label: 'My Current Location',
        };
        setUserLocation(userCoords);
        setIsFollowingUser(true);
        setOrigin(userCoords);

        // Start continuous position & speed tracking
        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const currentTime = Date.now();
            let currentSpeed = 0;

            if (
              watchPos.coords.speed !== null &&
              watchPos.coords.speed !== undefined &&
              !isNaN(watchPos.coords.speed) &&
              watchPos.coords.speed > 0
            ) {
              currentSpeed = watchPos.coords.speed * 3.6;
            } else if (lastGpsUpdateRef.current) {
              const dt = (currentTime - lastGpsUpdateRef.current.time) / 1000;
              if (dt >= 1.5 && dt <= 30) {
                const distance = getDistanceMeters(
                  lastGpsUpdateRef.current.lat,
                  lastGpsUpdateRef.current.lng,
                  watchPos.coords.latitude,
                  watchPos.coords.longitude
                );
                currentSpeed = (distance / dt) * 3.6;
              }
            }

            lastGpsUpdateRef.current = {
              lat: watchPos.coords.latitude,
              lng: watchPos.coords.longitude,
              time: currentTime,
            };

            const updatedLocation: Coordinates = {
              lat: watchPos.coords.latitude,
              lng: watchPos.coords.longitude,
              speedKmh: currentSpeed,
              heading: watchPos.coords.heading ?? undefined,
              label: 'My Current Location',
            };

            setUserLocation(updatedLocation);

            // Proactive Slow Traffic Spotting: If moving < 12 km/h near a known hotspot
            if (currentSpeed > 0 && currentSpeed < 12) {
              const nearbySpot = hotspots.find(
                (h) =>
                  getDistanceMeters(watchPos.coords.latitude, watchPos.coords.longitude, h.lat, h.lng) <= 500
              );
              if (nearbySpot && !proactivePrompt) {
                setProactivePrompt({
                  locationName: nearbySpot.name,
                  coords: updatedLocation,
                  speed: Math.round(currentSpeed),
                });
              }
            } else if (currentSpeed > 25 && proactivePrompt) {
              setProactivePrompt(null);
            }
          },
          (err) => console.warn('Watch position error:', err),
          { enableHighAccuracy: true, maximumAge: 4000 }
        );
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        // Fallback demo location in Kigali (Kacyiru / Ministries)
        const demoUserCoords: Coordinates = {
          lat: -1.9392,
          lng: 30.0769,
          speedKmh: 38,
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
    setProactivePrompt(null);
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

  const handleSelectHotspot = (spot: KigaliHotspot) => {
    setDestination({ lat: spot.lat, lng: spot.lng, label: spot.name });
    setIsRouteDrawerExpanded(true);
  };

  const handleCorridorClick = (corridor: TrafficCorridor) => {
    const midPoint = corridor.coordinates[Math.floor(corridor.coordinates.length / 2)];
    setDestination({ lat: midPoint[0], lng: midPoint[1], label: `${corridor.roadCode} (${corridor.name})` });
    setIsRouteDrawerExpanded(true);
  };

  return (
    <div
      className={`relative w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col font-sans select-none transition-colors duration-200 ${
        isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* 1. Full-Bleed Map Canvas with Traffic Corridors Layer */}
      <div className="absolute inset-0 z-0">
        <KigaliMap
          incidents={incidents}
          hotspots={hotspots}
          corridors={corridors}
          selectedOrigin={origin}
          selectedDestination={destination}
          routes={routes}
          activeRouteId={activeRouteId}
          userLocation={userLocation}
          isLocating={isLocating}
          isFollowingUser={isFollowingUser}
          isDarkMode={isDarkMode}
          showTrafficFlow={showTrafficFlow}
          onToggleTrafficFlow={() => setShowTrafficFlow((prev) => !prev)}
          onLocateMe={handleLocateMe}
          onSelectRoute={setActiveRouteId}
          onMapClick={handleMapClick}
          onIncidentClick={setSelectedIncident}
          onHotspotClick={handleSelectHotspot}
          onCorridorClick={handleCorridorClick}
        />
      </div>

      {/* 2. Top Header & Chokepoint Radar (Mobile-optimised Floating Stack) */}
      <div className="absolute top-2 inset-x-2 sm:top-3 sm:inset-x-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        {/* Header Pill */}
        <div
          className={`backdrop-blur-xl border rounded-2xl sm:rounded-3xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 shadow-2xl flex items-center justify-between pointer-events-auto transition-colors ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-700/80 text-white'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
          }`}
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <AppLogo size={42} className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl shadow-md ring-1 ring-white/10 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className={`font-black text-sm sm:text-lg md:text-xl tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Kigali Traffic
                </h1>
                <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-black tracking-wide uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
              <p className={`text-[10px] sm:text-xs font-semibold tracking-wide ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Spotter & Flow Radar
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Audio Alerts Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all shadow-sm active:scale-95 ${
                isSoundEnabled
                  ? isDarkMode
                    ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                  : isDarkMode
                  ? 'bg-slate-800/80 text-slate-500 border-slate-700'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
              title={isSoundEnabled ? 'Audio Alerts Enabled (Tap to Mute)' : 'Audio Alerts Muted (Tap to Enable)'}
            >
              {isSoundEnabled ? <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400" /> : <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            </button>

            {/* Install PWA Button */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl border transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
                isDarkMode
                  ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-500/30'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200'
              }`}
              title="Install Kigali Traffic App"
            >
              <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="hidden md:inline text-xs font-bold">Install</span>
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all shadow-sm active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-800/90 hover:bg-slate-750 text-amber-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-600" />}
            </button>

            {/* Refresh / Reload Button */}
            <button
              onClick={() => window.location.reload()}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all shadow-sm active:scale-95 ${
                isDarkMode
                  ? 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
              }`}
              title="Reload App"
            >
              <RefreshCw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </div>

        {/* Chokepoint Radar Horizontal Ticker */}
        <div className="px-0.5">
          <ChokepointRadar
            hotspots={hotspots}
            isDarkMode={isDarkMode}
            onSelectHotspot={handleSelectHotspot}
          />
        </div>
      </div>

      {/* Proactive Slow Traffic / Gridlock Detection Banner (Waze-style) */}
      {proactivePrompt && (
        <div className="absolute top-36 sm:top-32 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-30 pointer-events-auto animate-in slide-in-from-top-3 fade-in">
          <div className={`p-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 ${
            isDarkMode
              ? 'bg-slate-900/95 border-amber-500/60 text-white shadow-amber-950/40 ring-1 ring-amber-500/30'
              : 'bg-white/95 border-amber-300 text-slate-900 shadow-slate-200/50'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">
                  Crawling traffic detected near {proactivePrompt.locationName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium">
                  Speed ~{proactivePrompt.speed} km/h • Spot this jam for Kigali?
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setSpotterCoords({
                    lat: proactivePrompt.coords.lat,
                    lng: proactivePrompt.coords.lng,
                    label: proactivePrompt.locationName,
                  });
                  setIsSpotterModalOpen(true);
                  setProactivePrompt(null);
                }}
                className="px-2.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                Spot Jam
              </button>
              <button
                onClick={() => setProactivePrompt(null)}
                className={`p-1 rounded-lg ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Waze-Style Floating Action Button (FAB) at Bottom Right */}
      {(!isRouteDrawerExpanded || window.innerWidth > 640) && (
        <div className="absolute bottom-16 sm:bottom-6 right-3 sm:right-6 z-20 pointer-events-auto transition-all">
          <button
            onClick={() => {
              setSpotterCoords(userLocation || { lat: -1.9441, lng: 30.0619, label: 'Kigali Area' });
              setIsSpotterModalOpen(true);
            }}
            className="group relative flex items-center gap-2 bg-gradient-to-r from-orange-500 via-rose-600 to-amber-500 text-white font-black text-xs px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-2xl shadow-orange-600/50 hover:shadow-orange-600/70 border border-white/20 transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="absolute -inset-0.5 rounded-2xl bg-orange-500 opacity-30 group-hover:opacity-60 blur-sm animate-pulse" />
            <AlertTriangle className="w-4 h-4 text-white shrink-0 relative z-10" />
            <span className="relative z-10 font-black tracking-wide">Spot Traffic</span>
          </button>
        </div>
      )}

      {/* 4. Bottom Navigation Drawer (Mobile Bottom Sheet / Desktop Card) */}
      <div className="absolute bottom-0 inset-x-0 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md p-2 sm:p-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-20 pointer-events-none">
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

      {/* PWA Install Prompt Banner / Dialog */}
      <InstallPromptModal
        isDarkMode={isDarkMode}
        forceOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}

export default App;
