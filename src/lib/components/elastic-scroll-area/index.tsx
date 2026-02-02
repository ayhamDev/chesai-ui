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
import { ArrowDown, Loader2 } from "lucide-react";
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
}

// --- DEFAULT REFRESH INDICATOR ---
const DefaultRefreshIndicator: FC<RefreshIndicatorProps> = ({
  pullProgress,
  isRefreshing,
}) => {
  const rotation = useTransform(
    pullProgress,
    [0, DEFAULT_PULL_THRESHOLD],
    [0, 180],
  );

  return isRefreshing ? (
    <Loader2 className="h-5 w-5 animate-spin text-graphite-primary" />
  ) : (
    <motion.div style={{ rotate: rotation }}>
      <ArrowDown className="h-5 w-5 text-graphite-foreground/70" />
    </motion.div>
  );
};

// --- OVERSCROLL & PULL-TO-REFRESH LOGIC HOOK ---
const useElasticAndRefresh = (
  viewportRef: RefObject<HTMLDivElement | null>,
  motionValue: MotionValue<number>,
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
  const isTouching = useRef(false);
  const startPos = useRef(0);
  const isOverscrolling = useRef(false);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const springToZero = useCallback(() => {
    animate(motionValue, 0, {
      type: "spring",
      stiffness: SNAP_BACK_STIFFNESS,
      damping: SNAP_BACK_DAMPING,
    });
  }, [motionValue]);

  const triggerRefresh = useCallback(async () => {
    if (!onRefresh || !isVertical) {
      springToZero();
      return;
    }
    setIsRefreshing(true);
    springToZero();
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, springToZero, isVertical]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !isEnabled) return;

    const handleWheel = (event: WheelEvent) => {
      if (isRefreshing) return;
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
      const isAtEnd = scrollPos >= scrollDim - clientDim - 1; // Tolerance
      const isScrollingTowardsStart = delta < 0;
      const isScrollingTowardsEnd = delta > 0;

      if (
        (isAtStart && isScrollingTowardsStart) ||
        (isAtEnd && isScrollingTowardsEnd)
      ) {
        // Only prevent default if we are actually overscrolling
        const currentVal = motionValue.get();
        // If we are starting to overscroll or already overscrolling
        if (Math.abs(currentVal) > 0 || Math.abs(delta) > 1) {
          event.preventDefault();
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
            if (Math.abs(finalVal) > 0) {
              if (isRefreshEnabled && finalVal >= pullThreshold) {
                triggerRefresh();
              } else {
                springToZero();
              }
            }
          }, 50);
        }
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (isRefreshing || event.touches.length !== 1) return;
      isTouching.current = true;
      startPos.current = isVertical
        ? event.touches[0].clientY
        : event.touches[0].clientX;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isTouching.current || isRefreshing || event.touches.length !== 1)
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

      // Only engage elastic if we are at boundary AND pulling away from it
      if (
        (isAtStart && isPullingTowardsStart) ||
        (isAtEnd && isPullingTowardsEnd)
      ) {
        // Allow slight deadzone before engaging
        if (Math.abs(delta) > 5 || isOverscrolling.current) {
          isOverscrolling.current = true;
          // Apply damping to touch delta as well
          const dampedDelta = delta * 0.5;
          motionValue.set(dampedDelta);
          // Prevent default to stop browser overscroll glow/nav
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
    isRefreshing,
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
    const isVertical = orientation === "vertical";

    const { isRefreshing } = useElasticAndRefresh(
      localViewportRef,
      motionValue,
      {
        orientation,
        isEnabled: elasticity || pullToRefresh,
        damping: dampingFactor,
        isRefreshEnabled: pullToRefresh,
        onRefresh,
        pullThreshold,
      },
    );

    const pullProgress = useTransform(motionValue, (v) => (v > 0 ? v : 0));
    const indicatorOpacity = useTransform(
      pullProgress,
      [0, pullThreshold * 0.5],
      [0, 1],
    );

    const lastScrollTop = useRef(0);
    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
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
      [onScrollDown, onScrollUp],
    );

    return (
      <ScrollAreaPrimitive.Root
        className={clsx("relative h-full w-full overflow-hidden!", className)}
        {...props}
      >
        {pullToRefresh && isVertical && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-[-40px] z-50 flex justify-center"
            style={{
              y: isRefreshing ? pullThreshold + 40 : pullProgress,
              opacity: isRefreshing ? 1 : indicatorOpacity,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-graphite-card shadow-md">
              <RefreshIndicatorComponent
                pullProgress={pullProgress}
                isRefreshing={isRefreshing}
              />
            </div>
          </motion.div>
        )}
        <motion.div
          style={{ [isVertical ? "y" : "x"]: motionValue }}
          className="h-full w-full"
        >
          <ScrollAreaPrimitive.Viewport
            ref={localViewportRef}
            className={clsx(
              "h-full w-full rounded-[inherit]",
              viewportClassName,
            )}
            style={{ touchAction: isVertical ? "pan-y" : "pan-x" }}
            onScroll={onScrollUp || onScrollDown ? handleScroll : undefined}
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
