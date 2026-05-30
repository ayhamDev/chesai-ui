import React from "react";
import * as Icons from "lucide-react";
import { Timeline } from "../../timeline";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const TimelineRootConfig: RegistryComponent = {
  name: "Timeline",
  category: "Data Display",
  acceptsChildren: true,
  render: ({ children, ...props }) => (
    <div className="w-full pl-2" {...props}>
      <Timeline>{children}</Timeline>
    </div>
  ),
  controls: {},
};

export const TimelineItemConfig: RegistryComponent = {
  name: "Timeline Item",
  category: "Data Display",
  acceptsChildren: true,
  render: ({
    title,
    subtitle,
    icon,
    dotVariant,
    dotShape,
    dotSize,
    hideConnector,
    children,
    ...props
  }) => {
    const IconComponent = icon ? (Icons as any)[icon] : null;

    return (
      <Timeline.Item {...props}>
        <Timeline.Separator>
          <Timeline.Dot variant={dotVariant} shape={dotShape} size={dotSize}>
            {IconComponent && <IconComponent />}
          </Timeline.Dot>
          {!hideConnector && <Timeline.Connector />}
        </Timeline.Separator>

        <Timeline.Content>
          {title && <Typography variant="title-small">{title}</Typography>}
          {subtitle && (
            <Typography variant="body-small" muted className="mb-2">
              {subtitle}
            </Typography>
          )}
          {children}
        </Timeline.Content>
      </Timeline.Item>
    );
  },
  controls: {
    title: {
      type: "text",
      label: "Title",
      defaultValue: "Timeline Event",
      group: "Content",
      supportsCMS: true,
    },
    subtitle: {
      type: "text",
      label: "Subtitle / Date",
      defaultValue: "January 1, 2024",
      group: "Content",
      supportsCMS: true,
    },
    icon: {
      type: "text",
      label: "Dot Icon (Lucide Name)",
      description: "e.g., Check, GitCommit, Star",
      group: "Icons",
    },
    dotVariant: {
      type: "select",
      label: "Dot Variant",
      group: "Aesthetics",
      defaultValue: "secondary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Primary Container", value: "primary-container" },
        { label: "Secondary", value: "secondary" },
        { label: "Surface", value: "surface" },
        { label: "Outline", value: "outline" },
        { label: "Ghost", value: "ghost" },
        { label: "Solid", value: "solid" },
      ],
    },
    dotShape: {
      type: "select",
      label: "Dot Shape",
      group: "Aesthetics",
      defaultValue: "circle",
      options: [
        { label: "Circle", value: "circle" },
        { label: "Square", value: "square" },
        { label: "Diamond", value: "diamond" },
      ],
    },
    dotSize: {
      type: "select",
      label: "Dot Size",
      group: "Aesthetics",
      defaultValue: "md",
      options: [
        { label: "Small (Dot only)", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
      ],
    },
    hideConnector: {
      type: "boolean",
      label: "Hide Connector Line (Last Item)",
      group: "Layout",
      defaultValue: false,
    },
  },
};
