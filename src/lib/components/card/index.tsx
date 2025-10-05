import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import React from "react";

const cardVariants = cva(
  // Base classes: Removed hardcoded padding, as it's now a variant.
  "shadow-xs transition-colors duration-200",
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
      // New variant for controlling padding
      padding: {
        none: "p-0",
        sm: "p-2",
        md: "p-5", // This was the original hardcoded value
        lg: "p-8",
      },
    },
    // Set default variants, including the new padding
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      padding: "md", // Sets the default padding to p-5
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  // Destructure the new 'padding' prop
  ({ className, shape, variant, padding, ...props }, ref) => {
    return (
      <div
        // Pass the 'padding' prop to the cva function
        className={clsx(cardVariants({ shape, variant, padding }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
