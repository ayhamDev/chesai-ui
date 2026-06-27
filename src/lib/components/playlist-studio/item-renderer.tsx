// src/lib/components/playlist-studio/item-renderer.tsx
"use client";

import {
  motion,
  useMotionValueEvent,
  useTransform,
  cubicBezier,
} from "framer-motion";
import React, { useState } from "react";
import type {
  PlaylistItem,
  PlaylistComponentRegistry,
  TransitionType,
} from "./types";

interface ItemRendererProps {
  item: PlaylistItem;
  playhead: any; // MotionValue<number>
  components: PlaylistComponentRegistry;
  isTimelinePlaying: boolean;
}

const PRELOAD_MS = 2000;
const OFFSET = 200; // Fixed physical translation distance for slide effects

const ensureStrictMonotonic = (arr: number[]): number[] => {
  const clean = [...arr];
  for (let i = 1; i < clean.length; i++) {
    if (clean[i] <= clean[i - 1]) {
      clean[i] = clean[i - 1] + 0.01;
    }
  }
  return clean;
};

const formatStyleUnit = (
  val: number | string | undefined,
  defaultUnit = "px",
): string | undefined => {
  if (val === undefined) return undefined;
  return typeof val === "number" ? `${val}${defaultUnit}` : val;
};

// --- TRANSITION FACTORY ---
interface AnimProps {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  blur: number;
  opacity: number;
}

const getAnimProps = (
  type: TransitionType,
  phase: "in" | "out",
  baseOpacity: number,
): Partial<AnimProps> => {
  const isOut = phase === "out";
  switch (type) {
    case "none":
      return { opacity: baseOpacity };
    case "fade":
      return { opacity: 0 };
    case "slide-up":
      return { opacity: 0, y: isOut ? -OFFSET : OFFSET };
    case "slide-down":
      return { opacity: 0, y: isOut ? OFFSET : -OFFSET };
    case "slide-left":
      return { opacity: 0, x: isOut ? -OFFSET : OFFSET };
    case "slide-right":
      return { opacity: 0, x: isOut ? OFFSET : -OFFSET };
    case "slide-up-left":
      return {
        opacity: 0,
        y: isOut ? -OFFSET : OFFSET,
        x: isOut ? -OFFSET : OFFSET,
      };
    case "slide-up-right":
      return {
        opacity: 0,
        y: isOut ? -OFFSET : OFFSET,
        x: isOut ? OFFSET : -OFFSET,
      };
    case "slide-down-left":
      return {
        opacity: 0,
        y: isOut ? OFFSET : -OFFSET,
        x: isOut ? -OFFSET : OFFSET,
      };
    case "slide-down-right":
      return {
        opacity: 0,
        y: isOut ? OFFSET : -OFFSET,
        x: isOut ? OFFSET : -OFFSET,
      };
    case "scale-up":
      return { opacity: 0, scale: isOut ? 1.2 : 0.8 };
    case "scale-down":
      return { opacity: 0, scale: isOut ? 0.8 : 1.2 };
    case "zoom-in":
      return { opacity: 0, scale: isOut ? 2 : 0.1 };
    case "zoom-out":
      return { opacity: 0, scale: isOut ? 0.1 : 2 };
    case "flip-x":
      return { opacity: 0, rotateY: isOut ? 90 : -90 };
    case "flip-y":
      return { opacity: 0, rotateX: isOut ? 90 : -90 };
    case "spin-cw":
      return { opacity: 0, rotate: isOut ? 180 : -180 };
    case "spin-ccw":
      return { opacity: 0, rotate: isOut ? -180 : 180 };
    case "blur":
      return { opacity: 0, blur: 20 };
    case "blur-scale":
      return { opacity: 0, blur: 20, scale: isOut ? 1.2 : 0.8 };
    default:
      return { opacity: 0 };
  }
};

// --- PREMIUM EASING CURVES (Converted to actual executable functions for useTransform) ---
const easeLinear = (t: number) => t; // Identity function for linear
const easeEntry = cubicBezier(0.05, 0.7, 0.1, 1); // Emphasized Decelerate
const easeExit = cubicBezier(0.3, 0, 0.8, 0.15); // Emphasized Accelerate
const easeOutFunc = cubicBezier(0.0, 0.0, 0.2, 1); // Standard ease-out
const easeInFunc = cubicBezier(0.4, 0.0, 1, 1); // Standard ease-in

// 5 easing segments mapping to the 5 gaps between our 6 keyframes
const segmentEasings = [
  easeLinear,
  easeEntry,
  easeLinear,
  easeExit,
  easeLinear,
];
const opacityEasings = [
  easeLinear,
  easeOutFunc,
  easeLinear,
  easeInFunc,
  easeLinear,
];

