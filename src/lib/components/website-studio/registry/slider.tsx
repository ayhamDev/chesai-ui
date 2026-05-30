import React from "react";
import * as Icons from "lucide-react";
import { Slider } from "../../slider";
import type { RegistryComponent } from "../types";

export const SliderConfig: RegistryComponent = {
  name: "Slider",
  category: "Forms",
  render: ({
    min,
    max,
    step,
    defaultValue,
    visual,
    variant,
    color,
    shape,
    size,
    withLabel,
    withTicks,
    startIcon,
    endIcon,
    ...props
  }) => {
    const StartIconComponent = startIcon ? (Icons as any)[startIcon] : null;
    const EndIconComponent = endIcon ? (Icons as any)[endIcon] : null;

    const parsedDefault = defaultValue ? [Number(defaultValue)] : [50];

    return (
      <div className="w-full px-2 py-4" {...props}>
        <Slider
          min={min}
          max={max}
          step={step}
          defaultValue={parsedDefault}
          visual={visual}
          variant={variant}
          color={color}
          shape={shape}
          size={size}
          withLabel={withLabel}
          withTicks={withTicks}
          startIcon={StartIconComponent ? <StartIconComponent size={20} /> : undefined}
          endIcon={EndIconComponent ? <EndIconComponent size={20} /> : undefined}
        />
      </div>
    );
  },
  controls: {
    defaultValue: {
      type: "number",
      label: "Default Value",
      group: "Data",
      defaultValue: 50,
      supportsCMS: true,
    },
    min: {
      type: "number",
      label: "Minimum Value",
      group: "Data",
      defaultValue: 0,
    },
    max: {
      type: "number",
      label: "Maximum Value",
      group: "Data",
      defaultValue: 100,
    },
    step: {
      type: "number",
      label: "Step Size",
      group: "Data",
      defaultValue: 1,
    },
    visual: {
      type: "select",
      label: "Visual Style",
      group: "Aesthetics",
      defaultValue: "bar",
      options: [
        { label: "Thick Bar", value: "bar" },
        { label: "Thin Line", value: "line" },
      ],
    },
    variant: {
      type: "select",
      label: "Behavior Variant",
      group: "Behavior",
      defaultValue: "standard",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Centered (Zero in middle)", value: "centered" },
      ],
    },
    color: {
      type: "select",
      label: "Color",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "Error", value: "error" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    size: {
      type: "select",
      label: "Size (Bar Only)",
      group: "Aesthetics",
      defaultValue: "md",
      hidden: (props) => props.visual === "line",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    withLabel: {
      type: "boolean",
      label: "Show Popover Label",
      group: "Features",
      defaultValue: false,
    },
    withTicks: {
      type: "boolean",
      label: "Show Step Ticks",
      group: "Features",
      defaultValue: false,
    },
    startIcon: {
      type: "text",
      label: "Start Icon (Lucide)",
      group: "Icons",
    },
    endIcon: {
      type: "text",
      label: "End Icon (Lucide)",
      group: "Icons",
    },
  },
};
