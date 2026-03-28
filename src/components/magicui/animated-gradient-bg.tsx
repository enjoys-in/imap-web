"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface AnimatedGradientBgProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientBg({ children, className }: AnimatedGradientBgProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] animate-spin-slow opacity-[0.03]">
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary blur-[120px]" />
        </div>
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-primary/5 blur-[100px] animate-morph" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-500/5 blur-[80px] animate-float" />
        <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-cyan-500/5 blur-[60px] animate-float" style={{ animationDelay: "-3s" }} />
      </div>
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
