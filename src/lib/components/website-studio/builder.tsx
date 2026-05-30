"use client";

import { Undo2, Redo2, Plus, Command, Play } from "lucide-react";
import React, { useEffect, useState, useMemo, useRef } from "react";

import { Resizable } from "../resizable";
import { Typography } from "../typography";
import { Tabs } from "../tabs";
import { IconButton } from "../icon-button";
import { Button } from "../button";

import { StudioCanvas } from "./canvas/StudioCanvas";
import { useStudioStore } from "./store";
import { BuilderContextProvider } from "./BuilderContext";
import type { ComponentRegistry, WebsiteSchema, StudioNode } from "./types";

// Import Refactored Sub-components
import { PagesTab } from "./builder/PagesTab";
import { LayersTab } from "./builder/LayersTab";
import { ComponentsTab } from "./builder/ComponentsTab";
import { InspectorPanel } from "./builder/InspectorPanel";
import { PageDialogs } from "./builder/PageDialogs";
import { ComponentPickerDialog } from "./builder/ComponentPickerDialog";
import { PreviewOverlay } from "./builder/PreviewOverlay";
import { filterTree } from "./builder/helpers";
import type { PageNode, ComponentTreeNode, PageAction } from "./builder/types";
import { Kbd } from "../kbd";
import { Divider } from "../divider";
import type { DesignSystemSchema } from "./types";

export interface BuilderProps {
  components: ComponentRegistry;
  initialState: WebsiteSchema;
  cms?: any;
  actions?: Record<string, Function>;
  customApi?: any;
  globalHeadCode?: string;
  globalBodyCode?: string;
  designSystem?: DesignSystemSchema;
  topBarLeft?: React.ReactNode;
  topBarCenter?: React.ReactNode;
  topBarRight?: React.ReactNode;
  customPageActions?: PageAction[];
  onExit?: () => void;
}

