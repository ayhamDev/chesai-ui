"use client";

import type React from "react";
import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  DndContext,
  type DragStartEvent,
  type DragMoveEvent,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  type GridItemConfig,
  type GridGap,
  GAP_MAP,
  type ResizeDirection,
} from "./types";
import { GridItem, type GridItemRect } from "./GridItem";
import {
  resolveLayout,
  compactLayout,
  fitLayoutToColumns,
  getResponsiveColumnCount,
} from "./layout-engine";
import { motion, AnimatePresence } from "framer-motion";

export interface AdaptiveGridHandle {
  compact: () => void;
  reset: () => void;
  getLayout: () => GridItemConfig[];
}

export interface AdaptiveGridProps {
  items: GridItemConfig[];
  columns?: number;
  /**
   * Minimum width (px) of an individual grid column. As the container narrows,
   * the grid removes columns and reflows items before entering stacked mode.
   * Pass false to keep a fixed column count. Default 40.
   */
  minColumnWidth?: number | false;
  rowHeight?: number;
  gap?: GridGap;
  useDragHandle?: boolean;
  gravityEnabled?: boolean;
  /**
   * Container width (px) below which items render as a full-width vertical
   * stack (ordered by y, then x) with drag/resize disabled. The stored layout
   * is never mutated by stacking. Pass false to disable. Default 600.
   */
  stackBelow?: number | false;
  /** Fixed item height (px) in stacked mode. Defaults to item.h × rowHeight (+ gaps). */
  stackedItemHeight?: number;
  onChange: (items: GridItemConfig[]) => void;
  renderItem: (
    item: GridItemConfig,
    isDragging: boolean,
    dragHandleProps: React.HTMLAttributes<HTMLElement>,
  ) => React.ReactNode;
  className?: string;
}

