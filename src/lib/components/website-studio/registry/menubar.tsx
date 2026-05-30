import React from "react";
import { Menubar } from "../../menubar";
import type { RegistryComponent } from "../types";

export const MenubarConfig: RegistryComponent = {
  name: "Desktop Menubar",
  category: "Navigation",
  render: ({ menusString, shape, ...props }) => {
    const parsedMenus = (menusString || "File:New,Open,-,Save | Edit:Undo,Redo | View:Reload,Fullscreen")
      .split("|")
      .map((menuObj: string, i: number) => {
        const [trigger, itemsPart] = menuObj.split(":");
        const items = (itemsPart || "").split(",").map((item, j) => {
          const clean = item.trim();
          return { id: `${i}-${j}`, label: clean, isSeparator: clean === "-" };
        });
        return { id: i.toString(), trigger: trigger?.trim() || `Menu ${i}`, items };
      });

    return (
      <div className="w-full flex justify-start border-b border-outline-variant/30 bg-surface px-2 py-1" {...props}>
        <Menubar shape={shape}>
          {parsedMenus.map((menu: any) => (
            <Menubar.Menu key={menu.id}>
              <Menubar.Trigger>{menu.trigger}</Menubar.Trigger>
              <Menubar.Content>
                {menu.items.map((item: any) =>
                  item.isSeparator ? (
                    <Menubar.Separator key={item.id} />
                  ) : (
                    <Menubar.Item key={item.id}>{item.label}</Menubar.Item>
                  )
                )}
              </Menubar.Content>
            </Menubar.Menu>
          ))}
        </Menubar>
      </div>
    );
  },
  controls: {
    menusString: {
      type: "textarea",
      label: "Menu Structure",
      description: "Format: MenuName:Item1,Item2,-,Item3 | MenuName2:Item1",
      defaultValue: "File:New,Open,-,Save | Edit:Undo,Redo | View:Reload,Fullscreen",
      group: "Content",
    },
    shape: {
      type: "select",
      label: "Dropdown Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Round)", value: "full" },
        { label: "Minimal (Standard)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
  },
};
