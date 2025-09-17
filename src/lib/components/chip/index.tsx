import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import useRipple from "use-ripple-hook";

const chipVariants = cva(
  // Base classes for a fixed height, padding, and pill shape
  "inline-flex items-center justify-center h-10 px-4 rounded-full font-semibold text-sm border-2 transition-colors relative overflow-hidden disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // The main variant is its selection state
      selected: {
        true: "bg-graphite-primary text-graphite-primaryForeground border border-graphite-primary",
        false:
          "bg-transparent text-graphite-foreground border border-graphite-border hover:bg-graphite-secondary",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    { className, selected, children, disabled, startIcon, endIcon, ...props },
    ref
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

    // Ripple color changes based on the selection state
    const rippleColor = selected
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.1)";

    const rippleRef = localRef as React.RefObject<HTMLElement>;
    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 400,
      disabled: disabled,
    });

    return (
      <button
        className={chipVariants({ selected, className })}
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

Chip.displayName = "Chip";
