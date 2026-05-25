// src/lib/components/website-studio/builder/helpers.tsx
import React from "react";
import {
  Box,
  LayoutTemplate,
  MousePointerClick,
  Square,
  Type,
  Image as ImageIcon,
} from "lucide-react";
import type { StudioNode } from "../types";

export const getNodeIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("text") || t.includes("heading") || t.includes("paragraph"))
    return <Type className="w-4 h-4 opacity-70" />;
  if (t.includes("image") || t.includes("picture"))
    return <ImageIcon className="w-4 h-4 opacity-70" />;
  if (t.includes("button") || t.includes("link"))
    return <MousePointerClick className="w-4 h-4 opacity-70" />;
  if (t.includes("section") || t.includes("container"))
    return <LayoutTemplate className="w-4 h-4 opacity-70" />;
  if (t.includes("flex") || t.includes("grid"))
    return <Square className="w-4 h-4 opacity-70" />;
  return <Box className="w-4 h-4 opacity-70" />;
};

export const filterTree = (
  nodes: StudioNode[],
  query: string,
): StudioNode[] => {
  if (!query) return nodes;
  const lowerQuery = query.toLowerCase();
  return nodes
    .map((node) => {
      const matches =
        node.type.toLowerCase().includes(lowerQuery) ||
        node.id.toLowerCase().includes(lowerQuery);
      const filteredChildren = node.children
        ? filterTree(node.children, query)
        : [];
      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children:
            filteredChildren.length > 0 ? filteredChildren : node.children,
        };
      }
      return null;
    })
    .filter(Boolean) as StudioNode[];
};
