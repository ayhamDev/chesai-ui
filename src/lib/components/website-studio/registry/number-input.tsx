import React from "react";
import * as Icons from "lucide-react";
import { NumberInput } from "../../number-input";
import type { RegistryComponent } from "../types";

export const NumberInputConfig: RegistryComponent = {
  name: "Number Input",
  category: "Forms",
  render: ({ startContent, endContent, ...props }) => {
    const StartIcon = startContent ? (Icons as any)[startContent] : null;
    const EndIcon = endContent ? (Icons as any)[endContent] : null;

    return (
      <div className="w-full">
        <NumberInput
          {...props}
          startContent={StartIcon ? <StartIcon className="w-4 h-4 opacity-50" /> : undefined}
          endContent={EndIcon ? <EndIcon className="w-4 h-4 opacity-50" /> : undefined}
        />
      </div>
    );
  },
  controls: {
    label: {
      type: "text",
      label: "Label",
      defaultValue: "Quantity",
      group: "Content",
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
      defaultValue: "0",
      group: "Content",
    },
    defaultValue: {
      type: "number",
      label: "Default Value",
      defaultValue: 1,
      group: "Data",
      supportsCMS: true,
    },
    min: {
      type: "number",
      label: "Minimum",
      defaultValue: 0,
      group: "Data",
    },
    max: {
      type: "number",
      label: "Maximum",
      defaultValue: 100,
      group: "Data",
    },
    step: {
      type: "number",
      label: "Step",
      defaultValue: 1,
      group: "Data",
    },
    allowFloat: {
      type: "boolean",
      label: "Allow Decimals (Float)",
      defaultValue: false,
      group: "Data",
    },
    hideStepper: {
      type: "boolean",
      label: "Hide Up/Down Stepper",
      defaultValue: false,
      group: "Aesthetics",
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
    startContent: {
      type: "text",
      label: "Start Icon (Lucide)",
      description: "e.g., DollarSign, Hash",
      group: "Icons",
    },
  },
};
