"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import {
  animate,
  AnimatePresence,
  motion,
  type PanInfo,
  useMotionValue,
} from "framer-motion";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import useRipple from "use-ripple-hook";
import { ShallowRouter, useRouter, useRouterOptions } from "../shallow-router";

// --- TYPE DEFINITIONS & CONTEXT ---
type TabVariant = "primary" | "secondary";
type PageTransition = "slide" | "fade";

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: TabVariant;
  pageTransition: PageTransition;
  indicatorId: string;
}

const TabsContext = createContext<TabsContextProps | null>(null);

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a <Tabs> provider.");
  }
  return context;
};

// --- ROOT & PROVIDER ---
interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  variant?: TabVariant;
  pageTransition?: PageTransition;
  routingMode?: "search" | "pathname";
  routingParamName?: string;
  /**
   * For 'pathname' mode, specifies which tab to redirect to on initial load
   * if the current path is the base path.
   */
  initialTab?: string;
}

const TabsRoot: React.FC<TabsProps> = ({
  children,
  defaultValue,
  variant = "primary",
  pageTransition = "fade",
  routingMode = "search",
  routingParamName = "tab",
  initialTab,
}) => {
  const uniqueId = useId();
  return (
    <ShallowRouter mode={routingMode} paramName={routingParamName}>
      <TabsProvider
        defaultValue={defaultValue}
        variant={variant}
        pageTransition={pageTransition}
        indicatorId={uniqueId}
        initialTab={initialTab}
      >
        {children}
      </TabsProvider>
    </ShallowRouter>
  );
};

interface TabsProviderProps
  extends Omit<TabsProps, "routingMode" | "routingParamName"> {
  indicatorId: string;
}

const TabsProvider: React.FC<TabsProviderProps> = ({
  children,
  defaultValue,
  variant = "primary",
  pageTransition = "fade",
  indicatorId,
  initialTab,
}) => {
  const { path, push, replace } = useRouter();
  const { mode } = useRouterOptions();

  // biome-ignore lint/correctness/useExhaustiveDependencies: strict
  useEffect(() => {
    if (initialTab) {
      replace(initialTab);
    }
  }, [initialTab]);

  const activeTab = path === "/" ? defaultValue : path;

  const setActiveTab = (value: string) => {
    if (value === activeTab) return;
    push(value);
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, variant, pageTransition, indicatorId }}
    >
      {children}
    </TabsContext.Provider>
  );
};

