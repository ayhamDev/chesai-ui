// src/lib/components/website-studio/builder.tsx
"use client";

import {
  Box,
  Eye,
  File,
  Home,
  LayoutTemplate,
  Lock,
  MousePointerClick,
  Search,
  Settings2,
  Square,
  Type,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { clsx } from "clsx";

import { Resizable } from "../resizable";
import { Typography } from "../typography";
import { Tabs } from "../tabs";
import { Input } from "../input";
import { IconButton } from "../icon-button";
import { Select } from "../select";
import { Button } from "../button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { TreeView } from "../tree-view";

import { StudioCanvas } from "./canvas/StudioCanvas";
import { useStudioStore } from "./store";
import { BuilderContextProvider } from "./BuilderContext";
import type {
  ComponentRegistry,
  StudioNode,
  WebsiteSchema,
  PageSchema,
} from "./types";

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

// --- HELPER: Filter Tree Nodes ---
const filterTree = (nodes: StudioNode[], query: string): StudioNode[] => {
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

interface PageNode {
  id: string;
  slug: string;
  name: string;
  title: string;
  children: PageNode[];
  pageId: string;
}

// --- MAIN BUILDER COMPONENT ---
export const Builder: React.FC<BuilderProps> = ({
  components,
  initialState,
  cms,
  topBarLeft,
  topBarCenter,
  topBarRight,
}) => {
  const {
    initStudio,
    website,
    activePageId,
    selectedNodeId,
    setActivePage,
    selectNode,
    moveNode,
  } = useStudioStore();

  const [pageSearch, setPageSearch] = useState("");
  const [layerSearch, setLayerSearch] = useState("");
  const [expandedLayerIds, setExpandedLayerIds] = useState<string[]>([]);
  const [expandedPageIds, setExpandedPageIds] = useState<string[]>([]);
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");

  useEffect(() => {
    initStudio(initialState);
  }, [initialState, initStudio]);

  const activePage = website?.pages.find((p) => p.id === activePageId);

  // Filtered Layers (Memoized to prevent infinite loops)
  const displayedLayers = React.useMemo(
    () => filterTree(activePage?.content || [], layerSearch),
    [activePage?.content, layerSearch],
  );

  // Auto-expand layers tree when searching
  useEffect(() => {
    if (layerSearch.trim().length > 0) {
      const getAllFolderIds = (nodes: StudioNode[]): string[] => {
        let ids: string[] = [];
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            ids.push(node.id);
            ids = ids.concat(getAllFolderIds(node.children));
          }
        }
        return ids;
      };
      setExpandedLayerIds(getAllFolderIds(displayedLayers));
    }
  }, [layerSearch, displayedLayers]);

  // Nested Pages Tree Construction
  const displayedPagesTree = React.useMemo(() => {
    const filtered = (website?.pages || []).filter((p) => {
      const slugName = p.slug === "/" ? "home" : p.slug;
      return (
        slugName.toLowerCase().includes(pageSearch.toLowerCase()) ||
        p.title.toLowerCase().includes(pageSearch.toLowerCase())
      );
    });

    const rootNodes: PageNode[] = [];
    const nodeMap = new Map<string, PageNode>();

    const allNodes: PageNode[] = filtered.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.slug === "/" ? "Home" : p.slug,
      title: p.title,
      children: [],
      pageId: p.id,
    }));

    // Sort by slug length so parents are processed before children
    allNodes.sort((a, b) => a.slug.length - b.slug.length);
    allNodes.forEach((node) => nodeMap.set(node.slug, node));

    allNodes.forEach((node) => {
      if (node.slug === "/") {
        rootNodes.push(node);
        return;
      }

      const parts = node.slug.split("/").filter(Boolean);
      if (parts.length === 1) {
        rootNodes.push(node);
      } else {
        parts.pop();
        const parentSlug = "/" + parts.join("/");
        const parentNode = nodeMap.get(parentSlug);

        // Display just the final chunk in the folder tree
        node.name = "/" + (node.slug.split("/").filter(Boolean).pop() || "");

        if (parentNode) {
          parentNode.children.push(node);
        } else {
          // Parent omitted by search, push to root with full path to prevent hiding
          node.name = node.slug;
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  }, [website?.pages, pageSearch]);

  // Auto-expand pages tree when searching
  useEffect(() => {
    if (pageSearch.trim().length > 0) {
      const getAllPageIds = (nodes: PageNode[]): string[] => {
        let ids: string[] = [];
        for (const node of nodes) {
          if (node.children && node.children.length > 0) {
            ids.push(node.id);
            ids = ids.concat(getAllPageIds(node.children));
          }
        }
        return ids;
      };
      setExpandedPageIds(getAllPageIds(displayedPagesTree));
    }
  }, [pageSearch, displayedPagesTree]);

  // Helper to append a new page to the Zustand store
  const handleCreatePage = () => {
    if (!newPageSlug) return;

    useStudioStore.setState((state) => {
      if (!state.website) return state;
      const newPage = {
        id: `page_${Date.now()}`,
        slug: newPageSlug.startsWith("/") ? newPageSlug : `/${newPageSlug}`,
        title: newPageTitle || "New Page",
        content: [],
      };
      return {
        ...state,
        website: {
          ...state.website,
          pages: [...state.website.pages, newPage],
        },
      };
    });

    setIsAddPageOpen(false);
    setNewPageSlug("");
    setNewPageTitle("");
  };

  return (
    <BuilderContextProvider components={components} cms={cms}>
      <div className="flex flex-col w-full h-screen bg-background text-on-background overflow-hidden font-manrope">
        {/* --- TOP NAVBAR (Provided by Developer) --- */}
        <header className="h-14 bg-surface border-b border-outline-variant/30 flex items-center justify-between px-4 shrink-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">{topBarLeft}</div>
          <div className="flex items-center gap-2 hidden lg:flex">
            {topBarCenter}
          </div>
          <div className="flex items-center gap-4">{topBarRight}</div>
        </header>

        {/* --- MAIN WORKSPACE (RESIZABLE) --- */}
        <Resizable className="flex-1 overflow-hidden z-0 bg-surface-container-lowest">
          {/* LEFT PANEL (Tabs + Navigator) */}
          <Resizable.Pane
            id="left-navigator"
            defaultWidth={300}
            className="bg-surface flex flex-col z-40 border-r border-outline-variant/30"
          >
            <Tabs
              defaultValue="layers"
              variant="secondary"
              pageTransition="fade"
              routingMode="memory"
            >
              {/* Tab Triggers */}
              <div className="shrink-0 pt-2 px-2 border-b border-outline-variant/30">
                <Tabs.List className="w-full !border-none">
                  <Tabs.Trigger value="pages">Pages</Tabs.Trigger>
                  <Tabs.Trigger value="layers">Layers</Tabs.Trigger>
                  <Tabs.Trigger value="assets">Assets</Tabs.Trigger>
                </Tabs.List>
              </div>

              {/* Tab Contents */}
              <Tabs.Content className="flex-1 overflow-hidden flex flex-col">
                {/* 1. PAGES TAB */}
                <Tabs.Panel
                  value="pages"
                  className="p-0 flex flex-col h-full overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 ">
                    <Typography
                      variant="label-small"
                      className="font-bold uppercase tracking-wider opacity-70"
                    >
                      Pages
                    </Typography>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      onClick={() => setIsAddPageOpen(true)}
                    >
                      <Plus size={16} />
                    </IconButton>
                  </div>
                  <div className="p-3 border-b border-outline-variant/30 shrink-0">
                    <Input
                      variant="filled"
                      size="sm"
                      placeholder="Search pages..."
                      startContent={
                        <Search className="w-4 h-4 text-on-surface-variant" />
                      }
                      value={pageSearch}
                      onChange={(e) => setPageSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                    <TreeView<PageNode>
                      data={displayedPagesTree}
                      getId={(node) => node.id}
                      getChildren={(node) => node.children}
                      selectedId={activePageId}
                      onSelect={(id, node) => setActivePage(node.pageId)}
                      expandedIds={expandedPageIds}
                      onExpandedChange={setExpandedPageIds}
                      variant="secondary"
                      size="xl"
                      shape="minimal"
                      renderItem={(node, { isSelected }) => (
                        <div className="flex items-center justify-start gap-3 w-full pr-2 text-left min-w-0 group">
                          <div className="shrink-0 opacity-70">
                            {node.slug === "/" ? (
                              <Home size={18} />
                            ) : (
                              <File size={18} />
                            )}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 py-1">
                            <span
                              className={clsx(
                                "truncate",
                                isSelected ? "font-bold" : "font-medium",
                              )}
                            >
                              {node.name}
                            </span>
                            {node.title && (
                              <span className="truncate text-[11px] opacity-60 font-normal">
                                {node.title}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    />
                    {displayedPagesTree.length === 0 && (
                      <div className="p-4 text-center opacity-50 text-xs">
                        No pages match your search.
                      </div>
                    )}
                  </div>
                </Tabs.Panel>

                {/* 2. LAYERS TAB (TreeView + Controls) */}
                <Tabs.Panel
                  value="layers"
                  className="p-0 flex flex-col h-full overflow-hidden"
                >
                  <div className="p-3 border-b border-outline-variant/30 flex flex-col gap-2 shrink-0">
                    <Select
                      variant="filled"
                      size="sm"
                      value={activePageId || ""}
                      onValueChange={(val) => setActivePage(val)}
                      items={
                        website?.pages.map((p) => ({
                          label: p.slug === "/" ? "Home" : p.slug,
                          value: p.id,
                        })) || []
                      }
                      startContent={<File className="w-4 h-4 opacity-50" />}
                      placeholder="Select Page"
                    />
                    <Input
                      variant="filled"
                      size="sm"
                      placeholder="Search layers..."
                      startContent={
                        <Search className="w-4 h-4 text-on-surface-variant" />
                      }
                      value={layerSearch}
                      onChange={(e) => setLayerSearch(e.target.value)}
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                    {activePage ? (
                      <TreeView<StudioNode>
                        data={displayedLayers}
                        getId={(node) => node.id}
                        getChildren={(node) => node.children}
                        selectedId={selectedNodeId}
                        onSelect={(id) => selectNode(id)}
                        expandedIds={expandedLayerIds}
                        onExpandedChange={setExpandedLayerIds}
                        variant="ghost"
                        size="sm"
                        shape="minimal"
                        enableDragAndDrop={true}
                        onMoveNode={({ activeId, parentId, index }) => {
                          moveNode(activeId, parentId, index);
                        }}
                        renderItem={(node, { isSelected }) => (
                          <div className="flex items-center justify-start gap-2 w-full pr-2 text-left min-w-0 group">
                            <div className="shrink-0">
                              {getNodeIcon(node.type)}
                            </div>
                            <Typography
                              variant="label-small"
                              className={clsx(
                                "truncate flex-1 text-left",
                                isSelected ? "font-bold" : "font-medium",
                              )}
                            >
                              {node.id}
                            </Typography>
                            <div
                              className={clsx(
                                "flex items-center gap-1.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0",
                                isSelected && "opacity-50",
                              )}
                            >
                              <Eye className="w-3.5 h-3.5 hover:opacity-100" />
                              <Lock className="w-3.5 h-3.5 hover:opacity-100" />
                            </div>
                          </div>
                        )}
                      />
                    ) : (
                      <div className="p-4 text-center opacity-50 text-xs">
                        No active page to display layers for.
                      </div>
                    )}
                  </div>
                </Tabs.Panel>

                {/* 3. ASSETS TAB */}
                <Tabs.Panel
                  value="assets"
                  className="p-0 flex flex-col h-full overflow-hidden"
                >
                  <div className="p-3 border-b border-outline-variant/30 shrink-0">
                    <Input
                      placeholder="Search assets..."
                      size="sm"
                      startContent={<Search size={16} className="opacity-50" />}
                      variant="filled"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 content-start scrollbar-thin">
                    {Object.entries(components).map(([key, comp]) => (
                      <div
                        key={key}
                        className="flex flex-col items-center justify-center p-4 gap-3 bg-surface-container-low hover:bg-surface-container-high rounded-xl cursor-pointer transition-colors border border-outline-variant/30 shadow-sm"
                      >
                        {getNodeIcon(key)}
                        <Typography
                          variant="label-small"
                          className="text-center truncate w-full font-medium"
                        >
                          {comp.name}
                        </Typography>
                      </div>
                    ))}
                  </div>
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
          <Resizable.Pane
            id="center-canvas"
            flex
            className="relative z-0 bg-surface-container-lowest"
          >
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
                className="bg-surface flex flex-col z-40 border-l border-outline-variant/30"
              >
                <div className="h-12 border-b border-outline-variant/30 flex items-center px-4 gap-2 bg-surface-container-lowest shrink-0">
                  <Settings2 className="w-4 h-4 opacity-70" />
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

      {/* CREATE PAGE DIALOG */}
      <Dialog
        open={isAddPageOpen}
        onOpenChange={setIsAddPageOpen}
        variant="basic"
        animation="material3"
        glass={false}
      >
        <DialogContent className="max-w-md" shape="full">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4 py-4">
            <Input
              label="Page Slug"
              placeholder="/about"
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              autoFocus
            />
            <Input
              label="Page Title"
              placeholder="About Us"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="secondary"
              onClick={handleCreatePage}
              disabled={!newPageSlug}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BuilderContextProvider>
  );
};
