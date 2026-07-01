// src/lib/components/full-calendar/recurrence-dialog.tsx
"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";

import { Button } from "../button";
import { ButtonGroup } from "../button-group";
import { DatePicker } from "../date-picker/date-picker";
import { NumberInput } from "../number-input";
import { Select } from "../select";
import { Typography } from "../typography";
import type { RecurrenceRule } from "./types";

export interface RecurrenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  value?: RecurrenceRule;
  onChange: (rule: RecurrenceRule) => void;
  startDate?: Date;
}

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
  <div className="flex items-start gap-4 h-auto min-h-10 w-full py-1">
    <label className="flex items-center gap-3 cursor-pointer shrink-0 mt-2">
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

const DEFAULT_RULE: RecurrenceRule = {
  frequency: "weekly",
  interval: 1,
  daysOfWeek: [new Date().getDay()],
  endType: "never",
  count: 13,
  until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const NTH_NAMES = ["", "first", "second", "third", "fourth", "fifth"];
const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const RecurrenceDialog = ({
  isOpen,
  onClose,
  value,
  onChange,
  startDate = new Date(),
}: RecurrenceDialogProps) => {
  const [draft, setDraft] = useState<RecurrenceRule>(DEFAULT_RULE);

  // Derive target date calculations for monthly and yearly relative choices
  const dateCalculation = useMemo(() => {
    const dayOfWeek = startDate.getDay();
    const dateNum = startDate.getDate();
    const monthIndex = startDate.getMonth() + 1; // 1-12 range
    const nth = Math.ceil(dateNum / 7);

    // Evaluate if this weekday is the last occurrence in its month
    const tempDate = new Date(startDate);
    tempDate.setDate(dateNum + 7);
    const isLast = tempDate.getMonth() !== startDate.getMonth();

    return {
      dayOfWeek,
      monthDay: dateNum,
      month: monthIndex,
      nth,
      isLast,
      weekdayName: WEEKDAY_NAMES[dayOfWeek],
      monthName: MONTH_NAMES[monthIndex],
      nthName: NTH_NAMES[nth],
    };
  }, [startDate]);

  // Read internal rule configuration on load
  const [monthlyYearlyMode, setMonthlyYearlyMode] = useState<"day" | "weekday">(
    "day",
  );

  useEffect(() => {
    if (isOpen) {
      const initialValue = value || {
        ...DEFAULT_RULE,
        daysOfWeek: [dateCalculation.dayOfWeek],
      };
      setDraft(initialValue);

      // Restore UI toggle settings based on values
      if (initialValue.nthDayOfWeek) {
        setMonthlyYearlyMode("weekday");
      } else {
        setMonthlyYearlyMode("day");
      }
    }
  }, [isOpen, value, dateCalculation]);

  const handleFrequencyChange = (v: any) => {
    setDraft((prev) => {
      const next: RecurrenceRule = { ...prev, frequency: v };

      // Keep structural configurations clean across standard conversions
      if (v === "weekly") {
        next.daysOfWeek = prev.daysOfWeek || [dateCalculation.dayOfWeek];
        next.monthDay = undefined;
        next.nthDayOfWeek = undefined;
      } else if (v === "monthly" || v === "yearly") {
        next.daysOfWeek = undefined;
        if (monthlyYearlyMode === "day") {
          next.monthDay = dateCalculation.monthDay;
          next.nthDayOfWeek = undefined;
        } else {
          next.monthDay = undefined;
          next.nthDayOfWeek = {
            dayOfWeek: dateCalculation.dayOfWeek,
            nth: dateCalculation.isLast ? -1 : dateCalculation.nth,
          };
        }
        if (v === "yearly") {
          next.month = dateCalculation.month;
        } else {
          next.month = undefined;
        }
      } else {
        next.daysOfWeek = undefined;
        next.monthDay = undefined;
        next.nthDayOfWeek = undefined;
        next.month = undefined;
      }
      return next;
    });
  };

  const handleMonthlyYearlyModeChange = (mode: "day" | "weekday") => {
    setMonthlyYearlyMode(mode);
    setDraft((prev) => {
      const next = { ...prev };
      if (mode === "day") {
        next.monthDay = dateCalculation.monthDay;
        next.nthDayOfWeek = undefined;
      } else {
        next.monthDay = undefined;
        next.nthDayOfWeek = {
          dayOfWeek: dateCalculation.dayOfWeek,
          nth: dateCalculation.isLast ? -1 : dateCalculation.nth,
        };
      }
      return next;
    });
  };

  const handleDone = () => {
    onChange(draft);
    onClose();
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-auto font-manrope">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-surface-container-high border border-outline-variant/30 rounded-3xl shadow-2xl p-6 w-full max-w-[420px] flex flex-col gap-5"
          >
            <Typography
              variant="title-medium"
              className="font-bold text-on-surface"
            >
              Custom recurrence
            </Typography>

            {/* Repeat Every Interval Option */}
            <div className="flex items-center gap-3">
              <Typography
                variant="body-medium"
                className="shrink-0 w-24 font-medium text-on-surface"
              >
                Repeat every
              </Typography>
              <div className="w-20">
                <NumberInput
                  size="sm"
                  variant="filled"
                  value={draft.interval}
                  onValueChange={(v) =>
                    setDraft((p) => ({ ...p, interval: Number(v) }))
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
                  value={draft.frequency}
                  onValueChange={handleFrequencyChange}
                  items={[
                    {
                      value: "daily",
                      label: draft.interval > 1 ? "days" : "day",
                    },
                    {
                      value: "weekly",
                      label: draft.interval > 1 ? "weeks" : "week",
                    },
                    {
                      value: "monthly",
                      label: draft.interval > 1 ? "months" : "month",
                    },
                    {
                      value: "yearly",
                      label: draft.interval > 1 ? "years" : "year",
                    },
                  ]}
                  classNames={{ trigger: "h-10 px-3" }}
                />
              </div>
            </div>

            {/* Weekly Selector Grid */}
            {draft.frequency === "weekly" && (
              <div className="flex flex-col gap-2">
                <Typography
                  variant="body-medium"
                  className="font-medium text-on-surface"
                >
                  Repeat on
                </Typography>
                <div className="flex justify-between mt-1 w-full">
                  <ButtonGroup shape="full" gap="xs" className="w-full flex">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
                      const isSelected = draft.daysOfWeek?.includes(idx);
                      return (
                        <Button
                          key={idx}
                          type="button"
                          variant={isSelected ? "primary" : "secondary"}
                          isActive={isSelected}
                          onClick={() => {
                            setDraft((p) => {
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
                          className="flex-1 !px-0 min-w-0"
                        >
                          {day}
                        </Button>
                      );
                    })}
                  </ButtonGroup>
                </div>
              </div>
            )}

            {/* Monthly Complex Rules Selection */}
            {draft.frequency === "monthly" && (
              <div className="flex flex-col gap-2">
                <Typography
                  variant="body-medium"
                  className="font-medium text-on-surface"
                >
                  Repeat on
                </Typography>
                <div className="flex flex-col gap-1">
                  <CustomRadioOption
                    checked={monthlyYearlyMode === "day"}
                    onChange={() => handleMonthlyYearlyModeChange("day")}
                    label={`Monthly on day ${dateCalculation.monthDay}`}
                  />
                  <CustomRadioOption
                    checked={monthlyYearlyMode === "weekday"}
                    onChange={() => handleMonthlyYearlyModeChange("weekday")}
                    label={`Monthly on ${dateCalculation.isLast ? "the last" : `the ${dateCalculation.nthName}`} ${dateCalculation.weekdayName}`}
                  />
                </div>
              </div>
            )}

            {/* Yearly Complex Rules Selection */}
            {draft.frequency === "yearly" && (
              <div className="flex flex-col gap-2">
                <Typography
                  variant="body-medium"
                  className="font-medium text-on-surface"
                >
                  Repeat on
                </Typography>
                <div className="flex flex-col gap-1">
                  <CustomRadioOption
                    checked={monthlyYearlyMode === "day"}
                    onChange={() => handleMonthlyYearlyModeChange("day")}
                    label={`Annually on ${dateCalculation.monthName} ${dateCalculation.monthDay}`}
                  />
                  <CustomRadioOption
                    checked={monthlyYearlyMode === "weekday"}
                    onChange={() => handleMonthlyYearlyModeChange("weekday")}
                    label={`Annually on ${dateCalculation.isLast ? "the last" : `the ${dateCalculation.nthName}`} ${dateCalculation.weekdayName} of ${dateCalculation.monthName}`}
                  />
                </div>
              </div>
            )}

            {/* Standard Recurrence Ending Rule Options */}
            <div className="flex flex-col gap-2 border-t border-outline-variant/20 pt-3">
              <Typography
                variant="body-medium"
                className="font-medium text-on-surface mb-1"
              >
                Ends
              </Typography>

              <div className="flex flex-col gap-3">
                <CustomRadioOption
                  checked={draft.endType === "never"}
                  onChange={() => setDraft((p) => ({ ...p, endType: "never" }))}
                  label="Never"
                />

                <CustomRadioOption
                  checked={draft.endType === "on_date"}
                  onChange={() =>
                    setDraft((p) => ({ ...p, endType: "on_date" }))
                  }
                  label="On"
                >
                  <div className="w-[180px]">
                    <DatePicker
                      variant="docked"
                      inputVariant="filled"
                      size="sm"
                      disabled={draft.endType !== "on_date"}
                      value={draft.until}
                      onChange={(d) =>
                        d && setDraft((p) => ({ ...p, until: d }))
                      }
                      classNames={{ inputWrapper: "h-10 min-h-[40px]" }}
                    />
                  </div>
                </CustomRadioOption>

                <CustomRadioOption
                  checked={draft.endType === "after_occurrences"}
                  onChange={() =>
                    setDraft((p) => ({ ...p, endType: "after_occurrences" }))
                  }
                  label="After"
                >
                  <div className="w-[180px] flex items-center gap-3">
                    <NumberInput
                      variant="filled"
                      size="sm"
                      disabled={draft.endType !== "after_occurrences"}
                      value={draft.count}
                      onValueChange={(v) =>
                        setDraft((p) => ({ ...p, count: Number(v) }))
                      }
                      min={1}
                      classNames={{
                        inputWrapper: "h-10 min-h-[40px] px-2",
                        input: "text-center",
                      }}
                    />
                    <Typography
                      variant="body-medium"
                      className="whitespace-nowrap opacity-80 font-normal text-on-surface"
                    >
                      occurrences
                    </Typography>
                  </div>
                </CustomRadioOption>
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/20">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleDone}>
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
};
