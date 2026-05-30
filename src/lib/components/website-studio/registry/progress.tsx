import React from "react";
import { LinearProgress } from "../../progress/linear-progress";
import { CircularProgress } from "../../progress/circular-progress";
import type { RegistryComponent } from "../types";

export const LinearProgressConfig: RegistryComponent = {
  name: "Linear Progress",
  category: "Feedback",
  render: ({ value, indeterminate, variant, ...props }) => (
    <div className="w-full" {...props}>
      <LinearProgress value={value} indeterminate={indeterminate} variant={variant} />
    </div>
  ),
  controls: {
    value: {
      type: "slider",
      label: "Progress Value (%)",
      defaultValue: 50,
      min: 0,
      max: 100,
      step: 1,
      group: "Data",
      hidden: (props) => props.indeterminate,
      supportsCMS: true,
    },
    indeterminate: {
      type: "boolean",
      label: "Indeterminate (Loading state)",
      defaultValue: false,
      group: "Behavior",
    },
    variant: {
      type: "select",
      label: "Visual Style",
      group: "Aesthetics",
      defaultValue: "standard",
      options: [
        { label: "Standard (Flat)", value: "standard" },
        { label: "Wavy (MD3)", value: "wavy" },
      ],
    },
  },
};

export const CircularProgressConfig: RegistryComponent = {
  name: "Circular Progress",
  category: "Feedback",
  render: ({ value, indeterminate, size, variant, ...props }) => (
    <div className="w-fit flex justify-center" {...props}>
      <CircularProgress
        value={value}
        indeterminate={indeterminate}
        size={size}
        variant={variant}
      />
    </div>
  ),
  controls: {
    value: {
      type: "slider",
      label: "Progress Value (%)",
      defaultValue: 65,
      min: 0,
      max: 100,
      step: 1,
      group: "Data",
      hidden: (props) => props.indeterminate,
      supportsCMS: true,
    },
    indeterminate: {
      type: "boolean",
      label: "Indeterminate (Loading state)",
      defaultValue: false,
      group: "Behavior",
    },
    variant: {
      type: "select",
      label: "Visual Style",
      group: "Aesthetics",
      defaultValue: "standard",
      options: [
        { label: "Standard (Ring)", value: "standard" },
        { label: "Wavy (MD3)", value: "wavy" },
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
        { label: "Extra Large", value: "xl" },
      ],
    },
  },
};
