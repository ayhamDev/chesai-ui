// src/lib/components/website-studio/builder/LayersTab.tsx
import React, { useState } from "react";
import { clsx } from "clsx";
import {
  File,
  Search,
  MoreHorizontal,
  Copy,
  Clipboard,
  Trash2,
  RefreshCw,
  ArrowUpToLine,
  ArrowDownToLine,
  CornerDownRight,
  Plus,
  Edit2, // <-- Added Icon
} from "lucide-react";
import { Input } from "../../input";
import { Select } from "../../select";
import { TreeView } from "../../tree-view";
import { ContextMenu } from "../../context-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../dropdown-menu";
import { Typography } from "../../typography";
import { IconButton } from "../../icon-button";
import { useStudioStore } from "../store";
import { getNodeIcon } from "./helpers";
import { toast } from "../../toast";
import type { ComponentRegistry, StudioNode } from "../types";

interface LayersTabProps {
  layerSearch: string;
  setLayerSearch: (val: string) => void;
  displayedLayers: StudioNode[];
  expandedLayerIds: string[];
  setExpandedLayerIds: React.Dispatch<React.SetStateAction<string[]>>;
  components: ComponentRegistry;
}

export const LayersTab: React.FC<LayersTabProps> = ({
  layerSearch,
  setLayerSearch,
  displayedLayers,
  expandedLayerIds,
  setExpandedLayerIds,
  components,
}) => {
  const {
    website,
    activePageId,
    setActivePage,
    selectedNodeIds,
    setSelectedNodes,
    viewContext,
    setViewContext,
    clipboard,
    copyNodes,
    pasteNodes,
    duplicateNodes,
    removeNodes,
    moveNodes,
    openComponentPicker,
    updateNodeId, // <-- Extract new action
  } = useStudioStore();

  const activePage = website?.pages.find((p) => p.id === activePageId);

  // --- RENAME STATE ---
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const startRename = (nodeId: string) => {
    setEditingNodeId(nodeId);
    setEditingValue(nodeId);
  };

  const commitRename = () => {
    if (
      editingNodeId &&
      editingValue.trim() &&
      editingValue !== editingNodeId
    ) {
      updateNodeId(editingNodeId, editingValue.trim());
      // Wait for store update cycle to see if it failed uniqueness validation
      setTimeout(() => {
        const currentSelected = useStudioStore.getState().selectedNodeIds;
        if (currentSelected.includes(editingNodeId)) {
          // If old ID is still selected, the update failed/aborted
          toast.error("Rename failed", {
            description: "Node ID must be unique across the page.",
          });
        }
      }, 50);
    }
    setEditingNodeId(null);
  };

  return (
    <div className="p-0 flex flex-col h-full overflow-hidden">
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
          startContent={<Search className="w-4 h-4 text-on-surface-variant" />}
          value={layerSearch}
          onChange={(e) => setLayerSearch(e.target.value)}
        />
      </div>

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
                  if (editingNodeId) commitRename(); // commit if clicking away
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
                  const targetIds = selectedNodeIds.includes(node.id)
                    ? selectedNodeIds
                    : [node.id];

                  const isSingleSelection = targetIds.length === 1;
                  const acceptsChildren =
                    components[node.type]?.acceptsChildren ?? false;
                  const pastePosition = acceptsChildren ? "inside" : "after";

                  return (
                    <ContextMenu shape="minimal">
                      <ContextMenu.Trigger asChild>
                        <div
                          className={clsx(
                            "flex items-center justify-between gap-2 w-full pr-2 group/item text-left pointer-events-auto",
                            isDragging && "opacity-80",
                          )}
                          onDoubleClick={() => startRename(node.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="shrink-0">
                              {getNodeIcon(node.type)}
                            </div>

                            {/* --- INLINE RENAME INPUT --- */}
                            {editingNodeId === node.id ? (
                              <input
                                autoFocus
                                className="flex-1 min-w-0 bg-surface text-on-surface text-xs font-mono px-1 py-0.5 border border-primary outline-none rounded"
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(
                                    e.target.value.replace(/\s+/g, "-"),
                                  )
                                }
                                onBlur={commitRename}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitRename();
                                  if (e.key === "Escape")
                                    setEditingNodeId(null);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <Typography
                                variant="label-small"
                                className={clsx(
                                  "truncate flex-1 text-left font-mono",
                                  isSelected
                                    ? "font-bold"
                                    : "font-medium text-on-surface-variant",
                                )}
                              >
                                {node.id}
                              </Typography>
                            )}
                          </div>

                          <DropdownMenu shape="minimal">
                            <DropdownMenuTrigger asChild>
                              <IconButton
                                variant="ghost"
                                size="xs"
                                onPointerDown={(e) => e.stopPropagation()}
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
                                  startRename(node.id);
                                }}
                              >
                                <Edit2 className="w-4 h-4 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyNodes(targetIds);
                                }}
                              >
                                <Copy className="w-4 h-4 mr-2" /> Copy
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={clipboard.length === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  pasteNodes(node.id, pastePosition);
                                }}
                              >
                                <Clipboard className="w-4 h-4 mr-2" /> Paste
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateNodes(targetIds);
                                }}
                              >
                                <Copy className="w-4 h-4 mr-2" /> Duplicate
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                disabled={!isSingleSelection}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openComponentPicker("replace", node.id);
                                }}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" /> Replace
                                with...
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!isSingleSelection}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openComponentPicker("before", node.id);
                                }}
                              >
                                <ArrowUpToLine className="w-4 h-4 mr-2" />{" "}
                                Insert Before...
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={!isSingleSelection}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openComponentPicker("after", node.id);
                                }}
                              >
                                <ArrowDownToLine className="w-4 h-4 mr-2" />{" "}
                                Insert After...
                              </DropdownMenuItem>
                              {acceptsChildren && (
                                <DropdownMenuItem
                                  disabled={!isSingleSelection}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openComponentPicker("inside", node.id);
                                  }}
                                >
                                  <CornerDownRight className="w-4 h-4 mr-2" />{" "}
                                  Insert Inside...
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className="text-error hover:!bg-error/10 hover:!text-error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNodes(targetIds);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </ContextMenu.Trigger>

                      <ContextMenu.Content>
                        <ContextMenu.Item onClick={() => startRename(node.id)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Rename
                        </ContextMenu.Item>
                        <ContextMenu.Separator />

                        <ContextMenu.Item onClick={() => copyNodes(targetIds)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          disabled={clipboard.length === 0}
                          onClick={() => pasteNodes(node.id, pastePosition)}
                        >
                          <Clipboard className="w-4 h-4 mr-2" /> Paste
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          onClick={() => duplicateNodes(targetIds)}
                        >
                          <Copy className="w-4 h-4 mr-2" /> Duplicate
                        </ContextMenu.Item>

                        <ContextMenu.Separator />

                        <ContextMenu.Item
                          disabled={!isSingleSelection}
                          onClick={() =>
                            openComponentPicker("replace", node.id)
                          }
                        >
                          <RefreshCw className="w-4 h-4 mr-2" /> Replace with...
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          disabled={!isSingleSelection}
                          onClick={() => openComponentPicker("before", node.id)}
                        >
                          <ArrowUpToLine className="w-4 h-4 mr-2" /> Insert
                          Before...
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          disabled={!isSingleSelection}
                          onClick={() => openComponentPicker("after", node.id)}
                        >
                          <ArrowDownToLine className="w-4 h-4 mr-2" /> Insert
                          After...
                        </ContextMenu.Item>
                        {acceptsChildren && (
                          <ContextMenu.Item
                            disabled={!isSingleSelection}
                            onClick={() =>
                              openComponentPicker("inside", node.id)
                            }
                          >
                            <CornerDownRight className="w-4 h-4 mr-2" /> Insert
                            Inside...
                          </ContextMenu.Item>
                        )}

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

        {/* Global Context Menu (clicking empty space) */}
        <ContextMenu.Content>
          {selectedNodeIds.length === 0 && (
            <>
              <ContextMenu.Item
                onClick={() => openComponentPicker("inside", "ROOT")}
              >
                <Plus className="w-4 h-4 mr-2" /> Insert Component...
              </ContextMenu.Item>
              <ContextMenu.Separator />
            </>
          )}

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
                selectedNodeIds.length > 0 ? selectedNodeIds[0] : null;
              let canAcceptChildren = false;
              if (targetId) {
                const page = website?.pages.find((p) => p.id === activePageId);
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
                    ? (components[type]?.acceptsChildren ?? false)
                    : false;
                }
              }
              pasteNodes(targetId, canAcceptChildren ? "inside" : "after");
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

          {selectedNodeIds.length === 1 && (
            <>
              <ContextMenu.Item
                onClick={() =>
                  openComponentPicker("replace", selectedNodeIds[0])
                }
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Replace with...
              </ContextMenu.Item>
              <ContextMenu.Item
                onClick={() =>
                  openComponentPicker("before", selectedNodeIds[0])
                }
              >
                <ArrowUpToLine className="w-4 h-4 mr-2" /> Insert Before...
              </ContextMenu.Item>
              <ContextMenu.Item
                onClick={() => openComponentPicker("after", selectedNodeIds[0])}
              >
                <ArrowDownToLine className="w-4 h-4 mr-2" /> Insert After...
              </ContextMenu.Item>
              {(() => {
                let canAcceptChildren = false;
                const page = website?.pages.find((p) => p.id === activePageId);
                if (page) {
                  const findType = (nodes: StudioNode[]): string | null => {
                    for (const n of nodes) {
                      if (n.id === selectedNodeIds[0]) return n.type;
                      if (n.children) {
                        const res = findType(n.children);
                        if (res) return res;
                      }
                    }
                    return null;
                  };
                  const type = findType(page.content);
                  canAcceptChildren = type
                    ? (components[type]?.acceptsChildren ?? false)
                    : false;
                }
                return canAcceptChildren ? (
                  <ContextMenu.Item
                    onClick={() =>
                      openComponentPicker("inside", selectedNodeIds[0])
                    }
                  >
                    <CornerDownRight className="w-4 h-4 mr-2" /> Insert
                    Inside...
                  </ContextMenu.Item>
                ) : null;
              })()}
              <ContextMenu.Separator />
            </>
          )}

          <ContextMenu.Item
            disabled={selectedNodeIds.length === 0}
            className="text-error hover:!bg-error/10 hover:!text-error"
            onClick={() => removeNodes(selectedNodeIds)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
    </div>
  );
};
