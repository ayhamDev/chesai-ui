import React from "react";
import * as Icons from "lucide-react";
import { NavigationMenu } from "../../navigation-menu";
import type { RegistryComponent } from "../types";

export const NavigationMenuConfig: RegistryComponent = {
  name: "Navigation Menu (Mega Menu)",
  category: "Navigation",
  render: ({ triggerLabel, itemsString, columns, ...props }) => {
    const parsedItems = (itemsString || "Component:UI Library:A modern React library, BookOpen:Documentation:Read the guides")
      .split(",")
      .map((item: string, index: number) => {
        const parts = item.split(":");
        return {
          id: index.toString(),
          icon: parts[0] ? parts[0].trim() : "Circle",
          title: parts[1] ? parts[1].trim() : `Item ${index + 1}`,
          desc: parts[2] ? parts[2].trim() : "",
        };
      });

    return (
      <div className="w-full flex justify-center py-4 relative z-50" {...props}>
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>{triggerLabel || "Products"}</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.ContentList grid={columns as any} className="md:w-[500px]">
                  {parsedItems.map((item: any) => {
                    const IconComp = (Icons as any)[item.icon] || Icons.Circle;
                    return (
                      <NavigationMenu.ContentItem
                        key={item.id}
                        title={item.title}
                        startIcon={<IconComp size={20} />}
                        href="#"
                      >
                        {item.desc}
                      </NavigationMenu.ContentItem>
                    );
                  })}
                </NavigationMenu.ContentList>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Company</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.ContentList grid="cols-1" className="w-[200px]">
                  <NavigationMenu.ContentItem title="About Us" href="#" />
                  <NavigationMenu.ContentItem title="Careers" href="#" />
                </NavigationMenu.ContentList>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu>
      </div>
    );
  },
  controls: {
    triggerLabel: {
      type: "text",
      label: "Mega Menu Trigger Label",
      defaultValue: "Products",
      group: "Content",
    },
    itemsString: {
      type: "textarea",
      label: "Dropdown Items (Icon:Title:Description)",
      description: "Comma separated.",
      defaultValue: "Component:UI Library:A modern React library, BookOpen:Documentation:Read the guides",
      group: "Content",
    },
    columns: {
      type: "select",
      label: "Dropdown Grid Columns",
      group: "Layout",
      defaultValue: "cols-2",
      options: [
        { label: "1 Column", value: "cols-1" },
        { label: "2 Columns", value: "cols-2" },
        { label: "3 Columns", value: "cols-3" },
      ],
    },
  },
};
