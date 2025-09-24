"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React, { createContext, useContext } from "react";
import { Drawer as VaulDrawer } from "vaul";

// --- Context (Unchanged) ---
interface SheetContextProps {
  mode: "normal" | "detached";
  shape: "full" | "minimal" | "sharp";
  hasSnapPoints: boolean;
  direction: "top" | "bottom" | "left" | "right";
}

const SheetContext = createContext<SheetContextProps>({
  mode: "normal",
  shape: "full",
  hasSnapPoints: false,
  direction: "bottom",
});

const useSheetContext = () => useContext(SheetContext);

// --- MODIFIED: Root Component ---
// Added the `forceBottomSheet` prop.
type SheetProps = React.ComponentProps<typeof VaulDrawer.Root> & {
  mode?: "normal" | "detached";
  shape?: "full" | "minimal" | "sharp";
  side?: "left" | "right";
  /**
   * If true, the sheet will always render as a bottom sheet,
   * overriding the responsive behavior on desktop viewports.
   * @default false
   */
  forceBottomSheet?: boolean; // --- THIS IS THE NEW PROP ---
};

const SheetRoot: React.FC<SheetProps> = ({
  mode = "normal",
  shape = "full",
  side = "right",
  forceBottomSheet = false, // --- NEW PROP WITH DEFAULT ---
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  ...props
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // --- MODIFIED LOGIC ---
  // Determine if we should render as a side sheet. This is only true if:
  // 1. The viewport is desktop-sized.
  // 2. The `forceBottomSheet` prop is false.
  const renderAsSideSheet = isDesktop && !forceBottomSheet;

  const direction = renderAsSideSheet ? side : "bottom";
  // --- END OF MODIFIED LOGIC ---

  return (
    <SheetContext.Provider
      value={{
        mode,
        shape,
        // Disable snap points if we are rendering as a side sheet
        hasSnapPoints: renderAsSideSheet
          ? false
          : !!snapPoints && snapPoints.length > 0,
        direction,
      }}
    >
      <VaulDrawer.Root
        direction={direction}
        {...props}
        // Pass snap points only when not rendering as a side sheet
        snapPoints={renderAsSideSheet ? undefined : snapPoints}
        activeSnapPoint={renderAsSideSheet ? undefined : activeSnapPoint}
        setActiveSnapPoint={renderAsSideSheet ? undefined : setActiveSnapPoint}
      />
    </SheetContext.Provider>
  );
};
SheetRoot.displayName = "Sheet";

// --- RE-EXPORTED PRIMITIVES (Unchanged) ---
const SheetTrigger = VaulDrawer.Trigger;
const SheetClose = VaulDrawer.Close;
const SheetPortal = VaulDrawer.Portal;
const SheetTitle = VaulDrawer.Title;
const SheetDescription = VaulDrawer.Description;

// --- CONTENT & OTHER COMPONENTS (Unchanged) ---
// (Your existing SheetContent, SheetHeader, SheetFooter, and SheetGrabber code remains here)
const contentVariants = cva(
  "fixed z-50 flex flex-col bg-graphite-card shadow-lg",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0",
        bottom: "inset-x-0 bottom-0 max-h-[96%]",
        left: "inset-y-0 left-0 w-full max-w-sm",
        right: "inset-y-0 right-0 w-full max-w-sm",
      },
      height: {
        snap: "h-full",
        auto: "h-auto",
      },
      shape: {
        full: "",
        minimal: "",
        sharp: "",
      },
      mode: {
        normal: "",
        detached: "",
      },
    },
    compoundVariants: [
      { side: "bottom", mode: "normal", className: "mx-auto max-w-xl" },
      {
        side: "bottom",
        mode: "detached",
        className: "inset-x-4 bottom-4 mx-auto max-w-lg",
      },
      {
        side: "bottom",
        mode: "normal",
        shape: "full",
        className: "rounded-t-3xl",
      },
      {
        side: "bottom",
        mode: "normal",
        shape: "minimal",
        className: "rounded-t-lg",
      },
      {
        side: "bottom",
        mode: "normal",
        shape: "sharp",
        className: "rounded-t-none",
      },
      {
        side: "bottom",
        mode: "detached",
        shape: "full",
        className: "rounded-2xl",
      },
      {
        side: "bottom",
        mode: "detached",
        shape: "minimal",
        className: "rounded-lg",
      },
      {
        side: "bottom",
        mode: "detached",
        shape: "sharp",
        className: "rounded-none",
      },
      {
        side: "left",
        shape: "full",
        mode: "normal",
        className: "rounded-r-2xl",
      },
      {
        side: "left",
        shape: "minimal",
        mode: "normal",
        className: "rounded-r-lg",
      },
      {
        side: "left",
        shape: "sharp",
        mode: "normal",
        className: "rounded-r-none",
      },
      {
        side: "left",
        shape: "full",
        mode: "detached",
        className: "left-4 rounded-2xl",
      },
      {
        side: "left",
        shape: "minimal",
        mode: "detached",
        className: "left-4 rounded-lg",
      },
      {
        side: "left",
        shape: "sharp",
        mode: "detached",
        className: "left-4 rounded-none",
      },
      {
        side: "right",
        shape: "full",
        mode: "normal",
        className: "rounded-l-2xl",
      },
      {
        side: "right",
        shape: "minimal",
        mode: "normal",
        className: "rounded-l-lg",
      },
      {
        side: "right",
        shape: "sharp",
        mode: "normal",
        className: "rounded-l-none",
      },
      {
        side: "right",
        shape: "full",
        mode: "detached",
        className: "top-4 bottom-4 right-4 rounded-2xl",
      },
      {
        side: "right",
        shape: "minimal",
        mode: "detached",
        className: "top-4 bottom-4 right-4 rounded-lg",
      },
      {
        side: "right",
        shape: "sharp",
        mode: "detached",
        className: "top-4 bottom-4 right-4 rounded-none",
      },
    ],
    defaultVariants: {
      shape: "full",
      mode: "normal",
    },
  }
);
type SheetContentProps = React.ComponentProps<typeof VaulDrawer.Content> &
  VariantProps<typeof contentVariants>;
