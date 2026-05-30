// src/lib/components/website-studio/canvas/ArtboardIframe.tsx
"use client";

import { useViewport } from "@xyflow/react";
import { clsx } from "clsx";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Clipboard,
  Copy,
  CornerDownRight,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useTheme } from "../../../context/ThemeProvider";
import { ContextMenu } from "../../context-menu";
import { useBuilderContext } from "../BuilderContext";
import { Renderer } from "../renderer";
import { useStudioStore } from "../store";
import { toast } from "../../toast";
import type { StudioNode } from "../types";

import type { InteractionState, DropTarget } from "./artboard-types";
import { findNodeById, getParentAndIndex } from "./artboard-utils";
import { CanvasOverlay } from "./CanvasOverlay";
import { IframeContentObserver, NavigationInterceptor } from "./IframeWrappers";

export const ArtboardIframe = ({
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
  const [inlineEditElement, setInlineEditElement] =
    useState<HTMLElement | null>(null);

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
    updateNodeProps,
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

  useEffect(() => {
    if (!iframeWindow || !iframeRef.current) return;

    const handleIframeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rfPane =
        document.querySelector(".react-flow__pane") ||
        document.querySelector(".react-flow");
      if (!rfPane) return;

      const rect = iframeRef.current!.getBoundingClientRect();
      const clonedEvent = new WheelEvent("wheel", {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        deltaZ: e.deltaZ,
        deltaMode: e.deltaMode,
        clientX: e.clientX + rect.left,
        clientY: e.clientY + rect.top,
        screenX: e.screenX,
        screenY: e.screenY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        bubbles: true,
        cancelable: true,
      });
      rfPane.dispatchEvent(clonedEvent);
    };

    let isMiddleClickDragging = false;
    const forwardPointerEvent = (e: PointerEvent, type: string) => {
      const rfPane =
        document.querySelector(".react-flow__pane") ||
        document.querySelector(".react-flow");
      if (!rfPane) return;
      const rect = iframeRef.current!.getBoundingClientRect();
      const clonedEvent = new PointerEvent(type, {
        pointerId: e.pointerId,
        pointerType: e.pointerType,
        isPrimary: e.isPrimary,
        button: e.button,
        buttons: e.buttons,
        clientX: e.clientX + rect.left,
        clientY: e.clientY + rect.top,
        screenX: e.screenX,
        screenY: e.screenY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        bubbles: true,
        cancelable: true,
      });
      rfPane.dispatchEvent(clonedEvent);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        isMiddleClickDragging = true;
        forwardPointerEvent(e, "pointerdown");
      }
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (isMiddleClickDragging) forwardPointerEvent(e, "pointermove");
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (isMiddleClickDragging) {
        isMiddleClickDragging = false;
        forwardPointerEvent(e, "pointerup");
      }
    };

    iframeWindow.addEventListener("wheel", handleIframeWheel, {
      passive: false,
    });
    iframeWindow.addEventListener("pointerdown", handlePointerDown);
    iframeWindow.addEventListener("pointermove", handlePointerMove);
    iframeWindow.addEventListener("pointerup", handlePointerUp);

    return () => {
      iframeWindow.removeEventListener("wheel", handleIframeWheel);
      iframeWindow.removeEventListener("pointerdown", handlePointerDown);
      iframeWindow.removeEventListener("pointermove", handlePointerMove);
      iframeWindow.removeEventListener("pointerup", handlePointerUp);
    };
  }, [iframeWindow]);

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
    nodesToHide.forEach((el) => (el.style.pointerEvents = ""));

    if (!targetEl) {
      return {
        parentId: null,
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

    // --- QUICK TOOLBAR ACTION INTERCEPTION ---
    const toolbarBtn = el?.closest("[data-toolbar-action]");
    if (toolbarBtn) {
      const action = toolbarBtn.getAttribute("data-toolbar-action");
      const targetId = toolbarBtn.getAttribute("data-toolbar-target");
      if (targetId) {
        if (action === "insert") {
          const activePage = website?.pages.find((p) => p.id === activePageId);
          const nodeData = activePage
            ? findNodeById(activePage.content, targetId)
            : null;

          // Context-aware insertion: "inside" for containers, "after" for leaf components
          const acceptsChildren = nodeData
            ? (components[nodeData.type]?.acceptsChildren ?? false)
            : false;
          openComponentPicker(acceptsChildren ? "inside" : "after", targetId);
        }
        if (action === "replace") openComponentPicker("replace", targetId);
        if (action === "duplicate") duplicateNodes([targetId]);
        if (action === "delete") removeNodes([targetId]);
      }
      return; // Return early to block selection reset or drag start
    }
    const nodeEl = el?.closest("[data-studio-node-id]");
    selectionAlteredOnPointerDown.current = false;

    if (nodeEl) {
      const id = nodeEl.getAttribute("data-studio-node-id");
      if (id) {
        const isAlreadySelected = selectedNodeIds.includes(id);
        const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;

        if (!isAlreadySelected) {
          if (isMulti) toggleNodeSelection(id, true);
          else setSelectedNodes([id]);
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
          setDropTarget(calculateDropTargetInfo(coords, selectedNodeIds));
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
      setDropTarget(calculateDropTargetInfo(coords, selectedNodeIds));
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
      if (!selectionAlteredOnPointerDown.current) handleClick(e);
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
        if (!multi) setSelectedNodes([id]);
        else toggleNodeSelection(id, true);
      }
    } else {
      setSelectedNodes([]);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (interaction.type !== "idle") return;
    const coords = getIframeCoordinates(e);
    if (!coords || !iframeWindow) return;

    const el = iframeWindow.document.elementFromPoint(
      coords.x,
      coords.y,
    ) as HTMLElement;
    if (!el) return;

    const editableEl = el.closest(
      "[data-studio-editable]",
    ) as HTMLElement | null;
    if (!editableEl) return;

    const textProp = editableEl.getAttribute("data-studio-editable");
    if (!textProp) return;

    const nodeEl = editableEl.closest("[data-studio-node-id]") as HTMLElement;
    if (!nodeEl) return;

    const nodeId = nodeEl.getAttribute("data-studio-node-id");
    if (!nodeId) return;

    const activePage = website?.pages.find((p) => p.id === activePageId);
    if (!activePage) return;

    const nodeData = findNodeById(activePage.content, nodeId);
    if (!nodeData) return;

    const currentVal = nodeData.props[textProp];
    if (
      typeof currentVal === "string" &&
      currentVal.startsWith("{{") &&
      currentVal.endsWith("}}")
    ) {
      toast.info("CMS Bound Data", {
        description: "Cannot inline edit data bound to the CMS.",
      });
      return;
    }

    setSelectedNodes([nodeId]);

    const selection = iframeWindow.getSelection();
    const savedRange =
      selection && selection.rangeCount > 0
        ? selection.getRangeAt(0).cloneRange()
        : null;

    iframeWindow.document.body.classList.add("studio-inline-editing");

    editableEl.contentEditable = "true";
    const originalOutline = editableEl.style.outline;
    const originalCursor = editableEl.style.cursor;
    const originalCaret = editableEl.style.caretColor;

    editableEl.style.outline = "none";
    editableEl.style.cursor = "text";
    editableEl.style.caretColor = "var(--md-sys-color-primary)";

    setTimeout(() => {
      editableEl.focus();
      const sel = iframeWindow.getSelection();

      if (savedRange) {
        sel?.removeAllRanges();
        sel?.addRange(savedRange);
      } else {
        const range = iframeWindow.document.createRange();
        range.selectNodeContents(editableEl);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 0);

    setInlineEditElement(editableEl);

    const cleanup = () => {
      editableEl.contentEditable = "false";
      editableEl.style.outline = originalOutline;
      editableEl.style.cursor = originalCursor;
      editableEl.style.caretColor = originalCaret;

      iframeWindow.document.body.classList.remove("studio-inline-editing");

      setInlineEditElement(null);
      editableEl.removeEventListener("blur", handleFinish);
      editableEl.removeEventListener("keydown", handleKeyDown);
      editableEl.removeEventListener("paste", handlePaste);

      const newText = editableEl.innerText;
      updateNodeProps(nodeId, { [textProp]: newText });
    };

    const handleFinish = () => cleanup();

    const handleKeyDown = (ke: KeyboardEvent) => {
      ke.stopPropagation();
      if (ke.key === "Enter" && !ke.shiftKey) {
        ke.preventDefault();
        editableEl.blur();
      } else if (ke.key === "Escape") {
        editableEl.innerText = String(currentVal || "");
        cleanup();
      }
    };

    const handlePaste = (pe: ClipboardEvent) => {
      pe.preventDefault();
      const text = pe.clipboardData?.getData("text/plain");
      if (text) iframeWindow.document.execCommand("insertText", false, text);
    };

    editableEl.addEventListener("blur", handleFinish);
    editableEl.addEventListener("keydown", handleKeyDown);
    editableEl.addEventListener("paste", handlePaste);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    const coords = getIframeCoordinates(e);
    if (!coords || !iframeWindow) return;

    const el = iframeWindow.document.elementFromPoint(coords.x, coords.y);
    const node = el?.closest("[data-studio-node-id]");

    if (node) {
      const id = node.getAttribute("data-studio-node-id");
      if (id && !selectedNodeIds.includes(id)) setSelectedNodes([id]);
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
    setExternalDropTarget(calculateDropTargetInfo(coords, []));
  };

  const handleDragLeave = () => setExternalDropTarget(null);

  const handleDrop = (e: React.DragEvent) => {
    const compId = e.dataTransfer.getData("application/studio-component");
    if (!compId) return;

    e.preventDefault();
    e.stopPropagation();

    const coords = getIframeCoordinates(e);
    let target =
      externalDropTarget ||
      (coords ? calculateDropTargetInfo(coords, []) : null);

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
                .website-studio-theme-root { min-height: ${defaultHeight}px !important; height: fit-content !important; }
                .min-h-screen { min-height: ${defaultHeight}px !important; }
                .h-screen { height: ${defaultHeight}px !important; }
                
                body.studio-inline-editing * {
                  pointer-events: none !important;
                  user-select: none !important;
                }
                body.studio-inline-editing [contenteditable="true"],
                body.studio-inline-editing [contenteditable="true"] * {
                  pointer-events: auto !important;
                  user-select: text !important;
                }
              `}</style>
              <IframeContentObserver onHeightChange={setContentHeight}>
                <NavigationInterceptor
                  onNavigate={(linkTo) => {
                    const targetPage = website?.pages.find(
                      (p) => p.slug === linkTo,
                    );
                    if (targetPage)
                      useStudioStore.getState().setActivePage(targetPage.id);
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
            className={clsx(
              "absolute inset-0 z-[9999]",
              inlineEditElement ? "pointer-events-none" : "pointer-events-auto",
              "group-data-[tool=pointer]/canvas:cursor-default group-data-[tool=hand]/canvas:cursor-grab active:group-data-[tool=hand]/canvas:cursor-grabbing",
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onDoubleClick={handleDoubleClick}
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
            inlineEditElement={inlineEditElement}
          />,
          iframeBody,
        )}
    </div>
  );
};
