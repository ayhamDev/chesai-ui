// src/lib/components/website-studio/renderer.tsx
import React, { ErrorInfo } from "react";
import type {
  ComponentRegistry,
  DesignSystemSchema,
  PageSchema,
  StudioNode,
  StudioEventAction,
} from "./types";
import { defaultActions } from "./defaultActions";
import { ScriptAndStyleInjector } from "./ScriptAndStyleInjector";

// ============================================================================
// 1. HELPERS: CMS Interpolation & Event Binding
// ============================================================================

function getNestedValue(obj: any, path: string): any {
  return path
    .split(".")
    .reduce(
      (acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined),
      obj,
    );
}

function compileProps(
  props: Record<string, any>,
  cmsData: any,
): Record<string, any> {
  if (!cmsData || Object.keys(cmsData).length === 0) return props;

  const compiled: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "string" && value.includes("{{")) {
      compiled[key] = value.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
        const val = getNestedValue(cmsData, path.trim());
        return val !== undefined ? String(val) : "";
      });
    } else if (Array.isArray(value)) {
      compiled[key] = value;
    } else if (typeof value === "object" && value !== null) {
      compiled[key] = compileProps(value, cmsData);
    } else {
      compiled[key] = value;
    }
  }

  return compiled;
}

async function executeCustomCodeSafely(
  code: string,
  event: React.SyntheticEvent,
  cmsData: any,
  customApi: any,
): Promise<void> {
  try {
    const userSandboxFunction = new Function(
      "event",
      "cms",
      "api",
      `
        "use strict";
        try {
          ${code}
        } catch (innerError) {
          throw innerError;
        }
      `,
    );

    await userSandboxFunction(event, cmsData, customApi);
  } catch (error: any) {
    console.error(
      `[WebsiteStudio] Dynamic event execution failed.\n` +
        `Reason: ${error?.message || error}\n` +
        `Context Data Reference:`,
      { cmsData, eventType: event.type },
    );
  }
}

function bindEvents(
  nodeEvents: Record<string, StudioEventAction[]> | undefined,
  actionRegistry: Record<string, Function> = {},
  cmsData: any = {},
  customApi: any = {},
): Record<string, Function> {
  if (!nodeEvents || Object.keys(nodeEvents).length === 0) return {};

  const boundEvents: Record<string, Function> = {};

  for (const [eventName, actionsToRun] of Object.entries(nodeEvents)) {
    boundEvents[eventName] = async (e: React.SyntheticEvent) => {
      if (e && typeof e.preventDefault === "function") {
        const componentType = (
          e.currentTarget as HTMLElement
        )?.tagName?.toLowerCase();
        if (componentType === "a" || componentType === "form") {
          e.preventDefault();
        }
      }

      for (const actionDef of actionsToRun) {
        try {
          if (actionDef.actionId === "$customCode" && actionDef.code) {
            await executeCustomCodeSafely(
              actionDef.code,
              e,
              cmsData,
              customApi,
            );
          } else {
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
            `[WebsiteStudio] Exception encountered executing action "${actionDef.actionId}":`,
            error,
          );
        }
      }
    };
  }

  return boundEvents;
}

// ============================================================================
// 2. HELPERS: Responsive Breakpoint Parsing
// ============================================================================

export interface ResponsiveValue {
  mobile?: string | number;
  tablet?: string | number;
  desktop?: string | number;
  default?: string | number;
}

export function isResponsiveValue(value: any): value is ResponsiveValue {
  return (
    value !== null &&
    typeof value === "object" &&
    ("mobile" in value ||
      "tablet" in value ||
      "desktop" in value ||
      "default" in value)
  );
}

interface ProcessedStyles {
  cleanProps: Record<string, any>;
  styleTagContent: string | null;
}

