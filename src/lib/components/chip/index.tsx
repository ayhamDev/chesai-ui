import { cva } from "class-variance-authority";
import React from "react";
import useRipple from "use-ripple-hook";

const chipVariants = cva(
  "inline-flex items-center justify-center h-10 px-4 rounded-full font-semibold text-sm border transition-colors relative overflow-hidden disabled:pointer-events-none disabled:opacity-50 z-0",
  {
    variants: {
      selected: {
        true: "bg-secondary-container text-on-secondary-container border-transparent",
        false:
          "bg-transparent text-on-surface-variant border-outline " +
          "after:absolute after:inset-0 after:z-[-1] after:bg-on-surface/10 after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out " +
          "hover:after:opacity-100 hover:after:scale-100",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    { className, selected, children, disabled, startIcon, endIcon, ...props },
    ref,
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

    const rippleColor = selected
      ? "var(--color-ripple-light)"
      : "var(--color-ripple-dark)";

    const rippleRef = localRef as React.RefObject<HTMLElement>;
    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 400,
      // Fix: Removed invalid opacity property
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
  },
);

Chip.displayName = "Chip";
