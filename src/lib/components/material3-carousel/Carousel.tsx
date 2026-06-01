// src/lib/components/material3-carousel/Carousel.tsx
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { motion, useMotionValue, PanInfo, animate } from "framer-motion";
import { CarouselProps, CarouselItemProps } from "./types";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { EASING } from "../stack-router/transitions";

const Carousel: React.FC<CarouselProps> = ({
  children,
  className,
  height = "400px",
  slidesPerView = 3,
  breakpoints = {},
  loop = false,
  autoplay = false,
  orientation = "horizontal",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(0);
  const [currentSlidesPerView, setCurrentSlidesPerView] =
    useState(slidesPerView);
  const [isDragging, setIsDragging] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isVert = orientation === "vertical";

  // --- 1. CHILD PROCESSING ---
  const originalChildren = React.Children.toArray(children);
  const originalCount = originalChildren.length;

  const BUFFER_SIZE = loop
    ? isMobile
      ? 2
      : Math.max(4, Math.ceil(currentSlidesPerView))
    : 0;

  const renderList = useMemo(() => {
    if (!loop || originalCount === 0) return originalChildren;
    const tailClones = originalChildren.slice(-BUFFER_SIZE);
    const headClones = originalChildren.slice(0, BUFFER_SIZE);
    return [...tailClones, ...originalChildren, ...headClones];
  }, [originalChildren, loop, BUFFER_SIZE, originalCount]);

  const totalCount = renderList.length;
  const START_INDEX = loop ? BUFFER_SIZE : 0;
  const progress = useMotionValue(START_INDEX);

  // --- 2. RESPONSIVE LOGIC ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!containerRef.current) return;

        // Breakpoints always map to window width, even if carousel is vertical
        const windowWidth = window.innerWidth;

        // Physics needs the container's primary axis dimension
        const size = isVert
          ? containerRef.current.offsetHeight
          : containerRef.current.offsetWidth;

        setContainerSize(size);

        const points = Object.keys(breakpoints)
          .map(Number)
          .sort((a, b) => a - b);
        let activeSPV = slidesPerView;
        for (const point of points) {
          if (windowWidth >= point && breakpoints[point].slidesPerView) {
            activeSPV = breakpoints[point].slidesPerView!;
          }
        }
        setCurrentSlidesPerView(activeSPV);
      }, 100);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoints, slidesPerView, isVert]);

  // --- 3. PHYSICS GENERATION (DYNAMIC PRECISE PERCENTAGES) ---
  const { inputRange, sizeRange, gapRange } = useMemo(() => {
    const spv = Math.max(1, Math.round(currentSlidesPerView));

    const GAP_SIZE = 16;
    const fallbackSize = 1000;
    const currentContainerAxis =
      containerSize > 0 ? containerSize : fallbackSize;

    // Calculate exactly what percentage of the container the gaps consume
    const gapPct = (GAP_SIZE / currentContainerAxis) * 100;
    const visibleGaps = spv - 1;
    const totalGapPct = gapPct * visibleGaps;

    // Distribute the remaining percentage among the slides
    const remainingPct = Math.max(0, 100 - totalGapPct);

    let baseSizes: number[] = [];

    // Ensure sum of baseSizes === 1.0 (100% of available space)
    if (spv === 1) baseSizes = [1];
    else if (spv === 2) baseSizes = [0.65, 0.35];
    else if (spv === 3) baseSizes = [0.5, 0.3, 0.2];
    else {
      const activeWeight = 0.4;
      const remWeight = 0.6;
      const neighborsCount = spv - 1;
      const weights = Array.from(
        { length: neighborsCount },
        (_, i) => neighborsCount - i,
      );
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const neighborSizes = weights.map((w) => (w / totalWeight) * remWeight);
      baseSizes = [activeWeight, ...neighborSizes];
    }

    // Convert to exact, Framer-interpolatable percentage strings
    const sizes = baseSizes.map((s) => `${(s * remainingPct).toFixed(4)}%`);

    const inputs: number[] = [];
    const sizeOutputs: string[] = [];
    const gapOutputs: string[] = [];

    // 1. Previous Item (Completely Gone)
    inputs.push(1);
    sizeOutputs.push("0%");
    gapOutputs.push("0px");

    // 2. Active Item (1st visible)
    inputs.push(0);
    sizeOutputs.push(sizes[0]);
    gapOutputs.push(spv === 1 ? "0px" : `${GAP_SIZE}px`);

    // 3. Following Items
    for (let i = 1; i < spv; i++) {
      inputs.push(-i);
      sizeOutputs.push(sizes[i]);
      // The last visible item drops its margin so it hugs the boundary perfectly
      gapOutputs.push(i === spv - 1 ? "0px" : `${GAP_SIZE}px`);
    }

    // 4. Next Next (Completely Gone)
    inputs.push(-spv);
    sizeOutputs.push("0%");
    gapOutputs.push("0px");

    const zipped = inputs.map((val, i) => ({
      inp: val,
      siz: sizeOutputs[i],
      gap: gapOutputs[i],
    }));
    zipped.sort((a, b) => a.inp - b.inp);

    return {
      inputRange: zipped.map((z) => z.inp),
      sizeRange: zipped.map((z) => z.siz),
      gapRange: zipped.map((z) => z.gap),
    };
  }, [currentSlidesPerView, containerSize]);

  // --- 4. TELEPORTATION ---
  const handleTeleport = useCallback(() => {
    if (!loop) return;
    const current = progress.get();
    if (current >= originalCount + BUFFER_SIZE) {
      progress.set(BUFFER_SIZE + (current - (originalCount + BUFFER_SIZE)));
    } else if (current < BUFFER_SIZE) {
      progress.set(originalCount + BUFFER_SIZE - (BUFFER_SIZE - current));
    }
  }, [loop, originalCount, BUFFER_SIZE, progress]);

  // --- 5. AUTOPLAY ---
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);
  const autoplayDirection = useRef<1 | -1>(1);

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;
    const delay =
      typeof autoplay === "object" && autoplay.delay ? autoplay.delay : 3000;

    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      if (isDragging) return;
      const current = progress.get();

      let step = autoplayDirection.current;
      let target = Math.round(current) + step;

      // Ping-pong reverse logic for non-looping mode
      if (!loop) {
        const maxIndex = totalCount - 1;
        if (target >= maxIndex) {
          target = maxIndex;
          autoplayDirection.current = -1;
        } else if (target <= 0) {
          target = 0;
          autoplayDirection.current = 1;
        }
      }

      animate(progress, target, {
        type: "tween",
        duration: 0.8,
        ease: EASING.emphasized,
        onComplete: handleTeleport,
      });
    }, delay);
  }, [autoplay, isDragging, progress, handleTeleport, loop, totalCount]);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  // --- 6. DRAG HANDLERS ---
  const handleDragStart = () => {
    setIsDragging(true);
    stopAutoplay();
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (containerSize === 0) return;

    // Read the correct axis
    const delta = isVert ? info.delta.y : info.delta.x;

    const dragFactor = containerSize / currentSlidesPerView;
    const deltaIndex = -delta / dragFactor;
    const newProgress = progress.get() + deltaIndex;

    if (!loop) {
      const RUBBER_BAND = 0.2;
      if (newProgress < -RUBBER_BAND) progress.set(-RUBBER_BAND);
      else if (newProgress > totalCount - 1 + RUBBER_BAND)
        progress.set(totalCount - 1 + RUBBER_BAND);
      else progress.set(newProgress);
    } else {
      progress.set(newProgress);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const current = progress.get();
    const velocity = isVert ? info.velocity.y : info.velocity.x;
    let target = Math.round(current);

    const FLICK_THRESHOLD = 400;
    if (Math.abs(velocity) > FLICK_THRESHOLD) {
      if (velocity < 0 && target <= current) target += 1;
      else if (velocity > 0 && target >= current) target -= 1;
    }

    if (!loop) {
      const maxIndex = totalCount - 1;
      target = Math.max(0, Math.min(target, maxIndex));

      // Smartly reset the autoplay direction so it doesn't fight the user's swipe
      if (target <= 0) autoplayDirection.current = 1;
      if (target >= maxIndex) autoplayDirection.current = -1;
    }

    animate(progress, target, {
      type: "tween",
      duration: 0.5,
      ease: EASING.emphasizedDecelerate,
      onComplete: () => {
        handleTeleport();
        if (
          autoplay &&
          (typeof autoplay !== "object" || !autoplay.disableOnInteraction)
        ) {
          startAutoplay();
        }
      },
    });
  };

  return (
    <div
      className={twMerge(
        clsx(
          "relative w-full select-none touch-none contain-layout contain-paint",
          className,
        ),
      )}
      style={{ height }}
      onMouseEnter={stopAutoplay}
      onMouseLeave={() => {
        if (!isDragging) startAutoplay();
      }}
    >
      <motion.div
        ref={containerRef}
        className={clsx(
          "flex w-full h-full items-center",
          isVert ? "flex-col pt-1" : "flex-row pl-1",
        )}
        onPanStart={handleDragStart}
        onPan={handleDrag}
        onPanEnd={handleDragEnd}
        style={{ cursor: "grab" }}
        whileTap={{ cursor: "grabbing" }}
      >
        {React.Children.map(renderList, (child, i) => {
          if (!React.isValidElement(child)) return null;
          const absoluteInputRange = inputRange.map((offset) => i + offset);
          return React.cloneElement(
            child as React.ReactElement<CarouselItemProps>,
            {
              index: i,
              progress: progress,
              inputRange: absoluteInputRange,
              sizeRange: sizeRange,
              gapRange: gapRange,
              orientation: orientation,
            },
          );
        })}
      </motion.div>
    </div>
  );
};

export default Carousel;
