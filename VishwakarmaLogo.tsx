import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const VishwakarmaEmblem: React.FC<LogoProps> = ({ size = 64, className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="sunburstGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF2A3" />
            <stop offset="45%" stopColor="#DF9B17" />
            <stop offset="100%" stopColor="#9C2706" />
          </radialGradient>
          <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="maroonRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="100%" stopColor="#450A0A" />
          </linearGradient>
        </defs>

        {/* Radiating Sunburst / Flame Petals */}
        <g stroke="#D97706" strokeWidth="1.5">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x1 = 60 + 38 * Math.cos(rad);
            const y1 = 54 + 38 * Math.sin(rad);
            const x2 = 60 + 49 * Math.cos(rad);
            const y2 = 54 + 49 * Math.sin(rad);
            return (
              <path
                key={i}
                d={`M 60 54 L ${x2} ${y2}`}
                stroke={i % 2 === 0 ? '#B45309' : '#D97706'}
                strokeWidth={i % 2 === 0 ? '3.5' : '2'}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Outer Golden Ring */}
        <circle cx="60" cy="54" r="38" fill="url(#maroonRing)" stroke="#F59E0B" strokeWidth="3" />
        <circle cx="60" cy="54" r="34" fill="#0284C7" stroke="#FEF08A" strokeWidth="1.5" />

        {/* Artisan / Deity Motif (Lord Vishwakarma holding celestial compass & carpentry square) */}
        {/* Halo */}
        <circle cx="60" cy="44" r="16" fill="url(#sunburstGrad)" opacity="0.9" />

        {/* Crown / Mukut */}
        <path d="M 52 35 L 56 25 L 60 22 L 64 25 L 68 35 Z" fill="#FCD34D" stroke="#B45309" strokeWidth="0.8" />
        <circle cx="60" cy="28" r="2" fill="#DC2626" />

        {/* Face & Beard */}
        <circle cx="60" cy="40" r="7.5" fill="#FED7AA" />
        <path d="M 56 42 Q 60 48 64 42" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Divine Robe / Seated Artisan */}
        <path d="M 46 64 C 47 50, 52 47, 60 47 C 68 47, 73 50, 74 64 Z" fill="#EA580C" />
        <path d="M 50 64 C 54 53, 66 53, 70 64 Z" fill="#FDE047" opacity="0.7" />

        {/* Artisan Tools: Carpenter's Square & Divine Scroll */}
        {/* Right hand holding architectural compass */}
        <path d="M 72 45 L 82 35 M 82 35 L 86 46 M 77 40 L 84 41" stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round" />
        {/* Left hand holding sacred tool / measuring rule */}
        <path d="M 48 45 L 38 37 M 38 37 L 35 47" stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round" />

        {/* Sacred Lotus Base */}
        <path d="M 42 66 Q 60 74 78 66 Q 60 70 42 66 Z" fill="#F43F5E" stroke="#BE123C" strokeWidth="0.5" />

        {/* Lower Banner Ribbon with "Vishwakarma Interiors" */}
        <path
          d="M 12 90 L 25 82 L 95 82 L 108 90 L 98 102 L 92 98 L 28 98 L 22 102 Z"
          fill="url(#goldRibbon)"
          stroke="#78350F"
          strokeWidth="1.2"
        />
        <path d="M 12 90 L 25 82 L 28 98 Z" fill="#78350F" />
        <path d="M 108 90 L 95 82 L 92 98 Z" fill="#78350F" />
        <rect x="25" y="82" width="70" height="15" fill="#D97706" rx="2" stroke="#FEF08A" strokeWidth="0.8" />
        
        <text
          x="60"
          y="93"
          textAnchor="middle"
          fill="#450A0A"
          fontSize="6.8"
          fontWeight="900"
          letterSpacing="0.4"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          VISHWAKARMA INTERIORS
        </text>
      </svg>
    </div>
  );
};
