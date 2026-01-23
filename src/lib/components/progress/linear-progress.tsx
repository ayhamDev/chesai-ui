"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import React from "react";

export interface LinearProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The current value (0-100) */
  value?: number;
  /** The maximum value (default 100) */
  max?: number;
  /** If true, shows an indeterminate loading animation */
  indeterminate?: boolean;
  /** The gap in pixels between the active bar and the track */
  gap?: number;
}

export const LinearProgress = React.forwardRef<
  HTMLDivElement,
  LinearProgressProps
>(
  (
    { value = 0, max = 100, indeterminate, gap = 6, className, ...props },
    ref,
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

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
