import React from "react";
import { TimePicker } from "../../time-picker";
import type { RegistryComponent } from "../types";

export const TimePickerConfig: RegistryComponent = {
  name: "Time Picker",
  category: "Forms",
  render: (props) => (
    <div className="w-full">
      <TimePicker {...props} />
    </div>
  ),
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Start Time",
      group: "Content",
      supportsCMS: true,
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
      defaultValue: "Select time...",
      group: "Content",
    },
    variant: {
      type: "select",
      label: "Picker Expansion Style",
      group: "Behavior",
      defaultValue: "docked",
      options: [
        { label: "Docked (Dropdown)", value: "docked" },
        { label: "Modal (Dialog)", value: "modal" },
      ],
    },
    inputVariant: {
      type: "select",
      label: "Input Visual Variant",
      group: "Aesthetics",
      defaultValue: "filled",
      options: [
        { label: "Filled", value: "filled" },
        { label: "Filled Inverted", value: "filled-inverted" },
        { label: "Outlined", value: "outlined" },
        { label: "Outlined Inverted", value: "outlined-inverted" },
        { label: "Underlined", value: "underlined" },
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
      label: "Input Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    disabled: {
      type: "boolean",
      label: "Disabled",
      group: "State",
      defaultValue: false,
    },
  },
};
