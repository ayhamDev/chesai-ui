import React from "react";
import * as Icons from "lucide-react";
import { IconButton } from "../../icon-button";
import type { RegistryComponent } from "../types";

export const IconButtonConfig: RegistryComponent = {
  name: "Icon Button",
  category: "Elements",
  render: ({ icon, variant, size, shape, isLoading, disabled, ...props }) => {
    const IconComponent = icon ? (Icons as any)[icon] : (Icons as any)["Plus"];

    return (
      <div className="w-fit inline-block" {...props}>
        <IconButton
          variant={variant}
          size={size}
          shape={shape}
          isLoading={isLoading}
          disabled={disabled}
        >
          {IconComponent ? <IconComponent /> : null}
        </IconButton>
      </div>
    );
  },
  controls: {
    icon: {
      type: "text",
      label: "Icon (Lucide Name)",
      defaultValue: "Star",
      group: "Content",
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "Outline", value: "outline" },
        { label: "Ghost", value: "ghost" },
        { label: "Destructive", value: "destructive" },
      ],
    },
    size: {
      type: "select",
      label: "Size",
      group: "Aesthetics",
      defaultValue: "md",
      options: [
        { label: "Extra Small", value: "xs" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "full",
      options: [
        { label: "Full (Circle)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    isLoading: {
      type: "boolean",
      label: "Loading State",
      group: "State",
      defaultValue: false,
    },
    disabled: {
      type: "boolean",
      label: "Disabled State",
      group: "State",
      defaultValue: false,
    },
  },
};
