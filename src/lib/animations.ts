import { Variants } from 'framer-motion'

// ========== GPU-OPTIMIZED BASE TRANSITIONS ==========
export const spring = { type: "spring", stiffness: 400, damping: 30 }
export const springBouncy = { type: "spring", stiffness: 500, damping: 25, mass: 0.8 }
export const springSmooth = { type: "spring", stiffness: 200, damping: 40 }
export const easeOutExpo = [0.16, 1, 0.3, 1] as const

// ========== FADE VARIANTS ==========
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: easeOutExpo } },
  exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.3 } }
}

export const fadeIn: Variants = {
  initial: { opacity: 0, filter: "blur(4px)" },
  animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.4, ease: easeOutExpo } },
  exit: { opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } }
}

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.4, ease: easeOutExpo } },
  exit: { opacity: 0, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.2 } }
}

// ========== STAGGER SYSTEM ==========
export const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: easeOutExpo } },
}

export const staggerListItem: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOutExpo } },
}

// ========== HOVER & TAP ==========
export const scaleOnHover: Variants = {
  hover: { scale: 1.03, transition: spring },
  tap: { scale: 0.97, transition: spring }
}

export const liftOnHover = {
  hover: { y: -3, boxShadow: "0 12px 40px -8px hsl(245 82% 67% / 0.2)", transition: spring },
  tap: { y: 0, scale: 0.98, transition: spring }
}

export const glowOnHover = {
  hover: { 
    boxShadow: "0 0 20px hsl(245 82% 67% / 0.25), 0 0 40px hsl(245 82% 67% / 0.1)",
    transition: spring 
  }
}

// ========== SLIDE VARIANTS ==========
export const slideInFromRight: Variants = {
  initial: { x: 80, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: easeOutExpo } },
  exit: { x: 80, opacity: 0, transition: { duration: 0.3 } }
}

export const slideInFromLeft: Variants = {
  initial: { x: -80, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: easeOutExpo } },
  exit: { x: -80, opacity: 0, transition: { duration: 0.3 } }
}

export const slideInFromBottom: Variants = {
  initial: { y: 60, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: easeOutExpo } },
  exit: { y: 60, opacity: 0, transition: { duration: 0.3 } }
}

// ========== 3D PERSPECTIVE VARIANTS ==========
export const perspective3D: Variants = {
  initial: { 
    rotateX: 15, 
    rotateY: -5,
    opacity: 0, 
    scale: 0.92,
    transformPerspective: 1200 
  },
  animate: { 
    rotateX: 0, 
    rotateY: 0,
    opacity: 1, 
    scale: 1,
    transformPerspective: 1200,
    transition: { duration: 0.7, ease: easeOutExpo }
  }
}

export const tilt3DOnHover = {
  hover: { 
    rotateX: -2, 
    rotateY: 3,
    scale: 1.02,
    boxShadow: "0 20px 60px -10px hsl(245 82% 67% / 0.2)",
    transformPerspective: 1200,
    transition: springSmooth
  }
}

export const flip3D: Variants = {
  initial: { rotateY: 90, opacity: 0, transformPerspective: 1200 },
  animate: { rotateY: 0, opacity: 1, transformPerspective: 1200, transition: { duration: 0.6, ease: easeOutExpo } },
  exit: { rotateY: -90, opacity: 0, transformPerspective: 1200, transition: { duration: 0.3 } }
}

// ========== GLASSMORPHISM MOTION ==========
export const glassReveal: Variants = {
  initial: { 
    opacity: 0, 
    backdropFilter: "blur(0px)",
    y: 20,
    scale: 0.97
  },
  animate: { 
    opacity: 1, 
    backdropFilter: "blur(16px)",
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOutExpo }
  }
}

// ========== PAGE TRANSITIONS ==========
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12, filter: "blur(8px)" },
  animate: { 
    opacity: 1, y: 0, filter: "blur(0px)", 
    transition: { duration: 0.5, ease: easeOutExpo, staggerChildren: 0.08 }
  },
  exit: { 
    opacity: 0, y: -8, filter: "blur(8px)",
    transition: { duration: 0.3 }
  }
}

// ========== MAIL SPECIFIC ==========
export const mailCardEnter: Variants = {
  initial: { opacity: 0, x: -8, scale: 0.99 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: easeOutExpo } }
}

export const sidebarSlide: Variants = {
  initial: { x: -280, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: easeOutExpo } },
  exit: { x: -280, opacity: 0, transition: { duration: 0.3 } }
}

