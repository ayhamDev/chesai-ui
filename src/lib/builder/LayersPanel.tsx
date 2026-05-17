import React from "react";
import {
  ChevronRight,
  Component,
  LayoutTemplate,
  Type,
  MousePointerClick,
  Image as ImageIcon,
} from "lucide-react";
import { useBuilderStore } from "./store";
import { clsx } from "clsx";
import { Typography } from "../components/typography";

// Helper to pick an icon based on node type
const getTypeIcon = (type: string) => {
  switch (type) {
    case "Container":
      return <LayoutTemplate className="w-3.5 h-3.5" />;
    case "Typography":
      return <Type className="w-3.5 h-3.5" />;
    case "Button":
      return <MousePointerClick className="w-3.5 h-3.5" />;
    case "Image":
      return <ImageIcon className="w-3.5 h-3.5" />;
    default:
      return <Component className="w-3.5 h-3.5" />;
  }
};

// Recursive Layer Item
const LayerItem = ({ id, depth = 0 }: { id: string; depth?: number }) => {
  const node = useBuilderStore(
    (state) => state.pages[state.activePageId]?.nodes[id],
  );
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const selectNode = useBuilderStore((state) => state.selectNode);

  if (!node) return null;

  const isSelected = selectedNodeId === id;
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col">
      <button
        onClick={(e) => {
          e.stopPropagation();
          selectNode(id);
        }}
        className={clsx(
          "flex items-center w-full h-8 px-2 gap-2 text-left outline-none transition-colors",
          isSelected
            ? "bg-primary/10 text-primary font-bold"
            : "hover:bg-surface-container-highest text-on-surface-variant",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0 opacity-50">
          {hasChildren && <ChevronRight className="w-3 h-3" />}
        </div>
        <div className="shrink-0 opacity-80">{getTypeIcon(node.type)}</div>
        <Typography
          variant="body-small"
          className="truncate flex-1 select-none"
        >
          {node.type}
        </Typography>
      </button>

      {/* Render children recursively */}
      {hasChildren && (
        <div className="flex flex-col">
          {node.children.map((childId) => (
            <LayerItem key={childId} id={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const LayersPanel = () => {
  // The root node always exists and starts the tree
  return (
    <div className="flex flex-col w-full py-2">
      <LayerItem id="ROOT" />
    </div>
  );
};
