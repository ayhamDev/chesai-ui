import React from "react";
import { MediumTextEditor } from "../../medium-text-editor";
import type { RegistryComponent } from "../types";

export const MediumTextEditorConfig: RegistryComponent = {
  name: "Block Editor (Editor.js)",
  category: "Forms",
  render: ({ placeholder, minHeight, readOnly, ...props }) => (
    <div className="w-full bg-surface border border-outline-variant/30 rounded-2xl p-6 shadow-sm" {...props}>
      <MediumTextEditor
        placeholder={placeholder}
        minHeight={minHeight}
        readOnly={readOnly}
      />
    </div>
  ),
  controls: {
    placeholder: {
      type: "text",
      label: "Placeholder Text",
      defaultValue: "Start writing your story...",
      group: "Content",
    },
    minHeight: {
      type: "number",
      label: "Minimum Height (px)",
      defaultValue: 300,
      min: 100,
      max: 1000,
      step: 10,
      group: "Layout",
    },
    readOnly: {
      type: "boolean",
      label: "Read Only Mode",
      defaultValue: false,
      description: "Locks the editor from modifications.",
      group: "Behavior",
    },
  },
};
