"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React, { createContext, forwardRef, useContext, useEffect } from "react";
import { Drawer as VaulDrawer } from "vaul";

// --- Types ---
type SheetVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "high-contrast"
  | "ghost"
  | "surface";

// --- Context ---
interface SheetContextProps {
  mode: "normal" | "detached";
  shape: "full" | "minimal" | "sharp";
  hasSnapPoints: boolean;
  direction: "top" | "bottom" | "left" | "right";
  variant: SheetVariant;
  isLocked: boolean; // Added to context
}

const SheetContext = createContext<SheetContextProps>({
  mode: "normal",
  shape: "full",
  hasSnapPoints: false,
  direction: "bottom",
  variant: "primary",
  isLocked: false,
});

const useSheetContext = () => useContext(SheetContext);

// --- Root Component ---
type SheetProps = React.ComponentProps<typeof VaulDrawer.Root> & {
  mode?: "normal" | "detached";
  shape?: "full" | "minimal" | "sharp";
  side?: "left" | "right";
  variant?: SheetVariant;
  forceBottomSheet?: boolean;
  forceSideSheet?: boolean;
  isLocked?: boolean; // Added prop
};

const SheetRoot: React.FC<SheetProps> = ({
  mode = "normal",
  shape = "full",
  side = "right",
  variant = "primary",
  forceBottomSheet = false,
  forceSideSheet = false,
  isLocked = false, // Default to unlocked
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  open,
  ...props
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const renderAsSideSheet = forceSideSheet || (isDesktop && !forceBottomSheet);
  const direction = renderAsSideSheet ? side : "bottom";

  // --- ESCAPE KEY LOCK ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };
    if (open && isLocked) {
      window.addEventListener("keydown", handleKeyDown, true); // Capture phase
    }
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, isLocked]);

  return (
    <SheetContext.Provider
      value={{
        mode,
        shape,
        variant,
        isLocked,
        hasSnapPoints: renderAsSideSheet
          ? false
          : !!snapPoints && snapPoints.length > 0,
        direction,
      }}
    >
      {/* @ts-ignore */}
      <VaulDrawer.Root
        direction={direction}
        open={open}
        // MODIFICATION: Disable all dismissal logic when locked
        dismissible={isLocked ? false : (props.dismissible ?? true)}
        {...props}
        snapPoints={renderAsSideSheet ? undefined : snapPoints}
        activeSnapPoint={renderAsSideSheet ? undefined : activeSnapPoint}
        setActiveSnapPoint={renderAsSideSheet ? undefined : setActiveSnapPoint}
      />
    </SheetContext.Provider>
  );
};
SheetRoot.displayName = "Sheet";

// --- RE-EXPORTED PRIMITIVES ---
const SheetTrigger = VaulDrawer.Trigger;
const SheetClose = VaulDrawer.Close;
const SheetPortal = VaulDrawer.Portal;
const SheetTitle = VaulDrawer.Title;
const SheetDescription = VaulDrawer.Description;

// --- CVA Variants for Content ---
const contentVariants = cva(
  "fixed z-50 flex flex-col shadow-lg transition-colors duration-300",
  {
    variants: {
      variant: {
        primary: "bg-surface-container-low text-on-surface",
        secondary: "bg-surface-container-highest text-on-surface",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        "high-contrast": "bg-inverse-surface text-inverse-on-surface",
        ghost: "bg-transparent text-on-surface shadow-none",
        surface: "bg-surface text-on-surface",
      },
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
      variant: "primary",
      shape: "full",
      mode: "normal",
    },
  },
);

type SheetContentProps = React.ComponentProps<typeof VaulDrawer.Content> &
  VariantProps<typeof contentVariants>;

const SheetContent = forwardRef<
  React.ElementRef<typeof VaulDrawer.Content>,
  SheetContentProps
>(({ className, shape: shapeProp, variant: variantProp, ...props }, ref) => {
  const {
    mode,
    shape: shapeContext,
    variant: variantContext,
    hasSnapPoints,
    direction,
    isLocked,
  } = useSheetContext();

  const shape = shapeProp || shapeContext;
  const variant = variantProp || variantContext;

  const style =
    mode === "detached"
      ? ({ "--vaul-after-display": "0" } as React.CSSProperties)
      : {};

  return (
    <SheetPortal>
      <VaulDrawer.Overlay
        className="fixed inset-0 z-50 bg-black/50"
        // MODIFICATION: Block clicks on overlay if locked
        onClick={(e) => isLocked && e.stopPropagation()}
      />
      <VaulDrawer.Content
        ref={ref}
        style={{ ...props.style, ...style }}
        className={clsx(
          contentVariants({
            side: direction,
            mode,
            shape,
            variant,
            height: direction === "bottom" && hasSnapPoints ? "snap" : "auto",
          }),
          className,
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
      className,
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
  const { direction, variant, isLocked } = useSheetContext();
  if (direction !== "bottom" || isLocked) {
    return null; // Hide grabber when locked as it indicates "draggable"
  }
  return (
    <div className="flex-shrink-0 p-4">
      <div
        className={clsx(
          "mx-auto h-1.5 w-12 flex-shrink-0 rounded-full opacity-40",
          variant === "high-contrast"
            ? "bg-inverse-on-surface"
            : variant === "tertiary"
              ? "bg-on-tertiary-container"
              : "bg-on-surface-variant",
          className,
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

export {
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
  SheetDescription,
  SheetHeader,
  SheetFooter,
  SheetGrabber,
};
