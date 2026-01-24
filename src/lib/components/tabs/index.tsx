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
import { ShallowRouter, useRouter } from "../shallow-router";

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

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  variant?: TabVariant;
  pageTransition?: PageTransition;
  routingMode?: "search" | "pathname";
  routingParamName?: string;
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

interface TabsProviderProps extends Omit<
  TabsProps,
  "routingMode" | "routingParamName"
> {
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

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, ...props }, ref) => {
    const listRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [scrollPosition, setScrollPosition] = useState<
      "start" | "middle" | "end"
    >("start");

    useImperativeHandle(ref, () => listRef.current!);

    const checkScrollState = useCallback(() => {
      const el = listRef.current;
      if (!el) return;

      const hasOverflow = el.scrollWidth > el.clientWidth;
      setIsOverflowing(hasOverflow);

      if (!hasOverflow) {
        setScrollPosition("start");
        return;
      }

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

    const maskStyles: Record<string, React.CSSProperties> = {
      start: {
        maskImage:
          "linear-gradient(to right, black calc(100% - 48px), transparent 100%)",
      },
      middle: {
        maskImage:
          "linear-gradient(to right, transparent 0%, black 48px, black calc(100% - 48px), transparent 100%)",
      },
      end: {
        maskImage: "linear-gradient(to right, transparent 0%, black 48px)",
      },
    };

    return (
      <div
        ref={listRef}
        role="tablist"
        onScroll={handleScroll}
        className={clsx(
          "relative flex border-b border-outline-variant",
          isOverflowing && "overflow-x-auto no-scrollbar",
          className,
        )}
        style={isOverflowing ? maskStyles[scrollPosition] : {}}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TabsList.displayName = "Tabs.List";

const triggerVariants = cva(
  "relative flex px-6 flex-col items-center justify-center gap-1.5 flex-1 min-h-14 max-auto pb-2 pt-2 font-semibold text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: { primary: "pt-1", secondary: "" },
      isActive: {
        true: "text-primary",
        false: "text-on-surface-variant hover:text-on-surface",
      },
    },
    defaultVariants: { variant: "primary", isActive: false },
  },
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, icon, className, ...props }, ref) => {
    const { activeTab, setActiveTab, variant, indicatorId } = useTabs();
    const isActive = activeTab === value;
    const localRef = React.useRef<HTMLButtonElement>(null);
    const [, event] = useRipple({
      // @ts-ignore
      ref: localRef,
      color: "var(--color-ripple-dark)",
      duration: 400,
      // Fix: Removed opacity
    });
    // @ts-ignore
    React.useImperativeHandle(ref, () => localRef.current!);

    useEffect(() => {
      if (isActive && localRef.current) {
        localRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, [isActive]);

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
              "absolute bottom-0 rounded-full bg-primary",
              variant === "primary" ? "w-8" : "w-full",
            )}
            style={{
              height: "2px",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
      </button>
    );
  },
);
TabsTrigger.displayName = "Tabs.Trigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ children, className, ...props }, ref) => {
    const { activeTab, setActiveTab, pageTransition } = useTabs();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const x = useMotionValue(0);

    if (pageTransition === "fade") {
      const activeChild = React.Children.toArray(children).find(
        (child) =>
          // @ts-ignore
          React.isValidElement(child) && child.props?.value === activeTab,
      );

      return (
        <div ref={ref} className={clsx("relative", className)} {...props}>
          <AnimatePresence mode="wait">
            {activeChild && React.isValidElement(activeChild)
              ? React.cloneElement(activeChild, {
                  key: activeTab,
                })
              : null}
          </AnimatePresence>
        </div>
      );
    }

    const panels = React.Children.toArray(children).filter(
      React.isValidElement,
    ) as React.ReactElement<TabsPanelProps>[];
    const tabValues = panels.map((panel) => panel.props.value);
    const activeIndex = tabValues.indexOf(activeTab);

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

    const handleDragEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const velocityThreshold = 300;
      const distanceThreshold = containerWidth * 0.3;

      if (velocity.x < -velocityThreshold || offset.x < -distanceThreshold) {
        const nextIndex = Math.min(activeIndex + 1, panels.length - 1);
        setActiveTab(tabValues[nextIndex]);
      } else if (
        velocity.x > velocityThreshold ||
        offset.x > distanceThreshold
      ) {
        const prevIndex = Math.max(activeIndex - 1, 0);
        setActiveTab(tabValues[prevIndex]);
      } else {
        animate(x, -activeIndex * containerWidth, {
          type: "spring",
          stiffness: 400,
          damping: 40,
        });
      }
    };

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
  },
);
TabsContent.displayName = "Tabs.Content";

interface TabsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(
  ({ value, children, className, ...props }, ref) => {
    const { activeTab, pageTransition } = useTabs();

    if (pageTransition === "fade") {
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
  },
);
TabsPanel.displayName = "Tabs.Panel";

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Panel: TabsPanel,
});
