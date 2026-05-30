import React from "react";
import { Tabs } from "../../tabs";
import type { RegistryComponent } from "../types";

export const TabsConfig: RegistryComponent = {
  name: "Tabs",
  category: "Navigation",
  acceptsChildren: true,
  render: ({ tabsString, variant, pageTransition, children, ...props }) => {
    const parsedTabs = (tabsString || "Tab 1, Tab 2, Tab 3")
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);

    const defaultTab = parsedTabs[0] || "tab1";

    return (
      <div className="w-full" {...props}>
        <Tabs
          defaultValue={defaultTab}
          variant={variant}
          pageTransition={pageTransition}
        >
          <Tabs.List>
            {parsedTabs.map((tab: string) => (
              <Tabs.Trigger key={tab} value={tab}>
                {tab}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content>
            {parsedTabs.map((tab: string) => (
              <Tabs.Panel key={tab} value={tab}>
                <div className="min-h-[100px] w-full">
                  {children || (
                    <div className="p-8 text-center text-sm opacity-50 border-2 border-dashed border-outline-variant/30 rounded-xl">
                      {tab} Content Area
                    </div>
                  )}
                </div>
              </Tabs.Panel>
            ))}
          </Tabs.Content>
        </Tabs>
      </div>
    );
  },
  controls: {
    tabsString: {
      type: "textarea",
      label: "Tab Names (Comma Separated)",
      defaultValue: "Overview, Specifications, Reviews",
      group: "Content",
      supportsCMS: true,
    },
    variant: {
      type: "select",
      label: "Visual Variant",
      group: "Aesthetics",
      defaultValue: "primary",
      options: [
        { label: "Primary (Bold Indicator)", value: "primary" },
        { label: "Secondary (Subtle Indicator)", value: "secondary" },
      ],
    },
    pageTransition: {
      type: "select",
      label: "Page Transition",
      group: "Behavior",
      defaultValue: "fade",
      options: [
        { label: "Fade", value: "fade" },
        { label: "Slide (Swipeable)", value: "slide" },
      ],
    },
  },
};
