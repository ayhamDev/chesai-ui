// src/lib/components/website-studio/canvas/ArtboardNode.tsx
"use client";

import { Handle, NodeProps, Position } from "@xyflow/react";
import { clsx } from "clsx";
import { Play } from "lucide-react";

import { Typography } from "../../typography";
import { useBuilderContext } from "../BuilderContext";
import { Renderer } from "../renderer";
import { useStudioStore } from "../store";

import type { ArtboardData } from "./artboard-types";
import { generateSingleAxisVariations } from "./artboard-utils";
import { ArtboardIframe } from "./ArtboardIframe";

export const ArtboardNode = ({ data, selected }: NodeProps<any>) => {
  const { label, width, height, isIsolationMode, componentId } =
    data as ArtboardData;

  const { components, cms, actions, customApi, globalHeadCode, globalBodyCode, designSystem } = useBuilderContext();
  const { website, activePageId } = useStudioStore();

  const activePage = website?.pages.find((p) => p.id === activePageId);
  const hasContent = activePage && activePage.content.length > 0;

  let contentToRender;

  if (isIsolationMode && componentId) {
    const CompDef = components[componentId];
    if (CompDef) {
      const { baselineProps, groups } = generateSingleAxisVariations(
        CompDef.controls || {},
      );

      contentToRender = (
        <div className="w-full h-full overflow-y-auto p-12 bg-surface scrollbar-thin flex flex-col gap-16 group-data-[tool=pointer]/canvas:cursor-default group-data-[tool=hand]/canvas:cursor-grab">
          <div className="flex flex-col gap-4">
            <Typography variant="title-medium" className="font-bold">
              Baseline Default
            </Typography>
            <div className="flex flex-wrap gap-2 pb-4 border-b border-outline-variant/30">
              {Object.keys(baselineProps).length === 0 && (
                <span className="text-sm opacity-50 italic">
                  No props defined
                </span>
              )}
              {Object.entries(baselineProps).map(([k, v]) => (
                <span
                  key={k}
                  className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[11px] rounded-md font-mono font-medium tracking-wide"
                >
                  {k}: {String(v)}
                </span>
              ))}
            </div>
            <div className="p-8 border border-outline-variant/40 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-center min-h-[100px] w-fit min-w-[200px]">
              <CompDef.render {...baselineProps} />
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.propName} className="flex flex-col gap-4">
              <Typography
                variant="title-medium"
                className="font-bold border-b border-outline-variant/30 pb-3"
              >
                Varying:{" "}
                <span className="text-primary font-mono">{group.propName}</span>
              </Typography>
              <div className="flex flex-wrap gap-8">
                {group.variations.map((v, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-6 border border-outline-variant/40 rounded-2xl bg-surface-container-lowest shadow-sm w-fit min-w-[200px]"
                  >
                    <div className="mb-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 text-[11px] rounded-md font-mono font-bold tracking-wide w-fit">
                        {String(v.value)}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-[80px]">
                      <CompDef.render {...v.props} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      contentToRender = (
        <div className="p-8 text-error">
          Component '{componentId}' not found in registry.
        </div>
      );
    }
  } else {
    contentToRender = hasContent ? (
      <div className="w-full h-full pointer-events-auto group-data-[tool=hand]/canvas:pointer-events-none">
        <ArtboardIframe title={label} defaultHeight={height - 32}>
          <Renderer
            components={components}
            data={activePage.content}
            designSystem={designSystem || website?.designSystem}
            cms={cms || {}}
            customApi={customApi}
            globalHeadCode={globalHeadCode}
            globalBodyCode={globalBodyCode}
            actions={{
              ...actions,
              openLink: (url: string, target: string) => {
                const targetPage = website?.pages.find((p) => p.slug === url);
                if (targetPage) {
                  useStudioStore.getState().setActivePage(targetPage.id);
                } else {
                  window.open(url, target || "_blank");
                }
              },
            }}
          />
        </ArtboardIframe>
      </div>
    ) : (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40 gap-4 mx-4"
        style={{ height: height - 32 }}
      >
        <Typography variant="display-small" className="opacity-50">
          Canvas Empty
        </Typography>
        <Typography variant="body-medium">
          Drag components from the Insert panel to start building.
        </Typography>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative rounded-xl shadow-2xl flex flex-col overflow-hidden transition-[box-shadow,border] duration-200",
        selected
          ? "ring-2 ring-primary ring-offset-4 ring-offset-background"
          : "ring-1 ring-outline-variant/30",
      )}
      style={{ width, minHeight: height }}
    >
      <div className="h-12 bg-surface-container-high border-b border-outline-variant/30 flex items-center justify-between px-4 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isIsolationMode) return;
              window.dispatchEvent(
                new CustomEvent("studio-preview", {
                  detail: { pageId: activePageId },
                }),
              );
            }}
            className="w-7 h-7 bg-primary text-on-primary rounded-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            title="Preview Page"
          >
            <Play size={12} className="fill-current ml-0.5" />
          </button>

          <div className="flex items-center gap-1.5 ml-1">
            <Typography
              variant="label-medium"
              className="font-bold text-on-surface"
            >
              {isIsolationMode ? "Sandbox" : label}
            </Typography>
            <span className="text-on-surface-variant/50 text-xs">&middot;</span>
            <Typography
              variant="label-small"
              className="font-mono text-on-surface-variant opacity-85"
            >
              {isIsolationMode ? componentId || "Component" : width}
            </Typography>
          </div>
        </div>

        {!isIsolationMode && (
          <div className="flex items-center gap-2">
            <Typography
              variant="label-large"
              className="text-primary font-bold tracking-wide"
            >
              {activePage?.title || "Page"}
            </Typography>
          </div>
        )}
      </div>

      <div className="flex-1 w-full bg-background relative contain-paint nodrag group-data-[tool=pointer]/canvas:cursor-default group-data-[tool=hand]/canvas:cursor-grab">
        {contentToRender}
      </div>

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};
