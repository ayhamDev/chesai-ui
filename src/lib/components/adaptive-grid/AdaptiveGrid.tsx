"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { GridItemConfig, GridGap, GAP_MAP } from "./types";
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
  onChange: (items: GridItemConfig[]) => void;
  renderItem: (item: GridItemConfig, isDragging: boolean) => React.ReactNode;
  className?: string;
}

export const AdaptiveGrid = forwardRef<AdaptiveGridHandle, AdaptiveGridProps>(
  ({ items, columns = 12, rowHeight = 60, gap = "md", onChange, renderItem, className }, ref) => {
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
      useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    useEffect(() => {
      if (!activeId && !resizingId) {
        setPreviewLayout(compactLayout(items));
      }
    }, [items, activeId, resizingId]);

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
      compact: () => {
        const compacted = compactLayout(latestPreviewRef.current);
        onChange(compacted);
      },
      reset: () => {
        if (initialLayoutRef.current.length > 0) {
          onChange(JSON.parse(JSON.stringify(initialLayoutRef.current)));
        }
      },
      getLayout: () => latestPreviewRef.current,
    }));

    const handleDragStart = (e: DragStartEvent) => {
      setActiveId(e.active.id as string);
    };

    const handleDragMove = (e: DragMoveEvent) => {
      const { active, delta } = e;
      const origItem = items.find((i) => i.id === active.id);
      if (!origItem) return;

      const moveX = Math.round(delta.x / (colWidth + gapPx));
      const moveY = Math.round(delta.y / (rowHeight + gapPx));

      const newX = Math.max(0, Math.min(columns - origItem.w, origItem.x + moveX));
      const newY = Math.max(0, origItem.y + moveY);

      const simulatedActive = { ...origItem, x: newX, y: newY };
      setPreviewLayout(resolveLayout(items, simulatedActive));
    };

    const handleDragEnd = () => {
      onChange(latestPreviewRef.current);
      setActiveId(null);
    };

    const handleDragCancel = () => {
      setPreviewLayout(compactLayout(items));
      setActiveId(null);
    };

    const handleResizeMove = (id: string, deltaW: number, deltaH: number) => {
      const orig = items.find((i) => i.id === id);
      if (!orig) return;

      let newW = orig.w + deltaW;
      let newH = orig.h + deltaH;

      newW = Math.max(orig.minW || 1, Math.min(orig.maxW || columns, newW));
      newH = Math.max(orig.minH || 1, Math.min(orig.maxH || 100, newH));

      newW = Math.min(columns - orig.x, newW);

      const simulatedActive = { ...orig, w: newW, h: newH };
      setPreviewLayout(resolveLayout(items, simulatedActive));
    };

    const handleResizeEnd = () => {
      onChange(latestPreviewRef.current);
      setResizingId(null);
    };

    const maxRow = Math.max(...previewLayout.map((i) => i.y + i.h), 0);
    const containerHeight = maxRow * rowHeight + Math.max(0, maxRow - 1) * gapPx;
    const activePreviewItem = previewLayout.find((i) => i.id === (activeId || resizingId));

    return (
      <div
        ref={containerRef}
        className={`relative w-full transition-all duration-300 ${className}`}
        style={{ height: `${containerHeight}px`, minHeight: "200px" }}
      >
        <AnimatePresence>
          {(activeId || resizingId) && activePreviewItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-xl"
              style={{
                backgroundImage: `
                  linear-gradient(to right, var(--md-sys-color-outline-variant) 1px, transparent 1px),
                  linear-gradient(to bottom, var(--md-sys-color-outline-variant) 1px, transparent 1px)
                `,
                backgroundSize: `${colWidth + gapPx}px ${rowHeight + gapPx}px`,
                opacity: 0.15,
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(activeId || resizingId) && activePreviewItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: activePreviewItem.x * (colWidth + gapPx),
                top: activePreviewItem.y * (rowHeight + gapPx),
                width: activePreviewItem.w * colWidth + (activePreviewItem.w - 1) * gapPx,
                height: activePreviewItem.h * rowHeight + (activePreviewItem.h - 1) * gapPx,
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
                  renderContent={(interacting) => renderItem(displayItem, interacting)}
                  onResizeStart={() => setResizingId(origItem.id as string)}
                  onResizeMove={(dw, dh) => handleResizeMove(origItem.id as string, dw, dh)}
                  onResizeEnd={handleResizeEnd}
                />
              );
            })}
          </div>
        </DndContext>
      </div>
    );
  }
);

AdaptiveGrid.displayName = "AdaptiveGrid";
