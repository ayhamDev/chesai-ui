import React from "react";
import { TooltipProvider, TooltipTrigger, Tooltip } from "../../tooltip";
import type { RegistryComponent } from "../types";

export const TooltipConfig: RegistryComponent = {
  name: "Tooltip Wrapper",
  category: "Feedback",
  acceptsChildren: true,
  render: ({ children, text, placement, variant, size, shape, ...props }) => (
    <div className="w-fit inline-block" {...props}>
      <TooltipProvider placement={placement}>
        <TooltipTrigger asChild>
          <div className="w-fit inline-block">
            {children || (
              <div className="px-4 py-2 border border-dashed border-outline-variant/50 rounded-lg text-sm opacity-70">
                Hover over me (Drop target here)
              </div>
            )}
          </div>
        </TooltipTrigger>
        <Tooltip variant={variant} size={size} shape={shape}>
          {text}
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
  controls: {
    text: {
      type: "text",
      label: "Tooltip Text",
      group: "Content",
      defaultValue: "This is a helpful tooltip!",
      supportsCMS: true,
    },
    placement: {
      type: "select",
      label: "Placement",
      group: "Layout",
      defaultValue: "top",
      options: [
        { label: "Top", value: "top" },
        { label: "Bottom", value: "bottom" },
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary (Inverse Surface)", value: "primary" },
        { label: "Secondary (Surface Highest)", value: "secondary" },
      ],
    },
    size: {
      type: "select",
      label: "Size",
      group: "Aesthetics",
      defaultValue: "md",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
  },
};
