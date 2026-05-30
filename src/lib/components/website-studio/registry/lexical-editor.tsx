import React from "react";
import { LexicalEditor } from "../../lexical-editor";
import type { RegistryComponent } from "../types";

export const LexicalEditorConfig: RegistryComponent = {
  name: "Rich Text Editor (Lexical)",
  category: "Forms",
  render: ({ markdown, label, placeholder, description, variant, shape, shadow, readOnly, ...props }) => (
    <div className="w-full" {...props}>
      <LexicalEditor
        label={label}
        placeholder={placeholder}
        description={description}
        markdown={markdown}
        variant={variant}
        shape={shape}
        shadow={shadow}
        readOnly={readOnly}
      />
    </div>
  ),
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Document Content",
      group: "Content",
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
      defaultValue: "Start writing your rich text here...",
      group: "Content",
    },
    markdown: {
      type: "textarea",
      label: "Initial Markdown",
      defaultValue: "# Hello Lexical\n\nThis is a **Rich Text Editor** powered by Lexical.",
      group: "Data",
      supportsCMS: true,
    },
    description: {
      type: "text",
      label: "Helper Description",
      group: "Content",
    },
    readOnly: {
      type: "boolean",
      label: "Read Only Mode",
      defaultValue: false,
      group: "State",
      description: "Hides toolbar and prevents editing.",
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary (Surface Low)", value: "primary" },
        { label: "Secondary (Surface High)", value: "secondary" },
        { label: "Surface (Base)", value: "surface" },
        { label: "Ghost (Transparent)", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Heavy Round)", value: "full" },
        { label: "Minimal (Standard)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    shadow: {
      type: "select",
      label: "Shadow Elevation",
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
