"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import React from "react";

const rootVariants = cva("relative inline-flex items-center justify-center", {
  variants: {
    size: {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
      xl: "w-24 h-24",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface CircularProgressProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof rootVariants> {
  /** The current value (0-100) */
  value?: number;
  /** The maximum value (default 100) */
  max?: number;
  /** If true, shows an indeterminate loading animation */
  indeterminate?: boolean;
  /** Stroke thickness of the circle */
  thickness?: number;
  /** The gap in pixels between the active segment and the track */
  gap?: number;
}

export const CircularProgress = React.forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(
  (
    {
      size,
      value = 0,
      max = 100,
      indeterminate,
      thickness = 4,
      gap = 7, // Default gap matching linear style
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const viewBoxSize = 44;
    const center = viewBoxSize / 2;
    const radius = (viewBoxSize - thickness) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calculate lengths for the gap effect
    const activeLength = (percentage / 100) * circumference;
    // Only apply gap if we are between 0% and 100%
    const actualGap = percentage > 0 && percentage < 100 ? gap : 0;
    const trackStart = activeLength + actualGap;
    const trackLength = Math.max(0, circumference - trackStart);

    const indeterminateVariants = {
      animate: {
        rotate: 360,
        transition: {
          duration: 1.4,
          ease: "linear",
          repeat: Infinity,
        },
      },
    };

    return (
      <div
        ref={ref}
        className={clsx(rootVariants({ size }), "relative", className)}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemax={max}
        {...props}
      >
        <motion.svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className={clsx("w-full h-full", !indeterminate && "-rotate-90")}
          variants={indeterminate ? indeterminateVariants : undefined}
          animate={indeterminate ? "animate" : undefined}
        >
          {/* Background Track with Gap */}
          <motion.circle
            className="text-secondary-container"
            stroke="currentColor"
            strokeWidth={thickness}
            strokeLinecap="round"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            initial={false}
            animate={{
              strokeDasharray: indeterminate
                ? `${circumference} ${circumference}`
                : `${trackLength} ${circumference}`,
              strokeDashoffset: indeterminate ? 0 : -trackStart,
            }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          />

          {/* Active Indicator */}
          <motion.circle
            className="text-primary"
            stroke="currentColor"
            strokeWidth={thickness}
            strokeLinecap="round"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{
              strokeDasharray: indeterminate
                ? `${circumference * 0.25} ${circumference}`
                : `${activeLength} ${circumference}`,
              strokeDashoffset: indeterminate ? 0 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 20,
            }}
          />
        </motion.svg>
        {children && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
            {children}
          </div>
        )}
      </div>
    );
  },
);

CircularProgress.displayName = "CircularProgress";
