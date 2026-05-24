import type { Meta, StoryObj } from "@storybook/react";
import {
  Box,
  Code,
  FileText,
  Folder,
  FolderOpen,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { TreeView } from "./index";
import { Card } from "../card";
import { Typography } from "../typography";

const meta: Meta<typeof TreeView> = {
  title: "Components/Data/TreeView",
  component: TreeView,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A highly generic tree view component. Features VS Code-style `dnd-kit` drag-and-drop, and advanced multi-selection features.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    enableDragAndDrop: {
      control: "boolean",
    },
    multiSelect: {
      control: "boolean",
    },
  },
};

export default meta;

// --- MOCK DATA (File System) ---
type FileNode = {
  id: string;
  name: string;
  type: "folder" | "file" | "image" | "code";
  children?: FileNode[];
};

const INITIAL_FILE_SYSTEM: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [
          { id: "Button.tsx", name: "Button.tsx", type: "code" },
          { id: "Card.tsx", name: "Card.tsx", type: "code" },
        ],
      },
      {
        id: "assets",
        name: "assets",
        type: "folder",
        children: [
          { id: "logo.png", name: "logo.png", type: "image" },
          { id: "banner.jpg", name: "banner.jpg", type: "image" },
        ],
      },
      { id: "index.ts", name: "index.ts", type: "code" },
    ],
  },
  { id: "package.json", name: "package.json", type: "code" },
  { id: "README.md", name: "README.md", type: "file" },
];

const getIconForType = (type: FileNode["type"], isExpanded: boolean) => {
  switch (type) {
    case "folder":
      return isExpanded ? (
        <FolderOpen size={16} className="text-blue-500" />
      ) : (
        <Folder size={16} className="text-blue-500" />
      );
    case "image":
      return <ImageIcon size={16} className="text-purple-500" />;
    case "code":
      return <Code size={16} className="text-yellow-500" />;
    default:
      return <FileText size={16} className="text-gray-500" />;
  }
};

// Advanced helper to move MULTIPLE nodes within the tree state flawlessly
function moveNodesInTree(
  tree: FileNode[],
  activeIds: string[],
  parentId: string | null,
  index: number,
): FileNode[] {
  // Identify only top-level selected nodes so we don't accidentally duplicate children
  const topLevelActiveIds = new Set<string>();

  function findTopLevelActive(nodes: FileNode[], hasActiveAncestor: boolean) {
    for (const node of nodes) {
      const isActive = activeIds.includes(node.id);
      if (isActive && !hasActiveAncestor) {
        topLevelActiveIds.add(node.id);
      }
      if (node.children) {
        findTopLevelActive(node.children, hasActiveAncestor || isActive);
      }
    }
  }

  findTopLevelActive(tree, false);

  const nodesToMove: FileNode[] = [];
  let targetIndex = index;

  // Extract nodes and adjust target index if removing from the same parent BEFORE the target index
  function extract(
    nodes: FileNode[],
    currentParentId: string | null,
  ): FileNode[] {
    const remaining: FileNode[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (topLevelActiveIds.has(node.id)) {
        nodesToMove.push(node);
        // Ensure index adjustment if we remove earlier nodes in the same target parent list
        if (currentParentId === parentId && i < targetIndex) {
          targetIndex--;
        }
      } else {
        const newNode = { ...node };
        if (newNode.children) {
          newNode.children = extract(newNode.children, newNode.id);
        }
        remaining.push(newNode);
      }
    }
    return remaining;
  }

  const treeWithoutActive = extract(tree, null);

  function insert(
    nodes: FileNode[],
    currentParentId: string | null,
  ): FileNode[] {
    if (currentParentId === parentId) {
      const newNodes = [...nodes];
      newNodes.splice(targetIndex, 0, ...nodesToMove);
      return newNodes;
    }
    return nodes.map((node) => {
      if (node.id === parentId) {
        const newChildren = [...(node.children || [])];
        newChildren.splice(targetIndex, 0, ...nodesToMove);
        return { ...node, children: newChildren };
      }
      if (node.children) {
        return { ...node, children: insert(node.children, node.id) };
      }
      return node;
    });
  }

  return insert(treeWithoutActive, null);
}

export const FileExplorerWithDnD: StoryObj = {
  name: "1. File Explorer (Multi-Drag & Drop)",
  args: {
    variant: "ghost",
    size: "sm",
    shape: "minimal",
    enableDragAndDrop: true,
    multiSelect: true, // Switched on for testing multi-drag!
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [files, setFiles] = useState<FileNode[]>(INITIAL_FILE_SYSTEM);

    const handleMoveNode = ({
      activeIds,
      parentId,
      index,
    }: {
      activeId: string;
      activeIds: string[];
      parentId: string | null;
      index: number;
    }) => {
      setFiles((prev) => moveNodesInTree(prev, activeIds, parentId, index));
    };

    return (
      <div className="flex flex-col gap-4">
        <Card className="w-96 min-h-[400px] p-2 bg-surface-container-lowest">
          <Typography
            variant="label-small"
            className="px-4 py-2 font-bold opacity-50 uppercase tracking-widest flex items-center justify-between"
          >
            <span>Explorer</span>
            <span className="normal-case opacity-70 font-normal">
              Use Cmd/Ctrl to Multi-select
            </span>
          </Typography>
          <TreeView<FileNode>
            {...args}
            data={files}
            getId={(node) => node.id}
            getChildren={(node) => node.children}
            canHaveChildren={(node) => node.type === "folder"}
            selectedIds={selectedIds}
            onSelectChange={(ids) => setSelectedIds(ids)}
            onMoveNode={handleMoveNode}
            renderItem={(node, { isExpanded }) => (
              <div className="flex items-center justify-start gap-2 w-full pr-2 text-left">
                {getIconForType(node.type, isExpanded)}
                <span className="truncate flex-1 text-left">{node.name}</span>
              </div>
            )}
          />
        </Card>
      </div>
    );
  },
};

