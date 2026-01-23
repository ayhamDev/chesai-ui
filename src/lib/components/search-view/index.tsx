"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Mic, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { Separator } from "../separator";
import { DURATION, EASING } from "../stack-router/transitions";

// --- PROPS ---
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
  /**
   * The presentation style of the expanded view.
   * - `modal`: Centers the view on screen with a backdrop (Standard MD3).
   * - `docked`: Expands from the trigger position, maintaining width (Like a menu).
   * - `fullscreen`: Covers the entire screen (Standard Mobile).
   *
   * On mobile devices, this defaults to `fullscreen` regardless of setting.
   * @default "modal"
   */
  variant?: "modal" | "docked" | "fullscreen";
}

// --- ANIMATION CONFIG ---
const MD3_EASE = EASING.emphasizedDecelerate;
const TRANSITION_DURATION = DURATION.medium4;

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
}: SearchViewProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Determine effective variant (Mobile always forces fullscreen)
  const effectiveVariant = isMobile ? "fullscreen" : variant;

  // --- ACTIONS ---

  const handleOpen = (e: React.MouseEvent) => {
    // --- SMART CLICK DETECTION ---
    // If the user clicked on a button, link, or menu item nested inside the trigger,
    // we assume they wanted to interact with that specific element, not open the search view.
    const target = e.target as HTMLElement;
    const isInteractive = target.closest(
      "button, a, [role='button'], [role='menuitem'], [role='option']",
    );

    if (isInteractive) {
      return;
    }

    // Capture rect for animation origin
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect(rect);
    }

    if (!isControlled) setInternalOpen(true);
    onOpenChange?.(true);
  };

  const handleClose = () => {
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

  // --- EFFECT: Lock Body & Focus ---
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, TRANSITION_DURATION * 1000);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // --- EFFECT: Handle Escape Key ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // --- ANIMATION STATES ---
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
          left: triggerRect.left,
          x: 0,
          width: triggerRect.width,
          // Expand downwards, but keep some padding from bottom of screen
          height: Math.min(600, window.innerHeight - triggerRect.top - 20),
          borderRadius: desktopRadius,
        };
      case "modal":
      default:
        return {
          top: "4vh",
          left: "50%",
          x: "-50%",
          width: 680,
          height: 600,
          borderRadius: desktopRadius,
        };
    }
  };

  // --- RENDER ---

  const ExpandedView = triggerRect && (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "auto" }}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* The Expanding Container */}
      <motion.div
        initial={{
          top: triggerRect.top,
          left: triggerRect.left,
          width: triggerRect.width,
          height: triggerRect.height,
          borderRadius: "28px", // Start as pill
          x: 0,
        }}
        animate={getAnimationTarget() as any}
        exit={{
          top: triggerRect.top,
          left: triggerRect.left,
          width: triggerRect.width,
          height: triggerRect.height,
          borderRadius: "28px",
          x: 0,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
        transition={{
          duration: TRANSITION_DURATION,
          ease: EASING.expressiveDefaultEffects,
        }}
        className={clsx(
          "absolute flex flex-col bg-surface-container-high shadow-2xl overflow-hidden transform-3d",
          // If docked, we usually want slightly higher elevation or border
          effectiveVariant === "docked" && "shadow-3xl",
        )}
        style={{
          willChange: "top, left, width, height, border-radius, transform",
        }}
      >
        {/* 
            HEADER CROSS-FADE AREA 
        */}
        <div className="relative h-[56px] shrink-0">
          {/* 1. REAL HEADER (Fades IN) */}
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
              >
                <ArrowLeft className="h-6 w-6 text-on-surface" />
              </IconButton>
            </div>

            <form
              className="flex-1 h-full flex items-center"
              onSubmit={handleSubmit}
            >
              <input
                ref={inputRef}
                className="h-full w-full bg-transparent text-lg text-on-surface outline-none placeholder:text-on-surface-variant/60"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </form>

            <div className="flex items-center pr-2 shrink-0">
              {value && (
                <IconButton variant="ghost" onClick={handleClear}>
                  <X className="h-6 w-6 text-on-surface" />
                </IconButton>
              )}
              <IconButton variant="ghost">
                <Mic className="h-6 w-6 text-on-surface" />
              </IconButton>
            </div>
          </motion.div>

          {/* 2. FAKE DOCKED HEADER (Fades OUT) */}
          <motion.div
            className="absolute inset-0 flex items-center px-4 z-0 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex h-12 w-12 items-center justify-center text-on-surface shrink-0 -ml-2">
              {dockedLeadingIcon}
            </div>
            <div className="flex-1 text-base text-on-surface-variant/60 px-2 truncate">
              {value || placeholder}
            </div>
            <div className="flex items-center pl-2 shrink-0">
              {dockedTrailingIcon}
            </div>
          </motion.div>
        </div>

        <Separator className="shrink-0" />

        {/* RESULTS BODY WITH ELASTIC SCROLL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 relative min-h-0 bg-surface-container-high"
        >
          <ElasticScrollArea className="h-full w-full">
            {children}
          </ElasticScrollArea>
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* TRIGGER */}
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className={clsx(
          "relative flex h-[56px] w-full cursor-pointer items-center rounded-full bg-surface-container-highest px-4 transition-all duration-200",
          isOpen
            ? "opacity-0 pointer-events-none"
            : "opacity-100 hover:shadow-md",
          className,
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center text-on-surface shrink-0 -ml-2">
          {dockedLeadingIcon}
        </div>

        <div className="flex flex-1 items-center px-2 text-base text-on-surface-variant/60 truncate select-none">
          {value || placeholder}
        </div>

        <div className="flex items-center pl-2 shrink-0">
          {dockedTrailingIcon}
        </div>
      </div>

      {/* PORTAL */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>{isOpen && ExpandedView}</AnimatePresence>,
          document.body,
        )}
    </>
  );
};
