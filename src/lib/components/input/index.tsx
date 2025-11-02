import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import React from "react";

export const inputWrapperVariants = cva(
  "flex items-center transition-all duration-200 w-full",
  {
    variants: {
      variant: {
        primary: "bg-graphite-card border-2 px-4",
        secondary: "bg-graphite-secondary border-2 px-4",
        minimal: "bg-transparent p-0",
      },
      shape: {
        full: "rounded-4xl",
        minimal: "rounded-2xl",
        sharp: "rounded-none",
      },
      size: {
        sm: "h-10 text-sm",
        md: "h-12 text-base",
        lg: "h-14 text-lg",
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
        isFocused: false,
        className: "border-graphite-border",
      },
      {
        variant: "primary",
        isFocused: true,
        isErrored: false,
        className: "border-graphite-primary",
      },
      {
        variant: "primary",
        isErrored: true,
        className: "border-red-500",
      },
      {
        variant: "primary",
        isFocused: true,
        isErrored: true,
        className: "border-red-600",
      },
      {
        variant: "secondary",
        isErrored: false,
        isFocused: false,
        className: "border-transparent",
      },
      {
        variant: "secondary",
        isFocused: true,
        isErrored: false,
        className: "border-graphite-primary",
      },
      {
        variant: "secondary",
        isErrored: true,
        className: "border-red-500",
      },
      {
        variant: "secondary",
        isFocused: true,
        isErrored: true,
        className: "border-red-600",
      },
      {
        variant: "minimal",
        className: "rounded-none border-0",
      },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "primary" | "secondary" | "minimal";
  shape?: "full" | "minimal" | "sharp";
  size?: "sm" | "md" | "lg";
  label?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  error?: string;
  wrapperClassName?: string;
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
      size,
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
        if (!/^\d*\.?\d*$/.test(pastedText)) {
          e.preventDefault();
        }
      }
      onPaste?.(e);
    };

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
            size,
            isErrored: hasError,
            isFocused,
            disabled,
            className: wrapperClassName,
          })}
        >
          {startAdornment && (
            <div className="flex items-center mr-2">{startAdornment}</div>
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
              "w-full flex-1 bg-transparent focus:outline-none text-graphite-foreground",
              "placeholder:text-graphite-foreground/60",
              "disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
          {endAdornment && (
            <div className="flex items-center ml-2">{endAdornment}</div>
          )}
        </div>
        {hasError && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
