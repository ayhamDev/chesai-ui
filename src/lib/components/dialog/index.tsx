"use client";

import { clsx } from "clsx";
import FocusTrap from "focus-trap-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
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
import { EASING } from "../stack-router/transitions";
import { Typography } from "../typography";

// --- CONTEXT and PORTAL ---
type DialogVariant = "basic" | "fullscreen";
interface DialogContextProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setTriggerRef: (node: HTMLElement | null) => void;
  titleId: string;
  descriptionId: string;
  variant: DialogVariant;
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
}
const Dialog: FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  variant = "basic",
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
    const { onOpenChange, setTriggerRef } = useDialogContext();
    const handleRef = (node: HTMLButtonElement | null) => {
      setTriggerRef(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };
    const triggerProps = {
      ...props,
      ref: handleRef,
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        onOpenChange(true);
        onClick?.(e);
      },
    };
    if (asChild && isValidElement(children)) {
      return cloneElement(children, triggerProps);
    }
    return <button {...triggerProps}>{children}</button>;
  }
);
DialogTrigger.displayName = "DialogTrigger";

// --- ANIMATION VARIANTS ---
const basicDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.2, 0, 0, 1.1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};
const fullscreenDialogVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.4, ease: EASING.iOS },
  },
  exit: {
    y: "110%",
    opacity: 0.4,
    transition: { duration: 0.4, ease: EASING.iOS },
  },
};
const iosBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
const materialBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
  exit: { opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};
const materialContentVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, delay: 0.1, ease: [0.4, 0, 0.2, 1] },
  },
};

// --- CONTENT ---
export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  shape?: CardProps["shape"];
  variant?: CardProps["variant"];
  padding?: CardProps["padding"];
  /**
   * If true, the dialog will animate its size and position when its content changes.
   * Useful for dynamic content like Command menus.
   */
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
    ref
  ) => {
    const {
      open,
      onOpenChange,
      titleId,
      descriptionId,
      variant: dialogVariant,
    } = useDialogContext();

    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
        if (dialogVariant === "fullscreen") {
          document.body.style.overscrollBehavior = "none";
        }
      }
      return () => {
        document.body.style.overflow = "";
        document.body.style.overscrollBehavior = "";
      };
    }, [open, dialogVariant]);

    const isFullscreen = dialogVariant === "fullscreen";
    const backdropVariants = isFullscreen
      ? materialBackdropVariants
      : iosBackdropVariants;

    return (
      <Portal>
        <AnimatePresence mode="wait">
          {open && (
            <FocusTrap
              active={open}
              focusTrapOptions={{
                onDeactivate: () => onOpenChange(false),
                escapeDeactivates: true,
                allowOutsideClick: true,
              }}
            >
              <div
                ref={ref}
                className={clsx(
                  "fixed inset-0 z-50 flex",
                  !isFullscreen && "items-center justify-center p-4 sm:p-8",
                  isFullscreen &&
                    "items-end sm:items-center sm:justify-center  sm:p-8"
                )}
                {...props}
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={backdropVariants}
                  className={clsx(
                    "absolute inset-0",
                    isFullscreen ? "bg-black/32" : "bg-black/50"
                  )}
                  onClick={() => onOpenChange(false)}
                  style={{ willChange: "opacity" }}
                />
                <motion.div
                  role="dialog"
                  layout={layout} // Enable layout animation
                  aria-modal="true"
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                  variants={
                    isFullscreen
                      ? fullscreenDialogVariants
                      : basicDialogVariants
                  }
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={clsx(
                    "relative z-10 flex flex-col",
                    isFullscreen
                      ? [
                          "w-full bg-graphite-card shadow-2xl",
                          "h-full sm:max-h-[90vh] sm:w-full sm:max-w-2xl",
                          "sm:rounded-3xl",
                          "overflow-hidden",
                        ]
                      : "w-full max-w-lg",
                    className
                  )}
                  style={{
                    willChange: "transform, opacity, height, width",
                    backfaceVisibility: "hidden",
                    transform: "translate3d(0, 0, 0)",
                  }}
                >
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
                    >
                      {children}
                    </motion.div>
                  ) : (
                    <Card
                      shape={shape}
                      variant={variant}
                      padding={padding}
                      className="relative w-full shadow-2xl h-full" // Ensure card fills motion wrapper
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
  }
);
DialogContent.displayName = "DialogContent";

// --- HELPER COMPONENTS ---
interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, asChild = false, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();
    const closeProps = {
      ...props,
      ref,
      onClick: (e: MouseEvent<HTMLButtonElement>) => {
        onOpenChange(false);
        onClick?.(e);
      },
    };
    if (asChild && isValidElement(children)) {
      return cloneElement(children, closeProps);
    }
    return <button {...closeProps}>{children}</button>;
  }
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
          "bg-graphite-card",
          "border-b border-graphite-border",
        ],
        props.className
      )}
      style={{
        ...(variant === "fullscreen" && {
          willChange: "transform",
          transform: "translate3d(0, 0, 0)",
        }),
      }}
      {...props}
    />
  );
};
DialogHeader.displayName = "DialogHeader";

const DialogFooter = (props: HTMLAttributes<HTMLDivElement>) => {
  const { variant } = useDialogContext();
  return (
    <div
      className={clsx(
        variant === "basic" && "mt-6 flex gap-2 justify-end",
        variant === "fullscreen" && [
          "flex flex-shrink-0 flex-row gap-3",
          "px-6 py-4 sm:px-8 sm:py-6",
          "bg-graphite-card",
          "border-t border-graphite-border",
        ],
        props.className
      )}
      style={{
        ...(variant === "fullscreen" && {
          willChange: "transform",
          transform: "translate3d(0, 0, 0)",
        }),
      }}
      {...props}
    />
  );
};
DialogFooter.displayName = "DialogFooter";

const DialogTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
  const { titleId, variant } = useDialogContext();
  return <Typography ref={ref} id={titleId} variant="h3" {...props} />;
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  const { descriptionId } = useDialogContext();
  return <Typography variant="muted" ref={ref} id={descriptionId} {...props} />;
});
DialogDescription.displayName = "DialogDescription";

export interface DialogBodyProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "dir">,
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
    ref
  ) => {
    const { variant } = useDialogContext();

    if (variant === "fullscreen") {
      return (
        <ElasticScrollArea
          ref={ref}
          className={clsx(
            "flex-1 pt-0!",
            "px-6 py-4 sm:px-8 sm:py-6 transition-all",
            className
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
  }
);
DialogBody.displayName = "DialogBody";

// --- EXPORTS ---
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
