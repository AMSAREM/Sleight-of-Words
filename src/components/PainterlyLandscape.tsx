import React from 'react';

interface PainterlyLandscapeProps {
  variant?: 'sunset' | 'twilight' | 'parlor';
  className?: string;
  showDetails?: boolean;
}

export const PainterlyLandscape: React.FC<PainterlyLandscapeProps> = ({
  className = '',
  showDetails = true
}) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
    >
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 1000 1600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient: Deep violet twilight down to warm peach/orange sunset */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="30%" stopColor="#6366F1" />
            <stop offset="55%" stopColor="#818CF8" />
            <stop offset="75%" stopColor="#FB7185" />
            <stop offset="90%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#FED7AA" />
          </linearGradient>

          {/* Sunset Sun Glow */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
            <stop offset="35%" stopColor="#FDE68A" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#FB923C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </radialGradient>

          {/* Water reflection gradient */}
          <linearGradient id="waterGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="25%" stopColor="#FB923C" />
            <stop offset="55%" stopColor="#38BDF8" />
            <stop offset="85%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Coastal Bluffs Gradients */}
          <linearGradient id="distantHills" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4338CA" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="midCliffs" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3730A3" />
            <stop offset="60%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          <linearGradient id="foregroundCliffs" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0B0F2A" />
          </linearGradient>

          {/* Lighthouse beam gradient */}
          <linearGradient id="lightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
          </linearGradient>

          {/* Soft cloud filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. SKY LAYER */}
        <rect width="1000" height="1600" fill="url(#skyGrad)" />

        {/* Radiant Sunset Sun Beams */}
        <g opacity="0.4">
          <polygon points="500,880 150,0 260,0" fill="#FFF7ED" opacity="0.25" />
          <polygon points="500,880 380,0 480,0" fill="#FEF08A" opacity="0.3" />
          <polygon points="500,880 580,0 680,0" fill="#FEF08A" opacity="0.3" />
          <polygon points="500,880 780,0 900,0" fill="#FFF7ED" opacity="0.2" />
          <polygon points="500,880 0,200 0,350" fill="#FED7AA" opacity="0.25" />
          <polygon points="500,880 1000,180 1000,320" fill="#FED7AA" opacity="0.25" />
        </g>

        {/* Soft Sunset Clouds */}
        <g fill="#FBCFE8" opacity="0.45" filter="url(#softGlow)">
          <ellipse cx="280" cy="480" rx="200" ry="24" />
          <ellipse cx="720" cy="540" rx="240" ry="28" />
          <ellipse cx="440" cy="620" rx="180" ry="20" />
          <ellipse cx="850" cy="420" rx="150" ry="18" fill="#FDE68A" opacity="0.4" />
        </g>

        {/* Radiant Sun Sphere at Horizon */}
        <circle cx="500" cy="880" r="160" fill="url(#sunGlow)" />

        {/* 2. DISTANT MOUNTAINS & HORIZON LAYER */}
        <path
          d="M0,860 Q180,820 380,850 T750,840 Q880,825 1000,855 L1000,980 L0,980 Z"
          fill="url(#distantHills)"
          opacity="0.75"
        />

        {/* Distant islands on water */}
        <ellipse cx="620" cy="885" rx="55" ry="10" fill="#312E81" opacity="0.8" />
        <ellipse cx="410" cy="890" rx="40" ry="8" fill="#3730A3" opacity="0.7" />

        {/* 3. SERENE WATER & WINDING RIVER REFLECTION LAYER */}
        <path
          d="M0,870 L1000,870 L1000,1600 L0,1600 Z"
          fill="url(#waterGrad)"
        />

        {/* Sun reflection path on water surface */}
        <polygon
          points="500,875 440,940 400,1050 320,1200 240,1400 160,1600 840,1600 760,1400 680,1200 600,1050 560,940"
          fill="#FED7AA"
          opacity="0.32"
        />

        {/* Rippling shimmer lines */}
        <g stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" opacity="0.45">
          <line x1="470" y1="895" x2="530" y2="895" />
          <line x1="440" y1="920" x2="560" y2="920" />
          <line x1="420" y1="950" x2="580" y2="950" />
          <line x1="390" y1="990" x2="610" y2="990" />
          <line x1="360" y1="1040" x2="640" y2="1040" />
          <line x1="320" y1="1100" x2="680" y2="1100" />
          <line x1="280" y1="1180" x2="720" y2="1180" />
          <line x1="240" y1="1280" x2="760" y2="1280" />
        </g>

        {/* 4. MIDGROUND: COASTAL CLIFFS & LIGHTHOUSE */}
        {/* Left bluff */}
        <path
          d="M0,910 Q140,920 220,970 Q300,1020 320,1080 Q180,1110 0,1140 Z"
          fill="url(#midCliffs)"
        />

        {/* Right coastal cliff bluff with Lighthouse (Screen 4 reference!) */}
        <path
          d="M1000,890 Q850,910 780,950 Q710,990 680,1050 Q660,1120 710,1200 Q780,1290 850,1360 L1000,1400 Z"
          fill="url(#midCliffs)"
        />

        {showDetails && (
          <>
            {/* The Iconic Word Lanes Lighthouse on the cliff */}
            <g transform="translate(790, 840)">
              {/* Foundation Rock */}
              <ellipse cx="20" cy="115" rx="35" ry="12" fill="#1E1B4B" />

              {/* Lighthouse Tower Body */}
              <polygon
                points="12,40 28,40 34,110 6,110"
                fill="#FFF7E3"
                stroke="#182453"
                strokeWidth="2"
              />
              {/* Red Stripes on Tower */}
              <polygon points="10,60 30,60 31,76 9,76" fill="#E7364B" />
              <polygon points="8,92 32,92 33,106 7,106" fill="#E7364B" />

              {/* Lantern Room Platform & Dome */}
              <rect x="8" y="32" width="24" height="8" rx="2" fill="#182453" />
              <rect x="11" y="22" width="18" height="10" fill="#FEF08A" stroke="#182453" strokeWidth="1.5" />
              <path d="M10,22 Q20,10 30,22 Z" fill="#E7364B" stroke="#182453" strokeWidth="1.5" />
              <circle cx="20" cy="8" r="2.5" fill="#FFD467" />

              {/* Sweeping Light Beam into the Sunset Water */}
              <polygon
                points="20,27 -600,-40 -500,240"
                fill="url(#lightBeam)"
                opacity="0.5"
              />
            </g>

            {/* Charming Sailboat in the bay */}
            <g transform="translate(260, 980)">
              {/* Hull */}
              <path d="M0,14 Q20,20 45,14 L40,8 L5,8 Z" fill="#FFF7E3" stroke="#182453" strokeWidth="1.5" />
              {/* Mast */}
              <line x1="22" y1="8" x2="22" y2="-18" stroke="#182453" strokeWidth="2" />
              {/* Mainsail */}
              <polygon points="22,-16 22,6 38,4" fill="#FFF7E3" opacity="0.95" stroke="#182453" strokeWidth="1" />
              {/* Jib sail */}
              <polygon points="20,-14 20,6 8,6" fill="#F58A12" opacity="0.9" stroke="#182453" strokeWidth="1" />
            </g>
          </>
        )}

        {/* 5. FOREGROUND SILHOUETTES: REEDS, WILD FLOWERS & GRASSES (Screen 4) */}
        {/* Lower winding shores */}
        <path
          d="M0,1320 Q200,1310 380,1370 Q540,1420 620,1500 Q700,1580 800,1600 L0,1600 Z"
          fill="url(#foregroundCliffs)"
          opacity="0.95"
        />

        {/* Tall wild grasses & reeds silhouettes on left */}
        <g stroke="#090D22" strokeWidth="3" strokeLinecap="round" fill="none">
          {/* Group 1: Bottom left reeds */}
          <path d="M30,1600 Q45,1500 20,1420" />
          <path d="M45,1600 Q65,1480 90,1400" />
          <path d="M70,1600 Q80,1510 65,1440" />
          <path d="M95,1600 Q120,1490 145,1430" />
          <path d="M125,1600 Q140,1520 160,1460" />

          {/* Seed heads / Cattail plumes */}
          <ellipse cx="20" cy="1415" rx="6" ry="16" fill="#090D22" stroke="none" transform="rotate(-15 20 1415)" />
          <ellipse cx="90" cy="1395" rx="6" ry="18" fill="#090D22" stroke="none" transform="rotate(18 90 1395)" />
          <ellipse cx="145" cy="1425" rx="5" ry="14" fill="#090D22" stroke="none" transform="rotate(22 145 1425)" />

          {/* Group 2: Right foreground flowers & blades */}
          <path d="M920,1600 Q900,1510 880,1430" />
          <path d="M950,1600 Q940,1490 920,1410" />
          <path d="M975,1600 Q970,1510 965,1440" />
          <ellipse cx="880" cy="1425" rx="6" ry="16" fill="#090D22" stroke="none" transform="rotate(-12 880 1425)" />
          <ellipse cx="920" cy="1405" rx="6" ry="17" fill="#090D22" stroke="none" transform="rotate(-10 920 1405)" />
        </g>

        {/* Ambient fireflies / magical motes */}
        <g fill="#FEF08A">
          <circle cx="80" cy="1380" r="3" opacity="0.8" />
          <circle cx="150" cy="1350" r="2.5" opacity="0.6" />
          <circle cx="210" cy="1420" r="3.5" opacity="0.9" />
          <circle cx="750" cy="1340" r="3" opacity="0.75" />
          <circle cx="890" cy="1360" r="2.5" opacity="0.8" />
          <circle cx="580" cy="1430" r="4" opacity="0.85" />
        </g>
      </svg>
    </div>
  );
};
