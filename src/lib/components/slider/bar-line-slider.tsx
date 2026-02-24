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
  shape?: "full" | "minimal" | "sharp";

  activeColor?: string;
  inactiveColor?: string;
}

// Helper to ensure the active bar doesn't shrink smaller than the icon circle
const getMinSizeClass = (dimClass: string, isVert: boolean) => {
  const standardMatch = dimClass.match(/^(?:h|w)-(\d+)$/);
  if (standardMatch) {
    return isVert ? `min-h-${standardMatch[1]}` : `min-w-${standardMatch[1]}`;
  }
  const arbitraryMatch = dimClass.match(/^(?:h|w)-(\[.+\])$/);
  if (arbitraryMatch) {
    return isVert ? `min-h-${arbitraryMatch[1]}` : `min-w-${arbitraryMatch[1]}`;
  }
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
      shape = "full",
      activeColor = "bg-[#bef264]", // Lime
      inactiveColor = "bg-zinc-800",
      disabled,
      orientation = "horizontal",
      ...props
    },
    ref,
  ) => {
    const isVert = orientation === "vertical";

    let rootDimensionClass = thickness;
    if (!rootDimensionClass) {
      if (isVert) rootDimensionClass = "w-12 h-full";
      else rootDimensionClass = barHeight;
    }

    let trackLineClass = lineSize;
    if (!trackLineClass) {
      if (isVert) trackLineClass = "w-1.5 h-full";
      else trackLineClass = lineHeight;
    }

    const dimensionForCalc = thickness || (isVert ? "w-12" : barHeight);
    const minSizeClass = getMinSizeClass(dimensionForCalc, isVert);

    const roundingClass =
      shape === "full"
        ? "rounded-full"
        : shape === "minimal"
          ? "rounded-2xl"
          : "rounded-none";

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
              "absolute overflow-hidden",
              roundingClass,
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
