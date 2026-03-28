"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDuration: number;
  animationDelay: number;
}

interface StarFieldProps {
  className?: string;
  count?: number;
}

export function StarField({ className, count = 80 }: StarFieldProps) {
  const stars = React.useMemo<Star[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      animationDuration: Math.random() * 4 + 2,
      animationDelay: Math.random() * 4,
    }));
  }, [count]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-foreground/80 animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDuration: `${star.animationDuration}s`,
            animationDelay: `${star.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
}
