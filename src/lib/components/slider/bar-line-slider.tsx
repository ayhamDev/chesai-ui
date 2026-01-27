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
   * @default "h-1"
   */
  lineHeight?: string;
  /**
   * Tailwind color classes for the active bar.
   * @default "bg-lime-200"
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
    // Height mapping for the container to ensure it fits the largest element
    const containerHeight = barHeight;

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
          "relative flex w-full touch-none select-none items-center group cursor-pointer",
          containerHeight,
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

          {/* The Active Bar (Fills height) */}
          {/* REMOVED: transition-all to fix drag delay */}
          <SliderPrimitive.Range
            className={clsx("absolute h-full rounded-full", activeColor)}
          />
        </SliderPrimitive.Track>

        {/* The Handle / Thumb */}
        {/* REMOVED: transition-transform duration-100 to fix drag delay */}
        <SliderPrimitive.Thumb
          className={clsx(
            "block focus:outline-none focus-visible:scale-110",
            // We make the thumb physically large to cover the end of the bar,
            // but transparent so we only see the icon.
            "w-12 h-12 rounded-full",
            "flex items-center justify-center",
            "bg-transparent shadow-none",
          )}
        >
          {/* Icon positioning */}
          <div className="text-black pointer-events-none">{icon}</div>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    );
  },
);

BarLineSlider.displayName = "BarLineSlider";
