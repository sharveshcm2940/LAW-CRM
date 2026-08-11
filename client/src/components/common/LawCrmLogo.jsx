import React from 'react';

/**
 * Bespoke, Rich Emblem Logo for NR Elango Law Associates (LexOS)
 * Combines Scales of Justice, High Court Columns, and Executive Emblem Ring.
 */
export default function LawCrmLogo({ className = 'w-8 h-8', showText = false, textClassName = '' }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Dark & Metallic Gradients */}
            <linearGradient id="crestRingDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>

          {/* Outer Geometric Emblem Octagon / Shield Ring */}
          <polygon
            points="50,4 85,18 96,50 85,82 50,96 15,82 4,50 15,18"
            fill="url(#crestRingDark)"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-700 dark:text-slate-300"
          />

          {/* Inner Pillars of Law Base */}
          <path
            d="M 30 78 L 70 78 M 35 74 L 65 74 M 32 78 L 32 68 M 44 78 L 44 68 M 56 78 L 56 68 M 68 78 L 68 68"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-slate-800 dark:text-slate-200"
          />

          {/* Central Scales of Justice Pillar */}
          <line
            x1="50"
            y1="22"
            x2="50"
            y2="70"
            stroke="url(#silverGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Scales Top Beam */}
          <path
            d="M 22 36 L 50 26 L 78 36"
            stroke="url(#silverGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Scales Finial Crown Dot */}
          <circle cx="50" cy="20" r="5" fill="url(#silverGradient)" />

          {/* Left Scale Pan Strings & Bowl */}
          <line x1="22" y1="36" x2="14" y2="54" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
          <line x1="22" y1="36" x2="30" y2="54" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
          <path d="M 12 54 Q 22 62 32 54 Z" fill="url(#goldGradient)" />

          {/* Right Scale Pan Strings & Bowl */}
          <line x1="78" y1="36" x2="70" y2="54" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
          <line x1="78" y1="36" x2="86" y2="54" stroke="currentColor" strokeWidth="1.5" className="text-slate-400" />
          <path d="M 68 54 Q 78 62 88 54 Z" fill="url(#goldGradient)" />
        </svg>
      </div>

      {showText && (
        <div className={`overflow-hidden ${textClassName}`}>
          <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            NR Elango <span className="font-semibold text-slate-600 dark:text-slate-400">LAW ASSOCIATES</span>
          </div>
          <div className="text-[9px] tracking-widest uppercase font-semibold text-slate-500 dark:text-slate-400">
            CHAMBERS OPERATING SYSTEM
          </div>
        </div>
      )}
    </div>
  );
}
