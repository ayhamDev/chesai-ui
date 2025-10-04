import React from "react";
import { clsx } from "clsx";

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, id, label, ...props }, ref) => {
    const uniqueId = React.useId();
    const switchId = id || uniqueId;

    return (
      <label
        htmlFor={switchId}
        className="inline-flex items-center cursor-pointer"
      >
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            id={switchId}
            className="sr-only peer"
            {...props}
          />
          {/* The Track (w-12 = 48px, h-8 = 32px) - UPDATED */}
          <div
            className={clsx(
              "w-13 h-8 rounded-full transition-colors border border-graphite-primary/10", // w-12 h-8 applied
              "bg-graphite-border",
              "peer-checked:bg-graphite-primary",
              "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-graphite-ring peer-focus:ring-offset-2",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
            )}
          />
          {/* The Thumb (the circle) - UPDATED */}
          <div
            className={clsx(
              "absolute bg-white rounded-full transition-transform duration-200 ease-in-out shadow-lg",
              // ============================ UPDATED FIX ============================
              // New Track Dimensions: w-12 (48px), h-8 (32px)

              // 1. Thumb Size: Make the thumb slightly smaller than the track height (e.g., 28px for 32px track)
              // Using arbitrary values for exact pixel dimensions
              "h-[26.5px] w-[26.5px]", // 28px x 28px (h-7/w-7 is 1.75rem which is 28px)

              // 2. Initial Position: Center the 28px thumb in the 32px track
              // (32px (track height) - 28px (thumb size)) / 2 = 2px
              "top-[2.5px] left-[3px]", // top-0.5/left-0.5 is 2px

              // 3. Travel Distance: Track width (48px) - Thumb size (28px) - 2 * offset (4px) = 16px
              // 16px is translate-x-4
              "peer-checked:translate-x-5" // 16px
              // =======================================================================
            )}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm font-medium text-graphite-foreground select-none">
            {label}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = "Switch";
