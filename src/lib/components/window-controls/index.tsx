"use client";

import { clsx } from "clsx";
import { Minus, Square, X } from "lucide-react";
import React from "react";

export const WindowControls = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // Buttons must opt-out of the drag region to be clickable in Electron/Tauri
  <div
    ref={ref}
    data-tauri-drag-region="false"
    className={clsx("flex items-center text-on-surface", className)}
    {...props}
  >
    <button
      type="button"
      className="flex h-8 w-9 items-center justify-center rounded-md transition-colors hover:bg-on-surface/10"
      aria-label="Minimize"
    >
      <Minus className="h-4 w-4" />
    </button>
    <button
      type="button"
      className="flex h-8 w-9 items-center justify-center rounded-md transition-colors hover:bg-on-surface/10"
      aria-label="Maximize"
    >
      <Square className="h-3.5 w-3.5" />
    </button>
    <button
      type="button"
      className="flex h-8 w-9 items-center justify-center rounded-md transition-colors hover:bg-error hover:text-on-error"
      aria-label="Close"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
));
WindowControls.displayName = "WindowControls";
