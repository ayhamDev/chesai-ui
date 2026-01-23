"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";

// --- TYPES & CONSTANTS ---

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type BreakpointKey = keyof typeof BREAKPOINTS;

type ResponsiveCols =
  | number
  | (Partial<Record<BreakpointKey, number>> & {
      default?: number;
    });

type GapSize = "none" | "xs" | "sm" | "md" | "lg" | "xl";

const gapMap: Record<GapSize, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

export interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: ResponsiveCols;
  gap?: GapSize;
  children: React.ReactNode;
}

// --- HELPER: GET COLUMN COUNT ---

const getColumnCount = (width: number, columns: ResponsiveCols): number => {
  if (typeof columns === "number") return columns;

  if (width >= BREAKPOINTS["2xl"] && columns["2xl"]) return columns["2xl"];
  if (width >= BREAKPOINTS.xl && columns.xl) return columns.xl;
  if (width >= BREAKPOINTS.lg && columns.lg) return columns.lg;
  if (width >= BREAKPOINTS.md && columns.md) return columns.md;
  if (width >= BREAKPOINTS.sm && columns.sm) return columns.sm;

  return columns.default || 1;
};

// --- COMPONENT ---

export const Masonry = ({
  children,
  columns = { default: 1, md: 2, lg: 3 },
  gap = "md",
  className,
  ...props
}: MasonryProps) => {
  const [colCount, setColCount] = useState<number>(() => {
    // Initial server-safe state
    if (typeof columns === "number") return columns;
    return columns.default || 1;
  });

  // Handle Resize / Breakpoints
  useEffect(() => {
    // If static number, no need to listen
    if (typeof columns === "number") {
      setColCount(columns);
      return;
    }

    const handleResize = () => {
      // Use window.innerWidth for standard breakpoints
      const width = window.innerWidth;
      setColCount(getColumnCount(width, columns));
    };

    // Initial check
    handleResize();

    // Debounce is usually good, but for simple breakpoint logic,
    // raw resize with RAF or just simple listener is often fine for UI switching.
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [columns]);

  // Distribute children into columns (Round Robin)
  const columnBuckets = useMemo(() => {
    const buckets: React.ReactNode[][] = Array.from(
      { length: colCount },
      () => []
    );

    const validChildren = React.Children.toArray(children);

    validChildren.forEach((child, index) => {
      buckets[index % colCount].push(child);
    });

    return buckets;
  }, [children, colCount]);

  return (
    <div
      className={clsx("flex items-start w-full", gapMap[gap], className)}
      {...props}
    >
      {columnBuckets.map((bucket, colIndex) => (
        <div
          key={`masonry-col-${colIndex}`}
          className={clsx("flex flex-col flex-1 min-w-0", gapMap[gap])}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {bucket.map((child, itemIndex) => {
              // Ensure we have a valid element to access props
              if (!React.isValidElement(child)) return child;

              // Use child's key if available, otherwise generate one.
              // WARNING: Generated keys based on index can cause re-animation issues on resize.
              // Prefer children with stable IDs as keys.
              const key = child.key || `item-${colIndex}-${itemIndex}`;

              return (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    transition: { duration: 0.2 },
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  {child}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

Masonry.displayName = "Masonry";
