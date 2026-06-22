"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import {
  AnimatePresence,
  motion,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { DURATION, EASING } from "../stack-router/transitions";
import { Divider } from "../divider";

export type SearchViewShape = "full" | "minimal" | "sharp";

export interface SearchViewProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  dockedLeadingIcon?: React.ReactNode;
  dockedTrailingIcon?: React.ReactNode;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  desktopRadius?: string | number;
  className?: string;
  variant?: "modal" | "docked" | "fullscreen";
  triggerVariant?: "default" | "minimal" | "icon";
  color?: "surface" | "primary" | "secondary" | "transparent";
  expandedHeight?: number | string;
  expandedMinHeight?: number | string;
  expandedMaxHeight?: number | string;
  showOverlay?: boolean;
  shape?: SearchViewShape;
  duration?: number;
  easing?: string | number[];
}

const COLOR_VARIANTS = {
  surface: {
    trigger:
      "bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface",
    expandedHeader: "bg-surface-container-high text-on-surface",
    expandedBody: "bg-surface-container-high",
    mutedText: "text-on-surface-variant",
    placeholder: "text-on-surface-variant/60",
    inputPlaceholder: "placeholder:text-on-surface-variant/60",
  },
  primary: {
    trigger:
      "bg-primary-container hover:bg-primary-container/90 text-on-primary-container",
    expandedHeader: "bg-primary-container text-on-primary-container",
    expandedBody: "bg-surface-container-low",
    mutedText: "text-on-primary-container/80",
    placeholder: "text-on-primary-container/60",
    inputPlaceholder: "placeholder:text-on-primary-container/60",
  },
  secondary: {
    trigger:
      "bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container",
    expandedHeader: "bg-secondary-container text-on-secondary-container",
    expandedBody: "bg-surface-container",
    mutedText: "text-on-secondary-container/80",
    placeholder: "text-on-secondary-container/60",
    inputPlaceholder: "placeholder:text-on-secondary-container/60",
  },
  transparent: {
    trigger:
      "bg-transparent hover:bg-surface-container-highest/30 text-on-surface",
    expandedHeader: "bg-surface-container-high text-on-surface",
    expandedBody: "bg-surface-container-high",
    mutedText: "text-on-surface-variant",
    placeholder: "text-on-surface-variant/60",
    inputPlaceholder: "placeholder:text-on-surface-variant/60",
  },
};

const TRIGGER_SHAPE_CLASSES: Record<SearchViewShape, string> = {
  full: "rounded-full",
  minimal: "rounded-xl",
  sharp: "rounded-none",
};

