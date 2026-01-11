"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import React, { useMemo } from "react";

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
    // Media queries for responsive columns
    const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
    const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
    const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
    const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
    const is2xl = useMediaQuery(`(min-width: ${BREAKPOINTS["2xl"]}px)`);

    const currentCols = useMemo(() => {
      if (typeof columns === "number") return columns;

      // Safe cast to object access since we checked number
      const colsObj = columns as ResponsiveObject<number>;

      // Order matters: check largest first
      if (is2xl && colsObj["2xl"] !== undefined) return colsObj["2xl"];
      if (isXl && colsObj.xl !== undefined) return colsObj.xl;
      if (isLg && colsObj.lg !== undefined) return colsObj.lg;
      if (isMd && colsObj.md !== undefined) return colsObj.md;
      if (isSm && colsObj.sm !== undefined) return colsObj.sm;

      return colsObj.default || 1;
    }, [columns, isSm, isMd, isLg, isXl, is2xl]);

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

    return (
      <motion.div
        ref={ref}
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
