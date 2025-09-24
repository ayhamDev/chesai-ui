"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import React, { createContext, useContext, useState } from "react";
import { Drawer as VaulDrawer } from "vaul";

// --- CONTEXT ---
interface BottomSheetContextProps {
  mode: "normal" | "detached";
  shape: "full" | "minimal" | "sharp";
  // --- THIS IS THE KEY CHANGE (1/4) ---
  hasSnapPoints: boolean;
  // --- END OF CHANGE ---
}

const BottomSheetContext = createContext<BottomSheetContextProps>({
  mode: "normal",
  shape: "full",
  // --- THIS IS THE KEY CHANGE (1/4) ---
  hasSnapPoints: false, // Default value
  // --- END OF CHANGE ---
});

const useBottomSheetContext = () => useContext(BottomSheetContext);

// --- ROOT COMPONENT ---
type BottomSheetProps = React.ComponentProps<typeof VaulDrawer.Root> & {
  mode?: "normal" | "detached";
  shape?: "full" | "minimal" | "sharp";
};

const BottomSheetRoot: React.FC<BottomSheetProps> = ({
  mode = "normal",
  shape = "full",
  snapPoints,
  activeSnapPoint,
  setActiveSnapPoint,
  ...props
}) => {
  return (
    // Provide the new value to the context
    <BottomSheetContext.Provider
      value={{
        mode,
        shape,
        hasSnapPoints: !!snapPoints && snapPoints.length > 0,
      }}
    >
      <VaulDrawer.Root
        {...props}
        snapPoints={snapPoints}
        activeSnapPoint={activeSnapPoint}
        setActiveSnapPoint={setActiveSnapPoint}
      />
    </BottomSheetContext.Provider>
  );
  // --- END OF CHANGE ---
};
BottomSheetRoot.displayName = "BottomSheet";

// --- RE-EXPORTED PRIMITIVES ---
const BottomSheetTrigger = VaulDrawer.Trigger;
const BottomSheetClose = VaulDrawer.Close;
const BottomSheetPortal = VaulDrawer.Portal;
const BottomSheetTitle = VaulDrawer.Title;
const BottomSheetDescription = VaulDrawer.Description;

// --- CONTENT ---
// --- THIS IS THE KEY CHANGE (3/4) ---
const contentVariants = cva(
  // The base class no longer contains h-full or h-auto
  "fixed z-50 flex max-h-[96%] flex-col border-b-none bg-graphite-card shadow-lg",
  {
    variants: {
      // New 'height' variant based on the presence of snap points
      height: {
        snap: "h-full ", // For when snap points are present
        auto: "h-auto", // For when snap points are absent
      },
      mode: {
        normal: "bottom-0 left-0 right-0 mx-auto max-w-xl",
        detached: "inset-x-4 bottom-4 mx-auto max-w-lg",
      },
      shape: {
        full: "",
        minimal: "",
        sharp: "",
      },
    },
    compoundVariants: [
      { mode: "normal", shape: "full", className: "rounded-t-2xl" },
      { mode: "normal", shape: "minimal", className: "rounded-t-lg" },
      { mode: "normal", shape: "sharp", className: "rounded-t-none" },
      { mode: "detached", shape: "full", className: "rounded-2xl" },
      { mode: "detached", shape: "minimal", className: "rounded-lg" },
      { mode: "detached", shape: "sharp", className: "rounded-none" },
    ],
    defaultVariants: {
      mode: "normal",
      shape: "full",
    },
  }
);
// --- END OF CHANGE ---

type BottomSheetContentProps = React.ComponentProps<typeof VaulDrawer.Content> &
  VariantProps<typeof contentVariants>;

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof VaulDrawer.Content>,
  BottomSheetContentProps
>(({ className, shape: shapeProp, ...props }, ref) => {
  // --- THIS IS THE KEY CHANGE (4/4) ---
  // Consume the new hasSnapPoints value from the context
  const { mode, shape: shapeContext, hasSnapPoints } = useBottomSheetContext();
  // --- END OF CHANGE ---

  const shape = shapeProp || shapeContext;

  const style =
    mode === "detached"
      ? ({ "--vaul-after-display": "0" } as React.CSSProperties)
      : {};

  return (
    <BottomSheetPortal>
      <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-black/50 " />
      <VaulDrawer.Content
        ref={ref}
        style={{ ...props.style, ...style }}
        // --- THIS IS THE KEY CHANGE (4/4) ---
        // Apply the correct height variant based on hasSnapPoints
        className={clsx(
          contentVariants({
            mode,
            shape,
            height: hasSnapPoints ? "snap" : "auto",
          }),
          className
        )}
        // --- END OF CHANGE ---
        {...props}
      />
    </BottomSheetPortal>
  );
});
BottomSheetContent.displayName = "BottomSheet.Content";

// --- HELPER COMPONENTS --- (No changes below this line)
const BottomSheetHeader = ({
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
BottomSheetHeader.displayName = "BottomSheet.Header";

const BottomSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx("mt-auto flex flex-col gap-2 p-6", className)}
    {...props}
  />
);
BottomSheetFooter.displayName = "BottomSheet.Footer";

const BottomSheetGrabber = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
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
BottomSheetGrabber.displayName = "BottomSheet.Grabber";

// --- COMPOUND COMPONENT EXPORT ---
export const BottomSheet = Object.assign(BottomSheetRoot, {
  Trigger: BottomSheetTrigger,
  Content: BottomSheetContent,
  Close: BottomSheetClose,
  Title: BottomSheetTitle,
  Description: BottomSheetDescription,
  Header: BottomSheetHeader,
  Footer: BottomSheetFooter,
  Grabber: BottomSheetGrabber,
});
