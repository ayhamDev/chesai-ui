"use client";

import { clsx } from "clsx";
import React from "react";

// --- Individual Radio Item ---
export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value?: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, id, label, ...props }, ref) => {
    const uniqueId = React.useId();
    const radioId = id || uniqueId;

    return (
      <div className="group inline-flex items-center cursor-pointer">
        <div className="relative flex h-5 w-5 items-center justify-center">
          {/* --- HALO / BLOOM EFFECT --- */}
          <div
            className={clsx(
              "absolute -inset-2.5 rounded-full pointer-events-none z-0",
              "transition-all duration-200 ease-out scale-50 opacity-0",
              // Base state (Unchecked Hover)
              "bg-on-surface/10",
              // Checked state triggers (Checked Hover)
              "peer-checked:bg-primary/10",
              // Interaction States
              "group-hover:scale-100 group-hover:opacity-100",
              "peer-focus-visible:scale-100 peer-focus-visible:opacity-100 peer-focus-visible:bg-primary/15",
            )}
          />

          <input
            type="radio"
            ref={ref}
            id={radioId}
            className={clsx(
              "peer h-5 w-5 shrink-0 appearance-none rounded-full border-2 transition-colors duration-200 z-10 cursor-pointer",
              // Unchecked state
              "border-outline-variant bg-transparent",
              // Checked state
              "checked:border-primary",
              // Focus state (Ring)
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:checked:border-outline-variant",
              className,
            )}
            {...props}
          />

          {/* The Inner Dot */}
          <div
            className={clsx(
              // Added explicit absolute centering: top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              "pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary z-20",
              "transition-transform duration-200 ease-in-out transform scale-0 peer-checked:scale-100",
              // Handle disabled inner dot color
              "peer-disabled:bg-outline-variant",
            )}
          />
        </div>
        {label && (
          <label
            htmlFor={radioId}
            className={clsx(
              "ml-3 select-none text-sm font-medium text-on-surface transition-colors cursor-pointer",
              "group-hover:text-on-surface-variant",
              props.disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
RadioGroupItem.displayName = "RadioGroup.Item";

// --- Radio Group Container ---
interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      label,
      children,
      value,
      onValueChange,
      name,
      disabled,
      ...props
    },
    ref,
  ) => {
    const uniqueId = React.useId();
    const groupName = name || uniqueId;
    const labelId = `radiogroup-label-${uniqueId}`;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <div
            id={labelId}
            className="mb-2 block text-sm font-medium text-primary"
          >
            {label}
          </div>
        )}
        <div
          ref={ref}
          role="radiogroup"
          aria-labelledby={label ? labelId : undefined}
          className={clsx("flex flex-col gap-3", className)}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement<RadioGroupItemProps>(child)) return child;

            return React.cloneElement(child, {
              name: groupName,
              checked: child.props.value === value,
              disabled: disabled || child.props.disabled,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                onValueChange?.(e.currentTarget.value);
                child.props.onChange?.(e);
              },
            });
          })}
        </div>
      </div>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

const Radio = Object.assign(RadioGroup, { Item: RadioGroupItem });
export { Radio, RadioGroup, RadioGroupItem };
