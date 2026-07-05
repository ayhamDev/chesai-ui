"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { GridItemConfig, GridGap, GAP_MAP, ResizeDirection } from "./types";
import { GridItem } from "./GridItem";
import { resolveLayout, compactLayout } from "./layout-engine";
import { motion, AnimatePresence } from "framer-motion";

export interface AdaptiveGridHandle {
  compact: () => void;
  reset: () => void;
  getLayout: () => GridItemConfig[];
}

interface AdaptiveGridProps {
  items: GridItemConfig[];
  columns?: number;
  rowHeight?: number;
  gap?: GridGap;
  useDragHandle?: boolean;
  gravityEnabled?: boolean;
  onChange: (items: GridItemConfig[]) => void;
  renderItem: (
    item: GridItemConfig,
    isDragging: boolean,
    dragHandleProps: Record<string, any>,
  ) => React.ReactNode;
  className?: string;
}

export const AdaptiveGrid = forwardRef<AdaptiveGridHandle, AdaptiveGridProps>(
  (
    {
      items,
      columns = 12,
      rowHeight = 60,
      gap = "md",
      useDragHandle = false,
      gravityEnabled = true,
      onChange,
      renderItem,
      className,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [colWidth, setColWidth] = useState(0);
    const gapPx = GAP_MAP[gap];

    const [activeId, setActiveId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [previewLayout, setPreviewLayout] = useState<GridItemConfig[]>(items);

    const initialLayoutRef = useRef<GridItemConfig[]>([]);
    useEffect(() => {
      if (initialLayoutRef.current.length === 0 && items.length > 0) {
        initialLayoutRef.current = JSON.parse(JSON.stringify(items));
      }
    }, [items]);

    const latestPreviewRef = useRef<GridItemConfig[]>(previewLayout);
    useEffect(() => {
      latestPreviewRef.current = previewLayout;
    }, [previewLayout]);

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    useEffect(() => {
      if (!activeId && !resizingId) {
        setPreviewLayout(compactLayout(items, undefined, gravityEnabled));
      }
    }, [items, activeId, resizingId, gravityEnabled]);

    useEffect(() => {
      const updateWidth = () => {
        if (containerRef.current) {
          const totalGap = (columns - 1) * gapPx;
          setColWidth((containerRef.current.offsetWidth - totalGap) / columns);
        }
      };
      updateWidth();
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }, [columns, gapPx]);

    useImperativeHandle(ref, () => ({
      compact: () => onChange(compactLayout(latestPreviewRef.current, undefined, true)),
      reset: () =>
        onChange(JSON.parse(JSON.stringify(initialLayoutRef.current))),
      getLayout: () => latestPreviewRef.current,
    }));

    // --- DND HANDLERS ---
    const handleDragStart = (e: DragStartEvent) =>
      setActiveId(e.active.id as string);

    const handleDragMove = (e: DragMoveEvent) => {
      const { active, delta } = e;
      const origItem = items.find((i) => i.id === active.id);
      if (!origItem) return;

      const moveX = Math.round(delta.x / (colWidth + gapPx));
      const moveY = Math.round(delta.y / (rowHeight + gapPx));

      const newX = Math.max(
        0,
        Math.min(columns - origItem.w, origItem.x + moveX),
      );
      const newY = Math.max(0, origItem.y + moveY);

      const simulatedActive = { ...origItem, x: newX, y: newY };
      setPreviewLayout(resolveLayout(items, simulatedActive, columns, gravityEnabled));
    };

    const handleDragEnd = () => {
      onChange(latestPreviewRef.current);
      setActiveId(null);
    };

    const handleDragCancel = () => {
      setPreviewLayout(compactLayout(items, undefined, gravityEnabled));
      setActiveId(null);
    };

    // --- 8-WAY RESIZE HANDLERS ---
    const handleResizeMove = (
      id: string,
      direction: ResizeDirection,
      deltaX: number,
      deltaY: number,
    ) => {
      const orig = items.find((i) => i.id === id);
      if (!orig) return;

      let newX = orig.x;
      let newY = orig.y;
      let newW = orig.w;
      let newH = orig.h;

      // Horizontal Edges
      if (direction.includes("r")) {
        newW = Math.max(
          orig.minW || 1,
          Math.min(orig.maxW || columns, orig.w + deltaX),
        );
        newW = Math.min(columns - newX, newW); // Clamp to right grid edge
      }
      if (direction.includes("l")) {
        let allowedDeltaX = deltaX;
        if (orig.x + allowedDeltaX < 0) allowedDeltaX = -orig.x; // Cannot break left edge

        let tempW = orig.w - allowedDeltaX;
        if (tempW < (orig.minW || 1)) {
          tempW = orig.minW || 1;
          allowedDeltaX = orig.w - tempW;
        } else if (tempW > (orig.maxW || columns)) {
          tempW = orig.maxW || columns;
          allowedDeltaX = orig.w - tempW;
        }

        newX = orig.x + allowedDeltaX;
        newW = tempW;
      }

      // Vertical Edges
      if (direction.includes("b")) {
        newH = Math.max(
          orig.minH || 1,
          Math.min(orig.maxH || 100, orig.h + deltaY),
        );
      }
      if (direction.includes("t")) {
        let allowedDeltaY = deltaY;
        if (orig.y + allowedDeltaY < 0) allowedDeltaY = -orig.y;

        let tempH = orig.h - allowedDeltaY;
        if (tempH < (orig.minH || 1)) {
          tempH = orig.minH || 1;
          allowedDeltaY = orig.h - tempH;
        } else if (tempH > (orig.maxH || 100)) {
          tempH = orig.maxH || 100;
          allowedDeltaY = orig.h - tempH;
        }

        newY = orig.y + allowedDeltaY;
        newH = tempH;
      }

      const simulatedActive = { ...orig, x: newX, y: newY, w: newW, h: newH };
      setPreviewLayout(resolveLayout(items, simulatedActive, columns, gravityEnabled));
    };

    const maxRow = Math.max(...previewLayout.map((i) => i.y + i.h), 0);
    const containerHeight =
      maxRow * rowHeight + Math.max(0, maxRow - 1) * gapPx;
    const activePreviewItem = previewLayout.find(
      (i) => i.id === (activeId || resizingId),
    );

    return (
      <div
        ref={containerRef}
        className={`relative w-full transition-all duration-300 ${className}`}
        style={{ height: `${containerHeight}px`, minHeight: "200px" }}
      >
        {/* BACKGROUND BLOCK BLUEPRINT GRID */}
        <AnimatePresence>
          {(activeId || resizingId) && activePreviewItem && colWidth > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 pointer-events-none z-0"
            >
              <svg width="100%" height="100%" opacity={0.3}>
                <defs>
                  <pattern
                    id="grid-blocks"
                    width={colWidth + gapPx}
                    height={rowHeight + gapPx}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      x="0"
                      y="0"
                      width={colWidth}
                      height={rowHeight}
                      rx="8" // Match standard soft card corners
                      fill="var(--md-sys-color-surface-container-highest)"
                      fillOpacity="0.4"
                      stroke="var(--md-sys-color-outline-variant)"
                      strokeOpacity="0.6"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-blocks)" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GHOST SNAP PREVIEW */}
        <AnimatePresence>
          {(activeId || resizingId) && activePreviewItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: activePreviewItem.x * (colWidth + gapPx),
                top: activePreviewItem.y * (rowHeight + gapPx),
                width:
                  activePreviewItem.w * colWidth +
                  (activePreviewItem.w - 1) * gapPx,
                height:
                  activePreviewItem.h * rowHeight +
                  (activePreviewItem.h - 1) * gapPx,
              }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute z-0 bg-primary/10 border-2 border-primary/40 rounded-xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="relative z-10 w-full h-full">
            {items.map((origItem) => {
              const isDragging = activeId === origItem.id;
              const isResizing = resizingId === origItem.id;
              const displayItem = isDragging
                ? origItem
                : previewLayout.find((p) => p.id === origItem.id) || origItem;

              return (
                <GridItem
                  key={origItem.id}
                  item={displayItem}
                  colWidth={colWidth}
                  rowHeight={rowHeight}
                  gap={gap}
                  isActiveDrag={isDragging}
                  isResizing={isResizing}
                  useDragHandle={useDragHandle}
                  renderContent={(interacting, dragProps) =>
                    renderItem(displayItem, interacting, dragProps)
                  }
                  onResizeStart={() => setResizingId(origItem.id as string)}
                  onResizeMove={(dir, dx, dy) =>
                    handleResizeMove(origItem.id as string, dir, dx, dy)
                  }
                  onResizeEnd={() => {
                    onChange(latestPreviewRef.current);
                    setResizingId(null);
                  }}
                />
              );
            })}
          </div>
        </DndContext>
      </div>
    );
  },
);
AdaptiveGrid.displayName = "AdaptiveGrid";
