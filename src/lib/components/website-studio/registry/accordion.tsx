import React from "react";
import { Accordion } from "../../accordion";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const AccordionRootConfig: RegistryComponent = {
  name: "Accordion",
  category: "Layout",
  acceptsChildren: true,
  render: ({ children, type, collapsible, layout, variant, shape, ...props }) => (
    <div className="w-full" {...props}>
      <Accordion
        type={type}
        collapsible={collapsible}
        layout={layout}
        variant={variant}
        shape={shape}
      >
        {children}
      </Accordion>
    </div>
  ),
  controls: {
    type: {
      type: "select",
      label: "Behavior Type",
      group: "Behavior",
      defaultValue: "single",
      options: [
        { label: "Single (One open at a time)", value: "single" },
        { label: "Multiple (Independent)", value: "multiple" },
      ],
    },
    collapsible: {
      type: "boolean",
      label: "Allow all to close",
      group: "Behavior",
      defaultValue: true,
      hidden: (props) => props.type === "multiple",
    },
    layout: {
      type: "select",
      label: "Layout Style",
      group: "Aesthetics",
      defaultValue: "integrated",
      options: [
        { label: "Integrated (Joined)", value: "integrated" },
        { label: "Separated (Cards)", value: "separated" },
      ],
    },
    variant: {
      type: "select",
      label: "Color Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary Surface", value: "primary" },
        { label: "Secondary Surface", value: "secondary" },
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
  },
};

export const AccordionItemConfig: RegistryComponent = {
  name: "Accordion Item",
  category: "Layout",
  acceptsChildren: true,
  render: ({ triggerText, value, children, ...props }) => {
    const itemValue = value || `item-${Math.random().toString(36).substr(2, 9)}`;
    return (
      <Accordion.Item value={itemValue} {...props}>
        <Accordion.Trigger>{triggerText || "Accordion Heading"}</Accordion.Trigger>
        <Accordion.Content>
          {children || (
            <Typography variant="body-medium" className="opacity-70 p-4">
              Drop content here...
            </Typography>
          )}
        </Accordion.Content>
      </Accordion.Item>
    );
  },
  controls: {
    triggerText: {
      type: "text",
      label: "Heading Text",
      group: "Content",
      defaultValue: "Section Heading",
      supportsCMS: true,
    },
    value: {
      type: "text",
      label: "Unique Value ID (Optional)",
      group: "Advanced",
      description: "Used to control which items are open programmatically.",
    },
  },
};