export const ItemRenderer = React.memo(
  ({ item, playhead, components, isTimelinePlaying }: ItemRendererProps) => {
    const Component = components[item.type];

    if (!Component) {
      console.warn(
        `[PlaylistPlayer] Element type "${item.type}" is not registered.`,
      );
      return null;
    }

    const { startTime, duration, layout, transitions } = item;
    const endTime = startTime + duration;

    const [isActive, setIsActive] = useState(false);

    useMotionValueEvent(playhead, "change", (latest: number) => {
      const active = latest >= startTime && latest < endTime;
      if (active !== isActive) {
        setIsActive(active);
      }
    });

    const inStart = startTime;
    const inEnd = startTime + (transitions?.in?.duration || 0);
    const outStart = endTime - (transitions?.out?.duration || 0);
    const outEnd = endTime;

    const timeInputs = ensureStrictMonotonic([
      inStart - 1,
      inStart,
      inEnd,
      outStart,
      outEnd,
      outEnd + 1,
    ]);

    const display = useTransform(
      playhead,
      ensureStrictMonotonic([
        startTime - PRELOAD_MS - 1,
        startTime - PRELOAD_MS,
        endTime,
        endTime + 1,
      ]),
      ["none", "block", "block", "none"],
    );

    const baseOpacity = layout.opacity ?? 1;
    const inProps = getAnimProps(
      transitions?.in?.type || "none",
      "in",
      baseOpacity,
    );
    const outProps = getAnimProps(
      transitions?.out?.type || "none",
      "out",
      baseOpacity,
    );

    // Factory helper applying our function-based easing arrays
    const createTransform = (
      inVal: number,
      outVal: number,
      restVal: number,
    ) => {
      const outputs = [inVal, inVal, restVal, restVal, outVal, outVal];
      return useTransform(playhead, timeInputs, outputs, {
        clamp: true,
        ease: segmentEasings,
      });
    };

    const hasInTransition = transitions?.in && transitions.in.type !== "none";
    const hasOutTransition =
      transitions?.out && transitions.out.type !== "none";

    const opacityOutput = [
      0,
      hasInTransition ? 0 : baseOpacity,
      baseOpacity,
      baseOpacity,
      hasOutTransition ? 0 : baseOpacity,
      0,
    ];

    // Opacity uses standard ease-in/out to look natural
    const opacity = useTransform(playhead, timeInputs, opacityOutput, {
      clamp: true,
      ease: opacityEasings,
    });

    const xOffset = createTransform(inProps.x ?? 0, outProps.x ?? 0, 0);
    const yOffset = createTransform(inProps.y ?? 0, outProps.y ?? 0, 0);
    const scale = createTransform(inProps.scale ?? 1, outProps.scale ?? 1, 1);
    const rotate = createTransform(
      inProps.rotate ?? 0,
      outProps.rotate ?? 0,
      0,
    );
    const rotateX = createTransform(
      inProps.rotateX ?? 0,
      outProps.rotateX ?? 0,
      0,
    );
    const rotateY = createTransform(
      inProps.rotateY ?? 0,
      outProps.rotateY ?? 0,
      0,
    );
    const blur = createTransform(inProps.blur ?? 0, outProps.blur ?? 0, 0);

    const filter = useTransform(blur, (v) => {
      const baseFilter = layout.style?.filter || "";
      return v > 0 ? `${baseFilter} blur(${v}px)`.trim() : baseFilter || "none";
    });

    return (
      <motion.div
        className="absolute origin-center will-change-[transform,opacity,filter]"
        style={{
          display,
          opacity,
          x: xOffset,
          y: yOffset,
          scale,
          rotate,
          rotateX,
          rotateY,
          filter,
          left: formatStyleUnit(layout.x),
          top: formatStyleUnit(layout.y),
          width: formatStyleUnit(layout.width),
          height: formatStyleUnit(layout.height),
          zIndex: layout.zIndex || 1,
          ...layout.style,
        }}
      >
        <Component
          data={item.props}
          playhead={playhead}
          isActive={isActive}
          startTime={startTime}
          endTime={endTime}
          isTimelinePlaying={isTimelinePlaying}
        />
      </motion.div>
    );
  },
  (prev, next) =>
    prev.isTimelinePlaying === next.isTimelinePlaying &&
    prev.item.id === next.item.id &&
    prev.item.startTime === next.item.startTime &&
    prev.item.duration === next.item.duration &&
    prev.item.layout.x === next.item.layout.x &&
    prev.item.layout.y === next.item.layout.y &&
    prev.item.layout.width === next.item.layout.width &&
    prev.item.layout.height === next.item.layout.height &&
    JSON.stringify(prev.item.layout.style) ===
      JSON.stringify(next.item.layout.style),
);

ItemRenderer.displayName = "ItemRenderer";
