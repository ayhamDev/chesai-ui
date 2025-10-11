import type { Transition } from 'framer-motion'
import type { StackAnimation } from './types'

// Professionally calibrated easing curves
const EASING = {
  // Apple's signature ease - perfect for iOS-style interactions
  apple: [0.28, 0, 0.2, 1],
  // Google Material - balanced and predictable
  material: [0.4, 0, 0.2, 1],
  // Emphasized deceleration - powerful entry, gentle landing
  emphasized: [0.05, 0.7, 0.1, 1],
  // Silk smooth - symmetric and luxurious
  silk: [0.65, 0, 0.35, 1],
  // Snappy - quick and responsive
  snappy: [0.25, 0.1, 0.25, 1],
  // Expressive - playful with personality
  expressive: [0.68, -0.55, 0.265, 1.55],
  // Linear for consistent speed
  linear: [0, 0, 1, 1],
}

// Optimized duration constants
const DURATION = {
  instant: 0,
  micro: 0.15,
  fast: 0.25,
  base: 0.3,
  moderate: 0.35,
  relaxed: 0.4,
  slow: 0.5,
}

// Core transition presets
const navigation: Transition = {
  type: 'tween',
  ease: EASING.apple,
  duration: DURATION.moderate,
}

const modal: Transition = {
  type: 'tween',
  ease: EASING.emphasized,
  duration: DURATION.relaxed,
}

const fade: Transition = {
  type: 'tween',
  ease: EASING.silk,
  duration: DURATION.fast,
}

const instant: Transition = {
  duration: DURATION.instant,
}

