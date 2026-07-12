"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { GridItemConfig, GAP_MAP, ResizeDirection } from "./types";
import { ResizeHandle } from "./ResizeHandle";
import { clsx } from "clsx";

export interface GridItemRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface GridItemProps {
  item: GridItemConfig;
  /** Pixel rect computed by the parent (grid position, or stacked position on mobile). */
  rect: GridItemRect;
  /** Canvas size the drag visual is clamped to, so a dragged card can't
   *  extend the page's scrollable area and trigger auto-scroll runaway. */
  dragBounds?: { width: number; height: number };
  colWidth: number;
  rowHeight: number;
  gap: keyof typeof GAP_MAP;
  isResizable?: boolean;
  isResizing?: boolean;
  isActiveDrag?: boolean;
  /** Static items (stacked mobile mode) cannot be dragged or resized. */
  isStatic?: boolean;
  useDragHandle?: boolean;
  renderContent: (isDragging: boolean, dragHandleProps: Record<string, any>) => React.ReactNode;
  onResizeStart: () => void;
  onResizeMove: (dir: ResizeDirection, dw: number, dh: number) => void;
  onResizeEnd: () => void;
}

export const GridItem = ({
  item,
  rect,
  dragBounds,
  colWidth,
  rowHeight,
  gap,
  isResizable = true,
  isActiveDrag = false,
  isResizing = false,
  isStatic = false,
  useDragHandle = false,
  renderContent,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
}: GridItemProps) => {
  const gapPx = GAP_MAP[gap];
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: item,
    disabled: isStatic,
  });

  let currentLeft = rect.left + (isActiveDrag && transform ? transform.x : 0);
  let currentTop = rect.top + (isActiveDrag && transform ? transform.y : 0);
  if (isActiveDrag && dragBounds) {
    currentLeft = Math.min(
      Math.max(0, currentLeft),
      Math.max(0, dragBounds.width - rect.width),
    );
    currentTop = Math.min(
      Math.max(0, currentTop),
      Math.max(0, dragBounds.height - rect.height),
    );
  }

  const zIndex = isActiveDrag || isResizing ? 40 : 1;

  const dragProps = isStatic ? {} : { ...attributes, ...listeners };
  const rootDragProps = useDragHandle ? {} : dragProps;

  return (
    <motion.div
      ref={setNodeRef}
      initial={false}
      animate={{ left: currentLeft, top: currentTop, width: rect.width, height: rect.height, zIndex }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        mass: 0.8,
        left: isActiveDrag ? { duration: 0 } : undefined,
        top: isActiveDrag ? { duration: 0 } : undefined,
      }}
      className={clsx(
        "absolute",
        !isStatic && "touch-none select-none",
        isActiveDrag && !isResizing && "opacity-90",
      )}
    >
      <div
        {...rootDragProps}
        className={clsx(
          "relative w-full h-full group",
          !isStatic && !useDragHandle && !isResizing && "cursor-grab active:cursor-grabbing",
        )}
      >
        <div className="relative z-10 w-full h-full pointer-events-auto">
          {renderContent(isActiveDrag || isResizing, dragProps)}
        </div>

        {isResizable && !isStatic && !isActiveDrag && (
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
