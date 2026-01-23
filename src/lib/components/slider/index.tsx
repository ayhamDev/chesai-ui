"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

// --- STYLES ---

const rootVariants = cva(
  "relative flex w-full touch-none select-none items-center group/slider data-[disabled]:opacity-50",
  {
    variants: {
      visual: {
        line: "h-10", // Standard touch area height
        bar: "", // Height depends on size prop
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    compoundVariants: [
      // Bar Heights (MD3 Specs approx)
      { visual: "bar", size: "sm", className: "h-6" }, // Standard Bar
      { visual: "bar", size: "md", className: "h-12" }, // Default
      { visual: "bar", size: "lg", className: "h-16" }, // Tall/Quick Settings style
    ],
    defaultVariants: {
      visual: "bar",
      size: "md",
    },
  },
);

// The background track (Inactive part)
const trackVariants = cva("relative w-full overflow-hidden", {
  variants: {
    visual: {
      line: "h-1 rounded-full bg-surface-container-highest",
      bar: "h-full w-full rounded-[28px] bg-surface-container-highest",
    },
  },
  defaultVariants: {
    visual: "bar",
  },
});

// The active fill (Progress)
const rangeVariants = cva("absolute h-full", {
  variants: {
    visual: {
      line: "bg-primary",
      // Bar active track is usually Primary or Primary Container
      bar: "bg-primary group-data-[disabled]/slider:bg-on-surface/12",
    },
  },
  defaultVariants: {
    visual: "bar",
  },
});

// The thumb (Handle)
const thumbVariants = cva(
  "block focus:outline-none z-20 relative transition-all duration-150",
  {
    variants: {
      visual: {
        line:
          "h-5 w-5 rounded-full bg-primary shadow-sm hover:scale-110 " +
          "after:absolute after:inset-0 after:z-[-1] after:bg-primary after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out " +
          "hover:after:opacity-20 hover:after:scale-150",
        // Bar Thumb: A vertical pill with a thick ring to create the "Gap"
        bar: "focus:ring-2 group-active/slider:scale-y-110 group-active/slider:scale-x-90 focus:ring-primary rounded-full bg-primary group-active/slider:scale-y-110 group-active/slider:scale-x-90 shadow-sm",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    compoundVariants: [
      // Adjust thumb dimensions based on bar size to maintain proportions
      {
        visual: "bar",
        size: "sm",
        className: "h-[75px] w-[3px] top-9.5 -translate-y-1/2",
      },
      {
        visual: "bar",
        size: "md",
        className: "h-[75px] w-[3px] top-9.5 -translate-y-1/2",
      },
      {
        visual: "bar",
        size: "lg",
        className: "h-[75px] w-[3px] top-9.5 -translate-y-1/2",
      },
    ],
    defaultVariants: {
      visual: "bar",
      size: "md",
    },
  },
);

// --- HELPER COMPONENTS ---

// Tooltip Label (The bubble above the thumb)
const ValueLabel = ({ value }: { value: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, scale: 0.8 }}
    animate={{ opacity: 1, y: -48, scale: 1 }}
    exit={{ opacity: 0, y: 0, scale: 0.8 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"
  >
    <div className="relative flex items-center justify-center min-w-[32px] h-[32px] px-3 rounded-full bg-inverse-surface text-inverse-on-surface shadow-md">
      <span className="text-xs font-bold font-manrope whitespace-nowrap">
        {value}
      </span>
      <div className="absolute -bottom-1 w-2 h-2 bg-inverse-surface rotate-45 rounded-[1px]" />
    </div>
  </motion.div>
);

// Tick Marks (Steps)
const Ticks = ({
  count,
  min,
  max,
  activeRange,
  visual,
}: {
  count: number;
  min: number;
  max: number;
  activeRange: [number, number];
  visual: "line" | "bar";
}) => {
  if (count <= 0 || count > 50) return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <div className="relative w-full h-full mx-auto">
        {Array.from({ length: count + 1 }).map((_, i) => {
          if (visual === "bar" && (i === 0 || i === count)) return null;

          const percentage = (i / count) * 100;
          const isActive =
            percentage >= activeRange[0] && percentage <= activeRange[1];

          return (
            <div
              key={i}
              className={clsx(
                "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors",
                visual === "bar" ? "w-1 h-1" : "w-1 h-1",
                isActive
                  ? "bg-on-primary/50" // Visible on dark active track
                  : "bg-on-surface-variant/30", // Visible on light inactive track
              )}
              style={{ left: `${percentage}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

// --- PROPS ---

export interface SliderProps extends Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "value" | "defaultValue"
> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  variant?: "standard" | "centered" | "range";
  visual?: "line" | "bar";
  size?: "sm" | "md" | "lg";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  withTicks?: boolean;
  withLabel?: boolean;
  thumbRingColor?: string;
}

// --- COMPONENT ---

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      visual = "bar",
      size = "md",
      variant = "standard",
      min = 0,
      max = 100,
      step = 1,
      value: propValue,
      defaultValue,
      onValueChange,
      withTicks = false,
      withLabel = false,
      startIcon,
      endIcon,
      disabled,
      thumbRingColor,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState<number[]>(
      propValue ||
        defaultValue ||
        (variant === "range"
          ? [min, max]
          : variant === "centered"
            ? [(min + max) / 2]
            : [min]),
    );

    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
      if (propValue) setInternalValue(propValue);
    }, [propValue]);

    const handleValueChange = (newValues: number[]) => {
      if (!propValue) setInternalValue(newValues);
      onValueChange?.(newValues);
    };

    // Calculate Active Range for styling
    const getTrackStyle = () => {
      const val0 = internalValue[0] ?? min;
      const pct0 = Math.max(
        0,
        Math.min(100, ((val0 - min) / (max - min)) * 100),
      );

      if (variant === "range") {
        const val1 = internalValue[1] ?? max;
        const pct1 = Math.max(
          0,
          Math.min(100, ((val1 - min) / (max - min)) * 100),
        );
        const start = Math.min(pct0, pct1);
        return {
          left: `${start}%`,
          width: `${Math.abs(pct0 - pct1)}%`,
          range: [start, Math.max(pct0, pct1)] as [number, number],
        };
      }

      if (variant === "centered") {
        const center = (max + min) / 2;
        // Check if values are actually centered relative to min/max
        const centerPct = ((center - min) / (max - min)) * 100;

        if (val0 < center) {
          return {
            left: `${pct0}%`,
            width: `${centerPct - pct0}%`,
            range: [pct0, centerPct] as [number, number],
          };
        } else {
          return {
            left: `${centerPct}%`,
            width: `${pct0 - centerPct}%`,
            range: [centerPct, pct0] as [number, number],
          };
        }
      }

      // Standard
      return {
        left: "0%",
        width: `${pct0}%`,
        range: [0, pct0] as [number, number],
      };
    };

    const trackStyle = getTrackStyle();
    const tickCount = step ? Math.floor((max - min) / step) : 0;

    const ringWidth = 6;
    const thumbStyle =
      visual === "bar"
        ? {
            boxShadow: `0 0 0 ${ringWidth}px ${
              thumbRingColor || "var(--md-sys-color-surface)"
            }`,
          }
        : {};

    return (
      <div
        className={clsx(
          "flex items-center gap-4 w-full",
          visual === "line" && startIcon && "pl-0",
        )}
      >
        {/* Line Variant External Icon */}
        {visual === "line" && startIcon && (
          <div className="text-on-surface-variant">{startIcon}</div>
        )}

        <SliderPrimitive.Root
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={internalValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          className={clsx(rootVariants({ visual, size }), className)}
          {...props}
        >
          <SliderPrimitive.Track className={trackVariants({ visual })}>
            {/* Active Range Fill */}
            <div
              className={clsx(rangeVariants({ visual }))}
              style={{
                left: trackStyle.left,
                width: trackStyle.width,
              }}
            />

            {/* Ticks */}
            {withTicks && (
              <Ticks
                count={tickCount}
                min={min}
                max={max}
                activeRange={trackStyle.range}
                visual={visual}
              />
            )}

            {/* Bar Variant Internal Icons */}
            {visual === "bar" && startIcon && (
              <div
                className={clsx(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none [&_svg]:w-5 [&_svg]:h-5",
                  // If the track is filled at the start (standard/range), icon is on-primary.
                  // If centered and value > center, start is empty -> on-surface-variant.
                  // Simplified logic: Standard is always filled at start.
                  variant === "standard"
                    ? "text-on-primary"
                    : "text-on-surface-variant",
                )}
              >
                {startIcon}
              </div>
            )}
            {visual === "bar" && endIcon && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-on-surface-variant pointer-events-none [&_svg]:w-5 [&_svg]:h-5">
                {endIcon}
              </div>
            )}
          </SliderPrimitive.Track>

          {/* Thumbs */}
          {internalValue.map((val, i) => (
            <SliderPrimitive.Thumb
              key={i}
              className={clsx(thumbVariants({ visual, size }))}
              style={thumbStyle}
            >
              <AnimatePresence>
                {withLabel && (isHovered || isDragging) && (
                  <ValueLabel value={val} />
                )}
              </AnimatePresence>
            </SliderPrimitive.Thumb>
          ))}
          {visual === "bar" && variant === "standard" && !withTicks && (
            <div className="w-[5px] h-[5px] rounded-full bg-primary absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </SliderPrimitive.Root>

        {/* Line Variant External Icon */}
        {visual === "line" && endIcon && (
          <div className="text-on-surface-variant">{endIcon}</div>
        )}
      </div>
    );
  },
);

Slider.displayName = "Slider";
