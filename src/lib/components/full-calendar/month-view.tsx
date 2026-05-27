// src/lib/components/full-calendar/month-view.tsx
"use client";

import { clsx } from "clsx";
import { addDays, format, isSameMonth, isToday, startOfDay } from "date-fns";
import React, { useMemo } from "react";
import { Typography } from "../typography";
import { useFullCalendar, PrintModeContext } from "./calendar-context";
import {
  expandEvents,
  getDaysForMonthView,
  getEventSegments,
  getCalendarBgClasses,
} from "./utils";

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
    variant,
    setCurrentDate,
    setView,
    openPopover,
    renderEventContent,
  } = useFullCalendar();

  const isPrintMode = React.useContext(PrintModeContext);
  const bgClass = isPrintMode
    ? "bg-white text-black"
    : getCalendarBgClasses(variant);
  const borderClass = isPrintMode
    ? "border-black/20"
    : "border-outline-variant/30";

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
    <div className={clsx("flex flex-col flex-1 h-full min-h-0", bgClass)}>
      <div className={clsx("grid grid-cols-7 border-b shrink-0", borderClass)}>
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2 text-center">
            <Typography
              variant="label-small"
              className={clsx(
                "font-semibold",
                isPrintMode ? "text-black" : "text-on-surface-variant",
              )}
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
              className={clsx(
                "relative border-b last:border-b-0 min-h-[80px] overflow-hidden",
                borderClass,
              )}
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
                        "border-r last:border-r-0 p-1 flex flex-col transition-colors",
                        borderClass,
                        !isCurrentMonth &&
                          (isPrintMode
                            ? "opacity-30"
                            : "bg-black/5 dark:bg-white/5 opacity-50"),
                        !isPrintMode && "hover:bg-on-surface/5 cursor-pointer",
                      )}
                      onClick={(e) => {
                        if (isPrintMode) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        openPopover("create", rect, day);
                      }}
                    >
                      <div className="flex justify-center mt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            if (isPrintMode) return;
                            e.stopPropagation();
                            setCurrentDate(day);
                            setView("day");
                          }}
                          className={clsx(
                            "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium transition-colors z-10",
                            isDayToday && !isPrintMode
                              ? "bg-primary text-on-primary hover:bg-primary/90"
                              : isPrintMode
                                ? "text-black"
                                : "text-on-surface hover:bg-on-surface/10",
                            isDayToday &&
                              isPrintMode &&
                              "font-bold border-2 border-black rounded-full",
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
                  const colorVariant = event.colorVariant || "tertiary";

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
                        if (isCurrentlyDraft || isPrintMode) return;
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
                              !isPrintMode &&
                              "cursor-pointer hover:opacity-90",
                            isCurrentlyDraft &&
                              "border-2 border-dashed border-current shadow-lg ring-2 ring-primary ring-offset-1",
                            event.colorHex
                              ? ""
                              : COLOR_MAP[colorVariant].split(" ")[0] +
                                  " " +
                                  COLOR_MAP[colorVariant].split(" ")[1],
                            isPrintMode && "border border-black/30",
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
                              !isPrintMode &&
                              "cursor-pointer hover:bg-on-surface/10",
                            isCurrentlyDraft &&
                              "border-2 border-dashed border-outline-variant",
                          )}
                        >
                          <div
                            className={clsx(
                              "w-2 h-2 rounded-full shrink-0",
                              event.colorHex ? "" : DOT_COLOR_MAP[colorVariant],
                              isPrintMode && "border border-black/30",
                            )}
                            style={{ backgroundColor: event.colorHex }}
                          />
                          <Typography
                            variant="label-small"
                            className={clsx(
                              "truncate font-medium",
                              isPrintMode ? "text-black" : "text-on-surface",
                            )}
                          >
                            <span
                              className={clsx(
                                "mr-1",
                                isPrintMode ? "opacity-100" : "opacity-70",
                              )}
                            >
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
