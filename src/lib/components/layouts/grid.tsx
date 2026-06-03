/* src/lib/components/layout/grid.tsx */
"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import React from "react";

// --- TYPES ---

// Consistent with other components in the codebase
const BREAKPOINTS = ["sm", "md", "lg", "xl", "2xl"] as const;
type BreakpointKey = (typeof BREAKPOINTS)[number];

type ResponsiveCols =
  | number
  | (Partial<Record<BreakpointKey, number>> & {
      default?: number;
    });

type GapSize = "none" | "xs" | "sm" | "md" | "lg" | "xl";

// --- UTILS ---

const gapMap: Record<GapSize, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

/**
 * transform a columns prop into tailwind classes.
 * NOTE: For this to work with Tailwind JIT, the classes must be statically extractable
 * or safe-listed. If 'grid-cols-5' isn't in your bundle, this might fail.
 * Alternatively, we could use inline styles for vars, but classes are cleaner for SSR.
 */
const getColumnClasses = (columns: ResponsiveCols): string => {
  if (typeof columns === "number") {
    return `grid-cols-${columns}`;
  }

  const classes: string[] = [];

  if (columns.default) classes.push(`grid-cols-${columns.default}`);
  if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
  if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
  if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
  if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
  if (columns["2xl"]) classes.push(`2xl:grid-cols-${columns["2xl"]}`);

  return classes.join(" ");
};

// --- COMPONENT: GRID ITEM ---

export interface GridItemProps extends HTMLMotionProps<"div"> {
  colSpan?: number | Partial<Record<BreakpointKey | "default", number>>;
  rowSpan?: number;
}

const getSpanClasses = (span: GridItemProps["colSpan"]): string => {
  if (!span) return "";
  if (typeof span === "number") return `col-span-${span}`;

  const classes: string[] = [];
  if (span.default) classes.push(`col-span-${span.default}`);
  if (span.sm) classes.push(`sm:col-span-${span.sm}`);
  if (span.md) classes.push(`md:col-span-${span.md}`);
  if (span.lg) classes.push(`lg:col-span-${span.lg}`);
  if (span.xl) classes.push(`xl:col-span-${span.xl}`);

  return classes.join(" ");
};

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ children, className, colSpan, rowSpan, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        layout // Animates position when other items are removed
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={clsx(
          getSpanClasses(colSpan),
          rowSpan && `row-span-${rowSpan}`,
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
GridItem.displayName = "GridItem";

// --- COMPONENT: GRID ---

export interface GridProps extends HTMLMotionProps<"div"> {
  columns?: ResponsiveCols;
  gap?: GapSize;
  children: React.ReactNode;
  /**
   * If true, children are not auto-wrapped in AnimatePresence.
   * Use this if you want to control the AnimatePresence manually or for static grids.
   */
  disableAnimatePresence?: boolean;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      columns = 1,
      gap = "md",
      className,
      disableAnimatePresence = false,
      ...props
    },
    ref
  ) => {
    const colClasses = getColumnClasses(columns);

    const Content = (
      <motion.div
        ref={ref}
        layout // Handles the container resizing smoothly
        className={clsx("grid", colClasses, gapMap[gap], className)}
        {...props}
      >
        {disableAnimatePresence ? (
          children
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return child;

              // If the child is already a GridItem (or motion component), pass it through.
              // Otherwise, we might want to wrap it to ensure exit animations work,
              // but usually, it's better to let the user use <GridItem> for explicit control.
              // Here we just render the child, assuming the key is set on the child
              // for AnimatePresence to track it.
              return child;
            })}
          </AnimatePresence>
        )}
      </motion.div>
    );

    return Content;
  }
);

Grid.displayName = "Grid";