export const STACK_TRANSITIONS: Record<string, StackAnimation> = {
  /**
   * Default: Apple-inspired slide animation
   * Timing: 350ms with signature Apple easing
   * Best for: Standard navigation flows
   */
  default: {
    variants: {
      enter: { x: '100%', opacity: 1 },
      center: { x: 0, opacity: 1, scale: 1 },
      behind: { x: '-30%', opacity: 1, scale: 0.95 },
      exit: { x: '100%', opacity: 1, scale: 1 },
      hidden: { opacity: 0, x: 0, transition: instant },
    },
    transition: navigation,
  },

  /**
   * Slide from bottom: Modal presentation
   * Timing: 400ms with emphasized deceleration
   * Best for: Sheets, modals, drawers
   */
  'slide-from-bottom': {
    variants: {
      enter: { y: '100%', opacity: 1 },
      center: { y: 0, opacity: 1 },
      behind: { y: 0, opacity: 0.6, scale: 0.96 },
      exit: { y: '100%', opacity: 1 },
      hidden: { opacity: 0, y: 0, transition: instant },
    },
    transition: modal,
  },

  /**
   * Fade: Simple opacity transition
   * Timing: 250ms with smooth easing
   * Best for: Content swaps, tab changes
   */
  fade: {
    variants: {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      behind: { opacity: 0 },
      exit: { opacity: 0 },
      hidden: { opacity: 0, transition: instant },
    },
    transition: fade,
  },

  /**
   * Zoom fade: Scale + opacity
   * Timing: 300ms with silk easing
   * Best for: Focus shifts, emphasis
   */
  'zoom-fade': {
    variants: {
      enter: { opacity: 0, scale: 0.94 },
      center: { opacity: 1, scale: 1 },
      behind: { opacity: 0.3, scale: 0.96 },
      exit: { opacity: 0, scale: 0.94 },
      hidden: { opacity: 0, scale: 1, transition: instant },
    },
    transition: {
      type: 'tween',
      ease: EASING.silk,
      duration: DURATION.base,
    },
  },

  /**
   * Lightning: Ultra-fast slide
   * Timing: 250ms with snappy easing
   * Best for: Quick actions, rapid navigation
   */
  lightning: {
    variants: {
      enter: { x: '100%', opacity: 1 },
      center: { x: 0, opacity: 1, scale: 1 },
      behind: { x: '-25%', opacity: 0.9, scale: 0.96 },
      exit: { x: '100%', opacity: 1, scale: 1 },
      hidden: { opacity: 0, x: 0, transition: instant },
    },
    transition: {
      type: 'tween',
      ease: EASING.snappy,
      duration: DURATION.fast,
    },
  },

  /**
   * Cinematic: Slow, luxurious slide
   * Timing: 500ms with silk easing
   * Best for: Premium experiences, onboarding
   */
  cinematic: {
    variants: {
      enter: { x: '100%', opacity: 0.8 },
      center: { x: 0, opacity: 1, scale: 1 },
      behind: { x: '-35%', opacity: 0.7, scale: 0.94 },
      exit: { x: '100%', opacity: 0.8, scale: 1 },
      hidden: { opacity: 0, x: 0, transition: instant },
    },
    transition: {
      type: 'tween',
      ease: EASING.silk,
      duration: DURATION.slow,
    },
  },

  /**
   * Flip: Horizontal rotation effect
   * Timing: 400ms with emphasized easing
   * Best for: Card flips, reveals
   */
  flip: {
    variants: {
      enter: { rotateY: 90, opacity: 0 },
      center: { rotateY: 0, opacity: 1 },
      behind: { rotateY: 0, opacity: 0.4, scale: 0.95 },
      exit: { rotateY: -90, opacity: 0 },
      hidden: { opacity: 0, rotateY: 0, transition: instant },
    },
    transition: {
      type: 'tween',
      ease: EASING.emphasized,
      duration: DURATION.relaxed,
    },
  },

  /**
   * Slide left: Reverse direction
   * Timing: 350ms with Apple easing
   * Best for: Back navigation, dismiss actions
   */
  'slide-left': {
    variants: {
      enter: { x: '-100%', opacity: 1 },
      center: { x: 0, opacity: 1, scale: 1 },
      behind: { x: '30%', opacity: 1, scale: 0.95 },
      exit: { x: '-100%', opacity: 1, scale: 1 },
      hidden: { opacity: 0, x: 0, transition: instant },
    },
    transition: navigation,
  },

  /**
   * Slide from top: Alert-style entry
   * Timing: 300ms with snappy easing
   * Best for: Notifications, alerts
   */
  'slide-from-top': {
    variants: {
      enter: { y: '-100%', opacity: 1 },
      center: { y: 0, opacity: 1 },
      behind: { y: 0, opacity: 0.6, scale: 0.97 },
      exit: { y: '-100%', opacity: 1 },
      hidden: { opacity: 0, y: 0, transition: instant },
    },
    transition: {
      type: 'tween',
      ease: EASING.snappy,
      duration: DURATION.base,
    },
  },

  /**
   * None: Instant transition
   * Timing: 0ms
   * Best for: No animation needed
   */
  none: {
    variants: {
      enter: { x: 0, opacity: 1 },
      center: { x: 0, opacity: 1, scale: 1 },
      behind: { x: 0, opacity: 1, scale: 1 },
      exit: { x: 0, opacity: 1, scale: 1 },
      hidden: { opacity: 0, transition: instant },
    },
    transition: instant,
  },
}

/**
 * Create a custom transition by combining variants with timing
 */
export function createCustomTransition(baseAnimation: StackAnimation, customTransition: Transition): StackAnimation {
  return {
    ...baseAnimation,
    transition: customTransition,
  }
}

/**
 * Pre-built timing configurations
 */
export const TIMING_PRESETS = {
  navigation,
  modal,
  fade,
  instant,
  lightning: { type: 'tween' as const, ease: EASING.snappy, duration: DURATION.fast },
  cinematic: { type: 'tween' as const, ease: EASING.silk, duration: DURATION.slow },
  micro: { type: 'tween' as const, ease: EASING.snappy, duration: DURATION.micro },
}

/**
 * Duration constants for consistent timing
 */
export { DURATION }

/**
 * Easing curves for custom animations
 */
export { EASING }
