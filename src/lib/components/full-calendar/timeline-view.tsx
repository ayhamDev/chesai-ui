// src/lib/components/full-calendar/timeline-view.tsx
"use client";

import { clsx } from "clsx";
import { addDays, format, isSameDay, isToday, startOfDay } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Typography } from "../typography";
import { useFullCalendar, PrintModeContext } from "./calendar-context";
import {
  expandEvents,
  getDaysForWeekView,
  getEventSegments,
  getTimelinePositionsForDay,
} from "./utils";
import { ElasticScrollArea } from "../elastic-scroll-area";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const COLOR_MAP = {
  primary: "bg-primary text-on-primary border-primary",
  secondary: "bg-secondary text-on-secondary border-secondary",
  tertiary: "bg-tertiary-container text-on-tertiary-container border-tertiary",
  success: "bg-green-600/20 text-green-800 border-green-600",
  error: "bg-error-container text-on-error-container border-error",
  gray: "bg-slate-500 text-white border-slate-500",
  indigo: "bg-indigo-500 text-white border-indigo-500",
  teal: "bg-teal-500 text-white border-teal-500",
  pink: "bg-pink-500 text-white border-pink-500",
};

export const TimelineView = () => {
  const isPrintMode = React.useContext(PrintModeContext);

  const {
    currentDate,
    view,
    events,
    draftEvent,
    setDraftEvent,
    setCurrentDate,
    setView,
    openPopover,
    onEventUpdate,
    renderEventContent,
    printSettings,
  } = useFullCalendar();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    if (isPrintMode) {
      if (
        printSettings.view === "day" ||
        printSettings.view === "week" ||
        printSettings.view === "auto"
      ) {
        const start = startOfDay(printSettings.rangeStart);
        const end = startOfDay(printSettings.rangeEnd);
        const d = [];
        let curr = start;
        // Cap the max amount of days so it isn't rendered infinitely.
        while (curr <= end && d.length < 14) {
          d.push(curr);
          curr = addDays(curr, 1);
        }
        return d.length > 0 ? d : [start];
      }
    }
    return view === "week" ? getDaysForWeekView(currentDate) : [currentDate];
  }, [currentDate, view, isPrintMode, printSettings]);

  const displayEvents = useMemo(() => {
    let baseEvents = events;
    if (draftEvent) {
      const baseDraftId = String(draftEvent.id).split("-occ-")[0];
      baseEvents = [
        ...events.filter((e) => String(e.id) !== baseDraftId),
        draftEvent,
      ];
    }
    // Fix Empty Events in Day view: Strips time components
    const viewStart = startOfDay(days[0]);
    const viewEnd = addDays(startOfDay(days[days.length - 1]), 1);

    return expandEvents(baseEvents, viewStart, viewEnd);
  }, [events, draftEvent, days]);

  const printRange = useMemo(() => {
    if (!isPrintMode) return { start: 0, end: 24, hours: HOURS };
    let minMins = 24 * 60;
    let maxMins = 0;
    displayEvents.forEach((e) => {
      if (e.isAllDay) return;
      const sMins = e.start.getHours() * 60 + e.start.getMinutes();
      const eMins = e.end.getHours() * 60 + e.end.getMinutes();
      if (sMins < minMins) minMins = sMins;
      if (eMins > maxMins) maxMins = eMins;
    });

    if (minMins >= maxMins) {
      return {
        start: 8,
        end: 18,
        hours: Array.from({ length: 11 }, (_, i) => i + 8),
      };
    }

    let s = Math.max(0, Math.floor(minMins / 60) - 1);
    let e = Math.min(24, Math.ceil(maxMins / 60) + 1);
    if (e - s < 6) e = Math.min(24, s + 6);

    return {
      start: s,
      end: e,
      hours: Array.from({ length: e - s }, (_, i) => i + s),
    };
  }, [isPrintMode, displayEvents]);

  const displayHours = printRange.hours;
  const startMinsOffset = printRange.start * 60;
  const totalDisplayMins = displayHours.length * 60;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTopPercentage = isPrintMode
    ? 0
    : (currentMinutes / (24 * 60)) * 100;

  useEffect(() => {
    if (scrollAreaRef.current && !isPrintMode) {
      const targetScroll = Math.max(0, 8 * 60 - 50);
      scrollAreaRef.current.scrollTop = targetScroll;
    }
  }, [view, isPrintMode]);

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>, day: Date) => {
    if (dragState.current || isPrintMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const totalHours = isPrintMode ? displayHours.length : 24;
    const baseHour = isPrintMode ? printRange.start : 0;
    const hour = baseHour + Math.floor((y / rect.height) * totalHours);

    const clickDate = new Date(day);
    clickDate.setHours(hour, 0, 0, 0);

    openPopover("create", rect, clickDate);
  };

  const dragState = useRef<{
    eventId: string | number;
    type: "move" | "resize";
    startX: number;
    startY: number;
    startColIndex: number;
    startTopMins: number;
    startHeightMins: number;
    originalEvent: any;
    hasMoved: boolean;
  } | null>(null);

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    event: any,
    type: "move" | "resize",
    colDay: Date,
  ) => {
    if (event.isDraft || event.editable === false || isPrintMode) return;
    e.stopPropagation();
    e.preventDefault();

    const startColIndex = days.findIndex((d) => isSameDay(d, colDay));
    const startMins = event.start.getHours() * 60 + event.start.getMinutes();
    const durationMins = (event.end.getTime() - event.start.getTime()) / 60000;

    const originalEventId = String(event.id).split("-occ-")[0];
    const baseEventObj =
      events.find((base) => String(base.id) === originalEventId) || event;

    dragState.current = {
      eventId: baseEventObj.id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      startColIndex: Math.max(0, startColIndex),
      startTopMins: startMins,
      startHeightMins: durationMins,
      originalEvent: baseEventObj,
      hasMoved: false,
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragState.current) return;
    const {
      startX,
      startY,
      startColIndex,
      startTopMins,
      startHeightMins,
      originalEvent,
      type,
    } = dragState.current;

    if (!dragState.current.hasMoved) {
      if (
        Math.abs(e.clientX - startX) > 3 ||
        Math.abs(e.clientY - startY) > 3
      ) {
        dragState.current.hasMoved = true;
        document.body.style.cursor = type === "move" ? "grabbing" : "ns-resize";
        setDraftEvent({ ...originalEvent, isDraft: true });
      } else {
        return;
      }
    }

    const deltaY = e.clientY - startY;
    const deltaMins = Math.round(deltaY / 15) * 15;

    if (type === "move") {
      let newStartMins = startTopMins + deltaMins;

      let dayDelta = 0;
      if (gridRef.current && days.length > 1) {
        const gridRect = gridRef.current.getBoundingClientRect();
        const colWidth = gridRect.width / days.length;
        const mouseX = e.clientX - gridRect.left;
        const targetColIndex = Math.max(
          0,
          Math.min(days.length - 1, Math.floor(mouseX / colWidth)),
        );
        dayDelta = targetColIndex - startColIndex;
      }

      const newStart = addDays(originalEvent.start, dayDelta);
      newStart.setHours(0, newStartMins, 0, 0);

      const newEnd = new Date(newStart.getTime() + startHeightMins * 60000);

      setDraftEvent({
        ...originalEvent,
        start: newStart,
        end: newEnd,
        isDraft: true,
      });
    } else if (type === "resize") {
      let newHeightMins = startHeightMins + deltaMins;
      if (newHeightMins < 15) newHeightMins = 15;

      const newEnd = new Date(
        originalEvent.start.getTime() + newHeightMins * 60000,
      );
      setDraftEvent({ ...originalEvent, end: newEnd, isDraft: true });
    }
  };

  const handlePointerUp = async () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    document.body.style.cursor = "";

    if (dragState.current) {
      if (dragState.current.hasMoved) {
        setDraftEvent((currentDraft) => {
          if (currentDraft && onEventUpdate) {
            const finalEvent = { ...currentDraft };
            delete finalEvent.isDraft;
            onEventUpdate(finalEvent);
          }
          return null;
        });
      }
      dragState.current = null;
    }
  };

  const allDayEvents = useMemo(() => {
    return displayEvents.filter((e) => e.isAllDay);
  }, [displayEvents]);

  const allDaySegments = useMemo(() => {
    return getEventSegments(days, allDayEvents);
  }, [days, allDayEvents]);

  const allDayMaxRows = useMemo(() => {
    if (allDaySegments.length === 0) return 0;
    return Math.max(...allDaySegments.map((s) => s.row));
  }, [allDaySegments]);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-surface print:bg-white print:text-black">
      <div className="flex flex-col border-b border-outline-variant/30 shrink-0 bg-surface z-20 print:bg-white print:border-b-2 print:border-black/50">
        <div className="flex">
          <div className="w-16 shrink-0 border-r border-outline-variant/30 print:border-black/50" />
          <div className="flex flex-1">
            {days.map((day) => {
              const isDayToday = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 flex flex-col items-center justify-center py-3 border-r border-outline-variant/30 last:border-r-0 print:border-black/50"
                >
                  <Typography
                    variant="label-small"
                    className={clsx(
                      "font-semibold mb-1",
                      isDayToday && !isPrintMode
                        ? "text-primary"
                        : "text-on-surface-variant print:text-black",
                    )}
                  >
                    {format(day, "EEE").toUpperCase()}
                  </Typography>
                  <button
                    type="button"
                    onClick={() => {
                      if (view !== "day" && !isPrintMode) {
                        setCurrentDate(day);
                        setView("day");
                      }
                    }}
                    className={clsx(
                      "flex items-center justify-center w-10 h-10 rounded-full text-lg transition-colors cursor-pointer",
                      !isPrintMode && "hover:bg-surface-container-highest",
                      isDayToday && !isPrintMode
                        ? "bg-primary text-on-primary font-bold shadow-md hover:bg-primary/90"
                        : "text-on-surface print:text-black",
                      isDayToday &&
                        isPrintMode &&
                        "font-bold border-2 border-black rounded-full",
                    )}
                  >
                    {format(day, "d")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {allDayMaxRows > 0 && (
          <div className="flex border-t border-outline-variant/30 print:border-black/50">
            <div className="w-16 shrink-0 border-r border-outline-variant/30 flex items-center justify-center py-2 print:border-black/50">
              <Typography
                variant="label-small"
                className="text-[10px] text-on-surface-variant opacity-70 print:text-black"
              >
                All day
              </Typography>
            </div>

            <div
              className={clsx(
                "flex-1 relative py-1 scrollbar-thin",
                isPrintMode
                  ? "overflow-visible"
                  : "overflow-y-auto max-h-[120px]",
              )}
            >
              <div className="absolute inset-0 flex pointer-events-none">
                {days.map((day, i) => (
                  <div
                    key={i}
                    className="flex-1 border-r border-outline-variant/30 last:border-r-0 print:border-black/50"
                  />
                ))}
              </div>

              <div
                className="grid gap-y-1 px-1 relative z-10"
                style={{
                  gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${allDayMaxRows}, 24px)`,
                }}
              >
                {allDaySegments.map((segment) => {
                  const { event, colStart, colSpan, row } = segment;
                  const variant = event.colorVariant || "tertiary";
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
                      <div
                        className={clsx(
                          "h-full w-full rounded-md px-2 flex items-center overflow-hidden transition-all",
                          !isCurrentlyDraft &&
                            !isPrintMode &&
                            "cursor-pointer hover:opacity-90",
                          isCurrentlyDraft &&
                            "border-2 border-dashed border-current shadow-lg ring-2 ring-primary ring-offset-1",
                          event.colorHex
                            ? ""
                            : COLOR_MAP[variant].split(" ")[0] +
                                " " +
                                COLOR_MAP[variant].split(" ")[1],
                          isPrintMode && "!shadow-none border border-black/20",
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <ElasticScrollArea
        ref={scrollAreaRef}
        className={clsx(
          "flex-1 w-full bg-surface",
          isPrintMode && "print:bg-white overflow-hidden",
        )}
        viewportClassName={clsx(isPrintMode ? "overflow-hidden" : "")}
      >
        <div className="flex min-w-max md:min-w-full print:w-full print:min-w-full h-full">
          <div className="w-16 shrink-0 flex flex-col border-r border-outline-variant/30 bg-surface relative z-10 print:bg-white print:border-black/50">
            {displayHours.map((hour) => (
              <div
                key={hour}
                className={clsx(
                  "relative flex justify-end pr-2",
                  isPrintMode ? "flex-1" : "h-[60px]",
                )}
              >
                {(hour !== 0 || isPrintMode) && (
                  <Typography
                    variant="label-small"
                    className="text-on-surface-variant text-[10px] -mt-2 opacity-80 print:text-black print:opacity-100"
                  >
                    {hour === 12
                      ? "12 PM"
                      : hour > 12
                        ? `${hour - 12} PM`
                        : `${hour} AM`}
                  </Typography>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 flex relative" ref={gridRef}>
            <div className="absolute inset-0 pointer-events-none flex flex-col">
              {displayHours.map((hour) => (
                <div
                  key={hour}
                  className={clsx(
                    "border-b w-full",
                    isPrintMode
                      ? "flex-1 border-black/30 border-dashed"
                      : "h-[60px] border-outline-variant/20",
                  )}
                />
              ))}
            </div>

            {!isPrintMode && days.some((d) => isSameDay(d, now)) && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center print:hidden"
                style={{
                  top: `${currentTimeTopPercentage}%`,
                  marginLeft: "-6px",
                }}
              >
                <div className="w-3 h-3 rounded-full bg-error shrink-0" />
                <div className="h-[2px] w-full bg-error shadow-sm" />
              </div>
            )}

            {days.map((day) => {
              const positions = getTimelinePositionsForDay(day, displayEvents);

              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 relative border-r border-outline-variant/30 last:border-r-0 cursor-pointer print:border-black/50"
                  style={isPrintMode ? undefined : { height: "1440px" }}
                  onClick={(e) => handleGridClick(e, day)}
                >
                  {positions.map((pos) => {
                    let { top, height } = pos;
                    const { event, left, width } = pos;
                    const variant = event.colorVariant || "primary";
                    const colorClass = event.colorHex ? "" : COLOR_MAP[variant];
                    const isCurrentlyDraft = event.isDraft;

                    if (isPrintMode) {
                      const absoluteStartMins = (top / 100) * 1440;
                      const durationMins = (height / 100) * 1440;
                      top =
                        ((absoluteStartMins - startMinsOffset) /
                          totalDisplayMins) *
                        100;
                      height = (durationMins / totalDisplayMins) * 100;

                      if (top < 0) {
                        height += top;
                        top = 0;
                      }
                      if (top + height > 100) {
                        height = 100 - top;
                      }
                      if (height <= 0) return null;
                    }

                    return (
                      <div
                        key={event.id}
                        className={clsx(
                          "absolute p-[1px] transition-all",
                          isCurrentlyDraft
                            ? "z-40 opacity-90"
                            : "z-10 hover:z-30",
                        )}
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          left: `${left}%`,
                          width: `${width}%`,
                        }}
                      >
                        <div
                          className={clsx(
                            "w-full h-full rounded-md border-l-4 p-1.5 overflow-hidden shadow-sm flex flex-col relative group",
                            !isCurrentlyDraft &&
                              !isPrintMode &&
                              "cursor-pointer hover:shadow-md transition-shadow",
                            isCurrentlyDraft &&
                              "border-dashed shadow-lg ring-2 ring-primary ring-offset-1",
                            colorClass,
                            isPrintMode &&
                              "!shadow-none border border-black/20",
                          )}
                          style={{
                            backgroundColor: event.colorHex
                              ? `${event.colorHex}20`
                              : undefined,
                            borderColor: event.colorHex,
                            color: event.colorHex,
                          }}
                          onPointerDown={(e) =>
                            handlePointerDown(e, event, "move", day)
                          }
                          onClick={(e) => {
                            if (isCurrentlyDraft || isPrintMode) return;
                            e.stopPropagation();
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const originalId = String(event.id).split(
                              "-occ-",
                            )[0];
                            const baseEventObj =
                              events.find(
                                (base) => String(base.id) === originalId,
                              ) || event;
                            openPopover("edit", rect, undefined, baseEventObj);
                          }}
                        >
                          {renderEventContent ? (
                            renderEventContent(event, view)
                          ) : (
                            <>
                              <Typography
                                variant="label-small"
                                className="font-bold text-inherit leading-tight truncate print:text-black"
                              >
                                {event.title || "(No title)"}
                              </Typography>
                              {height > (30 / totalDisplayMins) * 100 && (
                                <Typography
                                  variant="body-small"
                                  className="text-[10px] text-inherit opacity-80 truncate mt-0.5 pointer-events-none print:text-black"
                                >
                                  {format(event.start, "h:mm a")} -{" "}
                                  {format(event.end, "h:mm a")}
                                </Typography>
                              )}
                            </>
                          )}

                          {event.editable !== false &&
                            !isCurrentlyDraft &&
                            !isPrintMode && (
                              <div
                                className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 flex justify-center items-center"
                                onPointerDown={(e) =>
                                  handlePointerDown(e, event, "resize", day)
                                }
                              >
                                <div className="w-4 h-1 bg-current opacity-50 rounded-full" />
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </ElasticScrollArea>
    </div>
  );
};
