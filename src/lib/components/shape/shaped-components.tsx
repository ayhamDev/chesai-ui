"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { interpolate } from "flubber";
import { animate, motion, useMotionValue } from "framer-motion";
import React, {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import useRipple from "use-ripple-hook";
import { Shape } from "./index";
import { SHAPE_PATHS, type ShapeType } from "./paths";

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

// --- 2. SHAPED IMAGE (FLUID MORPHING) ---
export interface ShapedImageProps extends React.SVGProps<SVGSVGElement> {
  shape: ShapeType;
  src: string;
  alt?: string;
  size?: number | string;
  /** Duration in seconds for the morph animation */
  duration?: number;
}

export const ShapedImage = forwardRef<SVGSVGElement, ShapedImageProps>(
  (
    {
      shape,
      src,
      alt,
      size = "100%",
      duration = 0.8,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const uniqueId = useId();
    const maskId = `mask-${uniqueId}`;

    // --- Animation Logic (Same as Shape component) ---
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
          ease: [0.2, 0, 0, 1], // MD3 Emphasized Ease
          onUpdate: (latest) => {
            pathD.set(interpolator(latest));
          },
          onComplete: () => {
            previousShape.current = shape;
            setCurrentShape(shape);
          },
        });

        return () => playback.stop();
      }
    }, [shape, currentShape, duration, pathD, progress]);

    return (
      <svg
        ref={ref}
        viewBox="0 0 380 380"
        xmlns="http://www.w3.org/2000/svg"
        className={clsx("block", className)}
        style={{
          width: size,
          height: size,
          ...style,
        }}
        {...props}
      >
        <defs>
          <mask id={maskId}>
            {/* The white fill defines the visible area */}
            <motion.path
              className={"will-change-transform transform-3d"}
              d={pathD}
              fill="white"
            />
          </mask>
        </defs>

        {/* The image masked by the morphing path */}
        <image
          href={src}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          mask={`url(#${maskId})`}
        />
      </svg>
    );
  },
);
ShapedImage.displayName = "ShapedImage";

// --- 3. SHAPED ICON BUTTON ---

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

// To fix the button ripple, we still need the CSS mask approach
// because standard buttons can't use SVG <mask> for HTML content easily.
// However, since we are just clipping the ripple (which is usually circular),
// CSS mask-image is acceptable for buttons, even if it snaps.
// If you want fluid morphing on buttons too, the button would need to be SVG-based
// which makes handling children (text/icons) much harder.
const getShapeMask = (shape: ShapeType) => {
  const path = SHAPE_PATHS[shape];
  const svg = `<svg viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg"><path d="${path}" /></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export interface ShapedIconButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shapedButtonVariants> {
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

// --- 4. SHAPED BADGE ---

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

export interface ShapedBadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shapedBadgeVariants> {
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

// --- 5. SHAPED BUTTON (Alias) ---
export const ShapedButton = ShapedIconButton;
