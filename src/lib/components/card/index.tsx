import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const cardVariants = cva(
  // Base classes: Added transition for smooth color/border changes
  "p-5 shadow-xs transition-colors duration-200",
  {
    variants: {
      variant: {
        primary: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
        // Selected variant adds a border to indicate its state
        selected: "bg-graphite-card border-2 border-graphite-primary",
      },
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
    },
    // Set default variant to primary
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, shape, variant, ...props }, ref) => {
    return (
      <div
        className={cardVariants({ shape, variant, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
