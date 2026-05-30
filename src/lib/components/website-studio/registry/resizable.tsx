import React from "react";
import { Resizable } from "../../resizable";
import type { RegistryComponent } from "../types";

export const ResizableConfig: RegistryComponent = {
  name: "Resizable Layout",
  category: "Layout",
  acceptsChildren: true,
  render: ({ defaultWidth, handleVariant, ...props }) => (
    <div className="w-full h-[400px] border border-dashed border-outline-variant/50 rounded-xl overflow-hidden bg-surface" {...props}>
      <Resizable>
        <Resizable.Pane id="pane-left" defaultWidth={defaultWidth || 250} className="bg-surface-container-low">
          <div className="w-full h-full flex items-center justify-center p-4 text-center opacity-50 text-sm border-r border-dashed border-outline-variant/30">
            Sidebar Pane
          </div>
        </Resizable.Pane>

        <Resizable.Handle target="pane-left" variant={handleVariant} />

        <Resizable.Pane id="pane-right" flex className="bg-surface-container-lowest">
          <div className="w-full h-full flex items-center justify-center p-4 text-center opacity-50 text-sm">
            Main Flex Pane
          </div>
        </Resizable.Pane>
      </Resizable>
    </div>
  ),
  controls: {
    defaultWidth: {
      type: "number",
      label: "Sidebar Default Width (px)",
      group: "Layout",
      defaultValue: 250,
      min: 100,
      max: 600,
    },
    handleVariant: {
      type: "select",
      label: "Drag Handle Style",
      group: "Aesthetics",
      defaultValue: "default",
      options: [
        { label: "Default (Invisible line)", value: "default" },
        { label: "Pill (Visible pill)", value: "pill" },
      ],
    },
  },
};
