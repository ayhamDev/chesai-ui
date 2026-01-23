import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import React from "react";

const switchTrackVariants = cva(
  "transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed bg-outline-variant peer-checked:bg-primary shadow",
  {
    variants: {
      size: {
        sm: "w-10 h-6",
        md: "w-12 h-7",
        lg: "w-14 h-8",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "full",
    },
  }
);

const switchThumbVariants = cva(
  "absolute bg-surface-container-lowest transition-transform duration-200 ease-ios shadow-lg",
  {
    variants: {
      size: {
        sm: "h-5 w-5 top-[2px] left-[2px]",
        md: "h-6 w-6 top-[2px] left-[2px]",
        lg: "h-7 w-7 top-[2px] left-[2px]",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "full",
    },
  }
);

const translateMap: Record<"sm" | "md" | "lg", string> = {
  sm: "peer-checked:translate-x-4",
  md: "peer-checked:translate-x-5",
  lg: "peer-checked:translate-x-6",
};

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, id, label, size = "md", shape = "full", ...props }, ref) => {
    const uniqueId = React.useId();
    const switchId = id || uniqueId;

    return (
      <label
        htmlFor={switchId}
        className={clsx("inline-flex items-center cursor-pointer", className)}
      >
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            id={switchId}
            className="sr-only peer"
            {...props}
          />
          {/* The Track */}
          <div className={clsx(switchTrackVariants({ size, shape }))} />
          {/* The Thumb */}
          <div
            className={clsx(
              switchThumbVariants({ size, shape }),
              translateMap[size]
            )}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm font-medium text-on-surface select-none">
            {label}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = "Switch";
