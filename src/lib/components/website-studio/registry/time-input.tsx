import React from "react";
import { TimeInput } from "../../date-input";
import { parseTime } from "@internationalized/date";
import type { RegistryComponent } from "../types";

export const TimeInputConfig: RegistryComponent = {
  name: "Time Input Field",
  category: "Forms",
  render: ({
    label,
    variant,
    shape,
    size,
    labelPlacement,
    isInvalid,
    disabled,
    granularity,
    hourCycle,
    defaultValueString,
    ...props
  }) => {
    let dv = undefined;
    try {
      if (defaultValueString) dv = parseTime(defaultValueString);
    } catch (e) {
      // Ignore parsing errors while typing
    }

    return (
      <div className="w-full" {...props}>
        <TimeInput
          className="w-full"
          label={label}
          variant={variant}
          shape={shape}
          size={size}
          labelPlacement={labelPlacement}
          isInvalid={isInvalid}
          isDisabled={disabled}
          defaultValue={dv}
          granularity={granularity}
          hourCycle={hourCycle}
        />
      </div>
    );
  },
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Meeting Time",
      group: "Content",
      supportsCMS: true,
    },
    defaultValueString: {
      type: "text",
      label: "Default Value (HH:MM)",
      defaultValue: "14:30",
      group: "Data",
      supportsCMS: true,
    },
    granularity: {
      type: "select",
      label: "Granularity",
      group: "Data",
      defaultValue: "minute",
      options: [
        { label: "Hour", value: "hour" },
        { label: "Minute", value: "minute" },
        { label: "Second", value: "second" },
      ],
    },
    hourCycle: {
      type: "select",
      label: "Hour Cycle",
      group: "Data",
      defaultValue: 12,
      options: [
        { label: "12-hour", value: 12 },
        { label: "24-hour", value: 24 },
      ],
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
