"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Mic, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { Separator } from "../separator";
import { DURATION, EASING } from "../stack-router/transitions";

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
}

const TRANSITION_DURATION = DURATION.medium3;

const COLOR_VARIANTS = {
  surface: {
    trigger:
      "bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface",
    expandedHeader: "bg-surface-container-high text-on-surface",
    expandedBody: "bg-surface-container-high",
    placeholder: "text-on-surface-variant/60",
  },
  primary: {
    trigger:
      "bg-primary-container hover:bg-primary-container/90 text-on-primary-container",
    expandedHeader: "bg-primary-container text-on-primary-container",
    expandedBody: "bg-surface-container-low",
    placeholder: "text-on-primary-container/60",
  },
  secondary: {
    trigger:
      "bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container",
    expandedHeader: "bg-secondary-container text-on-secondary-container",
    expandedBody: "bg-surface-container",
    placeholder: "text-on-secondary-container/60",
  },
  transparent: {
    trigger:
      "bg-transparent hover:bg-surface-container-highest/30 text-on-surface",
    expandedHeader: "bg-surface-container-high text-on-surface",
    expandedBody: "bg-surface-container-high",
    placeholder: "text-on-surface-variant/60",
  },
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
  desktopRadius = "28px",
  className,
  variant = "modal",
  triggerVariant = "default",
  color = "surface",
}: SearchViewProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Live Re-measurement
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

  // Focus & Scroll Lock Logic
  useEffect(() => {
    if (isOpen) {
      // FIX: Do NOT lock scroll if variant is 'docked' to prevent layout shift
      if (effectiveVariant !== "docked") {
        document.body.style.overflow = "hidden";
      }

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, TRANSITION_DURATION * 1000);

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, effectiveVariant]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
      case "docked":
        return {
          top: triggerRect.top,
          left: triggerRect.left - 10,
          width: triggerRect.width,
          height: Math.min(600, window.innerHeight - triggerRect.top - 20),
          borderRadius: desktopRadius,
        };
      case "modal":
      default:
        return {
          top: "8vh",
          left: "50%",
          x: "-50%",
          width: 680,
          height: 600,
          borderRadius: desktopRadius,
        };
    }
  };

  const triggerBorderRadius = triggerRect ? triggerRect.height / 2 : 28;

  const ExpandedView = triggerRect && (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "auto" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      <motion.div
        initial={{
          top: triggerRect.top,
          left: triggerRect.left,
          width: triggerRect.width,
          height: triggerRect.height,
          borderRadius: triggerVariant === "icon" ? 999 : triggerBorderRadius,
          x: 0,
        }}
        animate={getAnimationTarget() as any}
        exit={{
          top: triggerRect.top,
          left: triggerRect.left,
          width: triggerRect.width,
          height: triggerRect.height,
          borderRadius: triggerVariant === "icon" ? 999 : triggerBorderRadius,
          // FIX: Nudge left slightly on exit to correct visual alignment
          x: effectiveVariant === "fullscreen" ? 0 : -10,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
        transition={{
          duration: TRANSITION_DURATION,
          ease: EASING.expressiveDefaultEffects,
        }}
        className={clsx(
          "absolute flex flex-col shadow-2xl overflow-hidden transform-3d",
          effectiveVariant === "docked" && "shadow-3xl",
          colors.expandedHeader,
        )}
      >
        <div className="relative h-[56px] shrink-0">
          <motion.div
            className="absolute inset-0 flex items-center px-2 gap-2 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
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
                  colors.placeholder,
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
              <IconButton
                variant="ghost"
                className={clsx(
                  color === "primary" || color === "secondary"
                    ? "text-inherit hover:bg-white/10"
                    : "text-on-surface",
                )}
              >
                <Mic className="h-6 w-6" />
              </IconButton>
            </div>
          </motion.div>

          {triggerVariant !== "icon" && (
            <motion.div
              className="absolute inset-0 flex items-center px-4 z-0 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {triggerVariant === "default" && (
                <div className="flex h-12 w-12 items-center justify-center text-inherit shrink-0 -ml-2">
                  {dockedLeadingIcon}
                </div>
              )}

              <div
                className={clsx(
                  "flex-1 text-lg px-2 truncate",
                  colors.placeholder,
                  triggerVariant === "minimal" && "text-center",
                )}
              >
                {value || placeholder}
              </div>

              {triggerVariant === "default" && (
                <div className="flex items-center pl-2 shrink-0">
                  {dockedTrailingIcon}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <Separator className="shrink-0 opacity-20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={clsx("flex-1 relative min-h-0", colors.expandedBody)}
        >
          <ElasticScrollArea className="h-full w-full">
            {children}
          </ElasticScrollArea>
        </motion.div>
      </motion.div>
    </div>
  );

  const TriggerComponent = () => {
    if (triggerVariant === "icon") {
      return (
        <IconButton
          // @ts-ignore
          ref={triggerRef}
          onClick={handleOpen}
          variant="ghost"
          className={clsx(
            "text-on-surface hover:bg-surface-container-highest",
            isOpen && "opacity-0",
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
          ref={triggerRef}
          onClick={handleOpen}
          className={clsx(
            "relative flex h-[56px] w-full cursor-pointer items-center justify-center rounded-full px-4 transition-all duration-200",
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
              value ? "text-inherit" : "opacity-70",
            )}
          >
            {value || placeholder}
          </span>
        </div>
      );
    }

    return (
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className={clsx(
          "relative flex h-[56px] w-full cursor-pointer items-center rounded-full px-4 transition-all duration-200",
          colors.trigger,
          isOpen
            ? "opacity-0 pointer-events-none"
            : "opacity-100 hover:shadow-md",
          className,
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center text-inherit shrink-0 -ml-2">
          {dockedLeadingIcon}
        </div>
        <div
          className={clsx(
            "flex flex-1 items-center px-2 text-lg truncate select-none",
            value ? "text-inherit" : "opacity-70",
          )}
        >
          {value || placeholder}
        </div>
        <div className="flex items-center pl-2 shrink-0">
          {dockedTrailingIcon}
        </div>
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
