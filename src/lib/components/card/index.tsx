"use client";

import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import React, { useImperativeHandle, useRef } from "react";
import useRipple from "use-ripple-hook";

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

        // --- MD3 Surface Container Variants ---
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
    },
    compoundVariants: [
      // Ghost Bloom Effect
      {
        variant: "ghost",
        hoverEffect: true,
        className:
          "after:bg-secondary-container/50 after:scale-80 after:origin-center hover:after:opacity-100 hover:after:scale-100",
      },
      // Standard Overlay Effect (Primary, Secondary, Surface Variants)
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
      // Tertiary Overlay
      {
        variant: "tertiary",
        hoverEffect: true,
        className: "after:bg-on-tertiary-container/8 hover:after:opacity-100",
      },
      // High Contrast Overlay
      {
        variant: "high-contrast",
        hoverEffect: true,
        className: "after:bg-inverse-on-surface/10 hover:after:opacity-100",
      },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      padding: "md",
      bordered: false,
      elevation: "none",
    },
  },
);

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  enableRipple?: boolean;
}

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
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const localRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => localRef.current!);

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
        className={clsx(
          cardVariants({
            shape,
            variant,
            padding,
            bordered,
            elevation,
            hoverEffect,
          }),
          className,
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
