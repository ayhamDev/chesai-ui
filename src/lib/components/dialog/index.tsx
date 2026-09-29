"use client";
import { useDirection } from "../../context/direction";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
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
import { Maximize2, Minimize2 } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { resolveSheetSnap, sheetSizeToCss } from "./sheet-motion";
import { overlayBlurClasses, type OverlayBlur } from "../../utils/overlay";

// --- HELPERS ---
export type DialogSide = "top" | "bottom" | "left" | "right";

// --- CONTEXT ---
type DialogVariant = "basic" | "sheet" | "fullscreen";
type DialogAnimationType = "default" | "material3";

interface DialogContextProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: DialogVariant;
  animation: DialogAnimationType;
  isLocked: boolean;
  glass: boolean;
  side: DialogSide;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  sheetSize?: string | number;
  overlay: boolean;
  overlayBlur: OverlayBlur;
  closeOnOutsideClick: boolean;
  showDragHandle: boolean;
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
  /** Edge used by the sheet variant (fullscreen is a legacy alias). */
  side?: DialogSide;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Partial coverage: a fraction (0–1) or CSS size, e.g. "40dvh", "480px", "min(640px, 90vw)". */
  sheetSize?: string | number;
  /** Dim and block the page while a sheet is partially open. Defaults to false. */
  overlay?: boolean;
  overlayBlur?: OverlayBlur;
  /** Dismiss on outside pointer interaction. Defaults to overlay (true for basic dialogs). */
  closeOnOutsideClick?: boolean;
  /** Render the drag handle and reserve its space. Defaults to true. */
  showDragHandle?: boolean;
}

const Dialog: FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  variant = "basic",
  animation = "default",
  isLocked = false,
  glass = false,
  side = "bottom",
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  sheetSize,
  overlay = false,
  overlayBlur = "none",
  closeOnOutsideClick = variant === "basic" || overlay,
  showDragHandle = true,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? internalExpanded;
  const setExpanded = (value: boolean) => {
    if (expandedProp === undefined) setInternalExpanded(value);
    onExpandedChange?.(value);
  };
  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange,
        variant,
        animation,
        isLocked,
        glass,
        side,
        expanded,
        onExpandedChange: setExpanded,
        sheetSize,
        overlay,
        overlayBlur,
        closeOnOutsideClick,
        showDragHandle,
      }}
    >
      <DialogPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        modal={variant === "basic"}
      >
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

