"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import React, { useState } from "react";

// --- VARIANTS ---

const switchTrackVariants = cva(
  // REMOVED: overflow-hidden to allow the bloom/halo to expand beyond track boundaries
  "relative border-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 outline-none rounded-full transition-colors duration-300",
  {
    variants: {
      size: {
        sm: "w-10 h-6",
        md: "w-[52px] h-8",
        lg: "w-16 h-10",
      },
      checked: {
        true: "bg-primary border-primary",
        false: "bg-surface-container-highest border-outline",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const springTransition = {
  type: "spring",
  stiffness: 700,
  damping: 30,
};

const iconTransition = {
  type: "spring",
  stiffness: 500,
  damping: 25,
};

export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "onChange"
> {
  size?: "sm" | "md" | "lg";
  label?: string;
  description?: string;
  withIcons?: boolean;
  showUncheckedIcon?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      size = "md",
      label,
      description,
      withIcons = true,
      showUncheckedIcon = false,
      checked: controlledChecked,
      defaultChecked,
      onCheckedChange,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const uniqueId = React.useId();
    const switchId = id || uniqueId;

    const [internalChecked, setInternalChecked] = useState(
      defaultChecked ?? false,
    );
    const isChecked =
      controlledChecked !== undefined ? controlledChecked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const newValue = e.target.checked;
      if (controlledChecked === undefined) setInternalChecked(newValue);
      onCheckedChange?.(newValue);
      props.onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const newValue = !isChecked;
        if (controlledChecked === undefined) setInternalChecked(newValue);
        onCheckedChange?.(newValue);
      }
    };

    const getThumbAnimation = () => {
      switch (size) {
        case "sm":
          return {
            width: isChecked ? 16 : 12,
            height: isChecked ? 16 : 12,
            x: isChecked ? 20 : 5,
          };
        case "lg":
          return {
            width: isChecked ? 32 : 24,
            height: isChecked ? 32 : 24,
            x: isChecked ? 26 : 8,
          };
        case "md":
        default:
          return {
            width: isChecked ? 24 : 16,
            height: isChecked ? 24 : 16,
            x: isChecked ? 24 : 7,
          };
      }
    };

    const animState = getThumbAnimation();
    const iconSizePixel = size === "sm" ? 10 : size === "lg" ? 20 : 16;

    return (
      <div className={clsx("inline-flex items-center gap-3", className)}>
        <label
          htmlFor={switchId}
          className={clsx(
            "relative inline-flex items-center group outline-none rounded-full select-none",
            !disabled && "cursor-pointer",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
        >
          <input
            type="checkbox"
            id={switchId}
            ref={ref}
            className="sr-only"
            checked={isChecked}
            onChange={handleChange}
            disabled={disabled}
            tabIndex={-1}
            {...props}
          />

          <div
            className={clsx(
              switchTrackVariants({ size, checked: isChecked }),
              disabled && isChecked && "bg-on-surface/12 border-transparent",
              disabled &&
                !isChecked &&
                "bg-surface-container-highest/38 border-on-surface/12",
            )}
          >
            <motion.div
              layout
              transition={springTransition}
              initial={false}
              animate={{
                x: animState.x,
                width: animState.width,
                height: animState.height,
                backgroundColor: isChecked
                  ? "var(--md-sys-color-on-primary)"
                  : "var(--md-sys-color-outline-variant)",
              }}
              className={clsx(
                "absolute top-1/2 -translate-y-1/2 rounded-full shadow-sm flex items-center justify-center z-10",
                disabled && "!bg-on-surface/38",
              )}
            >
              {/* STATE LAYER (Bloom Effect on Hover) */}
              {!disabled && (
                <div
                  className={clsx(
                    "absolute rounded-full transition-all duration-200 ease-out opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 pointer-events-none",
                    // FIX: Use white/on-primary overlay when checked so it's visible against the primary track
                    isChecked ? "bg-white/20" : "bg-on-surface/15",
                  )}
                  style={{
                    // Halo size logic
                    inset: isChecked ? "-10px" : "-12px",
                  }}
                />
              )}

              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {withIcons && (
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isChecked ? 1 : 0,
                      opacity: isChecked ? 1 : 0,
                      rotate: isChecked ? 0 : -90,
                    }}
                    transition={iconTransition}
                  >
                    <Check
                      size={iconSizePixel}
                      strokeWidth={4}
                      className="text-on-primary-container"
                    />
                  </motion.div>
                )}

                {showUncheckedIcon && (
                  <motion.div
                    initial={false}
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      scale: !isChecked ? 1 : 0,
                      opacity: !isChecked ? 1 : 0,
                      rotate: !isChecked ? 0 : 90,
                    }}
                    transition={iconTransition}
                  >
                    <X
                      size={iconSizePixel - 2}
                      strokeWidth={3}
                      className="text-surface-container-highest"
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </label>

        {(label || description) && (
          <div
            className={clsx("flex flex-col", !disabled && "cursor-pointer")}
            onClick={() =>
              !disabled &&
              handleChange({ target: { checked: !isChecked } } as any)
            }
          >
            {label && (
              <span
                className={clsx(
                  "text-sm font-medium select-none",
                  disabled ? "text-on-surface/38" : "text-on-surface",
                )}
              >
                {label}
              </span>
            )}
            {description && (
              <span
                className={clsx(
                  "text-xs select-none",
                  disabled
                    ? "text-on-surface-variant/38"
                    : "text-on-surface-variant",
                )}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

Switch.displayName = "Switch";
