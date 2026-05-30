import React from "react";
import { Textarea } from "../../textarea";
import type { RegistryComponent } from "../types";

export const TextareaConfig: RegistryComponent = {
  name: "Textarea",
  category: "Forms",
  render: (props) => (
    <div className="w-full">
      <Textarea {...props} />
    </div>
  ),
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Message",
      group: "Content",
      supportsCMS: true,
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
      defaultValue: "Type your message here...",
      group: "Content",
      supportsCMS: true,
    },
    description: {
      type: "text",
      label: "Helper Description",
      group: "Content",
      supportsCMS: true,
    },
    minRows: {
      type: "number",
      label: "Minimum Rows",
      group: "Layout",
      defaultValue: 3,
      min: 1,
      max: 20,
    },
    maxRows: {
      type: "number",
      label: "Maximum Rows (Auto-grow limit)",
      group: "Layout",
      defaultValue: 8,
      min: 2,
      max: 50,
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "filled",
      options: [
        { label: "Filled", value: "filled" },
        { label: "Filled Inverted", value: "filled-inverted" },
        { label: "Outlined", value: "outlined" },
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
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill-ish)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    labelPlacement: {
      type: "select",
      label: "Label Placement",
      group: "Aesthetics",
      defaultValue: "inside",
      options: [
        { label: "Inside", value: "inside" },
        { label: "Outside (Top)", value: "outside" },
      ],
    },
    isInvalid: {
      type: "boolean",
      label: "Invalid State (Error)",
      group: "State",
      defaultValue: false,
    },
    errorMessage: {
      type: "text",
      label: "Error Message",
      group: "State",
      hidden: (props) => !props.isInvalid,
    },
    disabled: {
      type: "boolean",
      label: "Disabled",
      group: "State",
      defaultValue: false,
    },
  },
};
