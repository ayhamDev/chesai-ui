import React from "react";
import * as Icons from "lucide-react";
import { FAB } from "../../fab";
import type { RegistryComponent } from "../types";

export const FABConfig: RegistryComponent = {
  name: "Floating Action Button",
  category: "Elements",
  render: ({ icon, label, isExtended, variant, size, shape, ...props }) => {
    const IconComponent = icon ? (Icons as any)[icon] : (Icons as any)["Plus"];

    return (
      <div className="w-fit" {...props}>
        <FAB
          icon={IconComponent ? <IconComponent size={size === "xl" ? 32 : 24} /> : null}
          isExtended={isExtended}
          variant={variant}
          size={size}
          shape={shape}
        >
          {label}
        </FAB>
      </div>
    );
  },
  controls: {
    icon: {
      type: "text",
      label: "Icon (Lucide Name)",
      defaultValue: "Plus",
      group: "Content",
    },
    label: {
      type: "text",
      label: "Extended Label",
      defaultValue: "Create New",
      group: "Content",
      supportsCMS: true,
    },
    isExtended: {
      type: "boolean",
      label: "Is Extended (Shows Label)",
      defaultValue: true,
      group: "Behavior",
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
  },
};
