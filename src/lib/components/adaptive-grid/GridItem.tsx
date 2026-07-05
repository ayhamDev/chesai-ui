"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { GridItemConfig, GAP_MAP } from "./types";
import { ResizeHandle } from "./ResizeHandle";
import { clsx } from "clsx";

interface GridItemProps {
  item: GridItemConfig;
  colWidth: number;
  rowHeight: number;
  gap: keyof typeof GAP_MAP;
  isResizable?: boolean;
  isResizing?: boolean;
  isActiveDrag?: boolean;
  renderContent: (isDragging: boolean) => React.ReactNode;
  onResizeStart: () => void;
  onResizeMove: (dw: number, dh: number) => void;
  onResizeEnd: () => void;
}

export const GridItem = ({
  item,
  colWidth,
  rowHeight,
  gap,
  isResizable = true,
  isActiveDrag = false,
  isResizing = false,
  renderContent,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
}: GridItemProps) => {
  const gapPx = GAP_MAP[gap];

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: item,
  });

  // Calculate base grid coordinates based on the item's current configuration
  const baseLeft = item.x * (colWidth + gapPx);
  const baseTop = item.y * (rowHeight + gapPx);
  const width = item.w * colWidth + (item.w - 1) * gapPx;
  const height = item.h * rowHeight + (item.h - 1) * gapPx;

  // CRITICAL FIX: Convert dnd-kit transform deltas directly into absolute top/left coordinates.
  // When dragging ends, `isActiveDrag` becomes false, the transform is ignored, and
  // Framer Motion perfectly tweens from the last known absolute position (mouse position)
  // to the new snapped grid position. No layout jumps!
  const currentLeft = baseLeft + (isActiveDrag && transform ? transform.x : 0);
  const currentTop = baseTop + (isActiveDrag && transform ? transform.y : 0);

  const zIndex = isActiveDrag || isResizing ? 40 : 1;

  return (
    <motion.div
      ref={setNodeRef}
      initial={false}
      animate={{
        left: currentLeft,
        top: currentTop,
        width: width,
        height: height,
        zIndex,
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        mass: 0.8,
        // Disable delay/easing for actively dragged properties so the item tracks
        // the cursor instantly. Let the spring take over only upon release.
        left: isActiveDrag ? { duration: 0 } : undefined,
        top: isActiveDrag ? { duration: 0 } : undefined,
      }}
      className={clsx(
        "absolute touch-none select-none",
        isActiveDrag && !isResizing && "opacity-90",
      )}
    >
      <div className="relative w-full h-full group">
        {/* Invisible hit-area overlay for dragging */}
        <div
          {...attributes}
          {...listeners}
          className={clsx(
            "absolute inset-0 z-0",
            !isResizing && "cursor-grab active:cursor-grabbing",
          )}
        />

        <div className="relative z-10 w-full h-full pointer-events-none">
          {renderContent(isActiveDrag || isResizing)}
        </div>

        {isResizable && !isActiveDrag && (
          <ResizeHandle
            colWidth={colWidth}
            rowHeight={rowHeight}
            gap={gapPx}
            onResizeStart={onResizeStart}
            onResizeMove={onResizeMove}
            onResizeEnd={onResizeEnd}
          />
        )}
      </div>
    </motion.div>
  );
};
