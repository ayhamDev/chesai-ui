import React from "react";
import * as Icons from "lucide-react";
import { Combobox } from "../../combobox";
import type { RegistryComponent } from "../types";

export const ComboboxConfig: RegistryComponent = {
  name: "Combobox (Searchable)",
  category: "Forms",
  render: ({
    optionsString,
    startContent,
    ...props
  }) => {
    const parsedOptions = (optionsString || "")
      .split(",")
      .map((opt: string) => {
        const clean = opt.trim();
        return { label: clean, value: clean.toLowerCase().replace(/\s+/g, "-") };
      })
      .filter((opt: { label: string; value: string }) => opt.label !== "");

    const StartIcon = startContent ? (Icons as any)[startContent] : null;

    return (
      <div className="w-full">
        <Combobox
          {...props}
          options={parsedOptions.length > 0 ? parsedOptions : [{ label: "Type to search...", value: "search" }]}
          startContent={StartIcon ? <StartIcon className="w-4 h-4 opacity-50" /> : undefined}
        />
      </div>
    );
  },
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Framework",
      group: "Content",
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
      defaultValue: "Select a framework...",
      group: "Content",
    },
    searchPlaceholder: {
      type: "text",
      label: "Search Box Placeholder",
      defaultValue: "Search frameworks...",
      group: "Content",
    },
    description: {
      type: "text",
      label: "Helper Description",
      group: "Content",
    },
    optionsString: {
      type: "textarea",
      label: "Options (Comma Separated)",
      description: "e.g., React, Vue, Angular, Svelte",
      defaultValue: "React, Vue, Angular, Svelte",
      group: "Data",
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
    mobileLayout: {
      type: "select",
      label: "Mobile Expansion Style",
      group: "Layout",
      defaultValue: "bottom-sheet",
      options: [
        { label: "Bottom Sheet", value: "bottom-sheet" },
        { label: "Dialog (Centered)", value: "dialog" },
        { label: "Default (Dropdown)", value: "default" },
      ],
    },
    startContent: {
      type: "text",
      label: "Start Icon (Lucide)",
      group: "Icons",
    },
    isClearable: {
      type: "boolean",
      label: "Is Clearable",
      group: "Behavior",
      defaultValue: true,
    },
  },
};
