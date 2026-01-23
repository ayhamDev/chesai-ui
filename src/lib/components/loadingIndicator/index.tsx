import { clsx } from "clsx";
import React from "react";
import { MaterialMorph } from "./MaterialMorph";

export interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "material-morph" // Add new variant
    | "material-morph-background";
  isPlaying?: boolean;
}

// Path data for a continuous sine-wave circle (8 waves)

export const LoadingIndicator = React.forwardRef<
  HTMLDivElement,
  LoadingIndicatorProps
>(
  (
    { variant = "linear-straight", isPlaying = true, className, ...props },
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

        default:
          return null;
      }
    };

    return renderVariant();
  },
);

LoadingIndicator.displayName = "LoadingIndicator";
