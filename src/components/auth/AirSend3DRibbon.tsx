'use client';

import React from 'react';

/**
 * 3D-styled twisting ribbon brand mark matching the Windows 11 / Fluent aesthetic
 * from the user's reference design, with soft ambient shadows and smooth floating animation.
 */
export function AirSend3DRibbon({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center select-none py-1">
      {/* Floating 3D Ribbon Graphic */}
      <div className={`relative ${className} animate-float-slow transition-transform`}>
        <svg
          viewBox="0 0 160 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,120,212,0.22)] dark:drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* Top Loop Gradient */}
            <linearGradient id="topLoopGrad" x1="20" y1="20" x2="140" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f8fafc" />
              <stop offset="85%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Twist Shadow / Underside Gradient */}
            <linearGradient id="twistShadeGrad" x1="70" y1="40" x2="130" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="80%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Bottom Loop Gradient */}
            <linearGradient id="bottomLoopGrad" x1="140" y1="110" x2="20" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#f1f5f9" />
              <stop offset="80%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Blue Tint Accent Highlight */}
            <linearGradient id="azureGlow" x1="0" y1="0" x2="160" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0078d4" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#00a4ef" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
            </linearGradient>

            {/* Ambient Occlusion Filter */}
            <filter id="softOcclusion" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background twist under-layer (depth illusion) */}
          <path
            d="M 68,54 C 84,40 120,42 128,62 C 132,74 116,92 92,94 L 62,88 C 50,84 48,70 58,62 Z"
            fill="url(#twistShadeGrad)"
            opacity="0.9"
          />

          {/* Top Fold Ribbon */}
          <path
            d="M 38,42 C 38,30 50,22 66,22 L 114,22 C 128,22 136,32 130,46 L 102,68 C 94,74 80,76 70,72 L 46,62 C 40,58 38,50 38,42 Z"
            fill="url(#topLoopGrad)"
            filter="url(#softOcclusion)"
          />

          {/* Azure gloss highlight overlay for top fold */}
          <path
            d="M 38,42 C 38,30 50,22 66,22 L 114,22 C 128,22 136,32 130,46 L 102,68 C 94,74 80,76 70,72 L 46,62 C 40,58 38,50 38,42 Z"
            fill="url(#azureGlow)"
          />

          {/* Bottom Twist Fold Ribbon */}
          <path
            d="M 122,98 C 122,110 110,118 94,118 L 46,118 C 32,118 24,108 30,94 L 58,72 C 66,66 80,64 90,68 L 114,78 C 120,82 122,90 122,98 Z"
            fill="url(#bottomLoopGrad)"
            filter="url(#softOcclusion)"
          />

          {/* Azure gloss highlight overlay for bottom fold */}
          <path
            d="M 122,98 C 122,110 110,118 94,118 L 46,118 C 32,118 24,108 30,94 L 58,72 C 66,66 80,64 90,68 L 114,78 C 120,82 122,90 122,98 Z"
            fill="url(#azureGlow)"
          />

          {/* Inner core ribbon curl (center twist joint) */}
          <path
            d="M 58,62 C 65,58 82,60 92,72 C 98,80 92,88 82,88 C 72,88 64,80 58,70 Z"
            fill="#e2e8f0"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* Floating Ground Shadow */}
      <div className="w-20 h-2.5 bg-black/15 dark:bg-black/50 rounded-full blur-md animate-shadow-scale mt-1.5" />
    </div>
  );
}
