import { clsx } from "clsx";
import React from "react";
import { MaterialMorph } from "./MaterialMorph";

export interface LoadingIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "linear-straight"
    | "linear-wavy"
    | "circular-straight"
    | "circular-wavy"
    | "material-morph" // Add new variant
    | "material-morph-background";
  thickness?: "normal" | "thick";
  isPlaying?: boolean;
}

// Path data for a continuous sine-wave circle (8 waves)
const WAVY_CIRCLE_PATH =
  "M24,2.5c2.6,0,3.6,3.7,6.1,3.7c2.5,0,4.8-2.6,6.8-1.1c2,1.5,0.7,5.1,2,7.2c1.3,2.1,5.3,1.9,5.8,4.3c0.5,2.4-2.8,4.6-2.8,7.1c0,2.5,3.3,4.7,2.8,7.1c-0.5,2.4-4.5,2.2-5.8,4.3c-1.3,2.1,0,5.7-2,7.2c-2,1.5-4.3-1.1-6.8-1.1c-2.5,0-3.5,3.7-6.1,3.7s-3.6-3.7-6.1-3.7c-2.5,0-4.8,2.6-6.8,1.1c-2-1.5-0.7-5.1-2-7.2c-1.3-2.1-5.3-1.9-5.8-4.3c-0.5-2.4,2.8-4.6,2.8-7.1c0-2.5-3.3-4.7-2.8-7.1c0.5-2.4,4.5-2.2,5.8-4.3c1.3-2.1,0-5.7,2-7.2c2-1.5,4.3,1.1,6.8,1.1C20.4,6.2,21.4,2.5,24,2.5z";

export const LoadingIndicator = React.forwardRef<
  HTMLDivElement,
  LoadingIndicatorProps
>(
  (
    {
      variant = "linear-straight",
      thickness = "normal",
      isPlaying = true,
      className,
      ...props
    },
    ref
  ) => {
    const strokeWidth = thickness === "thick" ? 4.5 : 3.5;
    const strokeProgressWidth = thickness === "thick" ? 4.5 : 3.5;
    const linearHeight = thickness === "thick" ? "h-1.5" : "h-1";
    const linearProgressHeight = thickness === "thick" ? "h-2.5" : "h-1.5";

    // Shared container styles
    const baseClasses = clsx("relative text-graphite-foreground", className);

    const renderVariant = () => {
      switch (variant) {
        case "material-morph-background":
          return (
            <div
              ref={ref}
              className={clsx(baseClasses, "w-12 h-12 text-graphite-primary")}
              role="progressbar"
              {...props}
            >
              <MaterialMorph
                isPlaying={isPlaying}
                background={true}
                className="w-full h-full"
              />
            </div>
          );
        case "material-morph":
          return (
            <div
              ref={ref}
              className={clsx(baseClasses, "w-12 h-12 text-graphite-primary")}
              role="progressbar"
              {...props}
            >
              <MaterialMorph
                isPlaying={isPlaying}
                background={false}
                className="w-full h-full"
              />
            </div>
          );

        case "linear-straight":
          return (
            <div
              ref={ref}
              className={clsx(
                baseClasses,
                linearHeight,
                "w-48 rounded-full overflow-hidden bg-graphite-secondary"
              )}
              role="progressbar"
              {...props}
            >
              <div className="absolute top-0 h-full w-2/5 bg-graphite-primary rounded-full animate-loading-linear" />
            </div>
          );

        case "linear-wavy":
          return (
            <div
              ref={ref}
              className={baseClasses}
              role="progressbar"
              {...props}
            >
              <svg
                width="200"
                height="12"
                viewBox="0 0 200 10"
                className="overflow-visible w-full"
              >
                <defs>
                  <path
                    id="wavy-path-linear"
                    d="M 0,5 C 20,0, 20,10, 40,5 S 60,0, 80,5 S 100,10, 120,5 S 140,0, 160,5 S 180,10, 200,5"
                    fill="none"
                  />
                </defs>
                {/* Background Track */}
                <use
                  href="#wavy-path-linear"
                  className="stroke-graphite-secondary"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Moving Indicator */}
                <use
                  href="#wavy-path-linear"
                  className="stroke-graphite-primary animate-loading-wavy "
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="40 200"
                />
              </svg>
            </div>
          );

        case "circular-straight":
          return (
            <div
              ref={ref}
              className={clsx(
                baseClasses,
                "w-10 h-10 animate-loading-circular"
              )}
              role="progressbar"
              {...props}
            >
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  className="stroke-graphite-secondary"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  className="stroke-graphite-primary"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray="100 200"
                />
              </svg>
            </div>
          );

        case "circular-wavy":
          return (
            <div
              ref={ref}
              className={clsx(
                baseClasses,
                "w-12 h-12  animate-loading-circular-slow"
              )}
              role="progressbar"
              {...props}
            >
              <svg
                // Expanded viewBox (-4 to 56) provides padding to prevent the thick stroke
                // from being clipped at the edges of the container.
                viewBox="-4 -4 56 56"
                className="w-full h-full"
              >
                {/* Static Background Track */}
                <path
                  d={WAVY_CIRCLE_PATH}
                  fill="none"
                  className="stroke-graphite-secondary"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />

                {/* Crawling Indicator */}
                <path
                  d={WAVY_CIRCLE_PATH}
                  fill="none"
                  className="stroke-graphite-primary animate-loading-circular-wavy-crawl"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  // 35px visible dash, 98px gap. Total = 133px (Matches Path Length for smooth loop)
                  strokeDasharray="35 98"
                />
              </svg>
            </div>
          );

        default:
          return null;
      }
    };

    return renderVariant();
  }
);

LoadingIndicator.displayName = "LoadingIndicator";
