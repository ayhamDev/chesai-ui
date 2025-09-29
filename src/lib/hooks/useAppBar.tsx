import {
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { type AppBarSharedProps } from "../components/appbar";

// --- CONSTANTS ---
const FALLBACK_NORMAL_HEADER_ROW_HEIGHT = 64;
const FALLBACK_LARGE_HEADER_ROW_HEIGHT = 96;
const FOLD_ANIMATION_DISTANCE = 50;
const FOLD_BORDER_RADIUS = 24;

// --- HOOK DEFINITION ---
// FIX: The `appBarColor` prop is part of VariantProps, not shared logic.
// It should be handled by the component.
export type UseAppBarOptions = AppBarSharedProps;

export const useAppBar = (
  options: UseAppBarOptions & {
    appBarColor?: "background" | "card" | "primary" | "secondary";
  }
) => {
  const {
    scrollBehavior = "sticky",
    animatedBehavior = [],
    animatedColor = "secondary",
    appBarColor = "card",
    size = "md",
    largeHeaderContent,
    smallHeaderContent,
    stickyHideTarget,
    scrollContainerRef,
  } = options;

  // --- REFS & STATE ---
  const mainRowRef = useRef<HTMLDivElement>(null);
  const largeHeaderRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll({ container: scrollContainerRef });
  const headerY = useMotionValue(0);

  const [measuredHeights, setMeasuredHeights] = useState({
    mainRow:
      size === "lg"
        ? FALLBACK_LARGE_HEADER_ROW_HEIGHT
        : FALLBACK_NORMAL_HEADER_ROW_HEIGHT,
    largeContent: 0,
  });

  // --- BEHAVIOR LOGIC ---
  const isCollapsible =
    size === "lg" && !!largeHeaderContent && !!smallHeaderContent;
  const shouldRenderLargeContent = size === "lg" && !!largeHeaderContent;

  // --- MEASUREMENT EFFECTS ---
  useLayoutEffect(() => {
    const measuredMainRow = mainRowRef.current?.offsetHeight;
    const measuredLargeContent = largeHeaderRef.current?.offsetHeight;
    if (
      (measuredMainRow && measuredMainRow !== measuredHeights.mainRow) ||
      (measuredLargeContent !== undefined &&
        measuredLargeContent !== measuredHeights.largeContent)
    ) {
      setMeasuredHeights({
        mainRow: measuredMainRow || measuredHeights.mainRow,
        largeContent: measuredLargeContent || 0,
      });
    }
  });

  // --- ANIMATION LOGIC ---
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);

    if (scrollBehavior === "conditionally-sticky") {
      const { mainRow, largeContent } = measuredHeights;
      const collapseDistance = isCollapsible ? largeContent : 0;

      let heightToHide: number;
      if (stickyHideTarget === "full-appbar" && size === "lg") {
        heightToHide = mainRow + largeContent;
      } else if (stickyHideTarget === "main-row") {
        heightToHide = isCollapsible
          ? FALLBACK_NORMAL_HEADER_ROW_HEIGHT
          : mainRow;
      } else {
        heightToHide = isCollapsible
          ? FALLBACK_NORMAL_HEADER_ROW_HEIGHT
          : mainRow + largeContent;
      }

      const scrollPastCollapse = latest - collapseDistance;
      if (scrollPastCollapse <= 0) {
        headerY.set(0);
        return;
      }

      const previous = scrollY.getPrevious() ?? 0;
      const previousScrollPastCollapse = Math.max(
        0,
        previous - collapseDistance
      );
      const delta = scrollPastCollapse - previousScrollPastCollapse;
      const newHeaderY = headerY.get() - delta;

      const clampedHeaderY = Math.max(-heightToHide, Math.min(newHeaderY, 0));
      headerY.set(clampedHeaderY);
    } else {
      headerY.set(0);
    }
  });

  // --- DERIVED ANIMATION VALUES ---
  const shouldAnimateColor = animatedBehavior.includes("appbar-color");
  const shouldFold = animatedBehavior.includes("fold");
  const shouldAnimateShadow = animatedBehavior.includes("shadow");

  const finalColor =
    shouldAnimateColor && isScrolled ? animatedColor : appBarColor;
  const finalShadow: "md" | "none" =
    shouldAnimateShadow && isScrolled ? "md" : "none";

  const animatedBorderRadius = useTransform(
    scrollY,
    [0, FOLD_ANIMATION_DISTANCE],
    [0, FOLD_BORDER_RADIUS],
    { clamp: true }
  );

  const collapseAnimDistance = measuredHeights.largeContent;
  const largeRowHeight = measuredHeights.mainRow;
  const totalExpandedHeight = largeRowHeight + collapseAnimDistance;

  const animatedTotalHeight = useTransform(
    scrollY,
    [0, collapseAnimDistance],
    [totalExpandedHeight, FALLBACK_NORMAL_HEADER_ROW_HEIGHT],
    { clamp: true }
  );
  const smoothAnimatedTotalHeight = useSpring(animatedTotalHeight, {
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  });

  const animatedMainRowHeight = useTransform(
    scrollY,
    [0, collapseAnimDistance],
    [largeRowHeight, FALLBACK_NORMAL_HEADER_ROW_HEIGHT],
    { clamp: true }
  );
  const headerRowHeight = isCollapsible
    ? animatedMainRowHeight
    : measuredHeights.mainRow;

  const largeHeaderOpacity = useTransform(
    scrollY,
    [0, collapseAnimDistance * 0.75],
    [1, 0],
    { clamp: true }
  );
  const largeHeaderY = useTransform(
    scrollY,
    [0, collapseAnimDistance],
    [0, -40],
    { clamp: true }
  );

  const titleCrossFadeStart = collapseAnimDistance * 0.4;
  const titleCrossFadeEnd = collapseAnimDistance * 0.9;

  const childrenOpacity = useTransform(
    scrollY,
    [titleCrossFadeStart, titleCrossFadeEnd],
    [1, 0],
    { clamp: true }
  );
  const smallHeaderOpacity = useTransform(
    scrollY,
    [titleCrossFadeStart, titleCrossFadeEnd],
    [0, 1],
    { clamp: true }
  );

  const contentPaddingTop = shouldRenderLargeContent
    ? totalExpandedHeight + 10
    : measuredHeights.mainRow + 20;

  return {
    isScrolled,
    contentPaddingTop,
    headerProps: {
      style: {
        y: headerY,
        height: isCollapsible ? smoothAnimatedTotalHeight : undefined,
        borderBottomLeftRadius: shouldFold ? animatedBorderRadius : undefined,
        borderBottomRightRadius: shouldFold ? animatedBorderRadius : undefined,
      } as MotionStyle,
    },
    mainRowProps: {
      ref: mainRowRef,
      style: { height: headerRowHeight },
    },
    largeContentProps: {
      ref: largeHeaderRef,
      style: {
        opacity: isCollapsible ? largeHeaderOpacity : 1,
        y: isCollapsible ? largeHeaderY : 0,
        pointerEvents: isScrolled && isCollapsible ? "none" : "auto",
      } as MotionStyle,
    },
    childrenContainerProps: {
      style: { opacity: isCollapsible ? childrenOpacity : 1 },
    },
    smallHeaderProps: {
      style: { opacity: smallHeaderOpacity },
    },
    finalColor,
    finalShadow,
    isCollapsible,
    shouldRenderLargeContent,
  };
};
