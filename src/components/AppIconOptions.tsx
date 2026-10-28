import React from 'react';

export interface AppIconOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  svg: React.ReactNode;
}

export const APP_ICONS: AppIconOption[] = [
  {
    id: 'icon-horizon',
    name: 'Rwanda Horizon',
    tagline: 'Rolling Hills & Sunlit Bypass',
    description:
      'Features Kigali’s iconic hills rendered in Rwandan emerald green, crowned by the golden sun, with a flowing bypass road cutting through.',
    svg: (
      <svg viewBox="0 0 120 120" className="w-full h-full rounded-[26%] shadow-2xl">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00A3E0" />
            <stop offset="60%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="hillFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="60%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#EAB308" />
          </radialGradient>
        </defs>

        {/* Sky Background */}
        <rect width="120" height="120" fill="url(#skyGrad)" />

        {/* Golden Rwandan Sun */}
        <circle cx="88" cy="34" r="14" fill="url(#sunGlow)" />
        <circle cx="88" cy="34" r="20" fill="#FEF08A" opacity="0.35" />

        {/* Back Hill */}
        <path d="M-10 130 C 20 60, 70 70, 130 110 L 130 130 Z" fill="url(#hillBack)" />

        {/* Front Hill */}
        <path d="M-10 100 C 40 120, 80 65, 130 90 L 130 130 L -10 130 Z" fill="url(#hillFront)" />

        {/* Dynamic Curved Bypass Highway */}
        <path
          d="M 6 130 C 30 95, 60 78, 110 50"
          stroke="url(#roadGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        {/* Road Border Highlights */}
        <path
          d="M 6 130 C 30 95, 60 78, 110 50"
          stroke="#475569"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />
        {/* Golden Dash Line */}
        <path
          d="M 6 130 C 30 95, 60 78, 110 50"
          stroke="#FACC15"
          strokeWidth="2.5"
          strokeDasharray="4 4"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: 'icon-radar',
    name: 'Kigali Radar Spotter',
    tagline: 'High-Tech Tactical Spotter',
    description:
      'Deep dark navy squircle with a luminous radar beacon and community pulse waves warning of bottlenecks.',
    svg: (
      <svg viewBox="0 0 120 120" className="w-full h-full rounded-[26%] shadow-2xl">
        <defs>
          <linearGradient id="darkBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#1C2541" />
          </linearGradient>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="routeCyan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        <rect width="120" height="120" fill="url(#darkBg)" />

        {/* Topography Contour Grid */}
        <circle cx="60" cy="60" r="44" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6" />
        <circle cx="60" cy="60" r="30" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.8" />
        <circle cx="60" cy="60" r="16" stroke="#475569" strokeWidth="1" fill="none" opacity="0.9" />

        {/* Dynamic Branching Bypass Paths */}
        <path
          d="M 20 95 C 45 80, 50 60, 60 60 C 70 60, 85 45, 100 25"
          stroke="url(#routeCyan)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Warning Chokepoint Detour Branch */}
        <path
          d="M 60 60 C 65 75, 80 85, 95 90"
          stroke="#EF4444"
          strokeWidth="3.5"
          strokeDasharray="3 3"
          strokeLinecap="round"
          fill="none"
          opacity="0.75"
        />

        {/* Pulsing Central Spotter Beacon */}
        <circle cx="60" cy="60" r="11" fill="url(#pulseGrad)" />
        <circle cx="60" cy="60" r="18" stroke="#F97316" strokeWidth="2" fill="none" opacity="0.4" />
        <circle cx="60" cy="60" r="4" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: 'icon-ribbon',
    name: 'Twin Hills Ribbon',
    tagline: 'Minimalist Clean Navigation',
    description:
      'Apple/Citymapper-inspired aesthetic with fluid gradient ribbons twisting smoothly over twin hills.',
    svg: (
      <svg viewBox="0 0 120 120" className="w-full h-full rounded-[26%] shadow-2xl">
        <defs>
          <linearGradient id="bgRibbon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
          <filter id="glowEffect">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="120" height="120" fill="url(#bgRibbon)" />

        {/* Twin Hill Curves in Background */}
        <path d="M 10 100 Q 40 40 70 85 T 120 90" stroke="#1E293B" strokeWidth="12" fill="none" opacity="0.7" />

        {/* Fluid Neon Highway Loop */}
        <path
          d="M 22 96 C 35 48, 55 42, 68 76 C 76 96, 92 82, 100 36"
          stroke="url(#ribbonGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
          filter="url(#glowEffect)"
        />

        {/* Speed Arrow Head */}
        <circle cx="100" cy="36" r="7" fill="#FACC15" />
        <circle cx="100" cy="36" r="3" fill="#0F172A" />
      </svg>
    ),
  },
  {
    id: 'icon-shield',
    name: 'Rwanda Hill Shield',
    tagline: 'Bold Commuter & Moto Emblem',
    description:
      'A commanding shield emblem with national color stripes, golden sunburst, and high-velocity road curves.',
    svg: (
      <svg viewBox="0 0 120 120" className="w-full h-full rounded-[26%] shadow-2xl">
        <defs>
          <linearGradient id="shieldBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="amberGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        <rect width="120" height="120" fill="url(#shieldBg)" />

        {/* Shield Outer Outline */}
        <path
          d="M 60 18 C 82 18, 98 26, 98 48 C 98 78, 74 96, 60 104 C 46 96, 22 78, 22 48 C 22 26, 38 18, 60 18 Z"
          fill="#1E293B"
          stroke="#3B82F6"
          strokeWidth="2.5"
        />

        {/* Rwanda Color Accents Inside Shield */}
        <path
          d="M 32 45 C 45 42, 75 42, 88 45 L 88 56 C 75 53, 45 53, 32 56 Z"
          fill="#00A3E0"
        />
        <path
          d="M 32 58 C 45 55, 75 55, 88 58 L 88 68 C 75 65, 45 65, 32 68 Z"
          fill="#FACC15"
        />
        <path
          d="M 32 70 C 45 67, 75 67, 88 70 L 84 78 C 72 82, 48 82, 36 78 Z"
          fill="#10B981"
        />

        {/* Upward Fast Navigation Chevron */}
        <path
          d="M 60 30 L 76 50 L 60 44 L 44 50 Z"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="1"
        />
      </svg>
    ),
  },
];
