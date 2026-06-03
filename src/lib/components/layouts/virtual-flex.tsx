"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { clsx } from "clsx";
import React, { useRef } from "react";

export interface VirtualFlexProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  direction?: "vertical" | "horizontal";
  estimateSize?: number;
  gap?: number;
  className?: string;
  padding?: number;
}

export const VirtualFlex = <T,>({
  data,
  renderItem,
  direction = "vertical",
  estimateSize = 50,
  gap = 16,
  className,
  padding = 0,
}: VirtualFlexProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === "horizontal";

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap, // Account for gap in estimation
    horizontal: isHorizontal,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className={clsx(
        "h-full w-full contain-strict",
        isHorizontal ? "overflow-x-auto" : "overflow-y-auto",
        className
      )}
    >
      <div
        style={{
          height: isHorizontal
            ? "100%"
            : `${virtualizer.getTotalSize() + padding * 2}px`,
          width: isHorizontal
            ? `${virtualizer.getTotalSize() + padding * 2}px`
            : "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = data[virtualItem.index];
          // Offset start by padding
          const start = virtualItem.start + padding;

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: isHorizontal ? undefined : "100%",
                height: isHorizontal ? "100%" : undefined,
                // Pure GPU Transform
                transform: isHorizontal
                  ? `translateX(${start}px)`
                  : `translateY(${start}px)`,
                // Padding simulates the gap
                paddingBottom: isHorizontal ? 0 : gap,
                paddingRight: isHorizontal ? gap : 0,
                paddingLeft: isHorizontal ? 0 : padding,
                paddingTop: isHorizontal ? padding : 0,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

VirtualFlex.displayName = "VirtualFlex";
