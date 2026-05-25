// src/lib/components/website-studio/builder/PagesTab.tsx
import React from "react";
import { clsx } from "clsx";
import {
  Search,
  Plus,
  Home,
  File,
  MoreHorizontal,
  Edit3,
  Copy,
  Trash2,
} from "lucide-react";
import { Input } from "../../input";
import { IconButton } from "../../icon-button";
import { TreeView } from "../../tree-view";
import { ContextMenu } from "../../context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
import { useStudioStore } from "../store";
import type { PageNode, PageAction } from "./types";

interface PagesTabProps {
  pageSearch: string;
  setPageSearch: (val: string) => void;
  displayedPagesTree: PageNode[];
  expandedPageIds: string[];
  setExpandedPageIds: React.Dispatch<React.SetStateAction<string[]>>;
  setIsAddPageOpen: (open: boolean) => void;
  openEditPage: (id: string) => void;
  customPageActions?: PageAction[];
}

export const PagesTab: React.FC<PagesTabProps> = ({
  pageSearch,
  setPageSearch,
  displayedPagesTree,
  expandedPageIds,
  setExpandedPageIds,
  setIsAddPageOpen,
  openEditPage,
  customPageActions,
}) => {
  const { website, activePageId, setActivePage, duplicatePage, removePage } =
    useStudioStore();

  return (
    <div className="p-0 flex flex-col h-full overflow-hidden">
      <div className="flex gap-2 p-3 border-b border-outline-variant/30 shrink-0">
        <Input
          variant="filled"
          size="sm"
          placeholder="Search pages..."
          startContent={<Search className="w-4 h-4 text-on-surface-variant" />}
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
                <ContextMenu.Item onClick={() => openEditPage(node.pageId)}>
                  <Edit3 className="w-4 h-4 mr-2" /> Edit
                </ContextMenu.Item>
                <ContextMenu.Item onClick={() => duplicatePage(node.pageId)}>
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
                    {action.icon && <span className="mr-2">{action.icon}</span>}
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
    </div>
  );
};
