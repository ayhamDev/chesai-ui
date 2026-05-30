import React, { useState } from "react";
import * as Icons from "lucide-react";
import { Sidebar } from "../../sidebar";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const SidebarConfig: RegistryComponent = {
  name: "Sidebar",
  category: "Navigation",
  render: ({ title, itemsString, layout, variant, shape, itemShape, itemVariant, overlay, ...props }) => {
    const [activeTab, setActiveTab] = useState("0");

    const parsedTabs = (itemsString || "Dashboard:LayoutDashboard, Team:Users, Settings:Settings")
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
      <div className="h-[600px] w-full bg-graphite-background relative border border-dashed border-outline-variant/30 flex" {...props}>
        <Sidebar.Provider defaultOpen={true}>
          <Sidebar
            layout={layout}
            variant={variant}
            shape={shape}
            itemShape={itemShape}
            itemVariant={itemVariant}
            overlay={overlay}
          >
            <Sidebar.Header>
              <Typography variant="title-medium" className="font-bold">
                {title}
              </Typography>
            </Sidebar.Header>
            <Sidebar.Content>
              <Sidebar.Group>
                {parsedTabs.map((tab: any) => {
                  const IconComp = (Icons as any)[tab.icon] || Icons.Circle;
                  return (
                    <Sidebar.Item
                      key={tab.id}
                      icon={<IconComp size={18} />}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </Sidebar.Item>
                  );
                })}
              </Sidebar.Group>
            </Sidebar.Content>
          </Sidebar>

          <main className="flex-1 p-6 relative">
            <Sidebar.Trigger className="absolute top-4 left-4" />
            <div className="mt-12 text-center opacity-50 text-sm border-2 border-dashed border-outline-variant rounded-xl p-8 h-full">
              Page Content Area
            </div>
          </main>
        </Sidebar.Provider>
      </div>
    );
  },
  controls: {
    title: {
      type: "text",
      label: "Sidebar Title",
      defaultValue: "Acme Corp",
      group: "Content",
    },
    itemsString: {
      type: "textarea",
      label: "Sidebar Items (Label:IconName)",
      defaultValue: "Dashboard:LayoutDashboard, Team:Users, Settings:Settings",
      group: "Content",
    },
    layout: {
      type: "select",
      label: "Layout Style",
      group: "Layout",
      defaultValue: "sidebar",
      options: [
        { label: "Docked (Standard)", value: "sidebar" },
        { label: "Floating (Inset)", value: "floating" },
      ],
    },
    overlay: {
      type: "boolean",
      label: "Act as Overlay (Drawer)",
      defaultValue: false,
      group: "Layout",
    },
    variant: {
      type: "select",
      label: "Sidebar Background",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary (Surface Low)", value: "primary" },
        { label: "Secondary (Surface High)", value: "secondary" },
        { label: "Ghost", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Sidebar Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full", value: "full" },
        { label: "Minimal", value: "minimal" },
        { label: "Sharp", value: "sharp" },
      ],
    },
    itemVariant: {
      type: "select",
      label: "Item Active Variant",
      group: "Aesthetics",
      defaultValue: "secondary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Ghost", value: "ghost" },
      ],
    },
    itemShape: {
      type: "select",
      label: "Item Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal", value: "minimal" },
        { label: "Sharp", value: "sharp" },
      ],
    },
  },
};
