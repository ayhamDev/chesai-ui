import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import React, { useImperativeHandle, useRef } from "react";
import useRipple from "use-ripple-hook";

const cardVariants = cva(
  // Base classes:
  // - z-0: Establishes stacking context for bloom effect
  // - overflow-hidden: Ensures ripple doesn't spill out (especially for rounded corners)
  "transition-all duration-300 ease-out relative z-0 overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
        glass:
          "bg-white/20 backdrop-blur-lg border border-white/10 text-graphite-primaryForeground",
        // Ghost has no background initially
        ghost: "bg-transparent border border-transparent",
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
      isSelected: {
        true: "border-2 border-graphite-primary",
        false: "border-2 border-transparent",
      },
      // Modern Elevation levels (Shadows)
      elevation: {
        none: "shadow-none",
        1: "shadow-sm border-graphite-border/50", // Subtle
        2: "shadow-md", // Default floating
        3: "shadow-lg", // Lifted
        4: "shadow-xl", // Modal/Dialog level
        5: "shadow-2xl", // Max lift
      },
      // Blooming hover effect toggle
      hoverEffect: {
        true: "cursor-pointer",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "glass",
        isSelected: false,
        className: "border border-white/10",
      },
      // The Blooming Effect Logic
      {
        variant: "ghost",
        hoverEffect: true,
        className: [
          // Pseudo-element setup
          "after:absolute after:inset-0 after:z-[-1]",
          "after:bg-graphite-secondary/50", // The bloom color
          "after:opacity-0 after:scale-90 after:origin-center",
          "after:rounded-[inherit]", // Inherit parent's border radius
          "after:transition-all after:duration-300 after:ease-out",
          // Hover states
          "hover:after:opacity-100 hover:after:scale-100",
        ],
      },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      padding: "md",
      isSelected: false,
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
  /** Enables the scaling bloom background effect on hover (best used with variant="ghost") */
  hoverEffect?: boolean;
  /** Enables the ripple click effect */
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

    // Determine ripple color based on variant
    // For 'primary' (usually card color) we want a dark ripple (light mode)
    // For 'glass' (usually dark bg) we want a light ripple
    const rippleColor =
      variant === "glass"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)";

    const [, event] = useRipple({
      ref: localRef,
      color: rippleColor,
      duration: 600, // Slightly slower ripple for large cards feels better
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