// --- MOCK DATA (Website Studio Layers) ---
type LayerNode = {
  id: string;
  name: string;
  locked?: boolean;
  children?: LayerNode[];
};

const INITIAL_LAYERS: LayerNode[] = [
  {
    id: "hero-section",
    name: "Hero Section",
    children: [
      { id: "nav-bar", name: "Navigation Bar" },
      {
        id: "hero-content",
        name: "Hero Content",
        children: [
          { id: "hero-title", name: "Heading 1" },
          { id: "hero-subtitle", name: "Paragraph" },
          { id: "hero-cta", name: "Button (Primary)" },
        ],
      },
    ],
  },
  {
    id: "features",
    name: "Features Grid",
    children: [
      { id: "card-1", name: "Feature Card 1" },
      { id: "card-2", name: "Feature Card 2" },
      { id: "card-3", name: "Feature Card 3" },
    ],
  },
];

export const StudioLayers: StoryObj = {
  name: "2. Studio Layers (No DnD)",
  args: {
    variant: "secondary",
    size: "md",
    shape: "minimal",
  },
  render: (args) => {
    const [selected, setSelected] = useState<string | null>("hero-content");
    const [expanded, setExpanded] = useState<string[]>([
      "hero-section",
      "hero-content",
    ]);

    return (
      <Card className="w-[350px] p-2 bg-surface">
        <Typography
          variant="label-small"
          className="px-4 py-2 font-bold opacity-50 uppercase tracking-widest"
        >
          Layers
        </Typography>
        <TreeView<LayerNode>
          {...args}
          data={INITIAL_LAYERS}
          getId={(node) => node.id}
          getChildren={(node) => node.children}
          selectedId={selected}
          onSelect={(id) => setSelected(id)}
          expandedIds={expanded}
          onExpandedChange={setExpanded}
          renderItem={(node, { isSelected }) => (
            <div className="flex items-center justify-start gap-2 w-full pr-2 group/item text-left">
              <Box size={14} className="opacity-70 shrink-0" />
              <span
                className={`truncate flex-1 text-left ${
                  isSelected ? "font-bold" : "font-medium"
                }`}
              >
                {node.name}
              </span>
              <div
                className={`opacity-0 group-hover/item:opacity-50 transition-opacity text-[10px] uppercase font-bold tracking-wider ${
                  isSelected ? "opacity-50" : ""
                }`}
              >
                Edit
              </div>
            </div>
          )}
        />
      </Card>
    );
  },
};

export const MultiSelectMode: StoryObj = {
  name: "3. Multi-Select List",
  args: {
    variant: "ghost",
    size: "md",
    shape: "minimal",
    multiSelect: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Enable `multiSelect={true}` and pass `selectedIds` to allow range selection via Shift + Click and toggling via Ctrl/Cmd + Click.",
      },
    },
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    return (
      <div className="flex flex-col gap-4">
        <Card className="w-[400px] p-2 bg-surface">
          <Typography
            variant="label-small"
            className="px-4 py-2 font-bold opacity-50 uppercase tracking-widest"
          >
            Multi-Select Demo
          </Typography>
          <Typography variant="body-small" className="px-4 pb-2 opacity-60">
            Use Shift+Click for ranges, or Ctrl/Cmd+Click to toggle items.
          </Typography>

          <TreeView<FileNode>
            {...args}
            data={INITIAL_FILE_SYSTEM}
            getId={(node) => node.id}
            getChildren={(node) => node.children}
            canHaveChildren={(node) => node.type === "folder"}
            selectedIds={selectedIds}
            onSelectChange={(ids) => setSelectedIds(ids)}
            renderItem={(node, { isExpanded }) => (
              <div className="flex items-center justify-start gap-2 w-full pr-2 text-left">
                {getIconForType(node.type, isExpanded)}
                <span className="truncate flex-1 text-left">{node.name}</span>
              </div>
            )}
          />
        </Card>

        <Card className="w-[400px] p-4 bg-surface-container-high border border-outline-variant/30">
          <Typography variant="label-medium" className="font-bold">
            Selected Items ({selectedIds.length})
          </Typography>
          <div className="mt-2 text-xs font-mono break-all opacity-80">
            {selectedIds.length > 0 ? selectedIds.join(", ") : "None"}
          </div>
        </Card>
      </div>
    );
  },
};
