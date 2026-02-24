"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect } from "react";

// --- STYLES ---

const rootVariants = cva(
  "relative flex touch-none select-none group/slider data-[disabled]:opacity-50",
  {
    variants: {
      orientation: {
        horizontal: "w-full items-center",
        vertical: "h-full flex-col justify-center items-center",
      },
      visual: {
        line: "",
        bar: "",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    compoundVariants: [
      // --- Horizontal Heights (Bar) ---
      { orientation: "horizontal", visual: "line", className: "h-10" },
      {
        orientation: "horizontal",
        visual: "bar",
        size: "sm",
        className: "h-6",
      },
      {
        orientation: "horizontal",
        visual: "bar",
        size: "md",
        className: "h-12",
      },
      {
        orientation: "horizontal",
        visual: "bar",
        size: "lg",
        className: "h-16",
      },

      // --- Vertical Widths (Bar) ---
      { orientation: "vertical", visual: "line", className: "w-10" },
      { orientation: "vertical", visual: "bar", size: "sm", className: "w-6" },
      { orientation: "vertical", visual: "bar", size: "md", className: "w-12" },
      { orientation: "vertical", visual: "bar", size: "lg", className: "w-16" },
    ],
    defaultVariants: {
      visual: "bar",
      size: "md",
      orientation: "horizontal",
    },
  },
);

const trackVariants = cva("relative overflow-hidden", {
  variants: {
    visual: {
      line: "bg-surface-container-highest",
      bar: "bg-surface-container-highest",
    },
    orientation: {
      horizontal: "w-full",
      vertical: "h-full",
    },
    shape: {
      full: "rounded-full",
      minimal: "rounded-2xl",
      sharp: "rounded-none",
    },
  },
  compoundVariants: [
    { visual: "line", orientation: "horizontal", className: "h-1" },
    { visual: "bar", orientation: "horizontal", className: "h-full" },
    { visual: "line", orientation: "vertical", className: "w-1" },
    { visual: "bar", orientation: "vertical", className: "w-full" },
  ],
  defaultVariants: {
    visual: "bar",
    orientation: "horizontal",
    shape: "full",
  },
});

const rangeVariants = cva("absolute", {
  variants: {
    visual: {
      line: "",
      bar: "group-data-[disabled]/slider:bg-on-surface/12",
    },
    orientation: {
      horizontal: "h-full top-0",
      vertical: "w-full left-0",
    },
    color: {
      primary: "bg-primary",
      secondary: "bg-secondary",
      tertiary: "bg-tertiary",
      error: "bg-error",
    },
  },
  defaultVariants: {
    visual: "bar",
    orientation: "horizontal",
    color: "primary",
  },
});

const thumbVariants = cva(
  "block focus:outline-none z-20 relative transition-all duration-150 shadow-sm",
  {
    variants: {
      visual: {
        line: "h-5 w-5 hover:scale-110 after:absolute after:inset-0 after:z-[-1] after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out hover:after:opacity-20 hover:after:scale-150",
        bar: "focus:ring-2",
      },
      color: {
        primary: "bg-primary focus:ring-primary after:bg-primary",
        secondary: "bg-secondary focus:ring-secondary after:bg-secondary",
        tertiary: "bg-tertiary focus:ring-tertiary after:bg-tertiary",
        error: "bg-error focus:ring-error after:bg-error",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-md",
        sharp: "rounded-none",
      },
      orientation: {
        horizontal: "",
        vertical: "",
      },
      size: { sm: "", md: "", lg: "" },
    },
    compoundVariants: [
      // --- Bar Thumbs (Horizontal) ---
      {
        visual: "bar",
        orientation: "horizontal",
        size: "sm",
        className:
          "h-[75px] w-[3px] top-9.5 -translate-y-1/2 group-active/slider:scale-y-110 group-active/slider:scale-x-90",
      },
      {
        visual: "bar",
        orientation: "horizontal",
        size: "md",
        className:
          "h-[75px] w-[3px] top-9.5 -translate-y-1/2 group-active/slider:scale-y-110 group-active/slider:scale-x-90",
      },
      {
        visual: "bar",
        orientation: "horizontal",
        size: "lg",
        className:
          "h-[75px] w-[3px] top-9.5 -translate-y-1/2 group-active/slider:scale-y-110 group-active/slider:scale-x-90",
      },

      // --- Bar Thumbs (Vertical) ---
      {
        visual: "bar",
        orientation: "vertical",
        size: "sm",
        className:
          "w-[75px] h-[3px] left-1/2 -translate-x-1/2 group-active/slider:scale-x-110 group-active/slider:scale-y-90",
      },
      {
        visual: "bar",
        orientation: "vertical",
        size: "md",
        className:
          "w-[75px] h-[3px] left-1/2 -translate-x-1/2 group-active/slider:scale-x-110 group-active/slider:scale-y-90",
      },
      {
        visual: "bar",
        orientation: "vertical",
        size: "lg",
        className:
          "w-[75px] h-[3px] left-1/2 -translate-x-1/2 group-active/slider:scale-x-110 group-active/slider:scale-y-90",
      },
    ],
    defaultVariants: {
      visual: "bar",
      size: "md",
      orientation: "horizontal",
      color: "primary",
      shape: "full",
    },
  },
);

const endDotVariants = cva("absolute w-[5px] h-[5px] rounded-full", {
  variants: {
    color: {
      primary: "bg-primary",
      secondary: "bg-secondary",
      tertiary: "bg-tertiary",
      error: "bg-error",
    },
    orientation: {
      horizontal: "right-3 top-1/2 -translate-y-1/2",
      vertical: "top-3 left-1/2 -translate-x-1/2",
    },
  },
  defaultVariants: {
    color: "primary",
    orientation: "horizontal",
  },
});

// --- HELPER COMPONENTS ---

const ValueLabel = ({
  value,
  orientation,
}: {
  value: number;
  orientation: "horizontal" | "vertical";
}) => {
  const isVert = orientation === "vertical";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: isVert ? 0 : -48,
        x: isVert ? 48 : 0,
      }}
      exit={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute top-0 left-0 pointer-events-none"
      // Center relative to thumb
      style={{
        left: "50%",
        top: "50%",
        marginLeft: isVert ? 0 : "-16px",
        marginTop: isVert ? "-16px" : 0,
      }}
    >
      <div className="relative flex items-center justify-center min-w-[32px] h-[32px] px-3 rounded-full bg-inverse-surface text-inverse-on-surface shadow-md">
        <span className="text-xs font-bold font-manrope whitespace-nowrap">
          {value}
        </span>
        <div
          className={clsx(
            "absolute w-2 h-2 bg-inverse-surface rotate-45 rounded-[1px]",
            isVert
              ? "-left-1 top-1/2 -translate-y-1/2"
              : "-bottom-1 left-1/2 -translate-x-1/2",
          )}
        />
      </div>
    </motion.div>
  );
};

