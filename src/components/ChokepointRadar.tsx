import React from 'react';
import type { KigaliHotspot } from '../types';
import { Activity, Flame, CheckCircle2 } from 'lucide-react';

interface ChokepointRadarProps {
  hotspots: KigaliHotspot[];
  isDarkMode?: boolean;
  onSelectHotspot: (hotspot: KigaliHotspot) => void;
}

export const ChokepointRadar: React.FC<ChokepointRadarProps> = ({ hotspots, isDarkMode = true, onSelectHotspot }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 pointer-events-auto">
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 shadow-lg ${
        isDarkMode
          ? 'bg-slate-900/90 backdrop-blur-md border-slate-800 text-slate-200'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}>
        <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
        <span className="hidden sm:inline">Chokepoint Radar</span>
        <span className="sm:hidden">Radar</span>
      </div>

      <div className="flex items-center gap-2">
        {hotspots.map((spot) => {
          const isBlocked = spot.status === 'blocked';
          const isCongested = spot.status === 'congested';
          const isSlow = spot.status === 'slow';

          const badgeClasses = isBlocked
            ? isDarkMode
              ? 'bg-purple-950/80 border-purple-500/70 text-purple-200 shadow-purple-950/40 ring-1 ring-purple-500/30'
              : 'bg-purple-50 border-purple-300 text-purple-800 shadow-sm'
            : isCongested
            ? isDarkMode
              ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 shadow-rose-950/40 ring-1 ring-rose-500/30'
              : 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
            : isSlow
            ? isDarkMode
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 shadow-amber-950/40'
              : 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
            : isDarkMode
            ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-emerald-500/40'
            : 'bg-white/90 border-slate-200 text-slate-700 shadow-sm hover:border-emerald-400';

          const dotColor = isBlocked
            ? 'bg-purple-500 ring-purple-500/40'
            : isCongested
            ? 'bg-rose-500 ring-rose-500/40'
            : isSlow
            ? 'bg-amber-400 ring-amber-400/40'
            : 'bg-emerald-400 ring-emerald-400/40';

          return (
            <button
              key={spot.id}
              onClick={() => onSelectHotspot(spot)}
              title={`${spot.name}: ${spot.description}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shadow-md hover:scale-105 active:scale-95 shrink-0 ${badgeClasses}`}
            >
              <span className={`w-2 h-2 rounded-full ring-4 ${dotColor} ${isCongested || isBlocked ? 'animate-ping' : ''}`} />
              <span>{spot.name.split(' ')[0]}</span>

              {spot.incidentCount && spot.incidentCount > 0 ? (
                <span className="flex items-center gap-0.5 text-[10px] font-bold px-1 rounded bg-rose-500/30 text-rose-300">
                  <Flame className="w-2.5 h-2.5 text-rose-400" />
                  {spot.incidentCount}
                </span>
              ) : null}

              {spot.currentDelayMinutes > 0 ? (
                <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-black/30">
                  +{spot.currentDelayMinutes}m
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] opacity-80 text-emerald-400 font-mono">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Flowing
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
