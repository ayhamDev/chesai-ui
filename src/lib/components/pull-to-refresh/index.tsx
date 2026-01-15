"use client";

import { clsx } from "clsx";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowDown, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const PULL_THRESHOLD = 100;
const REFRESH_Y_POSITION = 160;

interface RefreshIndicatorProps {
  pullProgress: ReturnType<typeof useMotionValue<number>>;
  isRefreshing: boolean;
}

export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<unknown>;
  IndicatorComponent?: React.ComponentType<RefreshIndicatorProps>;
  pullThreshold?: number;
  className?: string;
}

const DefaultRefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  pullProgress,
  isRefreshing,
}) => {
  const rotation = useTransform(pullProgress, [0, PULL_THRESHOLD], [0, 180]);

  return isRefreshing ? (
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  ) : (
    <motion.div style={{ rotate: rotation }}>
      <ArrowDown className="h-6 w-6 text-primary" />
    </motion.div>
  );
};

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

    if (deltaY > 0) {
      event.preventDefault();
      const resistance = Math.min(deltaY * 0.6, pullThreshold * 1.2);
      y.set(resistance);
    } else {
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

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("mousedown", handleMouseDown);
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
        // Use standard surface background
        "relative w-full h-full overflow-hidden bg-surface",
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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high shadow-md">
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
        }}
        className="absolute inset-0 z-0 h-full overflow-y-auto"
      >
        {children}
      </motion.div>
    </div>
  );
};
