"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover3D?: boolean;
  gradient?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = false,
  hover3D = false,
  gradient = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-4 gpu-accelerate",
        glow && "animate-glow-pulse",
        gradient && "gradient-border",
        hover3D && "hover-lift",
        className
      )}
      whileHover={
        hover3D
          ? {
              rotateX: -1,
              rotateY: 2,
              scale: 1.01,
              transition: { type: "spring", stiffness: 200, damping: 30 },
            }
          : undefined
      }
      style={hover3D ? { transformPerspective: 1200 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
