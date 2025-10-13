import { cva } from "class-variance-authority";
import React from "react";

const badgeVariants = cva(
  // Base classes: Increased padding with px-3
  "inline-flex items-center border px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-graphite-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-graphite-primary text-graphite-primaryForeground hover:bg-graphite-primary/80",
        secondary:
          "border-transparent bg-graphite-secondary text-graphite-secondaryForeground hover:bg-graphite-secondary/80",
        // Destructive variant is now a solid, bold red
        destructive:
          "border-transparent bg-red-500 text-graphite-primaryForeground hover:bg-red-600/80",
        outline: "text-graphite-foreground border-graphite-border",
      },
      shape: {
        // Added shape variants
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "full", // Default to a pill shape
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
