// src/lib/components/editor/editor-item.tsx
"use client";

import { clsx } from "clsx";
import { RotateCw } from "lucide-react";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Rnd, type Props as RndProps } from "react-rnd";
import { useEditor } from "./editor-context";
import { ContextMenu } from "../context-menu";

export interface EditorItemProps extends Partial<RndProps> {
  id: string;
  children: React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
  locked?: boolean;
  zIndex?: number;
  rotation?: number;
  onRotateStop?: (degrees: number) => void;
  contextMenu?: React.ReactNode;
}

const Handle = ({ className }: { className?: string }) => (
  <div
    className={clsx(
      "w-2.5 h-2.5 bg-surface border border-primary rounded-sm shadow-sm transition-transform hover:scale-125 hover:bg-primary z-50",
      className,
    )}
  />
);

export const EditorItem = forwardRef<Rnd, EditorItemProps>(
  (
    {
      id,
      children,
      className,
      isSelected: propSelected,
      onSelect,
      locked = false,
      zIndex = 1,
      rotation = 0,
      onRotateStop,
      bounds: propBounds,
      dragGrid,
      resizeGrid,
      style,
      contextMenu,
      ...rndProps
    },
    ref,
  ) => {
    const {
      mode,
      camera,
      isSpacePressed,
      readOnly,
      gridSize,
      selectedIds,
      selectId,
    } = useEditor();

    const bounds =
      propBounds !== undefined
        ? propBounds
        : mode === "paper"
          ? "parent"
          : undefined;
    const isSelected = propSelected ?? selectedIds.has(id);
    const isDraggable = !readOnly && !locked && !isSpacePressed;

    const innerRef = useRef<HTMLDivElement>(null);
    const [localRotation, setLocalRotation] = useState(rotation);
    const [isRotating, setIsRotating] = useState(false);

    useEffect(() => {
      setLocalRotation(rotation);
    }, [rotation]);

    const isRotated = localRotation % 360 !== 0;
    const isResizable =
      !readOnly && !locked && isSelected && !isRotated && !isSpacePressed;

    const effectiveDragGrid = dragGrid || [gridSize, gridSize];
    const effectiveResizeGrid = resizeGrid || [gridSize, gridSize];

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      if (isSpacePressed) return;
      if (
        (e.target as HTMLElement).closest(
          "input, textarea, button, select, [data-no-drag]",
        )
      ) {
        return;
      }
      e.stopPropagation();
      if (!readOnly) {
        // @ts-ignore
        selectId(id, e.shiftKey);
        onSelect?.();
      }
    };

    const startRotation = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!innerRef.current || locked || readOnly) return;

      setIsRotating(true);
      const rect = innerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let latestAngle = localRotation;

      const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        const clientX =
          "touches" in moveEvent
            ? moveEvent.touches[0].clientX
            : moveEvent.clientX;
        const clientY =
          "touches" in moveEvent
            ? moveEvent.touches[0].clientY
            : moveEvent.clientY;

        const dx = clientX - centerX;
        const dy = clientY - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        if ("shiftKey" in moveEvent && moveEvent.shiftKey) {
          angle = Math.round(angle / 45) * 45;
        }

        latestAngle = angle;
        setLocalRotation(angle);
      };

      const onUp = () => {
        setIsRotating(false);
        onRotateStop?.(latestAngle);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchend", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchend", onUp);
    };

    const innerContent = (
      <div
        ref={innerRef}
        className={clsx(
          "w-full h-full relative transition-[box-shadow,border] duration-150",
          isSelected
            ? "ring-2 ring-primary ring-offset-0"
            : "hover:ring-1 hover:ring-primary/40",
          // FIXED: Removed opacity-80 and grayscale so locked items look completely normal
          locked && "pointer-events-none",
        )}
        style={{
          transformOrigin: "center center",
          transform: `rotate(${localRotation}deg)`,
        }}
      >
        {isSelected && !readOnly && !locked && (
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-50"
            onMouseDown={startRotation}
            onTouchStart={startRotation}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setLocalRotation(0);
              onRotateStop?.(0);
            }}
            data-no-drag
          >
            <div className="w-6 h-6 bg-surface border border-primary rounded-full shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors">
              <RotateCw size={12} />
            </div>
            <div className="w-[1px] h-4 bg-primary" />
          </div>
        )}

        {!readOnly && !locked && (
          <div className="absolute inset-0 cursor-move z-0" />
        )}

        <div className="relative z-10 w-full h-full pointer-events-auto">
          {children}
        </div>
      </div>
    );

    return (
      <Rnd
        ref={ref}
        scale={camera.z}
        bounds={bounds}
        dragGrid={effectiveDragGrid}
        resizeGrid={effectiveResizeGrid}
        disableDragging={!isDraggable || isRotating}
        enableResizing={isResizable && !isRotating ? undefined : false}
        className={clsx("group/editor-item absolute", className)}
        style={{ ...style, zIndex }}
        resizeHandleComponent={{
          topLeft: isResizable ? (
            <Handle className="-translate-x-1/2 -translate-y-1/2" />
          ) : null,
          topRight: isResizable ? (
            <Handle className="translate-x-1/2 -translate-y-1/2" />
          ) : null,
          bottomLeft: isResizable ? (
            <Handle className="-translate-x-1/2 translate-y-1/2" />
          ) : null,
          bottomRight: isResizable ? (
            <Handle className="translate-x-1/2 translate-y-1/2" />
          ) : null,
          top: isResizable ? (
            <Handle className="-translate-y-1/2 left-1/2 -translate-x-1/2" />
          ) : null,
          bottom: isResizable ? (
            <Handle className="translate-y-1/2 left-1/2 -translate-x-1/2" />
          ) : null,
          left: isResizable ? (
            <Handle className="-translate-x-1/2 top-1/2 -translate-y-1/2" />
          ) : null,
          right: isResizable ? (
            <Handle className="translate-x-1/2 top-1/2 -translate-y-1/2" />
          ) : null,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        {...rndProps}
      >
        {contextMenu ? (
          <ContextMenu>
            <ContextMenu.Trigger asChild>{innerContent}</ContextMenu.Trigger>
            {contextMenu}
          </ContextMenu>
        ) : (
          innerContent
        )}
      </Rnd>
    );
  },
);

EditorItem.displayName = "Editor.Item";
