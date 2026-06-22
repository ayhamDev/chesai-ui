"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { GripVertical } from "lucide-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  // @ts-ignore - Support dynamic importing of React 19's Activity API
  Activity,
} from "react";
import {
  Dialog,
  DialogContent,
  type DialogProps,
  type DialogContentProps,
} from "../dialog";
import { Sheet, type SheetProps, type SheetContentProps } from "../sheet";

// --- TYPES ---

type ResizableGap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

type IndicatorColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "high-contrast"
  | "ghost"
  | "surface"
  | "surface-container-lowest"
  | "surface-container-low"
  | "surface-container"
  | "surface-container-high"
  | "surface-container-highest";

interface ResizableContextProps {
  sizes: Record<string, number>;
  resize: (id: string, delta: number) => void;
  registerPane: (
    id: string,
    size: number,
    options?: { dismissible?: boolean; minWidth?: number; collapseAt?: number },
  ) => void;
  containerWidth: number;
  isDragging: boolean;
  startDrag: (
    e: React.MouseEvent | React.TouchEvent,
    handleId: string,
    targetId: string,
    invert: boolean,
  ) => void;
  collapsedPanes: Set<string>;
  setPaneCollapsed: (id: string, isCollapsed: boolean) => void;
  setPaneWidth: (id: string, width: number) => void;
  togglePane: (id: string) => void;
}

// --- CONTEXT & HOOKS ---

const ResizableContext = createContext<ResizableContextProps | null>(null);

const useResizable = () => {
  const context = useContext(ResizableContext);
  if (!context) {
    throw new Error(
      "Resizable components must be used within <Resizable.Root>",
    );
  }
  return context;
};

export const useResizableState = (id: string) => {
  const context = useContext(ResizableContext);
  if (!context) {
    console.warn("useResizableState must be used inside <Resizable>");
    return {
      isCollapsed: false,
      width: 0,
      setWidth: () => {},
      toggle: () => {},
    };
  }
  return {
    isCollapsed: context.collapsedPanes.has(id) || context.sizes[id] === 0,
    width: context.sizes[id] || 0,
    setWidth: (width: number) => context.setPaneWidth(id, width),
    toggle: () => context.togglePane(id),
  };
};

// --- REACT 19 ACTIVITY COMPATIBILITY LAYER ---

const SafeActivity = ({
  mode,
  children,
}: {
  mode: "visible" | "hidden";
  children: React.ReactNode;
}) => {
  if (typeof Activity !== "undefined") {
    return <Activity mode={mode}>{children}</Activity>;
  }

  return (
    <div style={{ display: mode === "hidden" ? "none" : "contents" }}>
      {children}
    </div>
  );
};

// --- ROOT COMPONENT ---

interface ResizableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSizes?: Record<string, number>;
  gap?: ResizableGap;
  storageKey?: string;
}

const GAP_CLASSES: Record<ResizableGap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12",
  "3xl": "gap-16",
};

