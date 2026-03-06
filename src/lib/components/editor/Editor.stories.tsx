import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowDown,
  ArrowUp,
  Box,
  Image as ImageIcon,
  Layers,
  Lock,
  MousePointer2,
  Type,
  Unlock,
  Trash2,
  Settings2,
  Sparkles,
  Copy,
  MoreVertical,
  Move,
  Crop,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Editor, useEditor } from "./index";
import { Button } from "../button";
import { Card } from "../card";
import { Toolbar } from "../toolbar";
import { Typography } from "../typography";
import { Image } from "../image";
import { Badge } from "../badge";
import { Item, ItemContent, ItemTitle, ItemActions } from "../item";
import { ContextMenu } from "../context-menu";
import { Tabs } from "../tabs";
import { NumberInput } from "../number-input";
import { Divider } from "../divider";
import { IconButton } from "../icon-button";

const meta: Meta<typeof Editor.Root> = {
  title: "Components/Data/Editor",
  component: Editor.Root,
  subcomponents: {
    "Editor.Canvas": Editor.Canvas as any,
    "Editor.Item": Editor.Item as any,
  },
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};

export default meta;

type ElementType = "text" | "image" | "card";

interface Element {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  rotation: number;
  content?: string;
  locked?: boolean;
}

const EditorToolbar = ({ onAdd }: { onAdd: (type: ElementType) => void }) => {
  const { camera, setCamera } = useEditor();

  return (
    <div className="flex items-center justify-between border-b border-outline-variant bg-surface p-2 shadow-sm z-50">
      <div className="flex items-center gap-4">
        <Toolbar variant="secondary" size="sm" shape="minimal">
          <Toolbar.Button tooltip="Select Tool">
            <MousePointer2 className="h-4 w-4 text-primary" />
          </Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.Button tooltip="Add Text" onClick={() => onAdd("text")}>
            <Type className="h-4 w-4" />
          </Toolbar.Button>
          <Toolbar.Button tooltip="Add Card" onClick={() => onAdd("card")}>
            <Box className="h-4 w-4" />
          </Toolbar.Button>
          <Toolbar.Button tooltip="Add Image" onClick={() => onAdd("image")}>
            <ImageIcon className="h-4 w-4" />
          </Toolbar.Button>
        </Toolbar>

        <Typography variant="body-small" className="hidden lg:block opacity-60">
          <strong className="text-primary">Space+Drag</strong> Pan •{" "}
          <strong className="text-primary">Ctrl+Scroll</strong> Zoom •{" "}
          <strong className="text-primary">Alt</strong> Measure •{" "}
          <strong className="text-primary">Arrows</strong> Nudge
        </Typography>
      </div>

      <div className="flex items-center gap-2">
        <Typography
          variant="label-small"
          className="font-mono bg-surface-container px-2 py-1 rounded-md"
        >
          {Math.round(camera.z * 100)}%
        </Typography>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCamera({ x: 50, y: 50, z: 1 })}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

const PropertiesPanel = ({
  elements,
  updateElement,
}: {
  elements: Element[];
  updateElement: (id: string, data: Partial<Element>) => void;
}) => {
  const { selectedIds } = useEditor();
  const selected = elements.filter((e) => selectedIds.has(e.id));

  if (selected.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-50 p-6 text-center">
        <MousePointer2 className="w-8 h-8 mb-4" />
        <Typography variant="body-small">
          Select an element on the canvas to view its properties.
        </Typography>
      </div>
    );
  }

  if (selected.length > 1) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-50 p-6 text-center">
        <Layers className="w-8 h-8 mb-4" />
        <Typography variant="body-small">
          Multiple elements selected.
        </Typography>
      </div>
    );
  }

  const el = selected[0];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Typography
          variant="label-large"
          className="font-bold uppercase tracking-wider opacity-70"
        >
          {el.type} Properties
        </Typography>
        <Badge variant="secondary" shape="minimal">
          {el.id}
        </Badge>
      </div>

      <Divider />

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="X"
          size="sm"
          variant="filled"
          value={Math.round(el.x)}
          onValueChange={(val) => updateElement(el.id, { x: Number(val) })}
          hideStepper
        />
        <NumberInput
          label="Y"
          size="sm"
          variant="filled"
          value={Math.round(el.y)}
          onValueChange={(val) => updateElement(el.id, { y: Number(val) })}
          hideStepper
        />
        <NumberInput
          label="Width"
          size="sm"
          variant="filled"
          value={Math.round(el.width)}
          onValueChange={(val) => updateElement(el.id, { width: Number(val) })}
          hideStepper
        />
        <NumberInput
          label="Height"
          size="sm"
          variant="filled"
          value={Math.round(el.height)}
          onValueChange={(val) => updateElement(el.id, { height: Number(val) })}
          hideStepper
        />
      </div>

      <Divider />

      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Rotation"
          size="sm"
          variant="filled"
          value={Math.round(el.rotation)}
          onValueChange={(val) =>
            updateElement(el.id, { rotation: Number(val) })
          }
          endContent={<span className="text-xs opacity-50">deg</span>}
        />
        <NumberInput
          label="Z-Index"
          size="sm"
          variant="filled"
          value={el.z}
          onValueChange={(val) => updateElement(el.id, { z: Number(val) })}
        />
      </div>
    </div>
  );
};

