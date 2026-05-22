"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Typography } from "../../typography";
import { useStudioStore } from "../store";
import { useBuilderContext } from "../BuilderContext";
import { Renderer } from "../renderer";
import { useTheme } from "../../../context/ThemeProvider";

// --- DYNAMIC HEIGHT OBSERVER ---
const IframeContentObserver: React.FC<{
  children: React.ReactNode;
  onHeightChange: (h: number) => void;
}> = ({ children, onHeightChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      // Use borderBoxSize for the most accurate measurement across browsers
      const height =
        entries[0].borderBoxSize?.[0]?.blockSize ??
        entries[0].target.getBoundingClientRect().height;
      onHeightChange(height);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <div ref={containerRef} className="w-full flex flex-col relative">
      {children}
    </div>
  );
};

// --- IFRAME WRAPPER ---
const ArtboardIframe = ({
  children,
  title,
  defaultHeight,
}: {
  children: React.ReactNode;
  title: string;
  defaultHeight: number;
}) => {
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);
  const [iframeHead, setIframeHead] = useState<HTMLElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(defaultHeight);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { resolvedTheme } = useTheme();

  const handleLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      setIframeBody(doc.body);
      setIframeHead(doc.head);
      // Copy tailwind dark mode classes
      doc.documentElement.className = document.documentElement.className;
    }
  };

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      doc.documentElement.className = document.documentElement.className;
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (!iframeHead) return;
    const styleTags = document.querySelectorAll(
      'style, link[rel="stylesheet"]',
    );
    styleTags.forEach((tag) => {
      iframeHead.appendChild(tag.cloneNode(true));
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "STYLE" || node.nodeName === "LINK") {
            iframeHead.appendChild(node.cloneNode(true));
          }
        });
      });
    });

    observer.observe(document.head, { childList: true });
    return () => observer.disconnect();
  }, [iframeHead]);

  // Determine actual rendered height (never smaller than the default canvas size)
  const finalHeight = Math.max(contentHeight, defaultHeight);

  return (
    <iframe
      ref={iframeRef}
      onLoad={handleLoad}
      title={title}
      className="w-full border-none bg-transparent transition-[height] duration-200"
      style={{ height: finalHeight }}
      // Hide standard overflow so the resize observer handles scaling instead
      srcDoc="<!DOCTYPE html><html><head></head><body style='margin: 0; padding: 0; overflow: hidden; background: transparent;'></body></html>"
    >
      {iframeBody &&
        createPortal(
          <IframeContentObserver onHeightChange={setContentHeight}>
            {children}
          </IframeContentObserver>,
          iframeBody,
        )}
    </iframe>
  );
};

export type ArtboardData = {
  label: string;
  width: number;
  height: number;
};

export const ArtboardNode = ({ data, selected }: NodeProps<any>) => {
  const { label, width, height } = data as ArtboardData;

  const { components, cms } = useBuilderContext();
  const { website, activePageId } = useStudioStore();

  const activePage = website?.pages.find((p) => p.id === activePageId);
  const hasContent = activePage && activePage.content.length > 0;

  return (
    <div
      className={`relative rounded-xl shadow-2xl flex flex-col overflow-hidden transition-[box-shadow,border] duration-200 ${
        selected
          ? "ring-2 ring-primary ring-offset-4 ring-offset-background"
          : "ring-1 ring-outline-variant/30"
      }`}
      // Removed fixed height; minHeight ensures it doesn't collapse
      style={{ width, minHeight: height }}
    >
      <div className="h-8 bg-surface-container-high border-b border-outline-variant/30 flex items-center justify-center px-4 shrink-0 pointer-events-none">
        <Typography variant="label-small" className="font-mono opacity-60">
          {label} - {width}px
        </Typography>
      </div>

      <div className="flex-1 w-full bg-background relative contain-paint">
        {hasContent ? (
          <div className="w-full h-full pointer-events-none select-none">
            <ArtboardIframe title={label} defaultHeight={height - 32}>
              <Renderer
                components={components}
                data={activePage.content}
                designSystem={website?.designSystem}
                cms={cms || {}}
                actions={{}}
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
        )}
      </div>

      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};
