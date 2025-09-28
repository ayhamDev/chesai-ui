"use client";

import { clsx } from "clsx";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowDown, Loader2 } from "lucide-react";
import React, { useCallback, useRef, useState, useEffect } from "react";

// --- CONSTANTS ---
const PULL_THRESHOLD = 100; // Pixels to pull down to trigger refresh
const LOADING_INDICATOR_HEIGHT = 60; // The height the indicator stays at while loading

// --- DEFAULT INDICATOR COMPONENT ---
const DefaultRefreshIndicator = ({ y }: { y: any }) => {
  const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 180]);
  return (
    <motion.div
      style={{ rotate }}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700"
    >
      <ArrowDown className="h-5 w-5" />
    </motion.div>
  );
};

// --- COMPONENT PROPS ---
export interface PullToRefreshProps {
  /** The scrollable content that the user will pull down. */
  children: React.ReactNode;
  /** An async function that resolves when the refresh action is complete. */
  onRefresh: () => Promise<any>;
  /** A custom component or element to display while refreshing. */
  refreshingIndicator?: React.ReactNode;
  /** Custom classes for the main wrapper div. */
  className?: string;
  /** Custom classes for the content area. */
  contentClassName?: string;
}

export const PullToRefresh = ({
  children,
  onRefresh,
  refreshingIndicator,
  className,
  contentClassName,
}: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  // Touch handling state
  const touchStartY = useRef<number>(0);
  const lastTouchY = useRef<number>(0);
  const isAtTop = useRef<boolean>(true);

  const scale = useTransform(y, [0, PULL_THRESHOLD], [0, 1], { clamp: true });

  // Check if the content is scrolled to the top
  const checkScrollPosition = useCallback(() => {
    if (contentRef.current) {
      const scrollTop = contentRef.current.scrollTop;
      isAtTop.current = scrollTop <= 0;
    }
  }, []);
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);
  // Set up scroll listener and touch event listeners
  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      // Scroll listener
      contentElement.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition(); // Initial check

      // Touch event listeners (non-passive to allow preventDefault)
      const handleTouchStartNative = (e: TouchEvent) => {
        if (isRefreshing) return;

        touchStartY.current = e.touches[0].clientY;
        lastTouchY.current = e.touches[0].clientY;
        checkScrollPosition();
      };

      const handleTouchMoveNative = (e: TouchEvent) => {
        if (isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const deltaY = currentY - touchStartY.current;
        const movementY = currentY - lastTouchY.current;
        lastTouchY.current = currentY;

        // Only allow pull-to-refresh if at top and pulling down
        if (isAtTop.current && deltaY > 0 && movementY > 0) {
          e.preventDefault(); // This will now work

          const pullDistance = Math.min(deltaY * 0.5, PULL_THRESHOLD * 1.2);
          y.set(pullDistance);
          setIsPulling(true);
        } else {
          if (isPulling) {
            y.set(0);
            setIsPulling(false);
          }
        }
      };

      const handleTouchEndNative = async () => {
        if (isRefreshing || !isPulling) return;

        const currentY = y.get();

        if (currentY >= PULL_THRESHOLD) {
          animate(y, LOADING_INDICATOR_HEIGHT, { type: "spring", damping: 30 });
          await handleRefresh();
          animate(y, 0, { type: "spring", damping: 30 });
        } else {
          animate(y, 0, { type: "spring", damping: 30 });
        }

        setIsPulling(false);
      };

      // Add event listeners with { passive: false } to allow preventDefault
      contentElement.addEventListener("touchstart", handleTouchStartNative, {
        passive: false,
      });
      contentElement.addEventListener("touchmove", handleTouchMoveNative, {
        passive: false,
      });
      contentElement.addEventListener("touchend", handleTouchEndNative, {
        passive: false,
      });

      return () => {
        contentElement.removeEventListener("scroll", checkScrollPosition);
        contentElement.removeEventListener(
          "touchstart",
          handleTouchStartNative
        );
        contentElement.removeEventListener("touchmove", handleTouchMoveNative);
        contentElement.removeEventListener("touchend", handleTouchEndNative);
      };
    }
  }, [checkScrollPosition, isRefreshing, isPulling, y, handleRefresh]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing) return;

      touchStartY.current = e.touches[0].clientY;
      lastTouchY.current = e.touches[0].clientY;
      checkScrollPosition();
    },
    [isRefreshing, checkScrollPosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY.current;
      const movementY = currentY - lastTouchY.current;
      lastTouchY.current = currentY;

      // Only allow pull-to-refresh if:
      // 1. We're at the top of the scroll area
      // 2. The user is pulling down (positive delta)
      // 3. The movement is downward
      if (isAtTop.current && deltaY > 0 && movementY > 0) {
        // Prevent the default scroll behavior when pulling to refresh
        e.preventDefault();

        const pullDistance = Math.min(deltaY * 0.5, PULL_THRESHOLD * 1.2); // Apply resistance
        y.set(pullDistance);
        setIsPulling(true);
      } else {
        // Allow normal scrolling
        if (isPulling) {
          y.set(0);
          setIsPulling(false);
        }
      }
    },
    [isRefreshing, isPulling, y]
  );

  const handleTouchEnd = useCallback(async () => {
    if (isRefreshing || !isPulling) return;

    const currentY = y.get();

    if (currentY >= PULL_THRESHOLD) {
      // Trigger refresh
      animate(y, LOADING_INDICATOR_HEIGHT, { type: "spring", damping: 30 });
      await handleRefresh();
      animate(y, 0, { type: "spring", damping: 30 });
    } else {
      // Snap back
      animate(y, 0, { type: "spring", damping: 30 });
    }

    setIsPulling(false);
  }, [isRefreshing, isPulling, y, handleRefresh]);

  // Mouse events for desktop testing (optional)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isRefreshing) return;

      touchStartY.current = e.clientY;
      lastTouchY.current = e.clientY;
      checkScrollPosition();

      const handleMouseMove = (e: MouseEvent) => {
        const currentY = e.clientY;
        const deltaY = currentY - touchStartY.current;
        const movementY = currentY - lastTouchY.current;
        lastTouchY.current = currentY;

        if (isAtTop.current && deltaY > 0 && movementY > 0) {
          e.preventDefault();
          const pullDistance = Math.min(deltaY * 0.5, PULL_THRESHOLD * 1.2);
          y.set(pullDistance);
          setIsPulling(true);
        } else {
          if (isPulling) {
            y.set(0);
            setIsPulling(false);
          }
        }
      };

      const handleMouseUp = async () => {
        if (isPulling) {
          const currentY = y.get();

          if (currentY >= PULL_THRESHOLD) {
            animate(y, LOADING_INDICATOR_HEIGHT, {
              type: "spring",
              damping: 30,
            });
            await handleRefresh();
            animate(y, 0, { type: "spring", damping: 30 });
          } else {
            animate(y, 0, { type: "spring", damping: 30 });
          }

          setIsPulling(false);
        }

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [isRefreshing, isPulling, y, handleRefresh, checkScrollPosition]
  );

  return (
    <div
      ref={containerRef}
      className={clsx("relative w-full h-full overflow-hidden", className)}
    >
      {/* Indicator Area */}
      <motion.div
        className="absolute inset-x-0 top-0 z-20 flex justify-center pt-4"
        style={{ scale }}
      >
        {isRefreshing ? (
          refreshingIndicator ?? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-700">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )
        ) : (
          <DefaultRefreshIndicator y={y} />
        )}
      </motion.div>

      {/* Content Area */}
      <motion.div
        ref={contentRef}
        className={clsx(
          "relative z-10 h-full overflow-y-auto bg-inherit",
          contentClassName
        )}
        style={{ y }}
        onMouseDown={handleMouseDown} // Keep mouse events for desktop testing
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

PullToRefresh.displayName = "PullToRefresh";
