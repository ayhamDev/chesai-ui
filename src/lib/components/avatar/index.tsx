"use client";

import * as RadixAvatar from "@radix-ui/react-avatar";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { User } from "lucide-react";
import React, { useState, useEffect, useId, useRef } from "react";
import { interpolate } from "flubber";
import { animate, motion, useMotionValue } from "framer-motion";

// Import your existing shape definitions and transitions
import { SHAPE_PATHS, type ShapeType } from "../shape/paths";
import { EASING } from "../stack-router/transitions";

const avatarVariants = cva(
  // Removed `overflow-hidden` from the base class so we can manage it conditionally
  // (Standard border-radius needs overflow-hidden, but clip-path handles it natively)
  "relative flex shrink-0 select-none items-center justify-center align-middle font-medium",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        md: "h-12 w-12 text-base",
        lg: "h-16 w-16 text-2xl",
        xl: "h-24 w-24 text-4xl",
        "2xl": "h-32 w-32 text-5xl", // Added 2xl size (128px)
        "3xl": "h-40 w-40 text-6xl", // Added 2xl size (128px)
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
        custom: "", // Used when shapeStyle (SVG clip-path) takes over
      },
    },
    defaultVariants: {
      size: "md",
      shape: "full",
    },
  },
);

const getInitials = (name: string) => {
  const words = typeof name === "string" ? name.split(" ").filter(Boolean) : [];

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export interface AvatarProps extends React.ComponentPropsWithoutRef<
  typeof RadixAvatar.Root
> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  shape?: "full" | "minimal" | "sharp";
  /** Optional SVG Shape to apply. Overrides standard border-radius `shape` */
  shapeStyle?: ShapeType;
  /** Duration in seconds for the morph animation */
  morphDuration?: number;
  /** Easing curve for the morph */
  morphEase?: any;
  src?: string;
  fallback?: string;
  variant?: "default" | "count";
}

export const Avatar = React.forwardRef<
  React.ElementRef<typeof RadixAvatar.Root>,
  AvatarProps
>(
  (
    {
      className,
      style,
      size = "md",
      shape = "full",
      shapeStyle,
      morphDuration = 0.8,
      morphEase = EASING.emphasized,
      src,
      fallback,
      variant = "default",
      ...props
    },
    ref,
  ) => {
    const uniqueId = useId();
    const clipId = `avatar-clip-${uniqueId.replace(/:/g, "")}`;

    const [loadingStatus, setLoadingStatus] = useState<
      "idle" | "loading" | "loaded" | "error"
    >("idle");

    // -- MORPH STATE (Must run unconditionally for React Hook rules) --
    const safeShapeStyle = shapeStyle || "circle";
    const pathD = useMotionValue(SHAPE_PATHS[safeShapeStyle]);
    const progress = useMotionValue(0);
    const [currentShape, setCurrentShape] = useState(safeShapeStyle);
    const previousShape = useRef(safeShapeStyle);

    useEffect(() => {
      if (shapeStyle && shapeStyle !== currentShape) {
        const startPath =
          SHAPE_PATHS[previousShape.current] || SHAPE_PATHS.circle;
        const endPath = SHAPE_PATHS[shapeStyle];

        const interpolator = interpolate(startPath, endPath, {
          maxSegmentLength: 2,
        });

        progress.set(0);

        const playback = animate(progress, 1, {
          duration: morphDuration,
          ease: morphEase,
          onUpdate: (latest) => {
            pathD.set(interpolator(latest) as string);
          },
          onComplete: () => {
            previousShape.current = shapeStyle;
            setCurrentShape(shapeStyle);
          },
        });

        return () => playback.stop();
      }
    }, [shapeStyle, currentShape, morphDuration, morphEase, pathD, progress]);

    const showSkeleton = src && loadingStatus === "loading";
    const isCustomShape = !!shapeStyle;
    const resolvedShape = isCustomShape ? "custom" : shape;

    const clipPathStyles = isCustomShape
      ? {
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
        }
      : {};

    const combinedStyle = { ...style, ...clipPathStyles };

    const renderClipPathDef = () => {
      if (!isCustomShape) return null;
      return (
        <svg
          width="0"
          height="0"
          className="absolute pointer-events-none"
          style={{ position: "absolute", width: 0, height: 0 }}
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              {/* Magic scale factor: 1 / 380 scales your 380x380 paths to bounding box 1x1 */}
              <motion.path d={pathD} transform="scale(0.002631578947368421)" />
            </clipPath>
          </defs>
        </svg>
      );
    };

    if (variant === "count") {
      return (
        <>
          {renderClipPathDef()}
          <RadixAvatar.Root
            ref={ref}
            className={clsx(
              avatarVariants({ size, shape: resolvedShape, className }),
              !isCustomShape && "overflow-hidden", // Fallback to box overflow
            )}
            style={combinedStyle}
            {...props}
          >
            <RadixAvatar.Fallback
              className="flex h-full w-full items-center justify-center bg-secondary-container text-on-secondary-container"
              delayMs={0}
            >
              {fallback}
            </RadixAvatar.Fallback>
          </RadixAvatar.Root>
        </>
      );
    }

    const fallbackContent = fallback ? (
      getInitials(fallback)
    ) : (
      <User className="h-1/2 w-1/2" />
    );

    return (
      <>
        {renderClipPathDef()}
        <RadixAvatar.Root
          ref={ref}
          className={clsx(
            avatarVariants({ size, shape: resolvedShape, className }),
            !isCustomShape && "overflow-hidden",
            "relative",
          )}
          style={combinedStyle}
          {...props}
        >
          {showSkeleton && (
            <div className="absolute inset-0 z-10 animate-pulse bg-surface-container-highest" />
          )}

          <RadixAvatar.Image
            src={src}
            alt={fallback || "User avatar"}
            className="h-full w-full object-cover"
            onLoadingStatusChange={(status) => {
              if (loadingStatus === "idle" && status === "loading") {
                setLoadingStatus(status);
              } else if (status === "loaded" || status === "error") {
                setLoadingStatus(status);
              }
            }}
          />
          <RadixAvatar.Fallback
            className="flex h-full w-full items-center justify-center bg-secondary-container text-on-secondary-container"
            delayMs={0}
          >
            {fallbackContent}
          </RadixAvatar.Fallback>
        </RadixAvatar.Root>
      </>
    );
  },
);
Avatar.displayName = "Avatar";
