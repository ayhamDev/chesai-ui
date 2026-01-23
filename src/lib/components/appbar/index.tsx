import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";
import { useAppBar } from "../../hooks/useAppBar";

// --- MD3 AppBar Variants ---
const appBarVariants = cva(
  "absolute top-0 z-40 w-full transition-[background-color,box-shadow,color] duration-300 ease-in-out font-manrope",
  {
    variants: {
      appBarColor: {
        // MD3: Default state (Surface)
        background: "bg-surface text-on-surface",
        // MD3: Scrolled state (Surface Container) - Distinct from background
        "surface-container": "bg-surface-container text-on-surface",
        // Legacy / Alternative options
        card: "bg-surface-container-low text-on-surface",
        primary: "bg-primary text-on-primary",
        secondary: "bg-secondary-container text-on-secondary-container",
        transparent: "bg-transparent text-on-surface",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
      },
    },
    defaultVariants: {
      appBarColor: "surface-container", // Default to the container color for better initial contrast
      shadow: "none",
    },
  },
);

export interface AppBarSharedProps {
  appBarColor?:
    | "background"
    | "surface-container"
    | "card"
    | "primary"
    | "secondary"
    | "transparent";
  scrollBehavior?: "sticky" | "conditionally-sticky";
  animatedBehavior?: Array<"none" | "appbar-color" | "fold" | "shadow">;
  animatedColor?:
    | "background"
    | "surface-container"
    | "card"
    | "primary"
    | "secondary"
    | "transparent";
  size?: "md" | "lg";
  largeHeaderContent?: React.ReactNode;
  smallHeaderContent?: React.ReactNode;
  stickyHideTarget?: "main-row" | "full-appbar";
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  normalHeaderRowHeight?: number;
  largeHeaderRowHeight?: number;
  foldAnimationDistance?: number;
  foldBorderRadius?: number;
  routeKey?: string;
}

export interface AppBarProps
  extends Omit<HTMLMotionProps<"header">, "color" | "size">, AppBarSharedProps {
  shadow?: "none" | "sm" | "md";
  startAdornment?: React.ReactNode;
  centerAdornment?: React.ReactNode;
  endAdornments?: React.ReactNode[];
  /**
   * If true, the title will be centered in the row.
   * Standard for the "Center-aligned top app bar" in MD3.
   */
  centerTitle?: boolean;
}

const AppBarRoot = React.forwardRef<HTMLElement, AppBarProps>(
  (
    {
      className,
      children,
      startAdornment,
      centerAdornment,
      endAdornments = [],
      appBarColor,
      scrollBehavior,
      animatedBehavior,
      animatedColor,
      size,
      largeHeaderContent,
      smallHeaderContent,
      stickyHideTarget,
      scrollContainerRef,
      routeKey,
      normalHeaderRowHeight = 64, // MD3 Default Height
      largeHeaderRowHeight,
      foldAnimationDistance,
      foldBorderRadius,
      centerTitle = false,
      ...rest
    },
    ref,
  ) => {
    const hookProps = {
      appBarColor,
      scrollBehavior,
      animatedBehavior,
      animatedColor,
      size,
      largeHeaderContent,
      smallHeaderContent,
      stickyHideTarget,
      scrollContainerRef,
      routeKey,
      normalHeaderRowHeight,
      largeHeaderRowHeight,
      foldAnimationDistance,
      foldBorderRadius,
    };

    const {
      headerProps,
      mainRowProps,
      largeContentProps,
      childrenContainerProps,
      smallHeaderProps,
      finalColor,
      finalShadow,
      isCollapsible,
      shouldRenderLargeContent,
    } = useAppBar(hookProps);

    // Apply the min-height to the main row to match MD3 specs
    const rowHeightClass = `min-h-[${normalHeaderRowHeight}px]`;

    return (
      <motion.header
        ref={ref}
        className={clsx(
          appBarVariants({
            appBarColor: finalColor as any,
            shadow: finalShadow as any,
            className,
          }),
          (isCollapsible || animatedBehavior?.includes("fold")) &&
            "overflow-hidden",
        )}
        {...headerProps}
        {...rest}
      >
        <motion.div
          {...mainRowProps}
          className={clsx(
            "relative flex w-full items-center px-4 md:px-5", // MD3 Padding
            rowHeightClass,
          )}
        >
          {/* Left Section: Nav Icon + Title (if not centered) */}
          <div className="flex flex-1 items-center gap-4 min-w-0 z-10">
            {startAdornment && (
              <div className="flex shrink-0 items-center justify-center -ml-2 text-inherit">
                {/* -ml-2 compensates for standard IconButton padding to align visually with grid */}
                {startAdornment}
              </div>
            )}

            {!centerTitle && (
              <div className="flex-1 min-w-0 relative h-full flex items-center">
                <motion.div
                  {...childrenContainerProps}
                  className="w-full truncate text-left text-[22px] font-normal leading-7"
                >
                  {children}
                </motion.div>
                {isCollapsible && (
                  <motion.div
                    {...smallHeaderProps}
                    className="absolute inset-0 flex items-center text-[22px] font-normal leading-7 truncate"
                  >
                    {smallHeaderContent}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Center Title (Absolute Positioned for perfect centering) */}
          {centerTitle && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-16">
              <div className="pointer-events-auto min-w-0 truncate">
                <motion.div
                  {...childrenContainerProps}
                  className="text-[22px] font-normal leading-7 text-center truncate"
                >
                  {children}
                </motion.div>
                {isCollapsible && (
                  <motion.div
                    {...smallHeaderProps}
                    className="absolute inset-0 flex items-center justify-center text-[22px] font-normal leading-7 truncate"
                  >
                    {smallHeaderContent}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Center Adornment Slot (Custom use cases) */}
          {centerAdornment && (
            <div className="flex shrink-0 items-center justify-center px-2 z-10">
              {centerAdornment}
            </div>
          )}

          {/* Right Section: Actions */}
          <div className="flex shrink-0 items-center justify-end gap-1 z-10 -mr-2">
            {/* -mr-2 aligns last icon visually to grid */}
            {endAdornments}
          </div>
        </motion.div>

        {shouldRenderLargeContent && (
          <motion.div
            {...largeContentProps}
            className="px-4 pb-6 md:px-5" // MD3 Padding for large content
          >
            {largeHeaderContent}
          </motion.div>
        )}
      </motion.header>
    );
  },
);
AppBarRoot.displayName = "AppBar";

export const AppBar = AppBarRoot;
