"use client";

import { format } from "date-fns";
import React, { useState, useMemo } from "react";
import { Select } from "../select";
import { RecurrenceDialog } from "./recurrence-dialog";
import type { RecurrenceRule } from "./types";

export interface RecurrenceSelectProps {
  value?: RecurrenceRule;
  onChange: (rule?: RecurrenceRule) => void;
  startDate: Date;
  variant?: "filled" | "outlined" | "underlined";
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  className?: string;
}

const formatRecurrenceSummary = (rule: RecurrenceRule, startDate: Date) => {
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
    if (rule.monthDay) {
      s += ` on day ${rule.monthDay}`;
    } else if (rule.nthDayOfWeek) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const nthNames = ["", "first", "second", "third", "fourth", "fifth"];
      const { dayOfWeek, nth } = rule.nthDayOfWeek;
      s += ` on ${nth === -1 ? "the last" : `the ${nthNames[nth]}`} ${dayNames[dayOfWeek]}`;
    } else {
      s += ` on day ${startDate.getDate()}`;
    }
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

export const RecurrenceSelect = ({
  value,
  onChange,
  startDate,
  variant = "filled",
  size = "sm",
  shape = "full",
  className,
}: RecurrenceSelectProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 1. Calculate active selector selection based on exact rule matches
  const activeValue = useMemo(() => {
    if (!value) return "none";

    const { frequency, interval, endType, daysOfWeek } = value;

    if (interval === 1 && endType === "never") {
      if (frequency === "daily") return "daily";

      if (
        frequency === "weekly" &&
        daysOfWeek?.length === 1 &&
        daysOfWeek[0] === startDate.getDay()
      ) {
        return "weekly";
      }

      if (
        frequency === "weekly" &&
        daysOfWeek?.length === 5 &&
        [1, 2, 3, 4, 5].every((d) => daysOfWeek.includes(d))
      ) {
        return "weekdays";
      }

      if (frequency === "monthly" && value.monthDay === startDate.getDate()) {
        return "monthly";
      }

      if (
        frequency === "yearly" &&
        value.monthDay === startDate.getDate() &&
        value.month === startDate.getMonth() + 1
      ) {
        return "yearly";
      }
    }

    return "custom_active";
  }, [value, startDate]);

  // 2. Format options safely.
  // Pushing 'custom_active' to the very END guarantees the 0-6 array indices never shift during updates.
  const selectItems = useMemo(() => {
    const items = [
      { value: "none", label: "Does not repeat" },
      { value: "daily", label: "Daily" },
      { value: "weekly", label: `Weekly on ${format(startDate, "EEEE")}` },
      { value: "monthly", label: `Monthly on the ${startDate.getDate()}` },
      { value: "yearly", label: `Annually on ${format(startDate, "MMM d")}` },
      { value: "weekdays", label: "Every weekday (Monday to Friday)" },
      { value: "custom", label: "Custom..." },
    ];

    if (activeValue === "custom_active" && value) {
      items.push({
        value: "custom_active",
        label: formatRecurrenceSummary(value, startDate),
      });
    }

    return items;
  }, [startDate, activeValue, value]);

  const handleSelectChange = (val: string) => {
    if (val === activeValue) return;

    if (val === "none") {
      onChange(undefined);
    } else if (val === "custom") {
      setIsDialogOpen(true);
    } else if (val === "weekdays") {
      onChange({
        frequency: "weekly",
        interval: 1,
        endType: "never",
        daysOfWeek: [1, 2, 3, 4, 5],
      });
    } else if (["daily", "weekly", "monthly", "yearly"].includes(val)) {
      // Strict guard prevents rogue index shifts from emitting corrupted types
      onChange({
        frequency: val as any,
        interval: 1,
        endType: "never",
        daysOfWeek: val === "weekly" ? [startDate.getDay()] : undefined,
        monthDay: val === "monthly" ? startDate.getDate() : undefined,
        month: val === "yearly" ? startDate.getMonth() + 1 : undefined,
      });
    }
  };

  return (
    <>
      <Select
        variant={variant}
        size={size}
        shape={shape}
        value={activeValue}
        onValueChange={handleSelectChange}
        items={selectItems}
        className={className}
      />

      <RecurrenceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        value={value}
        onChange={onChange}
        startDate={startDate}
      />
    </>
  );
};
