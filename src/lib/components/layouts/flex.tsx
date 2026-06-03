"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, type HTMLMotionProps, motion } from "framer-motion";
import React from "react";

// --- VARIANTS ---

const flexVariants = cva("flex relative", {
  // Added 'relative' to fix popLayout positioning
  variants: {
    direction: {
      row: "flex-row",
      column: "flex-col",
      "row-reverse": "flex-row-reverse",
      "col-reverse": "flex-col-reverse",
    },
    wrap: {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      "wrap-reverse": "flex-wrap-reverse",
    },
    justify: {
      start: "justify-start",
      end: "justify-end",
      center: "justify-center",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    align: {
      start: "items-start",
      end: "items-end",
      center: "items-center",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
  },
  defaultVariants: {
    direction: "row",
    justify: "start",
    align: "stretch",
    wrap: "nowrap",
    gap: "md",
  },
});

// --- COMPONENT: FLEX ITEM ---

export interface FlexItemProps extends HTMLMotionProps<"div"> {
  grow?: boolean | number;
  shrink?: boolean | number;
  basis?: string;
}

export const FlexItem = React.forwardRef<HTMLDivElement, FlexItemProps>(
  ({ children, className, grow, shrink, basis, style, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        layout // Essential: Tells Framer to animate layout changes (position/size)
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 1,
        }}
        className={clsx(
          grow === true && "flex-grow",
          grow === 0 && "flex-grow-0",
          shrink === true && "flex-shrink",
          shrink === 0 && "flex-shrink-0",
          className,
        )}
        style={{
          flexGrow: typeof grow === "number" ? grow : undefined,
          flexShrink: typeof shrink === "number" ? shrink : undefined,
          flexBasis: basis,
          ...style,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
FlexItem.displayName = "FlexItem";

// --- COMPONENT: FLEX ---

export interface FlexProps
  extends HTMLMotionProps<"div">, VariantProps<typeof flexVariants> {
  asChild?: boolean;
  /**
   * If true, children are not auto-wrapped in AnimatePresence.
   * Use this if you want manual control or static lists.
   */
  disableAnimatePresence?: boolean;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction,
      wrap,
      justify,
      align,
      gap,
      children,
      disableAnimatePresence = false,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        // Removed 'layout' from container to prevent it from fighting with children layout animations
        // during resize, unless specifically needed.
        className={clsx(
          flexVariants({ direction, wrap, justify, align, gap, className }),
        )}
        {...props}
      >
        {disableAnimatePresence ? (
          children
        ) : (
          // popLayout allows the exiting element to float absolutely, letting siblings slide underneath immediately
          <AnimatePresence mode="popLayout" initial={false}>
            {/* @ts-ignore */}
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return null;
              // We return the child directly. The child (FlexItem) handles the motion.
              // Key MUST be on the child when passed to Flex.
              return child;
            })}
          </AnimatePresence>
        )}
      </motion.div>
    );
  },
);

Flex.displayName = "Flex";