const ResizableRoot = React.forwardRef<HTMLDivElement, ResizableRootProps>(
  (
    {
      children,
      className,
      defaultSizes = {},
      gap = "none",
      storageKey,
      ...props
    },
    ref,
  ) => {
    const [sizes, setSizes] = useState<Record<string, number>>(defaultSizes);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [collapsedPanes, setCollapsedPanes] = useState<Set<string>>(
      new Set(),
    );
    const [isLoaded, setIsLoaded] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastActiveWidths = useRef<Record<string, number>>({});
    const paneConfigs = useRef<
      Record<
        string,
        {
          dismissible?: boolean;
          minWidth?: number;
          defaultWidth?: number;
          collapseAt?: number;
        }
      >
    >({});
    const dragInfo = useRef<{
      startX: number;
      startWidth: number;
      targetId: string;
      invert: boolean;
    } | null>(null);

    // Measure Container Width
    useEffect(() => {
      if (!containerRef.current) return;
      const observer = new ResizeObserver((entries) => {
        requestAnimationFrame(() => {
          if (!entries[0]) return;
          setContainerWidth(entries[0].contentRect.width);
        });
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, []);

    // Load persisted configurations safely
    useEffect(() => {
      if (!storageKey) {
        setIsLoaded(true);
        return;
      }
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            if (parsed.sizes && typeof parsed.sizes === "object") {
              setSizes((prev) => ({ ...prev, ...parsed.sizes }));
            } else if (parsed && !parsed.sizes && !parsed.lastActiveWidths) {
              // Legacy direct format fallback support
              setSizes((prev) => ({ ...prev, ...parsed }));
            }

            if (
              parsed.lastActiveWidths &&
              typeof parsed.lastActiveWidths === "object"
            ) {
              lastActiveWidths.current = { ...parsed.lastActiveWidths };
            }
          }
        }
      } catch (e) {
        console.error("Failed to load resizable sizes from localStorage:", e);
      } finally {
        setIsLoaded(true);
      }
    }, [storageKey]);

    // Save configuration cleanly (Debounced)
    useEffect(() => {
      if (!storageKey || !isLoaded || Object.keys(sizes).length === 0) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        try {
          // Synchronize active size configurations with the backup non-zero tracking list
          Object.keys(sizes).forEach((key) => {
            if (sizes[key] > 0) {
              lastActiveWidths.current[key] = sizes[key];
            }
          });

          const payload = {
            sizes,
            lastActiveWidths: lastActiveWidths.current,
          };
          localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch (e) {
          console.error("Failed to save resizable sizes to localStorage:", e);
        }
      }, 500);

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, [sizes, storageKey, isLoaded]);

    const registerPane = useCallback(
      (
        id: string,
        size: number,
        options?: {
          dismissible?: boolean;
          minWidth?: number;
          collapseAt?: number;
        },
      ) => {
        paneConfigs.current[id] = {
          defaultWidth: size,
          dismissible: options?.dismissible,
          minWidth: options?.minWidth,
          collapseAt: options?.collapseAt,
        };
        setSizes((prev) => {
          if (prev[id] !== undefined) return prev;
          return { ...prev, [id]: size };
        });
      },
      [],
    );

    const setPaneCollapsed = useCallback((id: string, isCollapsed: boolean) => {
      setCollapsedPanes((prev) => {
        if (prev.has(id) === isCollapsed) return prev;
        const next = new Set(prev);
        if (isCollapsed) next.add(id);
        else next.delete(id);
        return next;
      });
    }, []);

    const setPaneWidth = useCallback(
      (id: string, width: number) => {
        setSizes((prev) => ({ ...prev, [id]: width }));
        if (width > 0) {
          lastActiveWidths.current[id] = width;
        }

        // Check synchronously if the target pane is responsively collapsed
        const config = paneConfigs.current[id];
        const isResponsivelyCollapsed =
          config?.collapseAt !== undefined &&
          containerWidth > 0 &&
          containerWidth < config.collapseAt;

        if (width > 0 && !isResponsivelyCollapsed) {
          setPaneCollapsed(id, false);
        } else {
          setPaneCollapsed(id, true);
        }
      },
      [setPaneCollapsed, containerWidth],
    );

    const togglePane = useCallback(
      (id: string) => {
        setSizes((prev) => {
          const current = prev[id] ?? 0;
          const config = paneConfigs.current[id];
          const defaultW = config?.defaultWidth ?? 300;
          if (current === 0) {
            const targetW = lastActiveWidths.current[id] || defaultW;
            setTimeout(() => {
              const isResponsivelyCollapsed =
                config?.collapseAt !== undefined &&
                containerWidth > 0 &&
                containerWidth < config.collapseAt;
              setPaneCollapsed(id, isResponsivelyCollapsed);
            }, 0);
            return { ...prev, [id]: targetW };
          } else {
            lastActiveWidths.current[id] = current;
            setTimeout(() => setPaneCollapsed(id, true), 0);
            return { ...prev, [id]: 0 };
          }
        });
      },
      [setPaneCollapsed, containerWidth],
    );

    const resize = useCallback((id: string, delta: number) => {
      setSizes((prev) => {
        const current = prev[id] || 0;
        return { ...prev, [id]: Math.max(0, current + delta) };
      });
    }, []);

    const startDrag = useCallback(
      (
        e: React.MouseEvent | React.TouchEvent,
        handleId: string,
        targetId: string,
        invert: boolean,
      ) => {
        if (!targetId) return;
        e.preventDefault();
        setIsDragging(true);

        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const currentWidth = sizes[targetId] || 0;

        dragInfo.current = {
          startX: clientX,
          startWidth: currentWidth,
          targetId,
          invert,
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      },
      [sizes],
    );

    useEffect(() => {
      if (!isDragging) return;

      const onMove = (clientX: number) => {
        if (!dragInfo.current) return;
        const { startX, startWidth, targetId, invert } = dragInfo.current;

        const rawDelta = clientX - startX;
        const adjustedDelta = invert ? -rawDelta : rawDelta;
        let newWidth = startWidth + adjustedDelta;

        const config = paneConfigs.current[targetId] || {};
        const paneMinWidth = config.minWidth ?? 50;
        const isPaneDismissible = !!config.dismissible;

        if (!isPaneDismissible) {
          newWidth = Math.max(paneMinWidth, newWidth);
        } else {
          newWidth = Math.max(0, newWidth);
        }

        setSizes((prev) => ({
          ...prev,
          [targetId]: newWidth,
        }));
      };

      const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
      const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX);

      const onEnd = () => {
        setIsDragging(false);
        if (dragInfo.current) {
          const { targetId } = dragInfo.current;
          const config = paneConfigs.current[targetId];
          if (config) {
            const paneMinWidth = config.minWidth ?? 50;

            setSizes((prev) => {
              const currentWidth = prev[targetId] ?? 0;
              if (config.dismissible) {
                const threshold = paneMinWidth;
                if (currentWidth < threshold) {
                  setTimeout(() => setPaneCollapsed(targetId, true), 0);
                  return { ...prev, [targetId]: 0 };
                } else if (currentWidth < paneMinWidth) {
                  lastActiveWidths.current[targetId] = paneMinWidth;
                  return { ...prev, [targetId]: paneMinWidth };
                }
              }
              if (currentWidth > 0) {
                lastActiveWidths.current[targetId] = currentWidth;
              }
              return prev;
            });
          }
        }
        dragInfo.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchend", onEnd);

      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("mouseup", onEnd);
        document.removeEventListener("touchend", onEnd);
      };
    }, [isDragging]);

    const handleRef = (node: HTMLDivElement | null) => {
      // @ts-ignore
      containerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <ResizableContext.Provider
        value={{
          sizes,
          resize,
          containerWidth,
          registerPane,
          isDragging,
          startDrag,
          collapsedPanes,
          setPaneCollapsed,
          setPaneWidth,
          togglePane,
        }}
      >
        <div
          ref={handleRef}
          className={clsx(
            "flex h-full w-full overflow-hidden",
            GAP_CLASSES[gap],
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </ResizableContext.Provider>
    );
  },
);
ResizableRoot.displayName = "Resizable.Root";

// --- PANE COMPONENT ---

interface PaneProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  defaultWidth?: number;
  flex?: boolean;
  collapseAt?: number;
  adaptTo?: "hidden" | "docked" | "floating";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissible?: boolean;
  minWidth?: number;
  // Dynamic parameters passed down when adapted as an overlay
  dialogProps?: Partial<
    Omit<DialogProps, "open" | "onOpenChange" | "children" | "variant">
  >;
  dialogContentProps?: Partial<Omit<DialogContentProps, "children">>;
  sheetProps?: Partial<Omit<SheetProps, "open" | "onOpenChange" | "children">>;
  sheetContentProps?: Partial<Omit<SheetContentProps, "children">>;
}

const Pane = React.forwardRef<HTMLDivElement, PaneProps>(
  (
    {
      children,
      className,
      id,
      defaultWidth = 300,
      flex = false,
      collapseAt,
      adaptTo = "hidden",
      open,
      onOpenChange,
      dismissible = false,
      minWidth = 50,
      style,
      dialogProps,
      dialogContentProps,
      sheetProps,
      sheetContentProps,
      ...props
    },
    ref,
  ) => {
    const {
      sizes,
      containerWidth,
      registerPane,
      setPaneCollapsed,
      setPaneWidth,
      isDragging,
    } = useResizable();

    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = open !== undefined;
    const currentOpen = isControlled ? open : internalOpen;

    const shouldCollapse =
      collapseAt !== undefined &&
      containerWidth > 0 &&
      containerWidth < collapseAt;

    const handleOpenChange = useCallback(
      (newOpen: boolean) => {
        if (!isControlled) {
          setInternalOpen(newOpen);
          if (!newOpen && shouldCollapse) {
            setPaneWidth(id, 0);
          }
        }
        onOpenChange?.(newOpen);
      },
      [isControlled, onOpenChange, shouldCollapse, setPaneWidth, id],
    );

    // Register parameters on mount
    useEffect(() => {
      if (!flex) {
        registerPane(id, defaultWidth, { dismissible, minWidth, collapseAt });
      }
    }, [
      id,
      flex,
      defaultWidth,
      dismissible,
      minWidth,
      collapseAt,
      registerPane,
    ]);

    // Track responsive transitions to auto-open/close the levitated panel
    const prevWidth = useRef(0);
    useEffect(() => {
      if (containerWidth === 0 || collapseAt === undefined) return;

      const prev = prevWidth.current;
      const current = containerWidth;

      if (prev > 0) {
        const wasCollapsed = prev < collapseAt;
        const isCollapsed = current < collapseAt;

        if (!wasCollapsed && isCollapsed) {
          // Desktop -> Mobile transition: automatically open the sheet overlay
          handleOpenChange(true);
        }
        // Mobile -> Desktop transition: we do NOT call handleOpenChange(false)
        // because the sheet automatically unmounts and the content seamlessly
        // transitions back to its inline placement without being dismissed.
      }

      prevWidth.current = current;
    }, [containerWidth, collapseAt, handleOpenChange]);

    // Automatically sync uncontrolled internalOpen state with current width changes when collapsed
    const currentWidth = sizes[id];
    useEffect(() => {
      if (shouldCollapse && !isControlled) {
        if (currentWidth > 0) {
          setInternalOpen(true);
        } else {
          setInternalOpen(false);
        }
      }
    }, [shouldCollapse, currentWidth, isControlled]);

    // Track collapse and width sync dynamically, accounting for controlled states
    const isClosedInline = shouldCollapse || (isControlled && !open);
    useEffect(() => {
      setPaneCollapsed(id, isClosedInline || currentWidth === 0);
    }, [id, isClosedInline, currentWidth, setPaneCollapsed]);

    // Smoothly toggle child rendering visibility during transitions to avoid visual layout jumps
    const [isFullyClosed, setIsFullyClosed] = useState(
      (sizes[id] ?? defaultWidth) === 0 || (isControlled && !open),
    );

    const isOpened = currentWidth > 0 && (!isControlled || open);
    if (isOpened && isFullyClosed) {
      setIsFullyClosed(false);
    }

    const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
      if (
        e.target === e.currentTarget &&
        (currentWidth === 0 || (isControlled && !open))
      ) {
        setIsFullyClosed(true);
      }
    };

    // Delay overlays from triggering until collapse animations finish
    const [delayedOpen, setDelayedOpen] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
      if (shouldCollapse && currentOpen) {
        if (isInitialMount.current) {
          setDelayedOpen(true);
          isInitialMount.current = false;
          return;
        }
        setDelayedOpen(true);
      } else {
        setDelayedOpen(false);
      }
      isInitialMount.current = false;
    }, [shouldCollapse, currentOpen]);

    // Evaluate displays
    let displayWidth: number | undefined = flex
      ? undefined
      : (currentWidth ?? defaultWidth);
    if (isClosedInline) {
      displayWidth = flex ? undefined : 0;
    }

    const showCoplanarChildren =
      !isFullyClosed && (!shouldCollapse || !delayedOpen);

    return (
      <SafeActivity
        mode={shouldCollapse && !currentOpen ? "hidden" : "visible"}
      >
        <div
          ref={ref}
          className={clsx("relative overflow-hidden shrink-0", className)}
          style={{
            flex: flex ? "1 1 0%" : "0 0 auto",
            width: displayWidth,
            transition: isDragging
              ? "none"
              : "width 350ms cubic-bezier(0.2, 0.8, 0.4, 1), flex-basis 350ms cubic-bezier(0.2, 0.8, 0.4, 1)",
            ...(shouldCollapse ? { display: "none" } : {}),
            ...style,
          }}
          id={`pane-${id}`}
          onTransitionEnd={handleTransitionEnd}
          {...props}
        >
          {showCoplanarChildren && children}

          {shouldCollapse && adaptTo === "docked" && (
            <Sheet
              open={delayedOpen}
              onOpenChange={handleOpenChange}
              forceBottomSheet
              {...sheetProps}
            >
              <Sheet.Content
                variant="ghost"
                {...sheetContentProps}
                className={clsx(
                  "p-0 shadow-none border-none max-h-[90vh]",
                  sheetContentProps?.className,
                )}
              >
                {children}
              </Sheet.Content>
            </Sheet>
          )}

          {shouldCollapse && adaptTo === "floating" && (
            <Dialog
              open={delayedOpen}
              onOpenChange={handleOpenChange}
              variant="basic"
              {...dialogProps}
            >
              <DialogContent
                variant="ghost"
                padding="none"
                {...dialogContentProps}
                className={clsx(
                  "shadow-none border-none",
                  dialogContentProps?.className,
                )}
              >
                {children}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </SafeActivity>
    );
  },
);
Pane.displayName = "Pane";

