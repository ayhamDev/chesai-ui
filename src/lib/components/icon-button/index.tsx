import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import useRipple from "use-ripple-hook";

const iconButtonVariants = cva(
  "font-semibold focus:outline-none transition-all duration-300 ease-in-out flex items-center justify-center relative overflow-hidden p-0",
  {
    variants: {
      variant: {
        primary:
          "bg-graphite-primary text-graphite-primaryForeground hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        secondary:
          "bg-graphite-secondary text-graphite-secondaryForeground hover:bg-graphite-secondary/80  focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        ghost:
          "bg-transparent text-graphite-foreground hover:bg-graphite-secondary focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        link: "bg-transparent text-graphite-primary hover:text-graphite-primary hover:underline !p-1 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
      },
      // ============================ THIS IS THE FIX ============================
      // Sizes are updated to match the new unified scale from the Button component.
      size: {
        xs: "h-8 w-8", // 32px
        sm: "h-10 w-10", // 40px
        md: "h-12 w-12", // 48px
        lg: "h-14 w-14", // 56px
      },
      // =======================================================================
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "full",
    },
  }
);

// ... the rest of your IconButton component remains unchanged
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, shape, children, disabled, ...props }, ref) => {
    // ... no changes to implementation
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);
    const rippleColor =
      variant === "primary" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.1)";
    const rippleRef = localRef as React.RefObject<HTMLElement>;
    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 600,
      disabled: disabled,
    });
    return (
      <button
        className={iconButtonVariants({ variant, size, shape, className })}
        ref={localRef}
        onPointerDown={event}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
