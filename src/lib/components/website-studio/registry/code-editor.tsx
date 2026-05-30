import React from "react";
import { CodeEditor } from "../../code-editor";
import type { RegistryComponent } from "../types";

export const CodeEditorConfig: RegistryComponent = {
  name: "Code Block",
  category: "Media",
  render: ({ code, language, fileName, variant, shape, shadow, collapsible, ...props }) => (
    <div className="w-full" {...props}>
      <CodeEditor
        value={code}
        language={language}
        fileName={fileName}
        variant={variant}
        shape={shape}
        shadow={shadow}
        collapsible={collapsible}
        readOnly={true}
        height="auto"
        className="min-h-[150px]"
      />
    </div>
  ),
  controls: {
    code: {
      type: "textarea",
      label: "Code Content",
      defaultValue: "export const HelloWorld = () => {\n  return <div>Hello</div>;\n};",
      group: "Content",
      supportsCMS: true,
    },
    language: {
      type: "select",
      label: "Language Syntax",
      group: "Content",
      defaultValue: "typescript",
      options: [
        { label: "TypeScript / TSX", value: "typescript" },
        { label: "JavaScript / JSX", value: "javascript" },
        { label: "HTML", value: "html" },
        { label: "CSS", value: "css" },
        { label: "JSON", value: "json" },
        { label: "Python", value: "python" },
      ],
    },
    fileName: {
      type: "text",
      label: "File Name (Tab Title)",
      defaultValue: "App.tsx",
      group: "Content",
    },
    collapsible: {
      type: "boolean",
      label: "Collapsible Window",
      group: "Behavior",
      defaultValue: false,
    },
    variant: {
      type: "select",
      label: "Editor Theme Variant",
      group: "Aesthetics",
      defaultValue: "secondary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Surface", value: "surface" },
        { label: "Ghost", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Border Shape",
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