// --- HANDLE COMPONENT ---

const handleVariants = cva(
  "relative z-10 flex w-2 h-full cursor-col-resize items-center justify-center outline-none group select-none touch-none shrink-0",
  {
    variants: {
      isDragging: {
        true: "",
        false: "",
      },
    },
  },
);

const visibleLineVariants = cva(
  "w-[1px] h-full transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-outline-variant",
        pill: "h-12 w-1 rounded-full bg-outline-variant group-hover:h-16 group-hover:bg-primary/50",
      },
      isDragging: {
        true: "!bg-primary/50 !w-1 !h-full opacity-100",
        false: "",
      },
      divided: {
        true: "opacity-100",
        false: "opacity-0",
      },
    },
    defaultVariants: {
      variant: "default",
      divided: true,
    },
  },
);

const indicatorVariants = cva(
  "absolute flex items-center justify-center rounded-full shadow-sm transition-all duration-200 transform",
  {
    variants: {
      color: {
        primary: "bg-primary text-on-primary",
        secondary: "bg-secondary-container text-on-secondary-container",
        text: "bg-secondary-container text-on-secondary-container",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        "high-contrast": "bg-inverse-surface text-inverse-on-surface",
        ghost:
          "bg-surface-container-low/50 backdrop-blur-md border border-outline-variant/30 text-on-surface",
        surface: "bg-surface border border-outline-variant/30 text-on-surface",
        "surface-container-lowest":
          "bg-surface-container-lowest border border-outline-variant/20 text-on-surface",
        "surface-container-low":
          "bg-surface-container-low border border-outline-variant/30 text-on-surface",
        "surface-container":
          "bg-surface-container border border-outline-variant/40 text-on-surface",
        "surface-container-high": "bg-surface-container-high text-on-surface",
        "surface-container-highest":
          "bg-surface-container-highest text-on-surface",
      },
    },
    defaultVariants: {
      color: "secondary",
    },
  },
);

