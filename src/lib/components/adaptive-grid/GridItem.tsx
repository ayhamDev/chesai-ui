"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { GridItemConfig, GAP_MAP, ResizeDirection } from "./types";
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
  useDragHandle?: boolean;
  renderContent: (isDragging: boolean, dragHandleProps: Record<string, any>) => React.ReactNode;
  onResizeStart: () => void;
  onResizeMove: (dir: ResizeDirection, dw: number, dh: number) => void;
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
  });

  const baseLeft = item.x * (colWidth + gapPx);
  const baseTop = item.y * (rowHeight + gapPx);
  const width = item.w * colWidth + (item.w - 1) * gapPx;
  const height = item.h * rowHeight + (item.h - 1) * gapPx;

  const currentLeft = baseLeft + (isActiveDrag && transform ? transform.x : 0);
  const currentTop = baseTop + (isActiveDrag && transform ? transform.y : 0);

  const zIndex = isActiveDrag || isResizing ? 40 : 1;

  const rootDragProps = useDragHandle ? {} : { ...attributes, ...listeners };
  const customDragProps = { ...attributes, ...listeners };

  return (
    <motion.div
      ref={setNodeRef}
      initial={false}
      animate={{ left: currentLeft, top: currentTop, width, height, zIndex }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        mass: 0.8,
        left: isActiveDrag ? { duration: 0 } : undefined,
        top: isActiveDrag ? { duration: 0 } : undefined,
      }}
      className={clsx("absolute touch-none select-none", isActiveDrag && !isResizing && "opacity-90")}
    >
      <div
        {...rootDragProps}
        className={clsx("relative w-full h-full group", !useDragHandle && !isResizing && "cursor-grab active:cursor-grabbing")}
      >
        <div className="relative z-10 w-full h-full pointer-events-auto">
          {renderContent(isActiveDrag || isResizing, customDragProps)}
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
