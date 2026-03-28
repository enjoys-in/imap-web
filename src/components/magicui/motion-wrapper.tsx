"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import React from "react";

const variants: Record<string, Variants> = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  flip3d: {
    initial: { opacity: 0, rotateY: 30, transformPerspective: 1200 },
    animate: { opacity: 1, rotateY: 0, transformPerspective: 1200 },
    exit: { opacity: 0, rotateY: -30, transformPerspective: 1200 },
  },
};

interface MotionWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof variants;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

export function MotionWrapper({
  children,
  className,
  variant = "fadeUp",
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.3,
}: MotionWrapperProps) {
  return (
    <motion.div
      className={cn("gpu-accelerate", className)}
      variants={variants[variant]}
      initial="initial"
      whileInView="animate"
      exit="exit"
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.06,
  delayChildren = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={{
        animate: {
          transition: { staggerChildren: staggerDelay, delayChildren },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn("gpu-accelerate", className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
