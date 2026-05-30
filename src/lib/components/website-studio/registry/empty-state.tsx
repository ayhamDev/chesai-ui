import React from "react";
import * as Icons from "lucide-react";
import { EmptyState } from "../../empty-state";
import type { RegistryComponent } from "../types";

export const EmptyStateConfig: RegistryComponent = {
  name: "Empty State",
  category: "Blocks",
  render: ({ title, description, icon, variant, ...props }) => {
    const IconComponent = icon ? (Icons as any)[icon] : null;

    return (
      <div className="w-full" {...props}>
        <EmptyState
          title={title}
          description={description}
          icon={IconComponent ? <IconComponent size={32} /> : undefined}
          variant={variant}
        />
      </div>
    );
  },
  controls: {
    title: {
      type: "text",
      label: "Title",
      defaultValue: "No items found",
      group: "Content",
      supportsCMS: true,
    },
    description: {
      type: "textarea",
      label: "Description",
      defaultValue: "Get started by creating a new item or adjusting your filters.",
      group: "Content",
      supportsCMS: true,
    },
    icon: {
      type: "text",
      label: "Icon (Lucide Name)",
      defaultValue: "Inbox",
      description: "e.g., Inbox, SearchX, FolderOpen",
      group: "Content",
    },
    variant: {
      type: "select",
      label: "Container Variant",
      group: "Aesthetics",
      defaultValue: "default",
      options: [
        { label: "Default (Transparent)", value: "default" },
        { label: "Card (Outlined Box)", value: "card" },
      ],
    },
  },
};
