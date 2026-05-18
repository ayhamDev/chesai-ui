import React, { ErrorInfo } from "react";
import type { ComponentRegistry, PageSchema, StudioNode } from "./types";

// --- 1. Safety Boundary ---
class NodeErrorBoundary extends React.Component<
  { nodeType: string; children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[Renderer Error in ${this.props.nodeType}]:`,
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border-2 border-dashed border-red-500 bg-red-50 text-red-900 rounded-lg">
          <strong>Failed to render: {this.props.nodeType}</strong>
          <p className="text-xs mt-2 font-mono">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- 2. Recursive Node Renderer ---
interface RenderNodeProps {
  node: StudioNode;
  components: ComponentRegistry;
}

const RenderNode: React.FC<RenderNodeProps> = ({ node, components }) => {
  const ComponentDef = components[node.type];

  if (!ComponentDef) {
    console.warn(
      `[WebsiteStudio] Component type "${node.type}" not found in registry.`,
    );
    return (
      <div className="p-2 border border-dashed border-yellow-500 bg-yellow-50 text-yellow-900 text-xs">
        Missing: {node.type}
      </div>
    );
  }

  // Evaluate nested children recursively
  const renderedChildren = node.children?.map((childNode) => (
    <RenderNode key={childNode.id} node={childNode} components={components} />
  ));

  return (
    <NodeErrorBoundary nodeType={node.type}>
      <ComponentDef.render {...node.props}>
        {renderedChildren?.length ? renderedChildren : node.props.children}
      </ComponentDef.render>
    </NodeErrorBoundary>
  );
};

// --- 3. Main Renderer Export ---
export interface RendererProps {
  components: ComponentRegistry;
  data: PageSchema | StudioNode[];
}

export const Renderer: React.FC<RendererProps> = ({ components, data }) => {
  const nodes = Array.isArray(data) ? data : data.content;

  if (!nodes || nodes.length === 0) return null;

  return (
    <>
      {nodes.map((node) => (
        <RenderNode key={node.id} node={node} components={components} />
      ))}
    </>
  );
};