const EditorKeyboardShortcuts = ({
  setElements,
}: {
  setElements: React.Dispatch<React.SetStateAction<Element[]>>;
}) => {
  const { selectedIds, clearSelection, selectAll } = useEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName.match(/INPUT|TEXTAREA|SELECT/))
        return;

      if (e.key === "Backspace" || e.key === "Delete") {
        setElements((prev) => prev.filter((el) => !selectedIds.has(el.id)));
        clearSelection();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setElements((prev) => {
          selectAll(prev.map((el) => el.id));
          return prev;
        });
        return;
      }

      if (selectedIds.size > 0 && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const shift = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;

        if (e.key === "ArrowLeft") dx = -shift;
        if (e.key === "ArrowRight") dx = shift;
        if (e.key === "ArrowUp") dy = -shift;
        if (e.key === "ArrowDown") dy = shift;

        setElements((prev) =>
          prev.map((el) =>
            selectedIds.has(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el,
          ),
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, setElements, clearSelection, selectAll]);

  return null;
};

const BuilderDemo = ({ mode }: { mode: "infinite" | "paper" }) => {
  const [elements, setElements] = useState<Element[]>([
    {
      id: "el-1",
      type: "card",
      x: mode === "paper" ? 200 : 250,
      y: 100,
      width: 300,
      height: 200,
      z: 1,
      rotation: 0,
      content: "Bottom Layer Card",
    },
    {
      id: "el-2",
      type: "image",
      x: mode === "paper" ? 350 : 450,
      y: 180,
      width: 250,
      height: 180,
      z: 2,
      rotation: 15,
      content:
        "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=500",
    },
    {
      id: "el-3",
      type: "text",
      x: mode === "paper" ? 250 : 350,
      y: 350,
      width: 350,
      height: 80,
      z: 3,
      rotation: -10,
      content: "Top Layer Text",
    },
  ]);

  const updateElement = (id: string, data: Partial<Element>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...data } : el)),
    );
  };

  const addElement = (type: ElementType) => {
    const newId = `el-${Date.now()}`;
    const maxZ =
      elements.length > 0 ? Math.max(...elements.map((e) => e.z)) : 0;
    setElements((prev) => [
      ...prev,
      {
        id: newId,
        type,
        x: 150,
        y: 150,
        width: 200,
        height: type === "text" ? 60 : 150,
        content: type === "text" ? "New Text" : undefined,
        z: maxZ + 1,
        rotation: 0,
      },
    ]);
  };

  const deleteElements = (ids: Set<string>) => {
    setElements((prev) => prev.filter((el) => !ids.has(el.id)));
  };

  const moveLayer = (id: string, dir: "up" | "down") => {
    setElements((prev) => {
      const clone = [...prev].sort((a, b) => a.z - b.z);
      const idx = clone.findIndex((e) => e.id === id);
      if (dir === "up" && idx < clone.length - 1) {
        const tempZ = clone[idx].z;
        clone[idx].z = clone[idx + 1].z;
        clone[idx + 1].z = tempZ;
      } else if (dir === "down" && idx > 0) {
        const tempZ = clone[idx].z;
        clone[idx].z = clone[idx - 1].z;
        clone[idx - 1].z = tempZ;
      }
      return clone;
    });
  };

  const sortedLayers = [...elements].sort((a, b) => b.z - a.z);

  return (
    <Editor.Root mode={mode} initialCamera={{ x: 50, y: 50, z: 0.9 }}>
      <EditorKeyboardShortcuts setElements={setElements} />

      <div className="flex h-[800px] w-full flex-col bg-surface-container overflow-hidden border border-outline-variant">
        <EditorToolbar onAdd={addElement} />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <Editor.Canvas
              mode={mode}
              paperWidth={1000}
              paperHeight={800}
              contextMenu={
                <ContextMenu.Content>
                  <ContextMenu.Item onClick={() => addElement("text")}>
                    <Type className="mr-2 h-4 w-4" /> Add Text
                  </ContextMenu.Item>
                  <ContextMenu.Item onClick={() => addElement("card")}>
                    <Box className="mr-2 h-4 w-4" /> Add Card
                  </ContextMenu.Item>
                </ContextMenu.Content>
              }
            >
              {elements.map((el) => (
                <Editor.Item
                  key={el.id}
                  id={el.id}
                  locked={el.locked}
                  zIndex={el.z}
                  rotation={el.rotation}
                  position={{ x: el.x, y: el.y }}
                  size={{ width: el.width, height: el.height }}
                  onDrag={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                  onResize={(e, direction, ref, delta, position) => {
                    updateElement(el.id, {
                      width: parseInt(ref.style.width),
                      height: parseInt(ref.style.height),
                      ...position,
                    });
                  }}
                  onRotateStop={(deg) =>
                    updateElement(el.id, { rotation: deg })
                  }
                  toolbar={
                    el.type === "text" ? (
                      <Toolbar
                        variant="primary"
                        size="sm"
                        shape="minimal"
                        shadow="md"
                      >
                        <Toolbar.Button
                          tooltip="Edit Text"
                          className="text-primary"
                        >
                          <Type className="mr-2 h-4 w-4" /> Text
                        </Toolbar.Button>
                        <Toolbar.Separator />
                        <Toolbar.Button tooltip="AI Sparkles">
                          <Sparkles className="h-4 w-4" />
                        </Toolbar.Button>
                        <Toolbar.Button
                          tooltip="Bring Forward"
                          onClick={() => moveLayer(el.id, "up")}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Toolbar.Button>
                        <Toolbar.Button tooltip="Move">
                          <Move className="h-4 w-4" />
                        </Toolbar.Button>
                        <Toolbar.Button tooltip="Duplicate">
                          <Copy className="h-4 w-4" />
                        </Toolbar.Button>
                        <Toolbar.Button
                          tooltip="Delete"
                          onClick={() => deleteElements(new Set([el.id]))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Toolbar.Button>
                        <Toolbar.Separator />
                        <Toolbar.Button tooltip="More options">
                          <MoreVertical className="h-4 w-4" />
                        </Toolbar.Button>
                      </Toolbar>
                    ) : el.type === "image" ? (
                      <Toolbar
                        variant="primary"
                        size="sm"
                        shape="minimal"
                        shadow="md"
                      >
                        <Toolbar.Button tooltip="Replace Image">
                          <ImageIcon className="mr-2 h-4 w-4" /> Image
                        </Toolbar.Button>
                        <Toolbar.Separator />
                        <Toolbar.Button tooltip="Crop">
                          <Crop className="h-4 w-4" />
                        </Toolbar.Button>
                        <Toolbar.Button
                          tooltip="Delete"
                          onClick={() => deleteElements(new Set([el.id]))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Toolbar.Button>
                      </Toolbar>
                    ) : null
                  }
                  contextMenu={
                    <ContextMenu.Content>
                      <ContextMenu.Item onClick={() => moveLayer(el.id, "up")}>
                        <ArrowUp className="mr-2 h-4 w-4" /> Bring Forward
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        onClick={() => moveLayer(el.id, "down")}
                      >
                        <ArrowDown className="mr-2 h-4 w-4" /> Send Backward
                      </ContextMenu.Item>
                      <ContextMenu.Separator />
                      <ContextMenu.Item
                        onClick={() =>
                          updateElement(el.id, { locked: !el.locked })
                        }
                      >
                        {el.locked ? (
                          <Unlock className="mr-2 h-4 w-4" />
                        ) : (
                          <Lock className="mr-2 h-4 w-4" />
                        )}
                        {el.locked ? "Unlock" : "Lock"}
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        onClick={() => deleteElements(new Set([el.id]))}
                        className="text-error"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete{" "}
                        <ContextMenu.Shortcut>⌫</ContextMenu.Shortcut>
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  }
                >
                  {el.locked && (
                    <div className="absolute top-2 right-2 z-50">
                      <Lock className="w-4 h-4 text-on-surface/50" />
                    </div>
                  )}

                  {el.type === "text" && (
                    <div className="h-full w-full flex items-center justify-center border border-transparent hover:border-dashed hover:border-primary/50 transition-colors">
                      <Typography
                        variant="display-small"
                        contentEditable={!el.locked}
                        className="w-full text-center outline-none text-primary bg-transparent"
                        suppressContentEditableWarning
                      >
                        {el.content}
                      </Typography>
                    </div>
                  )}

                  {el.type === "card" && (
                    <Card
                      className="w-full h-full p-6 flex flex-col gap-2 shadow-2xl"
                      variant="primary"
                    >
                      <div className="flex justify-between items-center">
                        <Typography variant="title-medium">Card</Typography>
                        <Badge variant="secondary">UI</Badge>
                      </div>
                      <Typography variant="body-medium" className="opacity-70">
                        {el.content}
                      </Typography>
                      <Button size="md" className="mt-auto self-start">
                        Action
                      </Button>
                    </Card>
                  )}

                  {el.type === "image" && (
                    <Image
                      src={el.content || ""}
                      alt="Builder Image"
                      shape="md"
                      className="w-full h-full pointer-events-none shadow-xl"
                    />
                  )}
                </Editor.Item>
              ))}
            </Editor.Canvas>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-80 border-l border-outline-variant bg-surface-container-low flex flex-col z-20 shadow-[-10px_0_20px_rgba(0,0,0,0.05)] overflow-hidden">
            <Tabs
              defaultValue="design"
              variant="secondary"
              className="h-full flex flex-col"
            >
              <Tabs.List className="shrink-0 bg-surface">
                <Tabs.Trigger
                  value="design"
                  icon={<Settings2 className="w-4 h-4" />}
                >
                  Design
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="layers"
                  icon={<Layers className="w-4 h-4" />}
                >
                  Layers
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content className="flex-1 overflow-y-auto">
                <Tabs.Panel value="design" className="p-0">
                  <PropertiesPanel
                    elements={elements}
                    updateElement={updateElement}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="layers" className="p-2 flex flex-col gap-2">
                  {sortedLayers.map((el) => (
                    <Item
                      key={el.id}
                      variant="secondary"
                      shape="minimal"
                      padding="sm"
                      className="bg-surface shadow-sm border border-outline-variant/30"
                    >
                      <ItemContent>
                        <ItemTitle className="text-sm font-bold uppercase tracking-wider">
                          {el.type}
                        </ItemTitle>
                        <Typography
                          variant="body-small"
                          className="text-[11px] opacity-60 font-mono mt-1"
                        >
                          Z: {el.z} | Rot: {Math.round(el.rotation)}°
                        </Typography>
                      </ItemContent>
                      <ItemActions className="gap-0.5">
                        <IconButton
                          size="xs"
                          variant="ghost"
                          onClick={() => moveLayer(el.id, "up")}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </IconButton>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          onClick={() => moveLayer(el.id, "down")}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </IconButton>
                        <div className="w-px h-4 bg-outline-variant mx-1" />
                        <IconButton
                          size="xs"
                          variant="ghost"
                          onClick={() =>
                            updateElement(el.id, { locked: !el.locked })
                          }
                        >
                          {el.locked ? (
                            <Lock className="w-3.5 h-3.5 text-error" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </IconButton>
                      </ItemActions>
                    </Item>
                  ))}
                </Tabs.Panel>
              </Tabs.Content>
            </Tabs>
          </div>
        </div>
      </div>
    </Editor.Root>
  );
};

export const InfiniteMode: StoryObj = {
  name: "1. Infinite Workspace",
  render: () => <BuilderDemo mode="infinite" />,
};

export const PaperMode: StoryObj = {
  name: "2. Paper Document",
  render: () => <BuilderDemo mode="paper" />,
};
