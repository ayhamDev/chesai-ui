import React from "react";
import { ContextMenu } from "../../context-menu";
import type { RegistryComponent } from "../types";

export const ContextMenuConfig: RegistryComponent = {
  name: "Context Menu (Right Click)",
  category: "Interactions",
  acceptsChildren: true,
  render: ({ itemsString, shape, size, glass, children, ...props }) => {
    const parsedItems = (itemsString || "Edit, Copy, -, Share, Delete")
      .split(",")
      .map((item: string, index: number) => {
        const clean = item.trim();
        return { id: index.toString(), label: clean, isSeparator: clean === "-" };
      });

    return (
      <div className="w-full" {...props}>
        <ContextMenu shape={shape} size={size} glass={glass}>
          <ContextMenu.Trigger asChild>
            <div className="w-full min-h-[150px] border-2 border-dashed border-primary/50 bg-primary/5 rounded-xl flex items-center justify-center cursor-context-menu p-4">
              {children || (
                <span className="text-primary font-medium opacity-70 text-center">
                  Right-click me! <br/> (Drop content here to wrap it)
                </span>
              )}
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content>
            {parsedItems.map((item: any) =>
              item.isSeparator ? (
                <ContextMenu.Separator key={item.id} />
              ) : (
                <ContextMenu.Item
                  key={item.id}
                  className={item.label.toLowerCase() === "delete" ? "text-error hover:!bg-error/10 hover:!text-error" : ""}
                >
                  {item.label}
                </ContextMenu.Item>
              )
            )}
          </ContextMenu.Content>
        </ContextMenu>
      </div>
    );
  },
  controls: {
    itemsString: {
      type: "textarea",
      label: "Menu Items (Comma Separated)",
      description: "Use '-' to insert a separator.",
      defaultValue: "Edit, Copy, -, Share, Delete",
      group: "Content",
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
      ],
    },
    shape: {
      type: "select",
      label: "Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Round)", value: "full" },
        { label: "Minimal (Standard)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    glass: {
      type: "boolean",
      label: "Glassmorphism Effect",
      group: "Aesthetics",
      defaultValue: false,
    },
  },
};
