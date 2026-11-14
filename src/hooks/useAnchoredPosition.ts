'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

interface AnchoredCoordinates {
  top: number;
  left: number;
}

interface UseAnchoredPositionOptions {
  width: number;
  isOpen: boolean;
  gap?: number;
  margin?: number;
}

interface UseAnchoredPositionResult<T extends HTMLElement> {
  anchorRef: RefObject<T | null>;
  menuStyle: CSSProperties;
  measure: () => void;
}

export function useAnchoredPosition<T extends HTMLElement = HTMLElement>({
  width,
  isOpen,
  gap = 4,
  margin = 8,
}: UseAnchoredPositionOptions): UseAnchoredPositionResult<T> {
  const anchorRef = useRef<T>(null);
  const [coordinates, setCoordinates] = useState<AnchoredCoordinates>({ top: 0, left: 0 });

  const measure = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const fitsFromLeft = rect.left + width + margin <= window.innerWidth;
    const preferred = fitsFromLeft ? rect.left : rect.right - width;
    setCoordinates({
      top: rect.bottom + gap,
      left: Math.min(Math.max(margin, preferred), maxLeft),
    });
  }, [width, gap, margin]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isOpen, measure]);

  const menuStyle: CSSProperties = {
    position: 'fixed',
    top: coordinates.top,
    left: coordinates.left,
    width,
    maxWidth: `calc(100vw - ${margin * 2}px)`,
  };

  return { anchorRef, menuStyle, measure };
}
