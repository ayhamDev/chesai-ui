import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const cardVariants = cva(
  // Base classes from your original component
  "bg-graphite-card p-5 shadow-xs",
  {
    variants: {
      shape: {
        // Your original style corresponds to 'full'
        full: "rounded-3xl",
        // A less-rounded "minimal" option
        minimal: "rounded-xl",
        // A sharp, no-rounding option
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      shape: "minimal", // Match the original style by default
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, shape, ...props }, ref) => {
    return (
      <div
        className={cardVariants({ shape, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
