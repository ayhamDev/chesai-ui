// src/lib/components/full-calendar/event-popover.tsx
"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { format } from "date-fns";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { Check, Clock, GripHorizontal, Repeat, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "../src/lib/components/button";
import { DatePicker } from "../src/lib/components/date-picker/date-picker";
import { IconButton } from "../src/lib/components/icon-button";
import { Input } from "../src/lib/components/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../src/lib/components/sheet";
import { TimePicker } from "../src/lib/components/time-picker";
import { Typography } from "../src/lib/components/typography";
import { Switch } from "../src/lib/components/switch";
import { Select } from "../src/lib/components/select";
import { NumberInput } from "../src/lib/components/number-input";

import { useFullCalendar } from "./calendar-context";
import type { CalendarEvent, RecurrenceRule } from "./types";

const POPOVER_WIDTH = 380;

const COLOR_PALETTE = [
  { name: "primary", hex: "var(--md-sys-color-primary)" },
  { name: "secondary", hex: "var(--md-sys-color-secondary)" },
  { name: "tertiary", hex: "var(--md-sys-color-tertiary)" },
  { name: "success", hex: "#22c55e" },
  { name: "error", hex: "var(--md-sys-color-error)" },
  { name: "gray", hex: "#64748b" },
  { name: "indigo", hex: "#6366f1" },
  { name: "teal", hex: "#14b8a6" },
  { name: "pink", hex: "#ec4899" },
] as const;

const formatRecurrence = (rule: RecurrenceRule, startDate: Date) => {
  const f = rule.frequency;
  const i = rule.interval;
  let s = "";

  if (i > 1) {
    s = `Every ${i} ${f === "daily" ? "days" : f === "weekly" ? "weeks" : f === "monthly" ? "months" : "years"}`;
  } else {
    s =
      f === "daily"
        ? "Daily"
        : f === "weekly"
          ? "Weekly"
          : f === "monthly"
            ? "Monthly"
            : "Annually";
  }

  if (f === "weekly" && rule.daysOfWeek && rule.daysOfWeek.length > 0) {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    if (rule.daysOfWeek.length === 7) {
      s = i > 1 ? `Every ${i} weeks on all days` : "Every day";
    } else if (
      rule.daysOfWeek.length === 5 &&
      [1, 2, 3, 4, 5].every((d) => rule.daysOfWeek!.includes(d))
    ) {
      s =
        i > 1
          ? `Every ${i} weeks on weekdays`
          : "Every weekday (Monday to Friday)";
    } else {
      s += ` on ${rule.daysOfWeek.map((d) => dayNames[d]).join(", ")}`;
    }
  } else if (f === "monthly") {
    s += ` on day ${startDate.getDate()}`;
  } else if (f === "yearly") {
    s += ` on ${format(startDate, "MMM d")}`;
  }

  if (rule.endType === "on_date" && rule.until) {
    s += `, until ${format(rule.until, "MMM d, yyyy")}`;
  } else if (rule.endType === "after_occurrences" && rule.count) {
    s += `, for ${rule.count} occurrences`;
  }

  return s;
};

