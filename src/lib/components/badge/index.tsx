import { cva } from "class-variance-authority";
import React from "react";

const badgeVariants = cva(
  "inline-flex items-center border px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-primary text-on-primary hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80",
        destructive:
          "border-transparent bg-error text-on-error hover:bg-error/80",
        outline: "text-on-surface border-outline",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "full",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline";
  shape?: "full" | "minimal" | "sharp";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, shape, ...props }, ref) => {
    return (
      <div
        className={badgeVariants({ variant, shape, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