export const AdaptiveGrid = forwardRef<AdaptiveGridHandle, AdaptiveGridProps>(
  (
    {
      items,
      columns = 12,
      minColumnWidth = 40,
      rowHeight = 60,
      gap = "md",
      useDragHandle = false,
      gravityEnabled = true,
      stackBelow = 600,
      stackedItemHeight,
      onChange,
      renderItem,
      className,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const gapPx = GAP_MAP[gap];
    const responsiveColumns =
      minColumnWidth === false
        ? columns
        : getResponsiveColumnCount(
            containerWidth,
            columns,
            gapPx,
            minColumnWidth,
          );

    const colWidth =
      containerWidth > 0
        ? (containerWidth - (responsiveColumns - 1) * gapPx) /
          responsiveColumns
        : 0;
    const isStacked =
      stackBelow !== false && containerWidth > 0 && containerWidth < stackBelow;

    const [activeId, setActiveId] = useState<string | null>(null);
    const [resizingId, setResizingId] = useState<string | null>(null);
    const [previewLayout, setPreviewLayout] = useState<GridItemConfig[]>(items);
    const interactionLayoutRef = useRef<GridItemConfig[]>([]);

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
        const nextLayout = compactLayout(items, undefined, gravityEnabled);
        latestPreviewRef.current = nextLayout;
        setPreviewLayout(nextLayout);
      }
    }, [items, activeId, resizingId, gravityEnabled]);

    const displayLayout =
      !isStacked && responsiveColumns < columns
        ? fitLayoutToColumns(
            previewLayout,
            responsiveColumns,
            gravityEnabled,
          )
        : previewLayout;

    // Width changes are frozen while dragging/resizing: on classic-scrollbar
    // browsers, container growth mid-drag toggles the page scrollbar, which
    // narrows the container — re-applying that live reflows every card under
    // the pointer and breaks the drag. Buffer it and flush when idle.
    const latestWidthRef = useRef(0);
    const interactingRef = useRef(false);
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          latestWidthRef.current = entry.contentRect.width;
          if (!interactingRef.current) {
            setContainerWidth(entry.contentRect.width);
          }
        }
      });
      observer.observe(el);
      latestWidthRef.current = el.offsetWidth;
      setContainerWidth(el.offsetWidth);
      return () => observer.disconnect();
    }, []);

    const flushWidth = () => {
      interactingRef.current = false;
      setContainerWidth(latestWidthRef.current);
    };

    useImperativeHandle(ref, () => ({
      compact: () => onChange(compactLayout(latestPreviewRef.current, undefined, true)),
      reset: () =>
        onChange(JSON.parse(JSON.stringify(initialLayoutRef.current))),
      getLayout: () => latestPreviewRef.current,
    }));

    // --- DND HANDLERS ---
    const handleDragStart = (e: DragStartEvent) => {
      interactingRef.current = true;
      interactionLayoutRef.current = displayLayout;
      latestPreviewRef.current = displayLayout;
      setPreviewLayout(displayLayout);
      setActiveId(e.active.id as string);
    };

    const handleDragMove = (e: DragMoveEvent) => {
      if (isStacked) return;
      const { active, delta } = e;
      const interactionLayout = interactionLayoutRef.current;
      const origItem = interactionLayout.find((i) => i.id === active.id);
      if (!origItem) return;

      const moveX = Math.round(delta.x / (colWidth + gapPx));
      const moveY = Math.round(delta.y / (rowHeight + gapPx));

      const newX = Math.max(
        0,
        Math.min(responsiveColumns - origItem.w, origItem.x + moveX),
      );
      // Clamp to the content's bottom edge: without this, page auto-scroll
      // feeds the drag delta, which grows the container, which allows more
      // scroll — a runaway loop when dragging toward the canvas bottom.
      const maxBottom = Math.max(
        0,
        ...interactionLayout.map((i) => i.y + i.h),
      );
      const newY = Math.min(Math.max(0, origItem.y + moveY), maxBottom);

      const simulatedActive = { ...origItem, x: newX, y: newY };
      const nextLayout = resolveLayout(
        interactionLayout,
        simulatedActive,
        responsiveColumns,
        gravityEnabled,
      );
      latestPreviewRef.current = nextLayout;
      setPreviewLayout(nextLayout);
    };

    const handleDragEnd = () => {
      onChange(latestPreviewRef.current);
      setActiveId(null);
      flushWidth();
    };

    const handleDragCancel = () => {
      const nextLayout = compactLayout(items, undefined, gravityEnabled);
      latestPreviewRef.current = nextLayout;
      setPreviewLayout(nextLayout);
      setActiveId(null);
      flushWidth();
    };

    // --- 8-WAY RESIZE HANDLERS ---
    const handleResizeMove = (
      id: string,
      direction: ResizeDirection,
      deltaX: number,
      deltaY: number,
    ) => {
      if (isStacked) return;
      const interactionLayout = interactionLayoutRef.current;
      const orig = interactionLayout.find((i) => i.id === id);
      if (!orig) return;
      const minWidth = Math.min(orig.minW || 1, responsiveColumns);
      const maxWidth = Math.min(
        orig.maxW || responsiveColumns,
        responsiveColumns,
      );

      let newX = orig.x;
      let newY = orig.y;
      let newW = orig.w;
      let newH = orig.h;

      // Horizontal Edges
      if (direction.includes("r")) {
        newW = Math.max(
          minWidth,
          Math.min(maxWidth, orig.w + deltaX),
        );
        newW = Math.min(responsiveColumns - newX, newW); // Clamp to right grid edge
      }
      if (direction.includes("l")) {
        let allowedDeltaX = deltaX;
        if (orig.x + allowedDeltaX < 0) allowedDeltaX = -orig.x; // Cannot break left edge

        let tempW = orig.w - allowedDeltaX;
        if (tempW < minWidth) {
          tempW = minWidth;
          allowedDeltaX = orig.w - tempW;
        } else if (tempW > maxWidth) {
          tempW = maxWidth;
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
      const nextLayout = resolveLayout(
        interactionLayout,
        simulatedActive,
        responsiveColumns,
        gravityEnabled,
      );
      latestPreviewRef.current = nextLayout;
      setPreviewLayout(nextLayout);
    };

    // --- GEOMETRY ---
    const gridRect = (item: GridItemConfig): GridItemRect => ({
      left: item.x * (colWidth + gapPx),
      top: item.y * (rowHeight + gapPx),
      width: item.w * colWidth + (item.w - 1) * gapPx,
      height: item.h * rowHeight + (item.h - 1) * gapPx,
    });

    // Stacked mode: full-width vertical stack ordered by (y, x); the stored
    // layout stays untouched so the desktop arrangement survives round-trips.
    const stackedRects = new Map<UniqueIdentifier, GridItemRect>();
    let stackedHeight = 0;
    if (isStacked) {
      const ordered = [...displayLayout].sort(
        (a, b) => a.y - b.y || a.x - b.x,
      );
      let top = 0;
      for (const item of ordered) {
        const height =
          stackedItemHeight ?? item.h * rowHeight + (item.h - 1) * gapPx;
        stackedRects.set(item.id, { left: 0, top, width: containerWidth, height });
        top += height + gapPx;
      }
      stackedHeight = Math.max(0, top - gapPx);
    }

    const maxRow = Math.max(...displayLayout.map((i) => i.y + i.h), 0);
    const containerHeight = isStacked
      ? stackedHeight
      : maxRow * rowHeight + Math.max(0, maxRow - 1) * gapPx;
    const activePreviewItem = displayLayout.find(
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
          {!isStacked && (activeId || resizingId) && activePreviewItem && colWidth > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 pointer-events-none z-0"
            >
              <svg
                width="100%"
                height="100%"
                opacity={0.3}
                aria-hidden="true"
              >
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
          {!isStacked && (activeId || resizingId) && activePreviewItem && (
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
            {containerWidth > 0 && items.map((origItem) => {
              const isDragging = activeId === origItem.id;
              const isResizing = resizingId === origItem.id;
              const displayItem = isDragging
                ? interactionLayoutRef.current.find(
                    (item) => item.id === origItem.id,
                  ) || origItem
                : displayLayout.find((p) => p.id === origItem.id) || origItem;
              const rect = isStacked
                ? stackedRects.get(origItem.id) ?? gridRect(displayItem)
                : gridRect(displayItem);

              return (
                <GridItem
                  key={origItem.id}
                  item={displayItem}
                  rect={rect}
                  dragBounds={{ width: containerWidth, height: containerHeight }}
                  isStatic={isStacked}
                  colWidth={colWidth}
                  rowHeight={rowHeight}
                  gap={gap}
                  isActiveDrag={isDragging}
                  isResizing={isResizing}
                  useDragHandle={useDragHandle}
                  renderContent={(interacting, dragProps) =>
                    renderItem(displayItem, interacting, dragProps)
                  }
                  onResizeStart={() => {
                    interactingRef.current = true;
                    interactionLayoutRef.current = displayLayout;
                    latestPreviewRef.current = displayLayout;
                    setPreviewLayout(displayLayout);
                    setResizingId(origItem.id as string);
                  }}
                  onResizeMove={(dir, dx, dy) =>
                    handleResizeMove(origItem.id as string, dir, dx, dy)
                  }
                  onResizeEnd={() => {
                    onChange(latestPreviewRef.current);
                    setResizingId(null);
                    flushWidth();
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
