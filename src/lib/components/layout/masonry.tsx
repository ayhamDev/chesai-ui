"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

type BreakpointKey = keyof typeof BREAKPOINTS;
type ResponsiveObject = Partial<Record<BreakpointKey, number>> & {
  default?: number;
};
type ResponsiveCols = number | ResponsiveObject;

export interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: ResponsiveCols;
  gap?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const gapMap = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

export const Masonry = ({
  children,
  columns = 3,
  gap = "md",
  className,
  ...props
}: MasonryProps) => {
  const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);

  const [colCount, setColCount] = useState(1);

  // Determine column count based on breakpoints
  const targetCols = useMemo(() => {
    if (typeof columns === "number") return columns;

    const colsObj = columns as ResponsiveObject;

    if (isXl && colsObj.xl !== undefined) return colsObj.xl;
    if (isLg && colsObj.lg !== undefined) return colsObj.lg;
    if (isMd && colsObj.md !== undefined) return colsObj.md;
    if (isSm && colsObj.sm !== undefined) return colsObj.sm;
    return colsObj.default || 1;
  }, [columns, isSm, isMd, isLg, isXl]);

  // Sync state to prevent hydration mismatch, but update quickly
  useEffect(() => {
    setColCount(targetCols);
  }, [targetCols]);

  // Distribute children into columns
  const columnBuckets = useMemo(() => {
    const buckets: React.ReactNode[][] = Array.from(
      { length: colCount },
      () => []
    );

    React.Children.forEach(children, (child, index) => {
      if (React.isValidElement(child)) {
        // Round-robin distribution
        buckets[index % colCount].push(child);
      }
    });

    return buckets;
  }, [children, colCount]);

  return (
    <div
      className={clsx("flex items-start w-full", gapMap[gap], className)}
      {...props}
    >
      <AnimatePresence mode="popLayout">
        {columnBuckets.map((bucket, colIndex) => (
          <motion.div
            key={`masonry-col-${colIndex}`}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={clsx("flex flex-col flex-1 min-w-0", gapMap[gap])}
          >
            {bucket.map((child, itemIndex) => {
              // Try to find a stable key from the child, otherwise fallback to a generated index key
              // Note: Using index is safe here only if the list order is stable.
              const key = React.isValidElement(child)
                ? child.key || `item-${colIndex}-${itemIndex}`
                : `item-${colIndex}-${itemIndex}`;

              return (
                <motion.div
                  key={key}
                  layout="position"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                  {child}
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

Masonry.displayName = "Masonry";
