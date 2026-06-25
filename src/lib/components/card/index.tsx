"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";
import useRipple from "use-ripple-hook";

// --- Card Variants Definition ---

export const cardVariants = cva(
  "transition-all duration-300 ease-out relative z-0 overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-surface-container-low text-on-surface",
        secondary: "bg-surface-container-highest text-on-surface",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        "high-contrast": "bg-inverse-surface text-inverse-on-surface",
        ghost: "bg-transparent text-on-surface",
        surface: "bg-surface text-on-surface",
        "surface-container-lowest":
          "bg-surface-container-lowest text-on-surface",
        "surface-container-low": "bg-surface-container-low text-on-surface",
        "surface-container": "bg-surface-container text-on-surface",
        "surface-container-high": "bg-surface-container-high text-on-surface",
        "surface-container-highest":
          "bg-surface-container-highest text-on-surface",
      },
      hoverEffect: {
        true: "after:absolute after:inset-0 after:z-[-1] after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out after:opacity-0",
        false: "",
      },
      shape: {
        full: "rounded-3xl", // 24px
        minimal: "rounded-xl", // 12px
        sharp: "rounded-none", // 0px
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-6",
        lg: "p-8",
      },
      bordered: {
        true: "border border-outline-variant",
        false: "border-none",
      },
      elevation: {
        none: "shadow-none",
        1: "shadow-sm",
        2: "shadow-md",
        3: "shadow-lg",
        4: "shadow-xl",
        5: "shadow-2xl",
      },
      glass: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // Ghost Bloom Effect
      {
        variant: "ghost",
        hoverEffect: true,
        className:
          "after:bg-secondary-container/50 after:scale-80 after:origin-center hover:after:opacity-100 hover:after:scale-100",
      },
      {
        variant: "primary",
        hoverEffect: true,
        className: "after:bg-on-surface/8 hover:after:opacity-100",
      },
      {
        variant: "secondary",
        hoverEffect: true,
        className: "after:bg-on-surface/8 hover:after:opacity-100",
      },
      {
        variant: "surface",
        hoverEffect: true,
        className: "after:bg-on-surface/8 hover:after:opacity-100",
      },
      {
        variant: "surface-container-lowest",
        hoverEffect: true,
        className: "after:bg-on-surface/8 hover:after:opacity-100",
      },
      {
        variant: "surface-container-low",
        hoverEffect: true,
        className: "after:bg-on-surface/8 hover:after:opacity-100",
      },
      {
        variant: "surface-container",
        hoverEffect: true,
        className: "after:bg-on-surface/8 hover:after:opacity-100",
      },
      {
        variant: "surface-container-high",
        hoverEffect: true,
        className: "after:bg-on-surface/8 hover:after:opacity-100",
      },
      {
        variant: "surface-container-highest",
        hoverEffect: true,
        className: "after:bg-on-surface/8 hover:after:opacity-100",
      },
      {
        variant: "tertiary",
        hoverEffect: true,
        className: "after:bg-on-tertiary-container/8 hover:after:opacity-100",
      },
      {
        variant: "high-contrast",
        hoverEffect: true,
        className: "after:bg-inverse-on-surface/10 hover:after:opacity-100",
      },

      // --- Glass Variants ---
      {
        glass: true,
        variant: "primary",
        className:
          "bg-surface-container-low/50 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "secondary",
        className:
          "bg-surface-container-highest/60 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "tertiary",
        className:
          "bg-tertiary-container/60 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "high-contrast",
        className:
          "bg-inverse-surface/60 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "ghost",
        className:
          "backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "surface",
        className:
          "bg-surface/60 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "surface-container-lowest",
        className:
          "bg-surface-container-lowest/60 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "surface-container-low",
        className:
          "bg-surface-container-low/50 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "surface-container",
        className:
          "bg-surface-container/50 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "surface-container-high",
        className:
          "bg-surface-container-high/50 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
      {
        glass: true,
        variant: "surface-container-highest",
        className:
          "bg-surface-container-highest/50 backdrop-blur-xl shadow-xl border border-outline-variant/30",
      },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      padding: "md",
      bordered: false,
      elevation: "none",
      glass: false,
    },
  },
);

// --- Types ---

export type CardGroupShape = "full" | "minimal" | "sharp";
export type CardGroupDirection = "horizontal" | "vertical";
export type CardGroupGap = "none" | "xs" | "sm" | "md" | "lg";

