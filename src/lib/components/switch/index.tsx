"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import React, { useState } from "react";

// --- VARIANTS ---

const switchTrackVariants = cva(
  "relative border-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden outline-none rounded-full transition-colors duration-300",
  {
    variants: {
      size: {
        // MD3 Standard: 52dp x 32dp
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

// --- ANIMATION CONFIG ---

// The "Expressive" spring config
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

    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const newValue = e.target.checked;
      if (!isControlled) setInternalChecked(newValue);
      onCheckedChange?.(newValue);
      props.onChange?.(e);
    };

    // Keyboard support: Enter/Space toggles state
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const newValue = !isChecked;
        if (!isControlled) setInternalChecked(newValue);
        onCheckedChange?.(newValue);
      }
    };

    // --- DYNAMIC SIZING LOGIC ---
    // Calculates the spring target positions based on size prop
    const getThumbAnimation = () => {
      switch (size) {
        case "sm":
          return {
            width: isChecked ? 16 : 12, // 16px checked, 12px unchecked
            height: isChecked ? 16 : 12,
            x: isChecked ? 20 : 5, // Target X coordinates
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
            // Unchecked: 16px. Checked: 24px.
            width: isChecked ? 24 : 16,
            height: isChecked ? 24 : 16,
            // Unchecked: Left 7px. Checked: Left 24px.
            x: isChecked ? 24 : 7,
          };
      }
    };

    const animState = getThumbAnimation();
    const iconSizePixel = size === "sm" ? 10 : size === "lg" ? 20 : 16;

    return (
      <div className={clsx("inline-flex items-center gap-3", className)}>
        {/* Label acts as the interactive container */}
        <label
          htmlFor={switchId}
          className={clsx(
            "relative inline-flex items-center group outline-none rounded-full select-none",
            !disabled && "cursor-pointer",
            // Focus ring
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
            tabIndex={-1} // Handled by label wrapper
            {...props}
          />

          {/* TRACK */}
          <div
            className={clsx(
              switchTrackVariants({ size, checked: isChecked }),
              // MD3 Disabled Styles
              disabled && isChecked && "bg-on-surface/12 border-transparent",
              disabled &&
                !isChecked &&
                "bg-surface-container-highest/38 border-on-surface/12",
            )}
          >
            {/* THUMB (Animated) */}
            <motion.div
              layout // Enables layout morphing
              transition={springTransition}
              initial={false}
              animate={{
                x: animState.x,
                width: animState.width,
                height: animState.height,
                backgroundColor: isChecked
                  ? "var(--md-sys-color-on-primary)" // Checked: White/Dark Brown
                  : "var(--md-sys-color-outline-variant)", // Unchecked: Grey
              }}
              className={clsx(
                "absolute top-1/2 -translate-y-1/2 rounded-full shadow-sm flex items-center justify-center z-10",
                // Disabled override for thumb color
                disabled && "!bg-on-surface/38",
              )}
            >
              {/* STATE LAYER (Bloom Effect on Hover) */}
              {!disabled && (
                <div
                  className={clsx(
                    "absolute rounded-full transition-all duration-200 ease-out opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 pointer-events-none",
                    isChecked ? "bg-primary/15" : "bg-on-surface/15",
                  )}
                  style={{
                    // The halo size is relative to the thumb size to keep proportions
                    inset: isChecked ? "-8px" : "-10px",
                  }}
                />
              )}

              {/* ICON WRAPPER */}
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* Check Icon */}
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
                      // High contrast token
                      className="text-on-primary-container"
                    />
                  </motion.div>
                )}

                {/* X Icon (Optional) */}
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

        {/* LABEL TEXT */}
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
