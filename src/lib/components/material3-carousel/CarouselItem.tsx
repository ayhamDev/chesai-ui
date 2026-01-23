// src/components/material3-carousel/CarouselItem.tsx
import React, { memo } from "react";
import { motion, useTransform } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CarouselItemProps } from "./types";

const CarouselItem: React.FC<CarouselItemProps> = memo(
  ({
    index,
    imageUrl,
    title,
    subtitle,
    progress,
    inputRange,
    widthRange,
    marginRange, // Now receiving margin ranges
    onClick,
  }) => {
    const safeInputRange = inputRange || [index - 1, index, index + 1];
    const safeWidthRange = widthRange || ["0%", "100%", "0%"];
    // Default margin range: 0 -> 16px -> 0
    const safeMarginRange = marginRange || ["0px", "16px", "0px"];

    const width = useTransform(progress!, safeInputRange, safeWidthRange, {
      clamp: true,
    });

    // --- DYNAMIC SPACING ---
    // Animates to 0px when item is hidden, eliminating the "Stacking" bug
    const marginRight = useTransform(
      progress!,
      safeInputRange,
      safeMarginRange
    );

    const contentOpacity = useTransform(
      progress!,
      [index - 0.5, index, index + 0.8],
      [0, 1, 0]
    );

    return (
      <motion.div
        className={twMerge(
          clsx(
            "relative h-full overflow-hidden bg-surface-container-low",
            "rounded-[24px]",
            // REMOVED: border-r-[12px] class (This was the cause of the bug)
            "bg-clip-padding"
          )
        )}
        style={{
          width,
          marginRight, // Applying animated margin
          flexShrink: 0,
          flexGrow: 0,
          willChange: "width, margin-right",
          transform: "translateZ(0)",
        }}
        onClick={onClick}
      >
        <div className="absolute inset-0 w-full h-full">
          <img
            src={imageUrl}
            alt={title || "Carousel Item"}
            className="w-full h-full object-cover object-center"
            draggable={false}
            decoding="async"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        </div>

        <motion.div
          className="absolute bottom-0 left-0 p-5 w-full whitespace-nowrap"
          style={{ opacity: contentOpacity, willChange: "opacity" }}
        >
          {title && (
            <h3 className="text-white text-xl font-bold font-manrope tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-gray-300 text-sm font-medium font-manrope mt-1">
              {subtitle}
            </p>
          )}
        </motion.div>
      </motion.div>
    );
  }
);

export default CarouselItem;
