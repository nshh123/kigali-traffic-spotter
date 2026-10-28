import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Coordinates, KigaliHotspot, RouteOption, TrafficIncident } from '../types';
import { KIGALI_CENTER } from '../data/kigaliHotspots';
import { Layers, Mountain, Map as MapIcon, Compass, Plus, Minus, Crosshair } from 'lucide-react';

interface KigaliMapProps {
  incidents: TrafficIncident[];
  hotspots: KigaliHotspot[];
  selectedOrigin: Coordinates | null;
  selectedDestination: Coordinates | null;
  routes: RouteOption[];
  activeRouteId: string | null;
  userLocation: Coordinates | null;
  isLocating: boolean;
  isFollowingUser: boolean;
  isDarkMode?: boolean;
  onLocateMe: () => void;
  onSelectRoute: (routeId: string) => void;
  onMapClick: (coords: Coordinates) => void;
  onIncidentClick: (incident: TrafficIncident) => void;
  onHotspotClick: (hotspot: KigaliHotspot) => void;
}

type MapTheme = 'esri' | 'osm_hot' | 'osm';

export const KigaliMap: React.FC<KigaliMapProps> = ({
  incidents,
  hotspots,
  selectedOrigin,
  selectedDestination,
  routes,
  activeRouteId,
  userLocation,
  isLocating,
  isFollowingUser,
  isDarkMode = true,
  onLocateMe,
  onSelectRoute,
  onMapClick,
  onIncidentClick,
  onHotspotClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);

  const [currentTheme, setCurrentTheme] = useState<MapTheme>('esri');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  const themeConfigs: Record<MapTheme, { label: string; url: string; attribution: string; icon: React.ReactNode }> = {
    esri: {
      label: 'Street',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, HERE, Garmin',
      icon: <Compass className="w-3.5 h-3.5 text-blue-400" />,
    },
    osm_hot: {
      label: 'Hills (HOT)',
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap, HOT',
      icon: <Mountain className="w-3.5 h-3.5 text-emerald-400" />,
    },
    osm: {
      label: 'Standard',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap',
      icon: <MapIcon className="w-3.5 h-3.5 text-amber-400" />,
    },
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [KIGALI_CENTER.lat, KIGALI_CENTER.lng],
      zoom: KIGALI_CENTER.zoom,
      zoomControl: false, // Prevents bottom-right collision with FAB!
    });

    const initialTheme = themeConfigs[currentTheme];
    tileLayerRef.current = L.tileLayer(initialTheme.url, {
      attribution: initialTheme.attribution,
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      setIsLayerMenuOpen(false);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleChangeTheme = (theme: MapTheme) => {
    setCurrentTheme(theme);
    setIsLayerMenuOpen(false);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const nextConfig = themeConfigs[theme];
    tileLayerRef.current = L.tileLayer(nextConfig.url, {
      attribution: nextConfig.attribution,
      maxZoom: 19,
    }).addTo(map);
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Pan to user when userLocation changes and following is active
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    // Render / update pulsing blue GPS location marker
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      const userDotHtml = `
        <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userDotHtml,
        className: 'user-gps-dot',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      userLocationMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }

    if (isFollowingUser) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 1.2 });
    }
  }, [userLocation, isFollowingUser]);

  // Update Markers with Non-Overlapping Spatial Geometry
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    markersLayer.clearLayers();

    // 1. Render Incidents: Positioned ABOVE the anchor point (translate -50%, -100%)
    incidents.forEach((incident) => {
      const config = getIncidentVisual(incident.type, incident.severity);

      const html = `
        <div class="relative flex flex-col items-center cursor-pointer group" style="transform: translate(-50%, -100%);">
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full ${config.pulse} animate-ping opacity-60"></div>
            <div class="relative w-8 h-8 rounded-2xl ${config.bg} text-white flex items-center justify-center shadow-2xl border-2 border-white text-xs font-bold transition-transform transform group-hover:scale-125">
              ${config.emoji}
            </div>
            ${
              incident.confirmations > 5
                ? `<div class="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 font-black text-[9px] px-1 rounded-full border border-white shadow">
                    ${incident.confirmations}
                  </div>`
                : ''
            }
          </div>
          <!-- Pointer tip pointing directly at coordinate -->
          <div class="w-2 h-2 ${config.bg} rotate-45 -mt-1 border-r border-b border-white"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: 'incident-marker-pin',
        iconSize: [36, 42],
        iconAnchor: [18, 42],
      });

      const marker = L.marker([incident.lat, incident.lng], { icon: customIcon });
      marker.on('click', () => onIncidentClick(incident));
      markersLayer.addLayer(marker);
    });

    // 2. Render Kigali Chokepoint Hotspots: Positioned BELOW the anchor point (translate -50%, 6px)
    // This guarantees ZERO overlap with incident pins at the same junction!
    hotspots.forEach((spot) => {
      const statusColor =
        spot.status === 'blocked'
          ? 'bg-rose-500'
          : spot.status === 'congested'
          ? 'bg-orange-500'
          : spot.status === 'slow'
          ? 'bg-amber-400'
          : 'bg-emerald-500';

      const html = `
        <div class="flex items-center gap-1.5 bg-slate-900/95 text-white pl-2 pr-2.5 py-1 rounded-full border border-slate-700 shadow-xl text-[10px] font-bold whitespace-nowrap cursor-pointer hover:bg-slate-800 transition-all backdrop-blur-md" style="transform: translate(-50%, 6px);">
          <span class="w-2 h-2 rounded-full ${statusColor} shrink-0 animate-pulse"></span>
          <span>${spot.name.split(' ')[0]}</span>
          ${
            spot.currentDelayMinutes > 0
              ? `<span class="text-amber-300 font-mono text-[9px] font-extrabold">+${spot.currentDelayMinutes}m</span>`
              : ''
          }
        </div>
      `;

      const hotspotIcon = L.divIcon({
        html,
        className: 'chokepoint-marker-pill',
        iconSize: [84, 26],
        iconAnchor: [42, 0],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: hotspotIcon });
      marker.on('click', () => onHotspotClick(spot));
      markersLayer.addLayer(marker);
    });

    // 3. Render Origin Marker
    if (selectedOrigin) {
      const originIcon = L.divIcon({
        html: `
          <div class="flex flex-col items-center" style="transform: translate(-50%, -100%);">
            <div class="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-xl border-2 border-white flex items-center gap-1">
              <span>📍 Start</span>
            </div>
            <div class="w-2 h-2 bg-blue-600 rotate-45 -mt-1 border-r-2 border-b-2 border-white"></div>
          </div>
        `,
        className: 'origin-marker-container',
        iconSize: [60, 28],
        iconAnchor: [30, 28],
      });
      markersLayer.addLayer(L.marker([selectedOrigin.lat, selectedOrigin.lng], { icon: originIcon }));
    }

    // 4. Render Destination Marker
    if (selectedDestination) {
      const destIcon = L.divIcon({
        html: `
          <div class="flex flex-col items-center" style="transform: translate(-50%, -100%);">
            <div class="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-lg shadow-xl border-2 border-white flex items-center gap-1">
              <span>🏁 Finish</span>
            </div>
            <div class="w-2 h-2 bg-emerald-600 rotate-45 -mt-1 border-r-2 border-b-2 border-white"></div>
          </div>
        `,
        className: 'dest-marker-container',
        iconSize: [60, 28],
        iconAnchor: [30, 28],
      });
      markersLayer.addLayer(L.marker([selectedDestination.lat, selectedDestination.lng], { icon: destIcon }));
    }
  }, [incidents, hotspots, selectedOrigin, selectedDestination]);

  // Update Routes Layer
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    const map = mapInstanceRef.current;
    if (!routesLayer || !map) return;

    routesLayer.clearLayers();

    if (routes.length === 0) return;

    routes.forEach((route) => {
      const isActive = route.id === activeRouteId;
      const isAlt = route.isAlternative;

      const mainColor = isAlt
        ? '#059669' // Emerald
        : route.trafficCondition === 'heavy'
        ? '#dc2626' // Red
        : '#2563eb'; // Vibrant Blue

      const casing = L.polyline(route.coordinates, {
        color: '#ffffff',
        weight: isActive ? 8 : 5,
        opacity: isActive ? 0.95 : 0.6,
        lineCap: 'round',
        lineJoin: 'round',
      });
      routesLayer.addLayer(casing);

      const polyline = L.polyline(route.coordinates, {
        color: mainColor,
        weight: isActive ? 5 : 3.5,
        opacity: 1,
        dashArray: isAlt ? '6, 8' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.on('click', () => onSelectRoute(route.id));
      routesLayer.addLayer(polyline);
    });

    const allCoords = routes.flatMap((r) => r.coordinates);
    if (allCoords.length > 0 && !isFollowingUser) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, {
        paddingTopLeft: [120, 40],
        paddingBottomRight: [40, 160],
        maxZoom: 15,
      });
    }
  }, [routes, activeRouteId, isFollowingUser]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Control Stack on the Right (Layers, Locate Me, Zoom Controls) */}
      {/* Positioned at top-36 on mobile to guarantee clear vertical separation below the Chokepoint Radar */}
      <div className="absolute top-36 sm:top-28 right-3 sm:right-3.5 z-10 flex flex-col gap-2">
        {/* Layer Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className={`w-10 h-10 rounded-2xl backdrop-blur-md border shadow-xl flex items-center justify-center active:scale-95 transition-all ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:bg-slate-800'
                : 'bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-slate-200/50'
            }`}
            title="Switch Map Style"
          >
            <Layers className="w-4 h-4 text-blue-500" />
          </button>

          {isLayerMenuOpen && (
            <div className={`absolute right-0 mt-2 w-36 backdrop-blur-xl border rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 text-xs animate-in fade-in zoom-in-95 z-30 ${
              isDarkMode
                ? 'bg-slate-900/95 border-slate-700/90 text-white'
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/50'
            }`}>
              <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Map Style
              </span>
              {(['esri', 'osm_hot', 'osm'] as MapTheme[]).map((key) => {
                const cfg = themeConfigs[key];
                const isSelected = currentTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleChangeTheme(key)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow'
                        : isDarkMode
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Live GPS Locate Me & Follow Button */}
        <button
          onClick={onLocateMe}
          className={`w-10 h-10 rounded-2xl backdrop-blur-md border shadow-xl flex items-center justify-center transition-all active:scale-95 ${
            isFollowingUser
              ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-400/40 shadow-blue-600/30'
              : isDarkMode
              ? 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
              : 'bg-white/95 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-slate-200/50'
          }`}
          title={isFollowingUser ? 'Following your GPS location (Tap to stop)' : 'Center on My GPS Location'}
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-blue-500' : ''}`} />
        </button>

        {/* Clean Modern Zoom In / Zoom Out Controls */}
        <div className={`backdrop-blur-md border rounded-2xl shadow-xl flex flex-col overflow-hidden ${
          isDarkMode ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/95 border-slate-200 shadow-slate-200/50'
        }`}>
          <button
            onClick={handleZoomIn}
            className={`w-10 h-9 flex items-center justify-center transition-all border-b ${
              isDarkMode
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 border-slate-800'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 border-slate-200'
            }`}
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className={`w-10 h-9 flex items-center justify-center transition-all ${
              isDarkMode
                ? 'text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200'
            }`}
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function getIncidentVisual(type: string, severity: string) {
  let emoji = '⚠️';
  let bg = 'bg-amber-500';
  let pulse = 'bg-amber-400';

  if (type === 'gridlock') {
    emoji = '🚗';
    bg = severity === 'severe' ? 'bg-rose-600' : 'bg-orange-500';
    pulse = severity === 'severe' ? 'bg-rose-500' : 'bg-orange-400';
  } else if (type === 'police') {
    emoji = '👮';
    bg = 'bg-blue-600';
    pulse = 'bg-blue-400';
  } else if (type === 'closure') {
    emoji = '⛔';
    bg = 'bg-purple-600';
    pulse = 'bg-purple-400';
  } else if (type === 'accident') {
    emoji = '💥';
    bg = 'bg-red-600';
    pulse = 'bg-red-400';
  } else if (type === 'hazard') {
    emoji = '🌧️';
    bg = 'bg-amber-600';
    pulse = 'bg-amber-400';
  }

  return { emoji, bg, pulse };
}
