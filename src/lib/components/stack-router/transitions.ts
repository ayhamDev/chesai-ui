import { cubicBezier, type Transition } from 'framer-motion'
import type { StackAnimation } from './types'

// Professionally calibrated easing curves
const EASING = {
  // NEW: A smoother, more modern iOS curve inspired by SwiftUI's default animation.
  // This provides a gentle acceleration and a long, graceful deceleration.
  iOS: cubicBezier(0.32, 0.72, 0, 1),
  // Buttery smooth material design curve - perfect for most UI animations
  material: cubicBezier(0.4, 0, 0.2, 1),

  // Snappy and confident - great for quick interactions and micro-animations
  snappy: cubicBezier(0.45, 0, 0.55, 1),

  // Bouncy and playful - adds personality to entrances and success states
  bouncy: cubicBezier(0.68, -0.55, 0.265, 1.55),

  // Fluid and organic - mimics natural motion with elastic deceleration
  fluid: cubicBezier(0.22, 1, 0.36, 1),

  // Elegant and refined - subtle sophistication for premium interfaces
  elegant: cubicBezier(0.25, 0.46, 0.45, 0.94),

  // Swift and energetic - conveys speed and responsiveness
  swift: cubicBezier(0.55, 0, 0.1, 1),

  // Gentle and calming - perfect for backgrounds and ambient animations
  gentle: cubicBezier(0.33, 1, 0.68, 1),

  // Sharp and precise - technical feel for data visualizations
  sharp: cubicBezier(0.85, 0, 0.15, 1),

  // Luxurious and slow - high-end feel with dramatic deceleration
  luxe: cubicBezier(0.19, 1, 0.22, 1),

  // Spring-like physics simulation - natural elastic bounce
  spring: cubicBezier(0.175, 0.885, 0.32, 1.275),

  // Anticipation - slight pullback before moving (game-like feel)
  anticipate: cubicBezier(0.6, -0.28, 0.735, 0.045),

  // Overshoot - goes past target then settles (playful emphasis)
  overshoot: cubicBezier(0.175, 0.885, 0.32, 1.2),

  // Cinematic - dramatic and theatrical timing
  cinematic: cubicBezier(0.83, 0, 0.17, 1),
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
  ease: EASING.iOS,
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
  | 'fade-from-right'
  | 'fade-from-left'
  | 'fade-from-top'
  | 'fade-from-bottom'
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
      behind: { x: '-30%', opacity: 0.9, scale: 0.9 },
      exit: { x: '100%', opacity: 1, scale: 1 },
      hidden: { opacity: 0, x: 0, transition: instant },
    },
    transition: navigation,
  },

  /**
   * Fade from Right: A directional fade, subtler than a full slide.
   * Best for: "Next" or "detail" views that are less hierarchical.
   */
  'fade-from-right': {
    variants: {
      enter: { x: '100%', opacity: 0 },
      center: { x: 0, opacity: 1 },
      behind: { x: '-75%', opacity: 0 },
      exit: { x: '100%', opacity: 1 },
      hidden: { opacity: 0, x: 0, transition: instant },
    },
    transition: navigation,
  },

  /**
   * Fade from Left: A directional fade, reversing the right-side animation.
   * Best for: "Back" or "dismiss" actions that need a subtler feel than a full slide.
   */
  'fade-from-left': {
    variants: {
      enter: { x: '-100%', opacity: 0 },
      center: { x: 0, opacity: 1 },
      behind: { x: '75%', opacity: 0 },
      exit: { x: '-100%', opacity: 1 },
      hidden: { opacity: 0, x: 0, transition: instant },
    },
    transition: navigation,
  },

  /**
   * Fade from Bottom: A directional fade for modal-like presentations.
   * Best for: Gentle appearance of sheets or overlays from the bottom.
   */
  'fade-from-bottom': {
    variants: {
      enter: { y: '100%', opacity: 0 },
      center: { y: 0, opacity: 1 },
      behind: { y: '-25%', opacity: 0 },
      exit: { y: '100%', opacity: 1 },
      hidden: { opacity: 0, y: 0, transition: instant },
    },
    transition: modal,
  },

  /**
   * Fade from Top: A directional fade for alerts or notifications.
   * Best for: Less intrusive notifications appearing from the top.
   */
  'fade-from-top': {
    variants: {
      enter: { y: '-100%', opacity: 0 },
      center: { y: 0, opacity: 1 },
      behind: { y: '25%', opacity: 0 },
      exit: { y: '-100%', opacity: 1 },
      hidden: { opacity: 0, y: 0, transition: instant },
    },
    transition: modal,
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
      behind: { y: 0, opacity: 0.6, scale: 0.9 },
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
}

/**
 * Duration constants for consistent timing
 */
export { DURATION }

/**
 * Easing curves for custom animations
 */
export { EASING }
