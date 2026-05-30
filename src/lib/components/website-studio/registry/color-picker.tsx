import React from "react";
import { ColorPicker } from "../../color-picker";
import type { RegistryComponent } from "../types";

export const ColorPickerConfig: RegistryComponent = {
  name: "Color Picker",
  category: "Forms",
  render: (props) => (
    <div className="w-full">
      <ColorPicker {...props} />
    </div>
  ),
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Brand Color",
      group: "Content",
      supportsCMS: true,
    },
    description: {
      type: "text",
      label: "Helper Description",
      group: "Content",
    },
    value: {
      type: "color",
      label: "Default Color",
      defaultValue: "#8F4C38",
      group: "Data",
      supportsCMS: true,
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "flat",
      options: [
        { label: "Flat (Filled)", value: "flat" },
        { label: "Bordered", value: "bordered" },
        { label: "Faded", value: "faded" },
        { label: "Underlined", value: "underlined" },
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
    labelPlacement: {
      type: "select",
      label: "Label Placement",
      group: "Layout",
      defaultValue: "inside",
      options: [
        { label: "Inside", value: "inside" },
        { label: "Outside (Top)", value: "outside" },
        { label: "Outside (Left)", value: "outside-left" },
      ],
    },
    disabled: {
      type: "boolean",
      label: "Disabled",
      group: "State",
      defaultValue: false,
    },
    isInvalid: {
      type: "boolean",
      label: "Invalid State (Error)",
      group: "State",
      defaultValue: false,
    },
  },
};
