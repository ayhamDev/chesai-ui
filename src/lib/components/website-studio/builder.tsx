"use client";

import { ContextMenu } from "../context-menu";
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
  Folder,
  FolderOpen,
  MoreHorizontal,
  Copy,
  Edit3,
  Trash2,
  Undo2,
  Redo2,
  Clipboard,
} from "lucide-react";
import React, { useEffect, useState, useMemo, useRef } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
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

export interface PageAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  run: (pageId: string, page: PageSchema) => void;
}

export interface BuilderProps {
  components: ComponentRegistry;
  initialState: WebsiteSchema;
  cms?: any;
  topBarLeft?: React.ReactNode;
  topBarCenter?: React.ReactNode;
  topBarRight?: React.ReactNode;
  customPageActions?: PageAction[];
  onExit?: () => void;
}

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

interface ComponentTreeNode {
  id: string;
  name: string;
  isCategory: boolean;
  children?: ComponentTreeNode[];
}

export const Builder: React.FC<BuilderProps> = ({
  components,
  initialState,
  cms,
  topBarLeft,
  topBarCenter,
  topBarRight,
  customPageActions,
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

  // Keep a ref of the components registry so global event listeners can read properties (like acceptsChildren)
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
  }, [layerSearch, activePageId]);

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

  // Global Keyboard Shortcuts (Undo, Redo, Copy, Paste, Duplicate, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable;

      if (isInput) return;

      const state = useStudioStore.getState();

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) state.redo();
        else state.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        state.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        if (
          state.selectedNodeIds.length > 0 &&
          state.viewContext.type === "PAGE"
        ) {
          e.preventDefault();
          state.copyNodes(state.selectedNodeIds);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (state.clipboard.length > 0 && state.viewContext.type === "PAGE") {
          e.preventDefault();
          const targetId =
            state.selectedNodeIds.length > 0 ? state.selectedNodeIds[0] : null;

          // Search for the target node type to determine if it accepts children
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
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
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
    <BuilderContextProvider components={components} cms={cms}>
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
            {topBarLeft}
          </div>
          <div className="flex items-center gap-2 hidden lg:flex">
            {topBarCenter}
          </div>
          <div className="flex items-center gap-4">{topBarRight}</div>
        </header>

        <Resizable className="flex-1 overflow-hidden z-0 bg-surface-container-lowest">
          <Resizable.Pane
            id="left-navigator"
            defaultWidth={350}
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
                  <Tabs.Trigger value="assets">Components</Tabs.Trigger>
                </Tabs.List>
              </div>

              <Tabs.Content className="flex-1 overflow-hidden flex flex-col">
                <Tabs.Panel
                  value="pages"
                  className="p-0 flex flex-col h-full overflow-hidden"
                >
                  <div className="flex gap-2 p-3 border-b border-outline-variant/30 shrink-0">
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
                    <IconButton
                      size="md"
                      shape="minimal"
                      variant="ghost"
                      onClick={() => setIsAddPageOpen(true)}
                    >
                      <Plus size={16} />
                    </IconButton>
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
                      variant="ghost"
                      size="xl"
                      shape="minimal"
                      renderItem={(node, { isSelected }) => (
                        <ContextMenu shape="minimal">
                          <ContextMenu.Trigger asChild>
                            <div className="flex items-center justify-between gap-3 w-full pr-2 text-left min-w-0 pointer-events-auto">
                              <div className="flex items-center gap-3 w-full min-w-0">
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

                              <DropdownMenu shape="minimal">
                                <DropdownMenuTrigger asChild>
                                  <IconButton
                                    variant="ghost"
                                    size="xs"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    onClick={(e) => e.stopPropagation()}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 shrink-0"
                                  >
                                    <MoreHorizontal size={14} />
                                  </IconButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditPage(node.pageId);
                                    }}
                                  >
                                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicatePage(node.pageId);
                                    }}
                                  >
                                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                                  </DropdownMenuItem>

                                  {customPageActions?.map((action) => (
                                    <DropdownMenuItem
                                      key={action.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const pageObj = website?.pages.find(
                                          (p) => p.id === node.pageId,
                                        );
                                        if (pageObj)
                                          action.run(node.pageId, pageObj);
                                      }}
                                      className={
                                        action.destructive
                                          ? "text-error hover:!bg-error/10 hover:!text-error"
                                          : ""
                                      }
                                    >
                                      {action.icon && (
                                        <span className="mr-2">
                                          {action.icon}
                                        </span>
                                      )}
                                      {action.label}
                                    </DropdownMenuItem>
                                  ))}

                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-error hover:!bg-error/10 hover:!text-error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removePage(node.pageId);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </ContextMenu.Trigger>

                          <ContextMenu.Content>
                            <ContextMenu.Item
                              onClick={() => openEditPage(node.pageId)}
                            >
                              <Edit3 className="w-4 h-4 mr-2" /> Edit
                            </ContextMenu.Item>
                            <ContextMenu.Item
                              onClick={() => duplicatePage(node.pageId)}
                            >
                              <Copy className="w-4 h-4 mr-2" /> Duplicate
                            </ContextMenu.Item>

                            {customPageActions?.map((action) => (
                              <ContextMenu.Item
                                key={action.id}
                                onClick={() => {
                                  const pageObj = website?.pages.find(
                                    (p) => p.id === node.pageId,
                                  );
                                  if (pageObj) action.run(node.pageId, pageObj);
                                }}
                                className={
                                  action.destructive
                                    ? "text-error hover:!bg-error/10 hover:!text-error"
                                    : ""
                                }
                              >
                                {action.icon && (
                                  <span className="mr-2">{action.icon}</span>
                                )}
                                {action.label}
                              </ContextMenu.Item>
                            ))}

                            <ContextMenu.Separator />
                            <ContextMenu.Item
                              className="text-error hover:!bg-error/10 hover:!text-error"
                              onClick={() => removePage(node.pageId)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </ContextMenu.Item>
                          </ContextMenu.Content>
                        </ContextMenu>
                      )}
                    />

                    {displayedPagesTree.length === 0 && (
                      <div className="p-4 text-center opacity-50 text-xs">
                        No pages match your search.
                      </div>
                    )}
                  </div>
                </Tabs.Panel>

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

                  {/* Context Menu Wrap around the entire TreeView area so empty space right clicks work */}
                  <ContextMenu shape="minimal">
                    <ContextMenu.Trigger asChild>
                      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                        {activePage ? (
                          <TreeView<StudioNode>
                            data={displayedLayers}
                            getId={(node) => node.id}
                            getChildren={(node) => node.children}
                            canHaveChildren={(node) => {
                              const compDef = components[node.type];
                              return compDef?.acceptsChildren ?? false;
                            }}
                            multiSelect
                            selectedIds={selectedNodeIds}
                            onSelectChange={(ids) => {
                              setSelectedNodes(ids);
                              if (viewContext.type !== "PAGE") {
                                setViewContext("PAGE", activePageId);
                              }
                            }}
                            expandedIds={expandedLayerIds}
                            onExpandedChange={setExpandedLayerIds}
                            variant="ghost"
                            size="sm"
                            shape="minimal"
                            enableDragAndDrop={true}
                            onMoveNode={({ activeIds, parentId, index }) => {
                              moveNodes(activeIds, parentId, index);
                            }}
                            renderItem={(node, { isSelected, isDragging }) => {
                              // Identify targets if this row is interacted with
                              const targetIds = selectedNodeIds.includes(
                                node.id,
                              )
                                ? selectedNodeIds
                                : [node.id];

                              // Detect if this specific component allows children to determine pasting logic
                              const acceptsChildren =
                                components[node.type]?.acceptsChildren ?? false;
                              const pastePosition = acceptsChildren
                                ? "inside"
                                : "after";

                              return (
                                <ContextMenu shape="minimal">
                                  <ContextMenu.Trigger asChild>
                                    <div
                                      className={clsx(
                                        "flex items-center justify-between gap-2 w-full pr-2 group/item text-left pointer-events-auto",
                                        isDragging && "opacity-80",
                                      )}
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="shrink-0">
                                          {getNodeIcon(node.type)}
                                        </div>
                                        <Typography
                                          variant="label-small"
                                          className={clsx(
                                            "truncate flex-1 text-left",
                                            isSelected
                                              ? "font-bold"
                                              : "font-medium",
                                          )}
                                        >
                                          {node.id}
                                        </Typography>
                                      </div>

                                      <DropdownMenu shape="minimal">
                                        <DropdownMenuTrigger asChild>
                                          <IconButton
                                            variant="ghost"
                                            size="xs"
                                            onPointerDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            className="opacity-0 group-hover/item:opacity-100 transition-opacity focus-visible:opacity-100 shrink-0 h-6 w-6"
                                          >
                                            <MoreHorizontal size={14} />
                                          </IconButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              copyNodes(targetIds);
                                            }}
                                          >
                                            <Copy className="w-4 h-4 mr-2" />{" "}
                                            Copy
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            disabled={clipboard.length === 0}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              pasteNodes(
                                                node.id,
                                                pastePosition,
                                              );
                                            }}
                                          >
                                            <Clipboard className="w-4 h-4 mr-2" />{" "}
                                            Paste
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              duplicateNodes(targetIds);
                                            }}
                                          >
                                            <Copy className="w-4 h-4 mr-2" />{" "}
                                            Duplicate
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-error hover:!bg-error/10 hover:!text-error"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeNodes(targetIds);
                                            }}
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />{" "}
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </ContextMenu.Trigger>

                                  <ContextMenu.Content>
                                    <ContextMenu.Item
                                      onClick={() => copyNodes(targetIds)}
                                    >
                                      <Copy className="w-4 h-4 mr-2" /> Copy
                                    </ContextMenu.Item>
                                    <ContextMenu.Item
                                      disabled={clipboard.length === 0}
                                      onClick={() =>
                                        pasteNodes(node.id, pastePosition)
                                      }
                                    >
                                      <Clipboard className="w-4 h-4 mr-2" />{" "}
                                      Paste
                                    </ContextMenu.Item>
                                    <ContextMenu.Item
                                      onClick={() => duplicateNodes(targetIds)}
                                    >
                                      <Copy className="w-4 h-4 mr-2" />{" "}
                                      Duplicate
                                    </ContextMenu.Item>
                                    <ContextMenu.Separator />
                                    <ContextMenu.Item
                                      className="text-error hover:!bg-error/10 hover:!text-error"
                                      onClick={() => removeNodes(targetIds)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </ContextMenu.Item>
                                  </ContextMenu.Content>
                                </ContextMenu>
                              );
                            }}
                          />
                        ) : (
                          <div className="p-4 text-center opacity-50 text-xs">
                            No active page to display layers for.
                          </div>
                        )}
                      </div>
                    </ContextMenu.Trigger>

                    {/* Fallback context menu for the empty space in the container */}
                    <ContextMenu.Content>
                      <ContextMenu.Item
                        disabled={selectedNodeIds.length === 0}
                        onClick={() => copyNodes(selectedNodeIds)}
                      >
                        <Copy className="w-4 h-4 mr-2" /> Copy
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        disabled={clipboard.length === 0}
                        onClick={() => {
                          const targetId =
                            selectedNodeIds.length > 0
                              ? selectedNodeIds[0]
                              : null;
                          let canAcceptChildren = false;
                          if (targetId) {
                            const page = website?.pages.find(
                              (p) => p.id === activePageId,
                            );
                            if (page) {
                              const findType = (
                                nodes: StudioNode[],
                              ): string | null => {
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
                                ? (componentsRef.current[type]
                                    ?.acceptsChildren ?? false)
                                : false;
                            }
                          }
                          pasteNodes(
                            targetId,
                            canAcceptChildren ? "inside" : "after",
                          );
                        }}
                      >
                        <Clipboard className="w-4 h-4 mr-2" /> Paste
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        disabled={selectedNodeIds.length === 0}
                        onClick={() => duplicateNodes(selectedNodeIds)}
                      >
                        <Copy className="w-4 h-4 mr-2" /> Duplicate
                      </ContextMenu.Item>
                      <ContextMenu.Separator />
                      <ContextMenu.Item
                        disabled={selectedNodeIds.length === 0}
                        className="text-error hover:!bg-error/10 hover:!text-error"
                        onClick={() => removeNodes(selectedNodeIds)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  </ContextMenu>
                </Tabs.Panel>

                <Tabs.Panel
                  value="assets"
                  className="p-0 flex flex-col h-full overflow-hidden"
                >
                  <div className="p-3 border-b border-outline-variant/30 shrink-0">
                    <Input
                      placeholder="Search components..."
                      size="sm"
                      startContent={<Search size={16} className="opacity-50" />}
                      variant="filled"
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                    <TreeView<ComponentTreeNode>
                      multiSelect
                      data={componentTreeData}
                      getId={(n) => n.id}
                      getChildren={(n) => n.children}
                      selectedId={
                        viewContext.type === "COMPONENT"
                          ? viewContext.id
                          : undefined
                      }
                      onSelect={(id, node) => {
                        if (!node.isCategory) {
                          setViewContext("COMPONENT", id);
                        }
                      }}
                      expandedIds={expandedAssetIds}
                      onExpandedChange={setExpandedAssetIds}
                      variant="ghost"
                      size="md"
                      shape="minimal"
                      renderItem={(node, { isSelected, isExpanded }) => (
                        <div className="flex items-center justify-start gap-2 w-full pr-2 text-left min-w-0">
                          <div className="shrink-0 opacity-70">
                            {node.isCategory ? (
                              isExpanded ? (
                                <FolderOpen
                                  size={16}
                                  className="text-primary"
                                />
                              ) : (
                                <Folder size={16} className="text-primary" />
                              )
                            ) : (
                              getNodeIcon(node.id)
                            )}
                          </div>
                          <Typography
                            variant="label-small"
                            className={clsx(
                              "truncate flex-1 text-left",
                              isSelected
                                ? "font-bold text-primary"
                                : "font-medium",
                            )}
                          >
                            {node.name}
                          </Typography>
                        </div>
                      )}
                    />
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
                <div className="h-12 border-b border-outline-variant/30 flex items-center px-4 gap-2 bg-surface-container-lowest shrink-0">
                  <Settings2 className="w-4 h-4 opacity-70" />
                  <Typography variant="label-medium" className="font-bold">
                    Inspector
                  </Typography>
                </div>
                <div className="flex-1 p-4 flex flex-col items-center justify-center opacity-50">
                  {selectedNodeIds.length === 1 ? (
                    <>
                      <Typography variant="body-small">
                        Properties for Node:
                      </Typography>
                      <Typography
                        variant="label-medium"
                        className="font-mono mt-2 break-all text-center"
                      >
                        {selectedNodeIds[0]}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="body-small">
                        Multiple Items Selected
                      </Typography>
                      <Typography
                        variant="label-medium"
                        className="font-mono mt-2 text-center"
                      >
                        {selectedNodeIds.length} items
                      </Typography>
                    </>
                  )}
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

      {/* EDIT PAGE DIALOG */}
      <Dialog
        open={editingPageId !== null}
        onOpenChange={(open) => !open && setEditingPageId(null)}
        variant="basic"
        animation="material3"
        glass={false}
      >
        <DialogContent className="max-w-md" shape="full">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4 py-4">
            <Input
              label="Page Slug"
              placeholder="/about"
              value={editPageSlug}
              onChange={(e) => setEditPageSlug(e.target.value)}
              autoFocus
            />
            <Input
              label="Page Title"
              placeholder="About Us"
              value={editPageTitle}
              onChange={(e) => setEditPageTitle(e.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="secondary"
              onClick={handleEditPage}
              disabled={!editPageSlug}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BuilderContextProvider>
  );
};
