import React from "react";
import * as Icons from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
import { Button } from "../../button";
import type { RegistryComponent } from "../types";

export const DropdownMenuConfig: RegistryComponent = {
  name: "Dropdown Menu",
  category: "Navigation",
  render: ({ triggerLabel, triggerVariant, itemsString, shape, glass, ...props }) => {
    const parsedItems = (itemsString || "User:Profile, Settings:Settings, -, LogOut:Log Out")
      .split(",")
      .map((item: string, index: number) => {
        const clean = item.trim();
        if (clean === "-") return { id: index.toString(), isSeparator: true };
        const [iconPart, labelPart] = clean.split(":");
        return {
          id: index.toString(),
          isSeparator: false,
          icon: iconPart ? iconPart.trim() : null,
          label: labelPart ? labelPart.trim() : clean,
        };
      });

    return (
      <div className="w-fit inline-block" {...props}>
        <DropdownMenu shape={shape} glass={glass}>
          <DropdownMenuTrigger asChild>
            <Button variant={triggerVariant} endIcon={<Icons.ChevronDown size={16} />}>
              {triggerLabel || "Open Menu"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {parsedItems.map((item: any) => {
              if (item.isSeparator) {
                return <DropdownMenuSeparator key={item.id} />;
              }
              const IconComp = item.icon ? (Icons as any)[item.icon] : null;
              return (
                <DropdownMenuItem key={item.id} className={item.icon === "LogOut" ? "text-error" : ""}>
                  {IconComp && <IconComp className="mr-2 h-4 w-4" />}
                  <span>{item.label}</span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
  controls: {
    triggerLabel: {
      type: "text",
      label: "Trigger Button Label",
      defaultValue: "Options",
      group: "Content",
    },
    itemsString: {
      type: "textarea",
      label: "Menu Items (IconName:Label)",
      description: "Use '-' for a separator line.",
      defaultValue: "User:Profile, Settings:Settings, -, LogOut:Log Out",
      group: "Content",
    },
    triggerVariant: {
      type: "select",
      label: "Trigger Variant",
      group: "Aesthetics",
      defaultValue: "secondary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Tertiary", value: "tertiary" },
        { label: "Ghost", value: "ghost" },
        { label: "Outline", value: "outline" },
      ],
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
    glass: {
      type: "boolean",
      label: "Glassmorphism Blur",
      group: "Aesthetics",
      defaultValue: true,
    },
  },
};
