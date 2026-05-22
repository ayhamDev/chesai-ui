// src/lib/components/tree-view/index.tsx
"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";

// --- VARIANTS ---

const treeItemVariants = cva(
  "relative z-0 flex items-center justify-start text-left w-full cursor-pointer select-none transition-colors duration-200 overflow-visible group outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset " +
    "after:absolute after:inset-0 after:z-[-1] after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out hover:after:opacity-100 hover:after:scale-100",
  {
    variants: {
      variant: {
        primary:
          "data-[selected=true]:bg-primary-container data-[selected=true]:text-on-primary-container text-on-surface after:bg-primary/10",
        secondary:
          "data-[selected=true]:bg-secondary-container data-[selected=true]:text-on-secondary-container text-on-surface after:bg-secondary-container/50",
        ghost:
          "data-[selected=true]:bg-surface-container-highest data-[selected=true]:text-on-surface text-on-surface after:bg-surface-container-highest/50",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-md",
        sharp: "rounded-none",
      },
      size: {
        sm: "min-h-7 py-1 text-xs",
        md: "min-h-8 py-1.5 text-sm",
        lg: "min-h-10 py-2 text-base",
        xl: "min-h-12 py-2.5 text-base",
      },
    },
    defaultVariants: {
      variant: "secondary",
      shape: "minimal",
      size: "md",
    },
  },
);

// --- CONTEXT ---

interface TreeContextValue<T> {
  getId: (item: T) => string;
  getChildren: (item: T) => T[] | undefined | null;
  canHaveChildren?: (item: T) => boolean;
  renderItem: (
    item: T,
    options: {
      isExpanded: boolean;
      isSelected: boolean;
      depth: number;
      isDragging: boolean;
    },
  ) => React.ReactNode;
  selectedId?: string | null;
  onSelect?: (id: string, item: T) => void;
  isExpanded: (id: string) => boolean;
  toggleExpanded: (id: string) => void;
  variant?: "primary" | "secondary" | "ghost";
  shape?: "full" | "minimal" | "sharp";
  size?: "sm" | "md" | "lg" | "xl";
  indentSize: number;
  enableDragAndDrop: boolean;
  activeId: string | null;
  currentDropTarget: string | null;
}

const TreeContext = React.createContext<TreeContextValue<unknown> | null>(null);

function useTreeContext<T>() {
  const context = React.useContext(TreeContext);
  if (!context) {
    throw new Error("Tree components must be rendered within a TreeView");
  }
  return context as unknown as TreeContextValue<T>;
}

// --- FLATTENING LOGIC ---

export interface FlattenedNode<T> {
  id: string;
  item: T;
  parentId: string | null;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
}

function flattenTree<T>(
  items: T[],
  getId: (item: T) => string,
  getChildren: (item: T) => T[] | undefined | null,
  expandedIds: Set<string>,
  parentId: string | null = null,
  depth = 0,
): FlattenedNode<T>[] {
  return items.reduce<FlattenedNode<T>[]>((acc, item) => {
    const id = getId(item);
    const children = getChildren(item) || [];
    const isExpanded = expandedIds.has(id);
    const hasChildren = children.length > 0;

    acc.push({ id, item, parentId, depth, isExpanded, hasChildren });

    if (isExpanded && hasChildren) {
      acc.push(
        ...flattenTree(
          children,
          getId,
          getChildren,
          expandedIds,
          id,
          depth + 1,
        ),
      );
    }
    return acc;
  }, []);
}

function getDescendantIds<T>(items: FlattenedNode<T>[], id: string) {
  const descendants = new Set<string>();
  let isDescendant = false;
  let targetDepth = -1;

  for (const item of items) {
    if (item.id === id) {
      isDescendant = true;
      targetDepth = item.depth;
      continue;
    }
    if (isDescendant && item.depth > targetDepth) {
      descendants.add(item.id);
    } else if (isDescendant && item.depth <= targetDepth) {
      break;
    }
  }
  return descendants;
}

function findNodeInTree<T>(
  nodes: T[],
  targetId: string,
  getId: (item: T) => string,
  getChildren: (item: T) => T[] | undefined | null,
  parentId: string | null = null,
): { item: T; parentId: string | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (getId(node) === targetId) {
      return { item: node, parentId, index: i };
    }
    const children = getChildren(node);
    if (children) {
      const found = findNodeInTree(
        children,
        targetId,
        getId,
        getChildren,
        getId(node),
      );
      if (found) return found;
    }
  }
  return null;
}

