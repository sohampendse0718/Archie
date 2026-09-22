"use client";

import { cn } from '@/lib/utils';

interface ArchieLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Show only icon without wordmark */
  iconOnly?: boolean;
}

const sizeMap = {
  sm: { icon: 'w-6 h-6', text: 'text-base font-bold leading-none', gap: 'gap-2' },
  md: { icon: 'w-8 h-8', text: 'text-xl font-bold leading-none', gap: 'gap-2.5' },
  lg: { icon: 'w-10 h-10', text: 'text-2xl font-extrabold leading-none', gap: 'gap-3' },
  xl: { icon: 'w-16 h-16', text: 'text-5xl font-black leading-none', gap: 'gap-4' },
};

export function ArchieIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]", className)}
    >
      <defs>
        {/* Cyan Gradient (Left) */}
        <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Purple Gradient (Right) */}
        <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#D946EF" />
        </linearGradient>

        {/* Combined Horizontal Gradient */}
        <linearGradient id="fullArchieGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>

        {/* Neon Glow Filter */}
        <filter id="neonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#neonGlowFilter)">
        {/* === OUTER 'A' FRAME === */}
        {/* Left Outer Leg (Cyan) */}
        <path
          d="M100 24 L42 165 L66 165 L100 78 Z"
          fill="url(#cyanGlow)"
          stroke="#00F0FF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Right Outer Leg (Purple) */}
        <path
          d="M100 24 L158 165 L134 165 L100 78 Z"
          fill="url(#purpleGlow)"
          stroke="#D946EF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Outer Frame Stiff Outline */}
        <path
          d="M100 20 L35 172 H66 L100 85 L134 172 H165 L100 20 Z"
          stroke="url(#fullArchieGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Inner Apex Triangle Cutout */}
        <path
          d="M100 85 L78 140 H122 Z"
          stroke="url(#fullArchieGrad)"
          strokeWidth="2.5"
          fill="none"
        />

        {/* === INNER LEG CIRCUIT TRACKS & NODES === */}
        {/* Left Leg Inner Parallel Track */}
        <path
          d="M94 48 L62 138"
          stroke="#00F0FF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="86" cy="68" r="4.5" fill="#0B0F19" stroke="#00F0FF" strokeWidth="2.5" />
        <circle cx="74" cy="102" r="4.5" fill="#0B0F19" stroke="#00F0FF" strokeWidth="2.5" />

        {/* Right Leg Inner Parallel Track */}
        <path
          d="M106 48 L138 138"
          stroke="#C084FC"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="114" cy="68" r="4.5" fill="#0B0F19" stroke="#C084FC" strokeWidth="2.5" />
        <circle cx="126" cy="102" r="4.5" fill="#0B0F19" stroke="#C084FC" strokeWidth="2.5" />

        {/* === LEFT SIDE OUTWARD CIRCUIT EXTENSIONS (CYAN) === */}
        {/* Left Upper Extension */}
        <path d="M72 70 H48 V58 H36" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="36" cy="58" r="4.5" fill="#0B0F19" stroke="#00F0FF" strokeWidth="2.5" />

        {/* Left Middle Extension */}
        <path d="M58 105 H30 V92 H18" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="18" cy="92" r="4.5" fill="#0B0F19" stroke="#00F0FF" strokeWidth="2.5" />

        {/* Left Lower Extension */}
        <path d="M48 135 H26 V148 H14" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="148" r="4.5" fill="#0B0F19" stroke="#00F0FF" strokeWidth="2.5" />

        {/* === RIGHT SIDE OUTWARD CIRCUIT EXTENSIONS (PURPLE) === */}
        {/* Right Upper Extension */}
        <path d="M128 70 H152 V58 H164" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="164" cy="58" r="4.5" fill="#0B0F19" stroke="#C084FC" strokeWidth="2.5" />

        {/* Right Middle Extension */}
        <path d="M142 105 H170 V92 H182" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="182" cy="92" r="4.5" fill="#0B0F19" stroke="#C084FC" strokeWidth="2.5" />

        {/* Right Lower Extension */}
        <path d="M152 135 H174 V148 H186" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="186" cy="148" r="4.5" fill="#0B0F19" stroke="#C084FC" strokeWidth="2.5" />

        {/* === CENTER CROSSBAR INTERCONNECTS === */}
        {/* Upper Cross Bar */}
        <path d="M78 115 H100" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M100 115 H122" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="100" cy="115" r="4.5" fill="#0B0F19" stroke="url(#fullArchieGrad)" strokeWidth="2.5" />

        {/* Lower Diagonal Cross Bar */}
        <path d="M70 135 L90 125" stroke="#00F0FF" strokeWidth="2.5" />
        <circle cx="90" cy="125" r="4" fill="#00F0FF" />
        <path d="M90 125 L110 138" stroke="url(#fullArchieGrad)" strokeWidth="2.5" />
        <circle cx="110" cy="138" r="4" fill="#C084FC" />
        <path d="M110 138 L130 135" stroke="#C084FC" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

export default function ArchieLogo({ size = 'md', className, iconOnly = false }: ArchieLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={cn('inline-flex items-center select-none', s.gap, className)}>
      <div className={cn(s.icon, 'shrink-0 flex items-center justify-center')}>
        <ArchieIcon />
      </div>
      {!iconOnly && (
        <span className={cn('tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent', s.text)}>
          Archie
        </span>
      )}
    </div>
  );
}

