"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React, { forwardRef } from "react";
import useRipple from "use-ripple-hook";
import { Shape } from "./index";
import { type ShapeType } from "./paths";

// --- 1. SHAPED ICON (Wrapper) ---
export interface ShapedIconProps extends React.SVGProps<SVGSVGElement> {
  shape: ShapeType;
  size?: number | string;
}

export const ShapedIcon = forwardRef<SVGSVGElement, ShapedIconProps>(
  ({ shape, size = 24, className, style, ...props }, ref) => {
    return (
      <Shape
        ref={ref}
        shape={shape}
        className={clsx("text-current", className)}
        style={{ width: size, height: size, ...style }}
        {...props}
      />
    );
  }
);
ShapedIcon.displayName = "ShapedIcon";

// --- 2. SHAPED ICON BUTTON ---

const shapedButtonVariants = cva(
  // Use drop-shadow transition for smooth interactions
  "group relative flex items-center justify-center cursor-pointer focus:outline-none transition-all duration-300 active:scale-95",
  {
    variants: {
      variant: {
        primary: "text-graphite-primary",
        secondary: "text-graphite-secondary",
        ghost: "text-transparent hover:text-graphite-secondary",
        destructive: "text-red-500",
      },
      size: {
        sm: "w-10 h-10",
        md: "w-14 h-14",
        lg: "w-20 h-20",
      },
      // NEW: Drop Shadow variants
      // These respect the SVG path transparency
      shadow: {
        none: "",
        sm: "drop-shadow-sm",
        md: "drop-shadow-md",
        lg: "drop-shadow-lg",
        xl: "drop-shadow-xl",
        "2xl": "drop-shadow-2xl",
        glow: "drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]", // Example custom glow
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shadow: "none",
    },
  }
);

export interface ShapedIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shapedButtonVariants> {
  shape: ShapeType;
  morphEase?: number[];
  morphDuration?: number;
}

export const ShapedIconButton = forwardRef<
  HTMLButtonElement,
  ShapedIconButtonProps
>(
  (
    {
      className,
      shape,
      variant,
      size,
      shadow,
      children,
      morphEase,
      morphDuration,
      ...props
    },
    ref
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current!);
    const [, event] = useRipple({
      ref: localRef,
      color: "rgba(255, 255, 255, 0.3)",
      duration: 400,
    });

    const contentColorClass =
      variant === "primary" || variant === "destructive"
        ? "text-white dark:text-graphite-background"
        : "text-graphite-foreground";

    return (
      <button
        ref={localRef}
        onPointerDown={event}
        // Apply shadow here on the parent. Because the Shape is an SVG inside,
        // drop-shadow will trace the SVG path.
        className={clsx(
          shapedButtonVariants({ variant, size, shadow, className })
        )}
        {...props}
      >
        {/* Shape Background */}
        <Shape
          shape={shape}
          duration={morphDuration}
          ease={morphEase}
          className="absolute inset-0 w-full h-full fill-current transition-colors duration-300"
        />

        {/* Icon Content */}
        <div className={clsx("relative z-10", contentColorClass)}>
          {children}
        </div>
      </button>
    );
  }
);
ShapedIconButton.displayName = "ShapedIconButton";

// --- 3. SHAPED BADGE ---

const shapedBadgeVariants = cva(
  "relative inline-flex items-center justify-center font-bold select-none transition-all duration-300",
  {
    variants: {
      variant: {
        primary: "text-graphite-primary",
        secondary: "text-graphite-secondary",
        destructive: "text-red-500",
        outline: "text-transparent stroke-graphite-border stroke-2",
      },
      size: {
        sm: "w-6 h-6 text-[10px]",
        md: "w-8 h-8 text-xs",
        lg: "w-12 h-12 text-sm",
      },
      shadow: {
        none: "",
        sm: "drop-shadow-sm",
        md: "drop-shadow-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shadow: "none",
    },
  }
);

export interface ShapedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shapedBadgeVariants> {
  shape: ShapeType;
}

export const ShapedBadge = forwardRef<HTMLDivElement, ShapedBadgeProps>(
  ({ className, shape, variant, size, shadow, children, ...props }, ref) => {
    const contentColorClass =
      variant === "primary" || variant === "destructive"
        ? "text-white dark:text-graphite-background"
        : "text-graphite-foreground";

    // For outline variant, we need to handle SVG stroke logic
    const isOutline = variant === "outline";

    return (
      <div
        ref={ref}
        className={clsx(
          shapedBadgeVariants({ variant, size, shadow, className })
        )}
        {...props}
      >
        <Shape
          shape={shape}
          className={clsx(
            "absolute inset-0 w-full h-full",
            isOutline
              ? "fill-transparent stroke-current stroke-[20px]"
              : "fill-current"
          )}
          // If outline, we need to adjust viewBox or scale slightly in a real app,
          // but for now standard fill works best for shadows.
        />
        <span className={clsx("relative z-10", contentColorClass)}>
          {children}
        </span>
      </div>
    );
  }
);
ShapedBadge.displayName = "ShapedBadge";

// --- 4. SHAPED BUTTON (Alias) ---
export const ShapedButton = ShapedIconButton;
