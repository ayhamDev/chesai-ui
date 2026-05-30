import React from "react";
import { MultiSelect } from "../../multi-select";
import type { RegistryComponent } from "../types";

export const MultiSelectConfig: RegistryComponent = {
  name: "Multi Select",
  category: "Forms",
  render: ({
    optionsString,
    label,
    placeholder,
    description,
    variant,
    shape,
    size,
    labelPlacement,
    maxCount,
    ...props
  }) => {
    const parsedOptions = (optionsString || "")
      .split(",")
      .map((opt: string) => {
        const clean = opt.trim();
        return { label: clean, value: clean.toLowerCase().replace(/\s+/g, "-") };
      })
      .filter((opt: { label: string; value: string }) => opt.label !== "");

    return (
      <div className="w-full" {...props}>
        <MultiSelect
          label={label}
          placeholder={placeholder}
          description={description}
          variant={variant}
          shape={shape}
          size={size}
          labelPlacement={labelPlacement}
          maxCount={maxCount}
          options={parsedOptions.length > 0 ? parsedOptions : [{ label: "Option 1", value: "opt1" }]}
        />
      </div>
    );
  },
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Select Frameworks",
      group: "Content",
      supportsCMS: true,
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
      defaultValue: "Choose multiple...",
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
      description: "e.g., React, Vue, Svelte, Angular",
      defaultValue: "React, Vue, Svelte, Angular",
      group: "Data",
    },
    maxCount: {
      type: "number",
      label: "Max Visible Chips",
      description: "Remaining selections will show as '+X more'",
      defaultValue: 3,
      min: 1,
      max: 20,
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
  },
};
