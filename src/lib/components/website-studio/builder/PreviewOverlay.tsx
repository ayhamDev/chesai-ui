"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  RotateCw,
  Smartphone,
  Tablet as TabletIcon,
  Monitor,
  Maximize,
  Minimize,
  Battery,
  Signal,
  Wifi,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Home,
  File,
} from "lucide-react";
import { clsx } from "clsx";

import { useTheme } from "../../../context/ThemeProvider";
import { Typography } from "../../typography";
import { IconButton } from "../../icon-button";
import { Button } from "../../button";
import { Renderer } from "../renderer";
import { useStudioStore } from "../store";
import { useBuilderContext } from "../BuilderContext";
import { ElasticScrollArea } from "../../elastic-scroll-area";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../../tooltip";
import { TreeView } from "../../tree-view";
import { Input } from "../../input";
import { toast } from "../../toast";
import type { PageNode } from "./types";

// --- NAVIGATION INTERCEPTOR ---
// Ensures event listeners are bound ONLY after the iframe portal mounts
const NavigationInterceptor = ({
  children,
  onNavigate,
}: {
  children: React.ReactNode;
  onNavigate: (linkTo: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNav = (e: any) => {
      e.stopPropagation();
      onNavigate(e.detail.linkTo);
    };

    el.addEventListener("studio-navigate", handleNav);
    return () => el.removeEventListener("studio-navigate", handleNav);
  }, [onNavigate]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-full"
      onClickCapture={(e) => {
        // Fallback for raw HTML anchor tags
        const a = (e.target as HTMLElement).closest("a");
        if (a) {
          const href = a.getAttribute("href");
          if (href && href.startsWith("/")) {
            e.preventDefault();
            e.stopPropagation();
            onNavigate(href);
          }
        }
      }}
    >
      {children}
    </div>
  );
};

// --- IFRAME WRAPPER COMPONENT ---
const PreviewIframe = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);
  const [iframeHead, setIframeHead] = useState<HTMLElement | null>(null);
  const { resolvedTheme } = useTheme();

  const handleLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    const win = iframeRef.current?.contentWindow;
    if (doc && win) {
      setIframeBody(doc.body);
      setIframeHead(doc.head);
      doc.documentElement.className = document.documentElement.className;
      doc.documentElement.style.cssText =
        document.documentElement.style.cssText;
    }
  };

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      doc.documentElement.className = document.documentElement.className;
      doc.documentElement.style.cssText =
        document.documentElement.style.cssText;
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (!iframeHead) return;

    iframeHead.innerHTML = "";

    const styleTags = document.querySelectorAll(
      'style, link[rel="stylesheet"]',
    );
    styleTags.forEach((tag) => iframeHead.appendChild(tag.cloneNode(true)));

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

  return (
    <iframe
      ref={iframeRef}
      onLoad={handleLoad}
      title={title}
      className="w-full h-full border-none bg-background block"
      srcDoc="<!DOCTYPE html><html><head></head><body style='margin: 0; padding: 0; min-height: 100vh; overflow-x: hidden;'></body></html>"
    >
      {iframeBody && createPortal(children, iframeBody)}
    </iframe>
  );
};

// --- PREVIEW OVERLAY ---

interface PreviewOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type PreviewDevice = "mobile" | "tablet" | "desktop";

interface DeviceSpec {
  label: string;
  width: number | "100%";
  height: number | "100%";
  bezelClass: string;
  notch?: boolean;
}

const DEVICE_SPECS: Record<PreviewDevice, DeviceSpec> = {
  mobile: {
    label: "Mobile (iPhone 15 Pro)",
    width: 393,
    height: 852,
    bezelClass:
      "rounded-[55px] border-[12px] border-surface-container-highest shadow-2xl overflow-hidden flex flex-col",
    notch: true,
  },
  tablet: {
    label: "Tablet (iPad Pro)",
    width: 834,
    height: 1194,
    bezelClass:
      "rounded-[36px] border-[14px] border-surface-container-highest shadow-2xl overflow-hidden flex flex-col",
  },
  desktop: {
    label: "Desktop (Fluid)",
    width: "100%",
    height: "100%",
    bezelClass: "w-full h-full border-0 rounded-none shadow-none flex flex-col",
  },
};

