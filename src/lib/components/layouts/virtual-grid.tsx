"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { clsx } from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";

// --- TYPES & CONSTANTS ---

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type BreakpointKey = keyof typeof BREAKPOINTS;

type ResponsiveCols =
  | number
  | (Partial<Record<BreakpointKey, number>> & {
      default?: number;
    });

// --- UTILS ---

const getColumnCount = (width: number, columns: ResponsiveCols): number => {
  if (typeof columns === "number") return columns;

  if (width >= BREAKPOINTS["2xl"] && columns["2xl"]) return columns["2xl"];
  if (width >= BREAKPOINTS.xl && columns.xl) return columns.xl;
  if (width >= BREAKPOINTS.lg && columns.lg) return columns.lg;
  if (width >= BREAKPOINTS.md && columns.md) return columns.md;
  if (width >= BREAKPOINTS.sm && columns.sm) return columns.sm;

  return columns.default || 1;
};

export interface VirtualGridProps<T> {
  /** The large dataset to render */
  data: T[];
  /** Function to render individual items */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Fixed height of a row in pixels. Required for virtualization math. */
  itemHeight: number;
  /** Number of columns or object for responsive breakpoints */
  columns?: ResponsiveCols;
  /** Gap between items in pixels */
  gap?: number;
  /** Outer padding of the grid container in pixels */
  padding?: number;
  /** Extra items to render off-screen for smoother scrolling */
  overscan?: number;
  className?: string;
}

export const VirtualGrid = <T,>({
  data,
  renderItem,
  itemHeight,
  columns = { default: 1, md: 2, lg: 3, xl: 4 },
  gap = 16,
  padding = 16,
  overscan = 5,
  className,
}: VirtualGridProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width for responsive columns
  useEffect(() => {
    const element = parentRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width);
        }
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const columnCount = useMemo(() => {
    const widthToCheck =
      containerWidth || (typeof window !== "undefined" ? window.innerWidth : 0);
    return getColumnCount(widthToCheck, columns);
  }, [containerWidth, columns]);

  const rowCount = Math.ceil(data.length / columnCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    // We include the gap in the estimate so the virtualizer knows how much space a row + gap takes
    estimateSize: () => itemHeight + gap,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={clsx(
        "h-full w-full overflow-y-auto contain-strict",
        className,
      )}
    >
      <div
        style={{
          // We add padding * 2 to accommodate top and bottom padding
          height: `${virtualizer.getTotalSize() + padding * 2}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const rowItems = data.slice(startIndex, startIndex + columnCount);

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              // FIX: Removed ref={virtualizer.measureElement}
              // Since we are enforcing a fixed height via style, we do not want the
              // virtualizer to remeasure the DOM node, as this can cause layout thrashing
              // and gap inconsistencies. We trust our `estimateSize` logic.
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${itemHeight}px`,
                // Position row: Start offset + container padding
                transform: `translateY(${virtualRow.start + padding}px)`,
                paddingLeft: padding,
                paddingRight: padding,
                display: "grid",
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                columnGap: `${gap}px`, // Explicit column gap
                // Note: Row gap is handled by the virtualization spacing (estimateSize)
              }}
            >
              {rowItems.map((item, colIndex) => {
                const globalIndex = startIndex + colIndex;
                return (
                  <div key={globalIndex} className="h-full w-full">
                    {renderItem(item, globalIndex)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

VirtualGrid.displayName = "VirtualGrid";
