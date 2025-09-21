import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import useRipple from "use-ripple-hook";

const buttonVariants = cva(
  "font-semibold cursor-pointer min-w-max focus:outline-none transition-all duration-300 ease-in-out flex items-center justify-center relative overflow-hidden",
  {
    variants: {
      variant: {
        primary:
          "bg-graphite-primary hover:shadow-md  text-graphite-primaryForeground hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        secondary:
          "bg-graphite-secondary text-graphite-secondaryForeground hover:bg-graphite-secondary/80  focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        ghost:
          "bg-transparent text-graphite-foreground hover:bg-graphite-secondary focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
        link: "bg-transparent text-graphite-primary hover:text-graphite-primary hover:underline !p-1 focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
      },
      // ============================ THIS IS THE FIX ============================
      // The size variant now includes an explicit height (h-*) to match IconButton.
      // Vertical padding (py-*) is adjusted for perfect vertical centering.
      size: {
        xs: "h-8 px-2 text-xs", // 32px
        sm: "h-10 px-4 text-sm", // 40px
        md: "h-12 px-6 text-base", // 48px - Note: text-base is better for this height
        lg: "h-14 px-8 text-lg", // 56px
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

// ... the rest of your Button component remains unchanged
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      children,
      disabled,
      startIcon,
      endIcon,
      ...props
    },
    ref
  ) => {
    // ... no changes to implementation
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);
    const rippleColor =
      variant === "primary" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.1)";
    const rippleRef = localRef as React.RefObject<HTMLElement>;
    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 400,
      disabled: disabled,
    });
    return (
      <button
        className={buttonVariants({ variant, size, shape, className })}
        ref={localRef}
        onPointerDown={event}
        disabled={disabled}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center">
          {startIcon && (
            <span className="mr-2 flex items-center">{startIcon}</span>
          )}
          {children}
          {endIcon && <span className="ml-2 flex items-center">{endIcon}</span>}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
