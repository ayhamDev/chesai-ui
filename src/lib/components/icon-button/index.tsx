// src/lib/components/icon-button/index.tsx
"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import useRipple from "use-ripple-hook";
import { LoadingIndicator } from "../loadingIndicator";

export const iconButtonVariants = cva(
  "font-semibold select-none focus-visible:outline-none min-w-max transition-all duration-300 ease-in-out flex items-center justify-center relative overflow-hidden p-0 z-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary disabled:bg-primary/70 text-on-primary hover:opacity-90 focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-primary",
        secondary:
          "bg-secondary-container disabled:bg-secondary-container/70 text-on-secondary-container hover:bg-secondary-container/80 focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-primary",
        tertiary:
          "bg-tertiary-container disabled:bg-tertiary-container/70 text-on-tertiary-container hover:bg-tertiary-container/80 focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-tertiary",
        outline:
          "bg-transparent border border-outline text-primary disabled:opacity-50 disabled:border-outline/50 hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-primary",
        destructive:
          "bg-error text-on-error disabled:bg-error/70 hover:bg-error/90 focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-error",
        ghost:
          "bg-transparent text-on-surface-variant disabled:opacity-70 focus-visible:bg-primary/10 " +
          "after:absolute after:inset-0 after:z-[-1] after:bg-primary/20 after:opacity-0 after:scale-50 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out " +
          "hover:after:opacity-100 hover:after:scale-100 " +
          "disabled:after:opacity-0",
        link: "bg-transparent text-primary disabled:opacity-70 hover:text-primary hover:underline !p-1 focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-primary",
      },
      size: {
        // FIXED: Changed [&_svg] to [&>span_svg] to protect the LoadingIndicator
        xs: "h-8 [&>span_svg]:size-4",
        sm: "h-10 [&>span_svg]:size-5",
        md: "h-12 [&>span_svg]:size-6",
        lg: "h-14 [&>span_svg]:size-6",
        xl: "h-20 [&>span_svg]:size-8",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-2xl",
        sharp: "rounded-none",
      },
      containerShape: {
        normal: "",
        "wide-pill": "",
        "pill-long": "",
      },
      isLoading: {
        true: "cursor-wait pointer-events-none !opacity-100",
      },
    },
    compoundVariants: [
      { containerShape: "normal", size: "xs", className: "w-8" },
      { containerShape: "normal", size: "sm", className: "w-10" },
      { containerShape: "normal", size: "md", className: "w-12" },
      { containerShape: "normal", size: "lg", className: "w-14" },
      { containerShape: "normal", size: "xl", className: "w-20" },

      { containerShape: "wide-pill", size: "xs", className: "w-10" },
      { containerShape: "wide-pill", size: "sm", className: "w-12" },
      { containerShape: "wide-pill", size: "md", className: "w-14" },
      { containerShape: "wide-pill", size: "lg", className: "w-16" },
      { containerShape: "wide-pill", size: "xl", className: "w-24" },

      { containerShape: "pill-long", size: "xs", className: "w-6" },
      { containerShape: "pill-long", size: "sm", className: "w-8" },
      { containerShape: "pill-long", size: "md", className: "w-10" },
      { containerShape: "pill-long", size: "lg", className: "w-12" },
      { containerShape: "pill-long", size: "xl", className: "w-16" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      shape: "full",
      containerShape: "normal",
    },
  },
);

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "outline"
    | "destructive"
    | "ghost"
    | "link";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "full" | "minimal" | "sharp";
  containerShape?: "normal" | "wide-pill" | "pill-long";
  isLoading?: boolean;
}

// FIXED: Use !important to override the hardcoded w-12 h-12 in LoadingIndicator
const loaderSizeMap = {
  xs: "!w-5 !h-5",
  sm: "!w-6 !h-6",
  md: "!w-7 !h-7",
  lg: "!w-8 !h-8",
  xl: "!w-10 !h-10",
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      shape,
      containerShape = "normal",
      children,
      disabled,
      isLoading,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);
    const rippleRef = localRef as React.RefObject<HTMLElement>;

    const rippleColor =
      variant === "primary" || variant === "destructive"
        ? "var(--color-ripple-light)"
        : "var(--color-ripple-dark)";

    const [, event] = useRipple({
      ref: rippleRef,
      color: rippleColor,
      duration: 400,
      disabled: disabled || !!isLoading,
    });

    const [isPressed, setIsPressed] = useState(false);

    return (
      <button
        className={iconButtonVariants({
          variant,
          size,
          shape,
          containerShape,
          className,
          isLoading,
        })}
        ref={localRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          event(e);
          setIsPressed(true);
        }}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        disabled={disabled || !!isLoading}
        {...props}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            >
              <LoadingIndicator
                variant="material-morph"
                className={clsx(
                  loaderSizeMap[size || "md"], // Injects strictly enforced sizes
                  variant === "primary" || variant === "destructive"
                    ? "text-on-primary"
                    : "text-primary",
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.span
          key="content"
          initial={false}
          animate={{
            opacity: isLoading ? 0 : 1,
            scale: isLoading ? 0.5 : isPressed ? 0.85 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="relative z-10 flex items-center justify-center"
        >
          {children}
        </motion.span>
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
