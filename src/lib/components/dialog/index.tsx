"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  useDragControls,
  type Variants,
} from "framer-motion";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  type ButtonHTMLAttributes,
  type FC,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { twMerge } from "tailwind-merge";
import { cardVariants, type CardProps } from "../card";
import {
  ElasticScrollArea,
  type ElasticScrollAreaProps,
} from "../elastic-scroll-area";
import { DURATION, EASING } from "../stack-router/transitions";
import { Typography } from "../typography";

// --- HELPERS ---
const smShapeStyles = {
  full: "sm:rounded-[28px]",
  minimal: "sm:rounded-xl",
  sharp: "sm:rounded-none",
};

// --- CONTEXT ---
type DialogVariant = "basic" | "fullscreen";
type DialogAnimationType = "default" | "material3";

interface DialogContextProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: DialogVariant;
  animation: DialogAnimationType;
  isLocked: boolean;
  glass: boolean;
}

const DialogContext = createContext<DialogContextProps | null>(null);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a <Dialog>");
  }
  return context;
};

// --- ROOT Component ---
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  variant?: DialogVariant;
  animation?: DialogAnimationType;
  isLocked?: boolean;
  glass?: boolean;
}

const Dialog: FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  variant = "basic",
  animation = "default",
  isLocked = false,
  glass = false,
}) => {
  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange,
        variant,
        animation,
        isLocked,
        glass,
      }}
    >
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </DialogPrimitive.Root>
    </DialogContext.Provider>
  );
};

// --- TRIGGER ---
interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, asChild = false, onClick, disabled, ...props }, ref) => {
    const { isLocked } = useDialogContext();

    return (
      <DialogPrimitive.Trigger
        asChild={asChild}
        ref={ref}
        disabled={disabled || isLocked}
        onClick={(e) => {
          if (isLocked) {
            e.preventDefault();
            return;
          }
          onClick?.(e as any);
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Trigger>
    );
  },
);
DialogTrigger.displayName = "DialogTrigger";

// --- ANIMATION VARIANTS ---
const basicDialogVariants: Variants = {
  hidden: { opacity: 0.3, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.long1,
      ease: EASING.emphasizedDecelerate,
    },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: {
      duration: DURATION.short2,
      ease: EASING.emphasizedAccelerate,
    },
  },
};

const fullscreenDialogVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: DURATION.long1,
      ease: EASING.emphasizedDecelerate,
    },
  },
  exit: {
    y: "100%",
    opacity: 1,
    transition: {
      duration: DURATION.medium2,
      ease: EASING.emphasizedAccelerate,
    },
  },
};

const material3DialogVariants: Variants = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.long3, ease: EASING.emphasizedDecelerate },
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.9,
    transition: {
      duration: DURATION.short2,
      ease: EASING.emphasizedAccelerate,
    },
  },
};

const defaultBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.medium2, ease: EASING.standard },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION.short4, ease: EASING.standard },
  },
};

const material3ScrimVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.medium1,
      ease: EASING.emphasizedDecelerate,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: DURATION.medium1,
      ease: EASING.emphasizedAccelerate,
    },
  },
};

const materialContentVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.medium1,
      delay: 0.1,
      ease: EASING.standardDecelerate,
    },
  },
};

