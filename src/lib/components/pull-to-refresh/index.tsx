"use client";

import { clsx } from "clsx";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowDown, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// --- CONSTANTS ---
const PULL_THRESHOLD = 100;
const REFRESH_Y_POSITION = 160;

// --- TYPE DEFINITIONS ---
interface RefreshIndicatorProps {
  /** The current pull distance as a motion value. */
  pullProgress: ReturnType<typeof useMotionValue<number>>;
  /** Whether the component is in the "refreshing" state. */
  isRefreshing: boolean;
}

export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<unknown>;
  IndicatorComponent?: React.ComponentType<RefreshIndicatorProps>;
  pullThreshold?: number;
  className?: string;
}

// --- DEFAULT INDICATOR ---
const DefaultRefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  pullProgress,
  isRefreshing,
}) => {
  const rotation = useTransform(pullProgress, [0, PULL_THRESHOLD], [0, 180]);

  return isRefreshing ? (
    <Loader2 className="h-6 w-6 animate-spin text-graphite-primary" />
  ) : (
    <motion.div style={{ rotate: rotation }}>
      <ArrowDown className="h-6 w-6 text-graphite-foreground/70" />
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
export const PullToRefresh = ({
  children,
  onRefresh,
  IndicatorComponent = DefaultRefreshIndicator,
  pullThreshold = PULL_THRESHOLD,
  className,
}: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startTouchYRef = useRef(0);

  const y = useMotionValue(0);
  const pullProgress = useTransform(y, (v) => (v > 0 ? v : 0));

  // Dampen the pull distance for the elastic effect on the content
  const contentY = useTransform(pullProgress, (v) => v * 0.4);
  const indicatorOpacity = useTransform(
    pullProgress,
    [0, pullThreshold * 0.75],
    [0, 1]
  );
  const indicatorScale = useTransform(
    pullProgress,
    [pullThreshold * 0.5, pullThreshold],
    [0.5, 1]
  );

  const handleTouchStart = (event: TouchEvent): void => {
    if (isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    // Only start if we're at the top and touching with a single finger
    if (container.scrollTop === 0 && event.touches.length === 1) {
      startTouchYRef.current = event.touches[0].clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (event: TouchEvent): void => {
    if (!isDraggingRef.current || isRefreshing) return;

    const touch = event.touches[0];
    if (!touch) return;

    const currentY = touch.clientY;
    const deltaY = currentY - startTouchYRef.current;

    // Only handle downward pulls
    if (deltaY > 0) {
      // Prevent default scroll behavior when pulling down
      event.preventDefault();

      // Apply some resistance to make it feel natural
      const resistance = Math.min(deltaY * 0.6, pullThreshold * 1.2);
      y.set(resistance);
    } else {
      // If pulling up, reset and allow normal scrolling
      isDraggingRef.current = false;
      y.set(0);
    }
  };

  const handleTouchEnd = async (): Promise<void> => {
    if (!isDraggingRef.current || isRefreshing) return;

    isDraggingRef.current = false;
    const currentY = y.get();

    if (currentY >= pullThreshold) {
      setIsRefreshing(true);
      animate(y, REFRESH_Y_POSITION, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
      }
    } else {
      animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  // Mouse events for desktop support
  const handleMouseDown = (event: MouseEvent): void => {
    if (isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop === 0) {
      startTouchYRef.current = event.clientY;
      isDraggingRef.current = true;
    }
  };

  const handleMouseMove = (event: MouseEvent): void => {
    if (!isDraggingRef.current || isRefreshing) return;

    const currentY = event.clientY;
    const deltaY = currentY - startTouchYRef.current;

    if (deltaY > 0) {
      event.preventDefault();
      const resistance = Math.min(deltaY * 0.6, pullThreshold * 1.2);
      y.set(resistance);
    } else {
      isDraggingRef.current = false;
      y.set(0);
    }
  };

  const handleMouseUp = async (): Promise<void> => {
    if (!isDraggingRef.current || isRefreshing) return;

    isDraggingRef.current = false;
    const currentY = y.get();

    if (currentY >= pullThreshold) {
      setIsRefreshing(true);
      animate(y, REFRESH_Y_POSITION, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
      }
    } else {
      animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add touch event listeners
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Add mouse event listeners for desktop
    container.addEventListener("mousedown", handleMouseDown);

    // Mouse move and up need to be on document to handle cases where
    // the mouse moves outside the container
    const handleDocumentMouseMove = (event: MouseEvent) =>
      handleMouseMove(event);
    const handleDocumentMouseUp = () => handleMouseUp();

    document.addEventListener("mousemove", handleDocumentMouseMove);
    document.addEventListener("mouseup", handleDocumentMouseUp);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleDocumentMouseMove);
      document.removeEventListener("mouseup", handleDocumentMouseUp);
    };
  }, [isRefreshing]);

  return (
    <div
      className={clsx(
        "relative w-full h-full overflow-hidden bg-graphite-background",
        className
      )}
    >
      {/* Indicator */}
      <motion.div
        className="absolute inset-x-0 top-[-50px] z-10 flex justify-center pt-4"
        style={{
          opacity: indicatorOpacity,
          scale: indicatorScale,
          y: contentY,
        }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-graphite-card shadow-md">
          <IndicatorComponent
            pullProgress={pullProgress}
            isRefreshing={isRefreshing}
          />
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <motion.div
        ref={containerRef}
        style={{
          y: contentY,
          // Remove touch-action to allow our custom handling
        }}
        className="absolute inset-0 z-0 h-full overflow-y-auto"
      >
        {children}
      </motion.div>
    </div>
  );
};
