// src/lib/components/website-studio/builder.tsx
import {
  Box,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  Lock,
  MousePointerClick,
  Settings2,
  Square,
  Type,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Resizable } from "../resizable";
import { Typography } from "../typography";
import { Tabs } from "../tabs";
import { StudioCanvas } from "./canvas/StudioCanvas";
import { useStudioStore } from "./store";
import { BuilderContextProvider } from "./BuilderContext";
import type { ComponentRegistry, StudioNode, WebsiteSchema } from "./types";

export interface BuilderProps {
  components: ComponentRegistry;
  initialState: WebsiteSchema;
  cms?: any;
  /** Custom UI for the left side of the top toolbar */
  topBarLeft?: React.ReactNode;
  /** Custom UI for the center of the top toolbar */
  topBarCenter?: React.ReactNode;
  /** Custom UI for the right side of the top toolbar */
  topBarRight?: React.ReactNode;
  onExit?: () => void;
}

// --- HELPER: Map Node Type to Icon ---
const getNodeIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("text") || t.includes("heading") || t.includes("paragraph"))
    return <Type className="w-3.5 h-3.5 text-orange-500" />;
  if (t.includes("image") || t.includes("picture"))
    return <ImageIcon className="w-3.5 h-3.5 text-orange-500" />;
  if (t.includes("button") || t.includes("link"))
    return <MousePointerClick className="w-3.5 h-3.5 text-orange-500" />;
  if (t.includes("section") || t.includes("container"))
    return <LayoutTemplate className="w-3.5 h-3.5 text-orange-500" />;
  if (t.includes("flex") || t.includes("grid"))
    return <Square className="w-3.5 h-3.5 text-orange-500" />;
  return <Box className="w-3.5 h-3.5 text-orange-500" />;
};

