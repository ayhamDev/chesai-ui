import React from "react";
import * as Icons from "lucide-react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  ItemActions,
} from "../../item";
import { IconButton } from "../../icon-button";
import type { RegistryComponent } from "../types";

export const ItemConfig: RegistryComponent = {
  name: "List Item",
  category: "Layout",
  render: ({
    title,
    description,
    icon,
    actionIcon,
    variant,
    size,
    shape,
    padding,
    bordered,
    elevation,
    direction,
    ...props
  }) => {
    const MediaIcon = icon ? (Icons as any)[icon] : null;
    const ActionIconComp = actionIcon ? (Icons as any)[actionIcon] : null;

    return (
      <div className="w-full" {...props}>
        <Item
          variant={variant}
          size={size}
          shape={shape}
          padding={padding}
          bordered={bordered}
          elevation={elevation}
          direction={direction}
          className="cursor-pointer"
        >
          {MediaIcon && (
            <ItemMedia variant="icon" shape={shape}>
              <MediaIcon />
            </ItemMedia>
          )}
          <ItemContent>
            {title && <ItemTitle>{title}</ItemTitle>}
            {description && <ItemDescription>{description}</ItemDescription>}
          </ItemContent>
          {ActionIconComp && (
            <ItemActions>
              <IconButton variant="ghost" size="sm">
                <ActionIconComp size={16} />
              </IconButton>
            </ItemActions>
          )}
        </Item>
      </div>
    );
  },
  controls: {
    title: {
      type: "text",
      label: "Title",
      defaultValue: "List Item Title",
      group: "Content",
      supportsCMS: true,
    },
    description: {
      type: "textarea",
      label: "Description",
      defaultValue: "A brief description of this list item.",
      group: "Content",
      supportsCMS: true,
    },
    icon: {
      type: "text",
      label: "Media Icon (Lucide)",
      description: "e.g., Folder, FileText, User",
      defaultValue: "FileText",
      group: "Icons",
    },
    actionIcon: {
      type: "text",
      label: "Action Icon (Lucide)",
      description: "e.g., ChevronRight, MoreVertical",
      defaultValue: "ChevronRight",
      group: "Icons",
    },
    variant: {
      type: "select",
      label: "Surface Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary Surface", value: "primary" },
        { label: "Secondary Surface", value: "secondary" },
        { label: "Tertiary Surface", value: "tertiary" },
        { label: "Ghost (Transparent)", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full", value: "full" },
        { label: "Minimal", value: "minimal" },
        { label: "Sharp", value: "sharp" },
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
      ],
    },
  },
};
