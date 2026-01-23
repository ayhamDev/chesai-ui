import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React from "react";

const kbdVariants = cva(
  "inline-flex items-center justify-center font-mono font-medium text-on-surface transition-colors select-none",
  {
    variants: {
      variant: {
        // Default simulates a physical key
        default:
          "bg-surface-container-low border border-outline-variant border-b-2 shadow-sm",
        // Flat styling
        flat: "bg-surface-container-high border border-transparent",
        // Outline only
        outline: "bg-transparent border border-outline-variant",
        // Ghost for subtle hints
        ghost:
          "bg-transparent border border-transparent hover:bg-surface-container-highest/50",
      },
      size: {
        sm: "h-5 min-w-[1.25rem] text-[10px] px-1",
        md: "h-6 min-w-[1.5rem] text-xs px-1.5",
        lg: "h-8 min-w-[2rem] text-sm px-2.5",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-md",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "minimal",
    },
  }
);

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, variant, size, shape, ...props }, ref) => {
    return (
      <kbd
        className={clsx(kbdVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Kbd.displayName = "Kbd";
