import React from "react";
import { RenderNode } from "./RenderNode";

export const Canvas = () => {
  return (
    // We isolate the canvas area. In a full production app, you might
    // put this inside an <iframe> to perfectly isolate CSS, but for now,
    // a standard div is easier to wire up for drag-and-drop later.
    <div className="w-full h-full bg-surface-container-lowest overflow-auto relative">
      <RenderNode id="ROOT" />
    </div>
  );
};
