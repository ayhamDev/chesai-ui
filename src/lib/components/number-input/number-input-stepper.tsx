import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { clsx } from "clsx";

export interface NumberInputStepperProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "up" | "down";
}

export const NumberInputStepper = React.forwardRef<
  HTMLButtonElement,
  NumberInputStepperProps
>(({ direction, className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={clsx("flex items-center justify-center", className)}
      {...props}
    >
      {children ||
        (direction === "up" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        ))}
    </button>
  );
});

NumberInputStepper.displayName = "NumberInputStepper";
