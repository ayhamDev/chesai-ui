"use client";

import { Outlet, useChildMatches } from "@tanstack/react-router";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import React from "react";
import { clsx } from "clsx";

export type RoutePreset =
  | "fade"
  | "slide-right"
  | "slide-left"
  | "slide-up"
  | "slide-down"
  | "zoom"
  | "scale-fade"
  | "none";

export interface CustomRouteAnimation {
  initial: any;
  animate: any;
  exit: any;
  transition?: Transition;
}

export interface AnimatedOutletProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The animation preset to use, or a custom framer-motion animation configuration.
   * @default "fade"
   */
  animation?: RoutePreset | CustomRouteAnimation;
  /**
   * The AnimatePresence mode.
   * "wait" waits for the exit animation to finish before starting the enter animation.
   * "popLayout" allows overlapping animations without layout shifts (exiting component becomes absolute).
   * "sync" plays them simultaneously.
   * @default "wait"
   */
  mode?: "wait" | "popLayout" | "sync";
}

const PRESETS: Record<RoutePreset, CustomRouteAnimation> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  "slide-right": {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  "slide-left": {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  "slide-up": {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  "slide-down": {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { duration: 0.2 },
  },
  "scale-fade": {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { type: "spring", stiffness: 400, damping: 30 },
  },
  none: {
    initial: false,
    animate: false,
    exit: false,
  },
};

export const AnimatedOutlet = React.forwardRef<
  HTMLDivElement,
  AnimatedOutletProps
>(({ animation = "fade", mode = "wait", className, ...props }, ref) => {
  // We use the child match ID so the AnimatePresence knows exactly when the immediate route changes.
  const childMatches = useChildMatches();
  const nextMatch = childMatches[0];
  const matchId = nextMatch ? nextMatch.id : "empty";

  const anim = typeof animation === "string" ? PRESETS[animation] : animation;

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={matchId}
        initial={anim.initial}
        animate={anim.animate}
        exit={anim.exit}
        transition={anim.transition}
        className={clsx("w-full h-full", className)}
        ref={ref}
        {...props}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
});
AnimatedOutlet.displayName = "AnimatedOutlet";
