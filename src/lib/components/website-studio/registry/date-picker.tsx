import React from "react";
import { DatePicker } from "../../date-picker/date-picker";
import type { RegistryComponent } from "../types";

export const DatePickerConfig: RegistryComponent = {
  name: "Date Picker",
  category: "Forms",
  render: (props) => (
    <div className="w-full">
      <DatePicker {...props} />
    </div>
  ),
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Event Date",
      group: "Content",
      supportsCMS: true,
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
      defaultValue: "Select a date...",
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
        { label: "Fullscreen (Mobile optimized)", value: "fullscreen" },
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
    itemShape: {
      type: "select",
      label: "Calendar Day Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Circle", value: "full" },
        { label: "Rounded Square", value: "minimal" },
        { label: "Sharp Square", value: "sharp" },
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
