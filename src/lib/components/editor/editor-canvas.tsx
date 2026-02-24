"use client";

import { clsx } from "clsx";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useEditor } from "./editor-context";
import { ContextMenu } from "../context-menu";
import { EditorMeasurements } from "./editor-measurements";

export interface EditorCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  paperWidth?: number;
  paperHeight?: number;
  contextMenu?: React.ReactNode;
}

export const EditorCanvas = forwardRef<HTMLDivElement, EditorCanvasProps>(
  (
    {
      className,
      paperWidth = 1200,
      paperHeight = 800,
      contextMenu,
      children,
      ...props
    },
    ref,
  ) => {
    const {
      mode,
      camera,
      setCamera,
      isSpacePressed,
      setIsSpacePressed,
      gridSize,
      showGrid,
      clearSelection,
    } = useEditor();

    const containerRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    const hasDragged = useRef(false);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === "Space" && !isSpacePressed) {
          if (document.activeElement?.tagName.match(/INPUT|TEXTAREA|SELECT/))
            return;
          e.preventDefault();
          setIsSpacePressed(true);
        }
      };
      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === "Space") setIsSpacePressed(false);
      };

      window.addEventListener("keydown", handleKeyDown, { passive: false });
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [isSpacePressed, setIsSpacePressed]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
          const zoomSensitivity = 0.005;
          const delta = -e.deltaY * zoomSensitivity;
          const newZ = Math.min(Math.max(camera.z + delta, 0.1), 5);

          const rect = container.getBoundingClientRect();
          const cursorX = e.clientX - rect.left;
          const cursorY = e.clientY - rect.top;

          const zoomRatio = newZ / camera.z;
          setCamera((prev) => ({
            x: cursorX - (cursorX - camera.x) * zoomRatio,
            y: cursorY - (cursorY - camera.y) * zoomRatio,
            z: newZ,
          }));
        } else {
          setCamera((prev) => ({
            ...prev,
            x: prev.x - e.deltaX,
            y: prev.y - e.deltaY,
          }));
        }
      };

      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }, [camera, setCamera]);

    const handlePointerDown = (e: React.PointerEvent) => {
      if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
        setIsPanning(true);
        hasDragged.current = false;
        lastPanPoint.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isPanning) return;
      hasDragged.current = true;
      const dx = e.clientX - lastPanPoint.current.x;
      const dy = e.clientY - lastPanPoint.current.y;
      setCamera((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (isPanning) {
        setIsPanning(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
      if (hasDragged.current) {
        hasDragged.current = false;
        return;
      }
      const targetId = (e.target as HTMLElement).id;
      if (
        e.target === e.currentTarget ||
        targetId === "editor-world" ||
        targetId === "editor-paper"
      ) {
        clearSelection();
      }
    };

    const deskGridStyle = showGrid
      ? {
          backgroundImage: `
            linear-gradient(to right, var(--md-sys-color-outline-variant) 1px, transparent 1px),
            linear-gradient(to bottom, var(--md-sys-color-outline-variant) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize * camera.z}px ${gridSize * camera.z}px`,
          backgroundPosition: `${camera.x}px ${camera.y}px`,
          opacity: 0.3,
        }
      : {};

    const canvasNode = (
      <div
        ref={(node) => {
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          // @ts-ignore
          containerRef.current = node;
        }}
        className={clsx(
          "relative w-full h-full overflow-hidden bg-surface-container select-none",
          className,
        )}
        style={{
          cursor: isPanning ? "grabbing" : isSpacePressed ? "grab" : "default",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleCanvasClick}
        {...props}
      >
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={deskGridStyle}
        />

        <div
          id="editor-world"
          className="absolute top-0 left-0 transform-gpu z-10 w-[100000px] h-[100000px]"
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.z})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Smart Measurement Overlay inserted here */}
          <EditorMeasurements />

          {mode === "paper" ? (
            <div
              id="editor-paper"
              className="absolute bg-surface shadow-2xl ring-1 ring-outline-variant/50 overflow-hidden"
              style={{
                width: paperWidth,
                height: paperHeight,
                top: 0,
                left: 0,
              }}
            >
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--md-sys-color-outline-variant) 1px, transparent 1px), linear-gradient(to bottom, var(--md-sys-color-outline-variant) 1px, transparent 1px)`,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                    opacity: 0.3,
                  }}
                />
              )}
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    );

    if (contextMenu) {
      return (
        <ContextMenu>
          <ContextMenu.Trigger asChild>{canvasNode}</ContextMenu.Trigger>
          {contextMenu}
        </ContextMenu>
      );
    }

    return canvasNode;
  },
);
EditorCanvas.displayName = "Editor.Canvas";
