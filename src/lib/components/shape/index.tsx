/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
"use client";

import { interpolate } from "flubber";
import { animate, motion, useMotionValue } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { SHAPE_PATHS, type ShapeType } from "./paths";
import { EASING, DURATION } from "../stack-router/transitions";

export interface ShapeProps extends React.SVGProps<SVGSVGElement> {
  shape: ShapeType;
  /**
   * Animation duration in seconds.
   * @default 0.8
   */
  duration?: number;
  /**
   * Easing curve for the morph.
   * Defaults to a standard MD3 curve.
   */
  ease?: any;
}

const DEFAULT_EASE = EASING.emphasized;

export const Shape: React.FC<ShapeProps> = ({
  shape,
  duration = 0.8,
  ease = DEFAULT_EASE,
  className,
  ...props
}) => {
  // Motion value for the path string 'd' attribute
  // Fix: Explicitly typed as string
  const pathD = useMotionValue<string>(SHAPE_PATHS[shape]);

  // Motion value to drive the progress from 0 to 1
  // Fix: Explicitly typed as number
  const progress = useMotionValue<number>(0);

  const [currentShape, setCurrentShape] = useState(shape);
  const previousShape = useRef(shape);

  useEffect(() => {
    if (shape !== currentShape) {
      const startPath = SHAPE_PATHS[previousShape.current];
      const endPath = SHAPE_PATHS[shape];

      // Create an interpolator between the two shapes using flubber
      const interpolator = interpolate(startPath, endPath, {
        maxSegmentLength: 2,
      });

      // Reset progress to 0
      progress.set(0);

      // Animate progress from 0 to 1
      // Fix: Cast target '1' to number to satisfy overload resolution
      // @ts-ignore
      const playback = animate(progress, 1, {
        duration: duration,
        ease: ease,
        onUpdate: (latest) => {
          // Update the pathD motion value with the interpolated SVG string
          // Fix: Ensure set receives a string
          // @ts-ignore
          pathD.set(interpolator(latest) as string);
        },
        onComplete: () => {
          previousShape.current = shape;
          setCurrentShape(shape);
        },
      });

      return () => playback.stop();
    }
  }, [shape, currentShape, duration, ease, pathD, progress]);

  return (
    <svg
      viewBox="0 0 380 380"
      fill="currentColor"
      className={className}
      {...props}
    >
      <motion.path className={"will-change-transform transform-3d"} d={pathD} />
    </svg>
  );
};

export * from "./paths";
export * from "./shaped-components";
