import React from "react";
import { Badge } from "../../badge";
import type { RegistryComponent } from "../types";

export const BadgeConfig: RegistryComponent = {
  name: "Badge",
  category: "Elements",
  render: ({ children, variant, shape, ...props }) => (
    <Badge variant={variant} shape={shape} {...props}>
      {children || "Badge"}
    </Badge>
  ),
  controls: {
    children: {
      type: "text",
      label: "Label",
      defaultValue: "New",
      group: "Content",
      supportsCMS: true,
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Destructive", value: "destructive" },
        { label: "Outline", value: "outline" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
  },
};