export interface CardGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: CardGroupShape;
  direction?: CardGroupDirection;
  gap?: CardGroupGap;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "high-contrast"
    | "ghost"
    | "surface"
    | "surface-container-lowest"
    | "surface-container-low"
    | "surface-container"
    | "surface-container-high"
    | "surface-container-highest";
  hoverEffect?: boolean;
  shape?: "full" | "minimal" | "sharp";
  padding?: "none" | "sm" | "md" | "lg";
  bordered?: boolean;
  elevation?: "none" | 1 | 2 | 3 | 4 | 5;
  enableRipple?: boolean;
  glass?: boolean;
}

// --- CardGroup Shape Helper Implementation ---

const cardGapMap: Record<CardGroupGap, string> = {
  none: "gap-0",
  xs: "gap-0.5",
  sm: "gap-1",
  md: "gap-2",
  lg: "gap-4",
};

/**
 * Resolves outer group corners using the Card component's own design tokens
 * ("full" -> rounded-3xl / rounded-md, "minimal" -> rounded-xl / rounded-sm)
 */
const getCardGroupShapeClasses = (
  index: number,
  total: number,
  shape: CardGroupShape,
  direction: CardGroupDirection,
) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isOnly = total === 1;

  if (shape === "sharp") return "!rounded-none";

  if (isOnly) {
    if (shape === "full") return "!rounded-3xl";
    if (shape === "minimal") return "!rounded-xl";
  }

  if (direction === "vertical") {
    if (shape === "full") {
      if (isFirst) return "!rounded-t-3xl !rounded-b-md";
      if (isLast) return "!rounded-t-md !rounded-b-3xl";
      return "!rounded-t-md !rounded-b-md";
    }
    if (shape === "minimal") {
      if (isFirst) return "!rounded-t-xl !rounded-b-sm";
      if (isLast) return "!rounded-t-sm !rounded-b-xl";
      return "!rounded-t-sm !rounded-b-sm";
    }
  } else {
    if (shape === "full") {
      if (isFirst) return "!rounded-l-3xl !rounded-r-md";
      if (isLast) return "!rounded-l-md !rounded-r-3xl";
      return "!rounded-l-md !rounded-r-md";
    }
    if (shape === "minimal") {
      if (isFirst) return "!rounded-l-xl !rounded-r-sm";
      if (isLast) return "!rounded-l-sm !rounded-r-xl";
      return "!rounded-l-sm !rounded-r-sm";
    }
  }
  return "";
};

// --- CardGroup Component ---

export const CardGroup = React.forwardRef<HTMLDivElement, CardGroupProps>(
  (
    {
      className,
      children,
      shape = "minimal",
      direction = "vertical",
      gap = "xs",
      ...props
    },
    ref,
  ) => {
    const childArray = React.Children.toArray(children).filter(
      React.isValidElement,
    );

    return (
      <div
        ref={ref}
        role="group"
        data-slot="card-group"
        className={twMerge(
          clsx(
            "flex",
            direction === "vertical" ? "flex-col" : "flex-row",
            cardGapMap[gap],
            className,
          ),
        )}
        {...props}
      >
        {childArray.map((child, index) => {
          const shapeClass = getCardGroupShapeClasses(
            index,
            childArray.length,
            shape,
            direction,
          );

          // If gap is 'none', add a negative margin on subsequent items
          // to cleanly collapse contiguous card borders and prevent double-line heaviness
          const borderOverlapClass =
            gap === "none" && index > 0
              ? direction === "vertical"
                ? "-mt-px"
                : "-ml-px"
              : "";

          return React.cloneElement(child as React.ReactElement<any>, {
            className: twMerge(
              clsx(
                (child as React.ReactElement<any>).props.className,
                shapeClass,
                borderOverlapClass,
                "focus-visible:z-10",
              ),
            ),
          });
        })}
      </div>
    );
  },
);
CardGroup.displayName = "CardGroup";

// --- Card Component ---

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      shape,
      variant,
      padding,
      bordered,
      elevation,
      enableRipple,
      hoverEffect,
      glass,
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => localRef.current!);

    const rippleColor =
      variant === "high-contrast" || variant === "tertiary"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)";

    const [, event] = useRipple({
      ref: localRef as React.RefObject<HTMLElement>,
      color: rippleColor,
      duration: 600,
      disabled: !enableRipple,
    });

    return (
      <div
        ref={localRef}
        className={twMerge(
          clsx(
            cardVariants({
              shape,
              variant,
              padding,
              bordered,
              elevation,
              hoverEffect,
              glass,
            }),
            className,
          ),
        )}
        onPointerDown={(e) => {
          if (enableRipple) event(e);
          onPointerDown?.(e);
        }}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";
