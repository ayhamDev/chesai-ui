// src/lib/components/website-studio/canvas/ArtboardNode.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, NodeProps, useViewport } from "@xyflow/react";
import { clsx } from "clsx";
import { Typography } from "../../typography";
import { useStudioStore } from "../store";
import { useBuilderContext } from "../BuilderContext";
import { Renderer } from "../renderer";
import { useTheme } from "../../../context/ThemeProvider";
import type { ComponentControl } from "../types";

const IframeContentObserver: React.FC<{
  children: React.ReactNode;
  onHeightChange: (h: number) => void;
}> = ({ children, onHeightChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const height =
        entries[0].borderBoxSize?.[0]?.blockSize ??
        entries[0].target.getBoundingClientRect().height;
      onHeightChange(height);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <div ref={containerRef} className="w-full flex flex-col relative">
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

const CanvasOverlay = ({ iframeWindow }: { iframeWindow: Window }) => {
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

  return (
    <div className="absolute inset-0 pointer-events-none z-[99999]">
      {hoveredRect && (
        <div
          className="absolute border-2 border-primary bg-primary/10 transition-none"
          style={{
            top: hoveredRect.top,
            // -11 for corrections
            left: hoveredRect.left - 11,
            width: hoveredRect.width,
            height: hoveredRect.height,
          }}
        />
      )}
      {Object.entries(selectedRects).map(([id, rect]) => (
        <div
          key={id}
          className="absolute border-2 border-primary transition-none"
          style={{
            top: rect.top,
            // -11 for corrections
            left: rect.left - 11,
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
    </div>
  );
};

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

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { resolvedTheme } = useTheme();
  const { zoom } = useViewport();
  const { setHoveredNode } = useStudioStore();

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
    if (doc) {
      doc.documentElement.className = document.documentElement.className;
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (!iframeHead) return;
    const styleTags = document.querySelectorAll(
      'style, link[rel="stylesheet"]',
    );
    styleTags.forEach((tag) => {
      iframeHead.appendChild(tag.cloneNode(true));
    });

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

  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = getIframeCoordinates(e);
    if (!coords || !iframeWindow) return;

    const el = iframeWindow.document.elementFromPoint(coords.x, coords.y);
    const node = el?.closest("[data-studio-node-id]");
    if (node) {
      const id = node.getAttribute("data-studio-node-id");
      setHoveredNode(id);
    } else {
      setHoveredNode(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const coords = getIframeCoordinates(e);
    if (!coords || !iframeWindow) return;

    const el = iframeWindow.document.elementFromPoint(coords.x, coords.y);
    const node = el?.closest("[data-studio-node-id]");
    if (node) {
      const id = node.getAttribute("data-studio-node-id");
      if (id) {
        const multi = e.shiftKey || e.metaKey || e.ctrlKey;
        useStudioStore.getState().toggleNodeSelection(id, multi);
      }
    } else {
      useStudioStore.getState().setSelectedNodes([]);
    }
  };

  const finalHeight = Math.max(contentHeight, defaultHeight);

  return (
    <div
      className="relative w-full transition-[height] duration-200"
      style={{ height: finalHeight }}
    >
      <iframe
        ref={iframeRef}
        onLoad={handleLoad}
        title={title}
        className="absolute inset-0 w-full h-full border-none bg-transparent"
        srcDoc="<!DOCTYPE html><html><head></head><body style='margin: 0; padding: 0; overflow: hidden; background: transparent;'></body></html>"
      >
        {iframeBody &&
          createPortal(
            <IframeContentObserver onHeightChange={setContentHeight}>
              {children}
            </IframeContentObserver>,
            iframeBody,
          )}
      </iframe>

      <div
        className="absolute inset-0 z-[9999] group-data-[tool=pointer]/canvas:cursor-default group-data-[tool=hand]/canvas:cursor-grab active:group-data-[tool=hand]/canvas:cursor-grabbing"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoveredNode(null)}
        onClick={handleClick}
      />

      {iframeWindow &&
        iframeBody &&
        createPortal(<CanvasOverlay iframeWindow={iframeWindow} />, iframeBody)}
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

  const { components, cms } = useBuilderContext();
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
            actions={{}}
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
      className={`relative rounded-xl shadow-2xl flex flex-col overflow-hidden transition-[box-shadow,border] duration-200 ${
        selected
          ? "ring-2 ring-primary ring-offset-4 ring-offset-background"
          : "ring-1 ring-outline-variant/30"
      }`}
      style={{ width, minHeight: height }}
    >
      <div className="h-8 bg-surface-container-high border-b border-outline-variant/30 flex items-center justify-center px-4 shrink-0">
        <Typography variant="label-small" className="font-mono opacity-60">
          {isIsolationMode ? `${componentId} Sandbox` : `${label} - ${width}px`}
        </Typography>
      </div>

      <div className="flex-1 w-full bg-background relative contain-paint nodrag group-data-[tool=pointer]/canvas:cursor-default group-data-[tool=hand]/canvas:cursor-grab">
        {contentToRender}
      </div>

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};