const sheetDialogVariants = (
  side: DialogSide,
  reducedMotion: boolean,
): Variants => {
  const offset = reducedMotion
    ? {}
    : side === "left" || side === "right"
      ? { x: side === "left" ? "-100%" : "100%" }
      : { y: side === "top" ? "-100%" : "100%" };
  return {
    hidden: offset,
    visible: {
      x: "0%",
      y: "0%",
      transition: reducedMotion
        ? { duration: 0 }
        : {
            type: "spring",
            stiffness: 380,
            damping: 38,
            mass: 1,
          },
    },
    exit: {
      ...offset,
      transition: {
        duration: reducedMotion ? 0 : 0.24,
        ease: [0.4, 0, 1, 1],
      },
    },
  };
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

// --- CONTENT ---
export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  shape?: CardProps["shape"];
  variant?: CardProps["variant"];
  padding?: CardProps["padding"];
  layout?: boolean | "size" | "position" | "preserve-aspect";
  glass?: boolean;
  /** Collapsed sheet height (top/bottom) or width (left/right). */
  sheetSize?: string | number;
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      className,
      children,
      shape = "minimal",
      variant = "primary",
      padding = "md",
      layout = false, // Default to false to handle dimension changes purely through CSS transitions
      glass: glassProp,
      style,
      sheetSize,
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
      side,
      expanded,
      onExpandedChange,
      sheetSize: rootSheetSize,
      overlay,
      overlayBlur,
      closeOnOutsideClick,
      showDragHandle,
    } = useDialogContext();
    const contentRef = useRef<HTMLDivElement | null>(null);
    const sizeProbeRef = useRef<HTMLDivElement | null>(null);
    const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);
    const resizeRef = useRef<{
      pointerId: number;
      start: number;
      initialSize: number;
      size: number;
      extent: number;
      moved: boolean;
      partial: number;
      lastPosition: number;
      lastTime: number;
      velocity: number;
    } | null>(null);
    const [dragSize, setDragSize] = useState<number | null>(null);
    const [sizePercentage, setSizePercentage] = useState(0);
    const setContentRef = useCallback(
      (node: HTMLDivElement | null) => {
        contentRef.current = node;
        setContentNode(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    const reducedMotion = useReducedMotion();
    const direction = useDirection(undefined, props.dir);

    const glass = glassProp !== undefined ? glassProp : glassContext;

    useEffect(() => {
      if (!open || dialogVariant === "basic" || (!expanded && !overlay)) return;
      const previous = document.body.style.overscrollBehavior;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overscrollBehavior = "none";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overscrollBehavior = previous;
        document.body.style.overflow = previousOverflow;
      };
    }, [open, dialogVariant, expanded, overlay]);

    useEffect(() => {
      if (!open) return;
      resizeRef.current = null;
      setDragSize(null);
    }, [side, sheetSize, rootSheetSize, open]);

    const isSheet = dialogVariant !== "basic";
    const horizontal = side === "left" || side === "right";
    const partialSize = sheetSizeToCss(
      sheetSize ?? rootSheetSize ?? (horizontal ? "min(520px, 90vw)" : "55dvh"),
    );
    useEffect(() => {
      const content = contentNode;
      if (
        !open ||
        !isSheet ||
        !content ||
        typeof ResizeObserver === "undefined"
      )
        return;
      const observer = new ResizeObserver(() => {
        const bounds = content.parentElement!.getBoundingClientRect();
        const rect = content.getBoundingClientRect();
        const extent = horizontal ? bounds.width : bounds.height;
        if (extent > 0)
          setSizePercentage(
            Math.round(
              ((horizontal ? rect.width : rect.height) / extent) * 100,
            ),
          );
      });
      observer.observe(content);
      return () => observer.disconnect();
    }, [open, isSheet, horizontal, contentNode]);
    const sheetRadius = shape === "sharp" ? 0 : shape === "full" ? 28 : 12;
    const corners =
      expanded && dragSize === null
        ? 0
        : {
            bottom: `${sheetRadius}px ${sheetRadius}px 0 0`,
            top: `0 0 ${sheetRadius}px ${sheetRadius}px`,
            left: `0 ${sheetRadius}px ${sheetRadius}px 0`,
            right: `${sheetRadius}px 0 0 ${sheetRadius}px`,
          }[side];
    const isMD3 = animation === "material3";

    const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isLocked || event.button !== 0 || !contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const bounds = contentRef.current.parentElement!.getBoundingClientRect();
      const size = horizontal ? rect.width : rect.height;
      const probe = sizeProbeRef.current!.getBoundingClientRect();
      const position = horizontal ? event.clientX : event.clientY;
      resizeRef.current = {
        pointerId: event.pointerId,
        start: horizontal ? event.clientX : event.clientY,
        initialSize: size,
        size,
        extent: horizontal ? bounds.width : bounds.height,
        moved: false,
        partial: horizontal ? probe.width : probe.height,
        lastPosition: position,
        lastTime: event.timeStamp,
        velocity: 0,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
      setDragSize(size);
    };

    const moveResize = (event: ReactPointerEvent<HTMLDivElement>) => {
      const resize = resizeRef.current;
      if (!resize || resize.pointerId !== event.pointerId) return;
      const sign = side === "top" || side === "left" ? 1 : -1;
      const delta =
        ((horizontal ? event.clientX : event.clientY) - resize.start) * sign;
      resize.moved ||= Math.abs(delta) > 3;
      const position = horizontal ? event.clientX : event.clientY;
      const elapsed = Math.max(16, event.timeStamp - resize.lastTime);
      resize.velocity = ((position - resize.lastPosition) * sign) / elapsed;
      resize.lastTime = event.timeStamp;
      resize.lastPosition = position;
      resize.size = Math.min(
        resize.extent,
        Math.max(0, resize.initialSize + delta),
      );
      setDragSize(resize.size);
    };

    const finishResize = (
      event: ReactPointerEvent<HTMLDivElement>,
      cancelled = false,
    ) => {
      const resize = resizeRef.current;
      if (!resize || resize.pointerId !== event.pointerId) return;
      resizeRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (!cancelled && resize.moved) {
        const velocity =
          event.timeStamp - resize.lastTime > 80 ? 0 : resize.velocity;
        const snap = resolveSheetSnap(
          resize.size,
          resize.partial,
          resize.extent,
          velocity,
        );
        if (snap === "closed") {
          // Keep the released geometry during the slide-out; don't jump back to partial size.
          onOpenChange(false);
          return;
        }
        onExpandedChange(snap === "expanded");
      }
      setDragSize(null);
    };
    const currentSize =
      dragSize !== null ? `${dragSize}px` : expanded ? "100%" : partialSize;

    return (
      <AnimatePresence mode="wait">
        {open && (
          <DialogPrimitive.Portal forceMount>
            {!isSheet && (
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
                    isMD3 && !isSheet ? "bg-black/30" : "bg-black/50",
                    overlayBlurClasses[overlayBlur],
                  )}
                  style={{ willChange: "opacity" }}
                />
              </DialogPrimitive.Overlay>
            )}
            {isSheet && overlay && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.2, 0, 0, 1] }}
                data-sheet-overlay=""
                aria-hidden="true"
                className={clsx("fixed inset-0 z-50 bg-black/35", overlayBlurClasses[overlayBlur])}
                onClick={() => {
                  if (closeOnOutsideClick && !isLocked) onOpenChange(false);
                }}
              />
            )}

            <div
              className={clsx(
                "fixed inset-0 z-50 flex pointer-events-none",
                !isSheet && "items-center justify-center p-4 sm:p-8",
                isSheet && "overflow-hidden",
              )}
            >
              {isSheet && (
                <div
                  ref={sizeProbeRef}
                  data-sheet-size-probe=""
                  aria-hidden="true"
                  className="invisible absolute pointer-events-none"
                  style={{
                    width: horizontal ? partialSize : 0,
                    height: horizontal ? 0 : partialSize,
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              )}
              <FocusTrap
                active={isSheet && (expanded || overlay) && open}
                focusTrapOptions={{
                  initialFocus: false,
                  fallbackFocus: () => contentRef.current!,
                  escapeDeactivates: false,
                  returnFocusOnDeactivate: false,
                  allowOutsideClick: true,
                }}
              >
                <DialogPrimitive.Content
                  dir={direction}
                  aria-modal={isSheet ? expanded || overlay : true}
                  asChild
                  forceMount
                  onEscapeKeyDown={(e) => {
                    if (isLocked) e.preventDefault();
                  }}
                  onInteractOutside={(e) => {
                    if (isLocked || isSheet || !closeOnOutsideClick)
                      e.preventDefault();
                  }}
                  onPointerDownOutside={(e) => {
                    if (
                      isSheet &&
                      !overlay &&
                      !expanded &&
                      closeOnOutsideClick &&
                      !isLocked
                    ) {
                      const target = e.detail.originalEvent.target;
                      // The trigger already owns its open/close action.
                      if (
                        !(
                          target instanceof Element &&
                          target.closest('[aria-haspopup="dialog"]')
                        )
                      )
                        onOpenChange(false);
                    }
                  }}
                >
                  <motion.div
                    ref={setContentRef}
                    data-side={isSheet ? side : undefined}
                    data-expanded={isSheet ? expanded : undefined}
                    layout={isSheet ? false : layout}
                    variants={
                      isSheet
                        ? sheetDialogVariants(side, !!reducedMotion)
                        : isMD3
                          ? material3DialogVariants
                          : basicDialogVariants
                    }
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                      willChange: isSheet ? "transform" : "transform, opacity",
                      touchAction: "auto",
                      // Custom layout-safe transitions targeting only styling and bounds updates
                      transitionProperty:
                        "width, height, max-width, max-height, background-color, border-color, color, border-radius, box-shadow",
                      transitionDuration:
                        reducedMotion || dragSize !== null
                          ? "0ms"
                          : isSheet
                            ? "480ms"
                            : "var(--theme-transition-duration, 300ms)",
                      transitionTimingFunction: isSheet
                        ? "cubic-bezier(0.22, 1, 0.36, 1)"
                        : "var(--theme-transition-ease, cubic-bezier(0.2, 0, 0, 1))",
                      ...style,
                      ...(isSheet
                        ? ({
                            position: "absolute",
                            [side]: 0,
                            ...(horizontal ? { top: 0 } : { left: 0 }),
                            width: horizontal ? currentSize : "100%",
                            height: horizontal ? "100%" : currentSize,
                            maxWidth: "100%",
                            maxHeight: "100%",
                            borderRadius: corners,
                            ...(isLocked || !showDragHandle
                              ? {}
                              : {
                                  [{
                                    bottom: "paddingTop",
                                    top: "paddingBottom",
                                    left: "paddingRight",
                                    right: "paddingLeft",
                                  }[side]]: 44,
                                }),
                          } as const)
                        : {}),
                    }}
                    className={twMerge(
                      clsx(
                        "relative z-10 flex flex-col shadow-2xl pointer-events-auto",
                        isSheet
                          ? [
                              "min-h-0 min-w-0 overflow-hidden",
                              glass
                                ? "bg-surface-container-high/6 backdrop-blur-xl border border-white/20 dark:border-white/10"
                                : "bg-surface-container-high",
                            ]
                          : [
                              "w-full max-w-lg", // FIXED: Added standard max-w-md as fallback base style for basic dialogs
                              cardVariants({
                                shape,
                                variant,
                                padding,
                                glass,
                                elevation: "none",
                                bordered: false,
                              }),
                            ],
                        className,
                      ),
                    )}
                    {...props}
                  >
                    {isSheet && showDragHandle && !isLocked && (
                      <div
                        role="separator"
                        tabIndex={0}
                        aria-label="Resize sheet"
                        aria-orientation={
                          horizontal ? "vertical" : "horizontal"
                        }
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={sizePercentage}
                        className={clsx(
                          "absolute z-20 flex items-center justify-center touch-none select-none focus-visible:outline-2 focus-visible:outline-primary",
                          horizontal
                            ? "inset-y-0 w-11 cursor-ew-resize"
                            : "inset-x-0 h-11 cursor-ns-resize",
                          side === "bottom" && "top-0",
                          side === "top" && "bottom-0",
                          side === "left" && "right-0",
                          side === "right" && "left-0",
                        )}
                        onPointerDown={startResize}
                        onPointerMove={moveResize}
                        onPointerUp={(event) => finishResize(event)}
                        onPointerCancel={(event) => finishResize(event, true)}
                        onLostPointerCapture={(event) =>
                          finishResize(event, true)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Home" || event.key === "End") {
                            event.preventDefault();
                            onExpandedChange(event.key === "End");
                          } else if (
                            (horizontal
                              ? ["ArrowLeft", "ArrowRight"]
                              : ["ArrowUp", "ArrowDown"]
                            ).includes(event.key) &&
                            contentRef.current
                          ) {
                            event.preventDefault();
                            const growKey = {
                              left: "ArrowRight",
                              right: "ArrowLeft",
                              top: "ArrowDown",
                              bottom: "ArrowUp",
                            }[side];
                            if (event.key === growKey) onExpandedChange(true);
                            else if (expanded) onExpandedChange(false);
                            else onOpenChange(false);
                          }
                        }}
                      >
                        <div
                          className={clsx(
                            "rounded-full bg-on-surface-variant/30",
                            horizontal ? "h-10 w-1" : "h-1 w-10",
                          )}
                        />
                      </div>
                    )}
                    {children}
                  </motion.div>
                </DialogPrimitive.Content>
              </FocusTrap>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    );
  },
);
DialogContent.displayName = "DialogContent";

