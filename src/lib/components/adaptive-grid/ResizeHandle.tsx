"use client";

import React, { useRef, useEffect } from "react";

interface ResizeHandleProps {
  onResizeStart: () => void;
  onResizeMove: (deltaW: number, deltaH: number) => void;
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
  // Keep live references to callbacks to prevent stale React closures inside pointer listeners
  const callbacksRef = useRef({ onResizeStart, onResizeMove, onResizeEnd });
  useEffect(() => {
    callbacksRef.current = { onResizeStart, onResizeMove, onResizeEnd };
  }, [onResizeStart, onResizeMove, onResizeEnd]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    callbacksRef.current.onResizeStart();
    const startX = e.clientX;
    const startY = e.clientY;

    const cellTotalW = colWidth + gap;
    const cellTotalH = rowHeight + gap;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const deltaW = Math.round(deltaX / cellTotalW);
      const deltaH = Math.round(deltaY / cellTotalH);

      callbacksRef.current.onResizeMove(deltaW, deltaH);
    };

    const onPointerUp = () => {
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      callbacksRef.current.onResizeEnd();
    };

    document.body.style.cursor = "nwse-resize";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className="absolute bottom-0 right-0 w-6 h-6 flex items-end justify-end p-1.5 cursor-nwse-resize z-20 opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant/50 hover:text-primary rounded-br-[inherit]"
    >
      {/* Minimalist Corner Edge Lines */}
      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 overflow-visible">
        <path
          d="M9 1L1 9M9 5L5 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
