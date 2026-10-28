import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-8 h-8', size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`rounded-xl shadow-lg shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B132B" />
          <stop offset="100%" stopColor="#1C2541" />
        </linearGradient>
        <linearGradient id="logo-pulse" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
        <linearGradient id="logo-route" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Squircle Base */}
      <rect width="120" height="120" rx="30" fill="url(#logo-bg)" />

      {/* Topography Radar Concentric Rings */}
      <circle cx="60" cy="60" r="44" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.6" />
      <circle cx="60" cy="60" r="30" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.4" />
      <circle cx="60" cy="60" r="17" stroke="#F97316" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* Fluid Bypass Highway Route */}
      <path
        d="M 18 96 C 42 82, 50 62, 60 60 C 70 58, 85 45, 102 24"
        stroke="url(#logo-route)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Congestion Branch Detour */}
      <path
        d="M 60 60 C 66 75, 80 85, 96 90"
        stroke="#EF4444"
        strokeWidth="3.5"
        strokeDasharray="3 3"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Glowing Radar Core Beacon */}
      <circle cx="60" cy="60" r="11" fill="url(#logo-pulse)" />
      <circle cx="60" cy="60" r="4" fill="#FFFFFF" />
    </svg>
  );
};
