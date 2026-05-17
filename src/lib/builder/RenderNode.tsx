import React, { useEffect, useRef, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import { useBuilderStore } from "./store";
import { COMPONENT_REGISTRY } from "./registry";

// --- INLINE TEXT EDITOR HELPER ---
const InlineTextEditor = ({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (val: string) => void;
  onCancel: () => void;
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, []);

  const handleBlur = () => {
    if (ref.current) onSave(ref.current.innerText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") onCancel();
  };

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="outline-none min-w-[10px] inline-block caret-primary bg-primary/10 rounded-sm px-1 -mx-1"
    >
      {initialValue}
    </span>
  );
};

// --- MAIN RENDER NODE ---

interface RenderNodeProps {
  id: string;
}

export const RenderNode: React.FC<RenderNodeProps> = ({ id }) => {
  const node = useBuilderStore(
    (state) => state.pages[state.activePageId]?.nodes[id],
  );

  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const selectNode = useBuilderStore((state) => state.selectNode);

  const editingNodeId = useBuilderStore((state) => state.editingNodeId);
  const setEditingNode = useBuilderStore((state) => state.setEditingNode);
  const updateNodeProp = useBuilderStore((state) => state.updateNodeProp);

  const isSelected = selectedNodeId === id;
  const isEditing = editingNodeId === id;
  const canEditInline = ["Typography", "Button"].includes(node?.type || "");

  const domRef = useRef<HTMLDivElement>(null);

  // --- RESIZE STATE LOGIC ---
  const [localSize, setLocalSize] = useState<{
    width?: number;
    height?: number;
  } | null>(null);
  const isResizing = localSize !== null;

  const handleResizeStart = (
    e: React.MouseEvent,
    direction: "right" | "bottom" | "both",
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (!domRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startRect = domRef.current.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      setLocalSize({
        width:
          direction === "right" || direction === "both"
            ? Math.max(50, startRect.width + deltaX)
            : undefined,
        height:
          direction === "bottom" || direction === "both"
            ? Math.max(20, startRect.height + deltaY)
            : undefined,
      });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Calculate final sizes one last time before saving
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;

      const finalWidth =
        direction === "right" || direction === "both"
          ? Math.max(50, startRect.width + deltaX)
          : undefined;
      const finalHeight =
        direction === "bottom" || direction === "both"
          ? Math.max(20, startRect.height + deltaY)
          : undefined;

      // Update Zustand store
      const currentStyles = node?.props.style || {};
      updateNodeProp(id, "style", {
        ...currentStyles,
        ...(finalWidth !== undefined && { width: `${finalWidth}px` }),
        ...(finalHeight !== undefined && { height: `${finalHeight}px` }),
      });

      // Clear local state
      setLocalSize(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // --- DND-KIT HOOKS ---
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: id,
    disabled: !node?.isCanvas,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: id,
    // Disable dragging if we are inline editing OR actively resizing
    disabled: id === "ROOT" || isEditing || isResizing,
    data: {
      type: node?.type,
      isNew: false,
    },
  });

  if (!node) return null;

  const Component = COMPONENT_REGISTRY[node.type];
  if (!Component) return null;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canEditInline) setEditingNode(id);
  };

  const childrenNodes = node.children.map((childId) => (
    <RenderNode key={childId} id={childId} />
  ));

  let renderedChildren: React.ReactNode =
    childrenNodes.length > 0 ? childrenNodes : node.props.children;

  if (isEditing && canEditInline) {
    renderedChildren = (
      <InlineTextEditor
        initialValue={
          typeof node.props.children === "string" ? node.props.children : ""
        }
        onSave={(val) => {
          updateNodeProp(id, "children", val);
          setEditingNode(null);
        }}
        onCancel={() => setEditingNode(null)}
      />
    );
  }

  // Combine Dnd refs and local domRef
  const setCombinedRefs = (element: HTMLDivElement | null) => {
    setDroppableRef(element);
    setDraggableRef(element);
    // @ts-ignore
    domRef.current = element;
  };

  // Merge store styles with live-resizing local state
  const computedStyle: React.CSSProperties = {
    ...node.props.style,
    transform: CSS.Translate.toString(transform),
    pointerEvents: isDragging ? "none" : "auto",
    ...(localSize?.width !== undefined && { width: `${localSize.width}px` }),
    ...(localSize?.height !== undefined && { height: `${localSize.height}px` }),
  };

  const elementProps = {
    ...node.props,
    style: computedStyle,
    className: clsx(
      node.props.className,
      // Focus ring is applied to the component itself
      isSelected &&
        !isEditing &&
        "ring-2 ring-primary ring-offset-1 relative z-40",
      isOver && "ring-2 ring-green-500 bg-green-500/10",
    ),
  };

  const isSelfClosing = ["Image", "input", "br", "hr"].includes(node.type);

  return (
    <div
      ref={setCombinedRefs}
      onClick={handleSelect}
      onDoubleClick={handleDoubleClick}
      {...listeners}
      {...attributes}
      className={clsx(
        "relative transition-opacity w-fit h-fit", // w-fit / h-fit allows it to wrap its content
        node.type === "Container" && "w-full", // Default containers to w-full
        isDragging && "opacity-40",
      )}
      style={{ display: node.type === "Container" ? "flex" : "inline-block" }}
    >
      {isSelfClosing ? (
        <Component {...elementProps} />
      ) : (
        <Component {...elementProps}>
          {renderedChildren ? (
            renderedChildren
          ) : node.isCanvas ? (
            <div className="p-6 border-2 border-dashed border-outline-variant/30 text-center opacity-50 select-none text-xs flex-1 pointer-events-none">
              Drag elements here
            </div>
          ) : null}
        </Component>
      )}

      {/* --- RESIZE HANDLES (Rendered ONLY if selected and not root) --- */}
      {isSelected && !isEditing && id !== "ROOT" && (
        <>
          {/* Right Handle */}
          <div
            className="absolute top-1/2 -right-1.5 w-3 h-3 -translate-y-1/2 bg-white border-2 border-primary rounded-sm cursor-ew-resize z-50 hover:scale-125 transition-transform"
            onPointerDown={(e) => handleResizeStart(e, "right")}
          />
          {/* Bottom Handle */}
          <div
            className="absolute left-1/2 -bottom-1.5 w-3 h-3 -translate-x-1/2 bg-white border-2 border-primary rounded-sm cursor-ns-resize z-50 hover:scale-125 transition-transform"
            onPointerDown={(e) => handleResizeStart(e, "bottom")}
          />
          {/* Bottom-Right Handle */}
          <div
            className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-white border-2 border-primary rounded-sm cursor-nwse-resize z-50 hover:scale-125 transition-transform"
            onPointerDown={(e) => handleResizeStart(e, "both")}
          />
        </>
      )}
    </div>
  );
};
