"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { clsx } from "clsx";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, Loader2 } from "lucide-react";
import React, {
  forwardRef,
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

export interface ElasticScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  elasticity?: boolean;
  dampingFactor?: number;
  scrollbarVisibility?: "auto" | "always" | "scroll";
  pullToRefresh?: boolean;
  onRefresh?: () => Promise<unknown>;
  pullThreshold?: number;
  RefreshIndicatorComponent?: React.ComponentType<RefreshIndicatorProps>;
}

// --- DEFAULT REFRESH INDICATOR ---
const DefaultRefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  pullProgress,
  isRefreshing,
}) => {
  const rotation = useTransform(
    pullProgress,
    [0, DEFAULT_PULL_THRESHOLD],
    [0, 180]
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
  viewportRef: React.RefObject<HTMLDivElement>,
  y: MotionValue<number>,
  options: {
    isEnabled: boolean;
    damping: number;
    isRefreshEnabled: boolean;
    onRefresh?: () => Promise<unknown>;
    pullThreshold: number;
  }
) => {
  const { isEnabled, damping, isRefreshEnabled, onRefresh, pullThreshold } =
    options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const isTouching = useRef(false);
  const startY = useRef(0);
  const isOverscrolling = useRef(false);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const springToZero = useCallback(() => {
    animate(y, 0, {
      type: "spring",
      stiffness: SNAP_BACK_STIFFNESS,
      damping: SNAP_BACK_DAMPING,
    });
  }, [y]);

  const triggerRefresh = useCallback(async () => {
    if (!onRefresh) {
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
  }, [onRefresh, springToZero]);

  useEffect(() => {
    // FIX: Add a guard clause to prevent running before the ref is hydrated.
    const viewport = viewportRef.current;
    if (!viewport || !isEnabled) return;

    const handleWheel = (event: WheelEvent) => {
      // ... (rest of the function is unchanged)
      if (isRefreshing) return;
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop >= scrollHeight - clientHeight;
      const isScrollingUp = event.deltaY < 0;
      const isScrollingDown = event.deltaY > 0;
      if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
        event?.preventDefault();
        const currentY = y.get();
        const resistance = Math.abs(currentY) / MAX_OVERSCROLL_DESKTOP;
        const adjustedDelta = event.deltaY * damping * (1 - resistance);
        const newY = Math.max(
          -MAX_OVERSCROLL_DESKTOP,
          Math.min(MAX_OVERSCROLL_DESKTOP, currentY - adjustedDelta)
        );
        y.set(newY);
        if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = setTimeout(() => {
          const finalY = y.get();
          if (Math.abs(finalY) > 0) {
            if (isRefreshEnabled && finalY >= pullThreshold) {
              triggerRefresh();
            } else {
              springToZero();
            }
          }
        }, 50);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (isRefreshing || event.touches.length !== 1) return;
      isTouching.current = true;
      startY.current = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isTouching.current || isRefreshing || event.touches.length !== 1)
        return;
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const currentY = event.touches[0].clientY;
      const deltaY = currentY - startY.current;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop >= scrollHeight - clientHeight;
      const isPullingDown = deltaY > 0;
      const isPullingUp = deltaY < 0;
      if ((isAtTop && isPullingDown) || (isAtBottom && isPullingUp)) {
        isOverscrolling.current = true;
        y.set(deltaY * damping);
      } else {
        if (isOverscrolling.current) {
          isOverscrolling.current = false;
          y.set(0);
          startY.current = currentY;
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isTouching.current) return;
      isTouching.current = false;
      if (isOverscrolling.current) {
        if (isRefreshEnabled && y.get() >= pullThreshold) {
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
    y,
    springToZero,
    isRefreshEnabled,
    pullThreshold,
    triggerRefresh,
    isRefreshing,
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
      elasticity = true,
      dampingFactor = OVERSCROLL_DAMPING,
      scrollbarVisibility = "auto",
      pullToRefresh = false,
      onRefresh,
      pullThreshold = DEFAULT_PULL_THRESHOLD,
      RefreshIndicatorComponent = DefaultRefreshIndicator,
      ...props
    },
    ref
  ) => {
    const localViewportRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => localViewportRef.current!);

    const y = useMotionValue(0);
    const { isRefreshing } = useElasticAndRefresh(localViewportRef, y, {
      isEnabled: elasticity || pullToRefresh,
      damping: dampingFactor,
      isRefreshEnabled: pullToRefresh,
      onRefresh,
      pullThreshold,
    });
    const pullProgress = useTransform(y, (v) => (v > 0 ? v : 0));
    const indicatorOpacity = useTransform(
      pullProgress,
      [0, pullThreshold * 0.5],
      [0, 1]
    );

    return (
      <ScrollAreaPrimitive.Root
        className={clsx("relative h-full w-full overflow-hidden!", className)}
        {...props}
      >
        {pullToRefresh && (
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
        <motion.div style={{ y }} className="h-full w-full">
          <ScrollAreaPrimitive.Viewport
            ref={localViewportRef}
            className="h-full w-full rounded-[inherit]"
          >
            {children}
          </ScrollAreaPrimitive.Viewport>
        </motion.div>
        <ScrollBar scrollbarVisibility={scrollbarVisibility} />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  }
);
ElasticScrollAreaRoot.displayName = "ElasticScrollArea";

// --- STYLED SUB-COMPONENTS ---
const ScrollBar = forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Scrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar> & {
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
    ref
  ) => (
    <ScrollAreaPrimitive.Scrollbar
      ref={ref}
      orientation={orientation}
      className={clsx(
        "flex touch-none select-none transition-opacity duration-200",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 border-t border-t-transparent p-[1px]",
        {
          "opacity-100": scrollbarVisibility === "always",
          "data-[state=hidden]:opacity-0": scrollbarVisibility === "scroll",
          "opacity-0 data-[state=visible]:opacity-100":
            scrollbarVisibility === "auto",
        },
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-graphite-primary/40" />
    </ScrollAreaPrimitive.Scrollbar>
  )
);
ScrollBar.displayName = ScrollAreaPrimitive.Scrollbar.displayName;

export const ElasticScrollArea = Object.assign(ElasticScrollAreaRoot, {
  ScrollBar,
});
