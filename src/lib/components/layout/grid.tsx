"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";

// Breakpoints matching Tailwind default or project config
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const gridVariants = cva("grid", {
  variants: {
    gap: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
  },
  defaultVariants: {
    gap: "md",
    align: "stretch",
  },
});

type BreakpointKey = keyof typeof BREAKPOINTS;
// Allow object to be partial but define structure clearly for TS
type ResponsiveObject<T> = Partial<Record<BreakpointKey, T>> & {
  default?: T;
};
type ResponsiveProp<T> = T | ResponsiveObject<T>;

export interface GridProps
  extends Omit<HTMLMotionProps<"div">, "children">,
    VariantProps<typeof gridVariants> {
  children: React.ReactNode;
  /** Number of columns. Can be a number or an object for responsive breakpoints. */
  columns?: ResponsiveProp<number>;
  /** If true, children will stagger in when the grid mounts. */
  stagger?: boolean;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    { className, children, columns = 1, gap, align, stagger = false, ...props },
    ref
  ) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // --- NEW: Use ResizeObserver to measure the container width ---
    useEffect(() => {
      const element = gridRef.current;
      if (!element) return;

      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width);
        }
      });

      observer.observe(element);
      return () => observer.disconnect();
    }, []);

    const currentCols = useMemo(() => {
      if (typeof columns === "number") return columns;

      const colsObj = columns as ResponsiveObject<number>;
      const width = containerWidth;

      // Order matters: check largest first
      if (width >= BREAKPOINTS["2xl"] && colsObj["2xl"] !== undefined)
        return colsObj["2xl"];
      if (width >= BREAKPOINTS.xl && colsObj.xl !== undefined)
        return colsObj.xl;
      if (width >= BREAKPOINTS.lg && colsObj.lg !== undefined)
        return colsObj.lg;
      if (width >= BREAKPOINTS.md && colsObj.md !== undefined)
        return colsObj.md;
      if (width >= BREAKPOINTS.sm && colsObj.sm !== undefined)
        return colsObj.sm;

      return colsObj.default || 1;
    }, [columns, containerWidth]);
    // --- END NEW ---

    const variants = stagger
      ? {
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }
      : undefined;

    // --- NEW: Combine refs ---
    const combinedRef = (node: HTMLDivElement) => {
      // @ts-ignore
      gridRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <motion.div
        ref={combinedRef}
        layout
        variants={variants}
        initial={stagger ? "hidden" : undefined}
        animate={stagger ? "show" : undefined}
        className={clsx(gridVariants({ gap, align, className }))}
        style={{
          gridTemplateColumns: `repeat(${currentCols}, minmax(0, 1fr))`,
          ...props.style,
        }}
        {...props}
      >
        <AnimatePresence mode="popLayout">{children}</AnimatePresence>
      </motion.div>
    );
  }
);

export const GridItem = motion.div;

Grid.displayName = "Grid";
