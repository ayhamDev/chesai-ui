// src/lib/components/full-calendar/year-view.tsx
"use client";

import { clsx } from "clsx";
import { format, isSameMonth, isToday } from "date-fns";
import React, { useMemo } from "react";
import { Typography } from "../src/lib/components/typography";
import { useFullCalendar } from "./calendar-context";
import {
  expandEvents,
  getDaysForMonthView,
  getEventDaysMap,
  getMonthsForYear,
} from "./utils";
import { ElasticScrollArea } from "../src/lib/components/elastic-scroll-area";
import { startOfMonth, endOfMonth } from "date-fns";

const WEEKDAYS_NARROW = ["S", "M", "T", "W", "T", "F", "S"];

const MiniMonth = ({
  monthDate,
  eventDaysSet,
}: {
  monthDate: Date;
  eventDaysSet: Set<string>;
}) => {
  const { setView, setCurrentDate } = useFullCalendar();
  const days = useMemo(() => getDaysForMonthView(monthDate), [monthDate]);

  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
    setView("day");
  };

  const handleMonthClick = () => {
    setCurrentDate(monthDate);
    setView("month");
  };

  return (
    <div className="flex flex-col p-4 w-full print:p-1 print:h-full">
      <Typography
        variant="label-large"
        className="font-bold mb-3 pl-1 cursor-pointer hover:text-primary transition-colors text-on-surface print:text-black print:mb-1"
        onClick={handleMonthClick}
      >
        {format(monthDate, "MMMM")}
      </Typography>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS_NARROW.map((day, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold text-on-surface-variant opacity-70 print:text-black print:opacity-100"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 print:gap-y-0.5">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthDate);
          const isDayToday = isToday(day);
          const dateStr = format(day, "yyyy-MM-dd");
          const hasEvent = eventDaysSet.has(dateStr);

          return (
            <div
              key={day.toISOString()}
              className="relative flex items-center justify-center aspect-square"
            >
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={clsx(
                  "relative flex items-center justify-center w-8 h-8 rounded-full text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary print:w-6 print:h-6 print:text-[10px]",
                  !isCurrentMonth && "opacity-0 pointer-events-none",
                  isCurrentMonth && "hover:bg-surface-container-highest",
                  isDayToday
                    ? "bg-primary text-on-primary font-bold shadow-sm print:bg-transparent print:text-black print:border print:border-black print:shadow-none"
                    : "text-on-surface print:text-black",
                )}
              >
                {format(day, "d")}

                {isCurrentMonth && hasEvent && !isDayToday && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary print:border print:border-black print:bg-transparent print:w-1 print:h-1" />
                )}
                {isCurrentMonth && hasEvent && isDayToday && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-on-primary print:bg-black" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const YearView = () => {
  const { currentDate, events } = useFullCalendar();
  const months = useMemo(() => getMonthsForYear(currentDate), [currentDate]);

  const expandedEvents = useMemo(() => {
    const viewStart = startOfMonth(months[0]);
    const viewEnd = endOfMonth(months[11]);
    return expandEvents(events, viewStart, viewEnd);
  }, [events, months]);

  const eventDaysSet = useMemo(
    () => getEventDaysMap(expandedEvents),
    [expandedEvents],
  );

  return (
    <ElasticScrollArea className="flex-1 w-full h-full bg-surface print:bg-white print:overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 lg:p-8 print:grid-cols-4 print:grid-rows-3 print:gap-2 print:p-2 print:h-full">
        {months.map((month) => (
          <MiniMonth
            key={month.toISOString()}
            monthDate={month}
            eventDaysSet={eventDaysSet}
          />
        ))}
      </div>
    </ElasticScrollArea>
  );
};
