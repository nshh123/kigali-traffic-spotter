import React, { useState } from 'react';
import type { Coordinates, IncidentSeverity, IncidentType, TrafficIncident } from '../types';
import { X, ShieldAlert, Ban, Car, CloudRain, AlertCircle, Send, MapPin } from 'lucide-react';

interface SpotterModalProps {
  initialCoords: Coordinates;
  isDarkMode?: boolean;
  onClose: () => void;
  onSubmit: (incident: Omit<TrafficIncident, 'id' | 'reportedAt' | 'confirmations' | 'clearedVotes'>) => void;
}

export const SpotterModal: React.FC<SpotterModalProps> = ({
  initialCoords,
  isDarkMode = true,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<IncidentType>('gridlock');
  const [severity, setSeverity] = useState<IncidentSeverity>('severe');
  const [title, setTitle] = useState('Heavy Traffic Jam / Chokepoint');
  const [locationName, setLocationName] = useState(initialCoords.label || 'Kigali Road Section');
  const [description, setDescription] = useState('');
  const [roadType, setRoadType] = useState<'asphalt' | 'amapave' | 'dirt'>('asphalt');

  const incidentOptions: {
    type: IncidentType;
    label: string;
    icon: (isSelected: boolean, isDark: boolean) => React.ReactNode;
    defaultTitle: string;
    color: string;
    bg: string;
    badgeLight: string;
    badgeDark: string;
  }[] = [
    {
      type: 'gridlock',
      label: 'Embouteillage',
      icon: (selected, dark) => (
        <Car
          className={`w-5 h-5 ${
            selected ? 'text-white' : dark ? 'text-orange-400' : 'text-orange-600'
          }`}
        />
      ),
      defaultTitle: 'Heavy Traffic Jam / Chokepoint',
      color: 'border-orange-500',
      bg: 'from-orange-600 to-amber-600',
      badgeLight: 'bg-orange-100 text-orange-600',
      badgeDark: 'bg-orange-950/60 text-orange-400',
    },
    {
      type: 'police',
      label: 'Police Check',
      icon: (selected, dark) => (
        <ShieldAlert
          className={`w-5 h-5 ${
            selected ? 'text-white' : dark ? 'text-blue-400' : 'text-blue-600'
          }`}
        />
      ),
      defaultTitle: 'Traffic Police & Document Inspection',
      color: 'border-blue-500',
      bg: 'from-blue-600 to-indigo-600',
      badgeLight: 'bg-blue-100 text-blue-600',
      badgeDark: 'bg-blue-950/60 text-blue-400',
    },
    {
      type: 'closure',
      label: 'Road Closed',
      icon: (selected, dark) => (
        <Ban
          className={`w-5 h-5 ${
            selected ? 'text-white' : dark ? 'text-purple-400' : 'text-purple-600'
          }`}
        />
      ),
      defaultTitle: 'Road Closed / Traffic Diversion',
      color: 'border-purple-500',
      bg: 'from-purple-600 to-pink-600',
      badgeLight: 'bg-purple-100 text-purple-600',
      badgeDark: 'bg-purple-950/60 text-purple-400',
    },
    {
      type: 'accident',
      label: 'Accident',
      icon: (selected, dark) => (
        <AlertCircle
          className={`w-5 h-5 ${
            selected ? 'text-white' : dark ? 'text-rose-400' : 'text-rose-600'
          }`}
        />
      ),
      defaultTitle: 'Vehicle Collision / Breakdown',
      color: 'border-rose-500',
      bg: 'from-rose-600 to-red-600',
      badgeLight: 'bg-rose-100 text-rose-600',
      badgeDark: 'bg-rose-950/60 text-rose-400',
    },
    {
      type: 'hazard',
      label: 'Mud / Valley Runoff',
      icon: (selected, dark) => (
        <CloudRain
          className={`w-5 h-5 ${
            selected ? 'text-white' : dark ? 'text-emerald-400' : 'text-emerald-600'
          }`}
        />
      ),
      defaultTitle: 'Slippery Valley Road / Rain Runoff',
      color: 'border-emerald-500',
      bg: 'from-emerald-600 to-teal-600',
      badgeLight: 'bg-emerald-100 text-emerald-600',
      badgeDark: 'bg-emerald-950/60 text-emerald-400',
    },
  ];

  const handleSelectType = (item: typeof incidentOptions[0]) => {
    setType(item.type);
    setTitle(item.defaultTitle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      type,
      severity,
      title: title.trim(),
      locationName: locationName.trim(),
      description: description.trim() || 'Reported by local commuter.',
      lat: initialCoords.lat,
      lng: initialCoords.lng,
      roadType,
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md transition-all ${
      isDarkMode ? 'bg-black/75' : 'bg-slate-900/40'
    }`}>
      <div className={`rounded-t-3xl sm:rounded-3xl w-full max-w-lg shadow-2xl relative max-h-[90dvh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200 border transition-colors ${
        isDarkMode
          ? 'bg-slate-900 border-slate-700/80 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
      }`}>
        
        {/* Grab Handle (Mobile Swipe Cue) */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden cursor-pointer" onClick={onClose}>
          <div className={`w-12 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
        </div>

        {/* Modal Header */}
        <div className={`p-3.5 sm:p-5 pb-2.5 sm:pb-3 border-b flex items-center justify-between shrink-0 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center font-black">
              📢
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Spot & Warn Kigali Traffic
              </h3>
              <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Alerts nearby commuters and triggers live bypass routes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="spotter-form" className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto overscroll-contain flex-1">
          {/* Category Tiles */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              1. What did you spot?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {incidentOptions.map((opt) => {
                const isSelected = type === opt.type;
                return (
                  <button
                    type="button"
                    key={opt.type}
                    onClick={() => handleSelectType(opt)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition-all active:scale-95 text-left ${
                      isSelected
                        ? `${opt.color} bg-gradient-to-r ${opt.bg} text-white shadow-md font-bold`
                        : isDarkMode
                        ? 'border-slate-800 bg-slate-950/70 hover:bg-slate-800 text-slate-300'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-white/20'
                        : isDarkMode
                        ? opt.badgeDark
                        : opt.badgeLight
                    }`}>
                      {opt.icon(isSelected, isDarkMode)}
                    </div>
                    <span className="text-xs font-semibold truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Title */}
          <div className="space-y-3">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>2. Landmark / Road Name</span>
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Nyabugogo terminal slope, KN 1 Rd"
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs font-medium focus:outline-none focus:border-blue-500 border ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                3. Warning Headline
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-sm sm:text-xs font-medium focus:outline-none focus:border-blue-500 border ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Severity & Road Surface */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className={`w-full rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 border ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="low" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Slow (+5 min)</option>
                <option value="moderate" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Moderate (+10 min)</option>
                <option value="severe" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Severe Standstill (+25 min)</option>
                <option value="blocked" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Road Blocked / Closed</option>
              </select>
            </div>

            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Road Surface
              </label>
              <select
                value={roadType}
                onChange={(e) => setRoadType(e.target.value as 'asphalt' | 'amapave' | 'dirt')}
                className={`w-full rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 border ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="asphalt" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Asphalt (Paved)</option>
                <option value="amapave" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Cobblestone (Amapave)</option>
                <option value="dirt" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Dirt / Feeder Road</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Commuter Advice (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Broken coaster blocking right lane; use Kacyiru bypass..."
              className={`w-full rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-blue-500 border ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
        </form>

        {/* Sticky Action Footer */}
        <div className={`p-3 sm:p-4 border-t flex items-center justify-end gap-2.5 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
          isDarkMode ? 'bg-slate-950/90 border-slate-800/80' : 'bg-slate-50/95 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="spotter-form"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-rose-600 to-amber-500 text-white font-extrabold text-xs shadow-xl shadow-orange-600/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
