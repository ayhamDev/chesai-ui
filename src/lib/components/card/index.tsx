"use client";

import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import React, { useImperativeHandle, useRef } from "react";
import useRipple from "use-ripple-hook";

const cardVariants = cva(
  "transition-all duration-300 ease-out relative z-0 overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-surface-container-low text-on-surface",
        secondary: "bg-surface-container-highest text-on-surface",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        // MD3 Semantic Inverse Tokens
        "high-contrast": "bg-inverse-surface text-inverse-on-surface",
        ghost: "bg-transparent text-on-surface",
        surface: "bg-surface text-on-surface",
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
      onPointerDown,
      ...props
    },
    ref,
  ) => {
    const localRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => localRef.current!);

    // Ripple logic for High Contrast:
    // In Light mode, High Contrast is Dark -> Needs White Ripple
    // In Dark mode, High Contrast is Light -> Needs Black Ripple
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
          cardVariants({ shape, variant, padding, bordered, elevation }),
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