interface HandleProps extends React.HTMLAttributes<HTMLDivElement> {
  target: string;
  invert?: boolean;
  variant?: "default" | "pill";
  divided?: boolean;
  showIndicator?: boolean;
  indicatorHeight?: string | number;
  alwaysShowIndicator?: boolean;
  showIcon?: boolean;
  indicatorWidth?: string | number;
  indicatorColor?: IndicatorColor;
}

const Handle = React.forwardRef<HTMLDivElement, HandleProps>(
  (
    {
      className,
      target,
      invert = false,
      variant = "default",
      divided = true,
      showIndicator = true,
      indicatorHeight,
      alwaysShowIndicator = false,
      showIcon = true,
      indicatorWidth,
      indicatorColor = "secondary",
      ...props
    },
    ref,
  ) => {
    const { startDrag, isDragging, collapsedPanes, sizes } = useResizable();

    // If target is collapsed or has a width of 0, hide handle
    if (collapsedPanes.has(target) || sizes[target] === 0) return null;

    const isTailwindHeight =
      typeof indicatorHeight === "string" && indicatorHeight.startsWith("h-");
    const isTailwindWidth =
      typeof indicatorWidth === "string" && indicatorWidth.startsWith("w-");

    const indicatorStyle: React.CSSProperties = {
      height:
        indicatorHeight && !isTailwindHeight ? indicatorHeight : undefined,
      width: indicatorWidth && !isTailwindWidth ? indicatorWidth : undefined,
    };

    const visibilityClasses = alwaysShowIndicator
      ? "opacity-100 scale-100"
      : isDragging
        ? "opacity-100 scale-100"
        : "opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-90";

    return (
      <div
        ref={ref}
        role="separator"
        tabIndex={0}
        onMouseDown={(e) => startDrag(e, `handle-${target}`, target, invert)}
        onTouchStart={(e) => startDrag(e, `handle-${target}`, target, invert)}
        className={clsx(handleVariants({ isDragging }), className)}
        {...props}
      >
        <div
          className={clsx(
            visibleLineVariants({ isDragging, variant, divided }),
          )}
        />

        {showIndicator && (
          <div
            className={clsx(
              indicatorVariants({ color: indicatorColor }),
              !indicatorHeight && "h-12",
              isTailwindHeight && indicatorHeight,
              !indicatorWidth && "w-6",
              isTailwindWidth && indicatorWidth,
              visibilityClasses,
            )}
            style={indicatorStyle}
          >
            {showIcon && <GripVertical className="h-4 w-4 opacity-70" />}
          </div>
        )}
      </div>
    );
  },
);
Handle.displayName = "Handle";

export const Resizable = Object.assign(ResizableRoot, {
  Pane,
  Handle,
});
