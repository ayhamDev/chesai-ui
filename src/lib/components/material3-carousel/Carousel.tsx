// src/components/material3-carousel/Carousel.tsx
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
import { EASING, DURATION } from "../stack-router/transitions";

const Carousel: React.FC<CarouselProps> = ({
  children,
  className,
  height = "400px",
  slidesPerView = 3,
  breakpoints = {},
  loop = false,
  autoplay = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentSlidesPerView, setCurrentSlidesPerView] =
    useState(slidesPerView);
  const [isDragging, setIsDragging] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

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
        const width = window.innerWidth;
        setContainerWidth(containerRef.current.offsetWidth);

        const points = Object.keys(breakpoints)
          .map(Number)
          .sort((a, b) => a - b);
        let activeSPV = slidesPerView;
        for (const point of points) {
          if (width >= point && breakpoints[point].slidesPerView) {
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
  }, [breakpoints, slidesPerView]);

  // --- 3. PHYSICS GENERATION (FIXED SPACING) ---
  const { inputRange, widthRange, marginRange } = useMemo(() => {
    const spv = Math.max(1, Math.round(currentSlidesPerView));

    let widths: string[] = [];

    // Ensure sum of widths === 100%
    if (spv === 1) widths = ["100%"];
    else if (spv === 2) widths = ["65%", "35%"];
    else if (spv === 3) widths = ["50%", "30%", "20%"];
    else {
      // Weighted distribution for 4+
      const activePct = 40;
      const remainingPct = 100 - activePct;
      const neighborsCount = spv - 1;
      const weights = Array.from(
        { length: neighborsCount },
        (_, i) => neighborsCount - i,
      );
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const neighborWidths = weights.map(
        (w) => (w / totalWeight) * remainingPct,
      );
      widths = [
        `${activePct}%`,
        ...neighborWidths.map((w) => `${w.toFixed(2)}%`),
      ];
    }

    const inputs: number[] = [];
    const widthOutputs: string[] = [];
    const marginOutputs: string[] = [];

    // --- GAP CONFIG ---
    const GAP_SIZE = "16px";

    // 1. Previous Item (Completely Gone)
    // We explicitly set margin to 0px so it takes NO space.
    inputs.push(1);
    widthOutputs.push("0%");
    marginOutputs.push("0px");

    // 2. Active Item
    inputs.push(0);
    widthOutputs.push(widths[0]);
    marginOutputs.push(GAP_SIZE);

    // 3. Next Items
    for (let i = 1; i < spv; i++) {
      inputs.push(-i);
      widthOutputs.push(widths[i]);
      // If it's the very last visible item, usually we might want 0 margin,
      // but for consistency in a loop, keeping 16px is safer.
      marginOutputs.push(GAP_SIZE);
    }

    // 4. Next Next (Completely Gone)
    inputs.push(-spv);
    widthOutputs.push("0%");
    marginOutputs.push("0px");

    // Sort for Framer Motion
    const zipped = inputs.map((val, i) => ({
      inp: val,
      wid: widthOutputs[i],
      mar: marginOutputs[i],
    }));
    zipped.sort((a, b) => a.inp - b.inp);

    return {
      inputRange: zipped.map((z) => z.inp),
      widthRange: zipped.map((z) => z.wid),
      marginRange: zipped.map((z) => z.mar),
    };
  }, [currentSlidesPerView]);

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
  const startAutoplay = useCallback(() => {
    if (!autoplay) return;
    const delay =
      typeof autoplay === "object" && autoplay.delay ? autoplay.delay : 3000;

    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      if (isDragging) return;
      const current = progress.get();
      const target = Math.round(current) + 1;

      animate(progress, target, {
        type: "tween",
        duration: 0.8,
        ease: EASING.emphasized, // MD3 Emphasized
        onComplete: handleTeleport,
      });
    }, delay);
  }, [autoplay, isDragging, progress, handleTeleport]);

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
    if (containerWidth === 0) return;
    const dragFactor = containerWidth / currentSlidesPerView;
    const deltaIndex = -info.delta.x / dragFactor;
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
    const velocity = info.velocity.x;
    let target = Math.round(current);

    const FLICK_THRESHOLD = 400;
    if (Math.abs(velocity) > FLICK_THRESHOLD) {
      if (velocity < 0 && target <= current) target += 1;
      else if (velocity > 0 && target >= current) target -= 1;
    }

    if (!loop) target = Math.max(0, Math.min(target, totalCount - 1));

    animate(progress, target, {
      type: "tween",
      duration: 0.5,
      ease: EASING.emphasizedDecelerate, // MD3 Decelerate
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
        className="flex w-full h-full items-center pl-1"
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
              widthRange: widthRange,
              marginRange: marginRange, // Pass the new margin ranges
            },
          );
        })}
      </motion.div>
    </div>
  );
};

export default Carousel;
