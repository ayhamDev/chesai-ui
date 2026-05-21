"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { clsx } from "clsx";
import type { ComponentRegistry, StudioNode } from "./types";
import { BlockNode, type BlockNodeType } from "./BlockNode";
import { useTheme } from "../../context/ThemeProvider";

export interface BuilderProps {
  components: ComponentRegistry;
  data: StudioNode[];
  cms?: any;
  onSelectNode?: (id: string | null) => void;
  className?: string;
}

const nodeTypes = {
  block: BlockNode,
};

export const Builder: React.FC<BuilderProps> = ({
  components,
  data,
  cms = {},
  onSelectNode,
  className,
}) => {
  const { resolvedTheme } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState<BlockNodeType>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Map StudioNode tree to React Flow flat node hierarchy
  useEffect(() => {
    const flowNodes: BlockNodeType[] = [];
    const flowEdges: Edge[] = [];
    let currentY = 50;

    data.forEach((node, index) => {
      const nodeId = node.id;

      flowNodes.push({
        id: nodeId,
        type: "block",
        position: { x: 100, y: currentY },
        data: {
          type: node.type,
          props: node.props,
          components,
          cmsData: cms,
          onSelectNode: (selectedId) => onSelectNode?.(selectedId),
        },
      });

      // Connect blocks vertically to represent sequential page order
      if (index > 0) {
        flowEdges.push({
          id: `edge-${data[index - 1].id}-${nodeId}`,
          source: data[index - 1].id,
          target: nodeId,
          type: "smoothstep",
          animated: true,
          style: { stroke: "var(--md-sys-color-primary)", strokeWidth: 1.5 },
        });
      }

      // Height offset approximation for visual spacing on canvas
      currentY += 280;
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [data, components, cms, setNodes, setEdges, onSelectNode]);

  return (
    <div
      className={clsx("w-full h-full bg-surface-container-lowest", className)}
      onClick={() => onSelectNode?.(null)}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        colorMode={resolvedTheme}
        className="w-full h-full"
      >
        <Background
          color={resolvedTheme === "dark" ? "#333" : "#ccc"}
          gap={16}
          size={1}
        />
        <Controls
          showInteractive={false}
          className="bg-surface-container-high border border-outline-variant/30 text-on-surface [&_button]:border-outline-variant/10"
        />
      </ReactFlow>
    </div>
  );
};
