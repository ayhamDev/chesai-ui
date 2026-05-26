// src/lib/components/website-studio/builder/InspectorPanel.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { ChevronDown, Database, Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Input } from "../../input";
import { Select } from "../../select";
import { Switch } from "../../switch";
import { Typography } from "../../typography";
import { useBuilderContext } from "../BuilderContext";
import { useStudioStore } from "../store";
import type { ComponentControl, StudioNode } from "../types";
import { ColorPicker } from "../../color-picker";
import { Slider } from "../../slider";

// ============================================================================
// INDIVIDUAL PROPERTY CONTROLS
// ============================================================================

/**
 * Advanced Link control featuring:
 * 1. Automatic dropdown open on input focus.
 * 2. Dynamic suggestions list filtering as the user types (search).
 * 3. Standard text input interactions (freeform typing, editing) without focus stealing.
 * 4. Custom query feedback if no pages match.
 */
const LinkControl = ({
  value,
  onChange,
  pages = [],
}: {
  value: string;
  onChange: (val: string) => void;
  pages: { id: string; slug: string; title: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter pages dynamically based on what the user types
  const filteredPages = useMemo(() => {
    const query = (value || "").toLowerCase().trim();
    if (!query) return pages;
    return pages.filter(
      (page) =>
        page.slug.toLowerCase().includes(query) ||
        (page.title && page.title.toLowerCase().includes(query)),
    );
  }, [value, pages]);

  const handleSelectPage = (slug: string) => {
    onChange(slug);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <Input
        size="sm"
        variant="filled"
        shape="minimal"
        placeholder="Page path or URL..."
        value={value || ""}
        onValueChange={onChange}
        onFocus={() => setIsOpen(true)}
        endContent={
          <button
            type="button"
            className="p-1 hover:bg-surface-container-highest rounded-full transition-colors cursor-pointer shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
          >
            <ChevronDown
              size={16}
              className={`opacity-70 text-on-surface transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        }
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-full bg-surface-container-high border border-outline-variant/30 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            <div className="p-2 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest border-b border-outline-variant/30">
              Link Suggestions
            </div>
            <div className="flex flex-col p-1">
              {filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    className="flex flex-col text-left px-2 py-1.5 hover:bg-surface-container-highest rounded-md cursor-pointer w-full"
                    onClick={() => handleSelectPage(page.slug)}
                  >
                    <span className="font-semibold text-sm truncate text-on-surface">
                      {page.slug === "/" ? "Home" : page.slug}
                    </span>
                    {page.title && (
                      <span className="text-[10px] opacity-60 truncate text-on-surface-variant">
                        {page.title}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-on-surface-variant/60 italic text-center">
                  No matching pages found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// THE COMPILING MASTER RENDERER WITH CMS VARIABLE BINDING
// ============================================================================

const ControlRenderer = ({
  control,
  value,
  onChange,
  currentProps,
  nodeId,
}: {
  controlKey: string;
  control: ComponentControl;
  value: any;
  onChange: (val: any) => void;
  currentProps: Record<string, any>;
  nodeId: string;
}) => {
  const { website } = useStudioStore();
  const { cms } = useBuilderContext();

  // Track if this property is bound to a CMS variable
  const isCMSBound =
    typeof value === "string" && value.startsWith("{{") && value.endsWith("}}");
  const cmsKey = isCMSBound ? value.replace(/[{}]/g, "").trim() : "";

  // Extract flat map of CMS suggestions (e.g. ["hero.badge", "hero.headline"])
  const cmsSuggestions = useMemo(() => {
    if (!cms) return [];
    const paths: string[] = [];
    const traverse = (obj: any, prefix = "") => {
      Object.entries(obj).forEach(([k, v]) => {
        const path = prefix ? `${prefix}.${k}` : k;
        if (typeof v === "object" && v !== null) {
          traverse(v, path);
        } else {
          paths.push(path);
        }
      });
    };
    traverse(cms);
    return paths;
  }, [cms]);

  const toggleCMSBinding = () => {
    if (isCMSBound) {
      // Revert back to default value or empty string
      onChange(control.defaultValue ?? "");
    } else {
      // Bind to first available CMS suggestion
      onChange(`{{${cmsSuggestions[0] || "variable"}}}`);
    }
  };

  const pages = website?.pages || [];

  return (
    <div className="flex flex-col gap-1.5 mb-3 last:mb-0">
      {/* Property Label + Actions */}
      <div className="flex items-center justify-between px-0.5">
        <Typography
          variant="label-small"
          className="font-bold text-on-surface-variant/80 tracking-wide text-[11px]"
        >
          {control.label}
        </Typography>

        {/* Variable binding toggle button */}
        {control.supportsCMS && cmsSuggestions.length > 0 && (
          <button
            type="button"
            onClick={toggleCMSBinding}
            className={`p-1 rounded-md transition-all cursor-pointer ${
              isCMSBound
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container-highest"
            }`}
            title={
              isCMSBound ? "Disconnect CMS variable" : "Connect CMS variable"
            }
          >
            <Database size={12} />
          </button>
        )}
      </div>

      {/* Render custom input if developer overrode rendering */}
      {control.render ? (
        control.render({ value, onChange, currentProps, nodeId })
      ) : isCMSBound ? (
        /* CMS VARIABLE SELECTOR */
        <Select
          variant="filled"
          size="sm"
          value={cmsKey}
          onValueChange={(val) => onChange(`{{${val}}}`)}
          items={cmsSuggestions.map((path) => ({
            label: `CMS: ${path}`,
            value: path,
          }))}
          startContent={<Database className="w-4 h-4 text-primary shrink-0" />}
        />
      ) : (
        /* STANDARD MANUAL CONTROLS */
        (() => {
          switch (control.type) {
            case "boolean":
              return (
                <div className="flex items-center justify-between p-2.5 bg-surface-container-highest/30 rounded-xl border border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant">
                    Enable
                  </span>
                  <Switch
                    checked={!!value}
                    onCheckedChange={onChange}
                    disabled={control.readOnly}
                  />
                </div>
              );

            case "select":
              return (
                <Select
                  variant="filled"
                  size="sm"
                  value={value || ""}
                  onValueChange={onChange}
                  items={(control.options || []).map((o) => ({
                    label: o.label,
                    value: o.value,
                  }))}
                  disabled={control.readOnly}
                />
              );

            case "textarea":
              return (
                <textarea
                  className="w-full text-sm bg-surface-container-highest/60 hover:bg-surface-container-highest focus:bg-surface-container-highest border border-transparent focus:border-primary/50 outline-none rounded-xl p-3 text-on-surface placeholder:text-on-surface-variant/50 min-h-20"
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Type content..."
                  disabled={control.readOnly}
                />
              );

            case "link":
              return (
                <LinkControl value={value} onChange={onChange} pages={pages} />
              );

            case "color":
              return (
                <ColorPicker
                  value={value || ""}
                  onChange={onChange}
                  variant="filled"
                  shape="minimal"
                />
              );

            case "number":
              return (
                <Input
                  type="number"
                  size="sm"
                  variant="filled"
                  shape="minimal"
                  placeholder="0"
                  value={value ?? ""}
                  onValueChange={(val) => onChange(Number(val))}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  disabled={control.readOnly}
                />
              );

            case "slider":
              return (
                <div className="px-1 py-2">
                  <Slider
                    value={[
                      value !== undefined ? Number(value) : control.min || 0,
                    ]}
                    onValueChange={([val]) => onChange(val)}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    disabled={control.readOnly}
                  />
                </div>
              );

            default: // Handles "text" and any other unrecognized types
              return (
                <Input
                  size="sm"
                  variant="filled"
                  shape="minimal"
                  placeholder="Type value..."
                  value={value || ""}
                  onValueChange={onChange}
                  disabled={control.readOnly}
                />
              );
          }
        })()
      )}
    </div>
  );
};

// ============================================================================
// INSPECTOR PANEL CORE COMPONENT
// ============================================================================

interface InspectorPanelProps {
  selectedNodeIds: string[];
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedNodeIds,
}) => {
  const { website, activePageId, updateNodeProps } = useStudioStore();
  const { components } = useBuilderContext();

  // Get current active node (with explicit typing to avoid `never` inference)
  const selectedNode = useMemo<StudioNode | null>(() => {
    if (selectedNodeIds.length !== 1 || !website || !activePageId) return null;
    const page = website.pages.find((p) => p.id === activePageId);
    if (!page) return null;

    let found: StudioNode | null = null;
    const findNode = (nodes: StudioNode[]) => {
      for (const n of nodes) {
        if (n.id === selectedNodeIds[0]) found = n;
        if (!found && n.children) findNode(n.children);
      }
    };
    findNode(page.content);
    return found;
  }, [selectedNodeIds, website, activePageId]);

  const compDef = selectedNode ? components[selectedNode.type] : null;

  // Group controls and evaluate visibility logic
  const groupedControls = useMemo(() => {
    if (!compDef || !selectedNode) return {};

    const groups: Record<string, { key: string; control: ComponentControl }[]> =
      {};
    const props = selectedNode.props || {};

    Object.entries(compDef.controls || {}).forEach(([key, control]) => {
      const isHidden =
        typeof control.hidden === "function"
          ? control.hidden(props)
          : control.hidden;
      if (isHidden) return;

      const groupName = control.group || "General";
      if (!groups[groupName]) groups[groupName] = [];

      groups[groupName].push({ key, control });
    });

    return groups;
  }, [compDef, selectedNode]);

  if (selectedNodeIds.length === 0) {
    return (
      <div className="flex flex-col h-full bg-surface-container-lowest">
        <div className="h-12 border-b border-outline-variant/30 flex items-center px-4 gap-2 shrink-0 bg-surface">
          <Settings2 className="w-4 h-4 opacity-70" />
          <Typography variant="label-medium" className="font-bold">
            Inspector
          </Typography>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center opacity-50">
          <Typography variant="body-small">
            Select an element on the canvas to view its properties.
          </Typography>
        </div>
      </div>
    );
  }

  if (selectedNodeIds.length > 1) {
    return (
      <div className="flex flex-col h-full bg-surface-container-lowest">
        <div className="h-12 border-b border-outline-variant/30 flex items-center px-4 gap-2 shrink-0 bg-surface">
          <Settings2 className="w-4 h-4 opacity-70" />
          <Typography variant="label-medium" className="font-bold">
            Inspector
          </Typography>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 opacity-50">
          <Typography variant="body-small">Multiple Items Selected</Typography>
          <Typography variant="label-medium" className="font-mono mt-2">
            {selectedNodeIds.length} items
          </Typography>
        </div>
      </div>
    );
  }

  if (!selectedNode || !compDef) return null;

  const handlePropChange = (key: string, value: any) => {
    updateNodeProps(selectedNode.id, { [key]: value });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface-container-lowest">
      {/* HEADER */}
      <div className="h-12 border-b border-outline-variant/30 flex items-center px-4 gap-2 shrink-0 bg-surface">
        <Settings2 className="w-4 h-4 text-primary" />
        <div className="flex flex-col min-w-0">
          <Typography variant="label-medium" className="font-bold truncate">
            {compDef.name}
          </Typography>
        </div>
      </div>

      {/* PROPERTIES LIST (Flat, non-accordion design) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pb-12 p-4 flex flex-col gap-6">
        {Object.entries(groupedControls).map(([groupName, controls]) => (
          <div key={groupName} className="flex flex-col gap-3">
            {/* Section Header */}
            <Typography
              variant="label-small"
              className="font-bold text-on-surface-variant/60 uppercase tracking-widest text-[10px] pb-1.5 border-b border-outline-variant/30"
            >
              {groupName}
            </Typography>

            {/* Section Controls */}
            <div className="flex flex-col gap-1">
              {controls.map(({ key, control }) => (
                <ControlRenderer
                  key={key}
                  controlKey={key}
                  control={control}
                  value={selectedNode.props[key] ?? control.defaultValue}
                  onChange={(val) => handlePropChange(key, val)}
                  currentProps={selectedNode.props}
                  nodeId={selectedNode.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
