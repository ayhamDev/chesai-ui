"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { type HTMLMotionProps, motion } from "framer-motion";
import React from "react";

const flexVariants = cva("flex", {
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

export interface FlexProps
  extends HTMLMotionProps<"div">,
    VariantProps<typeof flexVariants> {
  asChild?: boolean;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    { className, direction, wrap, justify, align, gap, children, ...props },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        layout
        className={clsx(
          flexVariants({ direction, wrap, justify, align, gap, className })
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Flex.displayName = "Flex";
