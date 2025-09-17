import { clsx } from "clsx";
import React from "react";

// Using the exact CheckIcon component you provided.
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

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, label, ...props }, ref) => {
    const uniqueId = React.useId();
    const checkboxId = id || uniqueId;

    return (
      <div className="inline-flex items-center">
        {/* Container is now h-6 w-6 to match the design */}
        <div className="relative flex items-center justify-center h-6 w-6">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            className={clsx(
              "peer h-6 w-6 shrink-0 appearance-none transition-colors duration-200",
              // Changed to rounded-lg for the softer, squircle shape
              "rounded-lg",
              // Unchecked state with a border-2 to match the visual weight
              "border-2 border-graphite-border",
              // Checked state
              "checked:border-graphite-primary checked:bg-graphite-primary",
              // Focus state
              "focus:outline-none focus:ring-2 focus:ring-graphite-ring focus:ring-offset-2",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:checked:bg-graphite-border disabled:checked:border-graphite-border",
              className
            )}
            {...props}
          />
          <CheckIcon
            className={clsx(
              "pointer-events-none absolute h-4 w-4 text-graphite-primaryForeground",
              // Increased stroke weight for better visibility and to match the design
              "stroke-[3.5]",
              // Animation scales the icon in when the peer input is checked
              "transition-transform duration-200 ease-in-out transform scale-0 peer-checked:scale-100"
            )}
          />
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="ml-3 text-sm font-medium text-graphite-foreground select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
