// src/lib/components/website-studio/builder/ComponentsTab.tsx
import React from "react";
import { clsx } from "clsx";
import { Search, FolderOpen, Folder } from "lucide-react";
import { Input } from "../../input";
import { TreeView } from "../../tree-view";
import { Typography } from "../../typography";
import { useStudioStore } from "../store";
import { getNodeIcon } from "./helpers";
import type { ComponentTreeNode } from "./types";

interface ComponentsTabProps {
  assetSearch: string;
  setAssetSearch: (val: string) => void;
  componentTreeData: ComponentTreeNode[];
  expandedAssetIds: string[];
  setExpandedAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ComponentsTab: React.FC<ComponentsTabProps> = ({
  assetSearch,
  setAssetSearch,
  componentTreeData,
  expandedAssetIds,
  setExpandedAssetIds,
}) => {
  const { viewContext, setViewContext } = useStudioStore();

  return (
    <div className="p-0 flex flex-col h-full overflow-hidden">
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
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <TreeView<ComponentTreeNode>
          multiSelect
          data={componentTreeData}
          getId={(n) => n.id}
          getChildren={(n) => n.children}
          selectedId={
            viewContext.type === "COMPONENT"
              ? viewContext.id || undefined
              : undefined
          }
          onSelect={(id, node) => {
            if (!node.isCategory) {
              setViewContext("COMPONENT", id);
            }
          }}
          expandedIds={expandedAssetIds}
          onExpandedChange={setExpandedAssetIds}
          variant="ghost"
          size="md"
          shape="minimal"
          renderItem={(node, { isSelected, isExpanded }) => (
            <div className="flex items-center justify-start gap-2 w-full pr-2 text-left min-w-0">
              <div className="shrink-0 opacity-70">
                {node.isCategory ? (
                  isExpanded ? (
                    <FolderOpen size={16} className="text-primary" />
                  ) : (
                    <Folder size={16} className="text-primary" />
                  )
                ) : (
                  getNodeIcon(node.id)
                )}
              </div>
              <Typography
                variant="label-small"
                className={clsx(
                  "truncate flex-1 text-left",
                  isSelected ? "font-bold text-primary" : "font-medium",
                )}
              >
                {node.name}
              </Typography>
            </div>
          )}
        />
      </div>
    </div>
  );
};
