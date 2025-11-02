import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import React, { useEffect, useImperativeHandle, useRef } from "react";

const textAreaWrapperVariants = cva(
  "flex items-start transition-all duration-200 w-full",
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
        sm: "py-2 text-sm",
        md: "py-3 text-base",
        lg: "py-4 text-lg",
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
        variant: "secondary",
        isErrored: false,
        isFocused: false,
        className: "border-transparent",
      },
      {
        variant: "primary",
        isFocused: true,
        isErrored: false,
        className: "border-graphite-primary",
      },
      {
        variant: "secondary",
        isFocused: true,
        isErrored: false,
        className: "border-graphite-primary",
      },
      {
        variant: "primary",
        isFocused: false,
        isErrored: true,
        className: "border-red-500",
      },
      {
        variant: "secondary",
        isFocused: false,
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

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  variant?: "primary" | "secondary" | "minimal";
  shape?: "full" | "minimal" | "sharp";
  size?: "sm" | "md" | "lg";
  label?: string;
  error?: string;
  wrapperClassName?: string;
}
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      id,
      label,
      error,
      disabled,
      shape,
      size,
      wrapperClassName,
      variant,
      onFocus,
      onBlur,
      onChange,
      rows = 3, // Default to 3 rows
      value,
      ...props
    },
    ref
  ) => {
    const uniqueId = React.useId();
    const textAreaId = id || uniqueId;
    const hasError = !!error;
    const [isFocused, setIsFocused] = React.useState(false);

    const localRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => localRef.current!);

    const resizeTextArea = () => {
      const textArea = localRef.current;
      if (textArea) {
        textArea.style.height = "auto";
        textArea.style.height = `${textArea.scrollHeight}px`;
      }
    };

    useEffect(() => {
      resizeTextArea();
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      resizeTextArea();
      onChange?.(e);
    };

    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label
            htmlFor={textAreaId}
            className="block text-sm font-medium text-graphite-foreground"
          >
            {label}
          </label>
        )}
        <div
          className={textAreaWrapperVariants({
            variant,
            shape,
            size,
            isErrored: hasError,
            isFocused,
            disabled,
            className: wrapperClassName,
          })}
        >
          <textarea
            id={textAreaId}
            ref={localRef}
            disabled={disabled}
            rows={rows}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            value={value}
            className={clsx(
              "w-full flex-1 bg-transparent focus:outline-none resize-none overflow-hidden text-graphite-foreground",
              "placeholder:text-graphite-foreground/60",
              "disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
        </div>
        {hasError && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
