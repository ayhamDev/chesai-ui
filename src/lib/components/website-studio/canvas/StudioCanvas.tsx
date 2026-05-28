// src/lib/components/website-studio/canvas/StudioCanvas.tsx
"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import { type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { clsx } from "clsx";
import { ArtboardNode } from "./ArtboardNode";
import { Toolbar } from "../../toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from "../../dropdown-menu";
import { Button } from "../../button";
import { IconButton } from "../../icon-button";
import { Card } from "../../card";
import { Chip } from "../../chip";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../../tooltip";
import { useTheme } from "../../../context/ThemeProvider";
import { ElasticScrollArea } from "../../elastic-scroll-area";
import {
  Plus,
  Maximize,
  MousePointer2,
  Hand,
  Sun,
  Moon,
  ChevronDown,
  X,
  ArrowUp,
  MoreHorizontal,
  Paperclip,
  Image as ImageIcon,
  File,
  UploadCloud,
  Check,
} from "lucide-react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useStudioStore } from "../store";

export interface StudioAIConfig {
  enabled: boolean;
  suggestions?: string[];
  models?: string[];
  defaultModel?: string;
  onModelChange?: (model: string) => void;
  onPromptSubmit?: (
    prompt: string,
    context: { nodes: any[]; files: File[]; model?: string },
  ) => void;
  onPanelCollapseToggle?: (isOpen: boolean) => void;
  logsContent?: React.ReactNode;
  customActions?: React.ReactNode; // Inject custom buttons here (like settings, wand, etc.)
}

interface CanvasInnerProps {
  aiConfig?: StudioAIConfig;
}

const nodeTypes = {
  artboard: ArtboardNode,
};

const initialPageNodes: Node<{ label: string; width: number; height: number; isIsolationMode?: boolean; componentId?: string; }>[] = [
  {
    id: "desktop",
    type: "artboard",
    position: { x: 0, y: 0 },
    data: { label: "Desktop", width: 1200, height: 800 },
    deletable: false,
  },
  {
    id: "tablet",
    type: "artboard",
    position: { x: 1300, y: 0 },
    data: { label: "Tablet", width: 768, height: 1024 },
    deletable: false,
  },
  {
    id: "mobile",
    type: "artboard",
    position: { x: 2150, y: 0 },
    data: { label: "Mobile", width: 393, height: 852 },
    deletable: false,
  },
];

