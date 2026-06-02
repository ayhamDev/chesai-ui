// src/lib/components/shape/shaped-components.tsx
"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { interpolate } from "flubber";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import React, {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import useRipple from "use-ripple-hook";
import { ImageOff, X } from "lucide-react";
import { Shape } from "./index";
import { SHAPE_PATHS, type ShapeType } from "./paths";
import { EASING, DURATION } from "../stack-router/transitions";
import { Skeleton } from "../skeleton";
import type { ImageEffect } from "../image";

// --- 1. SHAPED ICON (Wrapper) ---
export interface ShapedIconProps extends React.SVGProps<SVGSVGElement> {
  shape: ShapeType;
  size?: number | string;
}

export const ShapedIcon = forwardRef<SVGSVGElement, ShapedIconProps>(
  ({ shape, size = 24, className, style, ...props }, ref) => {
    return (
      <Shape
        ref={ref}
        shape={shape}
        className={clsx("text-current", className)}
        style={{ width: size, height: size, ...style }}
        {...props}
      />
    );
  },
);
ShapedIcon.displayName = "ShapedIcon";

// --- 2. SHAPED CONTAINER (CSS clip-path mask) ---
export interface ShapedContainerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onError" | "onLoad"
> {
  shape: ShapeType;
  /** Width and height of the container. */
  size?: number | string;
  /** Duration in seconds for the morph animation */
  duration?: number;
  /** Easing curve for the morph */
  ease?: any;
  /** Class applied to the outer wrapper boundary */
  containerClassName?: string;
}

