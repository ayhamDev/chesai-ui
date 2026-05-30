import React from "react";
import { Menu, Search, User } from "lucide-react";
import { AppBar } from "../../appbar";
import { IconButton } from "../../icon-button";
import type { RegistryComponent } from "../types";

export const AppBarConfig: RegistryComponent = {
  name: "Top App Bar",
  category: "Navigation",
  render: ({ title, variant, color, scrollBehavior, showIcons, ...props }) => {
    return (
      <div className="w-full relative z-50" {...props}>
        <AppBar
          title={title}
          variant={variant}
          color={color}
          scrollBehavior={scrollBehavior}
          leadingIcon={
            showIcons ? (
              <IconButton variant="ghost" aria-label="Menu">
                <Menu className="w-5 h-5" />
              </IconButton>
            ) : undefined
          }
          trailingIcons={
            showIcons ? (
              <>
                <IconButton variant="ghost" aria-label="Search">
                  <Search className="w-5 h-5" />
                </IconButton>
                <IconButton variant="ghost" aria-label="User Profile">
                  <User className="w-5 h-5" />
                </IconButton>
              </>
            ) : undefined
          }
          className="relative"
        />
      </div>
    );
  },
  controls: {
    title: {
      type: "text",
      label: "Title",
      defaultValue: "My Application",
      group: "Content",
      supportsCMS: true,
    },
    showIcons: {
      type: "boolean",
      label: "Show Default Icons (Menu, Search, Profile)",
      defaultValue: true,
      group: "Content",
    },
    variant: {
      type: "select",
      label: "Size / Variant",
      group: "Aesthetics",
      defaultValue: "small",
      options: [
        { label: "Small (Standard)", value: "small" },
        { label: "Center Aligned", value: "center" },
        { label: "Medium (Collapsible)", value: "medium" },
        { label: "Large (Collapsible)", value: "large" },
      ],
    },
    color: {
      type: "select",
      label: "Background Color",
      group: "Aesthetics",
      defaultValue: "surface",
      options: [
        { label: "Surface", value: "surface" },
        { label: "Surface Container Lowest", value: "surface-container-lowest" },
        { label: "Surface Container Low", value: "surface-container-low" },
        { label: "Surface Container", value: "surface-container" },
        { label: "Surface Container High", value: "surface-container-high" },
        { label: "Surface Container Highest", value: "surface-container-highest" },
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Transparent", value: "transparent" },
      ],
    },
    scrollBehavior: {
      type: "select",
      label: "Scroll Behavior",
      group: "Behavior",
      defaultValue: "pinned",
      description: "Note: Scroll effects apply when previewing the live site.",
      options: [
        { label: "Pinned (Sticky)", value: "pinned" },
        { label: "Floating (Reveals on scroll up)", value: "floating" },
        { label: "Hide (Scrolls away)", value: "hide" },
      ],
    },
  },
};
