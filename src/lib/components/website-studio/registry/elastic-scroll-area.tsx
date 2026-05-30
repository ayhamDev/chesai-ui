import React from "react";
import { ElasticScrollArea } from "../../elastic-scroll-area";
import type { RegistryComponent } from "../types";

export const ElasticScrollAreaConfig: RegistryComponent = {
  name: "Elastic Scroll Area",
  category: "Layout",
  acceptsChildren: true,
  render: ({ children, orientation, scrollbarVisibility, dimmingEdges, elasticity, ...props }) => (
    <div className="w-full min-h-[150px] h-[300px] border border-dashed border-outline-variant/30" {...props}>
      <ElasticScrollArea
        orientation={orientation}
        scrollbarVisibility={scrollbarVisibility}
        dimmingEdges={dimmingEdges}
        elasticity={elasticity}
        className="h-full w-full"
      >
        <div className="p-4 w-full h-full min-h-max min-w-max">
          {children || <div className="p-4 opacity-50 text-sm">Drop scrollable content here...</div>}
        </div>
      </ElasticScrollArea>
    </div>
  ),
  controls: {
    orientation: {
      type: "select",
      label: "Scroll Orientation",
      group: "Layout",
      defaultValue: "vertical",
      options: [
        { label: "Vertical", value: "vertical" },
        { label: "Horizontal", value: "horizontal" },
      ],
    },
    elasticity: {
      type: "boolean",
      label: "Enable Elasticity (Overscroll Bounce)",
      group: "Behavior",
      defaultValue: true,
    },
    dimmingEdges: {
      type: "boolean",
      label: "Fade Out Scrolling Edges",
      group: "Aesthetics",
      defaultValue: false,
    },
    scrollbarVisibility: {
      type: "select",
      label: "Scrollbar Visibility",
      group: "Aesthetics",
      defaultValue: "auto",
      options: [
        { label: "Auto (Show on hover/scroll)", value: "auto" },
        { label: "Always Visible", value: "always" },
        { label: "Hidden", value: "hidden" },
      ],
    },
  },
};
