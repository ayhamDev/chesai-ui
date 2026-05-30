import React from "react";
import { Kbd } from "../../kbd";
import type { RegistryComponent } from "../types";

export const KbdConfig: RegistryComponent = {
  name: "Keyboard Key (Kbd)",
  category: "Elements",
  render: ({ text, variant, size, shape, ...props }) => (
    <div className="w-fit inline-block" {...props}>
      <Kbd variant={variant} size={size} shape={shape}>
        {text || "⌘K"}
      </Kbd>
    </div>
  ),
  controls: {
    text: {
      type: "text",
      label: "Key Text",
      defaultValue: "⌘K",
      group: "Content",
      supportsCMS: true,
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "default",
      options: [
        { label: "Default (3D Physical Key)", value: "default" },
        { label: "Flat", value: "flat" },
        { label: "Outline", value: "outline" },
        { label: "Ghost", value: "ghost" },
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
