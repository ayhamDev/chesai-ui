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
  thickness: { sm: 1.5, md: 2.5, lg: 4 },
  length: { sm: 12, md: 20, lg: 32 },
  amplitude: { sm: 3, md: 5, lg: 8 },
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
      solid: "bg-current border-transparent",
      dashed: "bg-transparent border-current",
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

  const trackSize = amplitude * 2 + strokeWidth * 2;
  const mid = trackSize / 2;

  if (orientation === "vertical") {
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
          role="img"
        >
          <title>Vertical wavy divider</title>
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
        role="img"
      >
        <title>Horizontal wavy divider</title>
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
    Omit<VariantProps<typeof dividerContainerVariants>, "color"> {
  variant?: "solid" | "dashed" | "dotted";
  shape?: "regular" | "wavy";
  size?: "sm" | "md" | "lg";
  waveSize?: "sm" | "md" | "lg";
  textAlign?: "start" | "center" | "end";
  // Explicitly type color to match the CVA keys, handling nullable from VariantProps
  color?: "default" | "primary" | "secondary" | "tertiary" | "error";
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
    const effectiveOrientation = orientation || "horizontal";

    const renderLine = () => {
      if (shape === "wavy") {
        return (
          <WavyLine
            orientation={effectiveOrientation}
            size={size || "sm"}
            waveSize={waveSize}
          />
        );
      }

      // @ts-ignore - indexing constant map
      const thicknessClass =
        solidThicknessMap[effectiveOrientation][size || "sm"];
      const isBorderBased = variant === "dashed" || variant === "dotted";
      const finalSizeClass = isBorderBased
        ? thicknessClass
        : thicknessClass.split(" ")[0];

      return (
        <div className={clsx(solidLineVariants({ variant }), finalSizeClass)} />
      );
    };

    // biome-ignore lint/a11y/useFocusableInteractive: This is a static separator, standard practice.
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={effectiveOrientation}
        className={clsx(
          dividerContainerVariants({
            orientation: effectiveOrientation,
            color,
          }),
          hasContent && "gap-4",
          className,
        )}
        {...props}
      >
        {(!hasContent ||
          (effectiveOrientation === "horizontal" &&
            (textAlign === "center" || textAlign === "end")) ||
          effectiveOrientation === "vertical") &&
          renderLine()}

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

        {hasContent &&
          ((effectiveOrientation === "horizontal" &&
            (textAlign === "center" || textAlign === "start")) ||
            effectiveOrientation === "vertical") &&
          renderLine()}
      </div>
    );
  },
);

Divider.displayName = "Divider";
