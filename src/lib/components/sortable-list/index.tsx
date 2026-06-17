"use client";
import { createPortal } from "react-dom"; // Add this import

import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  type SortableContextProps,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import React, { createContext, useContext, useMemo, useState } from "react";

// --- CONTEXT ---

const SortableOverlayContext = createContext<boolean>(false);

interface SortableItemContextValue {
  attributes: Record<string, any>;
  listeners: Record<string, any>;
  isDragging: boolean;
}
const SortableItemContext = createContext<SortableItemContextValue>({
  attributes: {},
  listeners: {},
  isDragging: false,
});

export const useSortableItem = () => useContext(SortableItemContext);

// --- ROOT COMPONENT ---

export interface SortableListProps<
  T extends { id: string | number },
> extends Omit<React.HTMLAttributes<HTMLDivElement>, "id"> {
  /** Array of items to be rendered. Each must have a unique `id` */
  items: T[];
  /** Callback fired when items are successfully reordered */
  onReorder: (items: T[]) => void;
  /** React children */
  children: React.ReactNode;
  /** Render prop for the DragOverlay. This dictates how the item looks while being dragged. */
  renderOverlay?: (activeItem: T) => React.ReactNode;
  /** Sorting strategy. Defaults to rectSortingStrategy which supports both grids and lists. */
  strategy?: SortableContextProps["strategy"];
  /** Render as a different element or merge onto a child via Radix Slot */
  asChild?: boolean;
}

function SortableListInner<T extends { id: string | number }>({
  items,
  onReorder,
  renderOverlay,
  children,
  className,
  strategy = rectSortingStrategy,
  asChild = false,
  ...props
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return items.find((item) => item.id === activeId);
  }, [activeId, items]);

  const Comp = asChild ? Slot : "div";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={strategy}>
        <Comp className={className} {...(props as any)}>
          {children}
        </Comp>
      </SortableContext>

      {typeof window !== "undefined" &&
        createPortal(
          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: "0.4" } },
              }),
            }}
          >
            {activeItem && renderOverlay ? (
              <SortableOverlayContext.Provider value={true}>
                {renderOverlay(activeItem)}
              </SortableOverlayContext.Provider>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}

export const SortableListRoot = SortableListInner as <
  T extends { id: string | number },
>(
  props: SortableListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement;

// --- ITEM COMPONENT ---

export interface SortableItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "id"
> {
  /** Must match the item's unique id in the data array */
  id: string | number;
  /** Disables dragging for this specific item */
  disabled?: boolean;
  /** Render as a different element or merge onto a child via Radix Slot */
  asChild?: boolean;
}

const SortableItemWithDnd = React.forwardRef<HTMLElement, SortableItemProps>(
  ({ id, disabled, asChild, className, style, children, ...props }, ref) => {
    const {
      setNodeRef,
      transform,
      transition,
      isDragging,
      attributes,
      listeners,
    } = useSortable({ id, disabled });

    const Comp = asChild ? Slot : "div";

    const combinedStyle: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      ...(isDragging ? { opacity: 0.4, zIndex: 0 } : {}),
      ...style,
    };

    return (
      <SortableItemContext.Provider
        value={{
          attributes: attributes || {},
          listeners: listeners || {},
          isDragging: !!isDragging,
        }}
      >
        <Comp
          ref={setNodeRef}
          style={combinedStyle}
          className={clsx("outline-none", className)}
          {...(props as any)}
        >
          {children}
        </Comp>
      </SortableItemContext.Provider>
    );
  },
);
SortableItemWithDnd.displayName = "SortableItemWithDnd";

const SortableItemWrapper = React.forwardRef<HTMLElement, SortableItemProps>(
  ({ asChild, className, style, children, ...props }, ref) => {
    const isOverlay = useContext(SortableOverlayContext);
    const Comp = asChild ? Slot : "div";

    // If rendering inside the DragOverlay, skip Dnd hooks to avoid ID collisions
    if (isOverlay) {
      return (
        <Comp
          ref={ref as any}
          className={clsx("cursor-grabbing shadow-2xl scale-[1.02]", className)}
          style={style}
          {...(props as any)}
        >
          {children}
        </Comp>
      );
    }
    return (
      <SortableItemWithDnd
        ref={ref}
        asChild={asChild}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </SortableItemWithDnd>
    );
  },
);
SortableItemWrapper.displayName = "SortableList.Item";

// --- DRAG HANDLE COMPONENT ---

export interface SortableDragHandleProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const SortableDragHandle = React.forwardRef<
  HTMLElement,
  SortableDragHandleProps
>(({ className, asChild, children, ...props }, ref) => {
  const { attributes, listeners } = useSortableItem();
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref as any}
      type={asChild ? undefined : "button"}
      className={clsx(
        "cursor-grab active:cursor-grabbing touch-none outline-none",
        className,
      )}
      {...attributes}
      {...listeners}
      {...(props as any)}
    >
      {children}
    </Comp>
  );
});
SortableDragHandle.displayName = "SortableList.DragHandle";

export const SortableList = Object.assign(SortableListRoot, {
  Item: SortableItemWrapper,
  DragHandle: SortableDragHandle,
});
