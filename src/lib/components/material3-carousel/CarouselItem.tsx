// src/lib/components/material3-carousel/CarouselItem.tsx
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
    sizeRange,
    gapRange,
    orientation = "horizontal",
    onClick,
  }) => {
    const isVert = orientation === "vertical";

    const safeInputRange = inputRange || [index - 1, index, index + 1];
    const safeSizeRange = sizeRange || ["0%", "100%", "0%"];
    const safeGapRange = gapRange || ["0px", "16px", "0px"];

    // Framer interpolates the standard percentage/pixel strings flawlessly
    const size = useTransform(progress!, safeInputRange, safeSizeRange, {
      clamp: true,
    });
    const gap = useTransform(progress!, safeInputRange, safeGapRange, {
      clamp: true,
    });

    const contentOpacity = useTransform(
      progress!,
      [index - 0.5, index, index + 0.8],
      [0, 1, 0],
    );

    return (
      <motion.div
        className={twMerge(
          clsx(
            "relative overflow-hidden bg-surface-container-low rounded-[24px] bg-clip-padding",
            // Remove w-full/h-full here since they will be strictly governed by inline styles
          ),
        )}
        style={{
          width: isVert ? "100%" : size,
          height: isVert ? size : "100%",
          marginRight: isVert ? "0px" : gap,
          marginBottom: isVert ? gap : "0px",
          flexShrink: 0,
          flexGrow: 0,
          willChange: isVert ? "height, margin-bottom" : "width, margin-right",
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
  },
);

export default CarouselItem;
