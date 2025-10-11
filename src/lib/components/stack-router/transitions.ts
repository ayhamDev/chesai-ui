import type { Transition } from 'framer-motion'

// A consistent spring transition for a native feel
const defaultTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 40,
  mass: 0.8,
}

// A standard tween for cross-fade animations
const fadeTransition: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
}

export const STACK_TRANSITIONS = {
  /**
   * Default iOS-style slide animation.
   */
  default: {
    variants: {
      enter: { x: '100%', opacity: 1 },
      center: { x: 0, opacity: 1, scale: 1 },
      behind: { x: '-30%', opacity: 1, scale: 0.95 },
      exit: { x: '100%', opacity: 1, scale: 1 },
      hidden: { opacity: 0, x: 0, transition: { duration: 0 } },
    },
    transition: defaultTransition,
  },

  /**
   * Modal-style presentation from the bottom of the screen.
   */
  'slide-from-bottom': {
    variants: {
      enter: { y: '100%' },
      center: { y: 0 },
      behind: { y: 0, opacity: 0.5, scale: 0.95 },
      exit: { y: '100%' },
      hidden: { opacity: 0, transition: { duration: 0 } },
    },
    transition: defaultTransition,
  },

  /**
   * A simple cross-fade transition.
   */
  fade: {
    variants: {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      behind: { opacity: 0 },
      exit: { opacity: 0 },
      hidden: { opacity: 0, transition: { duration: 0 } },
    },
    transition: fadeTransition,
  },
}
