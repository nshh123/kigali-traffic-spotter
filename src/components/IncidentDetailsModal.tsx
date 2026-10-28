import React from 'react';
import type { TrafficIncident } from '../types';
import { X, ThumbsUp, CheckCircle, Clock, MapPin, Compass, ShieldAlert } from 'lucide-react';

interface IncidentDetailsModalProps {
  incident: TrafficIncident;
  isDarkMode?: boolean;
  onClose: () => void;
  onVote: (incidentId: string, type: 'confirm' | 'cleared') => void;
  onNavigateAround: (incident: TrafficIncident) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incident,
  isDarkMode = true,
  onClose,
  onVote,
  onNavigateAround,
}) => {
  const getMinutesAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  const isSevere = incident.severity === 'severe' || incident.severity === 'blocked';

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm transition-all pointer-events-auto ${
      isDarkMode ? 'bg-black/60' : 'bg-slate-900/40'
    }`}>
      <div className={`rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative border transition-colors ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
      }`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-all ${
            isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Category & Status */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isSevere
                ? isDarkMode
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
                : isDarkMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {incident.severity} Delay
          </span>
          <span className={`flex items-center gap-1 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <Clock className="w-3.5 h-3.5" />
            {getMinutesAgo(incident.reportedAt)}
          </span>
        </div>

        <h3 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {incident.title}
        </h3>

        <div className={`flex items-center gap-1.5 text-xs mt-1.5 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{incident.locationName}</span>
        </div>

        {/* Description box */}
        <p className={`text-xs p-3.5 rounded-2xl border mt-3 leading-relaxed ${
          isDarkMode
            ? 'text-slate-300 bg-slate-950/70 border-slate-800/80'
            : 'text-slate-700 bg-slate-50 border-slate-200'
        }`}>
          {incident.description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-3 text-xs">
          <div className={`p-3 rounded-2xl border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Road Surface
            </span>
            <span className={`font-bold capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {incident.roadType === 'amapave' ? 'Cobblestone (Amapave)' : incident.roadType || 'Asphalt'}
            </span>
          </div>

          <div className={`p-3 rounded-2xl border ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Commuter Votes
            </span>
            <span className="font-bold text-emerald-500 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {incident.confirmations} confirmed
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className={`mt-4 pt-3 border-t flex flex-col gap-2.5 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onVote(incident.id, 'confirm')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                isDarkMode
                  ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/30'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Still There ({incident.confirmations})</span>
            </button>

            <button
              onClick={() => onVote(incident.id, 'cleared')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Cleared</span>
            </button>
          </div>

          <button
            onClick={() => onNavigateAround(incident)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Recalculate Hill Bypass Route</span>
          </button>
        </div>
      </div>
    </div>
  );
};
