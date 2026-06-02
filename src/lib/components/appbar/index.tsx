// src/lib/components/appbar/index.tsx
"use client";

import { clsx } from "clsx";
import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Typography } from "../typography";

// --- CONTEXT FOR MANUAL MORPHING ---
export interface AppBarContextValue {
  scrollY: MotionValue<number>;
  collapseProgress: MotionValue<number>;
  collapseDistance: number;
}

const AppBarContext = createContext<AppBarContextValue | null>(null);

export const useAppBarContext = () => {
  const context = useContext(AppBarContext);
  if (!context) {
    throw new Error(
      "useAppBarContext must be used within an <AppBar> component.",
    );
  }
  return context;
};

// --- TYPES ---
export type AppBarVariant = "small" | "center" | "medium" | "large" | "custom";
export type AppBarScrollBehavior = "pinned" | "floating" | "hide";
export type AppBarColor =
  | "surface"
  | "surface-container-lowest"
  | "surface-container-low"
  | "surface-container"
  | "surface-container-high"
  | "surface-container-highest"
  | "primary"
  | "secondary"
  | "transparent";

export interface AppBarSharedProps {
  scrollBehavior?: "sticky" | "conditionally-sticky";
  animatedBehavior?: ("appbar-color" | "shadow" | "fold")[];
  animatedColor?:
    | "background"
    | "card"
    | "primary"
    | "secondary"
    | "surface-container"
    | "transparent";
  appBarColor?:
    | "background"
    | "card"
    | "primary"
    | "secondary"
    | "surface-container"
    | "transparent";
  size?: "sm" | "md" | "lg";
  largeHeaderContent?: React.ReactNode;
  smallHeaderContent?: React.ReactNode;
  stickyHideTarget?: "full-appbar" | "main-row";
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  normalHeaderRowHeight?: number;
  largeHeaderRowHeight?: number;
  foldAnimationDistance?: number;
  foldBorderRadius?: number;
  routeKey?: string;
  collapsible?: boolean;
}

export interface AppBarProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "title" | "color"
> {
  variant?: AppBarVariant;
  scrollBehavior?: AppBarScrollBehavior;
  title?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcons?: React.ReactNode;
  bottomContent?: React.ReactNode;
  color?: AppBarColor;
  scrolledColor?: AppBarColor;
  elevateOnScroll?: boolean;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  routeKey?: string;
  topRowContent?: React.ReactNode;
  expandedContent?: React.ReactNode;
  expandedAnimation?: "default" | "none";
  collapsible?: boolean;
  collapsedHeight?: number;
  expandedHeight?: number;
  effectScrollThreshold?: number;
  collapseScrollDistance?: number;
  /** Automatically smooth-snaps to fully collapsed or fully expanded state if the user stops scrolling halfway */
  snap?: boolean;
  /** Automatically passes mouse wheels and touch drags on the AppBar down to the scroll container */
  forwardScroll?: boolean;
}

