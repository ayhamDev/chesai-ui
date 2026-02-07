"use client";

import { clsx } from "clsx";
import React from "react";

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, label, ...props }, ref) => {
    const uniqueId = React.useId();
    const checkboxId = id || uniqueId;

    return (
      <div className="group inline-flex items-center">
        <div className="relative flex items-center justify-center h-6 w-6">
          {/* --- HOLLOW BLOOM EFFECT (State Layer) --- */}
          <div
            className={clsx(
              "absolute -inset-2.5 rounded-full transition-all duration-200 ease-out scale-50 opacity-0 pointer-events-none",
              "group-hover:scale-100 group-hover:opacity-100",
              // If the checkbox is checked, the bloom uses the primary color, otherwise on-surface
              "bg-on-surface/10 peer-checked:bg-primary/10",
            )}
          />

          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            className={clsx(
              "peer h-6 w-6 shrink-0 appearance-none transition-all duration-200 cursor-pointer",
              "rounded-lg border-2 z-10",
              // Unchecked state
              "border-outline-variant bg-transparent",
              // Checked state
              "checked:border-primary checked:bg-primary",
              // Focus state
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:checked:bg-outline-variant disabled:checked:border-outline-variant",
              className,
            )}
            {...props}
          />

          {/* The Checkmark Icon */}
          <CheckIcon
            className={clsx(
              "pointer-events-none absolute h-4 w-4 text-on-primary z-20",
              "stroke-[3.5]",
              "transition-transform duration-200 ease-in-out transform scale-0 peer-checked:scale-100",
            )}
          />
        </div>

        {label && (
          <label
            htmlFor={checkboxId}
            className={clsx(
              "ml-3 text-sm font-medium select-none transition-colors",
              "text-on-surface group-hover:text-on-surface-variant",
              props.disabled && "opacity-50",
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
