"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { clsx } from "clsx";
import type { ComponentRegistry } from "./types";
import { useTheme } from "../../context/ThemeProvider";

export type BlockNodeData = {
  type: string;
  props: Record<string, any>;
  components: ComponentRegistry;
  cmsData?: any;
  onSelectNode: (id: string) => void;
};

export type BlockNodeType = Node<BlockNodeData, "block">;

export const BlockNode = memo(
  ({ id, data, selected }: NodeProps<BlockNodeType>) => {
    const { resolvedTheme } = useTheme();
    const componentType = data.type;
    const ComponentDef = data.components[componentType];

    if (!ComponentDef) {
      return (
        <div className="p-4 border border-dashed border-red-500 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200 rounded-lg text-xs">
          Missing Component: {componentType}
        </div>
      );
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          data.onSelectNode(id);
        }}
        className={clsx(
          "relative group transition-all duration-200 ease-in-out w-[800px] bg-background border rounded-2xl overflow-hidden",
          selected
            ? "ring-2 ring-primary border-transparent shadow-lg"
            : "border-outline-variant/50 hover:border-outline-variant shadow-sm",
        )}
      >
        {/* React Flow Handles for vertical reordering / connections */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-primary border-2 border-white dark:border-black opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {/* Render the actual component inside the node */}
        <div className="pointer-events-none select-none">
          <ComponentDef.render {...data.props} />
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-primary border-2 border-white dark:border-black opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {/* Node label overlay */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {ComponentDef.name}
        </div>
      </div>
    );
  },
);

BlockNode.displayName = "BlockNode";
