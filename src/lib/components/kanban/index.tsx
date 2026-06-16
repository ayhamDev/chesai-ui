// src/lib/components/kanban/index.tsx

"use client";

import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import { GripVertical } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { cardVariants } from "../card"; // Leveraging core Card variations
import { ElasticScrollArea } from "../elastic-scroll-area";
import { Typography } from "../typography";

// --- TYPES ---

export interface KanbanItemData {
  id: UniqueIdentifier;
  [key: string]: any;
}

export interface KanbanColumnData<T extends KanbanItemData = KanbanItemData> {
  id: UniqueIdentifier;
  title: string;
  items: T[];
}

export interface KanbanBoardProps<T extends KanbanItemData> {
  columns: KanbanColumnData<T>[];
  onChange: (columns: KanbanColumnData<T>[]) => void;
  renderCard: (item: T, isDragging: boolean) => React.ReactNode;
  renderColumnHeader?: (
    column: KanbanColumnData<T>,
    dragHandleProps: Record<string, any>,
  ) => React.ReactNode;
  renderColumnFooter?: (column: KanbanColumnData<T>) => React.ReactNode;
  boardTrailingContent?: React.ReactNode;
  onCardClick?: (item: T) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  className?: string;
  columnWidth?: number | string;

  /** Standard Card visual styles applied to columns */
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "high-contrast"
    | "ghost"
    | "surface"
    | "surface-container-lowest"
    | "surface-container-low"
    | "surface-container"
    | "surface-container-high"
    | "surface-container-highest";
  /** Standard Card border shapes applied to columns */
  shape?: "full" | "minimal" | "sharp";
  /** Renders outer boundary border lines on columns */
  bordered?: boolean;
  /** Controls columns drop-shadow levels */
  elevation?: "none" | 1 | 2 | 3 | 4 | 5;
  /** Applies back-blur translucent glass effects to columns */
  glass?: boolean;
}

// --- SUB-COMPONENTS ---

interface SortableItemProps<T> {
  item: T;
  renderCard: (item: T, isDragging: boolean) => React.ReactNode;
  onClick?: (item: T) => void;
}

function SortableItem<T extends KanbanItemData>({
  item,
  renderCard,
  onClick,
}: SortableItemProps<T>) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: "Item", item },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (e.defaultPrevented || isDragging) return;

        const target = e.target as HTMLElement;
        const isInteractiveChild = target.closest(
          'button, a, input, select, textarea, [data-no-click="true"]',
        );

        if (isInteractiveChild) return;

        onClick?.(item);
      }}
      className="relative w-full touch-none select-none outline-none group/card z-0 cursor-pointer"
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5" />
      )}
      <div
        className={clsx(
          "transition-opacity duration-200",
          isDragging && "opacity-0",
        )}
      >
        {renderCard(item, isDragging)}
      </div>
    </div>
  );
}

interface SortableColumnProps<T> {
  column: KanbanColumnData<T>;
  renderCard: (item: T, isDragging: boolean) => React.ReactNode;
  renderColumnHeader?: (
    column: KanbanColumnData<T>,
    dragHandleProps: Record<string, any>,
  ) => React.ReactNode;
  renderColumnFooter?: (column: KanbanColumnData<T>) => React.ReactNode;
  onCardClick?: (item: T) => void;
  width: number | string;
  variant: KanbanBoardProps<any>["variant"];
  shape: KanbanBoardProps<any>["shape"];
  bordered: boolean;
  elevation: KanbanBoardProps<any>["elevation"];
  glass: boolean;
}

