import React from "react";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const TypographyConfig: RegistryComponent = {
  name: "Text",
  category: "Typography",
  render: ({ children, ...props }) => (
    <Typography {...props}>{children || "Type something..."}</Typography>
  ),
  controls: {
    children: {
      type: "textarea",
      label: "Content",
      defaultValue: "This is a text block.",
      group: "Content",
      supportsCMS: true,
    },
    variant: {
      type: "select",
      label: "MD3 Scale Variant",
      group: "Aesthetics",
      defaultValue: "body-medium",
      options: [
        { label: "Display Large", value: "display-large" },
        { label: "Display Medium", value: "display-medium" },
        { label: "Display Small", value: "display-small" },
        { label: "Headline Large", value: "headline-large" },
        { label: "Headline Medium", value: "headline-medium" },
        { label: "Headline Small", value: "headline-small" },
        { label: "Title Large", value: "title-large" },
        { label: "Title Medium", value: "title-medium" },
        { label: "Title Small", value: "title-small" },
        { label: "Body Large", value: "body-large" },
        { label: "Body Medium", value: "body-medium" },
        { label: "Body Small", value: "body-small" },
        { label: "Label Large", value: "label-large" },
        { label: "Label Medium", value: "label-medium" },
        { label: "Label Small", value: "label-small" },
        { label: "Blockquote", value: "blockquote" },
      ],
    },
    muted: {
      type: "boolean",
      label: "Muted Text",
      group: "Aesthetics",
      defaultValue: false,
    },
    bold: {
      type: "boolean",
      label: "Force Bold Weight",
      group: "Aesthetics",
      defaultValue: false,
    },
    highlighted: {
      type: "boolean",
      label: "Enable Highlight (Inline Code Style)",
      group: "Highlight Settings",
      defaultValue: false,
    },
    highlightedVariant: {
      type: "select",
      label: "Highlight Color",
      group: "Highlight Settings",
      defaultValue: "secondary",
      hidden: (props) => !props.highlighted,
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "Error", value: "error" },
      ],
    },
    highlightedShape: {
      type: "select",
      label: "Highlight Shape",
      group: "Highlight Settings",
      defaultValue: "minimal",
      hidden: (props) => !props.highlighted,
      options: [
        { label: "Full", value: "full" },
        { label: "Minimal", value: "minimal" },
        { label: "Sharp", value: "sharp" },
      ],
    },
  },
};
