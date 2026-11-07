import React from 'react';

interface SilhouetteIconProps {
  type: 'rectangle' | 'pear' | 'hourglass' | 'apple';
  isTarget?: boolean;
  className?: string;
}

export const SilhouetteIcon: React.FC<SilhouetteIconProps> = ({
  type,
  isTarget = false,
  className = 'w-16 h-28',
}) => {
  const strokeColor = isTarget ? '#9F1239' : '#475569';
  const fillColor = isTarget ? '#FFE4E6' : '#F1F5F9';

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        {/* Head */}
        <circle cx="50" cy="22" r="12" fill={fillColor} stroke={strokeColor} strokeWidth="2.5" />
        {/* Neck */}
        <path d="M46 34V40H54V34" stroke={strokeColor} strokeWidth="2" />

        {type === 'rectangle' && (
          // Rectangle: athletic, straight lines
          <path
            d="M36 44C36 44 38 66 38 88C38 110 39 122 41 146L44 172H49L49 116H51L51 172H56L59 146C61 122 62 110 62 88C62 66 64 44 64 44L50 44L36 44Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {type === 'pear' && (
          // Pear: narrower shoulders, wider hips
          <path
            d="M38 44C38 44 39 66 36 84C33 102 28 118 32 142L36 172H43L46 116H54L57 172H64L68 142C72 118 67 102 64 84C61 66 62 44 62 44L50 44L38 44Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {type === 'hourglass' && (
          // Hourglass: balanced bust & hips, defined waist
          <path
            d="M34 44C34 44 35 62 42 78C43 80 43 84 41 88C35 100 30 114 34 142L38 172H45L48 116H52L55 172H62L66 142C70 114 65 100 59 88C57 84 57 80 58 78C65 62 66 44 66 44L50 44L34 44Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {type === 'apple' && (
          // Apple: softer, rounded midsection
          <path
            d="M37 44C37 44 35 64 34 82C33 100 34 116 38 142L42 172H48L49 116H51L52 172H58L62 142C66 116 67 100 66 82C65 64 63 44 63 44L50 44L37 44Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
};
