"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Menu, Mic, Search, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "../icon-button";
import { Separator } from "../separator";
import { EASING } from "../stack-router/transitions";

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
}

// --- ANIMATION CONFIG ---
const MD3_EASE = [0.05, 0.7, 0.1, 1]; // Emphasized Decelerate
const DURATION = 0.4; // Slightly longer for the fade to breathe

export const SearchView = ({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search...",
  dockedLeadingIcon = <Menu className="h-6 w-6" />,
  dockedTrailingIcon,
  children,
  open: controlledOpen,
  onOpenChange,
  desktopRadius = "28px",
  className,
}: SearchViewProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // --- ACTIONS ---

  const handleOpen = () => {
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
      // Delay focus to ensure animation frame rate stays high
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, DURATION * 1000); // Focus AFTER expansion finishes
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  // --- RENDER ---

  const ExpandedView = triggerRect && (
    <div className="fixed inset-0 z-[9999]" style={{ pointerEvents: "auto" }}>
      {/* Backdrop with Fade */}
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
        }}
        animate={{
          top: isMobile ? 0 : "4vh",
          left: isMobile ? 0 : "50%",
          x: isMobile ? 0 : "-50%",
          width: isMobile ? "100vw" : 680,
          height: isMobile ? "100dvh" : 600,
          borderRadius: isMobile ? 0 : desktopRadius,
        }}
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
          duration: DURATION,
          ease: EASING.iOS,
        }}
        className="absolute flex flex-col bg-graphite-card shadow-2xl overflow-hidden"
        style={{ willChange: "top, left, width, height, border-radius" }}
      >
        {/* 
            HEADER CROSS-FADE AREA 
            We overlay the "Docked" look and the "Expanded" look and cross-fade them.
        */}
        <div className="relative h-[72px] shrink-0">
          {/* 1. REAL HEADER (Fades IN) */}
          <motion.div
            className="absolute inset-0 flex items-center px-2 gap-2 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Delay slightly so the expansion starts before we show new controls
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
                <ArrowLeft className="h-6 w-6 text-graphite-foreground" />
              </IconButton>
            </div>

            <form
              className="flex-1 h-full flex items-center"
              onSubmit={handleSubmit}
            >
              <input
                ref={inputRef}
                className="h-full w-full bg-transparent text-lg text-graphite-foreground outline-none placeholder:text-graphite-foreground/60"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </form>

            <div className="flex items-center pr-2 shrink-0">
              {value && (
                <IconButton variant="ghost" onClick={handleClear}>
                  <X className="h-6 w-6 text-graphite-foreground" />
                </IconButton>
              )}
              <IconButton variant="ghost">
                <Mic className="h-6 w-6 text-graphite-foreground" />
              </IconButton>
            </div>
          </motion.div>

          {/* 2. FAKE DOCKED HEADER (Fades OUT) */}
          {/* This mimics the docked bar so it looks like it morphs from it */}
          <motion.div
            className="absolute inset-0 flex items-center px-4 z-0 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Match padding/margins of the DockedBar below exactly */}
            <div className="flex h-12 w-12 items-center justify-center text-graphite-foreground shrink-0 -ml-2">
              {dockedLeadingIcon}
            </div>
            <div className="flex-1 text-base text-graphite-foreground/60 px-2 truncate">
              {value || placeholder}
            </div>
            <div className="flex items-center pl-2 shrink-0">
              {dockedTrailingIcon}
            </div>
          </motion.div>
        </div>

        <Separator className="shrink-0" />

        {/* RESULTS BODY (Slide Up + Fade In) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* 
        DOCKED BAR (Trigger)
        We simply hide this (opacity-0) when open to prevent layout shifts.
      */}
      <div
        ref={triggerRef}
        onClick={handleOpen}
        className={clsx(
          "relative flex h-[56px] w-full cursor-pointer items-center rounded-full bg-graphite-secondary px-4 transition-all duration-200",
          isOpen
            ? "opacity-0 pointer-events-none"
            : "opacity-100 hover:shadow-md",
          className
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center text-graphite-foreground shrink-0 -ml-2">
          {dockedLeadingIcon}
        </div>

        <div className="flex flex-1 items-center px-2 text-base text-graphite-foreground/60 truncate select-none">
          {value || placeholder}
        </div>

        <div className="flex items-center pl-2 shrink-0">
          {dockedTrailingIcon}
        </div>
      </div>

      {/* PORTAL FOR EXPANDED VIEW */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>{isOpen && ExpandedView}</AnimatePresence>,
          document.body
        )}
    </>
  );
};