function SortableColumn<T extends KanbanItemData>({
  column,
  renderCard,
  renderColumnHeader,
  renderColumnFooter,
  onCardClick,
  width,
  variant,
  shape,
  bordered,
  elevation,
  glass,
}: SortableColumnProps<T>) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    width,
  };

  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={twMerge(
        cardVariants({
          shape,
          variant,
          bordered,
          elevation,
          glass,
          padding: "none", // Manage inner column structure individually
        }),
        "flex flex-col shrink-0 max-h-full transition-all duration-300 relative overflow-hidden",
        isDragging &&
          "bg-surface-container-highest border-primary/30 opacity-60 z-50 scale-[0.98] shadow-2xl",
      )}
    >
      {renderColumnHeader ? (
        renderColumnHeader(column, dragHandleProps)
      ) : (
        <div
          {...dragHandleProps}
          className="flex items-center justify-between p-4 pb-2 cursor-grab active:cursor-grabbing outline-none touch-none"
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 opacity-40" />
            <Typography variant="title-small" className="font-bold truncate">
              {column.title}
            </Typography>
            <span className="flex items-center justify-center bg-surface-container-highest px-2 py-0.5 rounded-full text-xs font-bold opacity-80">
              {column.items.length}
            </span>
          </div>
        </div>
      )}

      <ElasticScrollArea className="flex-1 w-full" scrollbarVisibility="auto">
        <div className="flex flex-col gap-3 p-3 pt-2 min-h-[150px]">
          <SortableContext
            items={column.items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                renderCard={renderCard}
                onClick={onCardClick}
              />
            ))}
          </SortableContext>
        </div>
      </ElasticScrollArea>

      {renderColumnFooter && (
        <div className="p-3 pt-1 shrink-0">{renderColumnFooter(column)}</div>
      )}
    </div>
  );
}

// --- MAIN BOARD COMPONENT ---

