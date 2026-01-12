"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React from "react";
import { Typography } from "../typography";

const dividerVariants = cva("flex items-center shrink-0", {
  variants: {
    orientation: {
      horizontal: "w-full flex-row my-4",
      vertical: "h-auto min-h-[1em] flex-col mx-4 self-stretch",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

const lineVariants = cva("flex-1", {
  variants: {
    orientation: {
      horizontal: "h-px",
      vertical: "w-px h-full",
    },
    variant: {
      solid: "bg-graphite-border",
      dashed: "bg-transparent border-graphite-border",
      dotted: "bg-transparent border-graphite-border",
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      variant: "dashed",
      className: "border-b border-dashed h-0",
    },
    {
      orientation: "horizontal",
      variant: "dotted",
      className: "border-b border-dotted h-0",
    },
    {
      orientation: "vertical",
      variant: "dashed",
      className: "border-r border-dashed w-0",
    },
    {
      orientation: "vertical",
      variant: "dotted",
      className: "border-r border-dotted w-0",
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    variant: "solid",
  },
});

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  /**
   * The visual style of the line.
   * @default "solid"
   */
  variant?: "solid" | "dashed" | "dotted";
  /**
   * Alignment of the content when orientation is horizontal.
   * @default "center"
   */
  textAlign?: "start" | "center" | "end";
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      className,
      orientation = "horizontal",
      variant = "solid",
      textAlign = "center",
      children,
      ...props
    },
    ref
  ) => {
    const hasContent = React.Children.count(children) > 0;

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={clsx(
          dividerVariants({ orientation }),
          hasContent && "gap-4",
          className
        )}
        {...props}
      >
        {/* Leading Line */}
        {(!hasContent ||
          (orientation === "horizontal" &&
            (textAlign === "center" || textAlign === "end")) ||
          orientation === "vertical") && (
          <div className={clsx(lineVariants({ orientation, variant }))} />
        )}

        {/* Content */}
        {hasContent && (
          <span className="shrink-0">
            {typeof children === "string" ? (
              <Typography
                variant="small"
                className="text-graphite-foreground/60 font-medium"
              >
                {children}
              </Typography>
            ) : (
              children
            )}
          </span>
        )}

        {/* Trailing Line */}
        {hasContent &&
          ((orientation === "horizontal" &&
            (textAlign === "center" || textAlign === "start")) ||
            orientation === "vertical") && (
            <div className={clsx(lineVariants({ orientation, variant }))} />
          )}
      </div>
    );
  }
);

Divider.displayName = "Divider";
