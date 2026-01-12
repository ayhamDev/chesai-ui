"use client";

import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import React, { useImperativeHandle, useRef } from "react";
import useRipple from "use-ripple-hook";

const cardVariants = cva(
  // Base classes
  "transition-all duration-300 ease-out relative z-0 overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
        glass:
          "bg-white/20 backdrop-blur-lg border border-white/10 text-graphite-primaryForeground",
        ghost: "bg-transparent",
      },
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-6",
        lg: "p-8",
      },
      // --- NEW: Bordered Option ---
      bordered: {
        true: "border border-graphite-border",
        false: "border-none",
      },
      isSelected: {
        true: "border-2! border-graphite-primary!", // Force primary border when selected
        false: "",
      },
      elevation: {
        none: "shadow-none",
        1: "shadow-sm",
        2: "shadow-md",
        3: "shadow-lg",
        4: "shadow-xl",
        5: "shadow-2xl",
      },
      hoverEffect: {
        true: "cursor-pointer",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "ghost",
        hoverEffect: true,
        className: [
          "after:absolute after:inset-0 after:z-[-1]",
          "after:bg-graphite-secondary/50",
          "after:opacity-0 after:scale-90 after:origin-center",
          "after:rounded-[inherit]",
          "after:transition-all after:duration-300 after:ease-out",
          "hover:after:opacity-100 hover:after:scale-100",
        ],
      },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      padding: "md",
      isSelected: false,
      bordered: false, // Default to no border (elevated style)
      elevation: "none",
      hoverEffect: false,
    },
  }
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "glass" | "ghost";
  shape?: "full" | "minimal" | "sharp";
  padding?: "none" | "sm" | "md" | "lg";
  elevation?: "none" | 1 | 2 | 3 | 4 | 5;
  isSelected?: boolean;
  /** Adds a subtle outline to the card. */
  bordered?: boolean;
  hoverEffect?: boolean;
  enableRipple?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      shape,
      variant,
      padding,
      isSelected,
      bordered,
      elevation,
      hoverEffect,
      enableRipple,
      onPointerDown,
      ...props
    },
    ref
  ) => {
    const localRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => localRef.current!);

    const rippleColor =
      variant === "glass"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)";

    const [, event] = useRipple({
      ref: localRef,
      color: rippleColor,
      duration: 600,
      disabled: !enableRipple,
    });

    return (
      <div
        ref={localRef}
        className={clsx(
          cardVariants({
            shape,
            variant,
            padding,
            isSelected,
            bordered,
            elevation,
            hoverEffect,
          }),
          className
        )}
        onPointerDown={(e) => {
          if (enableRipple) event(e);
          onPointerDown?.(e);
        }}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
