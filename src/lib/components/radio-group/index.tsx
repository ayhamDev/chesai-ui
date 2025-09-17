import React from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react"; // We can use the Check icon for the inner dot

// --- Individual Radio Item ---
export interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, id, label, ...props }, ref) => {
    const uniqueId = React.useId();
    const radioId = id || uniqueId;

    return (
      <div className="inline-flex items-center">
        <div className="relative flex h-5 w-5 items-center justify-center">
          <input
            type="radio"
            ref={ref}
            id={radioId}
            className={clsx(
              "peer h-5 w-5 shrink-0 appearance-none rounded-full border-2 transition-colors duration-200",
              // Unchecked state
              "border-graphite-border",
              // Checked state
              "checked:border-graphite-primary",
              // Focus state
              "focus:outline-none focus:ring-2 focus:ring-graphite-ring focus:ring-offset-2",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:checked:border-graphite-border",
              className
            )}
            {...props}
          />
          {/* The Inner Dot */}
          <div
            className={clsx(
              "pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-graphite-primary",
              "transition-transform duration-200 ease-in-out transform scale-0 peer-checked:scale-100"
            )}
          />
        </div>
        {label && (
          <label
            htmlFor={radioId}
            className="ml-3 select-none text-sm font-medium text-graphite-foreground"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
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
    ref
  ) => {
    const uniqueId = React.useId();
    const groupName = name || uniqueId;
    const labelId = `radiogroup-label-${uniqueId}`;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            id={labelId}
            className="mb-2 block text-sm font-medium text-graphite-primary"
          >
            {label}
          </label>
        )}
        <div
          ref={ref}
          role="radiogroup"
          aria-labelledby={labelId}
          className={clsx("flex flex-col gap-3", className)}
          {...props}
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return child;

            // Inject props into each RadioGroup.Item
            return React.cloneElement(
              child as React.ReactElement<RadioGroupItemProps>,
              {
                name: groupName,
                checked: child.props.value === value,
                disabled: disabled || child.props.disabled,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  onValueChange?.(e.currentTarget.value);
                  child.props.onChange?.(e);
                },
              }
            );
          })}
        </div>
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

// Export as a compound component
const Radio = Object.assign(RadioGroup, { Item: RadioGroupItem });
export { Radio, RadioGroup, RadioGroupItem };
