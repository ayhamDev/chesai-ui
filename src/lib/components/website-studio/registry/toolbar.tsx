import React from "react";
import { Toolbar } from "../../toolbar";
import type { RegistryComponent } from "../types";

export const ToolbarConfig: RegistryComponent = {
  name: "Toolbar",
  category: "Navigation",
  acceptsChildren: true,
  render: ({ orientation, variant, shape, shadow, size, padding, gap, children, ...props }) => (
    <div className="w-fit" {...props}>
      <Toolbar
        orientation={orientation}
        variant={variant}
        shape={shape}
        shadow={shadow}
        size={size}
        padding={padding}
        gap={gap}
      >
        {children || (
          <div className="p-2 text-sm opacity-50 px-4">
            Drop IconButtons / Buttons here
          </div>
        )}
      </Toolbar>
    </div>
  ),
  controls: {
    orientation: {
      type: "select",
      label: "Orientation",
      group: "Layout",
      defaultValue: "horizontal",
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
    },
    variant: {
      type: "select",
      label: "Background Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary (Surface Low)", value: "primary" },
        { label: "Secondary (Surface High)", value: "secondary" },
        { label: "Ghost (Transparent)", value: "ghost" },
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
    size: {
      type: "select",
      label: "Size",
      group: "Layout",
      defaultValue: "md",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    padding: {
      type: "select",
      label: "Padding",
      group: "Layout",
      defaultValue: "sm",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    gap: {
      type: "select",
      label: "Item Gap",
      group: "Layout",
      defaultValue: "sm",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    shadow: {
      type: "select",
      label: "Shadow",
      group: "Aesthetics",
      defaultValue: "none",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
  },
};