export const SearchView = ({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search...",
  dockedLeadingIcon,
  dockedTrailingIcon,
  children,
  open: controlledOpen,
  onOpenChange,
  desktopRadius,
  className,
  variant = "modal",
  triggerVariant = "default",
  color = "surface",
  expandedHeight,
  expandedMinHeight,
  expandedMaxHeight,
  showOverlay = true,
  shape = "full",
  duration = DURATION.medium3,
  easing = EASING.expressiveDefaultEffects,
}: SearchViewProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const effectiveVariant = isMobile ? "fullscreen" : variant;
  const colors = COLOR_VARIANTS[color];

  const updateRect = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect((prev) => {
        if (
          prev &&
          prev.top === rect.top &&
          prev.left === rect.left &&
          prev.width === rect.width &&
          prev.height === rect.height
        ) {
          return prev;
        }
        return rect;
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("resize", updateRect);
      window.addEventListener("scroll", updateRect, { capture: true });
      updateRect();
    }
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, { capture: true });
    };
  }, [isOpen, updateRect]);

  const handleOpen = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest(
      "a, [role='button'], [role='menuitem'], [role='option']",
    );
    if (isInteractive && triggerVariant !== "icon") return;

    updateRect();
    if (!isControlled) setInternalOpen(true);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    updateRect();
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(value);
    inputRef.current?.blur();
  };

  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.current) return [];
    const selector = "input, button, [role='button'], a, [tabindex='0']";
    const elements =
      containerRef.current.querySelectorAll<HTMLElement>(selector);
    return Array.from(elements).filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        el.getAttribute("tabindex") !== "-1" &&
        !el.hasAttribute("disabled")
      );
    });
  };

  const getResultElements = (): HTMLElement[] => {
    if (!bodyRef.current) return [];
    const selector = "button, [role='button'], a, [tabindex='0']";
    const elements = bodyRef.current.querySelectorAll<HTMLElement>(selector);
    return Array.from(elements).filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        el.getAttribute("tabindex") !== "-1" &&
        !el.hasAttribute("disabled")
      );
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        handleClose();
        return;
      }

      const focusable = getFocusableElements();
      const results = getResultElements();
      const active = document.activeElement as HTMLElement;

      if (e.key === "Tab" && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      } else if (e.key === "ArrowDown" && results.length > 0) {
        e.preventDefault();
        if (active === inputRef.current) {
          results[0].focus();
        } else {
          const idx = results.indexOf(active);
          if (idx !== -1 && idx < results.length - 1) {
            results[idx + 1].focus();
          } else {
            inputRef.current?.focus();
          }
        }
      } else if (e.key === "ArrowUp" && results.length > 0) {
        e.preventDefault();
        if (active === inputRef.current) {
          results[results.length - 1].focus();
        } else {
          const idx = results.indexOf(active);
          if (idx > 0) {
            results[idx - 1].focus();
          } else {
            inputRef.current?.focus();
          }
        }
      } else if (e.key === "Enter") {
        const idx = results.indexOf(active);
        if (idx !== -1) {
          e.preventDefault();
          active.click();
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (effectiveVariant !== "docked") {
        document.body.style.overflow = "hidden";
      }

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, duration * 1000);

      return () => {
        document.body.style.overflow = "";
        clearTimeout(timer);
      };
    }
  }, [isOpen, effectiveVariant, duration]);

  const getResolvedExpandedRadius = () => {
    if (effectiveVariant === "fullscreen") return 0;
    if (desktopRadius !== undefined) return desktopRadius;

    switch (shape) {
      case "sharp":
        return 0;
      case "minimal":
        return 12;
      case "full":
      default:
        return 28;
    }
  };

  const getAnimationTarget = () => {
    if (!triggerRect) return {};
    switch (effectiveVariant) {
      case "fullscreen":
        return {
          top: 0,
          left: 0,
          x: 0,
          width: "100vw",
          height: "100dvh",
          borderRadius: 0,
        };
      case "docked": {
        const available = window.innerHeight - triggerRect.top - 20;
        let h = expandedHeight;

        if (h === undefined) {
          const maxH =
            typeof expandedMaxHeight === "number" ? expandedMaxHeight : 600;
          h = Math.min(maxH, available);
        }

        return {
          top: triggerRect.top,
          left: triggerRect.left,
          width: triggerRect.width,
          height: h,
          minHeight: expandedMinHeight,
          maxHeight: expandedMaxHeight,
          borderRadius: getResolvedExpandedRadius(),
        };
      }
      case "modal":
      default:
        return {
          top: "8vh",
          left: "50%",
          x: "-50%",
          width: 680,
          height: expandedHeight ?? expandedMaxHeight ?? 600,
          minHeight: expandedMinHeight,
          maxHeight: expandedMaxHeight,
          borderRadius: getResolvedExpandedRadius(),
        };
    }
  };

  const getUnexpandedBorderRadius = () => {
    if (triggerVariant === "icon") return 999;
    switch (shape) {
      case "sharp":
        return 0;
      case "minimal":
        return 12;
      case "full":
      default:
        return triggerRect ? triggerRect.height / 2 : 28;
    }
  };

  const ExpandedView = triggerRect && (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "auto" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration, ease: easing }}
        className={clsx(
          "absolute inset-0 transition-colors",
          showOverlay ? "bg-black/40" : "bg-transparent",
        )}
        onClick={handleClose}
      />

      <motion.div
        ref={containerRef}
        initial={{
          top: triggerRect.top,
          left: triggerRect.left,
          width: triggerRect.width,
          height: triggerRect.height,
          borderRadius: getUnexpandedBorderRadius(),
          x: 0,
        }}
        animate={getAnimationTarget() as any}
        exit={{
          top: triggerRect.top,
          left: triggerRect.left,
          width: triggerRect.width,
          height: triggerRect.height,
          borderRadius: getUnexpandedBorderRadius(),
          x: 0,
          transition: { duration: duration, ease: easing },
        }}
        transition={{
          duration: duration,
          ease: easing,
        }}
        className={clsx(
          "absolute flex flex-col shadow-2xl overflow-hidden transform-3d",
          effectiveVariant === "docked" && "shadow-3xl",
          colors.expandedHeader,
        )}
      >
        <div className="relative h-[56px] shrink-0">
          {/* 1. INTERACTIVE HEADER LAYER (Fades in slightly delayed) */}
          <motion.div
            className="absolute inset-0 flex items-center px-2 gap-2 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, delay: 0.1 }}
          >
            <div className="flex h-12 w-12 items-center justify-center shrink-0">
              <IconButton
                variant="ghost"
                onClick={handleClose}
                className={clsx(
                  color === "primary" || color === "secondary"
                    ? "text-inherit hover:bg-white/10"
                    : "text-on-surface",
                )}
              >
                <ArrowLeft className="h-6 w-6" />
              </IconButton>
            </div>

            <form
              className="flex-1 h-full flex items-center"
              onSubmit={handleSubmit}
            >
              <input
                ref={inputRef}
                className={clsx(
                  "h-full w-full bg-transparent text-lg outline-none",
                  "text-inherit",
                  colors.inputPlaceholder,
                )}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </form>

            <div className="flex items-center pr-2 shrink-0">
              {value && (
                <IconButton
                  variant="ghost"
                  onClick={handleClear}
                  className={clsx(
                    color === "primary" || color === "secondary"
                      ? "text-inherit hover:bg-white/10"
                      : "text-on-surface",
                  )}
                >
                  <X className="h-6 w-6" />
                </IconButton>
              )}
            </div>
          </motion.div>

          {/* 2. MOCK TRIGGER LAYER (Contains both Icons AND Text, fades out perfectly aligned) */}
          <motion.div
            className="absolute inset-0 flex items-center px-4 pointer-events-none z-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {triggerVariant !== "icon" && dockedLeadingIcon ? (
              <div className="flex h-12 w-12 items-center justify-center text-inherit shrink-0 -ml-2">
                {dockedLeadingIcon}
              </div>
            ) : triggerVariant === "icon" ? (
              <div className="flex h-12 w-12 items-center justify-center text-inherit shrink-0">
                {dockedLeadingIcon || <Search className="h-6 w-6" />}
              </div>
            ) : null}

            {triggerVariant !== "icon" ? (
              <div
                className={clsx(
                  "flex-1 text-lg px-2 truncate",
                  value ? colors.mutedText : colors.placeholder,
                  triggerVariant === "minimal" && "text-center",
                )}
              >
                {value || placeholder}
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {triggerVariant !== "icon" && dockedTrailingIcon && (
              <div className="flex items-center pl-2 shrink-0">
                {dockedTrailingIcon}
              </div>
            )}
          </motion.div>
        </div>

        <Divider className="my-0!" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: duration, delay: 0.1 }}
          className={clsx("flex-1 relative min-h-0", colors.expandedBody)}
        >
          <div ref={bodyRef} className="h-full w-full">
            <ElasticScrollArea className="h-full w-full">
              {children}
            </ElasticScrollArea>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

  const TriggerComponent = () => {
    if (triggerVariant === "icon") {
      return (
        <IconButton
          ref={triggerRef as any}
          onClick={handleOpen}
          variant="ghost"
          className={clsx(
            "text-on-surface hover:bg-surface-container-highest",
            isOpen ? "opacity-0 pointer-events-none" : "opacity-100",
            className,
          )}
          aria-label={placeholder}
        >
          {dockedLeadingIcon || <Search className="h-6 w-6" />}
        </IconButton>
      );
    }

    if (triggerVariant === "minimal") {
      return (
        <div
          ref={triggerRef as any}
          onClick={handleOpen}
          className={clsx(
            "relative flex h-[56px] w-full cursor-pointer items-center justify-center px-4 transition-all duration-200",
            TRIGGER_SHAPE_CLASSES[shape],
            colors.trigger,
            isOpen
              ? "opacity-0 pointer-events-none"
              : "opacity-100 hover:shadow-md",
            className,
          )}
        >
          <span
            className={clsx(
              "text-lg truncate select-none text-center",
              value ? colors.mutedText : colors.placeholder,
            )}
          >
            {value || placeholder}
          </span>
        </div>
      );
    }

    return (
      <div
        ref={triggerRef as any}
        onClick={handleOpen}
        className={clsx(
          "relative flex h-[56px] w-full cursor-pointer items-center px-4 transition-all duration-200",
          TRIGGER_SHAPE_CLASSES[shape],
          colors.trigger,
          isOpen
            ? "opacity-0 pointer-events-none"
            : "opacity-100 hover:shadow-md",
          className,
        )}
      >
        {dockedLeadingIcon && (
          <div className="flex h-12 w-12 items-center justify-center text-inherit shrink-0 -ml-2">
            {dockedLeadingIcon}
          </div>
        )}
        <div
          className={clsx(
            "flex flex-1 items-center px-2 text-lg truncate select-none",
            value ? colors.mutedText : colors.placeholder,
          )}
        >
          {value || placeholder}
        </div>
        {dockedTrailingIcon && (
          <div className="flex items-center pl-2 shrink-0">
            {dockedTrailingIcon}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <TriggerComponent />
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>{isOpen && ExpandedView}</AnimatePresence>,
          document.body,
        )}
    </>
  );
};