const CustomRadioOption = ({
  checked,
  onChange,
  label,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center gap-4 h-10 w-full">
    <label className="flex items-center gap-3 cursor-pointer shrink-0">
      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
        <input
          type="radio"
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div
          className={clsx(
            "w-5 h-5 rounded-full border-2 transition-colors",
            checked
              ? "border-primary"
              : "border-outline-variant hover:border-on-surface-variant",
          )}
        />
        <div
          className={clsx(
            "absolute w-2.5 h-2.5 rounded-full bg-primary transition-transform duration-200",
            checked ? "scale-100" : "scale-0",
          )}
        />
      </div>
      <span className="text-sm font-medium text-on-surface select-none">
        {label}
      </span>
    </label>
    {children && <div className="flex-1 flex items-center">{children}</div>}
  </div>
);

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
    renderPopoverCustomFields,
  } = calendar;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [isRecurrenceOpen, setIsRecurrenceOpen] = useState(false);
  const [recurrenceDraft, setRecurrenceDraft] = useState<RecurrenceRule>({
    frequency: "weekly",
    interval: 1,
    daysOfWeek: [],
    endType: "never",
    count: 13,
    until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  useEffect(() => {
    if (popover.isOpen && !isMobile && popover.anchorRect) {
      const padding = 16;
      let targetX = popover.anchorRect.right + padding;
      let targetY = popover.anchorRect.top;

      if (targetX + POPOVER_WIDTH > window.innerWidth) {
        targetX = popover.anchorRect.left - POPOVER_WIDTH - padding;
      }

      const estimatedHeight = 400;
      if (targetY + estimatedHeight > window.innerHeight) {
        targetY = window.innerHeight - estimatedHeight - padding;
      }

      x.set(Math.max(padding, targetX));
      y.set(Math.max(padding, targetY));
    } else if (popover.isOpen && !isMobile && !popover.anchorRect) {
      x.set(window.innerWidth / 2 - POPOVER_WIDTH / 2);
      y.set(window.innerHeight / 2 - 200);
    }
  }, [popover.isOpen, popover.anchorRect, isMobile, x, y]);

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
        label: formatRecurrence(r, draftEvent.start),
      });
    }
  }

  repeatOptions.push({ value: "custom", label: "Custom..." });

  const handleRepeatChange = (val: string) => {
    if (val === "none") {
      updateDraft({ recurrence: undefined });
    } else if (val === "custom") {
      setRecurrenceDraft(
        draftEvent?.recurrence || {
          frequency: "weekly",
          interval: 1,
          daysOfWeek: [draftEvent?.start?.getDay() || 0],
          endType: "never",
          count: 13,
          until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      );
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
      <div className="pl-10 pr-2">
        <Input
          variant="underlined"
          placeholder={
            draftEvent.type === "task" ? "Add task title" : "Add title"
          }
          value={draftEvent.title}
          onChange={(e) => updateDraft({ title: e.target.value })}
          autoFocus
          className="shadow-none px-0"
          classNames={{
            input: "text-2xl font-normal py-1 px-0",
            inputWrapper: "px-0 h-auto min-h-0",
          }}
        />

        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={draftEvent.type === "event" ? "primary" : "ghost"}
            size="sm"
            shape="minimal"
            onClick={() => updateDraft({ type: "event" })}
            className={clsx(
              draftEvent.type !== "event" &&
                "text-on-surface-variant hover:bg-surface-container-highest",
            )}
          >
            Event
          </Button>
          <Button
            variant={draftEvent.type === "task" ? "primary" : "ghost"}
            size="sm"
            shape="minimal"
            onClick={() => updateDraft({ type: "task" })}
            className={clsx(
              draftEvent.type !== "task" &&
                "text-on-surface-variant hover:bg-surface-container-highest",
            )}
          >
            Task
          </Button>
        </div>
      </div>

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

      {draftEvent.type === "event" && (
        <div className="flex flex-col gap-2 pl-9">
          <Typography variant="label-small" className="font-bold opacity-70">
            Color
          </Typography>
          <div className="flex items-center flex-wrap gap-2.5">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() =>
                  updateDraft({
                    colorVariant: color.name as any,
                    colorHex: undefined,
                  })
                }
                className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                  draftEvent.colorVariant === color.name
                    ? "ring-2 ring-offset-2 ring-primary"
                    : "border border-outline-variant/20",
                )}
                style={{ backgroundColor: color.hex }}
                aria-label={`Select color ${color.name}`}
              >
                {draftEvent.colorVariant === color.name && (
                  <Check
                    className="w-3.5 h-3.5 text-white mix-blend-difference"
                    strokeWidth={3}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {renderPopoverCustomFields && (
        <div className="mt-2 border-t border-outline-variant/30 pt-4 flex flex-col gap-4">
          <Typography
            variant="label-small"
            className="font-bold opacity-70 uppercase tracking-tighter"
          >
            Custom Developer Fields
          </Typography>
          {renderPopoverCustomFields(draftEvent, (updates) => {
            if (updates.data !== undefined) {
              updateDraft({
                data: { ...(draftEvent.data || {}), ...updates.data },
              });
            }
          })}
        </div>
      )}
    </div>
  );

  const recurrenceDialog = (
    <AnimatePresence>
      {isRecurrenceOpen && (
        // Changed z-index from 99999 to 100 to allow radix popovers (z-1000) to overlay
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsRecurrenceOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-surface-container-high rounded-3xl shadow-2xl p-6 w-full max-w-[420px] flex flex-col gap-6"
          >
            <Typography variant="title-medium" className="font-bold">
              Custom recurrence
            </Typography>

            <div className="flex items-center gap-3">
              <Typography
                variant="body-medium"
                className="shrink-0 w-24 font-medium"
              >
                Repeat every
              </Typography>
              <div className="w-20">
                <NumberInput
                  size="sm"
                  variant="filled"
                  value={recurrenceDraft.interval}
                  onValueChange={(v) =>
                    setRecurrenceDraft((p) => ({ ...p, interval: Number(v) }))
                  }
                  min={1}
                  classNames={{
                    inputWrapper: "h-10 min-h-[40px] px-2",
                    input: "text-center",
                  }}
                />
              </div>
              <div className="flex-1">
                <Select
                  size="sm"
                  variant="filled"
                  value={recurrenceDraft.frequency}
                  onValueChange={(v) =>
                    setRecurrenceDraft((p) => ({ ...p, frequency: v as any }))
                  }
                  items={[
                    {
                      value: "daily",
                      label: recurrenceDraft.interval > 1 ? "days" : "day",
                    },
                    {
                      value: "weekly",
                      label: recurrenceDraft.interval > 1 ? "weeks" : "week",
                    },
                    {
                      value: "monthly",
                      label: recurrenceDraft.interval > 1 ? "months" : "month",
                    },
                    {
                      value: "yearly",
                      label: recurrenceDraft.interval > 1 ? "years" : "year",
                    },
                  ]}
                  classNames={{ trigger: "h-10 px-3" }}
                />
              </div>
            </div>

            {recurrenceDraft.frequency === "weekly" && (
              <div className="flex flex-col gap-2 mt-2">
                <Typography variant="body-medium" className="font-medium">
                  Repeat on
                </Typography>
                <div className="flex justify-between gap-1 mt-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
                    const isSelected =
                      recurrenceDraft.daysOfWeek?.includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setRecurrenceDraft((p) => {
                            const current = p.daysOfWeek || [];
                            const next = current.includes(idx)
                              ? current.filter((d) => d !== idx)
                              : [...current, idx];
                            return {
                              ...p,
                              daysOfWeek: next.length ? next : [idx],
                            };
                          });
                        }}
                        className={clsx(
                          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          isSelected
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80",
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-2">
              <Typography variant="body-medium" className="font-medium mb-1">
                Ends
              </Typography>

              <div className="flex flex-col gap-4">
                <CustomRadioOption
                  checked={recurrenceDraft.endType === "never"}
                  onChange={() =>
                    setRecurrenceDraft((p) => ({ ...p, endType: "never" }))
                  }
                  label="Never"
                />

                <CustomRadioOption
                  checked={recurrenceDraft.endType === "on_date"}
                  onChange={() =>
                    setRecurrenceDraft((p) => ({ ...p, endType: "on_date" }))
                  }
                  label="On"
                >
                  <div className="w-[180px]">
                    <DatePicker
                      variant="docked"
                      inputVariant="filled"
                      size="sm"
                      disabled={recurrenceDraft.endType !== "on_date"}
                      value={recurrenceDraft.until}
                      onChange={(d) =>
                        d && setRecurrenceDraft((p) => ({ ...p, until: d }))
                      }
                      classNames={{ inputWrapper: "h-10 min-h-[40px]" }}
                    />
                  </div>
                </CustomRadioOption>

                <CustomRadioOption
                  checked={recurrenceDraft.endType === "after_occurrences"}
                  onChange={() =>
                    setRecurrenceDraft((p) => ({
                      ...p,
                      endType: "after_occurrences",
                    }))
                  }
                  label="After"
                >
                  <div className="w-[180px] flex items-center gap-3">
                    <NumberInput
                      variant="filled"
                      size="sm"
                      disabled={recurrenceDraft.endType !== "after_occurrences"}
                      value={recurrenceDraft.count}
                      onValueChange={(v) =>
                        setRecurrenceDraft((p) => ({ ...p, count: Number(v) }))
                      }
                      min={1}
                      classNames={{
                        inputWrapper: "h-10 min-h-[40px] px-2",
                        input: "text-center",
                      }}
                    />
                    <Typography
                      variant="body-medium"
                      className="whitespace-nowrap opacity-80 font-normal"
                    >
                      occurrences
                    </Typography>
                  </div>
                </CustomRadioOption>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsRecurrenceOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  updateDraft({ recurrence: recurrenceDraft });
                  setIsRecurrenceOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
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
        {typeof document !== "undefined" &&
          createPortal(recurrenceDialog, document.body)}
      </>
    );
  }

  const desktopPopover = (
    <div className="fixed inset-0 pointer-events-none z-[50]">
      <AnimatePresence>
        {popover.isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            dragHandle=".drag-handle"
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
            <div className="flex items-center justify-between px-2 py-1.5 bg-surface-container-high border-b border-outline-variant/20 drag-handle cursor-move rounded-t-2xl shrink-0">
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
  );

  return (
    <>
      {typeof document !== "undefined" &&
        createPortal(desktopPopover, document.body)}
      {typeof document !== "undefined" &&
        createPortal(recurrenceDialog, document.body)}
    </>
  );
};