export const Builder: React.FC<BuilderProps> = ({
  components,
  initialState,
  cms,
  actions,
  customApi,
  globalHeadCode,
  globalBodyCode,
  designSystem,
  topBarLeft,
  topBarCenter,
  topBarRight,
  customPageActions,
  onExit,
}) => {
  const {
    initStudio,
    website,
    activePageId,
    selectedNodeIds,
    viewContext,
    setViewContext,
    setActivePage,
    setSelectedNodes,
    moveNodes,
    removeNodes,
    undo,
    redo,
    past,
    future,
    addPage,
    updatePage,
    duplicatePage,
    removePage,
    clipboard,
    copyNodes,
    pasteNodes,
    duplicateNodes,
    openComponentPicker,
  } = useStudioStore();

  const [pageSearch, setPageSearch] = useState("");
  const [layerSearch, setLayerSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [expandedLayerIds, setExpandedLayerIds] = useState<string[]>([]);
  const [expandedPageIds, setExpandedPageIds] = useState<string[]>([]);

  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editPageSlug, setEditPageSlug] = useState("");
  const [editPageTitle, setEditPageTitle] = useState("");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const componentsRef = useRef(components);
  componentsRef.current = components;

  useEffect(() => {
    initStudio(initialState);
  }, [initialState, initStudio]);

  const activePage = website?.pages.find((p) => p.id === activePageId);

  const displayedLayers = React.useMemo(
    () => filterTree(activePage?.content || [], layerSearch),
    [activePage?.content, layerSearch],
  );

  useEffect(() => {
    const getFolderIds = (nodes: StudioNode[]): string[] => {
      let ids: string[] = [];
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          ids.push(node.id);
          ids = ids.concat(getFolderIds(node.children));
        }
      }
      return ids;
    };

    if (layerSearch.trim().length > 0) {
      setExpandedLayerIds(getFolderIds(displayedLayers));
    } else {
      setExpandedLayerIds(getFolderIds(activePage?.content || []));
    }
  }, [layerSearch, activePageId, activePage?.content, displayedLayers]);

  useEffect(() => {
    if (!activePage?.content || selectedNodeIds.length === 0) return;

    setExpandedLayerIds((prev) => {
      const next = new Set(prev);
      let changed = false;

      const findAncestors = (nodes: StudioNode[], path: string[]) => {
        for (const node of nodes) {
          if (selectedNodeIds.includes(node.id)) {
            path.forEach((id) => {
              if (!next.has(id)) {
                next.add(id);
                changed = true;
              }
            });
          }
          if (node.children && node.children.length > 0) {
            findAncestors(node.children, [...path, node.id]);
          }
        }
      };

      findAncestors(activePage.content, []);
      return changed ? Array.from(next) : prev;
    });

    const scrollTimer = setTimeout(() => {
      const targetId = selectedNodeIds[0];
      const el = document.querySelector(`[data-tree-node-id="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 250);

    return () => clearTimeout(scrollTimer);
  }, [selectedNodeIds, activePage?.content]);

  useEffect(() => {
    const handleStudioPreviewEvent = (e: Event) => {
      setIsPreviewOpen(true);
    };

    window.addEventListener("studio-preview", handleStudioPreviewEvent);
    return () =>
      window.removeEventListener("studio-preview", handleStudioPreviewEvent);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable;

      if (isInput) return;

      const state = useStudioStore.getState();
      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && key === "z") {
        e.preventDefault();
        if (e.shiftKey) state.redo();
        else state.undo();
      } else if ((e.ctrlKey || e.metaKey) && key === "y") {
        e.preventDefault();
        state.redo();
      } else if ((e.ctrlKey || e.metaKey) && key === "c") {
        if (
          state.selectedNodeIds.length > 0 &&
          state.viewContext.type === "PAGE"
        ) {
          e.preventDefault();
          state.copyNodes(state.selectedNodeIds);
        }
      } else if ((e.ctrlKey || e.metaKey) && key === "v") {
        if (state.clipboard.length > 0 && state.viewContext.type === "PAGE") {
          e.preventDefault();
          const targetId =
            state.selectedNodeIds.length > 0 ? state.selectedNodeIds[0] : null;

          let canAcceptChildren = false;
          if (targetId) {
            const page = state.website?.pages.find(
              (p) => p.id === state.activePageId,
            );
            if (page) {
              const findType = (nodes: StudioNode[]): string | null => {
                for (const n of nodes) {
                  if (n.id === targetId) return n.type;
                  if (n.children) {
                    const res = findType(n.children);
                    if (res) return res;
                  }
                }
                return null;
              };
              const type = findType(page.content);
              canAcceptChildren = type
                ? (componentsRef.current[type]?.acceptsChildren ?? false)
                : false;
            }
          }

          state.pasteNodes(targetId, canAcceptChildren ? "inside" : "after");
        }
      } else if ((e.ctrlKey || e.metaKey) && key === "d") {
        if (
          state.selectedNodeIds.length > 0 &&
          state.viewContext.type === "PAGE"
        ) {
          e.preventDefault();
          state.duplicateNodes(state.selectedNodeIds);
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (
          state.selectedNodeIds.length > 0 &&
          state.viewContext.type === "PAGE"
        ) {
          e.preventDefault();
          state.removeNodes(state.selectedNodeIds);
        }
      } else if (e.key === "i" && e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        if (state.selectedNodeIds.length === 1) {
          state.openComponentPicker("after", state.selectedNodeIds[0]);
        } else {
          state.openComponentPicker("inside", "ROOT");
        }
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsPreviewOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

        node.name = "/" + (node.slug.split("/").filter(Boolean).pop() || "");

        if (parentNode) {
          parentNode.children.push(node);
        } else {
          node.name = node.slug;
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  }, [website?.pages, pageSearch]);

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

  const componentTreeData = useMemo(() => {
    const categories = Array.from(
      new Set(Object.values(components).map((c) => c.category)),
    );

    const tree = categories
      .map((cat) => ({
        id: `cat-${cat}`,
        name: cat,
        isCategory: true,
        children: Object.entries(components)
          .filter(
            ([_, comp]) =>
              comp.category === cat &&
              comp.name.toLowerCase().includes(assetSearch.toLowerCase()),
          )
          .map(([key, comp]) => ({
            id: key,
            name: comp.name,
            isCategory: false,
          })),
      }))
      .filter((cat) => cat.children.length > 0);

    return tree;
  }, [components, assetSearch]);

  const [expandedAssetIds, setExpandedAssetIds] = useState<string[]>(
    componentTreeData.map((c) => c.id),
  );

  const handleCreatePage = () => {
    if (!newPageSlug) return;
    addPage(newPageSlug, newPageTitle);
    setIsAddPageOpen(false);
    setNewPageSlug("");
    setNewPageTitle("");
  };

  const openEditPage = (id: string) => {
    const page = website?.pages.find((p) => p.id === id);
    if (page) {
      setEditPageSlug(page.slug);
      setEditPageTitle(page.title);
      setEditingPageId(id);
    }
  };

  const handleEditPage = () => {
    if (!editingPageId || !editPageSlug) return;
    updatePage(editingPageId, editPageSlug, editPageTitle);
    setEditingPageId(null);
  };

  return (
    <BuilderContextProvider
      components={components}
      cms={cms}
      actions={actions}
      customApi={customApi}
      globalHeadCode={globalHeadCode}
      globalBodyCode={globalBodyCode}
      designSystem={designSystem}
    >
      <div className="flex flex-col w-full h-screen bg-background text-on-background overflow-hidden font-manrope">
        <header className="h-14 bg-surface border-b border-outline-variant/30 flex items-center justify-between px-4 shrink-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border-r border-outline-variant/30 pr-3 mr-1">
              <IconButton
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={past.length === 0}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={16} className="opacity-70" />
              </IconButton>
              <IconButton
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={future.length === 0}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={16} className="opacity-70" />
              </IconButton>
            </div>
            <div className="border-r border-outline-variant/30 pr-3">
              <Button
                variant="ghost"
                shape="minimal"
                size="sm"
                startIcon={<Plus size={16} />}
                onClick={() => openComponentPicker("inside", "ROOT")}
                className="font-medium"
                title="Insert Component (I)"
                endIcon={
                  <Kbd variant="flat" className="gap-2">
                    <Command size={14} /> + I
                  </Kbd>
                }
              >
                Insert
              </Button>
            </div>

            {topBarLeft}
          </div>
          <div className="flex items-center gap-2 hidden lg:flex">
            {topBarCenter}
          </div>
          <div className="flex items-center gap-4">
            {topBarRight}
            <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-4 pr-2">
              <IconButton
                variant="secondary"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                className="h-8 w-8 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                title="Preview Interactive Site (Ctrl+Enter)"
              >
                <Play size={16} className="ml-0.5 fill-current" />
              </IconButton>
            </div>
            {onExit && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-4 font-bold shadow-none"
                onClick={onExit}
              >
                Exit
              </Button>
            )}
          </div>
        </header>

        <Resizable className="flex-1 overflow-hidden z-0 bg-surface-container-lowest">
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
              <div className="shrink-0 pt-2 px-2 border-b border-outline-variant/30">
                <Tabs.List className="w-full !border-none">
                  <Tabs.Trigger value="pages">Pages</Tabs.Trigger>
                  <Tabs.Trigger value="layers">Layers</Tabs.Trigger>
                  <Tabs.Trigger value="assets">Assets</Tabs.Trigger>
                </Tabs.List>
              </div>

              <Tabs.Content className="flex-1 overflow-hidden flex flex-col">
                <Tabs.Panel
                  value="pages"
                  className="p-0 flex flex-col h-full overflow-hidden"
                >
                  <PagesTab
                    pageSearch={pageSearch}
                    setPageSearch={setPageSearch}
                    displayedPagesTree={displayedPagesTree}
                    expandedPageIds={expandedPageIds}
                    setExpandedPageIds={setExpandedPageIds}
                    setIsAddPageOpen={setIsAddPageOpen}
                    openEditPage={openEditPage}
                    customPageActions={customPageActions}
                  />
                </Tabs.Panel>

                <Tabs.Panel
                  value="layers"
                  className="p-0 flex flex-col h-full overflow-hidden"
                >
                  <LayersTab
                    layerSearch={layerSearch}
                    setLayerSearch={setLayerSearch}
                    displayedLayers={displayedLayers}
                    expandedLayerIds={expandedLayerIds}
                    setExpandedLayerIds={setExpandedLayerIds}
                    components={components}
                  />
                </Tabs.Panel>

                <Tabs.Panel
                  value="assets"
                  className="p-0 flex flex-col h-full overflow-hidden"
                >
                  <ComponentsTab
                    assetSearch={assetSearch}
                    setAssetSearch={setAssetSearch}
                    componentTreeData={componentTreeData}
                    expandedAssetIds={expandedAssetIds}
                    setExpandedAssetIds={setExpandedAssetIds}
                  />
                </Tabs.Panel>
              </Tabs.Content>
            </Tabs>
          </Resizable.Pane>

          <Resizable.Handle
            target="left-navigator"
            variant="pill"
            className="z-50"
          />

          <Resizable.Pane
            id="center-canvas"
            flex
            className="relative z-0 bg-surface-container-lowest"
          >
            <StudioCanvas
              aiConfig={{
                enabled: true,
                suggestions: [
                  "Add a dark mode version of these screens",
                  "Refine the product cards to show more details",
                ],
              }}
            />
          </Resizable.Pane>

          {selectedNodeIds.length > 0 && viewContext.type === "PAGE" && (
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
                <InspectorPanel selectedNodeIds={selectedNodeIds} />
              </Resizable.Pane>
            </>
          )}
        </Resizable>
      </div>

      <PageDialogs
        isAddPageOpen={isAddPageOpen}
        setIsAddPageOpen={setIsAddPageOpen}
        newPageSlug={newPageSlug}
        setNewPageSlug={setNewPageSlug}
        newPageTitle={newPageTitle}
        setNewPageTitle={setNewPageTitle}
        handleCreatePage={handleCreatePage}
        editingPageId={editingPageId}
        setEditingPageId={setEditingPageId}
        editPageSlug={editPageSlug}
        setEditPageSlug={setEditPageSlug}
        editPageTitle={editPageTitle}
        setEditPageTitle={setEditPageTitle}
        handleEditPage={handleEditPage}
      />
      <ComponentPickerDialog />

      {/* --- RENDER PREVIEW OVERLAY --- */}
      <PreviewOverlay
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </BuilderContextProvider>
  );
};
