import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  hideText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  iconSize = 32,
  textSize = 'text-xl',
  hideText = false
}) => {
  return (
    <div className={`flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Hand-crafted matching SVG logo from image */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Left vertical bar of the 'H' */}
        <rect x="22" y="15" width="12" height="70" rx="3" fill="url(#leftBarGrad)" />
        {/* Right vertical bar of the 'H' */}
        <rect x="66" y="15" width="12" height="70" rx="3" fill="#334155" />
        
        {/* Curved blue arrow swooping from left center up to top right */}
        <path
          d="M 12,65 C 24,63 46,55 58,40"
          stroke="url(#arrowGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        
        {/* Curved upward swoosh extending from left-mid crossing over right bar */}
        <path
          d="M 28,50 C 45,45 64,30 72,12"
          stroke="url(#arrowGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Arrow head */}
        <path
          d="M 58,13 L 74,10 L 73,26 Z"
          fill="url(#arrowGrad)"
          stroke="url(#arrowGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient id="leftBarGrad" x1="28" y1="15" x2="28" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="arrowGrad" x1="20" y1="50" x2="75" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
      
      {!hideText && (
        <span className={`font-semibold tracking-tight text-neutral-800 ${textSize}`}>
          Hyr<span className="text-neutral-900 font-bold">nex</span>
        </span>
      )}
    </div>
  );
};
