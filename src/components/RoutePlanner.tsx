import React from 'react';
import type { Coordinates, RouteOption } from '../types';
import { POPULAR_LOCATIONS } from '../data/kigaliHotspots';
import { Navigation2, Clock, ShieldCheck, Car, Bike, ArrowUpDown, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface RoutePlannerProps {
  origin: Coordinates | null;
  destination: Coordinates | null;
  routes: RouteOption[];
  activeRouteId: string | null;
  userLocation: Coordinates | null;
  avoidTraffic: boolean;
  transportMode: 'car' | 'moto';
  isLoadingRoutes: boolean;
  isExpanded: boolean;
  isDarkMode?: boolean;
  onToggleExpand: (expanded: boolean) => void;
  onRequestUserLocation: () => void;
  onSetOrigin: (coords: Coordinates) => void;
  onSetDestination: (coords: Coordinates) => void;
  onSelectRoute: (id: string) => void;
  onToggleAvoidTraffic: (avoid: boolean) => void;
  onSetTransportMode: (mode: 'car' | 'moto') => void;
  onSwapLocations: () => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  origin,
  destination,
  routes,
  activeRouteId,
  userLocation,
  avoidTraffic,
  transportMode,
  isLoadingRoutes,
  isExpanded,
  isDarkMode = true,
  onToggleExpand,
  onRequestUserLocation,
  onSetOrigin,
  onSetDestination,
  onSelectRoute,
  onToggleAvoidTraffic,
  onSetTransportMode,
  onSwapLocations,
}) => {
  const selectedRoute = routes.find((r) => r.id === activeRouteId) || routes[0];

  const isOriginUserLocation =
    origin?.label === 'My Current Location' ||
    origin?.label === 'Your Location' ||
    Boolean(userLocation && origin?.lat === userLocation.lat && origin?.lng === userLocation.lng);

  const handleSelectOrigin = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'MY_LOCATION') {
      if (userLocation) {
        onSetOrigin({ ...userLocation, label: 'My Current Location' });
      } else {
        onRequestUserLocation();
      }
      return;
    }

    const loc = POPULAR_LOCATIONS.find((l) => l.name === value);
    if (loc) {
      onSetOrigin({ lat: loc.lat, lng: loc.lng, label: loc.name });
    }
  };

  const handleSelectDestination = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = POPULAR_LOCATIONS.find((l) => l.name === e.target.value);
    if (loc) {
      onSetDestination({ lat: loc.lat, lng: loc.lng, label: loc.name });
    }
  };

  return (
    <div className="w-full pointer-events-auto">
      {/* 1. COLLAPSED PEEK BAR (Mobile-First Default) */}
      {!isExpanded && (
        <div
          onClick={() => onToggleExpand(true)}
          className={`backdrop-blur-xl border rounded-2xl p-3 px-4 shadow-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-700/80 text-white hover:border-blue-500/50'
              : 'bg-white/95 border-slate-200 text-slate-900 hover:border-blue-400 shadow-slate-200/50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
              <Navigation2 className="w-4 h-4 text-white" />
            </div>

            <div className="min-w-0">
              {selectedRoute ? (
                <>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`font-black text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedRoute.durationMinutes} min
                    </span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      ({selectedRoute.distanceKm} km)
                    </span>
                    {selectedRoute.isAlternative && (
                      <span className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                        Bypass
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {origin?.label?.split(' ')[0]} → {destination?.label?.split(' ')[0]}
                  </p>
                </>
              ) : (
                <div>
                  <span className={`font-bold text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Find Route in Kigali
                  </span>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tap to choose start & destination
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-[11px] font-bold text-blue-500 hidden sm:inline">Change</span>
            <div className={`p-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              <ChevronUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* 2. EXPANDED BOTTOM SHEET */}
      {isExpanded && (
        <div
          className={`backdrop-blur-2xl border rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[80vh] overflow-y-auto transition-colors ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-700/80 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
          }`}
        >
          {/* Grab Bar & Header */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-1 rounded-full mb-3 cursor-pointer ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}
              onClick={() => onToggleExpand(false)}
            />

            <div className={`w-full flex items-center justify-between pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center font-black">
                  <Navigation2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className={`font-extrabold text-xs sm:text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Kigali Route Recommender
                  </h2>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Avoid chokepoints & hill gridlocks
                  </p>
                </div>
              </div>

              <button
                onClick={() => onToggleExpand(false)}
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
              >
                <span>View Map</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Location Inputs (With Your Location as Option #1) */}
          <div className={`rounded-2xl p-2.5 border flex items-center gap-2 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            {/* Left Inputs Column */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Origin */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20 shrink-0" />
                <select
                  className={`w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer truncate py-0.5 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                  value={isOriginUserLocation ? 'MY_LOCATION' : origin?.label || ''}
                  onChange={handleSelectOrigin}
                >
                  <option value="" className={isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}>
                    Select Starting Point...
                  </option>
                  {/* FIRST OPTION: Your Location */}
                  <option value="MY_LOCATION" className={isDarkMode ? 'bg-slate-900 text-blue-400 font-bold' : 'bg-white text-blue-600 font-bold'}>
                    📍 Your Location {userLocation ? '' : '(Detect GPS)'}
                  </option>
                  <optgroup label="Popular Kigali Hubs" className={isDarkMode ? 'bg-slate-900 text-slate-400 font-normal' : 'bg-white text-slate-500 font-normal'}>
                    {POPULAR_LOCATIONS.map((loc) => (
                      <option key={loc.name} value={loc.name} className={isDarkMode ? 'bg-slate-900 text-white font-medium' : 'bg-white text-slate-900 font-medium'}>
                        {loc.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className={`h-[1px] ml-4.5 ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-200'}`} />

              {/* Destination */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 shrink-0" />
                <select
                  className={`w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer truncate py-0.5 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                  value={destination?.label || ''}
                  onChange={handleSelectDestination}
                >
                  <option value="" className={isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}>
                    Select Destination...
                  </option>
                  {POPULAR_LOCATIONS.map((loc) => (
                    <option key={loc.name} value={loc.name} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Dedicated Swap Column */}
            <div className={`border-l pl-2 shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={onSwapLocations}
                className={`p-2 rounded-xl border shadow-sm transition-all active:scale-90 ${
                  isDarkMode
                    ? 'bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
                title="Reverse start & destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Transport Mode & Avoidance Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className={`flex p-0.5 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => onSetTransportMode('car')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  transportMode === 'car'
                    ? 'bg-blue-600 text-white shadow'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Car</span>
              </button>
              <button
                onClick={() => onSetTransportMode('moto')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  transportMode === 'moto'
                    ? 'bg-amber-600 text-white shadow'
                    : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Moto</span>
              </button>
            </div>

            <label className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-xl border text-xs font-semibold ${
              isDarkMode ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={avoidTraffic}
                onChange={(e) => onToggleAvoidTraffic(e.target.checked)}
                className="rounded border-slate-400 text-emerald-500 focus:ring-0"
              />
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                Avoid Jams
              </span>
            </label>
          </div>

          {/* Route Options Comparison List */}
          {isLoadingRoutes ? (
            <div className="py-6 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-[11px]">Analyzing Kigali bypass routes...</span>
            </div>
          ) : routes.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
              {routes.map((route) => {
                const isSelected = route.id === activeRouteId;
                const isAlternative = route.isAlternative;

                return (
                  <div
                    key={route.id}
                    onClick={() => {
                      onSelectRoute(route.id);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? isAlternative
                          ? isDarkMode
                            ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500/30 shadow'
                            : 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/30 shadow'
                          : isDarkMode
                          ? 'bg-blue-950/50 border-blue-500 ring-1 ring-blue-500/30 shadow'
                          : 'bg-blue-50 border-blue-500 ring-1 ring-blue-500/30 shadow'
                        : isDarkMode
                        ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isAlternative ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                          />
                          <h4 className={`font-extrabold text-xs truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {route.name}
                          </h4>
                          {isAlternative && (
                            <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-[9px] px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                              Alternative
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] mt-0.5 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {route.summary}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`flex items-center justify-end gap-1 font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          <Clock className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                          <span>{route.durationMinutes} min</span>
                        </div>
                        <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {route.distanceKm} km
                        </span>
                      </div>
                    </div>

                    {route.avoidsHotspots.length > 0 && (
                      <div className={`mt-2 pt-1.5 border-t flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium ${
                        isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
                      }`}>
                        <ShieldCheck className="w-3 h-3 shrink-0" />
                        <span className="truncate">Avoids {route.avoidsHotspots.join(', ')}</span>
                      </div>
                    )}

                    {route.trafficCondition === 'heavy' && (
                      <div className={`mt-2 pt-1.5 border-t flex items-center gap-1 text-[10px] text-rose-500 font-medium ${
                        isDarkMode ? 'border-slate-800/60' : 'border-slate-200'
                      }`}>
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>Heavy delays on direct corridor</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-4 text-[11px] rounded-xl border ${
              isDarkMode ? 'text-slate-400 bg-slate-950/40 border-slate-800' : 'text-slate-500 bg-slate-50 border-slate-200'
            }`}>
              Tap anywhere on Kigali map to set start & destination points.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
