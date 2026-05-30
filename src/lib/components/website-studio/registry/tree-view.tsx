import React, { useState } from "react";
import { TreeView } from "../../tree-view";
import { Folder, FolderOpen, FileText, Image as ImageIcon } from "lucide-react";
import type { RegistryComponent } from "../types";

type MockTreeNode = {
  id: string;
  name: string;
  type: "folder" | "file" | "image";
  children?: MockTreeNode[];
};

const MOCK_TREE: MockTreeNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      { id: "App.tsx", name: "App.tsx", type: "file" },
      { id: "index.css", name: "index.css", type: "file" },
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [
          { id: "Button.tsx", name: "Button.tsx", type: "file" },
          { id: "Card.tsx", name: "Card.tsx", type: "file" },
        ],
      },
    ],
  },
  { id: "package.json", name: "package.json", type: "file" },
  { id: "README.md", name: "README.md", type: "file" },
];

export const TreeViewConfig: RegistryComponent = {
  name: "Tree View",
  category: "Data Display",
  render: ({ variant, shape, size, multiSelect, enableDragAndDrop, ...props }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [expandedIds, setExpandedIds] = useState<string[]>(["src", "components"]);

    return (
      <div className="w-full max-w-sm border border-outline-variant/30 rounded-2xl bg-surface-container-lowest p-4 shadow-sm" {...props}>
        <TreeView<MockTreeNode>
          data={MOCK_TREE}
          getId={(node) => node.id}
          getChildren={(node) => node.children}
          canHaveChildren={(node) => node.type === "folder"}
          variant={variant}
          shape={shape}
          size={size}
          multiSelect={multiSelect}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          expandedIds={expandedIds}
          onExpandedChange={setExpandedIds}
          enableDragAndDrop={enableDragAndDrop}
          renderItem={(node, { isExpanded }) => (
            <div className="flex items-center gap-2 w-full text-left">
              {node.type === "folder" ? (
                isExpanded ? (
                  <FolderOpen size={16} className="text-blue-500 shrink-0" />
                ) : (
                  <Folder size={16} className="text-blue-500 shrink-0" />
                )
              ) : node.type === "image" ? (
                <ImageIcon size={16} className="text-purple-500 shrink-0" />
              ) : (
                <FileText size={16} className="text-gray-500 shrink-0" />
              )}
              <span className="truncate flex-1">{node.name}</span>
            </div>
          )}
        />
      </div>
    );
  },
  controls: {
    variant: {
      type: "select",
      label: "Variant",
      group: "Aesthetics",
      defaultValue: "secondary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Ghost", value: "ghost" },
      ],
    },
    shape: {
      type: "select",
      label: "Item Shape",
      group: "Aesthetics",
      defaultValue: "minimal",
      options: [
        { label: "Full (Pill)", value: "full" },
        { label: "Minimal (Rounded)", value: "minimal" },
        { label: "Sharp (Square)", value: "sharp" },
      ],
    },
    size: {
      type: "select",
      label: "Item Size",
      group: "Aesthetics",
      defaultValue: "md",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
      ],
    },
    multiSelect: {
      type: "boolean",
      label: "Allow Multi-Select",
      group: "Behavior",
      defaultValue: false,
    },
    enableDragAndDrop: {
      type: "boolean",
      label: "Enable Drag and Drop",
      group: "Behavior",
      defaultValue: true,
    },
  },
};
