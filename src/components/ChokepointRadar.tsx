import React from 'react';
import type { KigaliHotspot } from '../types';
import { Activity } from 'lucide-react';

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
          const isCongested = spot.status === 'congested' || spot.status === 'blocked';
          const isSlow = spot.status === 'slow';

          const badgeClasses = isCongested
            ? isDarkMode
              ? 'bg-rose-950/70 border-rose-500/60 text-rose-200 shadow-rose-950/40'
              : 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
            : isSlow
            ? isDarkMode
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 shadow-amber-950/40'
              : 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
            : isDarkMode
            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
            : 'bg-white/90 border-slate-200 text-slate-700 shadow-sm';

          const dotColor = isCongested
            ? 'bg-rose-500 ring-rose-500/40'
            : isSlow
            ? 'bg-amber-400 ring-amber-400/40'
            : 'bg-emerald-400 ring-emerald-400/40';

          return (
            <button
              key={spot.id}
              onClick={() => onSelectHotspot(spot)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shadow-md hover:scale-105 active:scale-95 shrink-0 ${badgeClasses}`}
            >
              <span className={`w-2 h-2 rounded-full ring-4 ${dotColor}`} />
              <span>{spot.name.split(' ')[0]}</span>
              {spot.currentDelayMinutes > 0 ? (
                <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-black/30">
                  +{spot.currentDelayMinutes}m
                </span>
              ) : (
                <span className="text-[10px] opacity-75 font-mono">Flowing</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
