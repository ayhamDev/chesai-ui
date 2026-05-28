// src/lib/components/elastic-scroll-area/index.tsx
"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { clsx } from "clsx";
import {
  type MotionValue,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ElementRef,
  forwardRef,
  type FC,
  type RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { LoadingIndicator } from "../loadingIndicator";

// --- CONSTANTS ---
const OVERSCROLL_DAMPING = 0.25;
const MAX_OVERSCROLL_DESKTOP = 200;
const SNAP_BACK_STIFFNESS = 300;
const SNAP_BACK_DAMPING = 30;
const DEFAULT_PULL_THRESHOLD = 80;

// --- TYPE DEFINITIONS ---
interface RefreshIndicatorProps {
  pullProgress: MotionValue<number>;
  isRefreshing: boolean;
}

export interface ElasticScrollAreaProps extends ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> {
  orientation?: "vertical" | "horizontal";
  elasticity?: boolean;
  dampingFactor?: number;
  scrollbarVisibility?: "auto" | "always" | "scroll" | "hidden" | "visible";
  pullToRefresh?: boolean;
  onRefresh?: () => Promise<unknown>;
  pullThreshold?: number;
  RefreshIndicatorComponent?: ComponentType<RefreshIndicatorProps>;
  onScrollUp?: () => void;
  onScrollDown?: () => void;
  viewportClassName?: string;
  dimmingEdges?: boolean;
}

// --- DEFAULT REFRESH INDICATOR ---
const DefaultRefreshIndicator: FC<RefreshIndicatorProps> = ({
  pullProgress,
  isRefreshing,
}) => {
  const rotation = useTransform(
    pullProgress,
    [0, DEFAULT_PULL_THRESHOLD],
    [0, 360],
  );

  const scale = useTransform(pullProgress, [0, DEFAULT_PULL_THRESHOLD], [0, 1]);

  return (
    <motion.div style={{ rotate: rotation, scale: isRefreshing ? 1 : scale }}>
      <LoadingIndicator
        variant="material-morph-background"
        className="w-10 h-10"
        isPlaying={isRefreshing}
        startingShape={1}
      />
    </motion.div>
  );
};

// --- OVERSCROLL & PULL-TO-REFRESH LOGIC HOOK ---
const useElasticAndRefresh = (
  viewportRef: RefObject<HTMLDivElement | null>,
  motionValue: MotionValue<number>,
  indicatorY: MotionValue<number>, // Added dedicated indicator motion value
  options: {
    orientation: "vertical" | "horizontal";
    isEnabled: boolean;
    damping: number;
    isRefreshEnabled: boolean;
    onRefresh?: () => Promise<unknown>;
    pullThreshold: number;
  },
) => {
  const {
    orientation,
    isEnabled,
    damping,
    isRefreshEnabled,
    onRefresh,
    pullThreshold,
  } = options;
  const isVertical = orientation === "vertical";

  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false); // Ref for sync event listeners without dependency updates

  const isTouching = useRef(false);
  const startPos = useRef(0);
  const isOverscrolling = useRef(false);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRecovering = useRef(false);
  const recoveryAnimation = useRef<any>(null);

  // Sync the indicator with scroll pulls, unless we are currently refreshing
  useEffect(() => {
    const unsub = motionValue.on("change", (latest) => {
      if (!isRefreshingRef.current) {
        indicatorY.set(latest > 0 ? latest : 0);
      }
    });
    return () => unsub();
  }, [motionValue, indicatorY]);

  const springToZero = useCallback(() => {
    isRecovering.current = true;
    if (recoveryAnimation.current) recoveryAnimation.current.stop();

    // 1. Spring list back
    recoveryAnimation.current = animate(motionValue, 0, {
      type: "spring",
      stiffness: SNAP_BACK_STIFFNESS,
      damping: SNAP_BACK_DAMPING,
      onComplete: () => {
        isRecovering.current = false;
        recoveryAnimation.current = null;
      },
    });

    // 2. Spring indicator back (if not held by an ongoing refresh)
    if (!isRefreshingRef.current) {
      animate(indicatorY, 0, {
        type: "spring",
        stiffness: SNAP_BACK_STIFFNESS,
        damping: SNAP_BACK_DAMPING,
      });
    }
  }, [motionValue, indicatorY]);

  const triggerRefresh = useCallback(async () => {
    if (!onRefresh || !isVertical) {
      springToZero();
      return;
    }

    setIsRefreshing(true);
    isRefreshingRef.current = true;
    isRecovering.current = true;

    if (recoveryAnimation.current) recoveryAnimation.current.stop();

    // 1. Instantly return list to 0 immediately when released
    recoveryAnimation.current = animate(motionValue, 0, {
      type: "spring",
      stiffness: SNAP_BACK_STIFFNESS,
      damping: SNAP_BACK_DAMPING,
      onComplete: () => {
        isRecovering.current = false;
        recoveryAnimation.current = null;
      },
    });

    // 2. Smoothly lock the indicator at the threshold offset while refreshing
    animate(indicatorY, pullThreshold, {
      type: "spring",
      stiffness: SNAP_BACK_STIFFNESS,
      damping: SNAP_BACK_DAMPING,
    });

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      isRefreshingRef.current = false;

      // 3. Retreat indicator back to 0 once completely done
      animate(indicatorY, 0, {
        type: "spring",
        stiffness: SNAP_BACK_STIFFNESS,
        damping: SNAP_BACK_DAMPING,
      });
    }
  }, [
    onRefresh,
    springToZero,
    isVertical,
    motionValue,
    indicatorY,
    pullThreshold,
  ]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !isEnabled) return;

    const handleWheel = (event: WheelEvent) => {
      if (isRefreshingRef.current) return;
      const {
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth,
      } = viewport;

      const scrollPos = isVertical ? scrollTop : scrollLeft;
      const scrollDim = isVertical ? scrollHeight : scrollWidth;
      const clientDim = isVertical ? clientHeight : clientWidth;
      const delta = isVertical ? event.deltaY : event.deltaX;

      const isAtStart = scrollPos <= 0;
      const isAtEnd = scrollPos >= scrollDim - clientDim - 1;
      const isScrollingTowardsStart = delta < 0;
      const isScrollingTowardsEnd = delta > 0;

      if (
        (isAtStart && isScrollingTowardsStart) ||
        (isAtEnd && isScrollingTowardsEnd)
      ) {
        if (Math.abs(delta) < 4) {
          if (Math.abs(motionValue.get()) > 0 && event.cancelable) {
            event.preventDefault();
          }
          return;
        }

        if (isRecovering.current) {
          isRecovering.current = false;
          if (recoveryAnimation.current) recoveryAnimation.current.stop();
        }

        event.preventDefault();
        const currentVal = motionValue.get();
        const resistance = Math.abs(currentVal) / MAX_OVERSCROLL_DESKTOP;
        const adjustedDelta = delta * damping * (1 - resistance);
        const newVal = Math.max(
          -MAX_OVERSCROLL_DESKTOP,
          Math.min(MAX_OVERSCROLL_DESKTOP, currentVal - adjustedDelta),
        );
        motionValue.set(newVal);

        if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = setTimeout(() => {
          const finalVal = motionValue.get();
          if (Math.abs(finalVal) > 0 && !isRecovering.current) {
            if (isRefreshEnabled && finalVal >= pullThreshold) {
              triggerRefresh();
            } else {
              springToZero();
            }
          }
        }, 50);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (isRefreshingRef.current || event.touches.length !== 1) return;

      if (isRecovering.current) {
        isRecovering.current = false;
        if (recoveryAnimation.current) recoveryAnimation.current.stop();
      }

      isTouching.current = true;
      startPos.current = isVertical
        ? event.touches[0].clientY
        : event.touches[0].clientX;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (
        !isTouching.current ||
        isRefreshingRef.current ||
        event.touches.length !== 1
      )
        return;

      const {
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth,
      } = viewport;

      const scrollPos = isVertical ? scrollTop : scrollLeft;
      const scrollDim = isVertical ? scrollHeight : scrollWidth;
      const clientDim = isVertical ? clientHeight : clientWidth;
      const currentPosVal = isVertical
        ? event.touches[0].clientY
        : event.touches[0].clientX;

      const delta = currentPosVal - startPos.current;
      const isAtStart = scrollPos <= 0;
      const isAtEnd = scrollPos >= scrollDim - clientDim - 1;
      const isPullingTowardsEnd = delta < 0;
      const isPullingTowardsStart = delta > 0;

      if (
        (isAtStart && isPullingTowardsStart) ||
        (isAtEnd && isPullingTowardsEnd)
      ) {
        if (Math.abs(delta) > 5 || isOverscrolling.current) {
          isOverscrolling.current = true;
          const dampedDelta = delta * 0.5;
          motionValue.set(dampedDelta);
          if (event.cancelable) event.preventDefault();
        }
      } else {
        if (isOverscrolling.current) {
          isOverscrolling.current = false;
          motionValue.set(0);
          startPos.current = currentPosVal;
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isTouching.current) return;
      isTouching.current = false;
      if (isOverscrolling.current) {
        if (isRefreshEnabled && motionValue.get() >= pullThreshold) {
          triggerRefresh();
        } else {
          springToZero();
        }
        isOverscrolling.current = false;
      }
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    viewport.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    viewport.addEventListener("touchmove", handleTouchMove, { passive: false });
    viewport.addEventListener("touchend", handleTouchEnd, { passive: true });
    viewport.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("touchstart", handleTouchStart);
      viewport.removeEventListener("touchmove", handleTouchMove);
      viewport.removeEventListener("touchend", handleTouchEnd);
      viewport.removeEventListener("touchcancel", handleTouchEnd);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [
    viewportRef,
    isEnabled,
    damping,
    motionValue,
    springToZero,
    isRefreshEnabled,
    pullThreshold,
    triggerRefresh,
    isVertical,
  ]);

  return { isRefreshing };
};

// --- MAIN COMPONENT ---
const ElasticScrollAreaRoot = forwardRef<
  HTMLDivElement,
  ElasticScrollAreaProps
>(
  (
    {
      className,
      children,
      orientation = "vertical",
      elasticity = true,
      dampingFactor = OVERSCROLL_DAMPING,
      scrollbarVisibility = "auto",
      pullToRefresh = false,
      onRefresh,
      pullThreshold = DEFAULT_PULL_THRESHOLD,
      RefreshIndicatorComponent = DefaultRefreshIndicator,
      onScrollUp,
      onScrollDown,
      viewportClassName,
      dimmingEdges = false,
      ...props
    },
    ref,
  ) => {
    const localViewportRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(
      ref,
      () => localViewportRef.current as HTMLDivElement,
      [],
    );

    const motionValue = useMotionValue(0);
    const indicatorY = useMotionValue(0);
    const isVertical = orientation === "vertical";

    const { isRefreshing } = useElasticAndRefresh(
      localViewportRef,
      motionValue,
      indicatorY,
      {
        orientation,
        isEnabled: elasticity || pullToRefresh,
        damping: dampingFactor,
        isRefreshEnabled: pullToRefresh,
        onRefresh,
        pullThreshold,
      },
    );

    // Dynamic Edge Dimming State
    const [edges, setEdges] = useState({
      top: false,
      bottom: false,
      left: false,
      right: false,
    });

    const updateEdgeStates = useCallback(() => {
      const viewport = localViewportRef.current;
      if (!viewport || !dimmingEdges) return;

      const {
        scrollTop,
        scrollHeight,
        clientHeight,
        scrollLeft,
        scrollWidth,
        clientWidth,
      } = viewport;

      const hasScrollY = scrollHeight > clientHeight;
      const hasScrollX = scrollWidth > clientWidth;

      setEdges({
        top: hasScrollY && scrollTop > 4,
        bottom: hasScrollY && scrollTop < scrollHeight - clientHeight - 4,
        left: hasScrollX && scrollLeft > 4,
        right: hasScrollX && scrollLeft < scrollWidth - clientWidth - 4,
      });
    }, [dimmingEdges]);

    useEffect(() => {
      const viewport = localViewportRef.current;
      if (!viewport || !dimmingEdges) return;

      updateEdgeStates();
      const observer = new ResizeObserver(updateEdgeStates);
      observer.observe(viewport);
      if (viewport.firstElementChild) {
        observer.observe(viewport.firstElementChild);
      }
      return () => observer.disconnect();
    }, [dimmingEdges, updateEdgeStates]);

    const indicatorOpacity = useTransform(
      indicatorY,
      [0, pullThreshold * 0.5],
      [0, 1],
    );

    const lastScrollTop = useRef(0);
    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        updateEdgeStates();
        const currentScrollTop = event.currentTarget.scrollTop;
        const scrollDelta = currentScrollTop - lastScrollTop.current;

        if (Math.abs(scrollDelta) < 5) return;

        if (scrollDelta > 0) {
          onScrollDown?.();
        } else {
          onScrollUp?.();
        }

        lastScrollTop.current = Math.max(0, currentScrollTop);
      },
      [onScrollDown, onScrollUp, updateEdgeStates],
    );

    // Generate dynamic gradients for dynamic edge dimming using CSS mask-image
    const getMaskStyle = () => {
      if (!dimmingEdges) return undefined;
      const direction = isVertical ? "to bottom" : "to right";
      const startGradient = isVertical
        ? edges.top
          ? "transparent, rgba(0,0,0,1) 24px"
          : "rgba(0,0,0,1)"
        : edges.left
          ? "transparent, rgba(0,0,0,1) 24px"
          : "rgba(0,0,0,1)";
      const endGradient = isVertical
        ? edges.bottom
          ? "rgba(0,0,0,1) calc(100% - 24px), transparent"
          : "rgba(0,0,0,1)"
        : edges.right
          ? "rgba(0,0,0,1) calc(100% - 24px), transparent"
          : "rgba(0,0,0,1)";

      const mask = `linear-gradient(${direction}, ${startGradient}, ${endGradient})`;
      return {
        WebkitMaskImage: mask,
        maskImage: mask,
      };
    };

    return (
      <ScrollAreaPrimitive.Root
        className={clsx("relative h-full w-full overflow-hidden!", className)}
        {...props}
      >
        {pullToRefresh && isVertical && (
          <motion.div
            key={"refresh"}
            className="pointer-events-none absolute inset-x-0 top-[-10px] z-50 flex justify-center"
            style={{
              y: indicatorY,
              opacity: indicatorOpacity,
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent">
              <RefreshIndicatorComponent
                pullProgress={indicatorY}
                isRefreshing={isRefreshing}
              />
            </div>
          </motion.div>
        )}

        <motion.div
          style={{
            [isVertical ? "y" : "x"]: motionValue,
            ...getMaskStyle(),
          }}
          className="h-full w-full"
        >
          <ScrollAreaPrimitive.Viewport
            ref={localViewportRef}
            className={clsx(
              "h-full w-full rounded-[inherit]",
              viewportClassName,
            )}
            style={{ touchAction: isVertical ? "pan-y" : "pan-x" }}
            onScroll={handleScroll}
          >
            {children}
          </ScrollAreaPrimitive.Viewport>
        </motion.div>
        <ScrollBar
          scrollbarVisibility={scrollbarVisibility}
          orientation="vertical"
        />
        <ScrollBar
          scrollbarVisibility={scrollbarVisibility}
          orientation="horizontal"
        />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  },
);
ElasticScrollAreaRoot.displayName = "ElasticScrollArea";

// --- STYLED SUB-COMPONENTS ---
const ScrollBar = forwardRef<
  ElementRef<typeof ScrollAreaPrimitive.Scrollbar>,
  ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar> & {
    scrollbarVisibility?: ElasticScrollAreaProps["scrollbarVisibility"];
  }
>(
  (
    {
      className,
      orientation = "vertical",
      scrollbarVisibility = "auto",
      ...props
    },
    ref,
  ) => (
    <ScrollAreaPrimitive.Scrollbar
      ref={ref}
      orientation={orientation}
      className={clsx(
        "flex touch-none select-none transition-opacity duration-200 z-[100]",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 border-t border-t-transparent p-[1px]",
        {
          "opacity-100":
            scrollbarVisibility === "always" ||
            scrollbarVisibility === "visible",
          hidden: scrollbarVisibility === "hidden",
          "data-[state=hidden]:opacity-0": scrollbarVisibility === "scroll",
          "opacity-0 data-[state=visible]:opacity-100":
            scrollbarVisibility === "auto",
        },
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-graphite-primary/30" />
    </ScrollAreaPrimitive.Scrollbar>
  ),
);
ScrollBar.displayName = ScrollAreaPrimitive.Scrollbar.displayName;

export const ElasticScrollArea = Object.assign(ElasticScrollAreaRoot, {
  ScrollBar,
});