// --- CONTENT ---
export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  shape?: CardProps["shape"];
  variant?: CardProps["variant"];
  padding?: CardProps["padding"];
  layout?: boolean | "size" | "position" | "preserve-aspect";
  glass?: boolean;
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      className,
      children,
      shape = "minimal",
      variant = "primary",
      padding = "md",
      layout,
      glass: glassProp,
      // Destructure these to avoid conflict with motion's custom types
      onDrag,
      onDragStart,
      onDragEnd,
      onAnimationStart,
      ...props
    },
    ref,
  ) => {
    const {
      open,
      onOpenChange,
      variant: dialogVariant,
      animation,
      isLocked,
      glass: glassContext,
    } = useDialogContext();
    const dragControls = useDragControls();

    const glass = glassProp !== undefined ? glassProp : glassContext;

    useEffect(() => {
      if (open && dialogVariant === "fullscreen") {
        document.body.style.overscrollBehavior = "none";
      }
      return () => {
        document.body.style.overscrollBehavior = "";
      };
    }, [open, dialogVariant]);

    const isFullscreen = dialogVariant === "fullscreen";
    const isMD3 = animation === "material3";

    const handleDragEndInternal = (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
    ) => {
      if (isLocked) return;
      if (info.offset.y > 150 || info.velocity.y > 400) onOpenChange(false);
    };

    return (
      <AnimatePresence mode="wait">
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={
                  isMD3 ? material3ScrimVariants : defaultBackdropVariants
                }
                className={clsx(
                  "fixed inset-0 z-50 pointer-events-auto",
                  isMD3 && !isFullscreen ? "bg-black/30" : "bg-black/50",
                )}
                style={{ willChange: "opacity" }}
              />
            </DialogPrimitive.Overlay>

            <div
              className={clsx(
                "fixed inset-0 z-50 flex pointer-events-none",
                !isFullscreen && "items-center justify-center p-4 sm:p-8",
                isFullscreen &&
                  "items-end sm:items-center sm:justify-center sm:p-8",
              )}
            >
              <DialogPrimitive.Content
                asChild
                forceMount
                onEscapeKeyDown={(e) => {
                  if (isLocked) e.preventDefault();
                }}
                onInteractOutside={(e) => {
                  if (isLocked) e.preventDefault();
                }}
              >
                <motion.div
                  ref={ref}
                  layout={layout}
                  variants={
                    isFullscreen
                      ? fullscreenDialogVariants
                      : isMD3
                        ? material3DialogVariants
                        : basicDialogVariants
                  }
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  drag={isFullscreen && !isLocked ? "y" : false}
                  dragControls={dragControls}
                  dragListener={false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 1 }}
                  onDragEnd={handleDragEndInternal}
                  style={{
                    willChange: "transform, opacity, height, width",
                    touchAction: isFullscreen && !isLocked ? "none" : "auto",
                  }}
                  className={twMerge(
                    clsx(
                      "relative z-10 flex flex-col shadow-2xl pointer-events-auto",
                      isFullscreen
                        ? [
                            "w-full",
                            "h-full sm:max-h-[90vh] sm:max-w-2xl",
                            "rounded-none",
                            smShapeStyles[shape as keyof typeof smShapeStyles],
                            "overflow-hidden",
                            glass
                              ? "bg-surface-container-high/6 backdrop-blur-xl border border-white/20 dark:border-white/10"
                              : "bg-surface-container-high",
                          ]
                        : [
                            "w-full max-w-lg",
                            cardVariants({
                              shape,
                              variant,
                              padding,
                              glass,
                              elevation: "none",
                              bordered: false,
                            }),
                            "transition-none!",
                          ],
                      className,
                    ),
                  )}
                  {...props}
                >
                  {isFullscreen && (
                    <div className="absolute left-1/2 top-2 z-50 -translate-x-1/2 opacity-80 pointer-events-none">
                      <div className="h-1.5 w-12 rounded-full bg-on-surface-variant/40" />
                    </div>
                  )}

                  {isFullscreen ? (
                    <motion.div
                      className="flex h-full flex-col"
                      initial="hidden"
                      animate="visible"
                      variants={materialContentVariants}
                      style={{
                        willChange: "opacity",
                        transform: "translate3d(0, 0, 0)",
                      }}
                      onPointerDown={(e) => {
                        if (isLocked) return;
                        const target = e.target as HTMLElement;
                        if (
                          target.closest(
                            "button, a, input, select, textarea, [role='button']",
                          )
                        )
                          return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        if (e.clientY - rect.top > 72) return;
                        dragControls.start(e);
                      }}
                    >
                      <div
                        className="flex h-full w-full flex-col"
                        style={{ touchAction: "pan-y" }}
                      >
                        {children}
                      </div>
                    </motion.div>
                  ) : (
                    children
                  )}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    );
  },
);
DialogContent.displayName = "DialogContent";

// --- HELPERS ---
interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, asChild = false, onClick, disabled, ...props }, ref) => {
    const { isLocked } = useDialogContext();
    const isDisabled = disabled || isLocked;

    return (
      <DialogPrimitive.Close
        asChild={asChild}
        ref={ref}
        disabled={isDisabled}
        onClick={(e) => {
          if (isDisabled) {
            e.preventDefault();
            return;
          }
          onClick?.(e as any);
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Close>
    );
  },
);
DialogClose.displayName = "DialogClose";

const DialogHeader = (props: HTMLAttributes<HTMLDivElement>) => {
  const { variant } = useDialogContext();
  return (
    <div
      className={clsx(
        variant === "basic" && "flex flex-col space-y-1.5 text-left",
        variant === "fullscreen" && [
          "flex shrink-0 flex-row items-center justify-between",
          "px-6 py-4 sm:px-8 sm:py-6",
          "bg-transparent border-b border-outline-variant",
          "touch-none select-none",
        ],
        props.className,
      )}
      {...props}
    />
  );
};

const DialogFooter = (props: HTMLAttributes<HTMLDivElement>) => {
  const { variant } = useDialogContext();
  return (
    <div
      className={clsx(
        variant === "basic" && "mt-6 flex justify-end gap-2",
        variant === "fullscreen" && [
          "flex shrink-0 flex-row gap-3",
          "px-6 py-4 sm:px-8 sm:py-6",
          "bg-transparent border-t border-outline-variant",
        ],
        props.className,
      )}
      {...props}
    />
  );
};

const DialogTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
  return (
    <DialogPrimitive.Title asChild>
      <Typography ref={ref} variant="headline-small" {...props} />
    </DialogPrimitive.Title>
  );
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  return (
    <DialogPrimitive.Description asChild>
      <Typography
        variant="body-medium"
        className="text-on-surface-variant"
        ref={ref}
        {...props}
      />
    </DialogPrimitive.Description>
  );
});
DialogDescription.displayName = "DialogDescription";

export interface DialogBodyProps extends ElasticScrollAreaProps {}
const DialogBody = forwardRef<HTMLDivElement, DialogBodyProps>(
  (
    {
      className,
      children,
      elasticity = true,
      pullToRefresh,
      onRefresh,
      ...props
    },
    ref,
  ) => {
    const { variant } = useDialogContext();
    if (variant === "fullscreen") {
      return (
        <ElasticScrollArea
          ref={ref}
          className={clsx(
            "flex-1 pt-0!",
            "px-6 py-4 transition-all sm:px-8 sm:py-6",
            "touch-pan-y",
            className,
          )}
          elasticity={elasticity}
          pullToRefresh={pullToRefresh}
          onRefresh={onRefresh}
          {...props}
        >
          {children}
        </ElasticScrollArea>
      );
    }
    return (
      <div ref={ref} className={clsx("flex-1", className)} {...props}>
        {children}
      </div>
    );
  },
);
DialogBody.displayName = "DialogBody";

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
