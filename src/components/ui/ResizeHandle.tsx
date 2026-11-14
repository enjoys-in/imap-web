'use client';

import React, { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  orientation?: 'vertical' | 'horizontal';
  onDoubleClick?: () => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  className?: string;
  title?: string;
}

export function ResizeHandle({
  onResize,
  orientation = 'vertical',
  onDoubleClick,
  onResizeStart,
  onResizeEnd,
  className,
  title = 'Drag to resize pane (double-click to auto-adjust)',
}: ResizeHandleProps) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef(0);

  const isVertical = orientation === 'vertical';

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      startPosRef.current = isVertical ? e.clientX : e.clientY;
      if (onResizeStart) onResizeStart();

      document.body.style.cursor = isVertical ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const currentPos = isVertical ? moveEvent.clientX : moveEvent.clientY;
        const delta = currentPos - startPosRef.current;
        startPosRef.current = currentPos;
        onResize(delta);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        if (onResizeEnd) onResizeEnd();

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onResize, onResizeStart, onResizeEnd, isVertical]
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      title={title}
      className={cn(
        'hidden md:block relative z-20 select-none shrink-0 group transition-colors',
        isVertical
          ? 'w-1.5 -mx-0.5 h-full cursor-col-resize'
          : 'h-1.5 -my-0.5 w-full cursor-row-resize',
        className
      )}
    >
      <div
        className={cn(
          'w-full h-full bg-transparent group-hover:bg-[#0078d4]/70 group-active:bg-[#0078d4] transition-colors',
          isVertical ? 'border-r border-transparent' : 'border-b border-transparent'
        )}
      />
    </div>
  );
}
