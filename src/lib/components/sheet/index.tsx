"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { type VariantProps, cva } from "class-variance-authority";
import { clsx } from "clsx";
import React, { createContext, forwardRef, useContext, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { Drawer as VaulDrawer } from "vaul";

type SheetVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "high-contrast"
  | "ghost"
  | "surface"
  | "surface-container-lowest"
  | "surface-container-low"
  | "surface-container"
  | "surface-container-high"
  | "surface-container-highest";

type SheetWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface SheetContextProps {
  mode: "normal" | "detached";
  shape: "full" | "minimal" | "sharp";
  hasSnapPoints: boolean;
  direction: "top" | "bottom" | "left" | "right";
  variant: SheetVariant;
  isLocked: boolean;
  glass: boolean;
  width: SheetWidth;
}

const SheetContext = createContext<SheetContextProps>({
  mode: "normal",
  shape: "full",
  hasSnapPoints: false,
  direction: "bottom",
  variant: "primary",
  isLocked: false,
  glass: false,
  width: "sm",
});

const useSheetContext = () => useContext(SheetContext);

// Explicitly define Vaul & Radix root props to prevent type-collapse from conditional unions
export interface SheetProps {
  // Radix / Vaul Root Props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  shouldScaleBackground?: boolean;
  scrollLockTimeout?: number;
  fixed?: boolean;
  dismissible?: boolean;
  onDrag?: (
    event: React.PointerEvent<HTMLDivElement>,
    percentageDragged: number,
  ) => void;
  onRelease?: (
    event: React.PointerEvent<HTMLDivElement>,
    open: boolean,
  ) => void;
  modal?: boolean;
  children?: React.ReactNode;
  container?: HTMLElement | null | React.RefObject<HTMLElement | null>;
  onAnimationEnd?: (open: boolean) => void;
  preventScrollOnFocus?: boolean;
  noBodyStyles?: boolean;
  disablePreventScroll?: boolean;

  // Custom Props
  snapPoints?: (string | number)[];
  activeSnapPoint?: string | number | null;
  setActiveSnapPoint?: (snapPoint: string | number | null) => void;
  mode?: "normal" | "detached";
  shape?: "full" | "minimal" | "sharp";
  side?: "left" | "right";
  variant?: SheetVariant;
  forceBottomSheet?: boolean;
  forceSideSheet?: boolean;
  isLocked?: boolean;
  glass?: boolean;
  width?: SheetWidth;
}

const SheetRoot = ({
  mode = "normal",
  shape = "full",
  side = "right",
  variant = "primary",
  forceBottomSheet = false,
  forceSideSheet = false,
  isLocked = false,
  glass = false,
  width = "sm",
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  open,
  ...props
}: SheetProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const renderAsSideSheet = forceSideSheet || (isDesktop && !forceBottomSheet);
  const direction = renderAsSideSheet ? side : "bottom";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };
    if (open && isLocked) {
      window.addEventListener("keydown", handleKeyDown, true);
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
        glass,
        width,
        hasSnapPoints: renderAsSideSheet
          ? false
          : !!snapPoints && snapPoints.length > 0,
        direction,
      }}
    >
      <VaulDrawer.Root
        direction={direction}
        open={open}
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

const SheetTrigger = forwardRef<
  React.ElementRef<typeof VaulDrawer.Trigger>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Trigger>
>((props, ref) => <VaulDrawer.Trigger ref={ref} {...props} />);
SheetTrigger.displayName = "Sheet.Trigger";

const SheetClose = forwardRef<
  React.ElementRef<typeof VaulDrawer.Close>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Close>
>((props, ref) => <VaulDrawer.Close ref={ref} {...props} />);
SheetClose.displayName = "Sheet.Close";

const SheetTitle = forwardRef<
  React.ElementRef<typeof VaulDrawer.Title>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Title>
>((props, ref) => <VaulDrawer.Title ref={ref} {...props} />);
SheetTitle.displayName = "Sheet.Title";

const SheetDescription = forwardRef<
  React.ElementRef<typeof VaulDrawer.Description>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Description>
>((props, ref) => <VaulDrawer.Description ref={ref} {...props} />);
SheetDescription.displayName = "Sheet.Description";

