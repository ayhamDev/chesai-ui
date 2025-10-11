import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";
import { useAppBar } from "../../hooks/useAppBar";

const appBarVariants = cva(
  "absolute top-0 z-40 w-full transition-[colors,box-shadow] duration-300 ease-in-out",
  {
    variants: {
      appBarColor: {
        background: "bg-graphite-background text-graphite-foreground",
        card: "bg-graphite-card text-graphite-foreground",
        primary: "bg-graphite-primary text-graphite-primaryForeground",
        secondary: "bg-graphite-secondary text-graphite-secondaryForeground",
      },
      shadow: {
        none: "shadow-none",
        md: "shadow-sm",
      },
    },
    defaultVariants: {
      appBarColor: "card",
      shadow: "none",
    },
  }
);

export interface AppBarSharedProps {
  scrollBehavior?: "sticky" | "conditionally-sticky";
  animatedBehavior?: Array<"none" | "appbar-color" | "fold" | "shadow">;
  animatedColor?: "background" | "card" | "primary" | "secondary";
  size?: "md" | "lg";
  largeHeaderContent?: React.ReactNode;
  smallHeaderContent?: React.ReactNode;
  stickyHideTarget?: "main-row" | "full-appbar";
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  // --- NEW CUSTOMIZABLE PROPS ---
  /** The height of the main app bar row in its normal (md) or collapsed state. @default 64 */
  normalHeaderRowHeight?: number;
  /** The height of the main app bar row in its large (lg) expanded state. @default 96 */
  largeHeaderRowHeight?: number;
  /** The scroll distance over which the "fold" animation occurs. @default 50 */
  foldAnimationDistance?: number;
  /** The border-radius applied at the end of the "fold" animation. @default 24 */
  foldBorderRadius?: number;
}

export interface AppBarProps
  extends Omit<HTMLMotionProps<"header">, "color" | "size">,
    VariantProps<typeof appBarVariants>,
    AppBarSharedProps {
  startAdornment?: React.ReactNode;
  centerAdornment?: React.ReactNode;
  endAdornments?: React.ReactNode[];
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
      // --- DESTRUCTURE NEW PROPS ---
      normalHeaderRowHeight,
      largeHeaderRowHeight,
      foldAnimationDistance,
      foldBorderRadius,
      ...rest
    },
    ref
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
      // --- PASS NEW PROPS TO HOOK ---
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

    return (
      <motion.header
        ref={ref}
        className={clsx(
          appBarVariants({
            appBarColor: finalColor,
            shadow: finalShadow,
            className,
          }),
          (isCollapsible || animatedBehavior?.includes("fold")) &&
            "overflow-hidden"
        )}
        {...headerProps}
        {...rest}
      >
        <motion.div {...mainRowProps} className="flex w-full items-center">
          <div className="flex flex-1 items-center gap-2 px-4 min-w-0">
            {startAdornment && (
              <div className="flex justify-center items-center min-w-max">
                {startAdornment}
              </div>
            )}
            <div className="min-w-0 relative flex-1">
              <motion.div {...childrenContainerProps}>{children}</motion.div>
              {isCollapsible && (
                <motion.div
                  {...smallHeaderProps}
                  className="absolute inset-0 flex items-center"
                >
                  {smallHeaderContent}
                </motion.div>
              )}
            </div>
          </div>
          {centerAdornment && (
            <div className="flex justify-center items-center min-w-max flex-1 ">
              {centerAdornment}
            </div>
          )}
          <div className="flex items-center justify-end gap-1 px-4">
            {endAdornments}
          </div>
        </motion.div>

        {shouldRenderLargeContent && (
          <motion.div {...largeContentProps} className="px-4 pb-4">
            {largeHeaderContent}
          </motion.div>
        )}
      </motion.header>
    );
  }
);
AppBarRoot.displayName = "AppBar";

export const AppBar = AppBarRoot;