// --- RECURSIVE LAYERS TREE NODE ---
const LayerTreeNode = ({
  node,
  level = 0,
}: {
  node: StudioNode;
  level?: number;
}) => {
  const { selectedNodeId, selectNode } = useStudioStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  return (
    <div className="flex flex-col w-full select-none">
      <div
        className={clsx(
          "flex items-center h-7 px-2 cursor-pointer transition-colors group",
          isSelected
            ? "bg-primary/10 text-primary"
            : "text-on-surface hover:bg-surface-container-highest",
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => selectNode(node.id)}
      >
        {/* Expand/Collapse Chevron */}
        <div
          className="w-4 h-4 flex items-center justify-center shrink-0 opacity-70 hover:opacity-100"
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )
          ) : (
            <span className="w-3 h-3" /> // Empty space for alignment
          )}
        </div>

        {/* Node Icon */}
        <div className="mr-2 shrink-0">{getNodeIcon(node.type)}</div>

        {/* Node Label */}
        <Typography
          variant="label-small"
          className={clsx(
            "truncate flex-1 font-medium",
            isSelected ? "text-primary" : "text-on-surface",
          )}
        >
          {node.type}
        </Typography>

        {/* Visibility/Lock Icons (Visible on Hover or if selected) */}
        <div
          className={clsx(
            "flex items-center gap-1.5 opacity-0 group-hover:opacity-50 transition-opacity",
            isSelected && "opacity-50",
          )}
        >
          <Eye className="w-3 h-3 hover:opacity-100" />
          <Lock className="w-3 h-3 hover:opacity-100" />
        </div>
      </div>

      {/* Render Children Recursively */}
      {isExpanded && hasChildren && (
        <div className="flex flex-col w-full">
          {node.children!.map((child) => (
            <LayerTreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN BUILDER COMPONENT ---
export const Builder: React.FC<BuilderProps> = ({
  components,
  initialState,
  cms,
  topBarLeft,
  topBarCenter,
  topBarRight,
}) => {
  const { initStudio, website, activePageId, selectedNodeId } =
    useStudioStore();

  useEffect(() => {
    initStudio(initialState);
  }, [initialState, initStudio]);

  const activePage = website?.pages.find((p) => p.id === activePageId);

  return (
    <BuilderContextProvider components={components} cms={cms}>
      <div className="flex flex-col w-full h-screen bg-graphite-background text-on-surface overflow-hidden font-manrope">
        {/* --- TOP NAVBAR (Provided by Developer) --- */}
        <header className="h-14 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between px-4 shrink-0 z-50 text-on-surface select-none shadow-sm">
          <div className="flex items-center gap-3">{topBarLeft}</div>
          <div className="flex items-center gap-2 hidden lg:flex">
            {topBarCenter}
          </div>
          <div className="flex items-center gap-4">{topBarRight}</div>
        </header>

        {/* --- MAIN WORKSPACE (RESIZABLE) --- */}
        <Resizable className="flex-1 overflow-hidden z-0 bg-graphite-background">
          {/* LEFT PANEL (Tabs + Layers Tree) */}
          <Resizable.Pane
            id="left-navigator"
            defaultWidth={260}
            className="bg-surface-container-low flex flex-col z-40 border-r border-outline-variant/30"
          >
            <Tabs
              defaultValue="layer"
              variant="secondary"
              className="w-full flex-col flex h-full"
              routingMode="search"
              routingParamName="left-panel-tab"
            >
              {/* Tab Triggers */}
              <div className="p-2 border-b border-outline-variant/30 shrink-0">
                <Tabs.List className="w-full justify-between !border-none gap-1 bg-surface-container-highest p-1 rounded-lg">
                  <Tabs.Trigger
                    value="layer"
                    className="flex-1 text-xs py-1 min-h-0 h-7 rounded-md data-[state=active]:bg-surface data-[state=active]:shadow-sm data-[state=active]:text-on-surface"
                  >
                    Layer
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="assets"
                    className="flex-1 text-xs py-1 min-h-0 h-7 rounded-md data-[state=active]:bg-surface data-[state=active]:shadow-sm data-[state=active]:text-on-surface"
                  >
                    Assets
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="community"
                    className="flex-1 text-xs py-1 min-h-0 h-7 rounded-md data-[state=active]:bg-surface data-[state=active]:shadow-sm data-[state=active]:text-on-surface"
                  >
                    Community
                  </Tabs.Trigger>
                </Tabs.List>
              </div>

              {/* Tab Contents */}
              <Tabs.Content className="flex-1 overflow-hidden bg-surface flex flex-col">
                <Tabs.Panel
                  value="layer"
                  className="p-0 flex flex-col h-full overflow-hidden"
                >
                  {/* Pages Dropdown Mockup */}
                  <div className="flex items-center justify-between p-3 border-b border-outline-variant/30 shrink-0 cursor-pointer hover:bg-surface-container-highest transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-on-surface-variant" />
                      <Typography variant="label-small" className="font-bold">
                        Pages
                      </Typography>
                    </div>
                    <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                  </div>

                  {/* Active Page Layers */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
                    {activePage ? (
                      <div className="flex flex-col w-full">
                        <div className="flex items-center gap-2 px-3 py-1.5 opacity-70">
                          <LayoutTemplate className="w-4 h-4 text-orange-500" />
                          <Typography
                            variant="label-small"
                            className="font-bold truncate"
                          >
                            {activePage.title} - Desktop
                          </Typography>
                        </div>
                        {activePage.content.map((node) => (
                          <LayerTreeNode key={node.id} node={node} level={1} />
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center opacity-50 text-xs">
                        No active page.
                      </div>
                    )}
                  </div>
                </Tabs.Panel>

                <Tabs.Panel
                  value="assets"
                  className="p-4 flex flex-col items-center justify-center text-center h-full opacity-50"
                >
                  <Typography variant="body-small">
                    Drag and Drop assets here.
                  </Typography>
                </Tabs.Panel>

                <Tabs.Panel
                  value="community"
                  className="p-4 flex flex-col items-center justify-center text-center h-full opacity-50"
                >
                  <Typography variant="body-small">
                    Community templates.
                  </Typography>
                </Tabs.Panel>
              </Tabs.Content>
            </Tabs>
          </Resizable.Pane>

          <Resizable.Handle
            target="left-navigator"
            variant="pill"
            className="z-50"
          />

          {/* CENTER CANVAS (React Flow) */}
          <Resizable.Pane id="center-canvas" flex className="relative z-0">
            <StudioCanvas
              aiConfig={{
                enabled: true,
                models: ["3 Flash", "4 Turbo", "Claude 3.5"],
                suggestions: [
                  "Add a dark mode version of these screens",
                  "Refine the product cards to show more details",
                ],
              }}
            />
          </Resizable.Pane>

          {/* RIGHT PANEL (Inspector) - ONLY VISIBLE IF A NODE IS SELECTED */}
          {selectedNodeId && (
            <>
              <Resizable.Handle
                target="right-inspector"
                variant="pill"
                invert
                className="z-50"
              />
              <Resizable.Pane
                id="right-inspector"
                defaultWidth={300}
                className="bg-surface-container-low flex flex-col z-40 border-l border-outline-variant/30"
              >
                <div className="h-12 border-b border-outline-variant/30 flex items-center px-4 gap-2 bg-surface-container-lowest/50 shrink-0">
                  <Settings2 className="w-4 h-4 opacity-50" />
                  <Typography variant="label-medium" className="font-bold">
                    Inspector
                  </Typography>
                </div>
                <div className="flex-1 p-4 flex flex-col items-center justify-center opacity-50">
                  <Typography variant="body-small">
                    Properties for Node:
                  </Typography>
                  <Typography variant="label-medium" className="font-mono mt-2">
                    {selectedNodeId}
                  </Typography>
                </div>
              </Resizable.Pane>
            </>
          )}
        </Resizable>
      </div>
    </BuilderContextProvider>
  );
};
