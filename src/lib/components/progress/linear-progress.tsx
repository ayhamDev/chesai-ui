"use client";

import { clsx } from "clsx";
import { motion, useSpring, useTransform } from "framer-motion";
import React, { useEffect } from "react";

export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The current value (0-100) */
  value?: number;
  /** The maximum value (default 100) */
  max?: number;
  /** If true, shows an indeterminate loading animation */
  indeterminate?: boolean;
  /** The gap in pixels between the active bar and the track */
  gap?: number;
  /** The style variant of the progress bar @default "standard" */
  variant?: "standard" | "wavy";
  /** The amplitude (height) of the waves @default 1.8 */
  amplitude?: number;
  /** The frequency (number of complete wave cycles) @default 6.5 */
  frequency?: number;
}

// Generates a smooth sine wave path from 0 to width
const getWavyLinePath = (
  width: number,
  height: number,
  amplitude: number,
  frequency: number,
) => {
  const points = [];
  const steps = 100;
  const midY = height / 2;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y =
      midY + amplitude * Math.sin((x / width) * frequency * 2 * Math.PI);
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(3)} ${y.toFixed(3)}`);
  }
  return points.join(" ");
};

export const LinearProgress = React.forwardRef<
  HTMLDivElement,
  LinearProgressProps
>(
  (
    {
      value = 0,
      max = 100,
      indeterminate,
      gap = 7,
      variant = "standard",
      amplitude = 1.8,
      frequency = 6.5,
      className,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    // Smoothly animate the progress percentage to allow continuous wave-flattening morphs
    const springProgress = useSpring(percentage, {
      stiffness: 80,
      damping: 20,
    });

    useEffect(() => {
      springProgress.set(percentage);
    }, [percentage, springProgress]);

    // Active wave line dynamic path (morphs to a flat line starting from 80% to 100%)
    const wavyPath = useTransform(springProgress, (p) => {
      let currentAmplitude = amplitude;
      if (p > 80) {
        const factor = (100 - p) / 20; // 1 down to 0
        currentAmplitude = amplitude * Math.max(0, factor);
      }
      return getWavyLinePath(100, 12, currentAmplitude, frequency);
    });

    const activeDasharray = useTransform(springProgress, (p) => {
      return `${p} 100`;
    });

    const hasGaps = percentage > 0 && percentage < 100;
    const gapPercentage = hasGaps ? gap * 0.8 : 0; // scale down gap slightly for 100px viewbox

    const trackDasharray = useTransform(springProgress, (p) => {
      if (indeterminate) return "100 100";
      const trackStart = p + gapPercentage;
      const trackLength = Math.max(0, 100 - trackStart);
      return `${trackLength} 100`;
    });

    const trackDashoffset = useTransform(springProgress, (p) => {
      if (indeterminate) return 0;
      const trackStart = p + gapPercentage;
      return -trackStart;
    });

    if (variant === "wavy") {
      return (
        <div
          ref={ref}
          className={clsx(
            "relative h-4 w-full flex items-center text-primary",
            className,
          )}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemax={max}
          {...props}
        >
          <svg
            viewBox="0 0 100 12"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <title>Linear progress bar</title>
            {/* Background Flat Track */}
            <motion.path
              d="M 0 6 L 100 6"
              className="text-secondary-container"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
              pathLength={100}
              initial={false}
              style={{
                // @ts-ignore
                strokeDasharray: trackDasharray,
                strokeDashoffset: trackDashoffset,
              }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            />

            {/* Active Wavy Indicator */}
            {indeterminate ? (
              <motion.path
                d={getWavyLinePath(100, 12, amplitude, frequency)}
                className="text-primary"
                stroke="currentColor"
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
                pathLength={100}
                animate={{
                  strokeDasharray: "40 100",
                  strokeDashoffset: [0, -100],
                }}
                transition={{
                  strokeDashoffset: {
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                  },
                }}
              />
            ) : (
              <motion.path
                className="text-primary"
                stroke="currentColor"
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
                pathLength={100}
                style={{
                  d: wavyPath,
                  strokeDasharray: activeDasharray,
                }}
              />
            )}
          </svg>
        </div>
      );
    }

    if (indeterminate) {
      return (
        <div
          ref={ref}
          className={clsx(
            "relative h-1.5 w-full flex items-center bg-secondary-container rounded-full overflow-hidden",
            className,
          )}
          role="progressbar"
          {...props}
        >
          <div className="absolute top-0 bottom-0 left-0 w-full bg-primary origin-left animate-progress-indeterminate-1 rounded-full" />
          <div className="absolute top-0 bottom-0 left-0 w-full bg-primary origin-left animate-progress-indeterminate-2 rounded-full" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx("relative h-1.5 w-full flex items-center", className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        {...props}
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          style={{
            marginRight: percentage < 100 && percentage > 0 ? gap : 0,
          }}
        />
        <div className="h-full flex-1 bg-secondary-container rounded-full min-w-0 transition-all duration-300" />
      </div>
    );
  },
);

LinearProgress.displayName = "LinearProgress";
