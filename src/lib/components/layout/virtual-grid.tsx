"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { clsx } from "clsx";
import React, { useLayoutEffect, useRef, useState } from "react";

// --- BREAKPOINTS ---
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type BreakpointKey = keyof typeof BREAKPOINTS;
type ResponsiveObject = Partial<Record<BreakpointKey, number>> & {
  default?: number;
};
type ResponsiveCols = number | ResponsiveObject;

const getColumnCount = (width: number, columns: ResponsiveCols): number => {
  if (typeof columns === "number") return columns;
  const colsObj = columns as ResponsiveObject;
  if (width >= BREAKPOINTS["2xl"] && colsObj["2xl"] !== undefined)
    return colsObj["2xl"];
  if (width >= BREAKPOINTS.xl && colsObj.xl !== undefined) return colsObj.xl;
  if (width >= BREAKPOINTS.lg && colsObj.lg !== undefined) return colsObj.lg;
  if (width >= BREAKPOINTS.md && colsObj.md !== undefined) return colsObj.md;
  if (width >= BREAKPOINTS.sm && colsObj.sm !== undefined) return colsObj.sm;
  return colsObj.default || 1;
};

export interface VirtualGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns?: ResponsiveCols;
  estimateRowHeight?: number;
  gap?: number;
  className?: string;
  padding?: number;
}

export const VirtualGrid = <T,>({
  data,
  renderItem,
  columns = { default: 1, md: 2, lg: 3, xl: 4 },
  estimateRowHeight = 300,
  gap = 16,
  className,
  padding = 16,
}: VirtualGridProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // OPTIMIZATION: Only store columnCount in state to prevent re-renders on every pixel resize
  const [columnCount, setColumnCount] = useState(1);

  useLayoutEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // Calculate what the columns SHOULD be
        const width = entry.contentRect.width;
        const newCols = getColumnCount(width, columns);

        // Only trigger React update if columns actually change
        setColumnCount((prev) => (prev !== newCols ? newCols : prev));
      }
    });

    if (parentRef.current) {
      observer.observe(parentRef.current);
    }

    return () => observer.disconnect();
  }, [columns]);

  // Calculate total virtual rows
  const rowCount = Math.ceil(data.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className={clsx(
        "h-full w-full overflow-y-auto contain-strict", // contain-strict is key for perf
        className
      )}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize() + padding * 2}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowStartIndex = virtualRow.index * columnCount;
          // Slice data for this specific row
          const rowItems = data.slice(
            rowStartIndex,
            rowStartIndex + columnCount
          );

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                // Transform is the fastest way to move elements
                transform: `translateY(${virtualRow.start + padding}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                gap: `${gap}px`,
                paddingLeft: padding,
                paddingRight: padding,
              }}
            >
              {rowItems.map((item, colIndex) => (
                <React.Fragment key={rowStartIndex + colIndex}>
                  {renderItem(item, rowStartIndex + colIndex)}
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

VirtualGrid.displayName = "VirtualGrid";
