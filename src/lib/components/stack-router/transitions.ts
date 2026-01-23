import { cubicBezier, type Transition } from 'framer-motion'
import type { StackAnimation } from './types'

// --- MATERIAL DESIGN 3 MOTION TOKENS ---
// Reference: https://m3.material.io/styles/motion/easing-and-duration/tokens-specs

export const EASING = {
  // --- MD3 Standard Tokens ---

  expressiveFastSpatial: cubicBezier(0.42, 1.67, 0.21, 0.9),
  expressiveDefaultSpatial: cubicBezier(0.38, 1.21, 0.22, 1.0),
  expressiveSlowSpatial: cubicBezier(0.39, 1.29, 0.35, 0.98),

  // --- NEW: MD3 Expressive Effects (Fade, Scale-in, Color) ---
  expressiveFastEffects: cubicBezier(0.31, 0.94, 0.34, 1.0),
  expressiveDefaultEffects: cubicBezier(0.34, 0.8, 0.34, 1.0),
  expressiveSlowEffects: cubicBezier(0.34, 0.88, 0.34, 1.0),

  // The "Brand" curve. Used for begin/end on screen transitions and shared element morphs.
  emphasized: cubicBezier(0.2, 0.0, 0.0, 1.0),

  // Used for elements entering the screen (e.g., Dialog open, BottomSheet open).
  emphasizedDecelerate: cubicBezier(0.05, 0.7, 0.1, 1.0),

  // Used for elements exiting the screen (e.g., Dialog close).
  emphasizedAccelerate: cubicBezier(0.3, 0.0, 0.8, 0.15),

  // Used for small, functional movements (e.g., Switch toggle, Checkbox).
  standard: cubicBezier(0.2, 0.0, 0, 1.0),

  // Used for simple entering elements (e.g., Toasts, Snackbars).
  standardDecelerate: cubicBezier(0, 0, 0, 1),

  // Used for simple exiting elements.
  standardAccelerate: cubicBezier(0.3, 0, 1, 1),

  // --- Legacy / Custom Curves (Preserved) ---
  iOS: cubicBezier(0.32, 0.72, 0, 1),
  material: cubicBezier(0.4, 0, 0.2, 1),
  snappy: cubicBezier(0.45, 0, 0.55, 1),
  bouncy: cubicBezier(0.68, -0.55, 0.265, 1.55),
  fluid: cubicBezier(0.22, 1, 0.36, 1),
  elegant: cubicBezier(0.25, 0.46, 0.45, 0.94),
  swift: cubicBezier(0.55, 0, 0.1, 1),
  gentle: cubicBezier(0.33, 1, 0.68, 1),
  sharp: cubicBezier(0.85, 0, 0.15, 1),
  luxe: cubicBezier(0.19, 1, 0.22, 1),
  spring: cubicBezier(0.175, 0.885, 0.32, 1.275),
  anticipate: cubicBezier(0.6, -0.28, 0.735, 0.045),
  overshoot: cubicBezier(0.175, 0.885, 0.32, 1.2),
  cinematic: cubicBezier(0.83, 0, 0.17, 1),
}

// MD3 Duration Tokens (in seconds for Framer Motion)
export const DURATION = {
  expressiveFast: 0.35,
  expressiveDefault: 0.5,
  expressiveSlow: 0.65,
  expressiveEffectsFast: 0.15,
  expressiveEffectsDefault: 0.2,
  expressiveEffectsSlow: 0.3,

  short1: 0.05, // 50ms
  short2: 0.1, // 100ms
  short3: 0.15, // 150ms
  short4: 0.2, // 200ms
  medium1: 0.25, // 250ms
  medium2: 0.3, // 300ms
  medium3: 0.35, // 350ms
  medium4: 0.4, // 400ms
  long1: 0.45, // 450ms
  long2: 0.5, // 500ms
  long3: 0.55, // 550ms
  long4: 0.6, // 600ms

  // Legacy constants mappings
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
  // MD3 Additions
  | 'shared-axis-x'
  | 'shared-axis-y'
  | 'shared-axis-z'

export const STACK_TRANSITIONS: Record<TransitionPresets, StackAnimation> = {
  /**
   * Default: Apple-inspired slide animation
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

  // --- MD3 Shared Axis Transitions ---
  'shared-axis-x': {
    variants: {
      enter: { x: '30px', opacity: 0 },
      center: { x: 0, opacity: 1 },
      behind: { x: '-30px', opacity: 0 },
      exit: { x: '30px', opacity: 0 },
      hidden: { opacity: 0 },
    },
    transition: { ease: EASING.emphasized, duration: DURATION.medium4 },
  },

  'shared-axis-y': {
    variants: {
      enter: { y: '30px', opacity: 0 },
      center: { y: 0, opacity: 1 },
      behind: { y: '-30px', opacity: 0 },
      exit: { y: '30px', opacity: 0 },
      hidden: { opacity: 0 },
    },
    transition: { ease: EASING.emphasized, duration: DURATION.medium4 },
  },

  'shared-axis-z': {
    variants: {
      enter: { scale: 0.8, opacity: 0 },
      center: { scale: 1, opacity: 1 },
      behind: { scale: 1.1, opacity: 0 },
      exit: { scale: 0.8, opacity: 0 },
      hidden: { opacity: 0 },
    },
    transition: { ease: EASING.emphasized, duration: DURATION.medium4 },
  },
  // -----------------------------------

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

export function createCustomTransition(baseAnimation: StackAnimation, customTransition: Transition): StackAnimation {
  return {
    ...baseAnimation,
    transition: customTransition,
  }
}

export const TIMING_PRESETS = {
  navigation,
  modal,
  fade,
  instant,
}
