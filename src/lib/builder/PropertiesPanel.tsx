import React from "react";
import { Trash2, X } from "lucide-react";
import { useBuilderStore } from "./store";
import { Typography } from "../components/typography";
import { Input } from "../components/input";
import { Select } from "../components/select";
import { IconButton } from "../components/icon-button";

export const PropertiesPanel = () => {
  const selectedNodeId = useBuilderStore((state) => state.selectedNodeId);
  const removeNode = useBuilderStore((state) => state.removeNode);

  const selectedNode = useBuilderStore((state) => {
    if (!selectedNodeId) return null;
    return state.pages[state.activePageId]?.nodes[selectedNodeId];
  });

  const updateNodeProp = useBuilderStore((state) => state.updateNodeProp);

  if (!selectedNodeId || !selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-40 p-6 text-center">
        <Typography variant="body-small">
          Select an element on the canvas to edit its properties.
        </Typography>
      </div>
    );
  }

  // Safely extract styles
  const currentStyles = selectedNode.props.style || {};

  return (
    <div className="flex flex-col h-full bg-surface-container">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/20 shrink-0 flex items-center justify-between">
        <div>
          <Typography variant="title-small" className="font-bold">
            {selectedNode.type}
          </Typography>
          <Typography
            variant="body-small"
            className="opacity-60 font-mono text-[10px]"
          >
            {selectedNode.id}
          </Typography>
        </div>

        {selectedNode.id !== "ROOT" && (
          <IconButton
            variant="ghost"
            size="sm"
            className="text-error hover:bg-error/10"
            onClick={() => removeNode(selectedNodeId)}
          >
            <Trash2 className="w-4 h-4" />
          </IconButton>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* --- INLINE SIZES (Added by Drag Handlers) --- */}
        <div className="flex flex-col gap-2">
          <Typography
            variant="label-small"
            className="font-bold opacity-70 uppercase tracking-wider"
          >
            Dimensions (Inline Style)
          </Typography>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                variant="filled"
                size="sm"
                label="Width"
                value={currentStyles.width || ""}
                onChange={(e) =>
                  updateNodeProp(selectedNodeId, "style", {
                    ...currentStyles,
                    width: e.target.value,
                  })
                }
                placeholder="auto"
              />
              {currentStyles.width && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                  onClick={() => {
                    const { width, ...rest } = currentStyles;
                    updateNodeProp(selectedNodeId, "style", rest);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex-1 relative">
              <Input
                variant="filled"
                size="sm"
                label="Height"
                value={currentStyles.height || ""}
                onChange={(e) =>
                  updateNodeProp(selectedNodeId, "style", {
                    ...currentStyles,
                    height: e.target.value,
                  })
                }
                placeholder="auto"
              />
              {currentStyles.height && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                  onClick={() => {
                    const { height, ...rest } = currentStyles;
                    updateNodeProp(selectedNodeId, "style", rest);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <Typography
            variant="body-small"
            className="text-[10px] opacity-60 mt-1 leading-tight"
          >
            Use the handles on the canvas to drag, or type sizes manually (e.g.
            300px, 50%).
          </Typography>
        </div>

        {/* --- GLOBAL: Tailwind Classes --- */}
        <div className="flex flex-col gap-2 border-t border-outline-variant/20 pt-4">
          <Typography
            variant="label-small"
            className="font-bold opacity-70 uppercase tracking-wider"
          >
            Styling (Tailwind Classes)
          </Typography>
          <Input
            variant="filled"
            size="sm"
            value={selectedNode.props.className || ""}
            onChange={(e) =>
              updateNodeProp(selectedNodeId, "className", e.target.value)
            }
            placeholder="e.g., bg-red-500 p-4"
          />
        </div>

        {/* --- DYNAMIC: Text Content --- */}
        {["Typography", "Button"].includes(selectedNode.type) && (
          <div className="flex flex-col gap-2 border-t border-outline-variant/20 pt-4">
            <Typography
              variant="label-small"
              className="font-bold opacity-70 uppercase tracking-wider"
            >
              Text Content
            </Typography>
            <Input
              variant="filled"
              size="sm"
              value={selectedNode.props.children || ""}
              onChange={(e) =>
                updateNodeProp(selectedNodeId, "children", e.target.value)
              }
            />
          </div>
        )}

        {/* --- DYNAMIC: Button Props --- */}
        {selectedNode.type === "Button" && (
          <div className="flex flex-col gap-4 border-t border-outline-variant/20 pt-4">
            <Select
              label="Variant"
              labelPlacement="outside"
              size="sm"
              variant="filled"
              value={selectedNode.props.variant || "primary"}
              onValueChange={(val) =>
                updateNodeProp(selectedNodeId, "variant", val)
              }
              items={[
                { value: "primary", label: "Primary" },
                { value: "secondary", label: "Secondary" },
                { value: "tertiary", label: "Tertiary" },
                { value: "outline", label: "Outline" },
                { value: "ghost", label: "Ghost" },
              ]}
            />
            <Select
              label="Size"
              labelPlacement="outside"
              size="sm"
              variant="filled"
              value={selectedNode.props.size || "md"}
              onValueChange={(val) =>
                updateNodeProp(selectedNodeId, "size", val)
              }
              items={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />
            <Select
              label="Shape"
              labelPlacement="outside"
              size="sm"
              variant="filled"
              value={selectedNode.props.shape || "minimal"}
              onValueChange={(val) =>
                updateNodeProp(selectedNodeId, "shape", val)
              }
              items={[
                { value: "full", label: "Full (Pill)" },
                { value: "minimal", label: "Minimal (Rounded)" },
                { value: "sharp", label: "Sharp (Square)" },
              ]}
            />
          </div>
        )}

        {/* --- DYNAMIC: Typography Props --- */}
        {selectedNode.type === "Typography" && (
          <div className="flex flex-col gap-4 border-t border-outline-variant/20 pt-4">
            <Select
              label="Typography Variant"
              labelPlacement="outside"
              size="sm"
              variant="filled"
              value={selectedNode.props.variant || "body-medium"}
              onValueChange={(val) =>
                updateNodeProp(selectedNodeId, "variant", val)
              }
              items={[
                { value: "display-large", label: "Display Large" },
                { value: "headline-medium", label: "Headline Medium" },
                { value: "title-large", label: "Title Large" },
                { value: "body-large", label: "Body Large" },
                { value: "body-medium", label: "Body Medium" },
                { value: "label-small", label: "Label Small" },
              ]}
            />
          </div>
        )}

        {/* --- DYNAMIC: Image Props --- */}
        {selectedNode.type === "Image" && (
          <div className="flex flex-col gap-4 border-t border-outline-variant/20 pt-4">
            <div className="flex flex-col gap-2">
              <Typography
                variant="label-small"
                className="font-bold opacity-70 uppercase tracking-wider"
              >
                Image Source (URL)
              </Typography>
              <Input
                variant="filled"
                size="sm"
                value={selectedNode.props.src || ""}
                onChange={(e) =>
                  updateNodeProp(selectedNodeId, "src", e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Typography
                variant="label-small"
                className="font-bold opacity-70 uppercase tracking-wider"
              >
                Alt Text
              </Typography>
              <Input
                variant="filled"
                size="sm"
                value={selectedNode.props.alt || ""}
                onChange={(e) =>
                  updateNodeProp(selectedNodeId, "alt", e.target.value)
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
