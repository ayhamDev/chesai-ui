"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { animate, motion, type PanInfo, useMotionValue } from "framer-motion";
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

// Safely access unstable_Activity from React with support for fallback
// @ts-ignore
const Activity = (React as any).unstable_Activity;

interface ActivityContainerProps {
  mode: "visible" | "hidden";
  children: React.ReactNode;
}

const ActivityContainer: React.FC<ActivityContainerProps> = ({
  mode,
  children,
}) => {
  if (Activity) {
    return <Activity mode={mode}>{children}</Activity>;
  }
  return (
    <div
      style={{
        display: mode === "hidden" ? "none" : "contents",
      }}
    >
      {children}
    </div>
  );
};

type TabVariant = "primary" | "secondary";
type PageTransition = "slide" | "fade";
type TabShape = "full" | "minimal" | "sharp";
type TabSize = "sm" | "md" | "lg";

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: TabVariant;
  pageTransition: PageTransition;
  indicatorId: string;
  shape: TabShape;
  size: TabSize;
  stretch: boolean;
  displayTab: string;
  exitingTab: string | null;
  onExitComplete: (value: string) => void;
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
  routingMode?: "search" | "pathname" | "memory";
  routingParamName?: string;
  initialTab?: string;
  shape?: TabShape;
  size?: TabSize;
  stretch?: boolean;
}

const TabsRoot: React.FC<TabsProps> = ({
  children,
  defaultValue,
  variant = "primary",
  pageTransition = "fade",
  routingMode = "memory",
  routingParamName = "tab",
  initialTab,
  shape = "minimal",
  size = "md",
  stretch = true,
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
        shape={shape}
        size={size}
        stretch={stretch}
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
  shape = "minimal",
  size = "md",
  stretch = true,
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

  const [displayTab, setDisplayTab] = useState(activeTab);
  const [exitingTab, setExitingTab] = useState<string | null>(null);

  useEffect(() => {
    if (pageTransition === "fade") {
      if (activeTab !== displayTab && exitingTab === null) {
        setExitingTab(displayTab);
        setDisplayTab("");
      }
    } else {
      setDisplayTab(activeTab);
    }
  }, [activeTab, displayTab, exitingTab, pageTransition]);

  const onExitComplete = useCallback(
    (value: string) => {
      if (exitingTab === value) {
        setExitingTab(null);
        setDisplayTab(activeTab);
      }
    },
    [exitingTab, activeTab],
  );

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        variant,
        pageTransition,
        indicatorId,
        shape,
        size,
        stretch,
        displayTab,
        exitingTab,
        onExitComplete,
      }}
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
  "relative flex items-center justify-center gap-1.5 min-h-14 pb-2 pt-2 font-semibold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "pt-1",
        secondary: "",
      },
      isActive: {
        true: "text-primary",
        false: "text-on-surface-variant hover:text-on-surface",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
      size: {
        sm: "min-h-10 text-xs px-4 py-1.5",
        md: "min-h-14 text-sm px-6 py-2",
        lg: "min-h-16 text-base px-8 py-3",
      },
      stretch: {
        true: "flex-1",
        false: "flex-initial min-w-max",
      },
      iconPosition: {
        top: "flex-col",
        bottom: "flex-col-reverse",
        start: "flex-row",
        end: "flex-row-reverse",
      },
    },
    defaultVariants: {
      variant: "primary",
      isActive: false,
      shape: "minimal",
      size: "md",
      stretch: true,
      iconPosition: "top",
    },
  },
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  iconPosition?: "top" | "start" | "end" | "bottom";
  stretch?: boolean;
  shape?: TabShape;
  size?: TabSize;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    {
      value,
      children,
      icon,
      iconPosition,
      stretch,
      shape,
      size,
      className,
      ...props
    },
    ref,
  ) => {
    const {
      activeTab,
      setActiveTab,
      variant,
      indicatorId,
      shape: contextShape,
      size: contextSize,
      stretch: contextStretch,
    } = useTabs();

    const isActive = activeTab === value;
    const localRef = React.useRef<HTMLButtonElement>(null);
    const [, event] = useRipple({
      // @ts-ignore
      ref: localRef,
      color: "var(--color-ripple-dark)",
      duration: 400,
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

    const resolvedShape = shape ?? contextShape;
    const resolvedSize = size ?? contextSize;
    const resolvedStretch = stretch ?? contextStretch;
    const resolvedIconPosition =
      iconPosition ?? (variant === "primary" ? "top" : "start");

    return (
      <button
        ref={localRef}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => setActiveTab(value)}
        onPointerDown={event}
        className={clsx(
          triggerVariants({
            variant,
            isActive,
            shape: resolvedShape,
            size: resolvedSize,
            stretch: resolvedStretch,
            iconPosition: resolvedIconPosition,
          }),
          className,
        )}
        {...props}
      >
        {icon && (
          <span className="flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}
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
      const panels = React.Children.toArray(children).filter(
        React.isValidElement,
      ) as React.ReactElement<TabsPanelProps>[];

      return (
        <div
          ref={ref}
          className={clsx("relative grid grid-cols-1 grid-rows-1", className)}
          {...props}
        >
          {panels}
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
    const { pageTransition, displayTab, exitingTab, onExitComplete } =
      useTabs();

    const isDisplayed = displayTab === value;
    const isExiting = exitingTab === value;

    const [activityMode, setActivityMode] = useState<"visible" | "hidden">(
      isDisplayed ? "visible" : "hidden",
    );

    useEffect(() => {
      if (isDisplayed || isExiting) {
        setActivityMode("visible");
      } else {
        setActivityMode("hidden");
      }
    }, [isDisplayed, isExiting]);

    if (pageTransition === "fade") {
      const opacityTarget = isDisplayed ? 1 : 0;
      const transitionDuration = isExiting ? 0.1 : 0.2;

      return (
        <ActivityContainer mode={activityMode}>
          <motion.div
            ref={ref}
            role="tabpanel"
            initial={false}
            animate={{
              opacity: opacityTarget,
            }}
            transition={{
              duration: transitionDuration,
            }}
            onAnimationComplete={() => {
              if (isExiting) {
                onExitComplete(value);
              }
            }}
            className={clsx("p-4 col-start-1 row-start-1", className)}
            style={{
              pointerEvents: isDisplayed ? "auto" : "none",
            }}
            {...props}
          >
            {children}
          </motion.div>
        </ActivityContainer>
      );
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={clsx("w-full flex-shrink-0 p-4 min-h-[100px]", className)}
        aria-hidden={!isDisplayed}
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