/** Accessible toggle between the edge sheet and full-page view. */
const DialogExpand = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, className, onClick, ...props }, ref) => {
  const { variant, expanded, onExpandedChange } = useDialogContext();
  if (variant === "basic") return null;
  const label = expanded ? "Collapse to sheet" : "Expand to full page";
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      title={label}
      className={twMerge(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-on-surface/10 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50",
        className,
      )}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onExpandedChange(!expanded);
      }}
    >
      {children ??
        (expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />)}
    </button>
  );
});
DialogExpand.displayName = "DialogExpand";

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

const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const { variant } = useDialogContext();
  return (
    <div
      className={clsx(
        variant === "basic" && "flex flex-col space-y-1.5 text-start",
        variant !== "basic" && [
          "flex shrink-0 flex-row items-center justify-between",
          "px-6 py-4 sm:px-8 sm:py-6",
          "bg-transparent border-b border-outline-variant",
          "touch-none select-none",
        ],
        className,
      )}
      {...props}
    />
  );
};

const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const { variant } = useDialogContext();
  return (
    <div
      className={clsx(
        variant === "basic" && "mt-6 flex justify-end gap-2",
        variant !== "basic" && [
          "flex shrink-0 flex-row gap-3",
          "px-6 py-4 sm:px-8 sm:py-6",
          "bg-transparent border-t border-outline-variant",
        ],
        className,
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
    if (variant !== "basic") {
      return (
        <ElasticScrollArea
          ref={ref}
          className={clsx(
            "min-h-0 flex-1 pt-0!",
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
  DialogExpand,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
