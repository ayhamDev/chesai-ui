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
  useOnSelectionChange,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { clsx } from "clsx";
import { ArtboardNode } from "./ArtboardNode";
import { Toolbar } from "../../toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "../../dropdown-menu";
import { Button } from "../../button";
import { IconButton } from "../../icon-button";
import { Card } from "../../card";
import { Chip } from "../../chip";
import { Typography } from "../../typography";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../../tooltip";
import { useTheme } from "../../../context/ThemeProvider";
import { ElasticScrollArea } from "../../elastic-scroll-area";
import {
  Plus,
  Minus,
  Maximize,
  MousePointer2,
  Hand,
  Sun,
  Moon,
  ChevronDown,
  X,
  Wand2,
  ArrowUp,
  MoreHorizontal,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  File,
  UploadCloud,
  Settings2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Resizable } from "../../resizable";

// --- DEVELOPER API CONFIGURATION ---
export interface StudioAIConfig {
  enabled: boolean;
  suggestions?: string[];
  models?: string[];
  onPromptSubmit?: (
    prompt: string,
    context: { nodes: any[]; files: File[] },
  ) => void;
  onPanelCollapseToggle?: (isOpen: boolean) => void;
  logsContent?: React.ReactNode;
}

interface CanvasInnerProps {
  aiConfig?: StudioAIConfig;
}

const nodeTypes = {
  artboard: ArtboardNode,
};

