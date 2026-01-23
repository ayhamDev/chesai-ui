"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useContext, useState } from "react";
import { Typography } from "../typography";

// --- CVA Variants for component parts ---

const sliderRootVariants = cva(
  "relative flex touch-none select-none items-center",
  {
    variants: {
      direction: {
        horizontal: "w-full flex-row py-2",
        vertical: "h-48 w-fit flex-col px-2",
      },
    },
    defaultVariants: {
      direction: "horizontal",
    },
  }
);

const sliderTrackVariants = cva("relative grow overflow-hidden rounded-full", {
  variants: {
    variant: {
      linear: "bg-graphite-secondary",
      bar: "bg-graphite-secondary",
    },
    direction: {
      horizontal: "w-full",
      vertical: "h-full",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
      xl: "",
      "2xl": "",
    },
  },
  compoundVariants: [
    { variant: "linear", direction: "horizontal", className: "h-1" },
    { variant: "linear", direction: "vertical", className: "w-1" },
    { variant: "bar", direction: "horizontal", size: "sm", className: "h-2" },
    { variant: "bar", direction: "horizontal", size: "md", className: "h-3" },
    { variant: "bar", direction: "horizontal", size: "lg", className: "h-5" },
    { variant: "bar", direction: "horizontal", size: "xl", className: "h-7" },
    { variant: "bar", direction: "horizontal", size: "2xl", className: "h-10" },
    { variant: "bar", direction: "vertical", size: "sm", className: "w-2" },
    { variant: "bar", direction: "vertical", size: "md", className: "w-3" },
    { variant: "bar", direction: "vertical", size: "lg", className: "w-5" },
    { variant: "bar", direction: "vertical", size: "xl", className: "w-7" },
    { variant: "bar", direction: "vertical", size: "2xl", className: "w-10" },
  ],
  defaultVariants: {
    variant: "linear",
    direction: "horizontal",
    size: "lg",
  },
});

const sliderRangeVariants = cva(
  "absolute bg-graphite-primary data-[disabled]:bg-graphite-primary/50",
  {
    variants: {
      direction: {
        horizontal: "h-full",
        vertical: "w-full",
      },
    },
    defaultVariants: {
      direction: "horizontal",
    },
  }
);

const barThumbVariants = cva(
  // FIX: Add z-10 to ensure the thumb is rendered on top of the range/track
  "relative z-10 block rounded-full bg-graphite-primary outline-4 outline-graphite-secondary  transition-shadow focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2 data-[disabled]:bg-graphite-primary/50 data-[disabled]:cursor-not-allowed",
  {
    variants: {
      direction: {
        horizontal: "",
        vertical: "",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
        "2xl": "",
      },
    },
    compoundVariants: [
      { direction: "horizontal", size: "sm", className: "h-4 w-1.5" },
      { direction: "horizontal", size: "md", className: "h-5 w-1.5" },
      { direction: "horizontal", size: "lg", className: "h-7 w-2" },
      { direction: "horizontal", size: "xl", className: "h-9 w-2" },
      { direction: "horizontal", size: "2xl", className: "h-12 w-2.5" },
      { direction: "vertical", size: "sm", className: "w-4 h-1.5" },
      { direction: "vertical", size: "md", className: "w-5 h-1.5" },
      { direction: "vertical", size: "lg", className: "w-7 h-2" },
      { direction: "vertical", size: "xl", className: "w-9 h-2" },
      { direction: "vertical", size: "2xl", className: "w-12 h-2.5" },
    ],
    defaultVariants: {
      direction: "horizontal",
      size: "lg",
    },
  }
);

const barThumbHaloVariants = cva(
  "absolute rounded-full bg-graphite-primary/20",
  {
    variants: {
      direction: {
        horizontal: "",
        vertical: "",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
        "2xl": "",
      },
    },
    compoundVariants: [
      { direction: "horizontal", size: "sm", className: "h-9 w-6" },
      { direction: "horizontal", size: "md", className: "h-10 w-6" },
      { direction: "horizontal", size: "lg", className: "h-12 w-7" },
      { direction: "horizontal", size: "xl", className: "h-14 w-7" },
      { direction: "horizontal", size: "2xl", className: "h-[68px] w-8" },
      { direction: "vertical", size: "sm", className: "w-9 h-6" },
      { direction: "vertical", size: "md", className: "w-10 h-6" },
      { direction: "vertical", size: "lg", className: "w-12 h-7" },
      { direction: "vertical", size: "xl", className: "w-14 h-7" },
      { direction: "vertical", size: "2xl", className: "w-[68px] h-8" },
    ],
    defaultVariants: {
      direction: "horizontal",
      size: "lg",
    },
  }
);