// --- TAB LIST ---
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, ...props }, ref) => {
    const listRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [scrollPosition, setScrollPosition] = useState<
      "start" | "middle" | "end"
    >("start");

    // Combine forwarded ref with local ref for external access
    useImperativeHandle(ref, () => listRef.current!);

    // Memoized function to check overflow and scroll position
    const checkScrollState = useCallback(() => {
      const el = listRef.current;
      if (!el) return;

      const hasOverflow = el.scrollWidth > el.clientWidth;
      setIsOverflowing(hasOverflow);

      if (!hasOverflow) {
        setScrollPosition("start");
        return;
      }

      // Using a small tolerance for floating point inaccuracies
      const isAtStart = el.scrollLeft <= 1;
      const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;

      if (isAtStart) {
        setScrollPosition("start");
      } else if (isAtEnd) {
        setScrollPosition("end");
      } else {
        setScrollPosition("middle");
      }
    }, []);

    // Effect to check scroll state on mount, resize, and content changes
    useEffect(() => {
      const el = listRef.current;
      if (!el) return;

      checkScrollState();

      const resizeObserver = new ResizeObserver(checkScrollState);
      resizeObserver.observe(el);

      const mutationObserver = new MutationObserver(checkScrollState);
      mutationObserver.observe(el, { childList: true, subtree: true });

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }, [checkScrollState]);

    const handleScroll = () => {
      checkScrollState();
    };

    // CSS mask styles for creating the fade effect on the edges
    const maskStyles: Record<string, React.CSSProperties> = {
      start: {
        // Fade on the right side
        maskImage:
          "linear-gradient(to right, black calc(100% - 48px), transparent 100%)",
      },
      middle: {
        // Fade on both sides
        maskImage:
          "linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)",
      },
      end: {
        // Fade on the left side
        maskImage: "linear-gradient(to right, transparent 0%, black 48px)",
      },
    };

    return (
      <div
        ref={listRef}
        role="tablist"
        onScroll={handleScroll}
        className={clsx(
          "relative flex border-b border-graphite-border",
          // Apply scrolling and scrollbar hiding only when needed
          isOverflowing && "overflow-x-auto no-scrollbar",
          className
        )}
        style={isOverflowing ? maskStyles[scrollPosition] : {}}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = "Tabs.List";

// --- TAB TRIGGER (MODIFIED) ---
const triggerVariants = cva(
  "relative flex px-6 flex-col items-center justify-center gap-1.5 flex-1 min-h-14 max-auto pb-2 pt-2 font-semibold text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: { primary: "pt-1", secondary: "" },
      isActive: {
        true: "text-graphite-primary",
        false: "text-graphite-foreground/60 hover:text-graphite-foreground/80",
      },
    },
    defaultVariants: { variant: "primary", isActive: false },
  }
);

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, icon, className, ...props }, ref) => {
    const { activeTab, setActiveTab, variant, indicatorId } = useTabs();
    const isActive = activeTab === value;
    const localRef = React.useRef<HTMLButtonElement>(null);
    const [, event] = useRipple({
      ref: localRef,
      color: "var(--color-ripple-light)",
      duration: 450,
    });
    React.useImperativeHandle(ref, () => localRef.current!);

    // --- NEW LOGIC TO SCROLL ACTIVE TAB INTO VIEW ---
    useEffect(() => {
      if (isActive && localRef.current) {
        localRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, [isActive]);
    // --- END OF NEW LOGIC ---

    return (
      <button
        ref={localRef}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => setActiveTab(value)}
        onPointerDown={event}
        className={clsx(triggerVariants({ variant, isActive }), className)}
        {...props}
      >
        {variant === "primary" && icon}
        <span className="relative z-10">{children}</span>
        {isActive && (
          <motion.div
            layoutId={indicatorId}
            className={clsx(
              "absolute bottom-0 rounded-full bg-graphite-primary",
              variant === "primary" ? "w-8" : "w-full"
            )}
            style={{
              height: "2px",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
      </button>
    );
  }
);
TabsTrigger.displayName = "Tabs.Trigger";

// --- TABS CONTENT ---
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ children, className, ...props }, ref) => {
    const { activeTab, setActiveTab, pageTransition } = useTabs();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const x = useMotionValue(0);

    if (pageTransition === "fade") {
      // Find the child that corresponds to the active tab.
      const activeChild = React.Children.toArray(children).find(
        (child) =>
          // @ts-ignore
          React.isValidElement(child) && child.props?.value === activeTab
      );

      return (
        <div ref={ref} className={clsx("relative", className)} {...props}>
          <AnimatePresence mode="wait">
            {/* If an active child is found, clone it and give it a unique key.
                This key is essential for AnimatePresence to detect when the
                component changes and apply enter/exit animations correctly. */}
            {activeChild && React.isValidElement(activeChild)
              ? React.cloneElement(activeChild, {
                  key: activeTab, // Assign the key here
                })
              : null}
          </AnimatePresence>
        </div>
      );
    }

    const panels = React.Children.toArray(children).filter(
      React.isValidElement
    ) as React.ReactElement<TabsPanelProps>[];
    const tabValues = panels.map((panel) => panel.props.value);
    const activeIndex = tabValues.indexOf(activeTab);

    // biome-ignore lint/correctness/useHookAtTopLevel: strict
    useEffect(() => {
      const measureWidth = () => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      };
      measureWidth();
      window.addEventListener("resize", measureWidth);
      return () => window.removeEventListener("resize", measureWidth);
    }, []);

    // biome-ignore lint/correctness/useHookAtTopLevel: strict
    useEffect(() => {
      if (containerWidth > 0) {
        const targetX = -activeIndex * containerWidth;
        animate(x, targetX, {
          type: "spring",
          stiffness: 400,
          damping: 40,
        });
      }
    }, [activeIndex, containerWidth, x]);

    // --- MODIFICATION START: Replaced handleDragEnd logic ---
    const handleDragEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      // A fast swipe (fling) is prioritized. We use a velocity threshold.
      const velocityThreshold = 300;
      // If not a fling, the user must drag at least a portion of the page width.
      const distanceThreshold = containerWidth * 0.3; // 30% of the width

      if (velocity.x < -velocityThreshold || offset.x < -distanceThreshold) {
        // Decisive swipe to the left (next page)
        const nextIndex = Math.min(activeIndex + 1, panels.length - 1);
        setActiveTab(tabValues[nextIndex]);
      } else if (
        velocity.x > velocityThreshold ||
        offset.x > distanceThreshold
      ) {
        // Decisive swipe to the right (previous page)
        const prevIndex = Math.max(activeIndex - 1, 0);
        setActiveTab(tabValues[prevIndex]);
      } else {
        // Indecisive swipe, snap back to the current active page.
        // This is crucial for preventing the "stuck" state.
        animate(x, -activeIndex * containerWidth, {
          type: "spring",
          stiffness: 400,
          damping: 40,
        });
      }
    };
    // --- END MODIFICATION ---

    return (
      <div
        ref={containerRef}
        className={clsx("overflow-hidden", className)}
        {...props}
      >
        <motion.div
          role="tabpanel"
          ref={ref}
          className="flex cursor-grab active:cursor-grabbing"
          style={{ x }}
          drag="x"
          dragConstraints={{
            left: -containerWidth * (panels.length - 1),
            right: 0,
          }}
          onDragEnd={handleDragEnd}
        >
          {panels}
        </motion.div>
      </div>
    );
  }
);
TabsContent.displayName = "Tabs.Content";

// --- TABS PANEL ---
interface TabsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(
  ({ value, children, className, ...props }, ref) => {
    const { activeTab, pageTransition } = useTabs();

    if (pageTransition === "fade") {
      // The parent (TabsContent) now handles filtering and keying.
      // This component just needs to render the animatable motion.div.
      // The key={value} here is now redundant but harmless.
      return (
        // @ts-ignore
        <motion.div
          ref={ref}
          role="tabpanel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.2 }}
          className={clsx("p-4", className)}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={clsx("w-full flex-shrink-0 p-4 min-h-[100px]", className)}
        aria-hidden={activeTab !== value}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsPanel.displayName = "Tabs.Panel";

// --- EXPORT COMPOUND COMPONENT ---
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Panel: TabsPanel,
});
