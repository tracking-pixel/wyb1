import React from 'react';
import { MuscleZone } from '@/src/types/exercise';

interface MuscleSilhouetteProps {
  activeZones: MuscleZone[];
  className?: string;
  size?: number;
}

export const MuscleSilhouette: React.FC<MuscleSilhouetteProps> = ({
  activeZones,
  className = '',
  size = 54,
}) => {
  const isAbdomen = activeZones.includes('abdomen');
  const isPiernas = activeZones.includes('piernas');
  const isGluteos = activeZones.includes('gluteos');
  const isBrazos = activeZones.includes('brazos');
  const isEspalda = activeZones.includes('espalda');
  const isRostro = activeZones.includes('rostro');

  const highlightColor = '#F4A582'; // Durazno accent
  const baseColor = '#D5C4B5';      // Neutral warm sand

  return (
    <div
      className={`relative inline-flex items-center justify-center p-1.5 rounded-xl bg-white/70 backdrop-blur-sm shadow-xs border border-white/80 ${className}`}
      title={`Zonas activas: ${activeZones.join(', ')}`}
    >
      <svg
        width={size}
        height={size * 1.5}
        viewBox="0 0 100 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head / Rostro */}
        <circle
          cx="50"
          cy="18"
          r="10"
          fill={isRostro ? highlightColor : baseColor}
          className={isRostro ? 'animate-pulse' : ''}
        />

        {/* Neck */}
        <rect x="47" y="27" width="6" height="5" rx="2" fill={baseColor} />

        {/* Shoulders & Arms */}
        <path
          d="M32 35 C28 48 24 64 22 80 C23 82 27 82 28 80 C30 66 34 50 38 38 Z"
          fill={isBrazos ? highlightColor : baseColor}
          className={isBrazos ? 'animate-pulse' : ''}
        />
        <path
          d="M68 35 C72 48 76 64 78 80 C77 82 73 82 72 80 C70 66 66 50 62 38 Z"
          fill={isBrazos ? highlightColor : baseColor}
          className={isBrazos ? 'animate-pulse' : ''}
        />

        {/* Upper Torso / Espalda */}
        <path
          d="M36 32 C43 31 57 31 64 32 C65 44 64 54 62 60 C55 61 45 61 38 60 C36 54 35 44 36 32 Z"
          fill={isEspalda ? highlightColor : baseColor}
          className={isEspalda ? 'animate-pulse' : ''}
        />

        {/* Core / Abdomen */}
        <path
          d="M38 58 C44 59 56 59 62 58 C61 68 62 76 64 82 C55 84 45 84 36 82 C38 76 39 68 38 58 Z"
          fill={isAbdomen ? highlightColor : baseColor}
          className={isAbdomen ? 'animate-pulse' : ''}
        />

        {/* Glúteos / Pelvis */}
        <path
          d="M35 80 C44 82 56 82 65 80 C67 88 66 94 62 98 C54 99 46 99 38 98 C34 94 33 88 35 80 Z"
          fill={isGluteos ? highlightColor : baseColor}
          className={isGluteos ? 'animate-pulse' : ''}
        />

        {/* Legs / Piernas */}
        <path
          d="M37 96 C40 108 41 122 41 144 C37 144 35 142 34 136 C33 120 32 106 35 96 Z"
          fill={isPiernas ? highlightColor : baseColor}
          className={isPiernas ? 'animate-pulse' : ''}
        />
        <path
          d="M63 96 C60 108 59 122 59 144 C63 144 65 142 66 136 C67 120 68 106 65 96 Z"
          fill={isPiernas ? highlightColor : baseColor}
          className={isPiernas ? 'animate-pulse' : ''}
        />
      </svg>
      <div className="absolute -bottom-1 text-[9px] font-medium text-[#8B1E3F] tracking-tight whitespace-nowrap bg-white/90 px-1 rounded-sm">
        {activeZones[0] || 'Zonas'}
      </div>
    </div>
  );
};