// --- Context to pass props down to thumbs ---
type SliderContextProps = VariantProps<typeof sliderTrackVariants>;

const SliderContext = createContext<SliderContextProps | null>(null);
const useSliderContext = () => {
  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("Slider sub-components must be used within a Slider");
  }
  return context;
};

// --- Internal Thumb Components ---

const LinearThumb = React.forwardRef<
  HTMLSpanElement,
  { value: number } & React.ComponentPropsWithoutRef<typeof RadixSlider.Thumb>
>(({ value, ...props }, ref) => {
  const [isHoveredOrActive, setIsHoveredOrActive] = useState(false);
  return (
    <RadixSlider.Thumb
      ref={ref}
      onPointerEnter={() => setIsHoveredOrActive(true)}
      onPointerLeave={() => setIsHoveredOrActive(false)}
      className={clsx(
        "relative z-10 block h-5 w-5 rounded-full outline-4 outline-graphite-secondary bg-graphite-primary transition-shadow",
        "focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2",
        "data-[disabled]:bg-graphite-primary/50 data-[disabled]:cursor-not-allowed"
      )}
      {...props}
    >
      <span
        className={clsx(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "h-10 w-10 rounded-full bg-graphite-primary/20 transition-transform",
          isHoveredOrActive ? "scale-100" : "scale-0"
        )}
      />
      <AnimatePresence>
        {isHoveredOrActive && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2"
          >
            <div className="rounded-lg bg-graphite-secondary px-2 py-1 shadow-md">
              <Typography
                variant="small"
                className="font-semibold text-graphite-secondaryForeground"
              >
                {value}
              </Typography>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </RadixSlider.Thumb>
  );
});
LinearThumb.displayName = "LinearThumb";

const BarThumb = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof RadixSlider.Thumb>
>((props, ref) => {
  const { size, direction } = useSliderContext();
  const [isHoveredOrActive, setIsHoveredOrActive] = useState(false);

  return (
    <RadixSlider.Thumb
      ref={ref}
      onPointerEnter={() => setIsHoveredOrActive(true)}
      onPointerLeave={() => setIsHoveredOrActive(false)}
      className={barThumbVariants({ size, direction })}
      {...props}
    >
      <span
        className={clsx(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform",
          isHoveredOrActive ? "scale-100" : "scale-0",
          barThumbHaloVariants({ size, direction })
        )}
      />
    </RadixSlider.Thumb>
  );
});
BarThumb.displayName = "BarThumb";

// --- Main Slider Component ---

type SliderProps = React.ComponentPropsWithoutRef<typeof RadixSlider.Root> & {
  variant?: "linear" | "bar";
  direction?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
};

const Slider = React.forwardRef<
  React.ElementRef<typeof RadixSlider.Root>,
  SliderProps
>(
  (
    {
      className,
      value,
      variant = "linear",
      direction = "horizontal",
      size = "lg",
      ...props
    },
    ref
  ) => {
    const isRange = Array.isArray(value);

    return (
      <SliderContext.Provider value={{ variant, direction, size }}>
        <RadixSlider.Root
          ref={ref}
          value={value}
          orientation={direction}
          className={clsx(sliderRootVariants({ direction }), className)}
          {...props}
        >
          <RadixSlider.Track
            className={sliderTrackVariants({ variant, direction, size })}
          >
            <RadixSlider.Range className={sliderRangeVariants({ direction })} />
          </RadixSlider.Track>

          {variant === "linear" ? (
            isRange ? (
              <>
                <LinearThumb value={value[0]} key="thumb-start" />
                <LinearThumb value={value[1]} key="thumb-end" />
              </>
            ) : (
              <LinearThumb value={value?.[0] ?? 0} />
            )
          ) : isRange ? (
            <>
              <BarThumb key="thumb-start" />
              <BarThumb key="thumb-end" />
            </>
          ) : (
            <BarThumb />
          )}
        </RadixSlider.Root>
      </SliderContext.Provider>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
