// src/components/dialog/index.tsx
import { clsx } from "clsx";
import FocusTrap from "focus-trap-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { Card, type CardProps } from "../card";

// --- CONTEXT and PORTAL (No Changes) ---
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
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? ReactDOM.createPortal(children, document.body) : null;
};

// --- ROOT Component (No Changes) ---
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  variant?: DialogVariant;
}
const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  variant = "basic",
}) => {
  const [triggerRef, setTriggerRef] = useState<HTMLElement | null>(null);
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

// --- TRIGGER (No Changes) ---
interface DialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
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
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        onOpenChange(true);
        onClick?.(e);
      },
    };
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, triggerProps);
    }
    return <button {...triggerProps}>{children}</button>;
  }
);
DialogTrigger.displayName = "DialogTrigger";

// --- NATIVE iOS-STYLE ANIMATION VARIANTS ---
// iOS modal presentation uses a subtle scale with spring physics
const basicDialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.2, 0, 0, 1], // Material Design "Emphasized" curve
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1], // Material Design "Accelerate" curve
    },
  },
};

// Material You fullscreen dialog - slides up from bottom with deceleration
const fullscreenDialogVariants: Variants = {
  hidden: {
    y: "100%", // Start completely off-screen
    opacity: 0, // Material You doesn't fade the dialog itself
  },
  visible: {
    y: "0%",
    opacity: 1,

    transition: {
      duration: 0.35, // Material You standard duration
      ease: [0.2, 0.7, 0.1, 1], // Material You emphasized decelerate
    },
  },
  exit: {
    y: "100%",
    opacity: 0.2, // Keep opaque during exit
    transition: {
      duration: 0.2, // Slightly faster exit
      ease: [0.2, 0.2, 0.5, 1], // Material You emphasized decelerate
    },
  },
};

// iOS backdrop - quick fade
const iosBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94], // iOS ease curve
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// Material You backdrop - slower, more pronounced fade
const materialBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1], // Material You standard
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Content animation for fullscreen - delayed appearance
const materialContentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8, // Slight upward movement
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      delay: 0.1, // Delay for staggered effect
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// --- CONTENT (ENHANCED WITH NATIVE TRANSITIONS) ---
export interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  shape?: CardProps["shape"];
}
const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, shape = "minimal", ...props }, ref) => {
    const { open, onOpenChange, titleId, descriptionId, variant } =
      useDialogContext();

    useEffect(() => {
      if (open) {
        if (variant === "basic") {
          document.body.style.overflow = "hidden";
        }
        if (variant === "fullscreen") {
          document.body.style.overflow = "hidden";
          document.body.style.overscrollBehavior = "none";
          // Material You doesn't fix position, just prevents scroll
        }
      }
      return () => {
        document.body.style.overflow = "";
        document.body.style.overscrollBehavior = "";
        document.body.style.position = "";
        document.body.style.width = "";
      };
    }, [open, variant]);

    const isFullscreen = variant === "fullscreen";
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
                    "items-end sm:items-center sm:justify-center sm:p-8"
                )}
                {...props}
              >
                {/* Backdrop */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={backdropVariants}
                  className={clsx(
                    "absolute inset-0",
                    // Material You uses lighter scrim
                    isFullscreen ? "bg-black/32" : "bg-black/50"
                  )}
                  onClick={() => onOpenChange(false)}
                  style={{ willChange: "opacity" }}
                />

                {/* Dialog */}
                <motion.div
                  role="dialog"
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
                          "w-full bg-white shadow-2xl",
                          // Material You fullscreen on mobile, dialog on desktop
                          "h-full sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-2xl",
                          "sm:rounded-3xl", // Material You large corner radius
                          "overflow-hidden",
                        ]
                      : "w-full max-w-lg",
                    className
                  )}
                  style={{
                    willChange: "transform, opacity",
                    backfaceVisibility: "hidden",
                    transform: "translate3d(0, 0, 0)",
                  }}
                >
                  {isFullscreen ? (
                    <motion.div
                      className="flex h-full flex-col sm:h-auto"
                      initial="hidden"
                      animate="visible"
                      variants={materialContentVariants}
                      style={{
                        willChange: "opacity",
                        transform: "translate3d(0, 0, 0)",
                      }}
                    >
                      {React.Children.map(children, (child, index) => {
                        const isLastChild =
                          index === React.Children.count(children) - 1;
                        const isHeader =
                          React.isValidElement(child) &&
                          child.type === DialogHeader;
                        const isFooter =
                          React.isValidElement(child) &&
                          child.type === DialogFooter;

                        return (
                          <div
                            key={index}
                            className={clsx(
                              "flex-shrink-0",
                              !isHeader &&
                                !isFooter &&
                                isLastChild &&
                                "flex-1 overflow-y-auto",
                              !isHeader &&
                                !isFooter &&
                                !isLastChild &&
                                "flex-1 flex flex-col"
                            )}
                            style={{
                              ...(!isHeader &&
                                !isFooter &&
                                isLastChild && {
                                  WebkitOverflowScrolling: "touch",
                                  overscrollBehavior: "contain",
                                }),
                            }}
                          >
                            {child}
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <Card
                      shape={shape}
                      className="relative w-full p-8 shadow-2xl"
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

// --- CLOSE and HELPER Components (Enhanced Material You styling) ---
interface DialogCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, asChild = false, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();
    const closeProps = {
      ...props,
      ref,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        onOpenChange(false);
        onClick?.(e);
      },
    };
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, closeProps);
    }
    return <button {...closeProps}>{children}</button>;
  }
);
DialogClose.displayName = "DialogClose";

const DialogHeader = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { variant } = useDialogContext();
  return (
    <div
      className={clsx(
        variant === "basic" &&
          "flex flex-col space-y-1.5 text-center sm:text-left",
        variant === "fullscreen" && [
          "flex flex-shrink-0 flex-row items-center justify-between",
          // Material You header styling
          "px-6 py-4 sm:px-8 sm:py-6",
          "bg-white",
          "border-b border-gray-200/60",
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

const DialogFooter = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { variant } = useDialogContext();
  return (
    <div
      className={clsx(
        variant === "basic" &&
          "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        variant === "fullscreen" && [
          "flex flex-shrink-0 flex-row justify-end gap-3",
          // Material You footer styling
          "px-6 py-4 sm:px-8 sm:py-6",
          "bg-white",
          "border-t border-gray-200/60",
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

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
  const { titleId, variant } = useDialogContext();
  return (
    <h2
      ref={ref}
      id={titleId}
      className={clsx(
        "font-semibold tracking-tight",
        // Material You uses larger titles in fullscreen
        variant === "fullscreen" ? "text-2xl sm:text-3xl" : "text-xl"
      )}
      {...props}
    />
  );
});
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  const { descriptionId } = useDialogContext();
  return (
    <p
      ref={ref}
      id={descriptionId}
      className="text-sm text-gray-600"
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

// --- Enhanced Scrollable Content Area ---
const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { variant } = useDialogContext();
  return (
    <div
      ref={ref}
      className={clsx(
        variant === "fullscreen" &&
          "flex-1 overflow-y-auto px-6 py-4 sm:px-8 sm:py-6",
        variant === "basic" && "flex-1",
        props.className
      )}
      style={{
        ...(variant === "fullscreen" && {
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          willChange: "scroll-position",
          transform: "translate3d(0, 0, 0)",
        }),
      }}
      {...props}
    />
  );
});
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
