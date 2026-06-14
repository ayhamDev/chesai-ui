"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";
import React, { forwardRef } from "react";

// --- ROOT ---
const TimelineRoot = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={clsx("flex flex-col m-0 p-0 list-none", className)}
    {...props}
  />
));
TimelineRoot.displayName = "Timeline";

// --- ITEM ---
const TimelineItem = React.forwardRef<HTMLLIElement, HTMLMotionProps<"li">>(
  ({ className, ...props }, ref) => (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={clsx(
        "relative flex items-stretch gap-4 min-h-[3rem]",
        className,
      )}
      {...props}
    />
  ),
);
TimelineItem.displayName = "Timeline.Item";

// --- SEPARATOR ---
const TimelineSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex flex-col items-center shrink-0 w-8", className)}
    {...props}
  />
));
TimelineSeparator.displayName = "Timeline.Separator";

// --- CONNECTOR ---
const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ scaleY: 0 }}
    whileInView={{ scaleY: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
    style={{ originY: 0 }}
    className={clsx(
      "w-[2px] bg-outline-variant/50 flex-grow my-1 rounded-full",
      className,
    )}
    {...props}
  />
));
TimelineConnector.displayName = "Timeline.Connector";

// --- DOT ---
const dotVariants = cva(
  "flex items-center justify-center shrink-0 z-10 transition-colors shadow-sm",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary border-transparent",
        "primary-container":
          "bg-primary-container text-on-primary-container border-transparent",
        secondary:
          "bg-secondary-container text-on-secondary-container border-transparent",
        surface:
          "bg-surface text-on-surface border-[1.5px] border-outline-variant",
        outline:
          "bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant",
        ghost:
          "bg-transparent border-transparent text-on-surface-variant shadow-none",
        solid: "bg-outline-variant text-surface border-transparent shadow-none",
      },
      size: {
        sm: "w-3 h-3",
        md: "w-6 h-6 [&>svg]:w-3.5 [&>svg]:h-3.5",
        lg: "w-8 h-8 [&>svg]:w-4 [&>svg]:h-4",
        xl: "w-10 h-10 [&>svg]:w-5 [&>svg]:h-5",
      },
      shape: {
        circle: "rounded-full",
        diamond: "rotate-45 rounded-[4px]",
        square: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
      shape: "circle",
    },
  },
);

export interface TimelineDotProps extends HTMLMotionProps<"div"> {
  variant?:
    | "primary"
    | "primary-container"
    | "secondary"
    | "surface"
    | "outline"
    | "ghost"
    | "solid";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "diamond" | "square";
}

const TimelineDot = forwardRef<HTMLDivElement, TimelineDotProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      shape = "circle",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
          delay: 0.05,
        }}
        className={clsx(dotVariants({ variant, size, shape }), className)}
        {...props}
      >
        {shape === "diamond" && React.Children.count(children) > 0 ? (
          <div className="-rotate-45 flex items-center justify-center w-full h-full">
            {children as React.ReactNode}
          </div>
        ) : (
          (children as React.ReactNode)
        )}
      </motion.div>
    );
  },
);
TimelineDot.displayName = "Timeline.Dot";

// --- CONTENT ---
const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex-1 pb-8 min-w-0", className)}
    {...props}
  />
));
TimelineContent.displayName = "Timeline.Content";

export const Timeline = Object.assign(TimelineRoot, {
  Item: TimelineItem,
  Separator: TimelineSeparator,
  Connector: TimelineConnector,
  Dot: TimelineDot,
  Content: TimelineContent,
});
