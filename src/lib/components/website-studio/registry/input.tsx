import React from "react";
import * as Icons from "lucide-react";
import { Input } from "../../input";
import type { RegistryComponent } from "../types";

export const InputConfig: RegistryComponent = {
  name: "Input",
  category: "Forms",
  render: ({ startContent, endContent, ...props }) => {
    const StartIcon = startContent ? (Icons as any)[startContent] : null;
    const EndIcon = endContent ? (Icons as any)[endContent] : null;

    return (
      <div className="w-full">
        <Input
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
      defaultValue: "Email Address",
      group: "Content",
      supportsCMS: true,
    },
    placeholder: {
      type: "text",
      label: "Placeholder",
      defaultValue: "you@example.com",
      group: "Content",
      supportsCMS: true,
    },
    description: {
      type: "text",
      label: "Helper Description",
      group: "Content",
      supportsCMS: true,
    },
    defaultValue: {
      type: "text",
      label: "Default Value",
      group: "Content",
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
      group: "Aesthetics",
      defaultValue: "inside",
      options: [
        { label: "Inside", value: "inside" },
        { label: "Outside (Top)", value: "outside" },
        { label: "Outside (Left)", value: "outside-left" },
      ],
    },
    startContent: {
      type: "text",
      label: "Start Icon (Lucide)",
      group: "Icons",
    },
    endContent: {
      type: "text",
      label: "End Icon (Lucide)",
      group: "Icons",
    },
    isClearable: {
      type: "boolean",
      label: "Is Clearable",
      group: "Behavior",
      defaultValue: false,
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
