import { cubicBezier, type Transition } from 'framer-motion'
import type { StackAnimation } from './types'

// Professionally calibrated easing curves
const EASING = {
  // NEW: A smoother, more modern iOS curve inspired by SwiftUI's default animation.
  // This provides a gentle acceleration and a long, graceful deceleration.
  iOS: cubicBezier(0.32, 0.72, 0, 1),

  // OLD: A very aggressive, fast-starting curve. Good for snappy feedback but can feel less fluid.
  // Google Material - balanced and predictable
  material: cubicBezier(0.4, 0, 0.2, 1),

  // You might have these defined elsewhere, kept for compatibility with the original file
  emphasized: cubicBezier(0.4, 0, 0.2, 1), // Assuming a value
  silk: cubicBezier(0.25, 1, 0.5, 1), // Assuming a value
  snappy: cubicBezier(0.34, 1.56, 0.64, 1), // Assuming a value
}

// Optimized duration constants
const DURATION = {
  instant: 0,
  micro: 0.15,
  fast: 0.25,
  base: 0.4,
  moderate: 0.45,
  relaxed: 0.5,
  slow: 0.6,
}

// Core transition presets
const navigation: Transition = {
  type: 'tween',
  ease: EASING.iOS,
  duration: DURATION.relaxed,
}

const modal: Transition = {
  type: 'tween',
  ease: EASING.iOS,
  duration: DURATION.relaxed,
}

const fade: Transition = {
  type: 'tween',
  ease: EASING.silk,
  duration: DURATION.base,
}

const instant: Transition = {
  duration: DURATION.instant,
}
export type TransitionPresets =
  | 'default'
  | 'none'
  | 'fade'
  | 'zoom-fade'
  | 'slide-from-bottom'
  | 'slide-from-top'
  | 'slide-from-left'
  | 'flip'
export const STACK_TRANSITIONS: Record<TransitionPresets, StackAnimation> = {
  /**
   * Default: Apple-inspired slide animation
   * Timing: 350ms with signature Apple easing
   * Best for: Standard navigation flows
   */
  default: {
    variants: {
      enter: { x: '100%', opacity: 1 },
      center: { x: 0, opacity: 1, scale: 1 },
      behind: { x: '-30%', opacity: 1, scale: 0.9 },
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
      ease: EASING.iOS,
      duration: DURATION.moderate,
    },
  },

  /**
   * Flip: Horizontal rotation effect
   * Timing: 400ms with emphasized easing
   * Best for: Card flips, reveals
   */
  flip: {
    variants: {
      enter: { rotateY: 70, opacity: 0 },
      center: { rotateY: 0, opacity: 1 },
      behind: { rotateY: 0, opacity: 0.4, scale: 0.9 },
      exit: { rotateY: -45, opacity: 0 },
      hidden: { opacity: 0, rotateY: 0, transition: instant },
    },
    transition: {
      type: 'tween',
      ease: EASING.iOS,
      duration: DURATION.relaxed,
    },
  },

  /**
   * Slide left: Reverse direction
   * Timing: 350ms with Apple easing
   * Best for: Back navigation, dismiss actions
   */
  'slide-from-left': {
    variants: {
      enter: { x: '-100%', opacity: 1 },
      center: { x: 0, opacity: 1, scale: 1 },
      behind: { x: '30%', opacity: 1, scale: 0.9 },
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
      behind: { y: 0, opacity: 0.6, scale: 0.9 },
      exit: { y: '-100%', opacity: 1 },
      hidden: { opacity: 0, y: 0, transition: instant },
    },
    transition: modal,
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
