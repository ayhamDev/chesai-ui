/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { motion, useSpring, useTransform } from "framer-motion";
import React, { useEffect } from "react";

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

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  value?: number;
  max?: number;
  indeterminate?: boolean;
  thickness?: number;
  gap?: number;
  /** The style variant of the progress circle @default "standard" */
  variant?: "standard" | "wavy";
  /** The amplitude (height) of the waves @default 1.5 */
  amplitude?: number;
  /** The frequency (number of complete wave cycles) @default 10 */
  frequency?: number;
}

// Generates a smooth wavy circle path centered at (cx, cy)
const getWavyCirclePath = (
  cx: number,
  cy: number,
  r: number,
  amplitude: number,
  frequency: number,
) => {
  const points = [];
  const steps = 180; // High resolution for smooth curves
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const currR = r + amplitude * Math.sin(frequency * angle);
    const x = cx + currR * Math.cos(angle);
    const y = cy + currR * Math.sin(angle);
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(3)} ${y.toFixed(3)}`);
  }
  return points.join(" ");
};

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
      gap = 7,
      variant = "standard",
      amplitude = 1.5,
      frequency = 10,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const viewBoxSize = 44;
    const center = viewBoxSize / 2;

    // Fix clipping: reduce base radius for wavy style to guarantee peaks + stroke thickness stay inside viewport
    const radius =
      variant === "wavy"
        ? viewBoxSize / 2 - amplitude - thickness / 2 - 0.5
        : (viewBoxSize - thickness) / 2;

    const circumference = 2 * Math.PI * radius;

    // Smoothly animate the progress percentage to allow continuous wave-flattening morphs
    const springProgress = useSpring(percentage, {
      stiffness: 80,
      damping: 20,
    });

    useEffect(() => {
      springProgress.set(percentage);
    }, [percentage, springProgress]);

    // Active wave line dynamic path (morphs to a flat circle starting from 80% to 100%)
    const wavyPath = useTransform(springProgress, (p) => {
      let currentAmplitude = amplitude;
      if (p > 80) {
        const factor = (100 - p) / 20; // 1 down to 0
        currentAmplitude = amplitude * Math.max(0, factor);
      }
      return getWavyCirclePath(
        center,
        center,
        radius,
        currentAmplitude,
        frequency,
      );
    });

    const activeDasharray = useTransform(springProgress, (p) => {
      return `${p} 100`;
    });

    const hasGaps = percentage > 0 && percentage < 100;
    const actualGap = hasGaps ? gap : 0;

    const trackDasharray = useTransform(springProgress, (p) => {
      if (indeterminate) return `${circumference} ${circumference}`;
      const activeLen = (p / 100) * circumference;
      const trackLength = hasGaps
        ? Math.max(0, circumference - activeLen - 2 * actualGap)
        : circumference;
      return `${trackLength} ${circumference}`;
    });

    const trackDashoffset = useTransform(springProgress, (p) => {
      if (indeterminate) return 0;
      const activeLen = (p / 100) * circumference;
      const trackStart = activeLen + actualGap;
      return -trackStart;
    });

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
          // @ts-ignore
          variants={indeterminate ? indeterminateVariants : undefined}
          animate={indeterminate ? "animate" : undefined}
        >
          {/* Background Track (Concentric flat circle) */}
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
                : undefined,
              strokeDashoffset: indeterminate ? 0 : undefined,
            }}
            style={{
              // @ts-ignore
              strokeDasharray: indeterminate ? undefined : trackDasharray,
              strokeDashoffset: indeterminate ? undefined : trackDashoffset,
            }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          />

          {/* Active Progress Indicator */}
          {variant === "wavy" ? (
            indeterminate ? (
              <motion.path
                d={getWavyCirclePath(
                  center,
                  center,
                  radius,
                  amplitude,
                  frequency,
                )}
                className="text-primary"
                stroke="currentColor"
                strokeWidth={thickness}
                strokeLinecap="round"
                fill="none"
                pathLength={100}
                animate={{
                  strokeDasharray: "25 100",
                  strokeDashoffset: [0, -100],
                }}
                transition={{
                  strokeDashoffset: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                  },
                }}
              />
            ) : (
              <motion.path
                className="text-primary"
                stroke="currentColor"
                strokeWidth={thickness}
                strokeLinecap="round"
                fill="none"
                pathLength={100}
                style={{
                  d: wavyPath,
                  strokeDasharray: activeDasharray,
                }}
              />
            )
          ) : (
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
                  : `${(percentage / 100) * circumference} ${circumference}`,
                strokeDashoffset: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 20,
              }}
            />
          )}
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
