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
          "A highly generic tree view component. Features VS Code-style `dnd-kit` drag-and-drop. You can drop before, after, or directly inside folders without modifying real-time state until release.",
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

// Recursive helper to move a node within the tree state
function moveNodeInTree(
  tree: FileNode[],
  activeId: string,
  parentId: string | null,
  index: number,
): FileNode[] {
  let activeNode: FileNode | null = null;

  // 1. Remove the active node from its old location
  function remove(nodes: FileNode[]): FileNode[] {
    return nodes.filter((node) => {
      if (node.id === activeId) {
        activeNode = node;
        return false;
      }
      if (node.children) {
        node.children = remove(node.children);
      }
      return true;
    });
  }

  const treeWithoutActive = remove(tree);
  if (!activeNode) return tree;

  // 2. Insert the node into its new location
  function insert(
    nodes: FileNode[],
    currentParentId: string | null,
  ): FileNode[] {
    if (currentParentId === parentId) {
      const newNodes = [...nodes];
      newNodes.splice(index, 0, activeNode!);
      return newNodes;
    }
    return nodes.map((node) => {
      if (node.id === parentId) {
        const newChildren = [...(node.children || [])];
        newChildren.splice(index, 0, activeNode!);
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
  name: "1. File Explorer (Drag & Drop)",
  args: {
    variant: "ghost",
    size: "sm",
    shape: "minimal",
    enableDragAndDrop: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "This example enables `enableDragAndDrop`. Nodes at the same hierarchical level can be re-ordered. Dragging over the top/bottom edges of an item places it as a sibling. Dragging over the center of a folder places it inside.",
      },
    },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<string | null>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [files, setFiles] = useState<FileNode[]>(INITIAL_FILE_SYSTEM);

    const handleMoveNode = ({
      activeId,
      parentId,
      index,
    }: {
      activeId: string;
      parentId: string | null;
      index: number;
    }) => {
      setFiles((prev) => moveNodeInTree(prev, activeId, parentId, index));
    };

    return (
      <Card className="w-96 min-h-[400px] p-2 bg-surface-container-lowest">
        <Typography
          variant="label-small"
          className="px-4 py-2 font-bold opacity-50 uppercase tracking-widest"
        >
          Explorer
        </Typography>
        <TreeView<FileNode>
          {...args}
          data={files}
          getId={(node) => node.id}
          getChildren={(node) => node.children}
          canHaveChildren={(node) => node.type === "folder"}
          selectedId={selected}
          onSelect={(id) => setSelected(id)}
          onMoveNode={handleMoveNode}
          renderItem={(node, { isExpanded }) => (
            <div className="flex items-center justify-start gap-2 w-full pr-2 text-left">
              {getIconForType(node.type, isExpanded)}
              <span className="truncate flex-1 text-left">{node.name}</span>
            </div>
          )}
        />
      </Card>
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selected, setSelected] = useState<string | null>("hero-content");
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
