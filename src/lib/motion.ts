/**
 * Framer Motion spring configs and animation variants.
 * All animations use spring physics — never cubic-bezier for transitions.
 */

// ─── Spring Configs ──────────────────────────────────────────────────────────

/** Snappy — buttons, toggles */
export const springSnappy = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 35,
};

/** Smooth — cards, panels */
export const springSmooth = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

/** Gentle — modals, overlays */
export const springGentle = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 28,
};

/** Bouncy — vote animations, success states */
export const springBouncy = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 20,
  restDelta: 0.001,
};

// ─── Animation Variants ──────────────────────────────────────────────────────

/** Modal enter/exit */
export const modalVariants = {
  hidden: { scale: 0.96, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: springGentle },
  exit: { scale: 0.96, opacity: 0, transition: { duration: 0.15 } },
};

/** Modal overlay */
export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** Toast slide in from bottom-right */
export const toastVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springSnappy },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

/** Feed item stagger */
export const feedItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.03, 0.24), // max 8 items staggered, beyond instant
      duration: 0.2,
      ease: [0.0, 0.0, 0.2, 1.0],
    },
  }),
};

export const feedContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0 },
  },
};

/** Upvote button — bouncy scale */
export const upvoteVariants = {
  idle: { scale: 1 },
  voted: {
    scale: [1, 0.85, 1.2, 1],
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
  },
};

/** Number counter — vertical flip on change */
export const counterVariants = {
  enter: { y: -10, opacity: 0 },
  center: { y: 0, opacity: 1, transition: springSnappy },
  exit: { y: 10, opacity: 0, transition: { duration: 0.1 } },
};

/** Sidebar item hover */
export const sidebarItemVariants = {
  rest: { x: 0 },
  hover: { x: 2, transition: springSnappy },
};

/** Dropdown menu */
export const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springSnappy },
  exit: { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.1 } },
};
