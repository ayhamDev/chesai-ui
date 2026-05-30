import React from "react";
import { Avatar } from "../../avatar";
import type { RegistryComponent } from "../types";

export const AvatarConfig: RegistryComponent = {
  name: "Avatar",
  category: "Media",
  render: (props) => <Avatar {...props} />,
  controls: {
    src: {
      type: "image",
      label: "Image URL",
      group: "Content",
      supportsCMS: true,
    },
    fallback: {
      type: "text",
      label: "Fallback Initials",
      defaultValue: "JD",
      group: "Content",
      supportsCMS: true,
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
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "default",
      options: [
        { label: "Default (Image/Initials)", value: "default" },
        { label: "Count (+X)", value: "count" },
      ],
    },
  },
};
