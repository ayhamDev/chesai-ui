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
          {/* The Track (w-10 = 40px, h-6 = 24px) */}
          <div
            className={clsx(
              "w-10 h-6 rounded-full transition-colors",
              "bg-graphite-border",
              "peer-checked:bg-graphite-primary",
              "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-graphite-ring peer-focus:ring-offset-2",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
            )}
          />
          {/* The Thumb (the circle) */}
          <div
            className={clsx(
              "absolute bg-white rounded-full transition-transform duration-200 ease-in-out shadow-lg",
              // ============================ THIS IS THE FIX ============================
              // Using arbitrary values for exact pixel dimensions
              "h-[17.5px] w-[17.5px]",
              // Recalculated positioning to perfectly center the 17.5px thumb in the 24px track
              // (24px - 17.5px) / 2 = 3.25px
              "top-[3.25px] left-[3.25px]",
              // Recalculated travel distance:
              // 40px (track) - 17.5px (thumb) - 6.5px (offsets) = 16px (translate-x-4)
              "peer-checked:translate-x-4"
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
