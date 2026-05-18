import React, { ErrorInfo } from "react";
import type {
  ComponentRegistry,
  DesignSystemSchema,
  PageSchema,
  StudioNode,
  StudioEventAction,
} from "./types";

// ============================================================================
// 1. HELPERS: CMS Interpolation & Event Binding
// ============================================================================

/**
 * Safely resolves dot-notation paths (e.g. "hero.title") against an object.
 */
function getNestedValue(obj: any, path: string): any {
  return path
    .split(".")
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
      obj,
    );
}

/**
 * Recursively scans component props. If a string contains {{ path.to.data }},
 * it resolves it against the provided CMS Data object.
 */
function compileProps(
  props: Record<string, any>,
  cmsData: any,
): Record<string, any> {
  if (!cmsData || Object.keys(cmsData).length === 0) return props;

  const compiled: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "string" && value.includes("{{")) {
      // Replace all instances of {{ ... }} in the string
      compiled[key] = value.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = getNestedValue(cmsData, path.trim());
        return val !== undefined ? String(val) : "";
      });
    } else if (Array.isArray(value)) {
      // Optional: recursively compile arrays if needed
      compiled[key] = value;
    } else if (typeof value === "object" && value !== null) {
      // Recursively compile nested objects (e.g. responsive prop objects)
      compiled[key] = compileProps(value, cmsData);
    } else {
      compiled[key] = value;
    }
  }

  return compiled;
}

/**
 * Maps the JSON "events" array back into executable React event handlers (e.g. onClick).
 * Resolves standard actions from the registry or executes $customCode sandboxes.
 */
function bindEvents(
  nodeEvents: Record<string, StudioEventAction[]> | undefined,
  actionRegistry: Record<string, Function> = {},
  cmsData: any = {},
  customApi: any = {},
): Record<string, Function> {
  if (!nodeEvents || Object.keys(nodeEvents).length === 0) return {};

  const boundEvents: Record<string, Function> = {};

  for (const [eventName, actionsToRun] of Object.entries(nodeEvents)) {
    // Wrap the actions in an async event handler
    boundEvents[eventName] = async (e: React.SyntheticEvent) => {
      for (const actionDef of actionsToRun) {
        try {
          if (actionDef.actionId === "$customCode" && actionDef.code) {
            // Execution Sandbox: Injects event, cms data, and developer API into scope
            const userFunction = new Function(
              "event",
              "cms",
              "api",
              actionDef.code,
            );
            await userFunction(e, cmsData, customApi);
          } else {
            // Standard Registered Action
            const actionFn = actionRegistry[actionDef.actionId];
            if (actionFn) {
              await actionFn(...(actionDef.args || []));
            } else {
              console.warn(
                `[WebsiteStudio] Action "${actionDef.actionId}" not found in actionRegistry.`,
              );
            }
          }
        } catch (error) {
          console.error(
            `[WebsiteStudio] Error executing action "${actionDef.actionId}":`,
            error,
          );
        }
      }
    };
  }

  return boundEvents;
}

// ============================================================================
// 2. ERROR BOUNDARY
// ============================================================================

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
      `[WebsiteStudio Error rendering ${this.props.nodeType}]:`,
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border-2 border-dashed border-red-500 bg-red-50 text-red-900 rounded-lg m-2">
          <strong>Failed to render: {this.props.nodeType}</strong>
          <p className="text-xs mt-2 font-mono overflow-auto">
            {this.state.error?.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 3. INTERNAL NODE RENDERER (Recursive)
// ============================================================================

interface RenderNodeProps {
  node: StudioNode;
  components: ComponentRegistry;
  cmsData?: any;
  actionRegistry?: Record<string, Function>;
  customApi?: any;
}

const RenderNode: React.FC<RenderNodeProps> = ({
  node,
  components,
  cmsData,
  actionRegistry,
  customApi,
}) => {
  const ComponentDef = components[node.type];

  if (!ComponentDef) {
    console.warn(
      `[WebsiteStudio] Component type "${node.type}" not found in registry.`,
    );
    return (
      <div className="p-2 border border-dashed border-yellow-500 bg-yellow-50 text-yellow-900 text-xs m-2">
        Missing Component: {node.type}
      </div>
    );
  }

  // 1. Process nested children recursively
  const renderedChildren = node.children?.map((childNode) => (
    <RenderNode
      key={childNode.id}
      node={childNode}
      components={components}
      cmsData={cmsData}
      actionRegistry={actionRegistry}
      customApi={customApi}
    />
  ));

  // 2. Interpolate dynamic CMS data into props
  const compiledProps = compileProps(node.props, cmsData);

  // 3. Bind interactive events
  const boundEvents = bindEvents(
    node.events,
    actionRegistry,
    cmsData,
    customApi,
  );

  return (
    <NodeErrorBoundary nodeType={node.type}>
      <ComponentDef.render {...compiledProps} {...boundEvents}>
        {renderedChildren?.length ? renderedChildren : compiledProps.children}
      </ComponentDef.render>
    </NodeErrorBoundary>
  );
};

// ============================================================================
// 4. THEME INJECTOR
// ============================================================================

export const ThemeInjector: React.FC<{
  designSystem: DesignSystemSchema;
  children: React.ReactNode;
}> = ({ designSystem, children }) => {
  // Map the generic token object to standard CSS variables
  const cssVariables = Object.entries(designSystem.tokens).reduce(
    (acc, [key, value]) => {
      const varName = key.startsWith("--") ? key : `--${key}`;
      acc[varName] = value;
      return acc;
    },
    {} as React.CSSProperties,
  );

  return (
    <div
      className="website-studio-theme-root w-full h-full"
      style={cssVariables}
      data-theme-mode={designSystem.mode}
    >
      {children}
    </div>
  );
};

// ============================================================================
// 5. MAIN EXPORT: THE RENDERER ENGINE
// ============================================================================

export interface RendererProps {
  /** The Component Registry mapping strings to React components */
  components: ComponentRegistry;
  /** The JSON layout data to render (PageSchema or raw array of StudioNodes) */
  data: PageSchema | StudioNode[];
  /** Optional Design System schema for dynamic CSS variable injection */
  designSystem?: DesignSystemSchema;
  /** Optional external CMS data object to resolve {{ bindings }} */
  cms?: any;
  /** Optional registry of safe, executable functions for user interactions */
  actions?: Record<string, Function>;
  /** Optional custom API object injected into $customCode scripts */
  customApi?: any;
}

export const Renderer: React.FC<RendererProps> = ({
  components,
  data,
  designSystem,
  cms = {},
  actions = {},
  customApi = {},
}) => {
  const nodes = Array.isArray(data) ? data : data.content;

  if (!nodes || nodes.length === 0) return null;

  const content = (
    <>
      {nodes.map((node) => (
        <RenderNode
          key={node.id}
          node={node}
          components={components}
          cmsData={cms}
          actionRegistry={actions}
          customApi={customApi}
        />
      ))}
    </>
  );

  if (designSystem) {
    return <ThemeInjector designSystem={designSystem}>{content}</ThemeInjector>;
  }

  return content;
};