export function processResponsiveStyles(
  nodeId: string,
  props: Record<string, any>,
  responsiveCssProps: string[] = [
    "fontSize",
    "padding",
    "margin",
    "gap",
    "width",
    "height",
  ],
): ProcessedStyles {
  const cleanProps = { ...props };
  const styles: { mobile: string[]; tablet: string[]; desktop: string[] } = {
    mobile: [],
    tablet: [],
    desktop: [],
  };

  let hasResponsiveRules = false;

  for (const [key, value] of Object.entries(props)) {
    if (responsiveCssProps.includes(key) && isResponsiveValue(value)) {
      hasResponsiveRules = true;
      const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();

      if (value.default !== undefined || value.mobile !== undefined) {
        styles.mobile.push(`${cssProperty}: ${value.mobile ?? value.default};`);
      }
      if (value.tablet !== undefined) {
        styles.tablet.push(`${cssProperty}: ${value.tablet};`);
      }
      if (value.desktop !== undefined) {
        styles.desktop.push(`${cssProperty}: ${value.desktop};`);
      }

      delete cleanProps[key];
    }
  }

  if (!hasResponsiveRules) {
    return { cleanProps, styleTagContent: null };
  }

  const selector = `.ws-node-${nodeId}`;
  let cssRules = ``;

  if (styles.mobile.length > 0) {
    cssRules += `${selector} { ${styles.mobile.join(" ")} }\n`;
  }
  if (styles.tablet.length > 0) {
    cssRules += `@media (min-width: 768px) { ${selector} { ${styles.tablet.join(" ")} } }\n`;
  }
  if (styles.desktop.length > 0) {
    cssRules += `@media (min-width: 1200px) { ${selector} { ${styles.desktop.join(" ")} } }\n`;
  }

  return { cleanProps, styleTagContent: cssRules };
}

// ============================================================================
// 3. ERROR BOUNDARY
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
// 4. INTERNAL NODE RENDERER (Recursive)
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

  const compiledProps = compileProps(node.props, cmsData);

  const { cleanProps, styleTagContent } = processResponsiveStyles(
    node.id,
    compiledProps,
  );

  const scopeClass = styleTagContent ? `ws-node-${node.id}` : "";

  // Package up the props to pass to the user's component
  const finalProps = {
    ...cleanProps,
    className: [cleanProps.className, scopeClass].filter(Boolean).join(" "),
    // ---> INJECT THE NODE ID FOR THE BUILDER SELECTION OVERLAY <---
    "data-studio-node-id": node.id,
  };

  const boundEvents = bindEvents(
    node.events,
    actionRegistry,
    cmsData,
    customApi,
  );

  return (
    <NodeErrorBoundary nodeType={node.type}>
      {styleTagContent && (
        <style dangerouslySetInnerHTML={{ __html: styleTagContent }} />
      )}
      {/* NO MORE WRAPPER DIV! Renders the exact component provided in the registry */}
      <ComponentDef.render {...finalProps} {...boundEvents}>
        {renderedChildren?.length ? renderedChildren : finalProps.children}
      </ComponentDef.render>
    </NodeErrorBoundary>
  );
};

// ============================================================================
// 5. THEME INJECTOR
// ============================================================================

export const ThemeInjector: React.FC<{
  designSystem: DesignSystemSchema;
  children: React.ReactNode;
}> = ({ designSystem, children }) => {
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
      className="website-studio-theme-root w-full min-h-screen flex flex-col bg-background text-on-background"
      style={cssVariables}
      data-theme-mode={designSystem.mode}
    >
      {children}
    </div>
  );
};

// ============================================================================
// 6. MAIN EXPORT: THE RENDERER ENGINE
// ============================================================================

export interface RendererProps {
  components: ComponentRegistry;
  data: PageSchema | StudioNode[];
  designSystem?: DesignSystemSchema;
  cms?: any;
  actions?: Record<string, Function>;
  customApi?: any;
  globalHeadCode?: string;
  globalBodyCode?: string;
  pageHeadCode?: string;
}

export const Renderer: React.FC<RendererProps> = ({
  components,
  data,
  designSystem,
  cms = {},
  actions = {},
  customApi = {},
  globalHeadCode,
  globalBodyCode,
  pageHeadCode,
}) => {
  const nodes = Array.isArray(data) ? data : data.content;

  if (!nodes || nodes.length === 0) return null;

  const consolidatedActions = {
    ...defaultActions,
    ...actions,
  };

  const content = (
    <>
      {globalHeadCode && (
        <ScriptAndStyleInjector html={globalHeadCode} target="head" />
      )}
      {pageHeadCode && (
        <ScriptAndStyleInjector html={pageHeadCode} target="head" />
      )}
      {globalBodyCode && (
        <ScriptAndStyleInjector html={globalBodyCode} target="body" />
      )}

      {nodes.map((node) => (
        <RenderNode
          key={node.id}
          node={node}
          components={components}
          cmsData={cms}
          actionRegistry={consolidatedActions}
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
