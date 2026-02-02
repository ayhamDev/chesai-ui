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
   * The height of the active bar.
   * @default "h-12"
   */
  barHeight?: string;
  /**
   * The height of the inactive line.
   * @default "h-1.5"
   */
  lineHeight?: string;
  /**
   * Tailwind color classes for the active bar.
   * @default "bg-[#bef264]"
   */
  activeColor?: string;
  /**
   * Tailwind color classes for the inactive line.
   * @default "bg-zinc-800"
   */
  inactiveColor?: string;
}

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
      barHeight = "h-12",
      lineHeight = "h-1.5",
      activeColor = "bg-[#bef264]", // Lime
      inactiveColor = "bg-zinc-800",
      disabled,
      ...props
    },
    ref,
  ) => {
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
        className={clsx(
          "relative flex w-full touch-none select-none items-center group cursor-grab active:cursor-grabbing",
          // The container height determines the touch target size
          barHeight,
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-full w-full grow">
          {/* The Inactive Line (Centered Vertically) */}
          <div
            className={clsx(
              "absolute top-1/2 left-0 right-0 -translate-y-1/2 rounded-full w-full",
              lineHeight,
              inactiveColor,
            )}
          />

          {/* The Active Bar */}
          <SliderPrimitive.Range
            className={clsx(
              "absolute h-full rounded-full overflow-hidden",
              activeColor,
              // SOLUTION:
              // 1. Min-width ensures it's never smaller than a circle (h-12 -> min-w-12 usually 3rem)
              // We use `min-w-[var(--radix-slider-range-height)]` logic by matching the height class.
              // Assuming standard tailwind spacing, we map h-12 to min-w-12.
              // If you use custom arbitrary heights, use `min-w-[...px]` to match.
              barHeight === "h-12" ? "min-w-12" : "min-w-[3rem]",
            )}
          >
            {/* 
              Icon Container:
              Absolute positioned to the right side of the active bar.
              Aspect square ensures it stays a perfect circle at the tip.
            */}
            <div className="absolute right-0 top-0 h-full aspect-square flex items-center justify-center pointer-events-none">
              <div className="text-black">{icon}</div>
            </div>
          </SliderPrimitive.Range>
        </SliderPrimitive.Track>

        {/* 
          The Handle / Thumb 
          We keep the thumb for drag interaction/accessibility, 
          but we make it invisible because the visual "thumb" is now 
          inside the Range component above.
        */}
        <SliderPrimitive.Thumb
          className={clsx(
            "block focus:outline-none",
            "w-12 h-12 rounded-full", // Match physical size for touch target
            "bg-transparent shadow-none", // Invisible
          )}
        />
      </SliderPrimitive.Root>
    );
  },
);

BarLineSlider.displayName = "BarLineSlider";
