"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { clsx } from "clsx";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  startOfMonth,
} from "date-fns";
import React, { memo, useEffect, useMemo, useRef } from "react";
import { type DateRange } from "../../hooks/use-calender";
import { Typography } from "../typography";
import { ElasticScrollArea } from "../elastic-scroll-area";

interface InfiniteCalendarProps {
  value?: Date | DateRange;
  onSelect?: (date: Date) => void;
  onRangeSelect?: (range: DateRange) => void;
  mode?: "single" | "range";
  minDate?: Date;
  maxDate?: Date;
}

// --- Month Grid Component (Heavily Optimized) ---
const MonthGrid = memo(
  ({
    monthDate,
    value,
    mode,
    onDateClick,
  }: {
    monthDate: Date;
    value?: Date | DateRange;
    mode: "single" | "range";
    onDateClick: (date: Date) => void;
  }) => {
    // 1. Memoize the days generation to prevent recalc on scroll
    const days = useMemo(() => {
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      return eachDayOfInterval({ start, end });
    }, [monthDate]);

    // 2. Memoize start index
    const startDayIndex = useMemo(() => getDay(days[0]), [days]);

    return (
      <div className="mb-4 px-4">
        <Typography
          variant="label-large"
          className="mb-4 block font-bold text-on-surface capitalize pl-2"
        >
          {format(monthDate, "MMMM yyyy")}
        </Typography>

        <div className="grid grid-cols-7 gap-y-2">
          {/* Empty cells for start of month */}
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {days.map((day) => {
            // Logic optimization: simpler checks
            const dayIso = day.toISOString();
            let isSelected = false;
            let isRangeStart = false;
            let isRangeEnd = false;
            let isInRange = false;

            if (mode === "single" && value instanceof Date) {
              isSelected = isSameDay(day, value);
            } else if (mode === "range") {
              const range = value as DateRange;
              if (range?.from) isRangeStart = isSameDay(day, range.from);
              if (range?.to) isRangeEnd = isSameDay(day, range.to);
              if (range?.from && range?.to) {
                // isAfter/isBefore can be expensive in tight loops, but necessary here
                // We trust V8 to optimize this, but memo prevents re-running it on scroll
                isInRange = isAfter(day, range.from) && isBefore(day, range.to);
              }
            }

            const isTodayDate = isToday(day);

            return (
              <div
                key={dayIso}
                className={clsx(
                  "relative flex aspect-square items-center justify-center p-0",
                  isInRange && "bg-secondary-container/30",
                  isRangeStart &&
                    "bg-gradient-to-r from-transparent to-secondary-container/30",
                  isRangeEnd &&
                    "bg-gradient-to-l from-transparent to-secondary-container/30",
                )}
              >
                <button
                  type="button"
                  onClick={() => onDateClick(day)}
                  className={clsx(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    // Selected State
                    isSelected || isRangeStart || isRangeEnd
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface",
                    // Today State
                    !isSelected &&
                      !isRangeStart &&
                      !isRangeEnd &&
                      isTodayDate &&
                      "border border-primary text-primary font-bold",
                    // Hover State (only if not selected)
                    !isSelected &&
                      !isRangeStart &&
                      !isRangeEnd &&
                      "hover:bg-surface-container-highest",
                  )}
                >
                  {format(day, "d")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
  // Custom comparison function for React.memo to strictly prevent re-renders
  (prev, next) => {
    return (
      prev.monthDate.getTime() === next.monthDate.getTime() &&
      prev.value === next.value &&
      prev.mode === next.mode
    );
  },
);
MonthGrid.displayName = "MonthGrid";

export const InfiniteCalendar = ({
  value,
  onSelect,
  onRangeSelect,
  mode = "single",
  minDate = new Date(1920, 0, 1),
  maxDate = new Date(2100, 11, 31),
}: InfiniteCalendarProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Generate list of months once
  const months = useMemo(() => {
    const monthList: Date[] = [];
    let current = startOfMonth(minDate);
    const end = maxDate;
    while (isBefore(current, end)) {
      monthList.push(current);
      current = addMonths(current, 1);
    }
    return monthList;
  }, []); // Empty dependency array = calculate once on mount

  // Find initial scroll index
  const initialIndex = useMemo(() => {
    const target =
      mode === "range" && (value as DateRange)?.from
        ? (value as DateRange).from
        : value instanceof Date
          ? value
          : new Date();

    return months.findIndex(
      (m) =>
        m.getFullYear() === (target || new Date()).getFullYear() &&
        m.getMonth() === (target || new Date()).getMonth(),
    );
  }, [months, value, mode]); // Only recalc if value changes drastically

  const virtualizer = useVirtualizer({
    count: months.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 340, // Consistent height estimate
    overscan: 1, // Reduced overscan for performance (renders fewer invisible items)
    initialOffset: initialIndex !== -1 ? initialIndex * 340 : 0,
  });

  // Scroll to selection on mount
  useEffect(() => {
    if (initialIndex !== -1 && parentRef.current) {
      virtualizer.scrollToIndex(initialIndex, { align: "start" });
    }
  }, []);

  const handleDateClick = (date: Date) => {
    if (mode === "single") {
      onSelect?.(date);
    } else {
      const currentRange = (value as DateRange) || {};
      if (currentRange.from && currentRange.to) {
        onRangeSelect?.({ from: date, to: undefined });
      } else if (!currentRange.from) {
        onRangeSelect?.({ from: date, to: undefined });
      } else if (date < currentRange.from) {
        onRangeSelect?.({ from: date, to: currentRange.from });
      } else {
        onRangeSelect?.({ from: currentRange.from, to: date });
      }
    }
  };

  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="flex h-full w-full flex-col bg-surface-container-high">
      {/* Sticky Weekday Header */}
      <div className="grid shrink-0 grid-cols-7 border-b border-outline-variant/50 bg-surface-container-high px-4 py-2 z-20">
        {weekdays.map((day, i) => (
          <div
            key={i}
            className="flex h-8 items-center justify-center text-xs font-bold text-on-surface-variant"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Virtualized Month List */}
      <ElasticScrollArea
        ref={parentRef}
        className="flex-1 overflow-y-auto pt-2 contain-strict"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MonthGrid
                monthDate={months[virtualRow.index]}
                value={value}
                mode={mode}
                onDateClick={handleDateClick}
              />
            </div>
          ))}
        </div>
      </ElasticScrollArea>
    </div>
  );
};
