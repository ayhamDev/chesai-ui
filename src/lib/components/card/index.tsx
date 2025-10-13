import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import React from "react";

const cardVariants = cva(
  // Base classes
  "shadow-xs transition-colors duration-200",
  {
    variants: {
      variant: {
        primary: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
        /** A semi-transparent, blurred background effect. Best used on a colorful or textured background. */
        glass:
          "bg-white/5 backdrop-blur-lg border border-white/10 text-graphite-primaryForeground",
      },
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      padding: {
        none: "p-0",
        sm: "p-2",
        md: "p-5",
        lg: "p-8",
      },
      isSelected: {
        true: "border-2 border-graphite-primary",
        false: " border-2 border-transparent", // No border by default
      },
    },
    // Special case for the glass variant to use its own border style
    compoundVariants: [
      {
        variant: "glass",
        isSelected: false,
        className: "border border-white/10",
      },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      padding: "md",
      isSelected: false,
    },
  }
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "glass";
  shape?: "full" | "minimal" | "sharp";
  padding?: "none" | "sm" | "md" | "lg";
  isSelected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, shape, variant, padding, isSelected, ...props }, ref) => {
    return (
      <div
        className={clsx(
          cardVariants({ shape, variant, padding, isSelected }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
