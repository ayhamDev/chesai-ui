"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { clsx } from "clsx";
import React from "react";

export interface BarLineSliderProps extends Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  "value" | "defaultValue" | "children"
> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  icon?: React.ReactNode;
  /**
   * Defines the cross-axis size (Thickness) of the slider.
   * - Horizontal: Height
   * - Vertical: Width
   * @default "h-12" (Horizontal) or "w-12" (Vertical)
   */
  thickness?: string;
  /**
   * @deprecated Use `thickness` instead.
   */
  barHeight?: string;
  /**
   * The height/width of the inactive line.
   * @default "h-1.5" or "w-1.5"
   */
  lineSize?: string;
  /**
   * @deprecated Use `lineSize` instead.
   */
  lineHeight?: string;

  activeColor?: string;
  inactiveColor?: string;
}

// Helper to ensure the active bar doesn't shrink smaller than the icon circle
// Maps standard tailwind dimensions: h-12 -> min-w-12, w-12 -> min-h-12
const getMinSizeClass = (dimClass: string, isVert: boolean) => {
  // 1. Check for standard integer classes (e.g., h-12, w-14)
  // We extract the number part and apply it to min-w/min-h
  const standardMatch = dimClass.match(/^(?:h|w)-(\d+)$/);
  if (standardMatch) {
    return isVert ? `min-h-${standardMatch[1]}` : `min-w-${standardMatch[1]}`;
  }

  // 2. Check for arbitrary values (e.g., h-[50px], w-[3rem])
  const arbitraryMatch = dimClass.match(/^(?:h|w)-(\[.+\])$/);
  if (arbitraryMatch) {
    return isVert ? `min-h-${arbitraryMatch[1]}` : `min-w-${arbitraryMatch[1]}`;
  }

  // 3. Fallback defaults if parsing fails or complex classes used
  // "3rem" is the equivalent of "12" in standard Tailwind (48px)
  return isVert ? "min-h-12" : "min-w-12";
};

export const BarLineSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  BarLineSliderProps
>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      icon,
      min = 0,
      max = 100,
      step = 1,
      thickness,
      barHeight = "h-12",
      lineSize,
      lineHeight = "h-1.5",
      activeColor = "bg-[#bef264]", // Lime
      inactiveColor = "bg-zinc-800",
      disabled,
      orientation = "horizontal",
      ...props
    },
    ref,
  ) => {
    const isVert = orientation === "vertical";

    // 1. Resolve Root Dimension (Thickness)
    // Preference: thickness prop > barHeight prop (legacy) > default
    let rootDimensionClass = thickness;
    if (!rootDimensionClass) {
      if (isVert) rootDimensionClass = "w-12 h-full";
      else rootDimensionClass = barHeight;
    }

    // 2. Resolve Track Line Size
    let trackLineClass = lineSize;
    if (!trackLineClass) {
      if (isVert) trackLineClass = "w-1.5 h-full";
      else trackLineClass = lineHeight;
    }

    // 3. Calculate Minimum Size for the Active Bar
    // This ensures the bar is never smaller than a perfect circle (holding the icon)
    // We pass only the relevant dimension class (e.g., "h-12") to the helper
    const dimensionForCalc = thickness || (isVert ? "w-12" : barHeight);
    const minSizeClass = getMinSizeClass(dimensionForCalc, isVert);

    return (
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        orientation={orientation}
        className={clsx(
          "relative flex touch-none select-none items-center group cursor-grab active:cursor-grabbing",
          isVert ? "flex-col justify-center" : "w-full",
          rootDimensionClass,
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-full w-full grow">
          {/* The Inactive Line (Centered) */}
          <div
            className={clsx(
              "absolute rounded-full",
              isVert
                ? "left-1/2 -translate-x-1/2 top-0 bottom-0"
                : "top-1/2 -translate-y-1/2 left-0 right-0",
              trackLineClass,
              inactiveColor,
            )}
          />

          {/* The Active Bar */}
          <SliderPrimitive.Range
            className={clsx(
              "absolute rounded-full overflow-hidden",
              activeColor,
              // Apply orientation specific sizing
              isVert ? "w-full" : "h-full",
              // Apply the calculated minimum size so the icon isn't crushed
              minSizeClass,
            )}
          >
            {/* 
              Icon Container:
              Absolute positioned at the tip of the active bar.
              Aspect square ensures it stays a perfect circle matching the thickness.
            */}
            <div
              className={clsx(
                "absolute aspect-square flex items-center justify-center pointer-events-none",
                isVert ? "top-0 left-0 w-full" : "right-0 top-0 h-full",
              )}
            >
              <div className="text-black">{icon}</div>
            </div>
          </SliderPrimitive.Range>
        </SliderPrimitive.Track>

        {/* 
          The Handle / Thumb (Invisible but essential for interaction)
        */}
        <SliderPrimitive.Thumb
          className={clsx(
            "block focus:outline-none",
            "w-12 h-12 rounded-full", // Physical touch target
            "bg-transparent shadow-none", // Invisible
          )}
        />
      </SliderPrimitive.Root>
    );
  },
);

BarLineSlider.displayName = "BarLineSlider";