const Ticks = ({
  count,
  min,
  max,
  activeRange,
  visual,
  orientation,
}: {
  count: number;
  min: number;
  max: number;
  activeRange: [number, number];
  visual: "line" | "bar";
  orientation: "horizontal" | "vertical";
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

          // Determine position style based on orientation
          const posStyle =
            orientation === "horizontal"
              ? { left: `${percentage}%` }
              : { bottom: `${percentage}%` };

          return (
            <div
              key={i}
              className={clsx(
                "absolute rounded-full transition-colors",
                // Center ticks
                orientation === "horizontal"
                  ? "top-1/2 -translate-x-1/2 -translate-y-1/2"
                  : "left-1/2 -translate-x-1/2 translate-y-1/2",
                visual === "bar" ? "w-1 h-1" : "w-1 h-1",
                isActive ? "bg-on-primary/50" : "bg-on-surface-variant/30",
              )}
              style={posStyle}
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
  shape?: "full" | "minimal" | "sharp";
  color?: "primary" | "secondary" | "tertiary" | "error";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  withTicks?: boolean;
  withLabel?: boolean;
  thumbRingColor?: string;
  orientation?: "horizontal" | "vertical";
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
      shape = "full",
      color = "primary",
      variant = "standard",
      orientation = "horizontal",
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
    // Returns { start, length, range } where start/length are percentages
    const getTrackStats = () => {
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
          start: `${start}%`,
          length: `${Math.abs(pct0 - pct1)}%`,
          range: [start, Math.max(pct0, pct1)] as [number, number],
        };
      }

      if (variant === "centered") {
        const center = (max + min) / 2;
        const centerPct = ((center - min) / (max - min)) * 100;

        if (val0 < center) {
          return {
            start: `${pct0}%`,
            length: `${centerPct - pct0}%`,
            range: [pct0, centerPct] as [number, number],
          };
        } else {
          return {
            start: `${centerPct}%`,
            length: `${pct0 - centerPct}%`,
            range: [centerPct, pct0] as [number, number],
          };
        }
      }

      // Standard
      return {
        start: "0%",
        length: `${pct0}%`,
        range: [0, pct0] as [number, number],
      };
    };

    const stats = getTrackStats();
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

    // Apply orientation-specific styles to range
    const rangeStyle =
      orientation === "horizontal"
        ? { left: stats.start, width: stats.length }
        : { bottom: stats.start, height: stats.length };

    // Determine content color based on the selected variant color
    // This affects icons inside the bar
    const contentColorClass =
      color === "primary" || color === "error"
        ? "text-on-primary"
        : "text-on-secondary-container";

    return (
      <div
        className={clsx(
          "flex items-center gap-4",
          orientation === "horizontal"
            ? "w-full flex-row"
            : "h-full flex-col-reverse",
          visual === "line" &&
            startIcon &&
            (orientation === "horizontal" ? "pl-0" : "pb-0"),
          className,
        )}
      >
        {/* Line Variant External Icon (Start) */}
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
          orientation={orientation}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          className={rootVariants({ visual, size, orientation })}
          {...props}
        >
          <SliderPrimitive.Track
            className={trackVariants({ visual, orientation, shape })}
          >
            {/* Active Range Fill */}
            <div
              className={rangeVariants({ visual, orientation, color })}
              style={rangeStyle}
            />

            {/* Ticks */}
            {withTicks && (
              <Ticks
                count={tickCount}
                min={min}
                max={max}
                activeRange={stats.range}
                visual={visual}
                orientation={orientation}
              />
            )}

            {/* Bar Variant Internal Icons */}
            {/* Horizontal Icons */}
            {visual === "bar" && orientation === "horizontal" && startIcon && (
              <div
                className={clsx(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none [&_svg]:w-5 [&_svg]:h-5",
                  variant === "standard"
                    ? contentColorClass
                    : "text-on-surface-variant",
                )}
              >
                {startIcon}
              </div>
            )}
            {visual === "bar" && orientation === "horizontal" && endIcon && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-on-surface-variant pointer-events-none [&_svg]:w-5 [&_svg]:h-5">
                {endIcon}
              </div>
            )}

            {/* Vertical Icons */}
            {visual === "bar" && orientation === "vertical" && startIcon && (
              <div
                className={clsx(
                  "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none [&_svg]:w-5 [&_svg]:h-5",
                  variant === "standard"
                    ? contentColorClass
                    : "text-on-surface-variant",
                )}
              >
                {startIcon}
              </div>
            )}
            {visual === "bar" && orientation === "vertical" && endIcon && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-on-surface-variant pointer-events-none [&_svg]:w-5 [&_svg]:h-5">
                {endIcon}
              </div>
            )}
          </SliderPrimitive.Track>

          {/* Thumbs */}
          {internalValue.map((val, i) => (
            <SliderPrimitive.Thumb
              key={i}
              className={thumbVariants({
                visual,
                size,
                orientation,
                color,
                shape,
              })}
              style={thumbStyle}
            >
              <AnimatePresence>
                {withLabel && (isHovered || isDragging) && (
                  <ValueLabel value={val} orientation={orientation} />
                )}
              </AnimatePresence>
            </SliderPrimitive.Thumb>
          ))}

          {/* Standard Bar End Dot (Horizontal) */}
          {visual === "bar" &&
            variant === "standard" &&
            !withTicks &&
            orientation === "horizontal" && (
              <div
                className={endDotVariants({ color, orientation: "horizontal" })}
              />
            )}
          {/* Standard Bar End Dot (Vertical) */}
          {visual === "bar" &&
            variant === "standard" &&
            !withTicks &&
            orientation === "vertical" && (
              <div
                className={endDotVariants({ color, orientation: "vertical" })}
              />
            )}
        </SliderPrimitive.Root>

        {/* Line Variant External Icon (End) */}
        {visual === "line" && endIcon && (
          <div className="text-on-surface-variant">{endIcon}</div>
        )}
      </div>
    );
  },
);

Slider.displayName = "Slider";
export * from "./bar-line-slider";
