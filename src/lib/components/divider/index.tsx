"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React, { useId } from "react";
import { Typography } from "../typography";

// --- CONFIG ---

const solidThicknessMap = {
  horizontal: {
    sm: "h-px border-b",
    md: "h-[2px] border-b-2",
    lg: "h-[4px] border-b-4",
  },
  vertical: {
    sm: "w-px border-r",
    md: "w-[2px] border-r-2",
    lg: "w-[4px] border-r-4",
  },
};

const wavyConfig = {
  // Stroke width of the SVG path
  thickness: {
    sm: 1.5,
    md: 2.5,
    lg: 4,
  },
  // Length of one wave cycle (pattern width)
  length: {
    sm: 12, // Tighter waves
    md: 20, // Standard
    lg: 32, // Wide, relaxed waves
  },
  // Amplitude (Height of the wave peak from center)
  amplitude: {
    sm: 3,
    md: 5,
    lg: 8,
  },
};

// --- VARIANTS ---

const dividerContainerVariants = cva("flex items-center shrink-0 w-full", {
  variants: {
    orientation: {
      horizontal: "flex-row my-4",
      vertical: "flex-col mx-4 self-stretch h-auto min-h-[1em]",
    },
    color: {
      default: "text-outline-variant",
      primary: "text-primary",
      secondary: "text-secondary",
      tertiary: "text-tertiary",
      error: "text-error",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    color: "default",
  },
});

const solidLineVariants = cva("flex-1", {
  variants: {
    variant: {
      solid: "bg-current border-transparent", // Background handles thickness for solid
      dashed: "bg-transparent border-current", // Border handles thickness/style for dashed
      dotted: "bg-transparent border-current border-dotted",
    },
  },
  defaultVariants: {
    variant: "solid",
  },
});

// --- SUB-COMPONENT: WAVY LINE (SVG) ---

const WavyLine = ({
  orientation,
  size = "sm",
  waveSize = "md",
}: {
  orientation: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  waveSize?: "sm" | "md" | "lg";
}) => {
  const uniqueId = useId();
  const patternId = `wavy-pattern-${uniqueId}`;

  const strokeWidth = wavyConfig.thickness[size];
  const length = wavyConfig.length[waveSize];
  const amplitude = wavyConfig.amplitude[waveSize];

  // Calculate SVG container dimensions to prevent clipping
  // Height needs to be (amplitude * 2) + padding for stroke width
  const trackSize = amplitude * 2 + strokeWidth * 2;
  const mid = trackSize / 2;

  // Vertical Wavy Line
  if (orientation === "vertical") {
    // Generate Path: M {mid} 0 Q {mid+amp} {len/4} {mid} {len/2} T {mid} {len}
    // Rotated 90deg logic for vertical flow
    const d = `M ${mid} 0 Q ${mid + amplitude} ${length / 4} ${mid} ${length / 2} T ${mid} ${length}`;

    return (
      <div
        className="h-full flex justify-center overflow-hidden"
        style={{ width: trackSize }}
      >
        <svg
          height="100%"
          width={trackSize}
          className="stroke-current text-inherit block"
        >
          <defs>
            <pattern
              id={patternId}
              x="0"
              y="0"
              width={trackSize}
              height={length}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={d}
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={`url(#${patternId})`}
            stroke="none"
          />
        </svg>
      </div>
    );
  }

  // Horizontal Wavy Line (Default)
  // Path: M 0 {mid} Q {len/4} {mid-amp} {len/2} {mid} T {len} {mid}
  const d = `M 0 ${mid} Q ${length / 4} ${mid - amplitude} ${length / 2} ${mid} T ${length} ${mid}`;

  return (
    <div
      className="w-full flex items-center overflow-hidden"
      style={{ height: trackSize }}
    >
      <svg
        width="100%"
        height={trackSize}
        className="stroke-current text-inherit block"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={length}
            height={trackSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={d}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${patternId})`}
          stroke="none"
        />
      </svg>
    </div>
  );
};

// --- MAIN COMPONENT ---

export interface DividerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerContainerVariants> {
  variant?: "solid" | "dashed" | "dotted";
  shape?: "regular" | "wavy";
  /** Thickness of the line */
  size?: "sm" | "md" | "lg";
  /** Length/Width of the wave cycles (only for shape="wavy") */
  waveSize?: "sm" | "md" | "lg";
  textAlign?: "start" | "center" | "end";
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      className,
      orientation = "horizontal",
      variant = "solid",
      shape = "regular",
      color = "default",
      size = "sm",
      waveSize = "md",
      textAlign = "center",
      children,
      ...props
    },
    ref,
  ) => {
    const hasContent = React.Children.count(children) > 0;

    // Helper to render the specific line type
    const renderLine = () => {
      if (shape === "wavy") {
        return (
          <WavyLine
            orientation={orientation || "horizontal"}
            size={size}
            waveSize={waveSize}
          />
        );
      }

      // Resolve solid/dashed classes based on orientation and size
      const thicknessClass =
        solidThicknessMap[orientation || "horizontal"][size];

      // For 'solid', we usually use background color for the line (div height).
      // For 'dashed'/'dotted', we must use borders.
      const isBorderBased = variant === "dashed" || variant === "dotted";

      // If solid, we remove the border class from the thickness map and just use dimensions + bg
      // If dashed/dotted, we keep the border class.
      const finalSizeClass = isBorderBased
        ? thicknessClass
        : thicknessClass.split(" ")[0]; // Take only w- or h- class, drop border-

      return (
        <div className={clsx(solidLineVariants({ variant }), finalSizeClass)} />
      );
    };

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={clsx(
          dividerContainerVariants({ orientation, color }),
          hasContent && "gap-4",
          className,
        )}
        {...props}
      >
        {/* Left/Top Line */}
        {(!hasContent ||
          (orientation === "horizontal" &&
            (textAlign === "center" || textAlign === "end")) ||
          orientation === "vertical") &&
          renderLine()}

        {/* Content */}
        {hasContent && (
          <span className="shrink-0 max-w-[80%]">
            {typeof children === "string" ? (
              <Typography
                variant="body-small"
                className="font-medium text-inherit opacity-80"
              >
                {children}
              </Typography>
            ) : (
              children
            )}
          </span>
        )}

        {/* Right/Bottom Line */}
        {hasContent &&
          ((orientation === "horizontal" &&
            (textAlign === "center" || textAlign === "start")) ||
            orientation === "vertical") &&
          renderLine()}
      </div>
    );
  },
);

Divider.displayName = "Divider";
