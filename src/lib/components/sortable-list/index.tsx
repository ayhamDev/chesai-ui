"use client";

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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { GripVertical } from "lucide-react";
import React, { createContext, useContext, useMemo, useState } from "react";

// --- VARIANTS ---

const sortableItemVariants = cva(
  "relative flex items-center outline-none transition-colors z-0 w-full",
  {
    variants: {
      variant: {
        primary:
          "bg-surface-container-low text-on-surface border border-outline-variant shadow-sm",
        secondary:
          "bg-surface-container-high text-on-surface border border-transparent shadow-sm",
        ghost:
          "bg-transparent text-on-surface border border-transparent hover:bg-surface-container-highest/30",
        surface:
          "bg-surface text-on-surface border border-outline-variant shadow-sm",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      padding: {
        none: "p-0",
        sm: "p-2 gap-2",
        md: "p-3 gap-3",
        lg: "p-4 gap-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      padding: "md",
    },
  },
);

type SortableVariant = VariantProps<typeof sortableItemVariants>["variant"];
type SortableShape = VariantProps<typeof sortableItemVariants>["shape"];
type SortablePadding = VariantProps<typeof sortableItemVariants>["padding"];

// --- CONTEXT ---

interface SortableListContextValue {
  variant?: SortableVariant;
  shape?: SortableShape;
  padding?: SortablePadding;
}

const SortableListContext = createContext<SortableListContextValue>({});
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

export interface SortableListProps<T extends { id: string | number }> {
  /** Array of items to be rendered. Each must have a unique `id` */
  items: T[];
  /** Callback fired when items are successfully reordered */
  onReorder: (items: T[]) => void;
  /** React children, typically a mapped array of `<SortableList.Item>` */
  children: React.ReactNode;
  className?: string;
  /** Default variant applied to all items */
  variant?: SortableVariant;
  /** Default shape applied to all items */
  shape?: SortableShape;
  /** Default padding applied to all items */
  padding?: SortablePadding;
  /** Vertical gap between items */
  gap?: "none" | "sm" | "md" | "lg";
}

const gapClasses = {
  none: "gap-0",
  sm: "gap-1",
  md: "gap-2",
  lg: "gap-4",
};

function SortableListInner<T extends { id: string | number }>({
  items,
  onReorder,
  children,
  className,
  variant = "primary",
  shape = "minimal",
  padding = "md",
  gap = "md",
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

  // Find the active child to render inside the DragOverlay
  const activeChild = useMemo(() => {
    if (!activeId) return null;
    const childArray = React.Children.toArray(children);
    return childArray.find(
      (child) =>
        React.isValidElement(child) &&
        (child as React.ReactElement<any>).props.id === activeId,
    );
  }, [activeId, children]);

  return (
    <SortableListContext.Provider value={{ variant, shape, padding }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={clsx("flex flex-col", gapClasses[gap], className)}>
            {children}
          </div>
        </SortableContext>

        {typeof window !== "undefined" && (
          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: "0.4" } },
              }),
            }}
          >
            {activeChild ? (
              <SortableOverlayContext.Provider value={true}>
                {activeChild}
              </SortableOverlayContext.Provider>
            ) : null}
          </DragOverlay>
        )}
      </DndContext>
    </SortableListContext.Provider>
  );
}

// Cast needed to keep generic signature with Object.assign
export const SortableListRoot = SortableListInner as <
  T extends { id: string | number },
>(
  props: SortableListProps<T>,
) => React.ReactElement;

// --- ITEM COMPONENTS ---

export interface SortableItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "id"
> {
  /** Must match the item's unique id in the data array */
  id: string | number;
  /** Overrides the list's default variant */
  variant?: SortableVariant;
  /** Overrides the list's default shape */
  shape?: SortableShape;
  /** Overrides the list's default padding */
  padding?: SortablePadding;
  /** Disables dragging for this specific item */
  disabled?: boolean;
}

const SortableItemUI = React.forwardRef<
  HTMLDivElement,
  SortableItemProps & {
    isDragging?: boolean;
    isOverlay?: boolean;
    attributes?: any;
    listeners?: any;
  }
>(
  (
    {
      id,
      children,
      className,
      variant,
      shape,
      padding,
      isDragging,
      isOverlay,
      attributes,
      listeners,
      style,
      disabled,
      ...props
    },
    ref,
  ) => {
    const context = useContext(SortableListContext);
    const finalVariant = variant || context.variant;
    const finalShape = shape || context.shape;
    const finalPadding = padding || context.padding;

    return (
      <SortableItemContext.Provider
        value={{
          attributes: attributes || {},
          listeners: listeners || {},
          isDragging: !!isDragging,
        }}
      >
        <div
          ref={ref}
          className={clsx(
            sortableItemVariants({
              variant: finalVariant,
              shape: finalShape,
              padding: finalPadding,
            }),
            isDragging &&
              !isOverlay &&
              "opacity-40 bg-surface-container-highest",
            isOverlay &&
              "shadow-2xl ring-2 ring-primary/50 scale-[1.02] cursor-grabbing",
            disabled && "opacity-50 pointer-events-none",
            className,
          )}
          style={style}
          {...props}
        >
          {children}
        </div>
      </SortableItemContext.Provider>
    );
  },
);
SortableItemUI.displayName = "SortableItemUI";

const SortableItemWithDnd = (props: SortableItemProps) => {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
  } = useSortable({ id: props.id, disabled: props.disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...props.style,
  };

  return (
    <SortableItemUI
      ref={setNodeRef}
      isDragging={isDragging}
      isOverlay={false}
      style={style}
      attributes={attributes}
      listeners={listeners}
      {...props}
    />
  );
};

const SortableItemWrapper = (props: SortableItemProps) => {
  const isOverlay = useContext(SortableOverlayContext);
  // If rendering inside the DragOverlay, skip Dnd hooks to avoid identical ID collisions
  if (isOverlay) {
    return <SortableItemUI isDragging={true} isOverlay={true} {...props} />;
  }
  return <SortableItemWithDnd {...props} />;
};

// --- DRAG HANDLE COMPONENT ---

export interface SortableDragHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

const SortableDragHandle = React.forwardRef<
  HTMLButtonElement,
  SortableDragHandleProps
>(({ className, children, icon, ...props }, ref) => {
  const { attributes, listeners } = useSortableItem();

  return (
    <button
      ref={ref}
      type="button"
      className={clsx(
        "flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-on-surface/10 outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      {...attributes}
      {...listeners}
      {...props}
    >
      {icon || children || <GripVertical className="h-4 w-4" />}
    </button>
  );
});
SortableDragHandle.displayName = "SortableList.DragHandle";

export const SortableList = Object.assign(SortableListRoot, {
  Item: SortableItemWrapper,
  DragHandle: SortableDragHandle,
});
