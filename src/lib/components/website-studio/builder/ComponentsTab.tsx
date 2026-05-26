// src/lib/components/website-studio/builder/ComponentsTab.tsx
import React from "react";
import { clsx } from "clsx";
import { Search, Eye, Plus } from "lucide-react";
import { Input } from "../../input";
import { Typography } from "../../typography";
import { ContextMenu } from "../../context-menu";
import { useStudioStore } from "../store";
import { getNodeIcon } from "./helpers";
import type { ComponentTreeNode } from "./types";

interface ComponentsTabProps {
  assetSearch: string;
  setAssetSearch: (val: string) => void;
  componentTreeData: ComponentTreeNode[];
  // Kept for prop compatibility with parent, though unused in grid view
  expandedAssetIds: string[];
  setExpandedAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ComponentsTab: React.FC<ComponentsTabProps> = ({
  assetSearch,
  setAssetSearch,
  componentTreeData,
}) => {
  const { viewContext, setViewContext, activePageId, addNode } =
    useStudioStore();

  const handleShowStandalone = (id: string) => {
    setViewContext("COMPONENT", id);
  };

  return (
    <div className="p-0 flex flex-col h-full overflow-hidden">
      {/* SEARCH BAR */}
      <div className="p-3 border-b border-outline-variant/30 shrink-0">
        <Input
          placeholder="Search components..."
          size="sm"
          startContent={<Search size={16} className="opacity-50" />}
          variant="filled"
          value={assetSearch}
          onChange={(e) => setAssetSearch(e.target.value)}
        />
      </div>

      {/* COMPONENT GRID */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin flex flex-col gap-6">
        {componentTreeData.map((category) => (
          <div key={category.id} className="flex flex-col gap-3">
            {/* Category Header */}
            <Typography
              variant="label-medium"
              className="font-bold text-on-surface"
            >
              {category.name}
            </Typography>

            {/* Grid of Components */}
            <div className="grid grid-cols-2 gap-2">
              {category.children?.map((comp) => {
                const isSelected =
                  viewContext.type === "COMPONENT" &&
                  viewContext.id === comp.id;

                return (
                  <ContextMenu key={comp.id} shape="minimal">
                    <ContextMenu.Trigger asChild>
                      <button
                        type="button"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/studio-component",
                            comp.id,
                          );
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => handleShowStandalone(comp.id)}
                        className={clsx(
                          "flex items-center gap-3 p-2.5 rounded-xl border transition-colors text-left group w-full",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-surface-container-highest/40 border-transparent hover:bg-surface-container-highest",
                        )}
                      >
                        <div
                          className={clsx(
                            "shrink-0",
                            isSelected
                              ? "text-primary"
                              : "text-on-surface-variant group-hover:text-on-surface",
                          )}
                        >
                          {getNodeIcon(comp.id)}
                        </div>
                        <span
                          className={clsx(
                            "text-xs font-medium truncate",
                            isSelected ? "text-primary" : "text-on-surface",
                          )}
                        >
                          {comp.name}
                        </span>
                      </button>
                    </ContextMenu.Trigger>

                    {/* CONTEXT MENU */}
                    <ContextMenu.Content>
                      <ContextMenu.Item
                        onClick={() => handleShowStandalone(comp.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" /> Show Standalone
                      </ContextMenu.Item>

                      {/* Optional: Quick Add action to append to active page */}
                      <ContextMenu.Separator />
                      <ContextMenu.Item
                        onClick={() => {
                          if (!activePageId) return;
                          addNode({
                            id: `${comp.id.toLowerCase()}_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`,
                            type: comp.id,
                            props: {},
                            children: [],
                          });
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add to Page
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  </ContextMenu>
                );
              })}
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {componentTreeData.length === 0 && (
          <div className="text-center opacity-50 text-xs py-8">
            No components match your search.
          </div>
        )}
      </div>
    </div>
  );
};
