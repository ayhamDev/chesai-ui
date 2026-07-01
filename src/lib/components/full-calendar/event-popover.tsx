// src/lib/components/full-calendar/event-popover.tsx
"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { format } from "date-fns";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useDragControls,
} from "framer-motion";
import { GripHorizontal, Repeat, Trash2, X, Clock } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

import { Button } from "../button";
import { DatePicker } from "../date-picker/date-picker";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../sheet";
import { TimePicker } from "../time-picker";
import { Switch } from "../switch";
import { Select } from "../select";

import { useFullCalendar } from "./calendar-context";
import { RecurrenceDialog } from "./recurrence-dialog";
import type { CalendarEvent } from "./types";

const POPOVER_WIDTH = 380;

export const EventPopover = () => {
  const calendar = useFullCalendar();
  const {
    popover,
    closePopover,
    draftEvent,
    setDraftEvent,
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    hidePopoverTitle,
    hidePopoverTime,
    hidePopoverRecurrence,
    renderPopoverHeader,
    renderPopoverFooter,
    renderPopoverCustomFields,
  } = calendar;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const popoverRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState(450);

  // --- DYNAMIC HEIGHT MEASUREMENT ---
  useEffect(() => {
    if (
      !popover.isOpen ||
      isMobile ||
      typeof window === "undefined" ||
      !window.ResizeObserver
    )
      return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMeasuredHeight(entry.target.getBoundingClientRect().height);
      }
    });

    if (popoverRef.current) {
      observer.observe(popoverRef.current);
    }

    return () => observer.disconnect();
  }, [popover.isOpen, isMobile]);

  // --- VIEWPORT BOUNDARY CONSTRAINED POSITIONING ---
  useEffect(() => {
    if (popover.isOpen && !isMobile) {
      const padding = 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (popover.anchorRect) {
        let targetX = popover.anchorRect.right + padding;
        let targetY = popover.anchorRect.top;

        if (targetX + POPOVER_WIDTH > viewportWidth) {
          targetX = popover.anchorRect.left - POPOVER_WIDTH - padding;
        }

        if (targetY + measuredHeight > viewportHeight) {
          targetY = viewportHeight - measuredHeight - padding;
        }

        targetX = Math.max(
          padding,
          Math.min(targetX, viewportWidth - POPOVER_WIDTH - padding),
        );
        targetY = Math.max(
          padding,
          Math.min(targetY, viewportHeight - measuredHeight - padding),
        );

        x.set(targetX);
        y.set(targetY);
      } else {
        x.set(viewportWidth / 2 - POPOVER_WIDTH / 2);
        y.set(viewportHeight / 2 - measuredHeight / 2);
      }
    }
  }, [popover.isOpen, popover.anchorRect, isMobile, measuredHeight, x, y]);

  const [snap, setSnap] = useState<number | string | null>(1);

  const handleSave = async () => {
    if (!draftEvent) return;

    const finalStart = new Date(draftEvent.start);
    if (!draftEvent.isAllDay) {
      finalStart.setHours(
        draftEvent.start.getHours(),
        draftEvent.start.getMinutes(),
        0,
        0,
      );
    } else {
      finalStart.setHours(0, 0, 0, 0);
    }

    const finalEnd = new Date(draftEvent.end);
    if (!draftEvent.isAllDay) {
      finalEnd.setHours(
        draftEvent.end.getHours(),
        draftEvent.end.getMinutes(),
        0,
        0,
      );
    } else {
      finalEnd.setHours(23, 59, 59, 999);
    }

    const eventData: CalendarEvent = {
      ...draftEvent,
      start: finalStart,
      end: finalEnd,
      title: draftEvent.title || "(No title)",
    };

    delete eventData.isDraft;

    if (popover.mode === "create" && onEventCreate) {
      await onEventCreate(eventData);
    } else if (popover.mode === "edit" && onEventUpdate) {
      await onEventUpdate(eventData);
    }

    closePopover();
  };

  const handleDelete = async () => {
    if (draftEvent?.id && onEventDelete) {
      await onEventDelete(draftEvent.id);
    }
    closePopover();
  };

  const updateDraft = (updates: Partial<CalendarEvent>) => {
    setDraftEvent((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateDraftNested = (updates: Partial<CalendarEvent>) => {
    setDraftEvent((prev) => {
      if (!prev) return null;
      const mergedData =
        updates.data !== undefined
          ? { ...(prev.data || {}), ...updates.data }
          : prev.data;
      return { ...prev, ...updates, data: mergedData };
    });
  };

  const repeatOptions = draftEvent
    ? [
        { value: "none", label: "Does not repeat" },
        { value: "daily", label: "Daily" },
        {
          value: "weekly",
          label: `Weekly on ${format(draftEvent.start, "EEEE")}`,
        },
        {
          value: "monthly",
          label: `Monthly on the ${draftEvent.start.getDate()}`,
        },
        {
          value: "yearly",
          label: `Annually on ${format(draftEvent.start, "MMM d")}`,
        },
        { value: "weekdays", label: "Every weekday (Monday to Friday)" },
      ]
    : [];

  let activeRepeatValue = "none";

  if (draftEvent?.recurrence) {
    const r = draftEvent.recurrence;
    if (r.interval === 1 && r.endType === "never") {
      if (r.frequency === "daily") activeRepeatValue = "daily";
      else if (
        r.frequency === "weekly" &&
        r.daysOfWeek?.length === 1 &&
        r.daysOfWeek[0] === draftEvent.start.getDay()
      )
        activeRepeatValue = "weekly";
      else if (
        r.frequency === "weekly" &&
        r.daysOfWeek?.length === 5 &&
        [1, 2, 3, 4, 5].every((d) => r.daysOfWeek!.includes(d))
      )
        activeRepeatValue = "weekdays";
      else if (r.frequency === "monthly") activeRepeatValue = "monthly";
      else if (r.frequency === "yearly") activeRepeatValue = "yearly";
    }

    if (activeRepeatValue === "none") {
      activeRepeatValue = "custom_active";
      repeatOptions.push({
        value: "custom_active",
        label: "Custom Recurrence",
      });
    }
  }

  repeatOptions.push({ value: "custom", label: "Custom..." });

  const handleRepeatChange = (val: string) => {
    if (val === "none") {
      updateDraft({ recurrence: undefined });
    } else if (val === "custom") {
      setIsRecurrenceOpen(true);
    } else if (val === "weekdays") {
      updateDraft({
        recurrence: {
          frequency: "weekly",
          interval: 1,
          endType: "never",
          daysOfWeek: [1, 2, 3, 4, 5],
        },
      });
    } else if (val !== "custom_active") {
      updateDraft({
        recurrence: {
          frequency: val as any,
          interval: 1,
          endType: "never",
          daysOfWeek:
            val === "weekly" ? [draftEvent?.start?.getDay() || 0] : undefined,
        },
      });
    }
  };

  if (!draftEvent) return null;

  const formContent = (
    <div className="flex flex-col gap-6 p-6 font-manrope text-on-surface min-w-[340px]">
      {renderPopoverHeader && (
        <div className="flex flex-col gap-4">
          {renderPopoverHeader(draftEvent, updateDraftNested)}
        </div>
      )}

      {!hidePopoverTitle && (
        <div className="pl-10 pr-2">
          <Input
            variant="underlined"
            placeholder="Add title"
            value={draftEvent.title}
            onChange={(e) => updateDraft({ title: e.target.value })}
            autoFocus
            className="shadow-none px-0"
            classNames={{
              input: "text-2xl font-normal py-1 px-0",
              inputWrapper:
                "px-0 h-auto min-h-0 border-b-2 focus-within:border-primary",
            }}
          />
        </div>
      )}

      {!hidePopoverTime && (
        <div className="flex items-start gap-4">
          <Clock className="w-5 h-5 mt-2.5 text-on-surface-variant shrink-0" />
          <div className="flex flex-col gap-3 w-full min-w-0">
            <div className="flex items-center gap-1.5 w-full">
              <DatePicker
                variant="docked"
                inputVariant="filled"
                size="sm"
                shape="full"
                value={draftEvent.start}
                onChange={(d) => {
                  if (!d) return;
                  const newStart = new Date(draftEvent.start);
                  newStart.setFullYear(
                    d.getFullYear(),
                    d.getMonth(),
                    d.getDate(),
                  );

                  let newEnd = new Date(draftEvent.end);
                  if (!draftEvent.isAllDay) {
                    newEnd.setFullYear(
                      d.getFullYear(),
                      d.getMonth(),
                      d.getDate(),
                    );
                  } else if (draftEvent.end < newStart) {
                    newEnd.setFullYear(
                      d.getFullYear(),
                      d.getMonth(),
                      d.getDate(),
                    );
                  }
                  updateDraft({ start: newStart, end: newEnd });
                }}
              />
              {draftEvent.isAllDay && (
                <>
                  <span className="text-on-surface-variant shrink-0">-</span>
                  <DatePicker
                    variant="docked"
                    inputVariant="filled"
                    size="sm"
                    shape="full"
                    value={draftEvent.end}
                    onChange={(d) => {
                      if (!d) return;
                      const newEnd = new Date(draftEvent.end);
                      newEnd.setFullYear(
                        d.getFullYear(),
                        d.getMonth(),
                        d.getDate(),
                      );
                      updateDraft({ end: newEnd });
                      if (draftEvent.start > newEnd) {
                        const newStart = new Date(draftEvent.start);
                        newStart.setFullYear(
                          d.getFullYear(),
                          d.getMonth(),
                          d.getDate(),
                        );
                        updateDraft({ start: newStart });
                      }
                    }}
                  />
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 w-fit">
              <Switch
                id="all-day-switch"
                size="sm"
                checked={!!draftEvent.isAllDay}
                onCheckedChange={(val) => {
                  if (!val) {
                    const snappedEnd = new Date(draftEvent.end);
                    snappedEnd.setFullYear(
                      draftEvent.start.getFullYear(),
                      draftEvent.start.getMonth(),
                      draftEvent.start.getDate(),
                    );
                    updateDraft({ isAllDay: val, end: snappedEnd });
                  } else {
                    updateDraft({ isAllDay: val });
                  }
                }}
              />
              <label
                htmlFor="all-day-switch"
                className="font-medium text-on-surface-variant text-sm cursor-pointer select-none"
              >
                All day
              </label>
            </div>

            {!draftEvent.isAllDay && (
              <div className="flex items-center gap-1.5 w-full mt-1">
                <TimePicker
                  variant="docked"
                  inputVariant="filled"
                  size="sm"
                  shape="full"
                  value={draftEvent.start}
                  onChange={(d) => updateDraft({ start: d })}
                />
                <span className="text-on-surface-variant shrink-0">-</span>
                <TimePicker
                  variant="docked"
                  inputVariant="filled"
                  size="sm"
                  shape="full"
                  value={draftEvent.end}
                  onChange={(d) => updateDraft({ end: d })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {!hidePopoverRecurrence && (
        <div className="flex items-center gap-4 mt-2">
          <Repeat className="w-5 h-5 text-on-surface-variant shrink-0" />
          <div className="w-full">
            <Select
              variant="filled"
              size="sm"
              shape="full"
              value={activeRepeatValue}
              onValueChange={handleRepeatChange}
              items={repeatOptions}
            />
          </div>
        </div>
      )}

      {renderPopoverCustomFields && (
        <div className="mt-2 border-t border-outline-variant/30 pt-4 flex flex-col gap-4">
          {renderPopoverCustomFields(draftEvent, updateDraftNested)}
        </div>
      )}

      {renderPopoverFooter && (
        <div className="mt-2 border-t border-outline-variant/30 pt-4 flex flex-col gap-4">
          {renderPopoverFooter(draftEvent, updateDraftNested)}
        </div>
      )}
    </div>
  );

  if (!popover.isOpen) return null;

  if (isMobile) {
    return (
      <>
        <Sheet
          open={popover.isOpen}
          onOpenChange={(open) => !open && closePopover()}
          forceBottomSheet
          snapPoints={[0.6, 1]}
          activeSnapPoint={snap}
          setActiveSnapPoint={setSnap}
        >
          <SheetContent className="p-0 flex flex-col overflow-hidden h-full">
            <SheetHeader className="px-4 py-2 border-b border-outline-variant/20 shrink-0 flex-row justify-between items-center !space-y-0">
              <div className="flex items-center gap-2">
                <IconButton variant="ghost" onClick={closePopover}>
                  <X className="w-5 h-5" />
                </IconButton>
                <SheetTitle className="text-base font-semibold m-0">
                  {popover.mode === "create" ? "New Event" : "Edit Event"}
                </SheetTitle>
              </div>
              {popover.mode === "edit" && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-error hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="w-5 h-5" />
                </IconButton>
              )}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {formContent}
            </div>

            <div className="p-3 border-t border-outline-variant/20 bg-surface-container shrink-0 flex justify-end items-center pb-safe">
              <Button
                variant="primary"
                onClick={handleSave}
                className="px-8 rounded-full font-bold"
              >
                Save
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <RecurrenceDialog
          isOpen={isRecurrenceOpen}
          onClose={() => setIsRecurrenceOpen(false)}
          value={draftEvent.recurrence}
          onChange={(rule) => updateDraft({ recurrence: rule })}
          startDate={draftEvent.start}
        />
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[50]">
        <AnimatePresence>
          {popover.isOpen && (
            <motion.div
              ref={popoverRef}
              drag
              dragMomentum={false}
              dragControls={dragControls}
              dragListener={false}
              style={{
                x,
                y,
                width: "auto",
                minWidth: POPOVER_WIDTH,
                maxWidth: "calc(100vw - 32px)",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bg-surface-container-high border border-outline-variant/50 rounded-2xl shadow-2xl pointer-events-auto flex flex-col h-auto max-h-[90vh]"
            >
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  dragControls.start(e);
                }}
                className="flex items-center justify-between px-2 py-1.5 bg-surface-container-high border-b border-outline-variant/20 drag-handle cursor-move rounded-t-2xl shrink-0"
              >
                <IconButton
                  variant="ghost"
                  size="sm"
                  className="pointer-events-none opacity-50"
                >
                  <GripHorizontal className="w-4 h-4" />
                </IconButton>
                <div className="flex items-center gap-1">
                  {popover.mode === "edit" && draftEvent && (
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      className="text-error hover:bg-error/10 hover:text-error cursor-pointer pointer-events-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  )}
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={closePopover}
                    className="pointer-events-auto hover:bg-surface-container-highest cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>

              <div className="flex-1 max-h-[80vh] overflow-y-auto scrollbar-thin overflow-x-hidden min-h-0">
                {formContent}
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-outline-variant/20 bg-surface-container-high shrink-0 rounded-b-2xl">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  className="px-6 rounded-full font-bold"
                >
                  Save
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RecurrenceDialog
        isOpen={isRecurrenceOpen}
        onClose={() => setIsRecurrenceOpen(false)}
        value={draftEvent.recurrence}
        onChange={(rule) => updateDraft({ recurrence: rule })}
        startDate={draftEvent.start}
      />
    </>
  );
};