const CanvasInner = ({ aiConfig }: CanvasInnerProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialPageNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const {
    viewContext,
    setSelectedNodes: setStudioSelectedNodes,
    selectedNodeIds,
    website,
    activePageId,
  } = useStudioStore();

  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow();
  const { zoom } = useViewport();
  const { resolvedTheme, setTheme } = useTheme();

  const [activeTool, setActiveTool] = useState<"pointer" | "hand">("pointer");
  const [promptText, setPromptText] = useState("");
  const [isLogsPanelOpen, setIsLogsPanelOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Model state defaults cleanly if nothing is provided
  const [activeModel, setActiveModel] = useState<string | undefined>(
    aiConfig?.defaultModel || aiConfig?.models?.[0],
  );

  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (viewContext.type === "COMPONENT" && viewContext.id) {
      setNodes([
        {
          id: "component-isolation",
          type: "artboard",
          position: { x: 0, y: 0 },
          data: {
            label: `Component Sandbox`,
            width: 1400,
            height: 1000,
            isIsolationMode: true,
            componentId: viewContext.id,
          },
          deletable: false,
        },
      ]);
      setTimeout(() => fitView({ duration: 500, padding: 0.1 }), 50);
    } else {
      setNodes(initialPageNodes);
      setTimeout(() => fitView({ duration: 500, padding: 0.1 }), 50);
    }
  }, [viewContext, setNodes, fitView]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      mouseX.set(x - 125);
      mouseY.set(y - 125);
    },
    [mouseX, mouseY],
  );

  const zoomPercentage = Math.round(zoom * 100);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA"].includes(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.key.toLowerCase() === "v") setActiveTool("pointer");
      if (e.key.toLowerCase() === "h") setActiveTool("hand");
      if (e.key === "Escape") setStudioSelectedNodes([]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setStudioSelectedNodes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isLogsPanelOpen &&
        logsPanelRef.current &&
        !logsPanelRef.current.contains(event.target as any)
      ) {
        setIsLogsPanelOpen(false);
        aiConfig?.onPanelCollapseToggle?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLogsPanelOpen, aiConfig]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/studio-component")) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setAttachedFiles((prev) => [
        ...prev,
        ...Array.from(e.dataTransfer.files!),
      ]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeselectStudioNode = (id: string) => {
    setStudioSelectedNodes(selectedNodeIds.filter((nId) => nId !== id));
  };

  const getStudioNodeDetails = useCallback(
    (id: string) => {
      const activePage = website?.pages.find((p) => p.id === activePageId);
      if (!activePage) return null;
      let foundNode: any = null;
      const search = (nodes: any[]) => {
        for (const n of nodes) {
          if (n.id === id) {
            foundNode = n;
            return;
          }
          if (n.children) search(n.children);
        }
      };
      search(activePage.content);
      return foundNode;
    },
    [website, activePageId],
  );

  const handlePromptSubmit = () => {
    if (!promptText.trim() && attachedFiles.length === 0) return;

    const studioNodesToSubmit = selectedNodeIds
      .map((id) => getStudioNodeDetails(id))
      .filter(Boolean);

    aiConfig?.onPromptSubmit?.(promptText, {
      nodes: studioNodesToSubmit,
      files: attachedFiles,
      model: activeModel,
    });

    setPromptText("");
    setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div
      data-tool={activeTool}
      className={clsx(
        "group/canvas w-full h-full bg-surface-container-lowest transition-cursor z-100 relative overflow-hidden",
        activeTool === "pointer"
          ? "[&_.react-flow__pane]:!cursor-default [&_.react-flow__node]:!cursor-default"
          : "[&_.react-flow__pane]:!cursor-grab active:[&_.react-flow__pane]:!cursor-grabbing",
      )}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes as any}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        zoomOnPinch={true}
        proOptions={{ hideAttribution: true }}
        panOnScroll={true}
        zoomOnScroll={false}
        panOnDrag={activeTool === "hand"}
        selectionOnDrag={false}
        nodesDraggable={activeTool === "pointer"}
        elementsSelectable={activeTool === "pointer"}
        onPaneClick={() => setStudioSelectedNodes([])}
      >
        <motion.div
          className="pointer-events-none absolute w-[300px] h-[300px] blur-3xl rounded-full"
          style={{
            x: mouseX,
            y: mouseY,
            background: `radial-gradient(circle, 
              color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent) 0%, 
              color-mix(in srgb, var(--md-sys-color-tertiary) 2%, transparent) 50%, 
              transparent 85%)`,
            zIndex: -1,
            willChange: "transform, opacity",
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0 }}
        />

        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={3}
          color="var(--md-sys-color-on-surface-variant)"
          className="opacity-30"
          bgColor="var(--md-sys-color-surface-container-high)"
        />

        <Panel position="center-right" className="m-4 z-50 pointer-events-none">
          <Toolbar
            orientation="vertical"
            variant="secondary"
            shape="minimal"
            shadow="lg"
            className="pointer-events-auto border border-outline-variant/30 bg-surface-container-high/95 backdrop-blur-sm items-center py-2"
          >
            <Toolbar.ToggleGroup
              type="single"
              value={activeTool}
              onValueChange={(val) => val && setActiveTool(val as any)}
              className="flex-col gap-1"
            >
              <Toolbar.ToggleItem
                value="pointer"
                tooltip="Select Tool"
                shortcut="V"
              >
                <MousePointer2 className="w-4 h-4" />
              </Toolbar.ToggleItem>
              <Toolbar.ToggleItem value="hand" tooltip="Hand Tool" shortcut="H">
                <Hand className="w-4 h-4" />
              </Toolbar.ToggleItem>
            </Toolbar.ToggleGroup>

            <Toolbar.Separator />

            <Toolbar.Button
              tooltip={
                resolvedTheme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Toolbar.Button>

            <Toolbar.Button
              onClick={() => fitView({ duration: 400 })}
              tooltip="Zoom to Fit"
              shortcut="Shift+1"
            >
              <Maximize className="w-4 h-4" />
            </Toolbar.Button>

            <Toolbar.Separator />

            <DropdownMenu shape="minimal">
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-between gap-1 px-1.5 h-8 rounded-md hover:bg-surface-container-highest/80 text-on-surface text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary">
                  <span className="font-mono">{zoomPercentage}%</span>
                  <ChevronDown size={12} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="left" className="w-56">
                <DropdownMenuLabel>Zoom Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => zoomIn()}>
                  <span>Zoom In</span>
                  <DropdownMenuShortcut>Ctrl+=</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => zoomOut()}>
                  <span>Zoom Out</span>
                  <DropdownMenuShortcut>Ctrl+-</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => zoomTo(1, { duration: 300 })}>
                  <span>Zoom to 100%</span>
                  <DropdownMenuShortcut>Shift+0</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fitView({ duration: 400 })}>
                  <span>Zoom to Fit</span>
                  <DropdownMenuShortcut>Shift+1</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Toolbar>
        </Panel>

        {aiConfig?.enabled && (
          <>
            <Panel
              position="top-left"
              className="m-4 z-50 pointer-events-none h-[calc(100%-17rem)] flex flex-col"
            >
              <div
                ref={logsPanelRef}
                className="w-[400px] pointer-events-none flex flex-col items-start gap-2 h-full"
              >
                <TooltipProvider>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setIsLogsPanelOpen(!isLogsPanelOpen);
                        aiConfig.onPanelCollapseToggle?.(!isLogsPanelOpen);
                      }}
                      className="pointer-events-auto bg-surface-container-high/90 hover:bg-surface-container-highest backdrop-blur-2xl border border-outline-variant/30 rounded-full w-12 h-6 flex items-center justify-center shadow-md transition-colors shrink-0"
                    >
                      <MoreHorizontal size={14} className="text-on-surface" />
                    </button>
                  </TooltipTrigger>
                  <Tooltip>Collapse panel</Tooltip>
                </TooltipProvider>

                <AnimatePresence>
                  {isLogsPanelOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="h-full w-full flex flex-col min-h-0 pointer-events-auto"
                    >
                      <Card
                        glass
                        variant="secondary"
                        shape="minimal"
                        padding="md"
                        className="w-full flex-1 flex flex-col gap-4 shadow-2xl border border-outline-variant/30 overflow-hidden"
                      >
                        <ElasticScrollArea className="flex-1 w-full h-full pr-2">
                          <div className="flex flex-col gap-4 pb-4">
                            {aiConfig.logsContent || (
                              <div className="text-sm text-on-surface-variant italic opacity-70 p-4 text-center">
                                Awaiting interaction logs...
                              </div>
                            )}
                          </div>
                        </ElasticScrollArea>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Panel>

            <Panel
              position="bottom-left"
              className="mb-6 w-full max-w-[600px] z-50 pointer-events-none"
            >
              <div className="flex flex-col gap-2 w-full pointer-events-auto px-4">
                {aiConfig.suggestions && aiConfig.suggestions.length > 0 && (
                  <ElasticScrollArea
                    orientation="horizontal"
                    dimmingEdges
                    scrollbarVisibility="hidden"
                    className="w-full mb-1"
                  >
                    <div className="flex gap-2 w-max px-1 pb-1">
                      {aiConfig.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPromptText(suggestion)}
                          className="flex shrink-0 items-center gap-2 px-3 py-1.5 bg-surface-container-highest/80 hover:bg-surface-container-highest rounded-full text-xs font-medium border border-outline-variant/30 shadow-sm transition-colors text-on-surface"
                        >
                          <span className="truncate max-w-[250px]">
                            {suggestion}
                          </span>
                          <span className="text-on-surface-variant font-mono text-[10px] ml-1 opacity-70">
                            {idx + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </ElasticScrollArea>
                )}

                <Card
                  glass
                  variant="secondary"
                  shape="minimal"
                  padding="none"
                  className="w-full flex flex-col shadow-2xl border border-outline-variant/50 p-2"
                >
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Faux Textarea Wrapper: Combines the selections and the actual textarea to look like one entity */}
                  <div
                    className="relative w-full rounded-lg overflow-hidden bg-surface-container-highest/30 border border-outline-variant/30 focus-within:border-primary/50 transition-colors"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {/* Render Studio Node chips INSIDE the textarea wrapper */}
                    {(selectedNodeIds.length > 0 ||
                      attachedFiles.length > 0) && (
                      <ElasticScrollArea
                        orientation="horizontal"
                        dimmingEdges
                        scrollbarVisibility="hidden"
                        className="w-full p-2"
                      >
                        <div className="flex gap-2 w-max px-1 pb-1">
                          {selectedNodeIds.map((id) => {
                            const node = getStudioNodeDetails(id);

                            const label = node
                              ? node?.id ||
                                node.props?.title ||
                                node.props?.name ||
                                node.type
                              : id;

                            return (
                              <Chip
                                key={id}
                                startIcon={
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                }
                                endIcon={
                                  <X
                                    size={12}
                                    className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer ml-1"
                                    onClick={() => handleDeselectStudioNode(id)}
                                  />
                                }
                                className="bg-surface hover:bg-surface-container-highest border border-outline-variant/30 text-[11px] h-6 px-2 font-medium shadow-sm shrink-0"
                              >
                                {label}
                              </Chip>
                            );
                          })}

                          {attachedFiles.map((file, idx) => (
                            <Chip
                              key={idx}
                              startIcon={
                                file.type.startsWith("image/") ? (
                                  <ImageIcon
                                    size={12}
                                    className="text-primary"
                                  />
                                ) : (
                                  <Paperclip
                                    size={12}
                                    className="text-primary"
                                  />
                                )
                              }
                              endIcon={
                                <X
                                  size={12}
                                  className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer ml-1"
                                  onClick={() => removeFile(idx)}
                                />
                              }
                              className="bg-surface hover:bg-surface-container-highest border border-outline-variant/30 text-[11px] h-6 px-2 font-medium shadow-sm shrink-0"
                            >
                              {file.name}
                            </Chip>
                          ))}
                        </div>
                      </ElasticScrollArea>
                    )}

                    <textarea
                      ref={textareaRef}
                      className="w-full bg-transparent border-none outline-none resize-none text-on-surface placeholder:text-on-surface-variant/50 px-3 py-2 pt-3 text-sm min-h-[40px] max-h-[120px] overflow-y-auto scrollbar-thin"
                      placeholder="What would you like to change or create?"
                      rows={1}
                      value={promptText}
                      onChange={handleTextareaChange}
                      onFocus={() => {
                        if (!isLogsPanelOpen) {
                          setIsLogsPanelOpen(true);
                          aiConfig?.onPanelCollapseToggle?.(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handlePromptSubmit();
                        }
                      }}
                    />

                    <AnimatePresence>
                      {isDraggingFile && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary pointer-events-none"
                        >
                          <div className="bg-surface-container-highest px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
                            <UploadCloud className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-primary">
                              Drop files to attach
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between px-1 pb-1 pt-2">
                    <div className="flex items-center gap-0.5">
                      <DropdownMenu shape="minimal">
                        <DropdownMenuTrigger asChild>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                          >
                            <Plus size={16} />
                          </IconButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuItem
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <File className="w-4 h-4 mr-2" /> Upload File
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Inject any Custom Actions provided via the config */}
                      {aiConfig.customActions}

                      {aiConfig.models && aiConfig.models.length > 0 && (
                        <DropdownMenu shape="minimal">
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" shape="full">
                              {activeModel || aiConfig.models[0]}
                              <ChevronDown size={12} className="opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {aiConfig.models.map((model) => (
                              <DropdownMenuItem
                                key={model}
                                onClick={() => {
                                  setActiveModel(model);
                                  aiConfig.onModelChange?.(model);
                                }}
                              >
                                {activeModel === model && (
                                  <Check className="w-4 h-4 mr-2" />
                                )}
                                {model}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={handlePromptSubmit}
                      >
                        <ArrowUp size={14} />
                      </IconButton>
                    </div>
                  </div>
                </Card>
              </div>
            </Panel>
          </>
        )}
      </ReactFlow>
    </div>
  );
};

export const StudioCanvas = ({ aiConfig }: CanvasInnerProps) => {
  return (
    <ReactFlowProvider>
      <CanvasInner aiConfig={aiConfig} />
    </ReactFlowProvider>
  );
};
