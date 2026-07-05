"use client";

import React, { useRef, useEffect } from "react";
import { ResizeDirection } from "./types";

interface ResizeHandleProps {
  onResizeStart: () => void;
  onResizeMove: (direction: ResizeDirection, deltaX: number, deltaY: number) => void;
  onResizeEnd: () => void;
  colWidth: number;
  rowHeight: number;
  gap: number;
}

export const ResizeHandle = ({
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  colWidth,
  rowHeight,
  gap,
}: ResizeHandleProps) => {
  const callbacksRef = useRef({ onResizeStart, onResizeMove, onResizeEnd });

  useEffect(() => {
    callbacksRef.current = { onResizeStart, onResizeMove, onResizeEnd };
  }, [onResizeStart, onResizeMove, onResizeEnd]);

  const handlePointerDown = (e: React.PointerEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();

    callbacksRef.current.onResizeStart();
    const startX = e.clientX;
    const startY = e.clientY;

    const cellTotalW = colWidth + gap;
    const cellTotalH = rowHeight + gap;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = Math.round((moveEvent.clientX - startX) / cellTotalW);
      const deltaY = Math.round((moveEvent.clientY - startY) / cellTotalH);

      callbacksRef.current.onResizeMove(direction, deltaX, deltaY);
    };

    const onPointerUp = () => {
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      callbacksRef.current.onResizeEnd();
    };

    const cursors: Record<string, string> = {
      t: "ns-resize", b: "ns-resize", l: "ew-resize", r: "ew-resize",
      tl: "nwse-resize", br: "nwse-resize", tr: "nesw-resize", bl: "nesw-resize"
    };
    document.body.style.cursor = cursors[direction];

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <>
      <div onPointerDown={(e) => handlePointerDown(e, "t")} className="absolute top-0 left-2 right-2 h-2 cursor-ns-resize z-20" />
      <div onPointerDown={(e) => handlePointerDown(e, "b")} className="absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize z-20" />
      <div onPointerDown={(e) => handlePointerDown(e, "l")} className="absolute left-0 top-2 bottom-2 w-2 cursor-ew-resize z-20" />
      <div onPointerDown={(e) => handlePointerDown(e, "r")} className="absolute right-0 top-2 bottom-2 w-2 cursor-ew-resize z-20" />

      <div onPointerDown={(e) => handlePointerDown(e, "tl")} className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-30" />
      <div onPointerDown={(e) => handlePointerDown(e, "tr")} className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-30" />
      <div onPointerDown={(e) => handlePointerDown(e, "bl")} className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-30" />

      <div
        onPointerDown={(e) => handlePointerDown(e, "br")}
        className="absolute bottom-0 right-0 w-5 h-5 flex items-end justify-end p-1 cursor-nwse-resize z-30 opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant/40 hover:text-primary rounded-br-[inherit]"
      >
        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 overflow-visible pointer-events-none">
          <path d="M9 1L1 9M9 5L5 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </>
  );
};
