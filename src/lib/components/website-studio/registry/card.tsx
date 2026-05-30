import React from "react";
import { Card } from "../../card";
import type { RegistryComponent } from "../types";

export const CardConfig: RegistryComponent = {
  name: "Card",
  category: "Layout",
  acceptsChildren: true,
  render: ({ children, ...props }) => (
    <Card {...props} className={`w-full min-h-[50px] ${props.className || ""}`}>
      {children}
    </Card>
  ),
  controls: {
    variant: {
      type: "select",
      label: "Surface Variant",
      group: "Aesthetics",
      defaultValue: "surface-container",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "High Contrast", value: "high-contrast" },
        { label: "Surface", value: "surface" },
        {
          label: "Surface Container Lowest",
          value: "surface-container-lowest",
        },
        { label: "Surface Container Low", value: "surface-container-low" },
        { label: "Surface Container", value: "surface-container" },
        { label: "Surface Container High", value: "surface-container-high" },
        {
          label: "Surface Container Highest",
          value: "surface-container-highest",
        },
        { label: "Ghost", value: "ghost" },
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
    padding: {
      type: "select",
      label: "Padding",
      group: "Aesthetics",
      defaultValue: "md",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    elevation: {
      type: "select",
      label: "Shadow Elevation",
      group: "Aesthetics",
      defaultValue: "none",
      options: [
        { label: "None", value: "none" },
        { label: "Level 1", value: 1 },
        { label: "Level 2", value: 2 },
        { label: "Level 3", value: 3 },
        { label: "Level 4", value: 4 },
        { label: "Level 5", value: 5 },
      ],
    },
    bordered: {
      type: "boolean",
      label: "Bordered",
      group: "Aesthetics",
      defaultValue: false,
    },
    glass: {
      type: "boolean",
      label: "Glassmorphism Blur",
      group: "Aesthetics",
      defaultValue: false,
    },
    hoverEffect: {
      type: "boolean",
      label: "Hover Bloom Effect",
      group: "Interactions",
      defaultValue: false,
    },
    enableRipple: {
      type: "boolean",
      label: "Enable Click Ripple",
      group: "Interactions",
      defaultValue: false,
    },
  },
};
