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
  getCalendarBgClasses,
  getCalendarStickyBgClasses,
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
    variant,
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

  const bgClass = isPrintMode
    ? "bg-white text-black"
    : getCalendarBgClasses(variant);
  const stickyBgClass = isPrintMode
    ? "bg-white text-black"
    : getCalendarStickyBgClasses(variant);
  const borderClass = isPrintMode
    ? "border-black/20"
    : "border-outline-variant/30";

  const days = useMemo(() => {
    return view === "week" ? getDaysForWeekView(currentDate) : [currentDate];
  }, [currentDate, view]);

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

  // SMART NON-LINEAR PRINT MAP: Identifies hours being used & creates timeline blocks
  const printRange = useMemo(() => {
    if (!isPrintMode) return { hours: HOURS, blocks: [HOURS] };

    const occupiedHours = new Set<number>();

    displayEvents.forEach((e) => {
      if (e.isAllDay) return;
      days.forEach((day) => {
        const dayStart = startOfDay(day);
        const dayEnd = addDays(dayStart, 1);

        if (e.start < dayEnd && e.end > dayStart) {
          const clampStart = e.start < dayStart ? dayStart : e.start;
          const clampEnd = e.end > dayEnd ? dayEnd : e.end;

          const sHour = clampStart.getHours();
          let eHour = clampEnd.getHours();

          if (
            clampEnd.getMinutes() === 0 &&
            eHour > sHour &&
            clampEnd < dayEnd
          ) {
            eHour -= 1;
          }
          if (
            clampEnd.getHours() === 0 &&
            clampEnd.getMinutes() === 0 &&
            clampEnd.getDate() !== clampStart.getDate()
          ) {
            eHour = 23;
          }

          for (let h = sHour; h <= eHour; h++) {
            occupiedHours.add(h);
          }
        }
      });
    });

    if (occupiedHours.size === 0) {
      // Safe defaults 8am - 6pm if there are absolutely no events
      const defaultHours = Array.from({ length: 11 }, (_, i) => i + 8);
      return { hours: defaultHours, blocks: [defaultHours] };
    }

    // Add 1 hour padding around each occupied hour for readability
    const paddedHours = new Set<number>();
    occupiedHours.forEach((h) => {
      if (h > 0) paddedHours.add(h - 1);
      paddedHours.add(h);
      if (h < 23) paddedHours.add(h + 1);
    });

    const sortedHours = Array.from(paddedHours).sort((a, b) => a - b);

    // Group the hours into contiguous visual blocks
    const blocks: number[][] = [];
    let currentBlock = [sortedHours[0]];
    for (let i = 1; i < sortedHours.length; i++) {
      if (sortedHours[i] === sortedHours[i - 1] + 1) {
        currentBlock.push(sortedHours[i]);
      } else {
        blocks.push(currentBlock);
        currentBlock = [sortedHours[i]];
      }
    }
    blocks.push(currentBlock);

    return { hours: sortedHours, blocks };
  }, [isPrintMode, displayEvents, days]);

  const blocksToRender = isPrintMode ? printRange.blocks : [HOURS];
  // Gap size visually represents 0.5 hours in terms of flex units
  const GAP_VIRTUAL_HOURS = 0.5;
  const totalVirtualHours = isPrintMode
    ? printRange.hours.length +
      (printRange.blocks.length - 1) * GAP_VIRTUAL_HOURS
    : 24;
  const totalDisplayMins = totalVirtualHours * 60;

  // Calculates Virtual Minutes for Non-linear grids mapping
  const getVirtualMinutes = (absoluteMins: number) => {
    if (!isPrintMode) return absoluteMins;

    const clampedMins = Math.min(Math.max(absoluteMins, 0), 1440);
    const h = Math.floor(clampedMins / 60);
    const m = clampedMins % 60;

    let virtualH = 0;

    for (let i = 0; i < printRange.blocks.length; i++) {
      const block = printRange.blocks[i];
      const blockStart = block[0];
      const blockEnd = block[block.length - 1];

      // Event falls into the gap preceding this block
      if (h < blockStart) {
        return (virtualH - GAP_VIRTUAL_HOURS / 2) * 60;
      }

      // Event is inside this block
      if (h >= blockStart && h <= blockEnd) {
        return (virtualH + (h - blockStart)) * 60 + m;
      }

      // Move past this block
      virtualH += block.length;
      if (i < printRange.blocks.length - 1) {
        virtualH += GAP_VIRTUAL_HOURS;
      }
    }

    return virtualH * 60;
  };

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

    const totalHours = 24;
    const baseHour = 0;
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

  const GridContent = (
    <div className="flex min-w-max md:min-w-full h-full">
      <div
        className={clsx(
          "w-16 shrink-0 flex flex-col border-r relative z-10",
          stickyBgClass,
          borderClass,
        )}
      >
        {blocksToRender.map((block, bIndex) => (
          <React.Fragment key={bIndex}>
            {block.map((hour) => (
              <div
                key={hour}
                className={clsx(
                  "relative flex justify-end pr-2 min-h-0", // min-h-0 prevents flex overflow bounds
                  isPrintMode ? "flex-1" : "h-[60px]",
                )}
              >
                {(hour !== 0 || isPrintMode) && (
                  <Typography
                    variant="label-small"
                    className={clsx(
                      "text-[10px] -mt-[6px] leading-none bg-inherit z-10",
                      isPrintMode
                        ? "text-black opacity-100"
                        : "text-on-surface-variant opacity-80",
                    )}
                  >
                    {hour === 12
                      ? "12 PM"
                      : hour > 12
                        ? `${hour - 12} PM`
                        : `${hour === 0 ? 12 : hour} AM`}
                  </Typography>
                )}
              </div>
            ))}
            {bIndex < blocksToRender.length - 1 && (
              <div
                style={
                  isPrintMode ? { flex: GAP_VIRTUAL_HOURS } : { height: "30px" }
                }
                className={clsx(
                  "relative flex flex-col items-center justify-center bg-black/5 opacity-50 border-b border-black/20 box-border min-h-0",
                )}
              >
                <div className="w-1 h-1 rounded-full bg-black/40 mb-1" />
                <div className="w-1 h-1 rounded-full bg-black/40 mb-1" />
                <div className="w-1 h-1 rounded-full bg-black/40" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 flex relative" ref={gridRef}>
        <div className="absolute inset-0 pointer-events-none flex flex-col">
          {blocksToRender.map((block, bIndex) => (
            <React.Fragment key={bIndex}>
              {block.map((hour) => (
                <div
                  key={hour}
                  className={clsx(
                    "border-b w-full box-border min-h-0", // min-h-0 prevents flex overflow bounds
                    isPrintMode
                      ? "flex-1 border-black/20 border-dashed"
                      : "h-[60px] border-outline-variant/20",
                  )}
                />
              ))}
              {bIndex < blocksToRender.length - 1 && (
                <div
                  style={
                    isPrintMode
                      ? { flex: GAP_VIRTUAL_HOURS }
                      : { height: "30px" }
                  }
                  className="w-full bg-black/5 border-b border-black/20 box-border min-h-0"
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {!isPrintMode && days.some((d) => isSameDay(d, now)) && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
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
              className={clsx(
                "flex-1 relative border-r last:border-r-0 cursor-pointer min-h-0",
                borderClass,
              )}
              style={isPrintMode ? undefined : { height: "1440px" }}
              onClick={(e) => handleGridClick(e, day)}
            >
              {positions.map((pos) => {
                let { top, height } = pos;
                const { event, left, width } = pos;
                const colorVariant = event.colorVariant || "primary";
                const colorClass = event.colorHex
                  ? ""
                  : COLOR_MAP[colorVariant];
                const isCurrentlyDraft = event.isDraft;

                if (isPrintMode) {
                  // Derive exact absolute minutes straight from standard percentage bounds
                  const absoluteStartMins = (top / 100) * 1440;
                  const absoluteEndMins = ((top + height) / 100) * 1440;

                  const startVirtual = getVirtualMinutes(absoluteStartMins);
                  const endVirtual = getVirtualMinutes(absoluteEndMins);

                  top = (startVirtual / totalDisplayMins) * 100;
                  height =
                    ((endVirtual - startVirtual) / totalDisplayMins) * 100;

                  // Absolute Clamping to prevent ANY overflow outside the grid bounds
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
                      isCurrentlyDraft ? "z-40 opacity-90" : "z-10 hover:z-30",
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
                        isPrintMode && "!shadow-none border border-black/30",
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
                        renderEventContent(event, view)
                      ) : (
                        <>
                          <Typography
                            variant="label-small"
                            className="font-bold text-inherit leading-tight truncate"
                          >
                            {event.title || "(No title)"}
                          </Typography>
                          {height > (30 / totalDisplayMins) * 100 && (
                            <Typography
                              variant="body-small"
                              className="text-[10px] text-inherit opacity-80 truncate mt-0.5 pointer-events-none"
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
  );

  return (
    <div className={clsx("flex flex-col flex-1 h-full min-h-0", bgClass)}>
      <div
        className={clsx(
          "flex flex-col border-b shrink-0 z-20",
          borderClass,
          stickyBgClass,
        )}
      >
        <div className="flex">
          <div className={clsx("w-16 shrink-0 border-r", borderClass)} />
          <div className="flex flex-1">
            {days.map((day) => {
              const isDayToday = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={clsx(
                    "flex-1 flex flex-col items-center justify-center py-3 border-r last:border-r-0",
                    borderClass,
                  )}
                >
                  <Typography
                    variant="label-small"
                    className={clsx(
                      "font-semibold mb-1",
                      isDayToday && !isPrintMode
                        ? "text-primary"
                        : isPrintMode
                          ? "text-black"
                          : "text-on-surface-variant",
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
                      !isPrintMode && "hover:bg-on-surface/10",
                      isDayToday && !isPrintMode
                        ? "bg-primary text-on-primary font-bold shadow-md hover:bg-primary/90"
                        : isPrintMode
                          ? "text-black"
                          : "text-on-surface",
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
          <div className={clsx("flex border-t", borderClass)}>
            <div
              className={clsx(
                "w-16 shrink-0 border-r flex items-center justify-center py-2",
                borderClass,
              )}
            >
              <Typography
                variant="label-small"
                className={clsx(
                  "text-[10px] opacity-70",
                  isPrintMode ? "text-black" : "text-on-surface-variant",
                )}
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
                    className={clsx(
                      "flex-1 border-r last:border-r-0",
                      borderClass,
                    )}
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
                  const colorVariant = event.colorVariant || "tertiary";
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
                            : COLOR_MAP[colorVariant].split(" ")[0] +
                                " " +
                                COLOR_MAP[colorVariant].split(" ")[1],
                          isPrintMode && "!shadow-none border border-black/30",
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
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {isPrintMode ? (
        <div className="flex-1 w-full h-full relative overflow-hidden">
          {GridContent}
        </div>
      ) : (
        <ElasticScrollArea
          ref={scrollAreaRef}
          className={clsx("flex-1 w-full", bgClass)}
        >
          {GridContent}
        </ElasticScrollArea>
      )}
    </div>
  );
};
