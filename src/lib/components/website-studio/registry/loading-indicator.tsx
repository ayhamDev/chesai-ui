import React from "react";
import { LoadingIndicator } from "../../loadingIndicator";
import type { RegistryComponent } from "../types";

export const LoadingIndicatorConfig: RegistryComponent = {
  name: "Loading Indicator",
  category: "Feedback",
  render: ({ variant, isPlaying, size, ...props }) => {
    const sizeMap = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
      xl: "w-24 h-24",
    };

    return (
      <div className="w-fit inline-block" {...props}>
        <LoadingIndicator
          variant={variant}
          isPlaying={isPlaying}
          className={sizeMap[size as keyof typeof sizeMap] || sizeMap.md}
        />
      </div>
    );
  },
  controls: {
    isPlaying: {
      type: "boolean",
      label: "Is Playing",
      group: "State",
      defaultValue: true,
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "material-morph",
      options: [
        { label: "Material Morph (Base)", value: "material-morph" },
        { label: "Material Morph (With Background)", value: "material-morph-background" },
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
