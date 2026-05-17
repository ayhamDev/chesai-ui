import { clsx } from "clsx";
import React from "react";
import { MaterialMorph } from "./MaterialMorph";

export interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "material-morph" | "material-morph-background";
  isPlaying?: boolean;
  /** The initial shape index (0 to 6) for material-morph variants */
  startingShape?: number;
}

export const LoadingIndicator = React.forwardRef<
  HTMLDivElement,
  LoadingIndicatorProps
>(
  (
    {
      variant = "linear-straight",
      isPlaying = true,
      startingShape,
      className,
      ...props
    },
    ref,
  ) => {
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
                startingShape={startingShape}
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
                startingShape={startingShape}
                className="w-full h-full"
              />
            </div>
          );

        default:
          return null;
      }
    };

    return renderVariant();
  },
);

LoadingIndicator.displayName = "LoadingIndicator";