export const ShapedContainer = forwardRef<HTMLDivElement, ShapedContainerProps>(
  (
    {
      shape,
      size = "100%",
      duration = 0.8,
      ease = EASING.emphasized,
      className,
      containerClassName,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const uniqueId = useId();
    // Sanitize ID to prevent query selector issues
    const clipId = `clip-container-${uniqueId.replace(/:/g, "")}`;

    // -- MORPH STATE --
    const pathD = useMotionValue(SHAPE_PATHS[shape]);
    const progress = useMotionValue(0);
    const [currentShape, setCurrentShape] = useState(shape);
    const previousShape = useRef(shape);

    useEffect(() => {
      if (shape !== currentShape) {
        const startPath = SHAPE_PATHS[previousShape.current];
        const endPath = SHAPE_PATHS[shape];

        const interpolator = interpolate(startPath, endPath, {
          maxSegmentLength: 2,
        });

        progress.set(0);

        const playback = animate(progress, 1, {
          duration: duration,
          ease: ease,
          onUpdate: (latest) => {
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
      <div
        ref={ref}
        className={clsx(
          "relative isolate transition-all duration-300 overflow-visible aspect-square",
          containerClassName,
        )}
        style={{ width: size, height: size, ...style }}
        {...props}
      >
        {/* SVG defining the responsive clip-path */}
        <svg
          width="0"
          height="0"
          className="absolute pointer-events-none"
          style={{ position: "absolute", width: 0, height: 0 }}
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              {/* Magic scale factor: 1 / 380 = 0.002631578947368421 */}
              {/* Scales the 380x380 internal path to a fluid 0..1 bounding box */}
              <motion.path d={pathD} transform="scale(0.002631578947368421)" />
            </clipPath>
          </defs>
        </svg>

        {/* The actual HTML content (Clipped natively by CSS) */}
        <div
          className={clsx("w-full h-full", className)}
          style={{
            clipPath: `url(#${clipId})`,
            WebkitClipPath: `url(#${clipId})`,
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);
ShapedContainer.displayName = "ShapedContainer";

// --- 3. SHAPED IMAGE (FLUID MORPHING + ADVANCED EFFECTS) ---

export interface ShapedImageProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onError" | "onLoad"
> {
  shape: ShapeType;
  src: string;
  placeholderSrc?: string;
  alt?: string;
  size?: number | string;
  /** Duration in seconds for the morph animation */
  duration?: number;
  /** Easing curve for the morph */
  ease?: any;
  showSkeleton?: boolean;
  fallback?: React.ReactNode;
  effects?: ImageEffect[];
  zoomOnHover?: boolean;
  aspectRatio?: "auto" | "square" | "video" | "portrait" | "wide";
  variant?: "default" | "bordered" | "elevated";
}

export const ShapedImage = forwardRef<HTMLDivElement, ShapedImageProps>(
  (
    {
      shape,
      src,
      placeholderSrc,
      alt = "",
      size = "100%",
      duration = 0.8,
      ease = EASING.emphasized,
      showSkeleton = true,
      fallback,
      effects = [],
      zoomOnHover = false,
      aspectRatio = "auto",
      variant = "default",
      className,
      style,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">(
      "loading",
    );
    const [isZoomed, setIsZoomed] = useState(false);
    const uniqueId = useId();
    const maskId = `mask-${uniqueId}`;

    const hasInspect = effects.includes("inspect");
    const hasZoom = effects.includes("zoom");

    // -- INSPECT MODE STATE --
    const mouseX = useMotionValue(50);
    const mouseY = useMotionValue(50);
    const maskX = useSpring(mouseX, { stiffness: 200, damping: 25 });
    const maskY = useSpring(mouseY, { stiffness: 200, damping: 25 });
    const transformOrigin = useMotionTemplate`${maskX}% ${maskY}%`;
    const [isHovering, setIsHovering] = useState(false);

    // -- MORPH STATE --
    const pathD = useMotionValue(SHAPE_PATHS[shape]);
    const progress = useMotionValue(0);
    const [currentShape, setCurrentShape] = useState(shape);
    const previousShape = useRef(shape);

    useEffect(() => {
      if (shape !== currentShape) {
        const startPath = SHAPE_PATHS[previousShape.current];
        const endPath = SHAPE_PATHS[shape];

        const interpolator = interpolate(startPath, endPath, {
          maxSegmentLength: 2,
        });

        progress.set(0);

        const playback = animate(progress, 1, {
          duration: duration,
          ease: ease,
          onUpdate: (latest) => {
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

    // -- LOADING STATE --
    useEffect(() => {
      setStatus("loading");
      const img = new window.Image();
      img.src = src;
      img.onload = () => setStatus("loaded");
      img.onerror = () => setStatus("error");
    }, [src]);

    // -- ZOOM SCROLL LOCK --
    useEffect(() => {
      if (isZoomed) {
        document.body.style.overflow = "hidden";
        const handleEsc = (e: KeyboardEvent) => {
          if (e.key === "Escape") setIsZoomed(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => {
          document.body.style.overflow = "";
          window.removeEventListener("keydown", handleEsc);
        };
      }
    }, [isZoomed]);

    const isInteractive = !!onClick || zoomOnHover || hasZoom;
    const shouldRenderSkeleton =
      showSkeleton && status === "loading" && !placeholderSrc;

    // -- HANDLERS --
    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hasZoom && status === "loaded") {
        setIsZoomed(true);
      }
      onClick?.(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasInspect) return;
      const { left, top, width, height } =
        e.currentTarget.getBoundingClientRect();
      const xPercent = ((e.clientX - left) / width) * 100;
      const yPercent = ((e.clientY - top) / height) * 100;
      mouseX.set(xPercent);
      mouseY.set(yPercent);
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      if (!hasInspect) return;
      setIsHovering(false);
      mouseX.set(50);
      mouseY.set(50);
    };

    const renderMainImage = (isModal = false) => (
      <motion.svg
        layoutId={hasZoom ? `shaped-image-${uniqueId}` : undefined}
        viewBox="0 0 380 380"
        className={clsx(
          "block w-full h-full will-change-transform",
          "relative z-10",
          isModal && "max-h-[90vh] max-w-[90vw] cursor-default",
        )}
        initial={{ opacity: 0 }}
        animate={{
          opacity: status === "loaded" ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <defs>
          <mask id={isModal ? `${maskId}-modal` : maskId}>
            <motion.path
              className="will-change-transform transform-3d"
              d={pathD}
              fill="white"
            />
          </mask>
        </defs>

        <g mask={`url(#${isModal ? `${maskId}-modal` : maskId})`}>
          <motion.image
            href={src}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            style={{
              transformOrigin:
                hasInspect && !isModal ? transformOrigin : "center center",
            }}
            animate={{
              scale:
                hasInspect && isHovering && !isModal
                  ? 2
                  : zoomOnHover && !isModal && !hasInspect
                    ? 1.05
                    : 1,
            }}
            transition={{
              scale: {
                duration: hasInspect ? 0 : 0.5,
                ease: hasInspect ? "linear" : "easeOut",
              },
            }}
          />
        </g>

        {variant === "bordered" && (
          <motion.path
            d={pathD}
            fill="none"
            className="stroke-outline-variant stroke-[4px]"
          />
        )}
      </motion.svg>
    );

    return (
      <>
        {/* --- INLINE CONTAINER --- */}
        <div
          ref={ref}
          className={clsx(
            "relative isolate transition-all duration-300 overflow-visible",
            aspectRatio === "square" && "aspect-square",
            aspectRatio === "video" && "aspect-video",
            aspectRatio === "portrait" && "aspect-[3/4]",
            aspectRatio === "wide" && "aspect-[2/1]",
            hasInspect && "cursor-crosshair",
            hasZoom && "cursor-zoom-in",
            isInteractive &&
              "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            variant === "elevated" && "drop-shadow-md",
            isZoomed && "invisible",
            className,
          )}
          style={{ width: size, height: size, ...style }}
          onClick={handleContainerClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          tabIndex={isInteractive ? 0 : undefined}
          onKeyDown={(e) => {
            if (isInteractive && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              handleContainerClick(e as any);
            }
          }}
          {...props}
        >
          {/* SKELETON */}
          <AnimatePresence>
            {shouldRenderSkeleton && (
              <motion.svg
                viewBox="0 0 380 380"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 w-full h-full pointer-events-none animate-pulse"
              >
                <motion.path
                  d={pathD}
                  className="fill-surface-container-highest"
                />
              </motion.svg>
            )}
          </AnimatePresence>

          {/* ERROR STATE */}
          {status === "error" && (
            <motion.svg
              viewBox="0 0 380 380"
              className="absolute inset-0 z-20 w-full h-full"
            >
              <motion.path
                d={pathD}
                className="fill-surface-container-highest"
              />
              <foreignObject x="0" y="0" width="100%" height="100%">
                <div className="flex flex-col items-center justify-center w-full h-full text-on-surface-variant/50 p-4 text-center">
                  {fallback || (
                    <>
                      <ImageOff className="h-8 w-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium">
                        Failed to load
                      </span>
                    </>
                  )}
                </div>
              </foreignObject>
            </motion.svg>
          )}

          {/* BLUR-UP PLACEHOLDER */}
          {placeholderSrc && status !== "error" && (
            <motion.svg
              viewBox="0 0 380 380"
              className={clsx(
                "absolute inset-0 z-0",
                status === "loaded" ? "opacity-0" : "opacity-100",
              )}
              style={{ transition: "opacity 0.5s ease-out" }}
            >
              <defs>
                <mask id={`${maskId}-placeholder`}>
                  <motion.path d={pathD} fill="white" />
                </mask>
              </defs>
              <g mask={`url(#${maskId}-placeholder)`}>
                <image
                  href={placeholderSrc}
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  className="blur-xl scale-110"
                  style={{ transformOrigin: "center center" }}
                />
              </g>
            </motion.svg>
          )}

          {/* MAIN IMAGE (INLINE) */}
          {status !== "error" && renderMainImage(false)}
        </div>

        {/* --- ZOOM MODAL (PORTAL) --- */}
        {hasZoom && (
          <AnimatePresence>
            {isZoomed && (
              <Portal>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out"
                  onClick={() => setIsZoomed(false)}
                >
                  <button
                    className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsZoomed(false);
                    }}
                  >
                    <X size={24} />
                  </button>

                  <div
                    className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderMainImage(true)}
                  </div>
                </motion.div>
              </Portal>
            )}
          </AnimatePresence>
        )}
      </>
    );
  },
);

ShapedImage.displayName = "ShapedImage";

// --- PORTAL HELPER ---
const Portal = ({ children }: { children: React.ReactNode }) => {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
};

// --- 4. SHAPED ICON BUTTON ---

const shapedButtonVariants = cva(
  "group relative flex items-center justify-center cursor-pointer focus:outline-none transition-all duration-300 active:scale-95",
  {
    variants: {
      variant: {
        primary: "text-primary",
        secondary: "text-secondary-container",
        ghost: "text-transparent hover:text-secondary-container",
        destructive: "text-error",
      },
      size: {
        sm: "w-10 h-10",
        md: "w-14 h-14",
        lg: "w-20 h-20",
      },
      shadow: {
        none: "",
        sm: "drop-shadow-sm",
        md: "drop-shadow-md",
        lg: "drop-shadow-lg",
        xl: "drop-shadow-xl",
        "2xl": "drop-shadow-2xl",
        glow: "drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shadow: "none",
    },
  },
);

const getShapeMask = (shape: ShapeType) => {
  const path = SHAPE_PATHS[shape];
  const svg = `<svg viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg"><path d="${path}" /></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export interface ShapedIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "glow";
  shape: ShapeType;
  morphEase?: number[];
  morphDuration?: number;
}

export const ShapedIconButton = forwardRef<
  HTMLButtonElement,
  ShapedIconButtonProps
>(
  (
    {
      className,
      shape,
      variant,
      size,
      shadow,
      children,
      morphEase,
      morphDuration,
      style,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<HTMLButtonElement>(null);
    // @ts-ignore
    React.useImperativeHandle(ref, () => localRef.current!);
    const [, event] = useRipple({
      // @ts-ignore
      ref: localRef,
      color: "rgba(255, 255, 255, 0.3)",
      duration: 400,
    });

    const contentColorClass =
      variant === "primary" || variant === "destructive"
        ? "text-on-primary"
        : "text-on-secondary-container";

    const maskStyle = useMemo(() => {
      const maskImage = getShapeMask(shape);
      return {
        maskImage,
        maskSize: "100% 100%",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: maskImage,
        WebkitMaskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      } as React.CSSProperties;
    }, [shape]);

    return (
      <button
        ref={localRef}
        onPointerDown={event}
        className={clsx(
          shapedButtonVariants({ variant, size, shadow, className }),
        )}
        style={{
          ...style,
          ...maskStyle,
        }}
        {...props}
      >
        <Shape
          shape={shape}
          duration={morphDuration}
          ease={morphEase}
          className="absolute inset-0 w-full h-full fill-current transition-colors duration-300"
        />
        <div className={clsx("relative z-10", contentColorClass)}>
          {children}
        </div>
      </button>
    );
  },
);
ShapedIconButton.displayName = "ShapedIconButton";

// --- 5. SHAPED BADGE ---

const shapedBadgeVariants = cva(
  "relative inline-flex items-center justify-center font-bold select-none transition-all duration-300",
  {
    variants: {
      variant: {
        primary: "text-primary",
        secondary: "text-secondary-container",
        destructive: "text-error",
        outline: "text-transparent stroke-outline stroke-2",
      },
      size: {
        sm: "w-6 h-6 text-[10px]",
        md: "w-8 h-8 text-xs",
        lg: "w-12 h-12 text-sm",
      },
      shadow: {
        none: "",
        sm: "drop-shadow-sm",
        md: "drop-shadow-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      shadow: "none",
    },
  },
);

export interface ShapedBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md";
  shape: ShapeType;
}

export const ShapedBadge = forwardRef<HTMLDivElement, ShapedBadgeProps>(
  ({ className, shape, variant, size, shadow, children, ...props }, ref) => {
    const contentColorClass =
      variant === "primary" || variant === "destructive"
        ? "text-on-primary"
        : variant === "outline"
          ? "text-on-surface"
          : "text-on-secondary-container";

    const isOutline = variant === "outline";

    return (
      <div
        ref={ref}
        className={clsx(
          shapedBadgeVariants({ variant, size, shadow, className }),
        )}
        {...props}
      >
        <Shape
          shape={shape}
          className={clsx(
            "absolute inset-0 w-full h-full",
            isOutline
              ? "fill-transparent stroke-current stroke-[20px]"
              : "fill-current",
          )}
        />
        <span className={clsx("relative z-10", contentColorClass)}>
          {children}
        </span>
      </div>
    );
  },
);
ShapedBadge.displayName = "ShapedBadge";

// --- 6. SHAPED BUTTON (Alias) ---
export const ShapedButton = ShapedIconButton;
