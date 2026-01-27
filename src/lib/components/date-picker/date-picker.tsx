"use client";

import { parseDate } from "@internationalized/date";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { format, isValid } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, Edit2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../button";
import { DateInput } from "../date-input";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "../dialog";
import { IconButton } from "../icon-button";
import { inputWrapperVariants } from "../input";
import { Typography } from "../typography";
import { Calendar } from "./calendar";
import { InfiniteCalendar } from "./infinite-calendar";

// --- TYPES ---
type DatePickerVariant = "docked" | "modal" | "fullscreen";
type Shape = "full" | "minimal" | "sharp";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  variant?: DatePickerVariant;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  shape?: Shape;
  itemShape?: Shape;
}

// --- HELPER STYLES ---
const shapeStyles: Record<Shape, string> = {
  full: "rounded-[28px]",
  minimal: "rounded-xl",
  sharp: "rounded-none",
};

// --- HEADER COMPONENT ---
const DatePickerHeader = ({
  selectedDate,
  viewMode,
  onToggleView,
  onClose,
  isFullscreen,
}: {
  selectedDate?: Date;
  viewMode: "calendar" | "input";
  onToggleView: () => void;
  onClose: () => void;
  isFullscreen: boolean;
}) => {
  const formattedDate =
    selectedDate && isValid(selectedDate)
      ? format(selectedDate, "EEE, MMM d")
      : "Select date";

  return (
    <div
      className={clsx(
        "flex flex-col gap-1 shrink-0 px-6 pb-4 transition-colors",
        isFullscreen ? "pt-2" : "pt-4",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <Typography
          variant="label-medium"
          className="text-[11px] font-medium tracking-wide uppercase text-on-surface-variant"
        >
          {viewMode === "calendar" ? "Select date" : "Enter date"}
        </Typography>
        <div className="flex items-center gap-1">
          {isFullscreen && (
            <IconButton variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </IconButton>
          )}
        </div>
      </div>
      <div className="flex justify-between items-baseline">
        <Typography
          variant="display-small"
          className="text-3xl font-normal leading-tight text-on-surface transition-all"
        >
          {formattedDate}
        </Typography>
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onToggleView}
          aria-label={
            viewMode === "calendar" ? "Switch to input" : "Switch to calendar"
          }
        >
          {viewMode === "calendar" ? (
            <Edit2 className="h-4 w-4" />
          ) : (
            <CalendarIcon className="h-4 w-4" />
          )}
        </IconButton>
      </div>
    </div>
  );
};

// --- BODY COMPONENT ---
const DatePickerBody = ({
  viewMode,
  tempDate,
  setTempDate,
  itemShape,
  shape = "minimal",
  isFullscreen = false,
}: {
  viewMode: "calendar" | "input";
  tempDate?: Date;
  setTempDate: (d: Date) => void;
  itemShape?: Shape;
  shape?: Shape;
  isFullscreen?: boolean;
}) => {
  const ariaDate = React.useMemo(() => {
    if (!tempDate || !isValid(tempDate)) return undefined;
    try {
      return parseDate(format(tempDate, "yyyy-MM-dd"));
    } catch {
      return undefined;
    }
  }, [tempDate]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {viewMode === "input" ? (
        <motion.div
          key="input"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex w-full flex-col items-center justify-center gap-4 p-6"
        >
          <DateInput
            label="Date"
            value={ariaDate}
            onChange={(v) => {
              if (v) {
                setTempDate(v.toDate("UTC"));
              }
            }}
            variant="bordered"
            shape={shape}
            className="w-full"
          />
        </motion.div>
      ) : (
        <motion.div
          key="calendar"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={clsx(
            "flex w-full justify-center",
            isFullscreen ? "h-full" : "px-2",
          )}
        >
          {isFullscreen ? (
            // Fullscreen uses Infinite Vertical Scroll
            <InfiniteCalendar
              value={tempDate}
              onSelect={setTempDate}
              mode="single"
            />
          ) : (
            // Modal/Docked uses Standard Horizontal Slide
            <Calendar
              mode="single"
              value={tempDate}
              onSelect={setTempDate}
              itemShape={itemShape}
              shape={shape}
              variant="embedded"
              className="w-full"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- MAIN DATE PICKER ---

export const DatePicker = ({
  value,
  onChange,
  variant = "docked",
  label,
  placeholder = "Pick a date",
  disabled,
  shape = "minimal",
  itemShape = "full",
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(value);
  const [viewMode, setViewMode] = useState<"calendar" | "input">("calendar");

  useEffect(() => {
    if (open) {
      setTempDate(value || new Date());
      setViewMode("calendar");
    }
  }, [open, value]);

  const handleConfirm = () => {
    onChange?.(tempDate);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempDate(value);
    setOpen(false);
  };

  const displayValue =
    value && isValid(value) ? format(value, "PP") : placeholder;

  const TriggerButton = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen(true)}
      className={clsx(
        inputWrapperVariants({
          variant: "flat",
          size: "md",
          shape,
          disabled,
          isFocused: open,
        }),
        "w-full justify-start text-left font-normal bg-surface-container-low text-on-surface",
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
      <span>{displayValue}</span>
    </button>
  );

  // --- 1. DOCKED (POPOVER) ---
  if (variant === "docked") {
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label className="ml-1 text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <PopoverPrimitive.Trigger asChild>
            {TriggerButton}
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className={clsx(
              "z-50 w-auto bg-surface-container-high p-0 shadow-xl overflow-hidden",
              shapeStyles[shape],
              "data-[state=open]:animate-menu-enter",
              "data-[state=closed]:animate-menu-exit",
            )}
          >
            <Calendar
              mode="single"
              value={value}
              onSelect={(d) => {
                onChange?.(d);
                setOpen(false);
              }}
              itemShape={itemShape}
              shape={shape}
              variant="embedded"
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Root>
      </div>
    );
  }

  // --- 2. MODAL / FULLSCREEN (DIALOG) ---
  const isFullscreen = variant === "fullscreen";

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label className="ml-1 text-sm font-medium text-on-surface-variant">
          {label}
        </label>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
        variant={isFullscreen ? "fullscreen" : "basic"}
        animation="material3"
      >
        <DialogTrigger asChild>{TriggerButton}</DialogTrigger>
        <DialogContent
          variant="primary"
          // Enable Layout Animation ("size") to animate height/width changes automatically
          layout={!isFullscreen ? "size" : undefined}
          // Pass shape directly to DialogContent to affect the Card background
          shape={shape}
          className={clsx(
            "gap-0 overflow-hidden p-0 transition-[width,height]",
            !isFullscreen
              ? [
                  "min-w-[320px] max-w-[420px]! shadow-2xl",
                  shapeStyles[shape], // Apply border-radius to the wrapper
                ]
              : [
                  // CHANGE: Removed `shapeStyles[shape]` here.
                  // We let the DialogContent component handle the responsive shape
                  // (Sharp on mobile/full-width, Rounded on desktop).
                  "max-w-[500px]!",
                ],
          )}
          padding="sm"
        >
          {/* Header Area */}
          <DatePickerHeader
            selectedDate={tempDate}
            viewMode={viewMode}
            onToggleView={() =>
              setViewMode((v) => (v === "calendar" ? "input" : "calendar"))
            }
            onClose={() => setOpen(false)}
            isFullscreen={isFullscreen}
          />

          {/* Calendar/Input Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <DatePickerBody
              viewMode={viewMode}
              tempDate={tempDate}
              setTempDate={(d) => setTempDate(d)}
              itemShape={itemShape}
              shape={shape}
              isFullscreen={isFullscreen}
            />
          </div>

          {/* Action Buttons Area */}
          <DialogFooter className="flex justify-end gap-2 border-t border-transparent p-3 pr-4 shrink-0  z-30">
            <Button variant="ghost" onClick={handleCancel} shape={shape}>
              Cancel
            </Button>
            <Button variant="ghost" onClick={handleConfirm} shape={shape}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
