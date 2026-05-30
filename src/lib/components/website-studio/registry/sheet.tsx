import React from "react";
import { Sheet } from "../../sheet";
import { Button } from "../../button";
import type { RegistryComponent } from "../types";

export const SheetConfig: RegistryComponent = {
  name: "Sheet (Drawer)",
  category: "Layout",
  acceptsChildren: true,
  render: ({ triggerText, sheetTitle, side, mode, variant, shape, glass, children, ...props }) => (
    <div className="w-fit inline-block" {...props}>
      <Sheet side={side} mode={mode} variant={variant} shape={shape} glass={glass}>
        <Sheet.Trigger asChild>
          <Button>{triggerText || "Open Sheet"}</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          {side === "bottom" && <Sheet.Grabber />}
          <Sheet.Header>
            <Sheet.Title>{sheetTitle || "Sheet Title"}</Sheet.Title>
          </Sheet.Header>
          <div className="p-6 flex-1 overflow-y-auto">
            {children || (
              <div className="p-8 border-2 border-dashed border-outline-variant/30 rounded-xl text-center text-sm opacity-50">
                Drop content here...
              </div>
            )}
          </div>
          <Sheet.Footer>
            <Sheet.Close asChild>
              <Button variant="secondary" className="w-full">Close</Button>
            </Sheet.Close>
          </Sheet.Footer>
        </Sheet.Content>
      </Sheet>
    </div>
  ),
  controls: {
    triggerText: {
      type: "text",
      label: "Trigger Button Text",
      defaultValue: "Open Menu",
      group: "Content",
    },
    sheetTitle: {
      type: "text",
      label: "Sheet Header Title",
      defaultValue: "Menu Options",
      group: "Content",
      supportsCMS: true,
    },
    side: {
      type: "select",
      label: "Desktop Slide Direction",
      group: "Layout",
      defaultValue: "right",
      options: [
        { label: "Right", value: "right" },
        { label: "Left", value: "left" },
        { label: "Top", value: "top" },
        { label: "Bottom", value: "bottom" },
      ],
    },
    mode: {
      type: "select",
      label: "Display Mode",
      group: "Layout",
      defaultValue: "normal",
      options: [
        { label: "Normal (Attached to edge)", value: "normal" },
        { label: "Detached (Floating)", value: "detached" },
      ],
    },
    variant: {
      type: "select",
      label: "Background Variant",
      group: "Aesthetics",
      defaultValue: "surface-container-high",
      options: [
        { label: "Surface Base", value: "surface" },
        { label: "Surface Container High", value: "surface-container-high" },
        { label: "Primary Container", value: "primary" },
        { label: "Inverse (High Contrast)", value: "high-contrast" },
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
    glass: {
      type: "boolean",
      label: "Glassmorphism Effect",
      group: "Aesthetics",
      defaultValue: false,
    },
  },
};
