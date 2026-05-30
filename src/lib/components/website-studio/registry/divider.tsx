import React from "react";
import { Divider } from "../../divider";
import type { RegistryComponent } from "../types";

export const DividerConfig: RegistryComponent = {
  name: "Divider",
  category: "Layout",
  render: ({ text, ...props }) => (
    <div className="w-full py-2">
      <Divider {...props}>{text}</Divider>
    </div>
  ),
  controls: {
    text: {
      type: "text",
      label: "Center Text (Optional)",
      group: "Content",
      supportsCMS: true,
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "regular",
      options: [
        { label: "Regular Line", value: "regular" },
        { label: "Wavy Pattern", value: "wavy" },
      ],
    },
    variant: {
      type: "select",
      label: "Line Style",
      group: "Aesthetics",
      defaultValue: "solid",
      hidden: (props) => props.shape === "wavy",
      options: [
        { label: "Solid", value: "solid" },
        { label: "Dashed", value: "dashed" },
        { label: "Dotted", value: "dotted" },
      ],
    },
    size: {
      type: "select",
      label: "Thickness",
      group: "Aesthetics",
      defaultValue: "sm",
      options: [
        { label: "Small (1px)", value: "sm" },
        { label: "Medium (2px)", value: "md" },
        { label: "Large (4px)", value: "lg" },
      ],
    },
    waveSize: {
      type: "select",
      label: "Wave Amplitude",
      group: "Aesthetics",
      defaultValue: "md",
      hidden: (props) => props.shape !== "wavy",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    color: {
      type: "select",
      label: "Color",
      group: "Aesthetics",
      defaultValue: "default",
      options: [
        { label: "Default", value: "default" },
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "Error", value: "error" },
      ],
    },
    textAlign: {
      type: "select",
      label: "Text Alignment",
      group: "Layout",
      defaultValue: "center",
      hidden: (props) => !props.text,
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
      ],
    },
  },
};
