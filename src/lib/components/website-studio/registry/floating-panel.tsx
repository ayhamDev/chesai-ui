import React from "react";
import * as Icons from "lucide-react";
import { FloatingPanel } from "../../floating-panel";
import type { RegistryComponent } from "../types";

export const FloatingPanelConfig: RegistryComponent = {
  name: "Floating Panel",
  category: "Interactions",
  acceptsChildren: true,
  render: ({
    triggerIcon,
    triggerText,
    position,
    offset,
    triggerVariant,
    panelVariant,
    children,
    ...props
  }) => {
    const IconComp = triggerIcon ? (Icons as any)[triggerIcon] : (Icons as any)["Sparkles"];

    return (
      <div className="w-full h-[400px] flex items-center justify-center relative bg-black/5 dark:bg-white/5 border border-dashed rounded-xl" {...props}>
        <div className="absolute top-4 left-4 text-xs opacity-50 font-mono pointer-events-none">
          Floating Panel Sandbox Bounds
        </div>

        <FloatingPanel
          position={position}
          offset={offset}
          triggerVariant={triggerVariant}
          panelVariant={panelVariant}
          triggerWidth={triggerText ? 140 : 56}
          triggerHeight={56}
        >
          <FloatingPanel.Trigger>
            <div className="flex items-center gap-2">
              {IconComp && <IconComp size={20} />}
              {triggerText && <span className="font-bold">{triggerText}</span>}
            </div>
          </FloatingPanel.Trigger>

          <FloatingPanel.Content>
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/50 shrink-0">
              <span className="font-bold text-sm">Expanded Panel</span>
              <FloatingPanel.CloseButton className="relative top-auto right-auto" />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {children || (
                <div className="h-full w-full flex items-center justify-center text-sm opacity-50 border-2 border-dashed border-outline-variant/30 rounded-xl p-6 text-center">
                  Drop widgets, forms, or chat interfaces here.
                </div>
              )}
            </div>
          </FloatingPanel.Content>
        </FloatingPanel>
      </div>
    );
  },
  controls: {
    triggerIcon: {
      type: "text",
      label: "Trigger Icon (Lucide)",
      defaultValue: "Sparkles",
      group: "Content",
    },
    triggerText: {
      type: "text",
      label: "Trigger Text (Optional)",
      defaultValue: "",
      group: "Content",
    },
    position: {
      type: "select",
      label: "Screen Position",
      group: "Layout",
      defaultValue: "bottom-right",
      options: [
        { label: "Top Left", value: "top-left" },
        { label: "Top Center", value: "top-center" },
        { label: "Top Right", value: "top-right" },
        { label: "Bottom Left", value: "bottom-left" },
        { label: "Bottom Center", value: "bottom-center" },
        { label: "Bottom Right", value: "bottom-right" },
        { label: "Left Center", value: "left-center" },
        { label: "Right Center", value: "right-center" },
        { label: "Center (Modal)", value: "center" },
      ],
    },
    offset: {
      type: "slider",
      label: "Screen Edge Offset (px)",
      group: "Layout",
      defaultValue: 24,
      min: 0,
      max: 100,
      step: 4,
    },
    triggerVariant: {
      type: "select",
      label: "Trigger Color Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "Ghost", value: "ghost" },
      ],
    },
    panelVariant: {
      type: "select",
      label: "Panel Color Variant",
      group: "Aesthetics",
      defaultValue: "surface",
      options: [
        { label: "Surface (Base)", value: "surface" },
        { label: "Surface Lowest", value: "surface-lowest" },
        { label: "Primary Container", value: "primary" },
        { label: "Secondary Container", value: "secondary" },
      ],
    },
  },
};
