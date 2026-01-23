"use client";

import { clsx } from "clsx";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// --- CONSTANTS ---
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

// --- UTILS ---
function useContainerWidth<T extends HTMLElement = HTMLDivElement>() {
  const [width, setWidth] = useState(0);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      // Debounce slightly via requestAnimationFrame
      requestAnimationFrame(() => {
        if (entries[0]) setWidth(entries[0].contentRect.width);
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

const getColumnCount = (width: number, columns: ResponsiveCols): number => {
  if (typeof columns === "number") return columns;
  const colsObj = columns as ResponsiveObject;
  if (width >= BREAKPOINTS["2xl"] && colsObj["2xl"]) return colsObj["2xl"];
  if (width >= BREAKPOINTS.xl && colsObj.xl) return colsObj.xl;
  if (width >= BREAKPOINTS.lg && colsObj.lg) return colsObj.lg;
  if (width >= BREAKPOINTS.md && colsObj.md) return colsObj.md;
  if (width >= BREAKPOINTS.sm && colsObj.sm) return colsObj.sm;
  return colsObj.default || 1;
};

// --- TYPES ---
export interface VirtualMasonryProps<T> {
  data: T[];
  renderItem: (item: T, index: number, width: number) => React.ReactNode;
  columns?: ResponsiveCols;
  gap?: number;
  className?: string;
  padding?: number;
  estimateHeight?: number;
  overscan?: number;
  animate?: boolean;
}

// --- COMPONENT ---
export const VirtualMasonry = <T,>({
  data,
  renderItem,
  columns = { default: 1, md: 2, lg: 3 },
  gap = 16,
  className,
  padding = 16,
  estimateHeight = 200,
  overscan = 800, // Increased overscan for smoother visual experience
  animate = true,
}: VirtualMasonryProps<T>) => {
  const { ref: containerRef, width: containerWidth } =
    useContainerWidth<HTMLDivElement>();
  const [scrollTop, setScrollTop] = useState(0);
  const [measurements, setMeasurements] = useState<Record<number, number>>({});

  const columnCount = useMemo(
    () => getColumnCount(containerWidth, columns),
    [containerWidth, columns]
  );

  const itemWidth = useMemo(() => {
    if (containerWidth <= 0) return 0;
    const availableWidth =
      containerWidth - padding * 2 - (columnCount - 1) * gap;
    return Math.floor(availableWidth / columnCount);
  }, [containerWidth, columnCount, padding, gap]);

  // Layout Calculation (Waterfall)
  // This is purely JS math, very fast.
  const { positions, totalHeight } = useMemo(() => {
    if (itemWidth <= 0) return { positions: [], totalHeight: 0 };

    const colHeights = new Array(columnCount).fill(padding);
    const pos = new Array(data.length);

    for (let i = 0; i < data.length; i++) {
      let shortestColIndex = 0;
      let minH = colHeights[0];

      for (let j = 1; j < columnCount; j++) {
        if (colHeights[j] < minH) {
          minH = colHeights[j];
          shortestColIndex = j;
        }
      }

      const x = padding + shortestColIndex * (itemWidth + gap);
      const y = colHeights[shortestColIndex];
      pos[i] = { x, y };

      const height = measurements[i] ?? estimateHeight;
      colHeights[shortestColIndex] += height + gap;
    }

    return { positions: pos, totalHeight: Math.max(...colHeights) + padding };
  }, [
    data.length,
    columnCount,
    itemWidth,
    gap,
    padding,
    measurements,
    estimateHeight,
  ]);

  // Optimized Measurement Callback
  const measureItem = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      if (!node) return;
      // requestAnimationFrame ensures we don't block the current paint
      requestAnimationFrame(() => {
        const height = node.offsetHeight;
        setMeasurements((prev) => {
          if (prev[index] === height) return prev;
          return { ...prev, [index]: height };
        });
      });
    },
    []
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Visibility Calculation
  const visibleIndices = useMemo(() => {
    if (positions.length === 0) return [];

    // Assume viewport is ~1000px if we can't measure yet, plus generous overscan
    const startY = Math.max(0, scrollTop - overscan);
    const endY = scrollTop + 1000 + overscan;

    const indices: number[] = [];
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const height = measurements[i] ?? estimateHeight;
      // Intersection check
      if (pos.y + height >= startY && pos.y <= endY) {
        indices.push(i);
      }
    }
    return indices;
  }, [positions, measurements, scrollTop, overscan, estimateHeight]);

  if (containerWidth === 0) {
    return (
      <div
        ref={containerRef}
        className={clsx("h-full w-full overflow-y-auto", className)}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={clsx(
        "h-full w-full overflow-y-auto contain-strict relative will-change-scroll",
        className
      )}
    >
      <div style={{ height: totalHeight, width: "100%", position: "relative" }}>
        {visibleIndices.map((index) => {
          const item = data[index];
          const pos = positions[index];
          if (!item || !pos) return null;

          return (
            <div
              key={index}
              className={clsx(
                "absolute top-0 left-0",
                animate && "animate-virtual-fade-in"
              )}
              style={{
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                width: itemWidth,
                willChange: "transform", // Hint to browser to keep this layer ready
              }}
            >
              <div ref={measureItem(index)}>
                {renderItem(item, index, itemWidth)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

VirtualMasonry.displayName = "VirtualMasonry";
