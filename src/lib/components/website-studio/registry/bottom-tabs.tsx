import React, { useState } from "react";
import * as Icons from "lucide-react";
import { BottomTabs } from "../../bottom-tabs";
import type { RegistryComponent } from "../types";

export const BottomTabsConfig: RegistryComponent = {
  name: "Bottom Tabs",
  category: "Navigation",
  render: ({
    tabsString,
    variant,
    itemVariant,
    mode,
    itemLayout,
    shape,
    size,
    shadow,
    ...props
  }) => {
    const [activeTab, setActiveTab] = useState("0");

    const parsedTabs = (tabsString || "Home:Home, Search:Search, Profile:User")
      .split(",")
      .map((tab: string, index: number) => {
        const [labelPart, iconPart] = tab.split(":");
        return {
          id: index.toString(),
          label: labelPart ? labelPart.trim() : `Tab ${index + 1}`,
          icon: iconPart ? iconPart.trim() : "Circle",
        };
      });

    return (
      <div className="w-full flex justify-center py-4" {...props}>
        <div className="w-full max-w-md relative">
          <BottomTabs.Navigator
            activeTab={activeTab}
            onTabPress={setActiveTab}
            variant={variant}
            itemVariant={itemVariant}
            mode={mode}
            itemLayout={itemLayout}
            shape={shape}
            size={size}
            shadow={shadow}
          >
            {parsedTabs.map((tab: any) => {
              const IconComp = (Icons as any)[tab.icon] || Icons.Circle;
              return (
                <BottomTabs.Screen
                  key={tab.id}
                  name={tab.id}
                  label={tab.label}
                  icon={({ size }) => <IconComp size={size} />}
                />
              );
            })}
          </BottomTabs.Navigator>
        </div>
      </div>
    );
  },
  controls: {
    tabsString: {
      type: "textarea",
      label: "Tabs (Label:IconName)",
      description: "Comma separated. Example: Home:Home, Profile:User",
      defaultValue: "Home:Home, Search:Search, Profile:User",
      group: "Content",
      supportsCMS: true,
    },
    mode: {
      type: "select",
      label: "Docking Mode",
      group: "Layout",
      defaultValue: "attached",
      options: [
        { label: "Attached (Full Width)", value: "attached" },
        { label: "Detached (Floating)", value: "detached" },
      ],
    },
    itemLayout: {
      type: "select",
      label: "Item Layout",
      group: "Layout",
      defaultValue: "stacked",
      options: [
        { label: "Stacked (Icon above Label)", value: "stacked" },
        { label: "Inline (Shift - Label on active)", value: "inline" },
      ],
    },
    variant: {
      type: "select",
      label: "Background Variant",
      group: "Aesthetics",
      defaultValue: "secondary",
      options: [
        { label: "Surface", value: "surface" },
        { label: "Primary Container", value: "primary" },
        { label: "Secondary Container", value: "secondary" },
        { label: "Tertiary Container", value: "tertiary" },
        { label: "Ghost", value: "ghost" },
      ],
    },
    itemVariant: {
      type: "select",
      label: "Active Item Variant",
      group: "Aesthetics",
      defaultValue: "secondary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "Ghost", value: "ghost" },
      ],
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
      defaultValue: "full",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    shadow: {
      type: "select",
      label: "Shadow (Detached Only)",
      group: "Aesthetics",
      defaultValue: "lg",
      hidden: (props) => props.mode !== "detached",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
  },
};