const SheetPortal = VaulDrawer.Portal;

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
        "surface-container-lowest":
          "bg-surface-container-lowest text-on-surface",
        "surface-container-low": "bg-surface-container-low text-on-surface",
        "surface-container": "bg-surface-container text-on-surface",
        "surface-container-high": "bg-surface-container-high text-on-surface",
        "surface-container-highest":
          "bg-surface-container-highest text-on-surface",
      },
      side: {
        top: "inset-x-0 top-0",
        bottom: "inset-x-0 bottom-0 max-h-[96%]",
        left: "inset-y-0 left-0 w-full",
        right: "inset-y-0 right-0 w-full",
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
      glass: {
        true: "",
        false: "",
      },
      width: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
        "2xl": "",
        full: "",
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
      { side: "left", width: "sm", className: "max-w-sm" },
      { side: "left", width: "md", className: "max-w-md" },
      { side: "left", width: "lg", className: "max-w-lg" },
      { side: "left", width: "xl", className: "max-w-xl" },
      { side: "left", width: "2xl", className: "max-w-2xl" },
      { side: "left", width: "full", className: "max-w-full" },
      { side: "right", width: "sm", className: "max-w-sm" },
      { side: "right", width: "md", className: "max-w-md" },
      { side: "right", width: "lg", className: "max-w-lg" },
      { side: "right", width: "xl", className: "max-w-xl" },
      { side: "right", width: "2xl", className: "max-w-2xl" },
      { side: "right", width: "full", className: "max-w-full" },
      {
        glass: true,
        variant: "primary",
        className:
          "bg-surface-container-low/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "secondary",
        className:
          "bg-surface-container-highest/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "tertiary",
        className:
          "bg-tertiary-container/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "high-contrast",
        className:
          "bg-inverse-surface/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "ghost",
        className:
          "backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "surface",
        className:
          "bg-surface/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "surface-container-lowest",
        className:
          "bg-surface-container-lowest/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "surface-container-low",
        className:
          "bg-surface-container-low/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "surface-container",
        className:
          "bg-surface-container/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "surface-container-high",
        className:
          "bg-surface-container-high/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
      {
        glass: true,
        variant: "surface-container-highest",
        className:
          "bg-surface-container-highest/50 backdrop-blur-2xl shadow-2xl border border-white/20 dark:border-white/10",
      },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "full",
      mode: "normal",
      glass: false,
      width: "sm",
    },
  },
);

export interface SheetContentProps extends Omit<
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Content>,
  "variant" | "shape" | "mode" | "glass" | "width"
> {
  variant?: SheetVariant;
  side?: "top" | "bottom" | "left" | "right";
  height?: "snap" | "auto";
  shape?: "full" | "minimal" | "sharp";
  mode?: "normal" | "detached";
  glass?: boolean;
  width?: SheetWidth;
}

const SheetContent = forwardRef<
  React.ElementRef<typeof VaulDrawer.Content>,
  SheetContentProps
>(
  (
    {
      className,
      shape: shapeProp,
      variant: variantProp,
      glass: glassProp,
      width: widthProp,
      ...props
    },
    ref,
  ) => {
    const {
      mode,
      shape: shapeContext,
      variant: variantContext,
      hasSnapPoints,
      direction,
      isLocked,
      glass: glassContext,
      width: widthContext,
    } = useSheetContext();

    const shape = shapeProp || shapeContext;
    const variant = variantProp || variantContext;
    const glass = glassProp !== undefined ? glassProp : glassContext;
    const width = widthProp || widthContext;

    const style =
      mode === "detached"
        ? ({ "--vaul-after-display": "0" } as React.CSSProperties)
        : {};

    return (
      <SheetPortal>
        <VaulDrawer.Overlay
          className="fixed inset-0 z-50 bg-black/50"
          onClick={(e) => isLocked && e.stopPropagation()}
        />
        <VaulDrawer.Content
          ref={ref}
          style={{ ...props.style, ...style }}
          className={twMerge(
            clsx(
              contentVariants({
                side: direction,
                mode,
                shape,
                variant,
                glass,
                width,
                height:
                  direction === "bottom" && hasSnapPoints ? "snap" : "auto",
              }),
              className,
            ),
          )}
          {...props}
        />
      </SheetPortal>
    );
  },
);
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
    return null;
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

export interface SheetComponentType {
  (props: SheetProps): React.JSX.Element;
  displayName?: string;
  Trigger: typeof SheetTrigger;
  Content: typeof SheetContent;
  Close: typeof SheetClose;
  Title: typeof SheetTitle;
  Description: typeof SheetDescription;
  Header: typeof SheetHeader;
  Footer: typeof SheetFooter;
  Grabber: typeof SheetGrabber;
}

export const Sheet: SheetComponentType = Object.assign(SheetRoot, {
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
