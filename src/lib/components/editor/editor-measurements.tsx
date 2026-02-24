"use client";

import React, { useEffect, useState } from "react";
import { useEditor } from "./editor-context";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  b: number;
}

export const EditorMeasurements = () => {
  const { selectedIds, hoveredId, getItemRect, camera, isAltPressed, mode } =
    useEditor();
  const [guides, setGuides] = useState<React.ReactNode[]>([]);
  const [tick, setTick] = useState(0);

  // Force re-render continuously while Alt is held so moving the mouse updates lines live
  useEffect(() => {
    if (!isAltPressed) return;
    const handleMove = () => setTick((t) => t + 1);
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isAltPressed]);

  useEffect(() => {
    // Only show guides if EXACTLY 1 item is selected and Alt is pressed
    const activeId = Array.from(selectedIds)[0];
    if (!activeId || !isAltPressed || selectedIds.size !== 1) {
      setGuides([]);
      return;
    }

    const sourceRectRaw = getItemRect(activeId);
    const world = document.getElementById("editor-world");
    const paper = document.getElementById("editor-paper");

    if (!sourceRectRaw || !world) {
      setGuides([]);
      return;
    }

    const worldRect = world.getBoundingClientRect();
    const zoom = camera.z;

    // Convert Screen DOMRect to Scaled Canvas Space
    const toCanvasCoords = (domRect: DOMRect): Rect => {
      const x = (domRect.left - worldRect.left) / zoom;
      const y = (domRect.top - worldRect.top) / zoom;
      const w = domRect.width / zoom;
      const h = domRect.height / zoom;
      return { x, y, w, h, r: x + w, b: y + h };
    };

    const s = toCanvasCoords(sourceRectRaw);
    let t: Rect | null = null;
    let isTargetPaper = false;

    // Decide if we are measuring to a hovered item OR the paper artboard
    if (hoveredId && hoveredId !== activeId) {
      const targetRectRaw = getItemRect(hoveredId);
      if (targetRectRaw) t = toCanvasCoords(targetRectRaw);
    } else if (mode === "paper" && paper) {
      const paperRectRaw = paper.getBoundingClientRect();
      t = toCanvasCoords(paperRectRaw);
      isTargetPaper = true;
    }

    if (!t) {
      setGuides([]);
      return;
    }

    const newGuides: React.ReactNode[] = [];
    const color = "#f24e1e"; // Figma Red
    const strokeWidth = Math.max(1.5 / zoom, 1);
    const fontSize = Math.max(11 / zoom, 10);
    const cap = Math.max(4 / zoom, 3);

    const drawLine = (
      key: string,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      val: number,
    ) => {
      const absVal = Math.round(Math.abs(val));
      if (absVal === 0) return; // Don't draw 0 distance lines

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      const bgWidth = (String(absVal).length * 8 + 12) / zoom;
      const bgHeight = 18 / zoom;

      newGuides.push(
        <g key={key}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* End Caps */}
          <line
            x1={x1 === x2 ? x1 - cap : x1}
            y1={y1 === y2 ? y1 - cap : y1}
            x2={x1 === x2 ? x1 + cap : x1}
            y2={y1 === y2 ? y1 + cap : y1}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <line
            x1={x1 === x2 ? x2 - cap : x2}
            y1={y1 === y2 ? y2 - cap : y2}
            x2={x1 === x2 ? x2 + cap : x2}
            y2={y1 === y2 ? y2 + cap : y2}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Label */}
          <rect
            x={midX - bgWidth / 2}
            y={midY - bgHeight / 2}
            width={bgWidth}
            height={bgHeight}
            rx={4 / zoom}
            fill={color}
          />
          <text
            x={midX}
            y={midY}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={`${fontSize}px`}
            fontWeight="600"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {absVal}
          </text>
        </g>,
      );
    };

    if (isTargetPaper) {
      // Draw distances from inside the paper
      drawLine("p-left", t.x, s.y + s.h / 2, s.x, s.y + s.h / 2, s.x - t.x);
      drawLine("p-right", s.r, s.y + s.h / 2, t.r, s.y + s.h / 2, t.r - s.r);
      drawLine("p-top", s.x + s.w / 2, t.y, s.x + s.w / 2, s.y, s.y - t.y);
      drawLine("p-bottom", s.x + s.w / 2, s.b, s.x + s.w / 2, t.b, t.b - s.b);
    } else {
      // Draw gaps between elements
      if (s.r < t.x)
        drawLine("g-right", s.r, s.y + s.h / 2, t.x, s.y + s.h / 2, t.x - s.r);
      else if (s.x > t.r)
        drawLine("g-left", t.r, s.y + s.h / 2, s.x, s.y + s.h / 2, s.x - t.r);

      if (s.b < t.y)
        drawLine("g-bottom", s.x + s.w / 2, s.b, s.x + s.w / 2, t.y, t.y - s.b);
      else if (s.y > t.b)
        drawLine("g-top", s.x + s.w / 2, t.b, s.x + s.w / 2, s.y, s.y - t.b);
    }

    setGuides(newGuides);
  }, [selectedIds, hoveredId, camera, isAltPressed, mode, getItemRect, tick]);

  if (guides.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-[10000] overflow-visible"
      style={{ width: "100%", height: "100%" }}
    >
      {guides}
    </svg>
  );
};
