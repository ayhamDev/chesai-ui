import React from "react";
import * as Icons from "lucide-react";
import { FABMenu } from "../../fab-menu";
import { FAB } from "../../fab";
import type { RegistryComponent } from "../types";

export const FABMenuConfig: RegistryComponent = {
  name: "FAB Menu",
  category: "Elements",
  render: ({
    direction,
    align,
    overlay,
    triggerIcon,
    triggerVariant,
    itemsString,
    ...props
  }) => {
    const TriggerIconComp = triggerIcon ? (Icons as any)[triggerIcon] : (Icons as any)["Plus"];

    const parsedItems = (itemsString || "FileText:Document, MessageSquare:Message")
      .split(",")
      .map((item: string) => {
        const [iconPart, labelPart] = item.split(":");
        return {
          icon: iconPart ? iconPart.trim() : "Star",
          label: labelPart ? labelPart.trim() : "",
        };
      });

    return (
      <div className="w-full flex items-center justify-center p-8" {...props}>
        <FABMenu direction={direction} align={align} overlay={overlay}>
          <FABMenu.Trigger asChild>
            <FAB
              icon={TriggerIconComp ? <TriggerIconComp /> : null}
              variant={triggerVariant}
              isExtended={false}
            />
          </FABMenu.Trigger>
          <FABMenu.List>
            {parsedItems.map((item: any, idx: number) => {
              const ItemIcon = (Icons as any)[item.icon];
              return (
                <FABMenu.Item
                  key={idx}
                  icon={ItemIcon ? <ItemIcon /> : undefined}
                  label={item.label}
                />
              );
            })}
          </FABMenu.List>
        </FABMenu>
      </div>
    );
  },
  controls: {
    triggerIcon: {
      type: "text",
      label: "Trigger Icon (Lucide)",
      defaultValue: "Plus",
      group: "Content",
    },
    itemsString: {
      type: "textarea",
      label: "Menu Items (IconName:Label)",
      description: "Comma separated. Example: FileText:Document, Share2:Share",
      defaultValue: "FileText:Document, MessageSquare:Message, Share2:Share",
      group: "Content",
    },
    triggerVariant: {
      type: "select",
      label: "Trigger Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
      ],
    },
    direction: {
      type: "select",
      label: "Expansion Direction",
      group: "Layout",
      defaultValue: "up",
      options: [
        { label: "Up", value: "up" },
        { label: "Down", value: "down" },
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
    },
    align: {
      type: "select",
      label: "Alignment",
      group: "Layout",
      defaultValue: "center",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
      ],
    },
    overlay: {
      type: "boolean",
      label: "Show Dimming Overlay",
      group: "Aesthetics",
      defaultValue: false,
    },
  },
};
