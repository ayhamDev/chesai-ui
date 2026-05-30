import React from "react";
import { Taskbar } from "../../taskbar";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const TaskbarConfig: RegistryComponent = {
  name: "Desktop Taskbar",
  category: "Navigation",
  render: ({ title, variant, size, bordered, ...props }) => {
    return (
      <div className="w-full relative shadow-2xl rounded-t-xl overflow-hidden border border-outline-variant/50" {...props}>
        <Taskbar
          variant={variant}
          size={size}
          bordered={bordered}
          centerAdornment={<Typography variant="label-medium" className="font-bold">{title}</Typography>}
          onClose={() => console.log("Close clicked")}
          onMaximize={() => console.log("Maximize clicked")}
          onMinimize={() => console.log("Minimize clicked")}
        />
        <div className="h-48 bg-surface-container-low w-full flex items-center justify-center opacity-30 text-xs">
          App Window Area
        </div>
      </div>
    );
  },
  controls: {
    title: {
      type: "text",
      label: "App Title",
      defaultValue: "My Application",
      group: "Content",
      supportsCMS: true,
    },
    variant: {
      type: "select",
      label: "Background Variant",
      group: "Aesthetics",
      defaultValue: "transparent",
      options: [
        { label: "Transparent", value: "transparent" },
        { label: "Card (Solid)", value: "card" },
        { label: "Secondary (Darker)", value: "secondary" },
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
    bordered: {
      type: "boolean",
      label: "Bottom Border",
      group: "Aesthetics",
      defaultValue: false,
    },
  },
};