function getProjection<T>(
  items: FlattenedNode<T>[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentSize: number,
) {
  const overItemIndex = items.findIndex((x) => x.id === overId);
  const activeItemIndex = items.findIndex((x) => x.id === activeId);
  const activeItem = items[activeItemIndex];

  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];

  const dragDepth = Math.round(dragOffset / indentSize);
  const projectedDepth = activeItem.depth + dragDepth;

  const maxDepth = previousItem ? previousItem.depth + 1 : 0;
  const minDepth = nextItem ? nextItem.depth : 0;

  let depth = projectedDepth;
  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  let parentId: string | null = null;
  if (previousItem) {
    if (depth === previousItem.depth + 1) {
      parentId = previousItem.id;
    } else {
      let current: FlattenedNode<T> | undefined = previousItem;
      while (current && current.depth >= depth) {
        parentId = current.parentId;
        current = items.find((i) => i.id === current?.parentId);
      }
    }
  }

  return { depth, maxDepth, minDepth, parentId };
}

// --- DROPPABLE ZONE COMPONENT ---
const DropZone = ({
  id,
  data,
  className,
}: {
  id: string;
  data: any;
  className?: string;
}) => {
  const { setNodeRef } = useDroppable({ id, data });
  return (
    <div
      ref={setNodeRef}
      className={clsx("absolute z-10 pointer-events-none", className)}
    />
  );
};

// --- NODE COMPONENT ---

interface TreeNodeProps<T> {
  item: T;
  depth: number;
  isDraggingAncestor?: boolean;
}