export const AppBar = React.forwardRef<HTMLElement, AppBarProps>(
  (
    {
      variant = "small",
      scrollBehavior = "pinned",
      title,
      leadingIcon,
      trailingIcons,
      bottomContent,
      color,
      scrolledColor,
      elevateOnScroll = false,
      scrollContainerRef,
      routeKey,
      topRowContent,
      expandedContent,
      expandedAnimation = "default",
      collapsible = true,
      collapsedHeight = 64,
      expandedHeight,
      effectScrollThreshold = 5,
      collapseScrollDistance,
      snap = false,
      forwardScroll = true,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    // Merge forwarded ref with internal ref so we can attach events directly to the header element
    const internalRef = useRef<HTMLElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current as HTMLElement);

    // --- MANUAL SCROLL TRACKING ---
    const scrollY = useMotionValue(0);
    const snapRef = useRef(snap);
    const collapseDistanceRef = useRef(1);

    snapRef.current = snap;

    // --- EFFECT: Snapping & Core Scroll Listener ---
    useEffect(() => {
      let rafId: number;
      let retries = 0;
      let cleanup: (() => void) | null = null;
      let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

      let activeAnim: any = null;
      let isPointerDown = false;
      let isSnapping = false;

      const attach = () => {
        const container = scrollContainerRef?.current;
        if (!container) {
          if (retries < 15) {
            retries++;
            rafId = requestAnimationFrame(attach);
          }
          return;
        }

        const checkSnap = () => {
          if (!snapRef.current || isPointerDown || isSnapping) return;

          const current = container.scrollTop;
          const distance = collapseDistanceRef.current;

          if (current > 2 && current < distance - 2) {
            const targetY = current > distance / 2 ? distance : 0;

            isSnapping = true;
            if (activeAnim) activeAnim.stop();

            activeAnim = animate(current, targetY, {
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 1,
              restDelta: 1,
              onUpdate: (val) => {
                container.scrollTop = val;
              },
              onComplete: () => {
                isSnapping = false;
              },
            });
          }
        };

        const handleScroll = () => {
          scrollY.set(container.scrollTop);
          if (snapRef.current) {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            if (!isSnapping) {
              scrollTimeout = setTimeout(checkSnap, 80);
            }
          }
        };

        const handlePointerDown = () => {
          isPointerDown = true;
          if (isSnapping && activeAnim) {
            activeAnim.stop();
            isSnapping = false;
          }
        };

        const handlePointerUp = () => {
          isPointerDown = false;
        };

        const handleInterrupt = () => {
          if (isSnapping && activeAnim) {
            activeAnim.stop();
            isSnapping = false;
          }
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        container.addEventListener("wheel", handleInterrupt, { passive: true });
        container.addEventListener("touchstart", handleInterrupt, {
          passive: true,
        });

        // Track pointer globally so we know if the user is holding down ANYWHERE (content or header)
        if (typeof window !== "undefined") {
          window.addEventListener("pointerdown", handlePointerDown, {
            passive: true,
          });
          window.addEventListener("pointerup", handlePointerUp, {
            passive: true,
          });
          window.addEventListener("pointercancel", handlePointerUp, {
            passive: true,
          });
        }

        handleScroll();

        cleanup = () => {
          container.removeEventListener("scroll", handleScroll);
          container.removeEventListener("wheel", handleInterrupt);
          container.removeEventListener("touchstart", handleInterrupt);
          if (typeof window !== "undefined") {
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
          }
          if (scrollTimeout) clearTimeout(scrollTimeout);
          if (activeAnim) activeAnim.stop();
        };
      };

      attach();

      return () => {
        cancelAnimationFrame(rafId);
        if (cleanup) cleanup();
      };
    }, [scrollContainerRef, routeKey]);

    // --- EFFECT: Mouse/Touch Event Proxy (Forwarding Scroll to underlying container) ---
    useEffect(() => {
      if (!forwardScroll) return;
      const header = internalRef.current;
      const container = scrollContainerRef?.current;
      if (!header || !container) return;

      const isTargetScrollable = (target: HTMLElement | null) => {
        let current = target;
        while (current && current !== header) {
          const style = window.getComputedStyle(current);
          if (
            (style.overflowY === "auto" || style.overflowY === "scroll") &&
            current.scrollHeight > current.clientHeight
          ) {
            return true;
          }
          current = current.parentElement;
        }
        return false;
      };

      const onWheel = (e: WheelEvent) => {
        if (isTargetScrollable(e.target as HTMLElement)) return;
        container.scrollTop += e.deltaY;
      };

      let startY = 0;
      let lastY = 0;
      let velocity = 0;
      let lastTime = 0;
      let momentumRaf = 0;
      let isDragging = false;

      const onTouchStart = (e: TouchEvent) => {
        if (isTargetScrollable(e.target as HTMLElement)) return;
        cancelAnimationFrame(momentumRaf);
        startY = e.touches[0].clientY;
        lastY = startY;
        lastTime = performance.now();
        isDragging = true;
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const deltaY = lastY - currentY;
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;

        container.scrollTop += deltaY;

        if (deltaTime > 0) {
          velocity = deltaY / deltaTime;
        }

        lastY = currentY;
        lastTime = currentTime;
      };

      const onTouchEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        // Emulate native momentum/inertia
        let currentVelocity = velocity;
        const friction = 0.93; // Multiplier dictates how fast it slows down

        const applyMomentum = () => {
          if (Math.abs(currentVelocity) > 0.1) {
            container.scrollTop += currentVelocity * 16; // 16ms approx per frame
            currentVelocity *= friction;
            momentumRaf = requestAnimationFrame(applyMomentum);
          }
        };
        momentumRaf = requestAnimationFrame(applyMomentum);
      };

      header.addEventListener("wheel", onWheel, { passive: true });
      header.addEventListener("touchstart", onTouchStart, { passive: true });
      header.addEventListener("touchmove", onTouchMove, { passive: true });
      header.addEventListener("touchend", onTouchEnd, { passive: true });
      header.addEventListener("touchcancel", onTouchEnd, { passive: true });

      return () => {
        header.removeEventListener("wheel", onWheel);
        header.removeEventListener("touchstart", onTouchStart);
        header.removeEventListener("touchmove", onTouchMove);
        header.removeEventListener("touchend", onTouchEnd);
        header.removeEventListener("touchcancel", onTouchEnd);
        cancelAnimationFrame(momentumRaf);
      };
    }, [scrollContainerRef, forwardScroll]);

    const [isScrolled, setIsScrolled] = useState(false);
    const headerY = useMotionValue(0);

    // Reset layout state seamlessly on route change
    useEffect(() => {
      headerY.set(0);
      setIsScrolled(false);
    }, [routeKey, headerY]);

    // --- DYNAMIC MEASUREMENTS ---
    const topRowRef = useRef<HTMLDivElement>(null);
    const expandedRowRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const isLarge = variant === "large";
    const isMedium = variant === "medium";
    const isCustom = variant === "custom";
    const isExpandingVariant =
      isMedium || isLarge || isCustom || !!expandedContent;

    const [measuredTop, setMeasuredTop] = useState(collapsedHeight);
    const [measuredExpanded, setMeasuredExpanded] = useState(
      expandedHeight !== undefined
        ? expandedHeight
        : isLarge
          ? 88
          : isMedium
            ? 48
            : 0,
    );
    const [measuredBottom, setMeasuredBottom] = useState(0);

    useLayoutEffect(() => {
      if (topRowRef.current) setMeasuredTop(topRowRef.current.offsetHeight);
      if (bottomRef.current) setMeasuredBottom(bottomRef.current.offsetHeight);
    }, [title, topRowContent, children, bottomContent, collapsedHeight]);

    useEffect(() => {
      if (expandedHeight !== undefined) {
        setMeasuredExpanded(expandedHeight);
        return;
      }

      if (expandedContent && expandedRowRef.current) {
        const observer = new ResizeObserver((entries) => {
          if (entries[0]) {
            setMeasuredExpanded(entries[0].contentRect.height);
          }
        });
        observer.observe(expandedRowRef.current);
        return () => observer.disconnect();
      } else {
        setMeasuredExpanded(isLarge ? 88 : isMedium ? 48 : 0);
      }
    }, [expandedContent, isLarge, isMedium, expandedHeight]);

    // --- ANIMATION MATH ---
    const collapseDistance = Math.max(
      collapseScrollDistance ?? measuredExpanded,
      1,
    );

    collapseDistanceRef.current = collapseDistance;

    const expandedTotalHeight = measuredTop + measuredExpanded;

    const collapseProgress = useTransform(
      scrollY,
      [0, collapseDistance],
      [0, 1],
      { clamp: true },
    );

    const innerHeight = useTransform(
      scrollY,
      [0, collapseDistance],
      [expandedTotalHeight, measuredTop],
      { clamp: true },
    );

    const topOpacity = useTransform(
      scrollY,
      [Math.max(0, collapseDistance - 25), collapseDistance],
      [isExpandingVariant ? 0 : 1, 1],
      { clamp: true },
    );

    const defaultExpandedOpacity = useTransform(
      scrollY,
      [0, collapseDistance * 0.8],
      [1, 0],
      { clamp: true },
    );
    const defaultExpandedY = useTransform(
      scrollY,
      [0, collapseDistance],
      [0, -20],
      { clamp: true },
    );

    const expandedOpacity =
      expandedAnimation === "none" ? 1 : defaultExpandedOpacity;
    const expandedY = expandedAnimation === "none" ? 0 : defaultExpandedY;

    const hasLeading = !!leadingIcon;
    const scaleCollapsed = isLarge
      ? 22 / 28
      : isMedium || isCustom
        ? 22 / 24
        : 1;
    const titleScale = useTransform(
      scrollY,
      [0, collapseDistance],
      [1, scaleCollapsed],
      { clamp: true },
    );

    const xCollapsed = hasLeading ? 40 : 0;
    const titleX = useTransform(
      scrollY,
      [0, collapseDistance],
      [0, xCollapsed],
      { clamp: true },
    );

    const yCollapsed = isLarge ? 10 : isMedium || isCustom ? 7 : 0;
    const titleY = useTransform(
      scrollY,
      [0, collapseDistance],
      [0, yCollapsed],
      { clamp: true },
    );

    // --- HIDE/FLOAT LOGIC ---
    useMotionValueEvent(scrollY, "change", (latest) => {
      const prev = scrollY.getPrevious() || 0;

      if (latest > effectScrollThreshold && !isScrolled) setIsScrolled(true);
      else if (latest <= effectScrollThreshold && isScrolled)
        setIsScrolled(false);

      const heightToHide =
        (collapsible ? measuredTop : expandedTotalHeight) + measuredBottom;
      const threshold = collapsible ? collapseDistance : 0;

      if (scrollBehavior === "hide") {
        const scrollPastCollapse = Math.max(0, latest - threshold);
        headerY.set(Math.max(-heightToHide, -scrollPastCollapse));
      } else if (scrollBehavior === "floating") {
        const scrollPastCollapse = latest - threshold;

        if (scrollPastCollapse <= 0) {
          headerY.set(0);
          return;
        }

        const previousScrollPastCollapse = Math.max(0, prev - threshold);
        const delta = scrollPastCollapse - previousScrollPastCollapse;

        if (latest <= 0) {
          headerY.set(0);
          return;
        }

        const currentY = headerY.get();
        const newY = currentY - delta;
        headerY.set(Math.max(-heightToHide, Math.min(newY, 0)));
      } else {
        headerY.set(0);
      }
    });

    const resolveColorClass = () => {
      const targetColor = isScrolled
        ? scrolledColor || (color ? color : "surface-container")
        : color || "surface";

      switch (targetColor) {
        case "primary":
          return "bg-primary text-on-primary";
        case "secondary":
          return "bg-secondary-container text-on-secondary-container";
        case "surface-container-lowest":
          return "bg-surface-container-lowest text-on-surface";
        case "surface-container-low":
          return "bg-surface-container-low text-on-surface";
        case "surface-container":
          return "bg-surface-container text-on-surface";
        case "surface-container-high":
          return "bg-surface-container-high text-on-surface";
        case "surface-container-highest":
          return "bg-surface-container-highest text-on-surface";
        case "transparent":
          return "bg-transparent text-on-surface";
        case "surface":
        default:
          return "bg-surface text-on-surface";
      }
    };

    return (
      <AppBarContext.Provider
        value={{ scrollY, collapseProgress, collapseDistance }}
      >
        <motion.header
          ref={internalRef as any}
          role="banner"
          style={{
            y: headerY as any,
            willChange: "transform, background-color, box-shadow",
          }}
          className={clsx(
            "absolute inset-x-0 top-0 z-40 flex flex-col font-manrope transition-[background-color,color,box-shadow] duration-300 transform-gpu",
            resolveColorClass(),
            isScrolled && elevateOnScroll && "shadow-md",
            className,
          )}
          {...(props as any)}
        >
          <motion.div
            style={{
              height: collapsible ? innerHeight : expandedTotalHeight,
              willChange: "height",
            }}
            className="relative flex w-full flex-col justify-between overflow-hidden transform-gpu"
          >
            {/* TOP ROW */}
            <div
              ref={topRowRef}
              className="relative flex w-full shrink-0 items-center px-4 z-20"
              style={{ minHeight: collapsedHeight }}
            >
              {leadingIcon && (
                <div className="z-10 flex shrink-0 items-center justify-center -ml-2 text-inherit">
                  {leadingIcon}
                </div>
              )}

              {children ? (
                <div className="flex-1 min-w-0">{children}</div>
              ) : (
                <motion.div
                  style={{
                    opacity: collapsible
                      ? topOpacity
                      : isExpandingVariant
                        ? 0
                        : 1,
                    willChange: "opacity",
                  }}
                  className={clsx(
                    "z-0 min-w-0 flex-1 relative h-full flex items-center transform-gpu",
                    variant === "center"
                      ? "absolute inset-0 justify-center pointer-events-none px-16"
                      : "pl-2",
                    isExpandingVariant && !topRowContent && "invisible",
                  )}
                >
                  {topRowContent || (
                    <Typography
                      variant="title-large"
                      className={clsx(
                        "truncate",
                        variant === "center" &&
                          "pointer-events-auto text-center",
                      )}
                    >
                      {title}
                    </Typography>
                  )}
                </motion.div>
              )}

              {trailingIcons && (
                <div className="z-10 ml-auto flex shrink-0 items-center gap-1 -mr-2 text-inherit">
                  {trailingIcons}
                </div>
              )}
            </div>

            {/* EXPANDED ROW */}
            {isExpandingVariant &&
              !children &&
              (expandedContent ? (
                <motion.div
                  ref={expandedRowRef}
                  style={{
                    opacity: collapsible ? expandedOpacity : 1,
                    y: collapsible ? expandedY : 0,
                    willChange: "opacity, transform",
                  }}
                  className="px-4 pb-4 w-full flex-1 z-10 transform-gpu"
                >
                  {expandedContent}
                </motion.div>
              ) : (
                <motion.div
                  style={{
                    position: "absolute",
                    left: "16px",
                    bottom: isLarge ? "28px" : "24px",
                    scale: collapsible ? titleScale : 1,
                    x: collapsible ? titleX : 0,
                    y: collapsible ? titleY : 0,
                    transformOrigin: "bottom left",
                    willChange: "transform",
                    maxWidth: trailingIcons
                      ? "calc(100% - 96px)"
                      : "calc(100% - 32px)",
                  }}
                  className="pointer-events-auto z-10 transform-gpu"
                >
                  <Typography
                    variant={isLarge ? "headline-medium" : "headline-small"}
                    className="truncate font-normal"
                  >
                    {title}
                  </Typography>
                </motion.div>
              ))}
          </motion.div>

          {/* PERSISTENT BOTTOM CONTENT */}
          {bottomContent && (
            <div ref={bottomRef} className="w-full shrink-0 z-30">
              {bottomContent}
            </div>
          )}
        </motion.header>
      </AppBarContext.Provider>
    );
  },
);

AppBar.displayName = "AppBar";
