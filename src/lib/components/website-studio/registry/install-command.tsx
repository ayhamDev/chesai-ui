import React from "react";
import { InstallCommand } from "../../install-command";
import type { RegistryComponent } from "../types";

export const InstallCommandConfig: RegistryComponent = {
  name: "Install Command",
  category: "Blocks",
  render: ({ packageName, isDevDependency, variant, shape, shadow, ...props }) => (
    <div className="w-full" {...props}>
      <InstallCommand
        packageName={packageName || "chesai-ui"}
        isDevDependency={isDevDependency}
        variant={variant}
        shape={shape}
        shadow={shadow}
      />
    </div>
  ),
  controls: {
    packageName: {
      type: "text",
      label: "Package Name",
      defaultValue: "chesai-ui",
      group: "Content",
      supportsCMS: true,
    },
    isDevDependency: {
      type: "boolean",
      label: "As Dev Dependency (-D)",
      defaultValue: false,
      group: "Content",
    },
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary (Surface Low)", value: "primary" },
        { label: "Secondary (Surface High)", value: "secondary" },
        { label: "Surface", value: "surface" },
        { label: "Ghost", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill-ish)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    shadow: {
      type: "select",
      label: "Shadow Elevation",
      group: "Aesthetics",
      defaultValue: "none",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
  },
};
