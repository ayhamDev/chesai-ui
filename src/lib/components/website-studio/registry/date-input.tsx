import React from "react";
import { DateInput } from "../../date-input";
import { parseDate } from "@internationalized/date";
import type { RegistryComponent } from "../types";

export const DateInputConfig: RegistryComponent = {
  name: "Date Input Field",
  category: "Forms",
  render: ({
    label,
    variant,
    shape,
    size,
    labelPlacement,
    isInvalid,
    disabled,
    defaultValueString,
    ...props
  }) => {
    let dv = undefined;
    try {
      if (defaultValueString) dv = parseDate(defaultValueString);
    } catch (e) {
      // Ignore parse errors from user typing halfway
    }

    return (
      <div className="w-full" {...props}>
        <DateInput
          label={label}
          variant={variant}
          shape={shape}
          size={size}
          labelPlacement={labelPlacement}
          isInvalid={isInvalid}
          isDisabled={disabled}
          defaultValue={dv}
        />
      </div>
    );
  },
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Birth Date",
      group: "Content",
      supportsCMS: true,
    },
    defaultValueString: {
      type: "text",
      label: "Default Value (YYYY-MM-DD)",
      defaultValue: "2024-04-04",
      group: "Data",
      supportsCMS: true,
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
    isInvalid: {
      type: "boolean",
      label: "Invalid State",
      group: "State",
      defaultValue: false,
    },
    disabled: {
      type: "boolean",
      label: "Disabled",
      group: "State",
      defaultValue: false,
    },
  },
};
