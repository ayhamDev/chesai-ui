"use client";

import { Handle, NodeProps, Position, useViewport } from "@xyflow/react";
import { clsx } from "clsx";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Clipboard,
  Copy,
  CornerDownRight,
  Play,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useTheme } from "../../../context/ThemeProvider";
import { ContextMenu } from "../../context-menu";
import { Typography } from "../../typography";
import { useBuilderContext } from "../BuilderContext";
import { Renderer } from "../renderer";
import { useStudioStore } from "../store";
import type { ComponentControl, StudioNode } from "../types";

// --- TYPES & HELPERS ---

type InteractionState =
  | { type: "idle" }
  | { type: "marquee_prep"; startCoords: { x: number; y: number } }
  | {
      type: "marquee";
      startCoords: { x: number; y: number };
      currentCoords: { x: number; y: number };
    }
  | { type: "drag_prep"; startCoords: { x: number; y: number } }
  | {
      type: "drag";
      startCoords: { x: number; y: number };
      currentCoords: { x: number; y: number };
    };

type DropTarget = {
  parentId: string | null;
  index?: number;
  type: "line" | "box";
  rect: { top: number; left: number; width: number; height: number };
};

const findNodeById = (nodes: StudioNode[], id: string): StudioNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
  }
  return null;
};

const getParentAndIndex = (
  nodes: StudioNode[],
  targetId: string,
  parentId: string | null = null,
): { parentId: string | null; index: number } | null => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      return { parentId, index: i };
    }
    if (nodes[i].children) {
      const res = getParentAndIndex(
        nodes[i].children || [],
        targetId,
        nodes[i].id,
      );
      if (res) return res;
    }
  }
  return null;
};

// --- NAVIGATION INTERCEPTOR ---
const NavigationInterceptor = ({
  children,
  onNavigate,
}: {
  children: React.ReactNode;
  onNavigate: (linkTo: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNav = (e: any) => {
      e.stopPropagation();
      onNavigate(e.detail.linkTo);
    };

    el.addEventListener("studio-navigate", handleNav);
    return () => el.removeEventListener("studio-navigate", handleNav);
  }, [onNavigate]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-full"
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest("a");
        if (a) {
          const href = a.getAttribute("href");
          if (href && href.startsWith("/")) {
            e.preventDefault();
            e.stopPropagation();
            onNavigate(href);
          }
        }
      }}
    >
      {children}
    </div>
  );
};

const IframeContentObserver = ({
  children,
  onHeightChange,
}: {
  children: React.ReactNode;
  onHeightChange: (h: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number;

    const updateHeight = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!el) return;
        const rectHeight = el.getBoundingClientRect().height;
        const scrollHeight = el.scrollHeight;
        onHeightChange(Math.max(rectHeight, scrollHeight));
      });
    };

    const resizeObserver = new ResizeObserver(() => updateHeight());
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(() => updateHeight());
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    updateHeight();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [onHeightChange]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col relative overflow-hidden"
    >
      {children}
    </div>
  );
};

const isRectEqual = (
  a: DOMRect | null | undefined,
  b: DOMRect | null | undefined,
) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
};

// --- CANVAS OVERLAY (Visual Indicators) ---

