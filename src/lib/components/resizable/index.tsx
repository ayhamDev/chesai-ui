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
} from "react";

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
  /** Map of pane IDs to their current width in pixels */
  sizes: Record<string, number>;
  /** Update a specific pane's size */
  resize: (id: string, delta: number) => void;
  /** Register a pane to ensure it has a default size state */
  registerPane: (id: string, size: number) => void;
  /** Current width of the entire resizable container */
  containerWidth: number;
  isDragging: boolean;
  startDrag: (
    e: React.MouseEvent | React.TouchEvent,
    handleId: string,
    targetId: string,
    invert: boolean,
  ) => void;
}

// --- CONTEXT ---

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

// --- ROOT COMPONENT ---

interface ResizableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional initial sizes for server-side rendering matching.
   * Key is the Pane ID, value is width in px.
   */
  defaultSizes?: Record<string, number>;
  gap?: ResizableGap;
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
  ({ children, className, defaultSizes = {}, gap = "none", ...props }, ref) => {
    const [sizes, setSizes] = useState<Record<string, number>>(defaultSizes);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Internal ref for the container to measure width
    const containerRef = useRef<HTMLDivElement>(null);
    // Track active drag operation
    const dragInfo = useRef<{
      startX: number;
      startWidth: number;
      targetId: string;
      invert: boolean;
    } | null>(null);

    // Measure Container Width (Responsive Logic)
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

    // Register Panes
    const registerPane = useCallback((id: string, size: number) => {
      setSizes((prev) => {
        if (prev[id] !== undefined) return prev;
        return { ...prev, [id]: size };
      });
    }, []);

    // Resize Logic
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
        if (!targetId) {
          console.warn(
            "Resizable.Handle: Missing 'target' prop. The handle needs to know which Pane ID to resize.",
          );
          return;
        }

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

    // Global Event Listeners for Drag
    useEffect(() => {
      if (!isDragging) return;

      const onMove = (clientX: number) => {
        if (!dragInfo.current) return;
        const { startX, startWidth, targetId, invert } = dragInfo.current;

        const rawDelta = clientX - startX;
        const adjustedDelta = invert ? -rawDelta : rawDelta;
        const newWidth = Math.max(0, startWidth + adjustedDelta);

        setSizes((prev) => ({
          ...prev,
          [targetId]: newWidth,
        }));
      };

      const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
      const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX);

      const onEnd = () => {
        setIsDragging(false);
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
      style,
      ...props
    },
    ref,
  ) => {
    const { sizes, containerWidth, registerPane } = useResizable();

    // Register default size on mount
    useEffect(() => {
      if (!flex) {
        registerPane(id, defaultWidth);
      }
    }, [id, flex, defaultWidth, registerPane]);

    // Responsive Check: Should we hide?
    const shouldHide =
      collapseAt !== undefined &&
      containerWidth > 0 &&
      containerWidth < collapseAt;

    if (shouldHide) return null;

    const currentWidth = sizes[id];

    return (
      <div
        ref={ref}
        className={clsx(
          "relative overflow-hidden transition-[flex-basis] duration-75 ease-out shrink-0",
          className,
        )}
        style={{
          flex: flex ? "1 1 0%" : "0 0 auto",
          width: flex ? undefined : (currentWidth ?? defaultWidth),
          ...style,
        }}
        id={`pane-${id}`}
        {...props}
      >
        {children}
      </div>
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
    const { startDrag, isDragging } = useResizable();

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

        {/* Floating Handle Indicator */}
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
Handle.displayName = "Resizable.Handle";

export const Resizable = Object.assign(ResizableRoot, {
  Pane,
  Handle,
});
