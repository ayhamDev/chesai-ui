// src/lib/components/website-studio/canvas/CanvasOverlay.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import {
  Type,
  Plus, // <-- Swapped confusing arrows for a clean universal Plus
  RefreshCw,
  Copy,
  Trash2,
} from "lucide-react";
import { useStudioStore } from "../store";
import { useBuilderContext } from "../BuilderContext";
import { isRectEqual, findNodeById } from "./artboard-utils";
import type { InteractionState, DropTarget } from "./artboard-types";

export const CanvasOverlay = ({
  iframeWindow,
  interaction,
  dropTarget,
  inlineEditElement,
}: {
  iframeWindow: Window;
  interaction: InteractionState;
  dropTarget: DropTarget | null;
  inlineEditElement: HTMLElement | null;
}) => {
  const { selectedNodeIds, hoveredNodeId, website, activePageId } =
    useStudioStore();
  const { components } = useBuilderContext();

  const [selectedRects, setSelectedRects] = useState<Record<string, DOMRect>>(
    {},
  );
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [editRect, setEditRect] = useState<DOMRect | null>(null);

  const activePage = website?.pages.find((p) => p.id === activePageId);

  const updateRects = useCallback(() => {
    if (!iframeWindow) return;
    const doc = iframeWindow.document;

    // 1. Selected Rects
    const newSelectedRects: Record<string, DOMRect> = {};
    for (const id of selectedNodeIds) {
      const el = doc.querySelector(`[data-studio-node-id="${id}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        newSelectedRects[id] = {
          top: rect.top + iframeWindow.scrollY,
          left: rect.left + iframeWindow.scrollX,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right,
          x: rect.x,
          y: rect.y,
          toJSON: rect.toJSON,
        } as DOMRect;
      }
    }
    setSelectedRects((prev) => {
      const prevKeys = Object.keys(prev);
      const newKeys = Object.keys(newSelectedRects);
      if (prevKeys.length !== newKeys.length) return newSelectedRects;
      for (const key of newKeys) {
        if (!isRectEqual(prev[key], newSelectedRects[key]))
          return newSelectedRects;
      }
      return prev;
    });

    // 2. Hovered Rect
    let newHoveredRect: DOMRect | null = null;
    if (hoveredNodeId && !selectedNodeIds.includes(hoveredNodeId)) {
      const el = doc.querySelector(`[data-studio-node-id="${hoveredNodeId}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        newHoveredRect = {
          top: rect.top + iframeWindow.scrollY,
          left: rect.left + iframeWindow.scrollX,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right,
          x: rect.x,
          y: rect.y,
          toJSON: rect.toJSON,
        } as DOMRect;
      }
    }
    setHoveredRect((prev) =>
      isRectEqual(prev, newHoveredRect) ? prev : newHoveredRect,
    );

    // 3. Edit Rect
    let newEditRect: DOMRect | null = null;
    if (inlineEditElement) {
      const range = doc.createRange();
      range.selectNodeContents(inlineEditElement);
      let rect = range.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        rect = inlineEditElement.getBoundingClientRect();
      }
      newEditRect = {
        top: rect.top + iframeWindow.scrollY,
        left: rect.left + iframeWindow.scrollX,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
        x: rect.x,
        y: rect.y,
        toJSON: rect.toJSON,
      } as DOMRect;
    }
    setEditRect((prev) =>
      isRectEqual(prev, newEditRect) ? prev : newEditRect,
    );
  }, [selectedNodeIds, hoveredNodeId, iframeWindow, inlineEditElement]);

  useEffect(() => {
    let rafId: number;
    const loop = () => {
      updateRects();
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafId);
  }, [updateRects]);

  const isDraggingNodes = interaction.type === "drag";
  const isMarquee = interaction.type === "marquee";
  const isEditCloseToBottom = editRect
    ? editRect.bottom > iframeWindow.innerHeight - 50
    : false;

  return (
    <div className="absolute inset-0 pointer-events-none z-[99999]">
      {/* Hover */}
      {hoveredRect && !isDraggingNodes && !inlineEditElement && (
        <div
          className="absolute border-2 border-primary bg-primary/10 transition-none"
          style={{
            top: hoveredRect.top,
            left: hoveredRect.left - 11,
            width: hoveredRect.width,
            height: hoveredRect.height,
          }}
        />
      )}

      {/* Select + Floating Action Toolbar */}
      {!isDraggingNodes &&
        !inlineEditElement &&
        Object.entries(selectedRects).map(([id, rect]) => {
          const nodeData = activePage
            ? findNodeById(activePage.content, id)
            : null;
          const acceptsChildren = nodeData
            ? (components[nodeData.type]?.acceptsChildren ?? false)
            : false;

          return (
            <div
              key={id}
              className="absolute border-2 border-primary transition-none"
              style={{
                top: rect.top,
                left: rect.left - 11,
                width: rect.width,
                height: rect.height,
              }}
            >
              <div
                className={clsx(
                  "absolute left-[-2px] flex items-stretch shadow-md pointer-events-auto h-[26px]",
                  rect.top < 30 ? "top-[110%] mt-[2px]" : "-top-[34px]",
                )}
              >
                {/* ID Badge */}
                <div
                  className={clsx(
                    "bg-primary text-on-primary text-[10px] font-bold px-2 flex items-center justify-center whitespace-nowrap",
                    selectedNodeIds.length === 1
                      ? "rounded-l-md"
                      : "rounded-md",
                  )}
                >
                  {id}
                </div>

                {/* Streamlined Action Toolbar */}
                {selectedNodeIds.length === 1 && (
                  <div className="bg-surface text-on-surface border-y border-r border-outline-variant/50 flex items-center divide-x divide-outline-variant/30 rounded-r-md overflow-hidden shadow-sm">
                    <div
                      data-toolbar-action="insert"
                      data-toolbar-target={id}
                      className="p-1.5 hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant hover:text-on-surface"
                      title={
                        acceptsChildren
                          ? "Add Component Inside"
                          : "Add Component After"
                      }
                    >
                      <Plus size={12} />
                    </div>
                    <div
                      data-toolbar-action="replace"
                      data-toolbar-target={id}
                      className="p-1.5 hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant hover:text-on-surface"
                      title="Replace"
                    >
                      <RefreshCw size={12} />
                    </div>
                    <div
                      data-toolbar-action="duplicate"
                      data-toolbar-target={id}
                      className="p-1.5 hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant hover:text-on-surface"
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </div>
                    <div
                      data-toolbar-action="delete"
                      data-toolbar-target={id}
                      className="p-1.5 hover:bg-error/10 text-error transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

      {/* TIGHT INLINE TEXT EDITING HIGHLIGHT */}
      {editRect && (
        <div
          className="absolute border-2 border-dashed border-primary bg-primary/10 transition-none z-[100005] pointer-events-none rounded-md"
          style={{
            top: editRect.top - 4,
            left: editRect.left - 15,
            width: editRect.width + 8,
            height: editRect.height + 8,
          }}
        >
          <div
            className={clsx(
              "absolute left-0 bg-primary text-on-primary text-[10px] font-bold px-2.5 py-1.5 shadow-xl flex items-center gap-2 whitespace-nowrap rounded-md",
            )}
            style={{
              top: isEditCloseToBottom ? "auto" : "calc(100% + 8px)",
              bottom: isEditCloseToBottom ? "calc(100% + 8px)" : "auto",
            }}
          >
            <span className="flex items-center gap-1.5">
              <Type size={12} />
              Editing
            </span>
            <span className="opacity-70 font-mono font-normal tracking-wide pl-2 border-l border-on-primary/30">
              ↵ Save &nbsp; Esc Cancel
            </span>
          </div>
        </div>
      )}

      {/* Marquee */}
      {isMarquee && (
        <div
          className="absolute border border-primary bg-primary/20 transition-none"
          style={{
            left: Math.min(
              interaction.startCoords.x,
              interaction.currentCoords.x,
            ),
            top: Math.min(
              interaction.startCoords.y,
              interaction.currentCoords.y,
            ),
            width: Math.abs(
              interaction.currentCoords.x - interaction.startCoords.x,
            ),
            height: Math.abs(
              interaction.currentCoords.y - interaction.startCoords.y,
            ),
          }}
        />
      )}

      {/* Drop Target */}
      {dropTarget && (
        <div
          className={clsx(
            "absolute transition-all duration-75",
            dropTarget.type === "box"
              ? "border-2 border-primary bg-primary/20"
              : "bg-primary rounded-full",
          )}
          style={{
            top: dropTarget.rect.top,
            left: dropTarget.rect.left - 11,
            width: dropTarget.rect.width,
            height: dropTarget.rect.height,
            zIndex: 100000,
          }}
        />
      )}

      {/* Dragging nodes feedback */}
      {isDraggingNodes && (
        <div
          className="absolute z-[100001] bg-surface border border-outline-variant/50 shadow-2xl rounded-lg px-3 py-2 text-xs font-bold text-on-surface flex items-center gap-2 transition-none backdrop-blur-md"
          style={{
            left: interaction.currentCoords.x + 15,
            top: interaction.currentCoords.y + 15,
          }}
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          {selectedNodeIds.length} item{selectedNodeIds.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};