const CanvasOverlay = ({
  iframeWindow,
  interaction,
  dropTarget,
}: {
  iframeWindow: Window;
  interaction: InteractionState;
  dropTarget: DropTarget | null;
}) => {
  const { selectedNodeIds, hoveredNodeId } = useStudioStore();
  const [selectedRects, setSelectedRects] = useState<Record<string, DOMRect>>(
    {},
  );
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

  const updateRects = useCallback(() => {
    if (!iframeWindow) return;
    const doc = iframeWindow.document;
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
  }, [selectedNodeIds, hoveredNodeId, iframeWindow]);

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

  return (
    <div className="absolute inset-0 pointer-events-none z-[99999]">
      {/* Hover Indicator */}
      {hoveredRect && !isDraggingNodes && (
        <div
          className="absolute border-2 border-primary bg-primary/10 transition-none"
          style={{
            top: hoveredRect.top,
            left: hoveredRect.left - 10,
            width: hoveredRect.width,
            height: hoveredRect.height,
          }}
        />
      )}

      {/* Selected Indicators */}
      {!isDraggingNodes &&
        Object.entries(selectedRects).map(([id, rect]) => (
          <div
            key={id}
            className="absolute border-2 border-primary transition-none"
            style={{
              top: rect.top,
              left: rect.left - 10,
              width: rect.width,
              height: rect.height,
            }}
          >
            <div
              className={clsx(
                "absolute left-[-1px] bg-primary text-on-primary text-[10px] font-bold px-2 py-1 whitespace-nowrap shadow-sm pointer-events-auto cursor-default",
                rect.top < 24
                  ? "top-[-2px] rounded-br-md"
                  : "-top-[23px] rounded-t-md",
              )}
            >
              {id}
            </div>
          </div>
        ))}

      {/* Marquee Selection Box */}
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

      {/* Drop Target Indicator */}
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

      {/* Dragging Ghost Payload */}
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

// --- ARTBOARD IFRAME ---

const ArtboardIframe = ({
  children,
  title,
  defaultHeight,
}: {
  children: React.ReactNode;
  title: string;
  defaultHeight: number;
}) => {
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);
  const [iframeHead, setIframeHead] = useState<HTMLElement | null>(null);
  const [iframeWindow, setIframeWindow] = useState<Window | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(defaultHeight);

  const [interaction, setInteraction] = useState<InteractionState>({
    type: "idle",
  });
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [externalDropTarget, setExternalDropTarget] =
    useState<DropTarget | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectionAlteredOnPointerDown = useRef<boolean>(false);

  const resolvedTheme = useTheme().resolvedTheme;
  const { components, cms, actions, customApi } = useBuilderContext();
  const {
    setHoveredNode,
    selectedNodeIds,
    setSelectedNodes,
    toggleNodeSelection,
    clipboard,
    copyNodes,
    pasteNodes,
    duplicateNodes,
    removeNodes,
    moveNodes,
    addNode,
    website,
    activePageId,
    openComponentPicker,
  } = useStudioStore();

  const activePage = website?.pages.find((p) => p.id === activePageId);
  const { zoom } = useViewport();

  const handleLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    const win = iframeRef.current?.contentWindow;
    if (doc && win) {
      setIframeBody(doc.body);
      setIframeHead(doc.head);
      setIframeWindow(win);
      doc.documentElement.className = document.documentElement.className;
    }
  };

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) doc.documentElement.className = document.documentElement.className;
  }, [resolvedTheme]);

  useEffect(() => {
    if (!iframeHead) return;
    const styleTags = document.querySelectorAll(
      'style, link[rel="stylesheet"]',
    );
    styleTags.forEach((tag) => iframeHead.appendChild(tag.cloneNode(true)));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "STYLE" || node.nodeName === "LINK") {
            iframeHead.appendChild(node.cloneNode(true));
          }
        });
      });
    });

    observer.observe(document.head, { childList: true });
    return () => observer.disconnect();
  }, [iframeHead]);

  const getIframeCoordinates = (e: React.MouseEvent | React.PointerEvent) => {
    if (!iframeRef.current) return null;
    const rect = iframeRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    return { x, y };
  };

  const calculateDropTargetInfo = (
    coords: { x: number; y: number },
    draggedIds: string[],
  ): DropTarget | null => {
    if (!iframeWindow || !iframeRef.current || !activePage) return null;
    const doc = iframeWindow.document;

    const nodesToHide: HTMLElement[] = [];
    draggedIds.forEach((id) => {
      const el = doc.querySelector(`[data-studio-node-id="${id}"]`);
      if (el) {
        nodesToHide.push(el as HTMLElement);
        (el as HTMLElement).style.pointerEvents = "none";
      }
    });

    const targetEl = doc
      .elementFromPoint(coords.x, coords.y)
      ?.closest("[data-studio-node-id]");

    nodesToHide.forEach((el) => {
      el.style.pointerEvents = "";
    });

    if (!targetEl) {
      return {
        parentId: null,
        index: undefined,
        type: "box",
        rect: {
          top: 0,
          left: 0,
          width: iframeWindow.innerWidth,
          height: iframeWindow.innerHeight,
        },
      };
    }

    const targetId = targetEl.getAttribute("data-studio-node-id")!;
    const targetRect = targetEl.getBoundingClientRect();
    const relY = coords.y - (targetRect.top + iframeWindow.scrollY);

    const targetNode = findNodeById(activePage.content, targetId);
    const acceptsChildren = targetNode
      ? (components[targetNode.type]?.acceptsChildren ?? false)
      : false;

    const parentInfo = getParentAndIndex(activePage.content, targetId);
    const parentId = parentInfo?.parentId ?? null;
    const currentIndex = parentInfo?.index ?? 0;

    let dropType: "line" | "box" = "line";
    let destParentId = parentId;
    let destIndex: number | undefined = currentIndex;
    let indicatorRect = {
      top: targetRect.top + iframeWindow.scrollY,
      left: targetRect.left + iframeWindow.scrollX,
      width: targetRect.width,
      height: targetRect.height,
    };

    if (acceptsChildren) {
      if (relY < targetRect.height * 0.25) {
        dropType = "line";
        destIndex = currentIndex;
        indicatorRect.height = 4;
        indicatorRect.top -= 2;
      } else if (relY > targetRect.height * 0.75) {
        dropType = "line";
        destIndex = currentIndex + 1;
        indicatorRect.top = indicatorRect.top + targetRect.height - 2;
        indicatorRect.height = 4;
      } else {
        dropType = "box";
        destParentId = targetId;
        destIndex = undefined;
      }
    } else {
      if (relY < targetRect.height / 2) {
        dropType = "line";
        destIndex = currentIndex;
        indicatorRect.height = 4;
        indicatorRect.top -= 2;
      } else {
        dropType = "line";
        destIndex = currentIndex + 1;
        indicatorRect.top = indicatorRect.top + targetRect.height - 2;
        indicatorRect.height = 4;
      }
    }

    return {
      parentId: destParentId,
      index: destIndex,
      type: dropType,
      rect: indicatorRect,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;

    e.stopPropagation();
    document.body.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true }),
    );

    const canvasEl = e.currentTarget.closest("[data-tool]");
    if (canvasEl?.getAttribute("data-tool") === "hand") return;

    const coords = getIframeCoordinates(e);
    if (!coords || !iframeWindow) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    const el = iframeWindow.document.elementFromPoint(coords.x, coords.y);
    const nodeEl = el?.closest("[data-studio-node-id]");

    selectionAlteredOnPointerDown.current = false;

    if (nodeEl) {
      const id = nodeEl.getAttribute("data-studio-node-id");
      if (id) {
        const isAlreadySelected = selectedNodeIds.includes(id);
        const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;

        if (!isAlreadySelected) {
          if (isMulti) {
            toggleNodeSelection(id, true);
          } else {
            setSelectedNodes([id]);
          }
          selectionAlteredOnPointerDown.current = true;
        }
        setInteraction({ type: "drag_prep", startCoords: coords });
      }
    } else {
      if (!(e.shiftKey || e.metaKey || e.ctrlKey)) {
        setSelectedNodes([]);
      }
      setInteraction({ type: "marquee_prep", startCoords: coords });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = getIframeCoordinates(e);
    if (!coords || !iframeWindow) return;

    if (
      interaction.type === "marquee_prep" ||
      interaction.type === "drag_prep"
    ) {
      const dist = Math.hypot(
        coords.x - interaction.startCoords.x,
        coords.y - interaction.startCoords.y,
      );
      if (dist > 5) {
        if (interaction.type === "marquee_prep") {
          setInteraction({
            type: "marquee",
            startCoords: interaction.startCoords,
            currentCoords: coords,
          });
        } else {
          setInteraction({
            type: "drag",
            startCoords: interaction.startCoords,
            currentCoords: coords,
          });
          const target = calculateDropTargetInfo(coords, selectedNodeIds);
          setDropTarget(target);
        }
      }
      return;
    }

    if (interaction.type === "marquee") {
      setInteraction({ ...interaction, currentCoords: coords });

      const rect = {
        left: Math.min(interaction.startCoords.x, coords.x),
        top: Math.min(interaction.startCoords.y, coords.y),
        right: Math.max(interaction.startCoords.x, coords.x),
        bottom: Math.max(interaction.startCoords.y, coords.y),
      };

      const nodes = Array.from(
        iframeWindow.document.querySelectorAll("[data-studio-node-id]"),
      );

      const selectedIds = nodes
        .filter((n) => {
          const nRect = n.getBoundingClientRect();
          const intersects = !(
            nRect.right < rect.left ||
            nRect.left > rect.right ||
            nRect.bottom < rect.top ||
            nRect.top > rect.bottom
          );
          const boxCompletelyInsideNode =
            rect.left >= nRect.left &&
            rect.right <= nRect.right &&
            rect.top >= nRect.top &&
            rect.bottom <= nRect.bottom;
          return intersects && !boxCompletelyInsideNode;
        })
        .map((n) => n.getAttribute("data-studio-node-id")!);

      setSelectedNodes(selectedIds);
      return;
    }

    if (interaction.type === "drag") {
      setInteraction({ ...interaction, currentCoords: coords });
      const target = calculateDropTargetInfo(coords, selectedNodeIds);
      setDropTarget(target);
      return;
    }

    const el = iframeWindow.document.elementFromPoint(coords.x, coords.y);
    const node = el?.closest("[data-studio-node-id]");
    if (node) {
      setHoveredNode(node.getAttribute("data-studio-node-id"));
    } else {
      setHoveredNode(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (interaction.type === "drag_prep") {
      if (!selectionAlteredOnPointerDown.current) {
        handleClick(e);
      }
    } else if (interaction.type === "drag" && dropTarget) {
      moveNodes(selectedNodeIds, dropTarget.parentId, dropTarget.index);
    }

    setInteraction({ type: "idle" });
    setDropTarget(null);
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setInteraction({ type: "idle" });
    setDropTarget(null);
  };

  const handleClick = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    const coords = getIframeCoordinates(e);
    if (!coords || !iframeWindow) return;

    const el = iframeWindow.document.elementFromPoint(coords.x, coords.y);
    const node = el?.closest("[data-studio-node-id]");
    if (node) {
      const id = node.getAttribute("data-studio-node-id");
      if (id) {
        const multi = e.shiftKey || e.metaKey || e.ctrlKey;
        if (!multi) {
          setSelectedNodes([id]);
        } else {
          toggleNodeSelection(id, true);
        }
      }
    } else {
      setSelectedNodes([]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const coords = getIframeCoordinates(e);
    if (!coords || !iframeWindow) return;

    const el = iframeWindow.document.elementFromPoint(coords.x, coords.y);
    const node = el?.closest("[data-studio-node-id]");

    if (node) {
      const id = node.getAttribute("data-studio-node-id");
      if (id && !selectedNodeIds.includes(id)) {
        setSelectedNodes([id]);
      }
    } else {
      setSelectedNodes([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("application/studio-component")) return;
    e.preventDefault();
    e.stopPropagation();

    const coords = getIframeCoordinates(e);
    if (!coords) return;

    const target = calculateDropTargetInfo(coords, []);
    setExternalDropTarget(target);
  };

  const handleDragLeave = () => {
    setExternalDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    const compId = e.dataTransfer.getData("application/studio-component");
    if (!compId) return;

    e.preventDefault();
    e.stopPropagation();

    const coords = getIframeCoordinates(e);
    let target = externalDropTarget;
    if (!target && coords) {
      target = calculateDropTargetInfo(coords, []);
    }

    if (target) {
      const newNode: StudioNode = {
        id: `${compId.toLowerCase()}_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`,
        type: compId,
        props: {},
        children: [],
      };
      addNode(newNode, target.parentId, target.index);
    }

    setExternalDropTarget(null);
  };

  const finalHeight = Math.max(contentHeight, defaultHeight);

  return (
    <div className="relative w-full " style={{ height: finalHeight }}>
      <iframe
        ref={iframeRef}
        onLoad={handleLoad}
        title={title}
        className="absolute inset-0 w-full h-full border-none bg-transparent"
        srcDoc="<!DOCTYPE html><html><head></head><body style='margin: 0; padding: 0; overflow: hidden; background: transparent;'></body></html>"
      >
        {iframeBody &&
          createPortal(
            <>
              <style>{`
                .website-studio-theme-root {
                  min-height: ${defaultHeight}px !important;
                  height: fit-content !important;
                }
                .min-h-screen {
                  min-height: ${defaultHeight}px !important;
                }
                .h-screen {
                  height: ${defaultHeight}px !important;
                }
              `}</style>
              <IframeContentObserver onHeightChange={setContentHeight}>
                <NavigationInterceptor
                  onNavigate={(linkTo) => {
                    const targetPage = website?.pages.find(
                      (p) => p.slug === linkTo,
                    );
                    if (targetPage) {
                      useStudioStore.getState().setActivePage(targetPage.id);
                    }
                  }}
                >
                  {children}
                </NavigationInterceptor>
              </IframeContentObserver>
            </>,
            iframeBody,
          )}
      </iframe>

      <ContextMenu shape="minimal">
        <ContextMenu.Trigger asChild>
          <div
            className="absolute inset-0 z-[9999] group-data-[tool=pointer]/canvas:cursor-default group-data-[tool=hand]/canvas:cursor-grab active:group-data-[tool=hand]/canvas:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={(e) => {
              if (
                interaction.type === "idle" ||
                interaction.type === "marquee_prep" ||
                interaction.type === "drag_prep"
              ) {
                setHoveredNode(null);
                setExternalDropTarget(null);
              } else {
                handlePointerCancel(e);
              }
            }}
            onContextMenu={handleContextMenu}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          {selectedNodeIds.length === 0 && (
            <>
              <ContextMenu.Item
                onClick={() => openComponentPicker("inside", "ROOT")}
              >
                <Plus className="w-4 h-4 mr-2" /> Insert Component...
              </ContextMenu.Item>
              <ContextMenu.Separator />
            </>
          )}

          <ContextMenu.Item
            disabled={selectedNodeIds.length === 0}
            onClick={() => copyNodes(selectedNodeIds)}
          >
            <Copy className="w-4 h-4 mr-2" /> Copy
          </ContextMenu.Item>
          <ContextMenu.Item
            disabled={clipboard.length === 0}
            onClick={() => {
              const targetId =
                selectedNodeIds.length > 0 ? selectedNodeIds[0] : null;
              let canAcceptChildren = false;

              if (targetId && activePage) {
                const targetNode = findNodeById(activePage.content, targetId);
                canAcceptChildren = targetNode
                  ? (components[targetNode.type]?.acceptsChildren ?? false)
                  : false;
              }
              pasteNodes(targetId, canAcceptChildren ? "inside" : "after");
            }}
          >
            <Clipboard className="w-4 h-4 mr-2" /> Paste
          </ContextMenu.Item>
          <ContextMenu.Item
            disabled={selectedNodeIds.length === 0}
            onClick={() => duplicateNodes(selectedNodeIds)}
          >
            <Copy className="w-4 h-4 mr-2" /> Duplicate
          </ContextMenu.Item>

          <ContextMenu.Separator />

          {selectedNodeIds.length === 1 && (
            <>
              <ContextMenu.Item
                onClick={() =>
                  openComponentPicker("replace", selectedNodeIds[0])
                }
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Replace with...
              </ContextMenu.Item>
              <ContextMenu.Item
                onClick={() =>
                  openComponentPicker("before", selectedNodeIds[0])
                }
              >
                <ArrowUpToLine className="w-4 h-4 mr-2" /> Insert Before...
              </ContextMenu.Item>
              <ContextMenu.Item
                onClick={() => openComponentPicker("after", selectedNodeIds[0])}
              >
                <ArrowDownToLine className="w-4 h-4 mr-2" /> Insert After...
              </ContextMenu.Item>
              {(() => {
                let canAcceptChildren = false;
                if (activePage) {
                  const targetNode = findNodeById(
                    activePage.content,
                    selectedNodeIds[0],
                  );
                  canAcceptChildren = targetNode
                    ? (components[targetNode.type]?.acceptsChildren ?? false)
                    : false;
                }
                return canAcceptChildren ? (
                  <ContextMenu.Item
                    onClick={() =>
                      openComponentPicker("inside", selectedNodeIds[0])
                    }
                  >
                    <CornerDownRight className="w-4 h-4 mr-2" /> Insert
                    Inside...
                  </ContextMenu.Item>
                ) : null;
              })()}
              <ContextMenu.Separator />
            </>
          )}

          <ContextMenu.Item
            disabled={selectedNodeIds.length === 0}
            className="text-error hover:!bg-error/10 hover:!text-error"
            onClick={() => removeNodes(selectedNodeIds)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>

      {iframeWindow &&
        iframeBody &&
        createPortal(
          <CanvasOverlay
            iframeWindow={iframeWindow}
            interaction={interaction}
            dropTarget={dropTarget || externalDropTarget}
          />,
          iframeBody,
        )}
    </div>
  );
};

export type ArtboardData = {
  label: string;
  width: number;
  height: number;
  isIsolationMode?: boolean;
  componentId?: string;
};

function generateSingleAxisVariations(
  controls: Record<string, ComponentControl>,
) {
  const propKeys = Object.keys(controls || {});
  const baselineProps: Record<string, any> = {};

  if (propKeys.length === 0) return { baselineProps: {}, groups: [] };

  propKeys.forEach((key) => {
    const control = controls[key];
    if (control.defaultValue !== undefined) {
      baselineProps[key] = control.defaultValue;
    } else if (control.type === "select" && control.options?.length) {
      baselineProps[key] = control.options[0].value;
    } else if (control.type === "boolean") {
      baselineProps[key] = false;
    } else if (control.type === "text" || control.type === "textarea") {
      baselineProps[key] = "Sample Text";
    } else if (control.type === "number" || control.type === "slider") {
      baselineProps[key] = control.min || 0;
    } else if (control.type === "color") {
      baselineProps[key] = "#0070f3";
    } else {
      baselineProps[key] = null;
    }
  });

  const groups: {
    propName: string;
    variations: { props: Record<string, any>; value: any }[];
  }[] = [];

  propKeys.forEach((key) => {
    const control = controls[key];
    let values: any[] = [];

    if (control.type === "select" && control.options) {
      values = control.options.map((opt) => opt.value);
    } else if (control.type === "boolean") {
      values = [true, false];
    }

    values = Array.from(new Set(values));

    if (values.length > 1) {
      groups.push({
        propName: key,
        variations: values.map((v) => ({
          props: { ...baselineProps, [key]: v },
          value: v,
        })),
      });
    }
  });

  return { baselineProps, groups };
}

export const ArtboardNode = ({ data, selected }: NodeProps<any>) => {
  const { label, width, height, isIsolationMode, componentId } =
    data as ArtboardData;

  const { components, cms, actions, customApi } = useBuilderContext();
  const { website, activePageId } = useStudioStore();

  const activePage = website?.pages.find((p) => p.id === activePageId);
  const hasContent = activePage && activePage.content.length > 0;

  let contentToRender;

  if (isIsolationMode && componentId) {
    const CompDef = components[componentId];
    if (CompDef) {
      const { baselineProps, groups } = generateSingleAxisVariations(
        CompDef.controls || {},
      );

      contentToRender = (
        <div className="w-full h-full overflow-y-auto p-12 bg-surface scrollbar-thin flex flex-col gap-16 group-data-[tool=pointer]/canvas:cursor-default group-data-[tool=hand]/canvas:cursor-grab">
          <div className="flex flex-col gap-4">
            <Typography variant="title-medium" className="font-bold">
              Baseline Default
            </Typography>
            <div className="flex flex-wrap gap-2 pb-4 border-b border-outline-variant/30">
              {Object.keys(baselineProps).length === 0 && (
                <span className="text-sm opacity-50 italic">
                  No props defined
                </span>
              )}
              {Object.entries(baselineProps).map(([k, v]) => (
                <span
                  key={k}
                  className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[11px] rounded-md font-mono font-medium tracking-wide"
                >
                  {k}: {String(v)}
                </span>
              ))}
            </div>
            <div className="p-8 border border-outline-variant/40 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-center min-h-[100px] w-fit min-w-[200px]">
              <CompDef.render {...baselineProps} />
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.propName} className="flex flex-col gap-4">
              <Typography
                variant="title-medium"
                className="font-bold border-b border-outline-variant/30 pb-3"
              >
                Varying:{" "}
                <span className="text-primary font-mono">{group.propName}</span>
              </Typography>
              <div className="flex flex-wrap gap-8">
                {group.variations.map((v, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-6 border border-outline-variant/40 rounded-2xl bg-surface-container-lowest shadow-sm w-fit min-w-[200px]"
                  >
                    <div className="mb-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 text-[11px] rounded-md font-mono font-bold tracking-wide w-fit">
                        {String(v.value)}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-[80px]">
                      <CompDef.render {...v.props} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      contentToRender = (
        <div className="p-8 text-error">
          Component '{componentId}' not found in registry.
        </div>
      );
    }
  } else {
    contentToRender = hasContent ? (
      <div className="w-full h-full pointer-events-auto group-data-[tool=hand]/canvas:pointer-events-none">
        <ArtboardIframe title={label} defaultHeight={height - 32}>
          <Renderer
            components={components}
            data={activePage.content}
            designSystem={website?.designSystem}
            cms={cms || {}}
            customApi={customApi}
            actions={{
              ...actions,
              openLink: (url: string, target: string) => {
                const targetPage = website?.pages.find((p) => p.slug === url);
                if (targetPage) {
                  useStudioStore.getState().setActivePage(targetPage.id);
                } else {
                  window.open(url, target || "_blank");
                }
              },
            }}
          />
        </ArtboardIframe>
      </div>
    ) : (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 gap-4 mx-4"
        style={{ height: height - 32 }}
      >
        <Typography variant="display-small" className="opacity-50">
          Canvas Empty
        </Typography>
        <Typography variant="body-medium">
          Drag components from the Insert panel to start building.
        </Typography>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative rounded-xl shadow-2xl flex flex-col overflow-hidden transition-[box-shadow,border] duration-200",
        selected
          ? "ring-2 ring-primary ring-offset-4 ring-offset-background"
          : "ring-1 ring-outline-variant/30",
      )}
      style={{ width, minHeight: height }}
    >
      {/* Framer-inspired Header Bar utilizing dynamic theme tokens */}
      <div className="h-12 bg-surface-container-high border-b border-outline-variant/30 flex items-center justify-between px-4 shrink-0 select-none">
        {/* Left Section: Play Button + Device details */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isIsolationMode) return;
              window.dispatchEvent(
                new CustomEvent("studio-preview", {
                  detail: { pageId: activePageId },
                }),
              );
            }}
            className="w-7 h-7 bg-primary text-on-primary rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            title="Preview Page"
          >
            <Play size={12} className="fill-current ml-0.5" />
          </button>

          <div className="flex items-center gap-1.5 ml-1">
            <Typography
              variant="label-medium"
              className="font-bold text-on-surface"
            >
              {isIsolationMode ? "Sandbox" : label}
            </Typography>
            <span className="text-on-surface-variant/50 text-xs">&middot;</span>
            <Typography
              variant="label-small"
              className="font-mono text-on-surface-variant opacity-85"
            >
              {isIsolationMode ? componentId || "Component" : width}
            </Typography>
          </div>
        </div>

        {/* Right Section: Page Title */}
        {!isIsolationMode && (
          <div className="flex items-center gap-2">
            <Typography
              variant="label-large"
              className="text-primary font-bold tracking-wide"
            >
              {activePage?.title || "Page"}
            </Typography>
          </div>
        )}
      </div>

      <div className="flex-1 w-full bg-background relative contain-paint nodrag group-data-[tool=pointer]/canvas:cursor-default group-data-[tool=hand]/canvas:cursor-grab">
        {contentToRender}
      </div>

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};
