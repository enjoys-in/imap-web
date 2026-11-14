'use client';

import React from 'react';

/**
 * Animated Windows 11 Fluent Bloom / Fluid Blue Silk Backdrop
 * Recreates the iconic flowing cobalt/azure ribbon background seen in the reference screenshot.
 */
export function FluentBloomBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Base Canvas Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#051124] to-[#020713] dark:from-[#030712] dark:via-[#050f24] dark:to-[#01040a] transition-colors duration-700" />

      {/* Primary Floating Ambient Silk Ribbon 1 (Top-Right Bloom) */}
      <div className="absolute -top-[15%] -right-[10%] w-[650px] h-[650px] md:w-[850px] md:h-[850px] rounded-full opacity-60 dark:opacity-45 blur-[80px] md:blur-[110px] animate-bloom-1">
        <div className="w-full h-full bg-gradient-to-tr from-[#005a9e] via-[#0078d4] to-[#00b4d8] rounded-full" />
      </div>

      {/* Secondary Floating Ambient Silk Ribbon 2 (Bottom-Left Bloom) */}
      <div className="absolute -bottom-[20%] -left-[15%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full opacity-55 dark:opacity-40 blur-[90px] md:blur-[120px] animate-bloom-2">
        <div className="w-full h-full bg-gradient-to-bl from-[#002d62] via-[#004e8c] to-[#0078d4] rounded-full" />
      </div>

      {/* Center Dynamic Glow (behind the glass modal) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full opacity-35 dark:opacity-25 blur-[100px] pointer-events-none bg-[radial-gradient(ellipse_at_center,#00a4ef_0%,#005a9e_50%,transparent_75%)]" />

      {/* Subtle Blueprint Mesh Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Windows 11 Fluent Silk Curve Overlay (SVG Waves) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 dark:opacity-25"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="silkGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0078d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#005a9e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#001830" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silkGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00c7fd" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#0078d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#002045" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M 1440,0 C 1200,180 900,120 720,280 C 540,440 380,720 0,900 L 1440,900 Z"
          fill="url(#silkGrad1)"
        />
        <path
          d="M 1440,240 C 1150,320 950,220 780,410 C 620,580 420,780 0,850 L 0,900 L 1440,900 Z"
          fill="url(#silkGrad2)"
        />
      </svg>
    </div>
  );
}
