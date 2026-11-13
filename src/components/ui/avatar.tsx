'use client';

import React, { useState } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { useCachedImage } from '@/lib/storage/imageCache';

interface AvatarProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
}

const AVATAR_COLORS_MAP: Record<string, string> = {
  GR: 'bg-[#8764b8]', // Gaurav Raj (purple)
  JS: 'bg-[#d13438]', // Jeelan Basha Shaik (crimson)
  C: 'bg-[#ca5010]', // candidate-outreach (orange)
  TG: 'bg-[#a4262c]', // Thales Group (red)
  HR: 'bg-[#0078d4]', // Human Resources (blue)
  J: 'bg-[#8764b8]', // Jacobs (purple)
  OA: 'bg-[#107c41]', // Oracle Acquisition (green)
};

const PALETTE = [
  'bg-[#8764b8]',
  'bg-[#d13438]',
  'bg-[#ca5010]',
  'bg-[#0078d4]',
  'bg-[#107c41]',
  'bg-[#008272]',
  'bg-[#a4262c]',
  'bg-[#004e8c]',
];

function getColorForInitials(initials: string, name: string): string {
  if (AVATAR_COLORS_MAP[initials]) {
    return AVATAR_COLORS_MAP[initials];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

export function Avatar({ name, className, size = 'md', src }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const cachedSrc = useCachedImage(src);
  const initials = getInitials(name);
  const colorClass = getColorForInitials(initials, name);

  const sizeClass = {
    sm: 'w-6 h-6 text-xs font-bold',
    md: 'w-8 h-8 text-xs font-bold',
    lg: 'w-10 h-10 text-sm font-bold',
  }[size];

  if (src && !hasError) {
    return (
      <div className={cn('rounded-full overflow-hidden shrink-0 flex items-center justify-center', sizeClass, className)}>
        <img
          src={cachedSrc || src}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white select-none shrink-0 tracking-tight font-medium',
        colorClass,
        sizeClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
