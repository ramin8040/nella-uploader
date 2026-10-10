'use client';

import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number; // Outer width & height in px
  strokeWidth?: number;
  cornerRadius?: number; // Rounded corner radius in px
  primaryColor?: string;
  children: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 142,
  strokeWidth = 3.5,
  cornerRadius = 28,
  primaryColor = '#e08d3c',
  children,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const half = size / 2;
  const pad = strokeWidth / 2;
  const top = pad;
  const bottom = size - pad;
  const left = pad;
  const right = size - pad;
  const w = right - left;
  const r = Math.min(cornerRadius, w / 2 - 1);

  // Exact mathematical perimeter of the rounded square
  const perimeter = 4 * (w - 2 * r) + 2 * Math.PI * r;
  const strokeDashoffset = perimeter - (clampedProgress / 100) * perimeter;

  // Clockwise rounded square path starting from the top center
  const pathData = `M ${half} ${top} H ${right - r} A ${r} ${r} 0 0 1 ${right} ${top + r} V ${bottom - r} A ${r} ${r} 0 0 1 ${right - r} ${bottom} H ${left + r} A ${r} ${r} 0 0 1 ${left} ${bottom - r} V ${top + r} A ${r} ${r} 0 0 1 ${left + r} ${top} Z`;

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* SVG Rounded Square Progress Frame */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track rounded square */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(0, 0, 0, 0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active progress stroke rounded square */}
        <path
          d={pathData}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={perimeter}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.25s ease-out, stroke 0.3s ease',
          }}
        />
      </svg>

      {/* Inner Container holding Rounded Square Logo / Artwork */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
