// src/lib/components/full-calendar/index.tsx
"use client";

import { clsx } from "clsx";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import React from "react";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Select } from "../select";
import { Typography } from "../typography";
import { TooltipProvider, Tooltip, TooltipTrigger } from "../tooltip";
import { FullCalendarProvider, useFullCalendar } from "./calendar-context";
import { MonthView } from "./month-view";
import { TimelineView } from "./timeline-view";
import { YearView } from "./year-view";
import { EventPopover } from "./event-popover";
import type { FullCalendarProps } from "./types";

// --- ROOT COMPONENT ---

const FullCalendarRoot = React.forwardRef<HTMLDivElement, FullCalendarProps>(
  (
    {
      className,
      events,
      initialDate,
      initialView,
      onDateClick,
      onEventClick,
      onViewChange,
      onEventCreate,
      onEventUpdate,
      onEventDelete,
      renderEventContent,
      renderPopoverCustomFields,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <FullCalendarProvider
        events={events}
        initialDate={initialDate}
        initialView={initialView}
        onDateClick={onDateClick}
        onEventClick={onEventClick}
        onViewChange={onViewChange}
        onEventCreate={onEventCreate}
        onEventUpdate={onEventUpdate}
        onEventDelete={onEventDelete}
        renderEventContent={renderEventContent}
        renderPopoverCustomFields={renderPopoverCustomFields}
      >
        <div
          ref={ref}
          className={clsx(
            "flex flex-col w-full h-full bg-surface text-on-surface rounded-2xl overflow-hidden font-manrope relative print:bg-white print:text-black print:h-auto print:overflow-visible print:border-0",
            className,
          )}
          {...props}
        >
          {children}
          {/* Inject the global Popover here */}
          <EventPopover />
        </div>
      </FullCalendarProvider>
    );
  },
);
FullCalendarRoot.displayName = "FullCalendar";

// --- TOOLBAR COMPONENT ---

const FullCalendarToolbar = ({ className }: { className?: string }) => {
  const {
    currentDate,
    view,
    setView,
    navigateNext,
    navigatePrev,
    navigateToday,
    triggerPrint,
  } = useFullCalendar();

  // Format header text based on view
  const headerText = React.useMemo(() => {
    if (view === "day") return format(currentDate, "MMMM d, yyyy");
    if (view === "week") {
      return `${format(currentDate, "MMMM yyyy")}`;
    }
    if (view === "year") return format(currentDate, "yyyy");
    // Default to Month
    return format(currentDate, "MMMM yyyy");
  }, [currentDate, view]);

  return (
    <div
      className={clsx(
        "flex items-center justify-between p-4 shrink-0 border-b border-outline-variant/30 bg-surface z-30 relative print:hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="secondary"
          shape="full"
          onClick={navigateToday}
          size="sm"
        >
          Today
        </Button>
        <div className="flex items-center gap-1">
          <IconButton variant="ghost" size="sm" onClick={navigatePrev}>
            <ChevronLeft className="w-5 h-5" />
          </IconButton>
          <IconButton variant="ghost" size="sm" onClick={navigateNext}>
            <ChevronRight className="w-5 h-5" />
          </IconButton>
        </div>
        <Typography
          variant="title-large"
          className="font-normal min-w-[150px] sm:min-w-[200px]"
        >
          {headerText}
        </Typography>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <TooltipProvider>
          <TooltipTrigger asChild>
            <IconButton variant="ghost" size="sm" onClick={triggerPrint}>
              <Printer className="w-5 h-5 text-on-surface-variant" />
            </IconButton>
          </TooltipTrigger>
          <Tooltip>Print Calendar</Tooltip>
        </TooltipProvider>

        <div className="w-24 sm:w-32">
          <Select
            size="sm"
            variant="outlined"
            shape="full"
            value={view}
            onValueChange={(val) => setView(val as any)}
            items={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// --- VIEW DISPATCHER ---

const FullCalendarViewDispatcher = () => {
  const { view } = useFullCalendar();

  return (
    <div className="flex-1 overflow-hidden relative flex flex-col bg-surface print:overflow-visible print:h-auto">
      {view === "month" && <MonthView />}
      {(view === "week" || view === "day") && <TimelineView />}
      {view === "year" && <YearView />}
    </div>
  );
};

export const FullCalendar = Object.assign(FullCalendarRoot, {
  Toolbar: FullCalendarToolbar,
  View: FullCalendarViewDispatcher,
});

export * from "./types";
