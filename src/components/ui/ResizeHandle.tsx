'use client';

import React, { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
  onResize: (deltaX: number) => void;
  onDoubleClick?: () => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  className?: string;
  title?: string;
}

export function ResizeHandle({
  onResize,
  onDoubleClick,
  onResizeStart,
  onResizeEnd,
  className,
  title = 'Drag to resize pane (double-click to reset)',
}: ResizeHandleProps) {
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      if (onResizeStart) onResizeStart();

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = moveEvent.clientX - startXRef.current;
        startXRef.current = moveEvent.clientX;
        onResize(deltaX);
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
    [onResize, onResizeStart, onResizeEnd]
  );

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      title={title}
      className={cn(
        'hidden md:block w-1.5 -mx-0.5 relative z-20 cursor-col-resize select-none shrink-0 group transition-colors',
        className
      )}
    >
      <div className="w-full h-full bg-transparent group-hover:bg-[#0078d4]/70 group-active:bg-[#0078d4] transition-colors" />
    </div>
  );
}