const initialNodes = [
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // React Flow Control Hooks
  const {
    zoomIn,
    zoomOut,
    fitView,
    zoomTo,
    setNodes: setReactFlowNodes,
  } = useReactFlow();
  const { zoom } = useViewport();

  // Custom Theme Hook
  const { resolvedTheme, setTheme } = useTheme();

  // Interactive States
  const [activeTool, setActiveTool] = useState<"pointer" | "hand">("pointer");
  const [promptText, setPromptText] = useState("");
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [isLogsPanelOpen, setIsLogsPanelOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [activeModel, setActiveModel] = useState(
    aiConfig?.models?.[0] || "3 Flash",
  );
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsPanelRef = useRef<HTMLDivElement>(null);

  // Hook into React Flow's selection engine
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes);
    },
  });

  const zoomPercentage = Math.round(zoom * 100);

  // --- KEYBOARD SHORTCUTS (V for Pointer, H for Hand) ---
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- CLICK OUTSIDE TO CLOSE LOGS ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isLogsPanelOpen &&
        logsPanelRef.current &&
        !logsPanelRef.current.contains(event.target as Node)
      ) {
        setIsLogsPanelOpen(false);
        aiConfig?.onPanelCollapseToggle?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLogsPanelOpen, aiConfig]);

  // --- TEXTAREA AUTO-EXPAND LOGIC ---
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  };

  // --- DRAG & DROP FILE HANDLING ---
  const handleDragOver = (e: React.DragEvent) => {
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

  const handleDeselectNode = (nodeId: string) => {
    // Update React Flow's internal state to remove the selection
    setReactFlowNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, selected: false } : n)),
    );
  };

  const handlePromptSubmit = () => {
    if (!promptText.trim() && attachedFiles.length === 0) return;

    aiConfig?.onPromptSubmit?.(promptText, {
      nodes: selectedNodes,
      files: attachedFiles,
    });

    setPromptText("");
    setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div
      className={clsx(
        "w-full h-full bg-graphite-background transition-cursor",
        activeTool === "pointer"
          ? "[&_.react-flow__pane]:cursor-default"
          : "[&_.react-flow__pane]:cursor-grab active:[&_.react-flow__pane]:cursor-grabbing",
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        // --- GESTURE & SELECTION CONFIGURATION ---
        panOnScroll={true}
        zoomOnScroll={false}
        panOnDrag={activeTool === "hand"}
        selectionOnDrag={activeTool === "pointer"}
        selectionMode={SelectionMode.Partial}
        nodesDraggable={activeTool === "pointer"}
        elementsSelectable={activeTool === "pointer"}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={2}
          color="var(--md-sys-color-on-surface-variant)"
          className="opacity-40"
        />

        {/* --- RIGHT TOOLBAR (Center Right) --- */}
        <Panel position="center-right" className="m-4 z-50">
          <Toolbar
            orientation="vertical"
            variant="secondary"
            shape="minimal"
            shadow="lg"
            className="border border-outline-variant/30 bg-surface-container-high/95 backdrop-blur-sm items-center py-2"
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

        {/* --- CONDITIONAL AI FEATURES --- */}
        {aiConfig?.enabled && (
          <>
            {/* --- TOP LEFT (LLM Logs Panel) --- */}
            <Panel
              position="top-left"
              className="m-4 z-50 pointer-events-none sm:h-[calc(100%-2rem)] flex flex-col"
            >
              <div
                ref={logsPanelRef}
                className="w-[360px] pointer-events-auto flex flex-col items-start gap-2 h-full"
              >
                <TooltipProvider>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setIsLogsPanelOpen(!isLogsPanelOpen);
                        aiConfig.onPanelCollapseToggle?.(!isLogsPanelOpen);
                      }}
                      className="bg-surface-container-high/90 hover:bg-surface-container-highest backdrop-blur-2xl border border-outline-variant/30 rounded-full w-12 h-6 flex items-center justify-center shadow-md transition-colors shrink-0"
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
                      className="h-[75%] w-full flex flex-col"
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
                            {/* Developer provided logs content goes here */}
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

            {/* --- BOTTOM CENTER (LLM Prompt Interface) --- */}
            <Panel
              position="bottom-center"
              className="mb-6 w-full max-w-[600px] z-50 pointer-events-none"
            >
              <div className="flex flex-col gap-2 w-full pointer-events-auto px-4">
                {/* Suggestions Row */}
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
                  {/* Context Area (Nodes & Files) */}
                  {(selectedNodes.length > 0 || attachedFiles.length > 0) && (
                    <div className="flex px-2 pt-2 gap-2 flex-wrap max-h-[80px] overflow-y-auto no-scrollbar">
                      {selectedNodes.map((node) => (
                        <Chip
                          key={node.id}
                          startIcon={
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          }
                          endIcon={
                            <X
                              size={12}
                              className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer ml-1"
                              onClick={() => handleDeselectNode(node.id)}
                            />
                          }
                          className="bg-surface-container-highest hover:bg-surface-container-highest/80 border border-outline-variant/30 text-[11px] h-6 px-2 font-medium shadow-sm"
                        >
                          {node.data?.label || node.id}
                        </Chip>
                      ))}

                      {attachedFiles.map((file, idx) => (
                        <Chip
                          key={idx}
                          startIcon={
                            file.type.startsWith("image/") ? (
                              <ImageIcon size={12} className="text-primary" />
                            ) : (
                              <Paperclip size={12} className="text-primary" />
                            )
                          }
                          endIcon={
                            <X
                              size={12}
                              className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer ml-1"
                              onClick={() => removeFile(idx)}
                            />
                          }
                          className="bg-surface-container-highest hover:bg-surface-container-highest/80 border border-outline-variant/30 text-[11px] h-6 px-2 font-medium shadow-sm"
                        >
                          {file.name}
                        </Chip>
                      ))}
                    </div>
                  )}

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Textarea Wrapper for Dropzone */}
                  <div
                    className="relative w-full mt-1 rounded-lg overflow-hidden"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <textarea
                      ref={textareaRef}
                      className="w-full bg-transparent border-none outline-none resize-none text-on-surface placeholder:text-on-surface-variant/50 px-3 py-2 text-sm min-h-[40px] max-h-[120px] overflow-y-auto scrollbar-thin"
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

                    {/* Drag & Drop Visual Overlay */}
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

                  {/* Bottom Actions Row */}
                  <div className="flex items-center justify-between px-1 pb-1 pt-1">
                    {/* Left Utilities (Upload Menu) */}
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
                          <DropdownMenuItem
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <ImageIcon className="w-4 h-4 mr-2" /> From Images
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-1.5">
                      {/* Dynamic Model Selector */}
                      {aiConfig.models && aiConfig.models.length > 0 && (
                        <DropdownMenu shape="minimal">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              shape="full"
                              className="h-7 px-3 bg-surface-container-highest/50 hover:bg-surface-container-highest border border-outline-variant/30 gap-1.5 text-xs font-semibold shadow-sm"
                            >
                              {activeModel}
                              <ChevronDown size={12} className="opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {aiConfig.models.map((model) => (
                              <DropdownMenuItem
                                key={model}
                                onClick={() => setActiveModel(model)}
                              >
                                {model}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      <IconButton
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest cursor-default"
                      >
                        <Wand2 size={14} />
                      </IconButton>

                      {/* Submit Button */}
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={handlePromptSubmit}
                        className={clsx(
                          "h-7 w-7 transition-colors",
                          promptText.length > 0 || attachedFiles.length > 0
                            ? "bg-primary text-on-primary hover:bg-primary/90 shadow-md"
                            : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest/80",
                        )}
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

        {/* RIGHT PANEL (Inspector) */}
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
