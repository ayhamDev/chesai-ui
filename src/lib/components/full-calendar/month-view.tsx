// src/lib/components/full-calendar/month-view.tsx
"use client";

import { clsx } from "clsx";
import { addDays, format, isSameMonth, isToday } from "date-fns";
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
      // Find original base event of draft to replace it dynamically
      const baseDraftId = String(draftEvent.id).split("-occ-")[0];
      baseEvents = [
        ...events.filter((e) => String(e.id) !== baseDraftId),
        draftEvent,
      ];
    }
    const viewStart = days[0];
    const viewEnd = addDays(days[days.length - 1], 1);

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
    <div className="flex flex-col flex-1 h-full min-h-0 bg-surface">
      <div className="grid grid-cols-7 border-b border-outline-variant/30 shrink-0">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2 text-center">
            <Typography
              variant="label-small"
              className="text-on-surface-variant font-semibold"
            >
              {day}
            </Typography>
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-rows-6 min-h-0">
        {weeks.map((week, weekIndex) => {
          const segments = getEventSegments(week, displayEvents);

          return (
            <div
              key={weekIndex}
              className="relative border-b border-outline-variant/30 last:border-b-0 min-h-[80px] overflow-hidden"
            >
              <div className="absolute inset-0 grid grid-cols-7">
                {week.map((day) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);
                  const isFirstDayOfMonth = day.getDate() === 1;

                  return (
                    <div
                      key={day.toISOString()}
                      className={clsx(
                        "border-r border-outline-variant/30 last:border-r-0 p-1 flex flex-col",
                        !isCurrentMonth &&
                          "bg-surface-container-lowest/50 opacity-50",
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
                            "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium hover:bg-surface-container-highest transition-colors z-10",
                            isDayToday
                              ? "bg-primary text-on-primary hover:bg-primary/90"
                              : "text-on-surface",
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

              <div className="absolute inset-0 grid grid-cols-7 pointer-events-none mt-10 p-1 gap-y-1">
                {segments.map((segment) => {
                  const { event, colStart, colSpan, row } = segment;
                  const isAllDayOrSpanning = event.isAllDay || colSpan > 1;
                  const variant = event.colorVariant || "tertiary";

                  if (row > 4) return null;

                  // Propagate draft status from the base object to occurrences visually
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
                        // Tracing back to the base event ID
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
                          )}
                          style={{ backgroundColor: event.colorHex }}
                        >
                          <Typography
                            variant="label-small"
                            className="truncate font-semibold text-inherit"
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
                              "w-2 h-2 rounded-full shrink-0",
                              event.colorHex ? "" : DOT_COLOR_MAP[variant],
                            )}
                            style={{ backgroundColor: event.colorHex }}
                          />
                          <Typography
                            variant="label-small"
                            className="truncate font-medium text-on-surface"
                          >
                            <span className="opacity-70 mr-1">
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
