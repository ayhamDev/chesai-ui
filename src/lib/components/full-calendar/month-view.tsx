// src/lib/components/full-calendar/month-view.tsx
"use client";

import { clsx } from "clsx";
import { addDays, format, isSameMonth, isToday, startOfDay } from "date-fns";
import React, { useMemo } from "react";
import { Typography } from "../typography";
import { useFullCalendar } from "./calendar-context";
import { expandEvents, getDaysForMonthView, getEventSegments } from "./utils";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const COLOR_MAP = {
  primary: "bg-primary text-on-primary",
  secondary: "bg-secondary text-on-secondary",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  success: "bg-green-600/20 text-green-800",
  error: "bg-error-container text-on-error-container",
  gray: "bg-slate-500 text-white",
  indigo: "bg-indigo-500 text-white",
  teal: "bg-teal-500 text-white",
  pink: "bg-pink-500 text-white",
};

const DOT_COLOR_MAP = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
  success: "bg-green-500",
  error: "bg-error",
  gray: "bg-slate-500",
  indigo: "bg-indigo-500",
  teal: "bg-teal-500",
  pink: "bg-pink-500",
};

export const MonthView = () => {
  const {
    currentDate,
    events,
    draftEvent,
    setCurrentDate,
    setView,
    openPopover,
    renderEventContent,
  } = useFullCalendar();

  const days = useMemo(() => getDaysForMonthView(currentDate), [currentDate]);

  const displayEvents = useMemo(() => {
    let baseEvents = events;
    if (draftEvent) {
      const baseDraftId = String(draftEvent.id).split("-occ-")[0];
      baseEvents = [
        ...events.filter((e) => String(e.id) !== baseDraftId),
        draftEvent,
      ];
    }
    // Fixed Empty filtering: strips off the specific time of current day.
    const viewStart = startOfDay(days[0]);
    const viewEnd = addDays(startOfDay(days[days.length - 1]), 1);

    return expandEvents(baseEvents, viewStart, viewEnd);
  }, [events, draftEvent, days]);

  const weeks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < days.length; i += 7) {
      chunks.push(days.slice(i, i + 7));
    }
    return chunks;
  }, [days]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-surface print:bg-white print:text-black print:h-full">
      <div className="grid grid-cols-7 border-b border-outline-variant/30 shrink-0 print:border-black/50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2 text-center">
            <Typography
              variant="label-small"
              className="text-on-surface-variant font-semibold print:text-black"
            >
              {day}
            </Typography>
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-rows-6 min-h-0 print:h-full print:grid">
        {weeks.map((week, weekIndex) => {
          const segments = getEventSegments(week, displayEvents);

          return (
            <div
              key={weekIndex}
              className="relative border-b border-outline-variant/30 last:border-b-0 min-h-[80px] overflow-hidden print:min-h-0 print:border-black/50"
            >
              <div className="absolute inset-0 grid grid-cols-7 print:h-full print:static">
                {week.map((day) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);
                  const isFirstDayOfMonth = day.getDate() === 1;

                  return (
                    <div
                      key={day.toISOString()}
                      className={clsx(
                        "border-r border-outline-variant/30 last:border-r-0 p-1 flex flex-col print:border-black/50",
                        !isCurrentMonth &&
                          "bg-surface-container-lowest/50 opacity-50 print:bg-transparent",
                        "hover:bg-surface-container-highest/20 cursor-pointer transition-colors",
                      )}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        openPopover("create", rect, day);
                      }}
                    >
                      <div className="flex justify-center mt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentDate(day);
                            setView("day");
                          }}
                          className={clsx(
                            "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium transition-colors z-10",
                            isDayToday
                              ? "bg-primary text-on-primary hover:bg-primary/90 print:bg-transparent print:text-black print:border print:border-black"
                              : "text-on-surface hover:bg-surface-container-highest print:text-black",
                          )}
                        >
                          {isFirstDayOfMonth
                            ? format(day, "MMM d")
                            : format(day, "d")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none mt-10 p-1 gap-y-1 print:mt-8">
                {segments.map((segment) => {
                  const { event, colStart, colSpan, row } = segment;
                  const isAllDayOrSpanning = event.isAllDay || colSpan > 1;
                  const variant = event.colorVariant || "tertiary";

                  // Soft cap visual rows
                  if (row > 5) return null;

                  const isCurrentlyDraft = event.isDraft;

                  return (
                    <div
                      key={event.id}
                      className={clsx(
                        "px-1 pointer-events-auto",
                        isCurrentlyDraft && "opacity-80 z-40",
                      )}
                      style={{
                        gridColumnStart: colStart,
                        gridColumnEnd: `span ${colSpan}`,
                        gridRowStart: row,
                        height: "22px",
                      }}
                      onClick={(e) => {
                        if (isCurrentlyDraft) return;
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const originalId = String(event.id).split("-occ-")[0];
                        const baseEventObj =
                          events.find(
                            (base) => String(base.id) === originalId,
                          ) || event;
                        openPopover("edit", rect, undefined, baseEventObj);
                      }}
                    >
                      {renderEventContent ? (
                        renderEventContent(event, "month")
                      ) : isAllDayOrSpanning ? (
                        <div
                          className={clsx(
                            "h-full w-full rounded-md px-2 flex items-center overflow-hidden transition-opacity",
                            !isCurrentlyDraft &&
                              "cursor-pointer hover:opacity-90",
                            isCurrentlyDraft &&
                              "border-2 border-dashed border-current shadow-lg ring-2 ring-primary ring-offset-1",
                            event.colorHex
                              ? ""
                              : COLOR_MAP[variant].split(" ")[0] +
                                  " " +
                                  COLOR_MAP[variant].split(" ")[1],
                            "print:border print:border-black/50 print:bg-transparent print:text-black",
                          )}
                          style={{ backgroundColor: event.colorHex }}
                        >
                          <Typography
                            variant="label-small"
                            className="truncate font-semibold text-inherit print:text-black"
                          >
                            {event.title || "(No title)"}
                          </Typography>
                        </div>
                      ) : (
                        <div
                          className={clsx(
                            "h-full w-full rounded-md px-1 flex items-center gap-1.5 overflow-hidden transition-colors",
                            !isCurrentlyDraft &&
                              "cursor-pointer hover:bg-surface-container-highest",
                            isCurrentlyDraft &&
                              "border-2 border-dashed border-outline-variant",
                          )}
                        >
                          <div
                            className={clsx(
                              "w-2 h-2 rounded-full shrink-0 print:bg-transparent print:border print:border-black/50",
                              event.colorHex ? "" : DOT_COLOR_MAP[variant],
                            )}
                            style={{ backgroundColor: event.colorHex }}
                          />
                          <Typography
                            variant="label-small"
                            className="truncate font-medium text-on-surface print:text-black"
                          >
                            <span className="opacity-70 mr-1 print:opacity-100">
                              {format(event.start, "h:mma").toLowerCase()}
                            </span>
                            {event.title || "(No title)"}
                          </Typography>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
