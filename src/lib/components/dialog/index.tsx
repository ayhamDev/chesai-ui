"use client";

import { clsx } from "clsx";
import FocusTrap from "focus-trap-react";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  useDragControls,
  type Variants,
} from "framer-motion";
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type FC,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import ReactDOM from "react-dom";
import { Card, type CardProps } from "../card";
import {
  ElasticScrollArea,
  type ElasticScrollAreaProps,
} from "../elastic-scroll-area";
import { DURATION, EASING } from "../stack-router/transitions";
import { Typography } from "../typography";
import { Shape } from "flubber";

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
  setTriggerRef: (node: HTMLElement | null) => void;
  titleId: string;
  descriptionId: string;
  variant: DialogVariant;
  animation: DialogAnimationType;
  isLocked: boolean;
}

const DialogContext = createContext<DialogContextProps | null>(null);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a <Dialog>");
  }
  return context;
};

const Portal: FC<{ children: ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? ReactDOM.createPortal(children, document.body) : null;
};

// --- ROOT Component ---
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  variant?: DialogVariant;
  animation?: DialogAnimationType;
  isLocked?: boolean;
}

const Dialog: FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  variant = "basic",
  animation = "default",
  isLocked = false,
}) => {
  const [, setTriggerRef] = useState<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange,
        setTriggerRef,
        titleId,
        descriptionId,
        variant,
        animation,
        isLocked,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

// --- TRIGGER ---
interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, asChild = false, onClick, ...props }, ref) => {
    const { onOpenChange, setTriggerRef, isLocked } = useDialogContext();
    const handleRef = (node: HTMLButtonElement | null) => {
      setTriggerRef(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };
    const triggerProps = {
      ...props,
      ref: handleRef,
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        if (isLocked) return;
        onOpenChange(true);
        onClick?.(e);
      },
    };
    if (asChild && isValidElement(children)) {
      return cloneElement(children, triggerProps);
    }
    return <button {...triggerProps}>{children}</button>;
  },
);
DialogTrigger.displayName = "DialogTrigger";

// --- ANIMATION VARIANTS ---
const basicDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION.medium4,
      ease: EASING.emphasizedDecelerate,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: DURATION.short4,
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
      duration: DURATION.medium4,
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
    transition: { duration: DURATION.long2, ease: EASING.emphasizedDecelerate },
  },
  exit: {
    opacity: 0,
    y: -50,
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
      ...props
    },
    ref,
  ) => {
    const {
      open,
      onOpenChange,
      titleId,
      descriptionId,
      variant: dialogVariant,
      animation,
      isLocked,
    } = useDialogContext();
    const dragControls = useDragControls();

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

    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
        if (dialogVariant === "fullscreen")
          document.body.style.overscrollBehavior = "none";
      }
      return () => {
        document.body.style.overflow = "";
        document.body.style.overscrollBehavior = "";
      };
    }, [open, dialogVariant]);

    const isFullscreen = dialogVariant === "fullscreen";
    const isMD3 = animation === "material3";

    const handleDragEnd = (event: any, info: PanInfo) => {
      if (isLocked) return;
      if (info.offset.y > 150 || info.velocity.y > 400) onOpenChange(false);
    };

    return (
      <Portal>
        <AnimatePresence mode="wait">
          {open && (
            <FocusTrap
              active={open}
              focusTrapOptions={{
                onDeactivate: () => !isLocked && onOpenChange(false),
                escapeDeactivates: !isLocked,
                allowOutsideClick: () => !isLocked,
              }}
            >
              <div
                ref={ref}
                className={clsx(
                  "fixed inset-0 z-50 flex",
                  !isFullscreen && "items-center justify-center p-4 sm:p-8",
                  isFullscreen &&
                    "items-end sm:items-center sm:justify-center sm:p-8",
                )}
                {...props}
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={
                    isMD3 ? material3ScrimVariants : defaultBackdropVariants
                  }
                  className={clsx(
                    "absolute inset-0",
                    isMD3 && !isFullscreen ? "bg-black/30" : "bg-black/50",
                  )}
                  onClick={() => !isLocked && onOpenChange(false)}
                  style={{ willChange: "opacity" }}
                />
                <motion.div
                  role="dialog"
                  layout={layout}
                  aria-modal="true"
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
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
                  onDragEnd={handleDragEnd}
                  className={clsx(
                    "relative z-10 flex flex-col",
                    isFullscreen
                      ? [
                          "w-full bg-surface-container-high shadow-2xl",
                          "h-full sm:max-h-[90vh] sm:max-w-2xl",
                          "rounded-none",
                          smShapeStyles[shape as keyof typeof smShapeStyles],
                          "overflow-hidden",
                        ]
                      : "w-full max-w-lg",
                    className,
                  )}
                  style={{
                    willChange: "transform, opacity, height, width",
                    backfaceVisibility: "hidden",
                    touchAction: isFullscreen && !isLocked ? "none" : "auto",
                  }}
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
                    <Card
                      shape={shape}
                      variant={variant}
                      padding={padding}
                      className="relative h-full w-full shadow-2xl"
                    >
                      {children}
                    </Card>
                  )}
                </motion.div>
              </div>
            </FocusTrap>
          )}
        </AnimatePresence>
      </Portal>
    );
  },
);
DialogContent.displayName = "DialogContent";

// --- HELPERS ---
interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, asChild = false, onClick, ...props }, ref) => {
    const { onOpenChange, isLocked } = useDialogContext();
    const closeProps = {
      ...props,
      ref,
      disabled: props.disabled || isLocked,
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        if (isLocked) return;
        onOpenChange(false);
        onClick?.(e);
      },
    };
    if (asChild && isValidElement(children))
      return cloneElement(children, closeProps);
    return <button {...closeProps}>{children}</button>;
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
          "flex flex-shrink-0 flex-row items-center justify-between",
          "px-6 py-4 sm:px-8 sm:py-6",
          "bg-surface-container-high border-b border-outline-variant",
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
          "flex flex-shrink-0 flex-row gap-3",
          "px-6 py-4 sm:px-8 sm:py-6",
          "bg-surface-container-high border-t border-outline-variant",
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
  const { titleId } = useDialogContext();
  // Changed variant="title-medium" to "headline-small"
  return (
    <Typography ref={ref} id={titleId} variant="headline-small" {...props} />
  );
});

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  const { descriptionId } = useDialogContext();
  // Changed variant="body-small" muted={true} to "body-medium" with variant class
  return (
    <Typography
      variant="body-medium"
      className="text-on-surface-variant"
      ref={ref}
      id={descriptionId}
      {...props}
    />
  );
});

export interface DialogBodyProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, "dir">,
    Omit<ElasticScrollAreaProps, "children" | "className" | "ref"> {}
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
