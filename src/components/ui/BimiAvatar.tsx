'use client';

import React, { useState } from 'react';
import { Avatar } from './avatar';
import { getBimiLogoUrl } from '@/lib/bimiUtils';
import { useCachedImage } from '@/lib/storage/imageCache';
import { cn } from '@/lib/utils';

interface BimiAvatarProps {
  name: string;
  email?: string;
  explicitLogo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function BimiAvatar({
  name,
  email = '',
  explicitLogo,
  size = 'md',
  className,
}: BimiAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getBimiLogoUrl(email, explicitLogo);
  const cachedLogoUrl = useCachedImage(logoUrl);

  const sizeClasses = {
    sm: 'w-6 h-6 rounded-full',
    md: 'w-8 h-8 rounded-full',
    lg: 'w-10 h-10 rounded-full',
    xl: 'w-14 h-14 rounded-full',
  }[size];

  if (logoUrl && !hasError) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 shadow-2xs flex items-center justify-center p-0.5',
          sizeClasses,
          className
        )}
      >
        <img
          src={cachedLogoUrl || logoUrl}
          alt={name || email}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain rounded-full"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <Avatar
      name={name || email}
      size={size === 'xl' ? 'lg' : size}
      className={cn(size === 'xl' && 'w-14 h-14 text-xl font-bold', className)}
    />
  );
}
