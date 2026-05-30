import React, { useState } from "react";
import * as Icons from "lucide-react";
import { NavigationRail } from "../../navigation-rail";
import type { RegistryComponent } from "../types";

export const NavigationRailConfig: RegistryComponent = {
  name: "Navigation Rail",
  category: "Navigation",
  render: ({
    itemsString,
    fabIcon,
    variant,
    itemVariant,
    itemLayout,
    shape,
    expandOnHover,
    forceExpanded,
    ...props
  }) => {
    const [activeTab, setActiveTab] = useState("0");

    const parsedTabs = (itemsString || "Dashboard:LayoutDashboard, Analytics:LineChart, Settings:Settings")
      .split(",")
      .map((tab: string, index: number) => {
        const [labelPart, iconPart] = tab.split(":");
        return {
          id: index.toString(),
          label: labelPart ? labelPart.trim() : `Tab ${index + 1}`,
          icon: iconPart ? iconPart.trim() : "Circle",
        };
      });

    const FabIconComp = fabIcon ? (Icons as any)[fabIcon] : null;

    return (
      <div className="h-[500px] flex justify-start bg-graphite-background border border-dashed border-outline-variant/30 relative" {...props}>
        <NavigationRail.Navigator
          activeTab={activeTab}
          onTabPress={setActiveTab}
          variant={variant}
          itemVariant={itemVariant}
          itemLayout={itemLayout}
          shape={shape}
          expandOnHover={expandOnHover}
          forceExpanded={forceExpanded}
          className="h-full border-r border-outline-variant/30"
        >
          {FabIconComp && (
            <NavigationRail.FAB icon={<FabIconComp size={20} />} label="New" />
          )}

          {parsedTabs.map((tab: any) => {
            const IconComp = (Icons as any)[tab.icon] || Icons.Circle;
            return (
              <NavigationRail.Screen
                key={tab.id}
                name={tab.id}
                label={tab.label}
                icon={() => <IconComp size={24} />}
              />
            );
          })}
        </NavigationRail.Navigator>
      </div>
    );
  },
  controls: {
    itemsString: {
      type: "textarea",
      label: "Rail Items (Label:IconName)",
      defaultValue: "Dashboard:LayoutDashboard, Analytics:LineChart, Settings:Settings",
      group: "Content",
    },
    fabIcon: {
      type: "text",
      label: "FAB Icon (Lucide)",
      description: "Leave empty to hide FAB.",
      defaultValue: "Plus",
      group: "Content",
    },
    itemLayout: {
      type: "select",
      label: "Label Layout",
      group: "Layout",
      defaultValue: "inline",
      options: [
        { label: "Inline (Expandable side rail)", value: "inline" },
        { label: "Stacked (Compact fixed bar)", value: "stacked" },
      ],
    },
    expandOnHover: {
      type: "boolean",
      label: "Expand on Hover",
      group: "Behavior",
      defaultValue: true,
      hidden: (props) => props.itemLayout === "stacked",
    },
    forceExpanded: {
      type: "boolean",
      label: "Force Expanded",
      group: "Behavior",
      defaultValue: false,
      hidden: (props) => props.itemLayout === "stacked",
    },
    variant: {
      type: "select",
      label: "Rail Background",
      group: "Aesthetics",
      defaultValue: "surface",
      options: [
        { label: "Surface", value: "surface" },
        { label: "Primary Container", value: "primary" },
        { label: "Secondary Container", value: "secondary" },
        { label: "Ghost", value: "ghost" },
      ],
    },
    itemVariant: {
      type: "select",
      label: "Active Item Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Ghost", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Outer Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Round)", value: "full" },
        { label: "Minimal (Soft)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
  },
};