const SheetContent = React.forwardRef<
  React.ElementRef<typeof VaulDrawer.Content>,
  SheetContentProps
>(({ className, shape: shapeProp, ...props }, ref) => {
  const {
    mode,
    shape: shapeContext,
    hasSnapPoints,
    direction,
  } = useSheetContext();

  const shape = shapeProp || shapeContext;

  const style =
    mode === "detached"
      ? ({ "--vaul-after-display": "0" } as React.CSSProperties)
      : {};

  return (
    <SheetPortal>
      <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <VaulDrawer.Content
        ref={ref}
        style={{ ...props.style, ...style }}
        className={clsx(
          contentVariants({
            side: direction,
            mode,
            shape,
            height: direction === "bottom" && hasSnapPoints ? "snap" : "auto",
          }),
          className
        )}
        {...props}
      />
    </SheetPortal>
  );
});
SheetContent.displayName = "Sheet.Content";
const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      "flex flex-col gap-1 p-6 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "Sheet.Header";
const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx("mt-auto flex flex-col gap-2 p-6", className)}
    {...props}
  />
);
SheetFooter.displayName = "Sheet.Footer";
const SheetGrabber = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { direction } = useSheetContext();
  if (direction !== "bottom") {
    return null;
  }
  return (
    <div className="flex-shrink-0 p-4">
      <div
        className={clsx(
          "mx-auto h-1.5 w-12 flex-shrink-0 rounded-full bg-graphite-border",
          className
        )}
        {...props}
      />
    </div>
  );
};
SheetGrabber.displayName = "Sheet.Grabber";

export const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Content: SheetContent,
  Close: SheetClose,
  Title: SheetTitle,
  Description: SheetDescription,
  Header: SheetHeader,
  Footer: SheetFooter,
  Grabber: SheetGrabber,
});