export const PreviewOverlay: React.FC<PreviewOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [scale, setScale] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [timeStr, setTimeStr] = useState("09:41");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [pageSearch, setPageSearch] = useState("");
  const [expandedPageIds, setExpandedPageIds] = useState<string[]>([]);

  // Custom fullscreen state (hides UI instead of browser fullscreen)
  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState(false);

  const { website, activePageId } = useStudioStore();
  const { components, cms, actions, customApi } = useBuilderContext();

  const [previewPageId, setPreviewPageId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activePageId && !previewPageId) {
      setPreviewPageId(activePageId);
    }
  }, [isOpen, activePageId, previewPageId]);

  const activePage = useMemo(
    () => website?.pages.find((p) => p.id === previewPageId),
    [website, previewPageId],
  );

  // Auto-generate the Pages Tree
  const displayedPagesTree = useMemo(() => {
    const filtered = (website?.pages || []).filter((p) => {
      const slugName = p.slug === "/" ? "home" : p.slug;
      return (
        slugName.toLowerCase().includes(pageSearch.toLowerCase()) ||
        p.title.toLowerCase().includes(pageSearch.toLowerCase())
      );
    });

    const rootNodes: PageNode[] = [];
    const nodeMap = new Map<string, PageNode>();

    const allNodes: PageNode[] = filtered.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.slug === "/" ? "Home" : p.slug,
      title: p.title,
      children: [],
      pageId: p.id,
    }));

    allNodes.sort((a, b) => a.slug.length - b.slug.length);
    allNodes.forEach((node) => nodeMap.set(node.slug, node));

    allNodes.forEach((node) => {
      if (node.slug === "/") {
        rootNodes.push(node);
        return;
      }
      const parts = node.slug.split("/").filter(Boolean);
      if (parts.length === 1) {
        rootNodes.push(node);
      } else {
        parts.pop();
        const parentSlug = "/" + parts.join("/");
        const parentNode = nodeMap.get(parentSlug);
        node.name = "/" + (node.slug.split("/").filter(Boolean).pop() || "");

        if (parentNode) {
          parentNode.children.push(node);
        } else {
          node.name = node.slug;
          rootNodes.push(node);
        }
      }
    });

    return rootNodes;
  }, [website?.pages, pageSearch]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const spec = DEVICE_SPECS[device];
  const isDesktop = device === "desktop";

  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || isDesktop) {
      setScale(1);
      return;
    }

    const handleResize = () => {
      if (!workspaceRef.current) return;
      const pad = isCanvasFullscreen ? 16 : 64;
      const maxW = workspaceRef.current.clientWidth - pad;
      const maxH = workspaceRef.current.clientHeight - pad;

      const specW = spec.width as number;
      const specH = spec.height as number;

      const scaleX = maxW / specW;
      const scaleY = maxH / specH;
      setScale(Math.min(1, scaleX, scaleY));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    isOpen,
    device,
    spec.width,
    spec.height,
    isDesktop,
    isSidebarOpen,
    isCanvasFullscreen,
  ]);

  // Handle ESC key gracefully
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCanvasFullscreen) {
          setIsCanvasFullscreen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, isCanvasFullscreen, onClose]);

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  const toggleFullscreen = () => {
    setIsCanvasFullscreen(!isCanvasFullscreen);
  };

  if (!isOpen || !activePage) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-[9999] bg-background flex flex-col font-manrope overflow-hidden text-on-background"
      >
        {/* --- FLOATING FULLSCREEN EXIT BUTTON --- */}
        <AnimatePresence>
          {isCanvasFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-4 z-[99999]"
            >
              <Button
                variant="secondary"
                shape="full"
                size="sm"
                className="shadow-lg border border-outline-variant/30 backdrop-blur-md bg-surface-container-high/90"
                onClick={() => setIsCanvasFullscreen(false)}
                startIcon={<Minimize size={16} />}
              >
                Exit Full Screen
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- TOPBAR CONTROLS --- */}
        <AnimatePresence>
          {!isCanvasFullscreen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 56, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-surface border-b border-outline-variant/30 flex items-center justify-between px-4 z-50 shrink-0 shadow-sm overflow-hidden"
            >
              {/* Left Actions */}
              <div className="flex items-center gap-2">
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                >
                  <X size={18} />
                </IconButton>

                <div className="h-4 w-px bg-outline-variant mx-2" />

                <TooltipProvider>
                  <TooltipTrigger asChild>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="text-on-surface-variant hover:text-on-surface"
                    >
                      {isSidebarOpen ? (
                        <PanelLeftClose size={18} />
                      ) : (
                        <PanelLeftOpen size={18} />
                      )}
                    </IconButton>
                  </TooltipTrigger>
                  <Tooltip>Toggle Pages Sidebar</Tooltip>
                </TooltipProvider>

                <div className="flex flex-col ml-2">
                  <Typography
                    variant="label-medium"
                    className="font-bold leading-none"
                  >
                    Interactive Preview
                  </Typography>
                  <Typography
                    variant="body-small"
                    className="text-on-surface-variant text-[10px] mt-0.5"
                  >
                    {activePage.slug === "/" ? "Home" : activePage.slug}
                  </Typography>
                </div>
              </div>

              {/* Center Pill: Device Selector */}
              <div className="flex items-center bg-surface-container-high rounded-full p-1 border border-outline-variant/30 shadow-inner">
                <button
                  onClick={() => setDevice("desktop")}
                  className={clsx(
                    "px-4 h-8 rounded-full flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer",
                    device === "desktop"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  <Monitor size={14} />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setDevice("tablet")}
                  className={clsx(
                    "px-4 h-8 rounded-full flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer",
                    device === "tablet"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  <TabletIcon size={14} />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  onClick={() => setDevice("mobile")}
                  className={clsx(
                    "px-4 h-8 rounded-full flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer",
                    device === "mobile"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  <Smartphone size={14} />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <TooltipTrigger asChild>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={handleReload}
                      className="text-on-surface-variant hover:text-on-surface"
                    >
                      <RotateCw size={16} />
                    </IconButton>
                  </TooltipTrigger>
                  <Tooltip>Hard Reload</Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <TooltipTrigger asChild>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-on-surface-variant hover:text-on-surface"
                    >
                      <Maximize size={16} />
                    </IconButton>
                  </TooltipTrigger>
                  <Tooltip>Full Screen</Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MAIN LAYOUT --- */}
        <div className="flex-1 flex overflow-hidden">
          {/* PAGES SIDEBAR WITH TREE VIEW */}
          <AnimatePresence initial={false}>
            {isSidebarOpen && !isCanvasFullscreen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="h-full bg-surface border-r border-outline-variant/30 flex flex-col shrink-0"
              >
                <div className="p-4 border-b border-outline-variant/20 shrink-0 flex flex-col gap-3">
                  <Typography
                    variant="label-medium"
                    className="font-bold opacity-60 uppercase tracking-widest text-[10px]"
                  >
                    Site Pages
                  </Typography>
                  <Input
                    variant="filled"
                    size="sm"
                    placeholder="Search pages..."
                    startContent={
                      <Search className="w-4 h-4 text-on-surface-variant" />
                    }
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                  <TreeView<PageNode>
                    data={displayedPagesTree}
                    getId={(node) => node.id}
                    getChildren={(node) => node.children}
                    selectedId={previewPageId}
                    onSelect={(id, node) => setPreviewPageId(node.pageId)}
                    expandedIds={expandedPageIds}
                    onExpandedChange={setExpandedPageIds}
                    variant="ghost"
                    size="md"
                    shape="minimal"
                    renderItem={(node, { isSelected }) => (
                      <div className="flex items-center gap-3 w-full pr-2 text-left min-w-0">
                        <div className="shrink-0 opacity-70">
                          {node.slug === "/" ? (
                            <Home size={16} />
                          ) : (
                            <File size={16} />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 py-1">
                          <span
                            className={clsx(
                              "truncate text-sm",
                              isSelected
                                ? "font-bold text-primary"
                                : "font-medium text-on-surface",
                            )}
                          >
                            {node.name}
                          </span>
                          {node.title && (
                            <span className="truncate text-[10px] opacity-60 font-normal">
                              {node.title}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  />
                  {displayedPagesTree.length === 0 && (
                    <div className="p-4 text-center opacity-50 text-xs">
                      No pages match your search.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WORKSPACE AREA */}
          <div
            ref={workspaceRef}
            className={clsx(
              "flex-1 flex relative overflow-hidden transition-colors",
              isDesktop
                ? "bg-background"
                : "bg-surface-container-lowest items-center justify-center",
              !isDesktop && !isCanvasFullscreen && "p-8",
            )}
          >
            {/* Scaled Device Frame Container */}
            <motion.div
              layout
              animate={{
                scale: isDesktop ? 1 : scale,
                width: spec.width,
                height: spec.height,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={clsx(
                "relative bg-surface transition-[border-radius,border-width]",
                spec.bezelClass,
              )}
              style={{
                transformOrigin: "center center",
              }}
            >
              {/* Status Bar simulation for Mobile Frames */}
              {!isDesktop && spec.notch && (
                <>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[110px] h-[30px] rounded-full bg-black z-50 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 ml-auto mr-4" />
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-11 flex items-end pb-1 px-8 justify-between z-40 text-on-surface pointer-events-none mix-blend-difference">
                    <span className="text-xs font-bold font-mono tracking-tight leading-none text-white">
                      {timeStr}
                    </span>
                    <div className="flex items-center gap-1.5 opacity-90 scale-90 text-white">
                      <Signal size={12} className="stroke-[2.5]" />
                      <Wifi size={12} className="stroke-[2.5]" />
                      <Battery size={14} className="stroke-[2.5]" />
                    </div>
                  </div>
                </>
              )}

              {/* Inner Content Area via Iframe utilizing Flexbox to gracefully pad the notch away */}
              <div
                className={clsx(
                  "w-full h-full bg-background relative pointer-events-auto flex flex-col",
                  !isDesktop && spec.notch
                    ? "pt-[44px] rounded-[42px] overflow-hidden"
                    : "rounded-[inherit] overflow-hidden",
                )}
              >
                <div className="flex-1 w-full relative overflow-hidden">
                  <PreviewIframe title={`Preview - ${activePage.title}`}>
                    {/* Event Interceptor Component replacing standard Div */}
                    <NavigationInterceptor
                      onNavigate={(linkTo) => {
                        const targetPage = website?.pages.find(
                          (p) => p.slug === linkTo,
                        );
                        if (targetPage) {
                          setPreviewPageId(targetPage.id);
                        } else {
                          toast.error("Page not found in schema");
                        }
                      }}
                    >
                      <Renderer
                        key={`${reloadKey}-${previewPageId}`}
                        components={components}
                        data={activePage.content}
                        designSystem={website?.designSystem}
                        cms={cms}
                        customApi={customApi}
                        actions={{
                          ...actions,
                          openLink: (url: string, target: string) => {
                            const targetPage = website?.pages.find(
                              (p) => p.slug === url,
                            );
                            if (targetPage) {
                              setPreviewPageId(targetPage.id);
                            } else {
                              window.open(url, target || "_blank");
                            }
                          },
                        }}
                      />
                    </NavigationInterceptor>
                  </PreviewIframe>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};
