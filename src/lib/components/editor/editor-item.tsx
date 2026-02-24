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
      registerItem,
      unregisterItem,
      setHoveredId,
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

    // Register node for Measurement tracking
    useEffect(() => {
      if (innerRef.current) registerItem(id, innerRef.current);
      return () => unregisterItem(id);
    }, [id, registerItem, unregisterItem]);

    useEffect(() => {
      setLocalRotation(rotation);
    }, [rotation]);

    const isRotated = localRotation % 360 !== 0;
    const isResizable =
      !readOnly && !locked && isSelected && !isRotated && !isSpacePressed;

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
            : (moveEvent as MouseEvent).clientX;
        const clientY =
          "touches" in moveEvent
            ? moveEvent.touches[0].clientY
            : (moveEvent as MouseEvent).clientY;

        const dx = clientX - centerX;
        const dy = clientY - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        // Snapping logic: Hold SHIFT to snap to 15deg increments
        if (moveEvent.shiftKey) {
          angle = Math.round(angle / 15) * 15;
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
          locked && "pointer-events-none",
        )}
        style={{
          transformOrigin: "center center",
          transform: `rotate(${localRotation}deg)`,
        }}
        // Register hover directly here for flawless hit detection
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {isSelected && !readOnly && !locked && (
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing z-50 group/rotate"
            onMouseDown={startRotation}
            onTouchStart={startRotation}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setLocalRotation(0);
              onRotateStop?.(0);
            }}
            data-no-drag
          >
            {/* Rotation Degree Badge */}
            {isRotating && (
              <div className="absolute -top-9 bg-primary text-on-primary px-2 py-1 rounded text-xs font-bold whitespace-nowrap shadow-md pointer-events-none">
                {Math.round(localRotation)}°
              </div>
            )}
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
        dragGrid={dragGrid || [gridSize, gridSize]}
        resizeGrid={resizeGrid || [gridSize, gridSize]}
        disableDragging={!isDraggable || isRotating}
        enableResizing={isResizable && !isRotating ? undefined : false}
        className={clsx("group/editor-item absolute", className)}
        style={{ ...style, zIndex: isSelected ? 999 : zIndex }}
        resizeHandleComponent={{
          // @ts-ignore
          topLeft: isResizable ? (
            <Handle className="-translate-x-1/2 -translate-y-1/2" />
          ) : null,
          // @ts-ignore

          topRight: isResizable ? (
            <Handle className="translate-x-1/2 -translate-y-1/2" />
          ) : null,
          // @ts-ignore
          bottomLeft: isResizable ? (
            <Handle className="-translate-x-1/2 translate-y-1/2" />
          ) : null,
          // @ts-ignore
          bottomRight: isResizable ? (
            <Handle className="translate-x-1/2 translate-y-1/2" />
          ) : null,
          // @ts-ignore

          top: isResizable ? (
            <Handle className="-translate-y-1/2 left-1/2 -translate-x-1/2" />
          ) : null,
          // @ts-ignore

          bottom: isResizable ? (
            <Handle className="translate-y-1/2 left-1/2 -translate-x-1/2" />
          ) : null,
          // @ts-ignore

          left: isResizable ? (
            <Handle className="-translate-x-1/2 top-1/2 -translate-y-1/2" />
          ) : null,
          // @ts-ignore
          right: isResizable ? (
            <Handle className="translate-x-1/2 top-1/2 -translate-y-1/2" />
          ) : null,
        }}
        onMouseDown={(e) => {
          if (isSpacePressed) return;
          if (
            (e.target as HTMLElement).closest(
              "input, textarea, button, select, [data-no-drag]",
            )
          )
            return;
          e.stopPropagation();
          if (!readOnly) {
            // @ts-ignore
            selectId(id, e.shiftKey);
            onSelect?.();
          }
        }}
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
