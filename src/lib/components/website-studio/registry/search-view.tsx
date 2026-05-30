import React, { useState } from "react";
import * as Icons from "lucide-react";
import { SearchView } from "../../search-view";
import { Item, ItemContent, ItemTitle, ItemMedia } from "../../item";
import { Typography } from "../../typography";
import type { RegistryComponent } from "../types";

export const SearchViewConfig: RegistryComponent = {
  name: "Search View",
  category: "Navigation",
  render: ({
    placeholder,
    variant,
    color,
    triggerVariant,
    desktopRadius,
    dockedLeadingIcon,
    ...props
  }) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const LeadingIconComp = dockedLeadingIcon ? (Icons as any)[dockedLeadingIcon] : (Icons as any)["Search"];

    return (
      <div className="w-full relative" {...props}>
        <SearchView
          value={query}
          onChange={setQuery}
          open={isOpen}
          onOpenChange={setIsOpen}
          placeholder={placeholder || "Search..."}
          variant={variant}
          color={color}
          triggerVariant={triggerVariant}
          desktopRadius={desktopRadius}
          dockedLeadingIcon={LeadingIconComp ? <LeadingIconComp size={20} /> : undefined}
          className="shadow-sm border border-outline-variant/30"
        >
          <div className="py-2 pointer-events-none">
            {query.length === 0 ? (
              <>
                <div className="px-4 py-3">
                  <Typography variant="body-small" className="font-bold opacity-70">
                    Recent Searches
                  </Typography>
                </div>
                <Item variant="ghost" className="px-4 py-3 rounded-none">
                  <ItemMedia><Icons.History size={20} className="opacity-50" /></ItemMedia>
                  <ItemContent><ItemTitle className="font-normal text-base">Dashboard components</ItemTitle></ItemContent>
                </Item>
                <Item variant="ghost" className="px-4 py-3 rounded-none">
                  <ItemMedia><Icons.History size={20} className="opacity-50" /></ItemMedia>
                  <ItemContent><ItemTitle className="font-normal text-base">How to route in Next.js</ItemTitle></ItemContent>
                </Item>
              </>
            ) : (
              <>
                <div className="px-4 py-3">
                  <Typography variant="body-small" className="font-bold opacity-70">
                    Results for "{query}"
                  </Typography>
                </div>
                <Item variant="ghost" className="px-4 py-3 rounded-none">
                  <ItemMedia><Icons.Search size={20} className="opacity-50" /></ItemMedia>
                  <ItemContent><ItemTitle className="font-normal text-base">{query} settings</ItemTitle></ItemContent>
                </Item>
              </>
            )}
          </div>
        </SearchView>
      </div>
    );
  },
  controls: {
    placeholder: {
      type: "text",
      label: "Search Placeholder",
      defaultValue: "Search the docs...",
      group: "Content",
    },
    dockedLeadingIcon: {
      type: "text",
      label: "Leading Icon (Lucide)",
      defaultValue: "Search",
      group: "Icons",
    },
    variant: {
      type: "select",
      label: "Expansion Variant",
      group: "Behavior",
      defaultValue: "modal",
      options: [
        { label: "Modal (Centered Overlay)", value: "modal" },
        { label: "Docked (Expands In-Place)", value: "docked" },
        { label: "Fullscreen (Mobile Default)", value: "fullscreen" },
      ],
    },
    triggerVariant: {
      type: "select",
      label: "Trigger Bar Style",
      group: "Aesthetics",
      defaultValue: "default",
      options: [
        { label: "Default (Search Bar)", value: "default" },
        { label: "Minimal (No Icons)", value: "minimal" },
        { label: "Icon Only", value: "icon" },
      ],
    },
    color: {
      type: "select",
      label: "Color Theme",
      group: "Aesthetics",
      defaultValue: "surface",
      options: [
        { label: "Surface (Base)", value: "surface" },
        { label: "Primary Container", value: "primary" },
        { label: "Secondary Container", value: "secondary" },
        { label: "Transparent", value: "transparent" },
      ],
    },
    desktopRadius: {
      type: "text",
      label: "Expanded Border Radius",
      description: "CSS Value (e.g. 28px, 1rem)",
      defaultValue: "28px",
      group: "Aesthetics",
    },
  },
};
