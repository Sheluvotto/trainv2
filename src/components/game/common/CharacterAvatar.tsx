"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface CharacterAvatarProps {
  className?: string;
  level: number;
  showLevel?: boolean;
  glowColor?: 'blue' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export function CharacterAvatar({
  className,
  level,
  showLevel = true,
  glowColor = 'blue',
  size = 'md'
}: CharacterAvatarProps) {
  // Determine the glow color
  const glowStyles = {
    blue: 'shadow-[0_0_15px_rgba(0,212,255,0.5)]',
    purple: 'shadow-[0_0_15px_rgba(149,76,233,0.5)]',
    red: 'shadow-[0_0_15px_rgba(239,68,68,0.5)]'
  };

  // Determine the size
  const sizeStyles = {
    sm: 'w-20 h-24',
    md: 'w-32 h-40',
    lg: 'w-48 h-60'
  };

  // Add a level indicator that changes with level
  const getLevelIndicator = () => {
    if (level < 5) return 'E-Rank';
    if (level < 10) return 'D-Rank';
    if (level < 20) return 'C-Rank';
    if (level < 35) return 'B-Rank';
    if (level < 50) return 'A-Rank';
    return 'S-Rank';
  };

  const levelColor = {
    'E-Rank': 'text-[#66D9EF]',
    'D-Rank': 'text-gray-300',
    'C-Rank': 'text-yellow-400',
    'B-Rank': 'text-blue-400',
    'A-Rank': 'text-red-500',
    'S-Rank': 'text-purple-400'
  }[getLevelIndicator()];

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className={cn(
        "relative rounded overflow-hidden bg-gradient-to-b from-[#0a1520] to-[#061525]",
        "border border-[#00d4ff40]",
        glowStyles[glowColor],
        sizeStyles[size]
      )}>
        {/* Character silhouette */}
        <div className="absolute inset-0 flex items-end justify-center">
          <div className="w-3/4 h-5/6 bg-[#080e1a]" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)' }}>
            {/* Shoulder lines */}
            <div className="absolute top-3 left-1/4 w-1/2 h-0.5 bg-[#00d4ff30]"></div>
            <div className="absolute top-5 left-1/5 w-3/5 h-0.5 bg-[#00d4ff20]"></div>
          </div>
        </div>

        {/* Ranking level */}
        {showLevel && (
          <div className="absolute top-2 right-2 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            <span className={levelColor}>{level}</span>
          </div>
        )}

        {/* Scan lines */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.2) 2px, rgba(0, 212, 255, 0.2) 4px)',
            backgroundSize: '100% 4px'
          }}>
        </div>

        {/* Bottom glow effect */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#00d4ff30] to-transparent"></div>
      </div>

      {/* Rank display */}
      {showLevel && (
        <div className={cn("mt-2 text-xs font-bold px-2 py-1 bg-black/40 border border-[#192844]", levelColor)}>
          {getLevelIndicator()}
        </div>
      )}
    </div>
  );
}