export function KanbanBoard<T extends KanbanItemData>({
  columns,
  onChange,
  renderCard,
  renderColumnHeader,
  renderColumnFooter,
  boardTrailingContent,
  onCardClick,
  className,
  columnWidth = 340,
  variant = "surface-container-low",
  shape = "minimal",
  bordered = false,
  elevation = "none",
  glass = false,
  onDragStart,
  onDragOver,
  onDragEnd,
}: KanbanBoardProps<T>) {
  const [localColumns, setLocalColumns] =
    useState<KanbanColumnData<T>[]>(columns);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeColumn, setActiveColumn] = useState<KanbanColumnData<T> | null>(
    null,
  );
  const [activeItem, setActiveItem] = useState<T | null>(null);
  const [activeType, setActiveType] = useState<"Column" | "Item" | null>(null);

  useEffect(() => {
    if (!isDraggingBoard) {
      setLocalColumns(columns);
    }
  }, [columns, isDraggingBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const collisionDetectionStrategy = useCallback(
    (args: any) => {
      if (activeType === "Column") return closestCorners(args);
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) return pointerCollisions;
      const rectCollisions = rectIntersection(args);
      if (rectCollisions.length > 0) return rectCollisions;
      return closestCorners(args);
    },
    [activeType],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setIsDraggingBoard(true);
    const { active } = event;
    const { id } = active;
    setActiveId(id);

    const isColumn = localColumns.some((col) => col.id === id);
    if (isColumn) {
      setActiveType("Column");
      setActiveColumn(localColumns.find((col) => col.id === id) || null);
    } else {
      setActiveType("Item");
      for (const col of localColumns) {
        const item = col.items.find((i) => i.id === id);
        if (item) {
          setActiveItem(item);
          break;
        }
      }
    }
    onDragStart?.(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    onDragOver?.(event);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (active.data.current?.type === "Column") return;

    setLocalColumns((prev) => {
      const activeColumnId = prev.find((col) =>
        col.items.some((i) => i.id === activeId),
      )?.id;
      const overColumnId =
        prev.find((col) => col.items.some((i) => i.id === overId))?.id ||
        (prev.some((col) => col.id === overId) ? overId : null);

      if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
        return prev;
      }

      const activeColIndex = prev.findIndex((col) => col.id === activeColumnId);
      const overColIndex = prev.findIndex((col) => col.id === overColumnId);

      if (activeColIndex === -1 || overColIndex === -1) return prev;

      const activeItems = [...prev[activeColIndex].items];
      const overItems = [...prev[overColIndex].items];

      const activeItemIndex = activeItems.findIndex(
        (item) => item.id === activeId,
      );
      const overItemIndex = overItems.findIndex((item) => item.id === overId);

      if (activeItemIndex === -1) return prev;

      const [movedItem] = activeItems.splice(activeItemIndex, 1);

      const newIndex = overItemIndex >= 0 ? overItemIndex : overItems.length;
      overItems.splice(newIndex, 0, movedItem);

      const newColumns = [...prev];
      newColumns[activeColIndex] = {
        ...prev[activeColIndex],
        items: activeItems,
      };
      newColumns[overColIndex] = { ...prev[overColIndex], items: overItems };

      return newColumns;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingBoard(false);
    setActiveId(null);
    setActiveColumn(null);
    setActiveItem(null);
    setActiveType(null);
    onDragEnd?.(event);

    const { active, over } = event;
    if (!over) {
      setLocalColumns(columns);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (active.data.current?.type === "Column") {
      const activeColIndex = localColumns.findIndex(
        (col) => col.id === activeId,
      );
      const overColIndex = localColumns.findIndex((col) => col.id === overId);

      if (
        activeColIndex !== overColIndex &&
        activeColIndex !== -1 &&
        overColIndex !== -1
      ) {
        const newColumns = arrayMove(
          localColumns,
          activeColIndex,
          overColIndex,
        );
        setLocalColumns(newColumns);
        onChange(newColumns);
      }
      return;
    }

    const activeColumnId = localColumns.find((col) =>
      col.items.some((i) => i.id === activeId),
    )?.id;
    const overColumnId =
      localColumns.find((col) => col.items.some((i) => i.id === overId))?.id ||
      (localColumns.some((col) => col.id === overId) ? overId : null);

    if (activeColumnId && overColumnId && activeColumnId === overColumnId) {
      const colIndex = localColumns.findIndex(
        (col) => col.id === activeColumnId,
      );
      const col = localColumns[colIndex];

      const activeItemIndex = col.items.findIndex(
        (item) => item.id === activeId,
      );
      const overItemIndex = col.items.findIndex((item) => item.id === overId);

      if (
        activeItemIndex !== overItemIndex &&
        activeItemIndex !== -1 &&
        overItemIndex !== -1
      ) {
        const newItems = arrayMove(col.items, activeItemIndex, overItemIndex);
        const newColumns = [...localColumns];
        newColumns[colIndex] = { ...col, items: newItems };
        setLocalColumns(newColumns);
        onChange(newColumns);
      } else {
        onChange(localColumns);
      }
    } else {
      onChange(localColumns);
    }
  };

  const handleDragCancel = () => {
    setIsDraggingBoard(false);
    setActiveId(null);
    setActiveColumn(null);
    setActiveItem(null);
    setActiveType(null);
    setLocalColumns(columns);
  };

  return (
    <div className={clsx("flex h-full w-full overflow-hidden", className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <ElasticScrollArea className="w-full h-full" orientation="horizontal">
          <div className="flex h-full gap-5 p-6 items-start w-max">
            <SortableContext
              items={localColumns.map((col) => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {localColumns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  width={columnWidth}
                  variant={variant}
                  shape={shape}
                  bordered={bordered}
                  elevation={elevation}
                  glass={glass}
                  renderCard={renderCard}
                  renderColumnHeader={renderColumnHeader}
                  renderColumnFooter={renderColumnFooter}
                  onCardClick={onCardClick}
                />
              ))}
            </SortableContext>

            {boardTrailingContent && (
              <div className="shrink-0" style={{ width: columnWidth }}>
                {boardTrailingContent}
              </div>
            )}
          </div>
        </ElasticScrollArea>

        {typeof window !== "undefined" && (
          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: "0.4" } },
              }),
            }}
          >
            {activeType === "Column" && activeColumn ? (
              <div className="rotate-2 opacity-95 shadow-2xl scale-[1.02] cursor-grabbing">
                <SortableColumn
                  column={activeColumn}
                  width={columnWidth}
                  variant={variant}
                  shape={shape}
                  bordered={bordered}
                  elevation={elevation}
                  glass={glass}
                  renderCard={renderCard}
                  renderColumnHeader={renderColumnHeader}
                  renderColumnFooter={renderColumnFooter}
                  onCardClick={onCardClick}
                />
              </div>
            ) : null}

            {activeType === "Item" && activeItem ? (
              <div className="rotate-3 opacity-95 shadow-2xl scale-[1.05] cursor-grabbing pointer-events-none">
                {renderCard(activeItem, false)}
              </div>
            ) : null}
          </DragOverlay>
        )}
      </DndContext>
    </div>
  );
}

export const Kanban = Object.assign(KanbanBoard, {
  Board: KanbanBoard,
});
