// src/components/dialog/index.tsx
import { clsx } from "clsx";
import FocusTrap from "focus-trap-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
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

// --- ANIMATION VARIANTS (UPDATED) ---
const basicDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const fullscreenDialogVariants: Variants = {
  hidden: {
    y: "100%",
    borderRadius: "28px 28px 0px 0px",
    opacity: 0,
    scale: 0.92,
  },
  visible: {
    y: "0%",
    borderRadius: "0px",
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
      mass: 0.8,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: {
    y: "70%",
    opacity: 0,
    borderRadius: "28px 28px 0px 0px",
    scale: 0.95,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
      mass: 0.6,
    },
  },
};
const fullscreenBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 0.6,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};
const contentItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 400, mass: 0.5 },
  },
};

// --- CONTENT (UPDATED FOR SCROLLING) ---
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
        // Only prevent body scroll for basic dialogs
        if (variant === "basic") {
          document.body.style.overflow = "hidden";
        }
        if (variant === "fullscreen") {
          document.body.style.overscrollBehavior = "none";
        }
      }
      return () => {
        document.body.style.overflow = "";
        document.body.style.overscrollBehavior = "";
      };
    }, [open, variant]);

    const isFullscreen = variant === "fullscreen";

    return (
      <Portal>
        <AnimatePresence>
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
                  !isFullscreen && "items-center justify-center p-4 sm:p-8"
                )}
                {...props}
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={
                    isFullscreen
                      ? fullscreenBackdropVariants
                      : {
                          hidden: { opacity: 0 },
                          visible: { opacity: 1 },
                          exit: { opacity: 0 },
                        }
                  }
                  transition={{ ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
                  className={clsx(
                    "absolute inset-0",
                    isFullscreen ? "bg-black/40" : "bg-black/50"
                  )}
                  onClick={() => !isFullscreen && onOpenChange(false)}
                />
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
                  transition={
                    !isFullscreen
                      ? { ease: [0.4, 0, 0.2, 1], duration: 0.3 }
                      : undefined
                  }
                  className={clsx(
                    "relative z-10 flex flex-col",
                    isFullscreen
                      ? "h-full w-full overflow-hidden bg-graphite-card shadow-2xl"
                      : "w-full max-w-lg",
                    className
                  )}
                  style={
                    isFullscreen
                      ? {
                          willChange: "transform, border-radius",
                          backfaceVisibility: "hidden",
                        }
                      : undefined
                  }
                >
                  {isFullscreen ? (
                    <motion.div
                      className="flex h-full flex-col overflow-hidden"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.08,
                            delayChildren: 0.1,
                          },
                        },
                      }}
                    >
                      {React.Children.map(children, (child, index) => {
                        // Check if this is the last child (content area) to make it scrollable
                        const isLastChild =
                          index === React.Children.count(children) - 1;
                        const isHeader =
                          React.isValidElement(child) &&
                          child.type === DialogHeader;
                        const isFooter =
                          React.isValidElement(child) &&
                          child.type === DialogFooter;

                        return (
                          <motion.div
                            key={index}
                            variants={contentItemVariants}
                            className={clsx(
                              "flex-shrink-0",
                              // Make the main content area scrollable
                              !isHeader &&
                                !isFooter &&
                                isLastChild &&
                                "flex-1 overflow-y-auto",
                              // If it's not header/footer but also not last, still allow it to grow
                              !isHeader &&
                                !isFooter &&
                                !isLastChild &&
                                "flex-1 flex flex-col"
                            )}
                          >
                            {child}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    <Card
                      shape={shape}
                      className="relative w-full p-6 shadow-2xl"
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

// --- CLOSE and HELPER Components (Updated DialogHeader for fullscreen scrolling) ---
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
          "border-b border-graphite-border/80",
          "px-6 py-4",
          "bg-graphite-card/95 backdrop-blur-sm",
          "bg-gradient-to-r from-graphite-card to-graphite-card/95",
          "sticky top-0 z-10", // Make header sticky
        ],
        props.className
      )}
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
          "flex flex-shrink-0 flex-row justify-end gap-2",
          "border-t border-graphite-border/80",
          "px-6 py-4",
          "bg-graphite-card/95 backdrop-blur-sm",
          "sticky bottom-0 z-10", // Make footer sticky
        ],
        props.className
      )}
      {...props}
    />
  );
};
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>((props, ref) => {
  const { titleId } = useDialogContext();
  return (
    <h2
      ref={ref}
      id={titleId}
      className="text-xl font-semibold tracking-tight"
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
      className="text-sm text-gray-500"
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

// --- NEW: Scrollable Content Area Component ---
const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { variant } = useDialogContext();
  return (
    <div
      ref={ref}
      className={clsx(
        variant === "fullscreen" && "flex-1 overflow-y-auto px-6 py-4",
        variant === "basic" && "flex-1",
        props.className
      )}
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
