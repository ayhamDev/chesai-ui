import React from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  Layers,
  Monitor,
  Play,
  Plus,
  Settings,
  Smartphone,
  Tablet,
} from "lucide-react";
import { Resizable } from "../components/resizable";
import { Typography } from "../components/typography";
import { IconButton } from "../components/icon-button";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { PalettePanel } from "./PalettePanel";
import { LayersPanel } from "./LayersPanel";
import { useBuilderStore } from "./store";
import { BLOCK_GENERATORS } from "./blocks"; // Import our new block generators

export const EditorShell = () => {
  const addNode = useBuilderStore((state) => state.addNode);
  const addNodeTree = useBuilderStore((state) => state.addNodeTree);
  const moveNode = useBuilderStore((state) => state.moveNode);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    const targetParentId = over.id as string;
    const isNew = active.data.current?.isNew;

    if (isNew) {
      const componentType = active.data.current?.type;
      const isBlock = active.data.current?.isBlock;

      // 1. COMPLEX BLOCKS (Trees of nodes)
      if (isBlock && BLOCK_GENERATORS[componentType]) {
        const generatedTree = BLOCK_GENERATORS[componentType]();
        addNodeTree(generatedTree.nodes, generatedTree.rootId, targetParentId);
      }
      // 2. BASIC COMPONENTS (Single nodes)
      else {
        let defaultProps = {};
        let isCanvas = false;

        if (componentType === "Container") {
          defaultProps = {
            className:
              "flex flex-col gap-4 p-4 min-h-[50px] border border-dashed border-outline-variant/50",
          };
          isCanvas = true;
        } else if (componentType === "Button") {
          defaultProps = {
            children: "Click Me",
            variant: "primary",
            size: "md",
            shape: "minimal",
          };
        } else if (componentType === "Typography") {
          defaultProps = {
            children: "Double click to edit",
            variant: "body-large",
          };
        } else if (componentType === "Image") {
          defaultProps = {
            src: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600",
            alt: "Image",
            className: "w-full h-auto rounded-lg object-cover",
          };
        }

        addNode(
          {
            type: componentType,
            props: defaultProps,
            children: [],
            parent: targetParentId,
            isCanvas,
          },
          targetParentId,
        );
      }
    }
    // 3. MOVING EXISTING NODES
    else if (!isNew && active.id !== targetParentId) {
      moveNode(active.id as string, targetParentId);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen w-full bg-graphite-background text-on-surface overflow-hidden font-manrope">
        {/* --- TOP TOOLBAR --- */}
        <header className="h-14 shrink-0 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold">
              W
            </div>
            <div className="w-px h-6 bg-outline-variant/30 mx-2" />
            <IconButton variant="ghost" size="sm" aria-label="Add Element">
              <Plus className="w-4 h-4" />
            </IconButton>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-lg border border-outline-variant/20">
            <IconButton variant="ghost" size="sm" aria-label="Desktop">
              <Monitor className="w-4 h-4" />
            </IconButton>
            <IconButton variant="ghost" size="sm" aria-label="Tablet">
              <Tablet className="w-4 h-4" />
            </IconButton>
            <IconButton variant="ghost" size="sm" aria-label="Mobile">
              <Smartphone className="w-4 h-4" />
            </IconButton>
          </div>
          <div className="flex items-center gap-3">
            <IconButton variant="ghost" size="sm" aria-label="Settings">
              <Settings className="w-4 h-4" />
            </IconButton>
            <div className="flex items-center gap-2">
              <IconButton variant="secondary" size="sm" aria-label="Preview">
                <Play className="w-4 h-4" />
              </IconButton>
              <button className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                Publish
              </button>
            </div>
          </div>
        </header>

        {/* --- MAIN EDITOR AREA --- */}
        <div className="flex-1 min-h-0 relative">
          <Resizable className="h-full w-full">
            <Resizable.Pane
              id="left-panel"
              defaultWidth={280}
              className="bg-surface-container border-r border-outline-variant/30 flex flex-col z-10"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                <PalettePanel />
                <div className="p-3 border-b border-t border-outline-variant/20 shrink-0 bg-surface-container-high mt-auto">
                  <Typography variant="label-large" className="font-bold">
                    Layers Tree
                  </Typography>
                </div>
                <div className="flex-1 overflow-y-auto min-h-[200px]">
                  <LayersPanel />
                </div>
              </div>
            </Resizable.Pane>

            <Resizable.Handle target="left-panel" variant="pill" />

            <Resizable.Pane
              id="center-canvas"
              flex
              className="bg-surface relative z-0"
            >
              <div className="absolute inset-0 flex justify-center overflow-auto p-4 sm:p-8">
                <div className="w-full max-w-[1200px] min-h-full shadow-2xl bg-white border border-outline-variant/20 rounded-lg overflow-hidden flex flex-col">
                  <Canvas />
                </div>
              </div>
            </Resizable.Pane>

            <Resizable.Handle target="right-panel" invert variant="pill" />

            <Resizable.Pane
              id="right-panel"
              defaultWidth={320}
              className="bg-surface-container border-l border-outline-variant/30 flex flex-col z-10"
            >
              <PropertiesPanel />
            </Resizable.Pane>
          </Resizable>
        </div>
      </div>
    </DndContext>
  );
};
