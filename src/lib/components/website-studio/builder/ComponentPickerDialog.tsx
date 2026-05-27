// src/lib/components/website-studio/builder/ComponentPickerDialog.tsx
"use client";

import React, { useMemo } from "react";
import { useStudioStore } from "../store";
import { useBuilderContext } from "../BuilderContext";
import { getNodeIcon } from "./helpers";
import type { StudioNode } from "../types";
import {
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../command";

// Helper to find old node if replacing, to carry over children
const findNodeRecursively = (
  nodes: StudioNode[],
  targetId: string,
): StudioNode | null => {
  for (const n of nodes) {
    if (n.id === targetId) return n;
    if (n.children) {
      const found = findNodeRecursively(n.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

export const ComponentPickerDialog = () => {
  const {
    componentPicker,
    closeComponentPicker,
    insertNodeRelative,
    replaceNode,
    website,
    activePageId,
  } = useStudioStore();

  const { components } = useBuilderContext();

  // cmdk automatically handles search filtering internally based on the CommandItem's `value` prop.
  // So we only need to group and map the raw registry data once.
  const componentTreeData = useMemo(() => {
    const categories = Array.from(
      new Set(Object.values(components).map((c) => c.category)),
    );
    return categories
      .map((cat) => ({
        id: `cat-${cat}`,
        name: cat,
        children: Object.entries(components)
          .filter(([_, comp]) => comp.category === cat)
          .map(([key, comp]) => ({ id: key, name: comp.name })),
      }))
      .filter((cat) => cat.children.length > 0);
  }, [components]);

  const handleSelect = (compId: string) => {
    if (!componentPicker.targetId || !componentPicker.action) return;

    // Create a fresh instance of the requested component
    const newNode: StudioNode = {
      id: `${compId.toLowerCase()}_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`,
      type: compId,
      props: {},
      children: [],
    };

    if (componentPicker.action === "replace") {
      const activePage = website?.pages.find((p) => p.id === activePageId);
      if (activePage) {
        const oldNode = findNodeRecursively(
          activePage.content,
          componentPicker.targetId,
        );
        // If it replaces an element and the new element accepts children, carry over the old layout!
        if (
          oldNode &&
          oldNode.children &&
          components[compId]?.acceptsChildren
        ) {
          newNode.children = oldNode.children;
        }
      }
      replaceNode(componentPicker.targetId, newNode);
    } else {
      insertNodeRelative(
        newNode,
        componentPicker.targetId,
        componentPicker.action,
      );
    }

    closeComponentPicker();
  };

  const actionText =
    componentPicker.action === "replace" ? "replace" : "insert";

  return (
    <CommandDialog
      open={componentPicker.isOpen}
      onOpenChange={(open) => !open && closeComponentPicker()}
      glass={false}
    >
      <CommandInput placeholder={`Search components to ${actionText}...`} />
      <CommandList className="max-h-[500px]">
        <CommandEmpty>No components found.</CommandEmpty>

        {componentTreeData.map((cat) => (
          <CommandGroup key={cat.id} heading={cat.name}>
            {cat.children.map((comp) => (
              <CommandItem
                key={comp.id}
                // CommandItem uses the `value` prop to match against the user's search input natively
                value={comp.name}
                onSelect={() => handleSelect(comp.id)}
                className="flex items-center gap-3 py-3 cursor-pointer"
              >
                <div className="text-primary opacity-70 flex shrink-0 items-center justify-center">
                  {getNodeIcon(comp.id)}
                </div>
                <span className="font-medium text-base">{comp.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <CommandFooter />
    </CommandDialog>
  );
};
