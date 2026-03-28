"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  radius?: number;
}

export function SpotlightCard({
  children,
  className,
  radius = 350,
  ...props
}: SpotlightCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const spotlightRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number>(0);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !spotlightRef.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = cardRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlightRef.current!.style.background =
        `radial-gradient(${radius}px circle at ${x}px ${y}px, hsl(245 82% 67% / 0.08), transparent 60%)`;
    });
  }, [radius]);

  React.useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative rounded-2xl glass-card overflow-hidden gpu-accelerate",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Spotlight gradient */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 0 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