function TreeNode<T>({ item, depth, isDraggingAncestor }: TreeNodeProps<T>) {
  const context = useTreeContext<T>();
  const id = context.getId(item);
  const children = context.getChildren(item);
  const hasChildren = children && children.length > 0;
  const selected = context.selectedId === id;
  const expanded = context.isExpanded(id);
  const canHaveChildren = context.canHaveChildren
    ? context.canHaveChildren(item)
    : true;

  const isDragging = context.activeId === id;
  const ancestorDragging = isDraggingAncestor || isDragging;

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
  } = useDraggable({
    id,
    data: item as Record<string, unknown>,
  });

  const isDropBefore = context.currentDropTarget === `${id}::before`;
  const isDropInside = context.currentDropTarget === `${id}::inside`;
  const isDropAfter = context.currentDropTarget === `${id}::after`;

  const showDropZones =
    context.enableDragAndDrop && context.activeId !== null && !ancestorDragging;

  const chevronOffset =
    context.size === "sm"
      ? 10
      : context.size === "lg" || context.size === "xl"
        ? 14
        : 12;
  const basePadding = 4; // 0.25rem = 4px

  return (
    <div className="flex flex-col w-full justify-start text-left relative">
      <button
        ref={context.enableDragAndDrop ? setDraggableRef : undefined}
        type="button"
        className={clsx(
          treeItemVariants({
            variant: context.variant ?? undefined,
            shape: context.shape ?? undefined,
            size: context.size ?? undefined,
          }),
          "mb-[2px] pr-2 relative",
          isDropInside && "ring-2 ring-primary bg-primary/10",
          isDragging && "opacity-40",
        )}
        style={{
          paddingLeft: `calc(0.25rem + ${depth * context.indentSize}px)`,
          touchAction: "none",
        }}
        data-selected={selected}
        onClick={(e) => {
          e.stopPropagation();
          context.onSelect?.(id, item);
          if (hasChildren) {
            context.toggleExpanded(id);
          }
        }}
        {...(context.enableDragAndDrop ? { ...attributes, ...listeners } : {})}
      >
        {/* VERTICAL DEPTH LINES */}
        {Array.from({ length: depth }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-px bg-outline-variant/40 pointer-events-none z-0"
            style={{
              height: "calc(100% + 2px)",
              left: `${basePadding + i * context.indentSize + chevronOffset}px`,
            }}
          />
        ))}

        {/* DROPPABLE ZONES */}
        {showDropZones && (
          <>
            <DropZone
              id={`${id}::before`}
              data={{ id, type: "before" }}
              className={clsx(
                "left-0 w-full",
                canHaveChildren ? "top-0 h-1/4" : "top-0 h-1/2",
              )}
            />
            {canHaveChildren && (
              <DropZone
                id={`${id}::inside`}
                data={{ id, type: "inside" }}
                className="top-1/4 left-0 w-full h-2/4"
              />
            )}
            <DropZone
              id={`${id}::after`}
              data={{ id, type: "after" }}
              className={clsx(
                "left-0 w-full",
                canHaveChildren ? "bottom-0 h-1/4" : "bottom-0 h-1/2",
              )}
            />
          </>
        )}

        {/* VISUAL DROP INDICATORS (LINES) */}
        {isDropBefore && (
          <div
            className="absolute top-0 right-0 h-0.5 bg-primary z-20 rounded-full"
            style={{
              left: `${basePadding + depth * context.indentSize + chevronOffset}px`,
            }}
          />
        )}
        {isDropAfter && (
          <div
            className="absolute bottom-0 right-0 h-0.5 bg-primary z-20 rounded-full"
            style={{
              left: `${basePadding + depth * context.indentSize + chevronOffset}px`,
            }}
          />
        )}

        {/* Expand/Collapse Chevron */}
        <div
          role="button"
          tabIndex={0}
          className={clsx(
            "flex items-center justify-center shrink-0 opacity-50 hover:opacity-100 transition-opacity z-10",
            context.size === "sm"
              ? "w-5 h-5"
              : context.size === "lg" || context.size === "xl"
                ? "w-7 h-7"
                : "w-6 h-6",
          )}
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              context.toggleExpanded(id);
            }
          }}
          onKeyDown={(e) => {
            if (hasChildren && (e.key === "Enter" || e.key === " ")) {
              e.stopPropagation();
              e.preventDefault();
              context.toggleExpanded(id);
            }
          }}
        >
          {hasChildren ? (
            <ChevronRight
              className={clsx(
                "transition-transform duration-200 ease-in-out",
                expanded && "rotate-90",
                context.size === "sm"
                  ? "w-3 h-3"
                  : context.size === "lg" || context.size === "xl"
                    ? "w-5 h-5"
                    : "w-4 h-4",
              )}
            />
          ) : (
            <span className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-start text-left h-full pointer-events-none relative z-10">
          {context.renderItem(item, {
            isExpanded: expanded,
            isSelected: selected,
            depth,
            isDragging,
          })}
        </div>
      </button>

      {/* Recursive Children (Animated) */}
      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col w-full overflow-hidden"
          >
            {children.map((child) => (
              <TreeNode
                key={context.getId(child)}
                item={child}
                depth={depth + 1}
                isDraggingAncestor={ancestorDragging}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- ROOT COMPONENT ---

export interface TreeViewProps<T>
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">,
    VariantProps<typeof treeItemVariants> {
  data: T[];
  getId: (item: T) => string;
  getChildren: (item: T) => T[] | undefined | null;
  canHaveChildren?: (item: T) => boolean;
  renderItem: (
    item: T,
    options: {
      isExpanded: boolean;
      isSelected: boolean;
      depth: number;
      isDragging: boolean;
    },
  ) => React.ReactNode;
  selectedId?: string | null;
  onSelect?: (id: string, item: T) => void;
  expandedIds?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  indentSize?: number;

  enableDragAndDrop?: boolean;
  onMoveNode?: (args: {
    activeId: string;
    parentId: string | null;
    index: number;
  }) => void;
}

export function TreeView<T>({
  data,
  getId,
  getChildren,
  canHaveChildren,
  renderItem,
  selectedId,
  onSelect,
  expandedIds: controlledExpandedIds,
  onExpandedChange,
  variant = "secondary",
  shape = "minimal",
  size = "md",
  indentSize = 16,
  enableDragAndDrop = false,
  onMoveNode,
  className,
  ...props
}: TreeViewProps<T>) {
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
    new Set(),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<T | null>(null);
  const [currentDropTarget, setCurrentDropTarget] = useState<string | null>(
    null,
  );
  const [offsetLeft, setOffsetLeft] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const isControlled = controlledExpandedIds !== undefined;
  const activeExpandedSet = isControlled
    ? new Set(controlledExpandedIds)
    : internalExpandedIds;

  const isExpanded = useCallback(
    (id: string) => activeExpandedSet.has(id),
    [activeExpandedSet],
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      const nextSet = new Set(activeExpandedSet);
      if (nextSet.has(id)) {
        nextSet.delete(id);
      } else {
        nextSet.add(id);
      }
      if (!isControlled) setInternalExpandedIds(nextSet);
      onExpandedChange?.(Array.from(nextSet));
    },
    [activeExpandedSet, isControlled, onExpandedChange],
  );

  const flattened = useMemo(
    () => flattenTree(data, getId, getChildren, activeExpandedSet),
    [data, getId, getChildren, activeExpandedSet],
  );

  const activeDescendants = useMemo(() => {
    if (!activeId) return new Set<string>();
    return getDescendantIds(flattened, activeId);
  }, [activeId, flattened]);

  const renderedItems = useMemo(() => {
    return flattened.filter((item) => !activeDescendants.has(item.id));
  }, [flattened, activeDescendants]);

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveItem(event.active.data.current as T);
    document.body.style.cursor = "grabbing";
  };

  const handleDragOver = (event: DragOverEvent) => {
    setCurrentDropTarget((event.over?.id as string) || null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    setOffsetLeft(event.delta.x);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    document.body.style.cursor = "";
    setActiveId(null);
    setCurrentDropTarget(null);

    const { active, over } = event;
    if (!over) return;

    const targetData = over.data.current as
      | { id: string; type: "before" | "after" | "inside" }
      | undefined;
    if (!targetData) return;

    const { id: targetId, type } = targetData;
    if (active.id === targetId) return;

    const targetInfo = findNodeInTree(data, targetId, getId, getChildren);
    if (!targetInfo) return;

    let newParentId = targetInfo.parentId;
    let newIndex = targetInfo.index;

    if (type === "inside") {
      newParentId = targetId;
      newIndex = 0;
      if (!isExpanded(targetId)) toggleExpanded(targetId);
    } else if (type === "after") {
      newIndex = targetInfo.index + 1;
    }

    onMoveNode?.({
      activeId: active.id as string,
      parentId: newParentId,
      index: newIndex,
    });
  };

  const handleDragCancel = () => {
    document.body.style.cursor = "";
    setActiveId(null);
    setCurrentDropTarget(null);
  };

  const contextValue: TreeContextValue<T> = {
    getId,
    getChildren,
    canHaveChildren,
    renderItem,
    selectedId,
    onSelect,
    isExpanded,
    toggleExpanded,
    variant: variant ?? undefined,
    shape: shape ?? undefined,
    size: size ?? undefined,
    indentSize,
    enableDragAndDrop,
    activeId,
    currentDropTarget,
  };

  const content = enableDragAndDrop ? (
    <SortableContext
      items={renderedItems.map((i) => i.id)}
      strategy={verticalListSortingStrategy}
    >
      {data.map((item) => (
        <TreeNode key={getId(item)} item={item} depth={0} />
      ))}
    </SortableContext>
  ) : (
    data.map((item) => <TreeNode key={getId(item)} item={item} depth={0} />)
  );

  return (
    <TreeContext.Provider value={contextValue as TreeContextValue<unknown>}>
      <div
        className={clsx("flex flex-col w-full text-left", className)}
        {...props}
      >
        {enableDragAndDrop ? (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {content}
            <DragOverlay
              dropAnimation={defaultDropAnimationSideEffects({
                sideEffects: defaultDropAnimationSideEffects({
                  styles: { active: { opacity: "0.4" } },
                }),
              })}
            >
              {activeId && activeItem ? (
                <div className="opacity-95 shadow-xl bg-surface-container-highest rounded-md ring-1 ring-primary !w-max min-w-[200px] overflow-hidden pointer-events-none">
                  <div
                    className={clsx(
                      treeItemVariants({
                        variant: variant ?? undefined,
                        shape: shape ?? undefined,
                        size: size ?? undefined,
                      }),
                      "pr-4 pl-2 justify-start text-left m-0 border-none",
                    )}
                  >
                    <div
                      className={clsx(
                        "flex items-center justify-center shrink-0 opacity-50",
                        size === "sm"
                          ? "w-5 h-5"
                          : size === "lg" || size === "xl"
                            ? "w-7 h-7"
                            : "w-6 h-6",
                      )}
                    >
                      <ChevronRight
                        className={clsx(
                          "transition-transform duration-200 ease-in-out",
                          size === "sm"
                            ? "w-3 h-3"
                            : size === "lg" || size === "xl"
                              ? "w-5 h-5"
                              : "w-4 h-4",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-start text-left h-full">
                      {renderItem(activeItem, {
                        isExpanded: false,
                        isSelected: true,
                        depth: 0,
                        isDragging: true,
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          content
        )}
      </div>
    </TreeContext.Provider>
  );
}
