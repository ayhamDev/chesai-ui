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

// --- Types & Context ---

interface ResizableContextProps {
  isDragging: boolean;
  leftWidth: number;
  startDrag: (e: React.MouseEvent | React.TouchEvent) => void;
  minWidth: number;
  maxWidth: number;
}

const ResizableContext = createContext<ResizableContextProps | null>(null);

const useResizable = () => {
  const context = useContext(ResizableContext);
  if (!context) {
    throw new Error(
      "Resizable components must be used within <Resizable.Root>"
    );
  }
  return context;
};

// --- Root Component ---

interface ResizableRootProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

const ResizableRoot = React.forwardRef<HTMLDivElement, ResizableRootProps>(
  (
    {
      children,
      className,
      defaultWidth = 400,
      minWidth = 300,
      maxWidth = 800,
      ...props
    },
    ref
  ) => {
    const [leftWidth, setLeftWidth] = useState(defaultWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // We store the initial mouse/touch position and initial width to calculate delta
    const dragInfo = useRef<{ startX: number; startWidth: number } | null>(
      null
    );

    const startDrag = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        dragInfo.current = {
          startX: clientX,
          startWidth: leftWidth,
        };
        // Disable text selection while dragging
        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";
      },
      [leftWidth]
    );

    const handleMove = useCallback(
      (clientX: number) => {
        if (!dragInfo.current) return;

        const delta = clientX - dragInfo.current.startX;
        const newWidth = Math.min(
          Math.max(dragInfo.current.startWidth + delta, minWidth),
          maxWidth
        );

        setLeftWidth(newWidth);
      },
      [minWidth, maxWidth]
    );

    useEffect(() => {
      if (!isDragging) return;

      const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
      const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

      const onEnd = () => {
        setIsDragging(false);
        dragInfo.current = null;
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", onEnd);

      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onEnd);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onEnd);
      };
    }, [isDragging, handleMove]);

    // Merge forwarded ref with local ref
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        // @ts-ignore
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    return (
      <ResizableContext.Provider
        value={{ isDragging, leftWidth, startDrag, minWidth, maxWidth }}
      >
        <div
          ref={setRefs}
          className={clsx("flex h-full w-full overflow-hidden", className)}
          {...props}
        >
          {children}
        </div>
      </ResizableContext.Provider>
    );
  }
);
ResizableRoot.displayName = "Resizable.Root";

// --- Pane Components ---

const ResizablePaneLeft = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const { leftWidth } = useResizable();
  return (
    <div
      ref={ref}
      style={{ width: leftWidth, ...style }}
      className={clsx("flex-shrink-0 overflow-hidden", className)}
      {...props}
    />
  );
});
ResizablePaneLeft.displayName = "Resizable.PaneLeft";

const ResizablePaneRight = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx("flex-1 min-w-0 overflow-hidden", className)}
      {...props}
    />
  );
});
ResizablePaneRight.displayName = "Resizable.PaneRight";

// --- Handle Component ---

const handleVariants = cva(
  // Base: Invisible hit area (w-4) centering a visible line
  "relative z-10 flex w-4 -ml-2 h-full cursor-col-resize items-center justify-center outline-none group",
  {
    variants: {
      isDragging: {
        true: "",
        false: "",
      },
    },
  }
);

const visibleLineVariants = cva(
  "w-[1px] h-full transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-graphite-border",
        pill: "h-12 w-1 rounded-full bg-graphite-border group-hover:h-16 group-hover:bg-graphite-foreground/30",
      },
      isDragging: {
        true: "!bg-graphite-primary/50 !w-1 !h-full opacity-100", // Active state
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style of the handle. 'pill' mimics the Android handle in your image. */
  variant?: "default" | "pill";
}

const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const { startDrag, isDragging } = useResizable();

    return (
      <div
        ref={ref}
        role="separator"
        tabIndex={0}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        className={clsx(handleVariants({ isDragging }), className)}
        {...props}
      >
        {/* The visual line */}
        <div className={clsx(visibleLineVariants({ isDragging, variant }))} />

        {/* The floating handle indicator (Purple pill in your screenshot) */}
        <div
          className={clsx(
            "absolute flex items-center justify-center w-6 h-12 rounded-full bg-graphite-secondary text-graphite-primary  shadow-sm transition-all duration-200 transform",
            isDragging
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-90"
          )}
        >
          <GripVertical className="h-4 w-4 opacity-50" />
        </div>
      </div>
    );
  }
);
ResizableHandle.displayName = "Resizable.Handle";

// --- Exports ---

export const Resizable = Object.assign(ResizableRoot, {
  PaneLeft: ResizablePaneLeft,
  PaneRight: ResizablePaneRight,
  Handle: ResizableHandle,
});
