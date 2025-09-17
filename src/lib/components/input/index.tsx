import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React from "react";

// ... cva definition remains the same ...
const inputWrapperVariants = cva(
  "flex items-center transition-all duration-200 w-full px-4 border-2",
  {
    variants: {
      variant: {
        primary: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-2xl",
        sharp: "rounded-none",
      },
      isErrored: { true: "" },
      isFocused: { true: "" },
      disabled: {
        true: "bg-graphite-secondary opacity-50 cursor-not-allowed",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        isErrored: false,
        className: "border-graphite-border",
      },
      {
        variant: "secondary",
        isErrored: false,
        className: "border-transparent",
      },
      {
        isFocused: true,
        isErrored: false,
        className: "border-graphite-primary",
      },
      { isFocused: false, isErrored: true, className: "border-red-500" },
      { isFocused: true, isErrored: true, className: "border-red-600" },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
    },
  }
);

// ... props interface remains the same ...
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  error?: string;
  shape?: "full" | "minimal" | "sharp";
  wrapperClassName?: string;
  variant?: "primary" | "secondary";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      startAdornment,
      endAdornment,
      error,
      disabled,
      shape,
      wrapperClassName,
      variant,
      onFocus,
      onBlur,
      onKeyDown,
      onPaste,
      type,
      ...props
    },
    ref
  ) => {
    // ... state and focus/blur handlers remain the same ...
    const uniqueId = React.useId();
    const inputId = id || uniqueId;
    const hasError = !!error;
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // ============================ START: UPDATED NUMBER LOGIC ============================
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (type === "number") {
        const { value } = e.currentTarget;
        const allowedKeys = [
          "Backspace",
          "Delete",
          "Tab",
          "Escape",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ];

        // 1. Allow a single decimal point
        if (e.key === "." && !value.includes(".")) {
          return;
        }

        if (allowedKeys.includes(e.key)) {
          return;
        }

        if (e.ctrlKey || e.metaKey) {
          return;
        }

        if (!/^[0-9]$/.test(e.key)) {
          e.preventDefault();
        }
      }
      onKeyDown?.(e);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (type === "number") {
        const pastedText = e.clipboardData.getData("text");
        // 2. Updated regex to allow for valid floating-point numbers
        if (!/^\d*\.?\d*$/.test(pastedText)) {
          e.preventDefault();
        }
      }
      onPaste?.(e);
    };
    // ============================= END: UPDATED NUMBER LOGIC ==============================

    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-graphite-primary"
          >
            {label}
          </label>
        )}
        <div
          className={inputWrapperVariants({
            variant,
            shape,
            isErrored: hasError,
            isFocused,
            disabled,
            className: wrapperClassName,
          })}
        >
          {startAdornment && (
            <div className="flex items-center  mr-2">{startAdornment}</div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            type={type}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className={clsx(
              "w-full flex-1 bg-transparent focus:outline-none py-4",
              "disabled:cursor-not-allowed",
              variant === "secondary" && "placeholder:text-gray-500",
              className
            )}
            {...props}
          />
          {endAdornment && (
            <div className="flex items-center  ml-2">{endAdornment}</div>
          )}
        </div>
        {hasError && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
