// src/lib/components/full-calendar/index.tsx
"use client";

import { clsx } from "clsx";
import {
  format,
  differenceInDays,
  startOfDay,
  startOfWeek,
  endOfWeek,
  addWeeks,
  startOfMonth,
  addMonths,
  startOfYear,
  addYears,
} from "date-fns";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { Select } from "../select";
import { Typography } from "../typography";
import { TooltipProvider, Tooltip, TooltipTrigger } from "../tooltip";
import { useLayout } from "../../context/layout-context";
import {
  FullCalendarProvider,
  useFullCalendar,
  PrintOverrideProvider,
  PrintModeContext,
} from "./calendar-context";
import { MonthView } from "./month-view";
import { TimelineView } from "./timeline-view";
import { YearView } from "./year-view";
import { EventPopover } from "./event-popover";
import { RecurrenceScopeDialog } from "./recurrence-scope-dialog";
import { PrintPreviewDialog } from "./print-preview-dialog";
import {
  filterDaysWithEvents,
  getDayDatesInRange,
  resolvePrintOrientation,
} from "./print-layout";
import type { CalendarView, FullCalendarProps } from "./types";
import { getCalendarBgClasses, getCalendarStickyBgClasses, getCalendarSidePanelBgClasses } from "./utils";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Calendar } from "../date-picker/calendar";

// --- ROOT COMPONENT ---

export const PrintHeader = () => {
  const { currentDate, view } = useFullCalendar();
  const isPrintMode = React.useContext(PrintModeContext);

  const headerText = React.useMemo(() => {
    if (view === "day") return format(currentDate, "MMMM d, yyyy");
    if (view === "week") {
      const wStart = startOfWeek(currentDate);
      const wEnd = endOfWeek(currentDate);
      return `${format(wStart, "MMM d, yyyy")} - ${format(wEnd, "MMM d, yyyy")}`;
    }
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "year") return format(currentDate, "yyyy");
    return format(currentDate, "MMMM yyyy");
  }, [currentDate, view]);

  return (
    <div
      className={clsx(
        "w-full text-center py-4 font-bold text-2xl shrink-0",
        isPrintMode
          ? "bg-white text-black border-b border-black/20"
          : "bg-surface text-on-surface border-b border-outline-variant/30",
      )}
    >
      {headerText}
    </div>
  );
};

export const PrintPagesLayout = ({
  isPreview = false,
  printWidth,
  printHeight,
  scale = 1,
}: {
  isPreview?: boolean;
  printWidth?: number;
  printHeight?: number;
  scale?: number;
}) => {
  const { events, printSettings } = useFullCalendar();

  const printView = useMemo(() => {
    if (printSettings.view !== "auto") return printSettings.view;
    const days =
      differenceInDays(printSettings.rangeEnd, printSettings.rangeStart) + 1;
    if (days <= 1) return "day";
    if (days <= 7) return "week";
    return "month";
  }, [printSettings.view, printSettings.rangeStart, printSettings.rangeEnd]);

  // Break the selected range into page chunks
  const pages = useMemo(() => {
    const start = startOfDay(printSettings.rangeStart);
    const end = startOfDay(printSettings.rangeEnd);
    const pageDates: Date[] = [];

    if (printView === "day") {
      const dayDates = getDayDatesInRange(start, end);
      return printSettings.onlyDaysWithEvents
        ? filterDaysWithEvents(dayDates, events)
        : dayDates;
    } else if (printView === "week") {
      let curr = startOfWeek(start);
      const endWeek = startOfWeek(end);
      while (curr <= endWeek) {
        pageDates.push(curr);
        curr = addWeeks(curr, 1);
      }
    } else if (printView === "month") {
      let curr = startOfMonth(start);
      const endMonth = startOfMonth(end);
      while (curr <= endMonth) {
        pageDates.push(curr);
        curr = addMonths(curr, 1);
      }
    } else if (printView === "year") {
      let curr = startOfYear(start);
      const endYear = startOfYear(end);
      while (curr <= endYear) {
        pageDates.push(curr);
        curr = addYears(curr, 1);
      }
    }
    return pageDates.length > 0 ? pageDates : [start];
  }, [
    events,
    printSettings.onlyDaysWithEvents,
    printSettings.rangeStart,
    printSettings.rangeEnd,
    printView,
  ]);

  return (
    <div
      className={clsx(
        "flex flex-col w-full",
        isPreview && "items-center origin-top gap-8",
      )}
      style={
        isPreview
          ? { transform: `scale(${scale})`, transformOrigin: "top center" }
          : {}
      }
    >
      {pages.map((pageDate, i) => (
        <div
          key={i}
          className={clsx(
            "print-page-container bg-white text-black",
            isPreview && "shadow-2xl border border-outline-variant/30 shrink-0",
          )}
          style={{
            pageBreakAfter: "always",
            breakAfter: "page",
            width: isPreview ? printWidth : "100%",
            height: isPreview ? printHeight : "100vh",
            minWidth: isPreview ? printWidth : undefined,
            minHeight: isPreview ? printHeight : undefined,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            filter:
              printSettings.colorStyle === "bw" ? "grayscale(100%)" : "none",
          }}
        >
          <PrintOverrideProvider
            overrideDate={pageDate}
            overrideView={printView as CalendarView}
          >
            <PrintHeader />
            <FullCalendarViewDispatcher />
          </PrintOverrideProvider>
        </div>
      ))}
    </div>
  );
};

const FullCalendarRootContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { openPrintPreview, printSettings, variant } = useFullCalendar();
  const resolvedPrintOrientation = resolvePrintOrientation(
    printSettings.orientation,
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        openPrintPreview();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openPrintPreview]);

  const printCss = `
    @media print {
      @page {
        size: letter ${resolvedPrintOrientation};
        margin: 0.5cm;
      }
      html,
      body {
        width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background: white !important;
      }
      body > *:not(.chesai-calendar-print-root) {
        display: none !important;
      }
      .chesai-calendar-print-root {
        display: block !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        background: white !important;
      }
      .print-page-container {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        height: 100vh !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .print-page-container:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
    }
  `;

  return (
    <>
      <style>{printCss}</style>
      <div
        ref={ref}
        className={clsx(
          "flex flex-col w-full h-full rounded-2xl overflow-hidden font-manrope relative print:hidden",
          getCalendarBgClasses(variant),
          className,
        )}
        {...props}
      >
        {children}
        <EventPopover />
        <RecurrenceScopeDialog />
        <PrintPreviewDialog />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <div className="hidden print:block chesai-calendar-print-root w-full bg-white">
            <PrintPagesLayout />
          </div>,
          document.body,
        )}
    </>
  );
});
FullCalendarRootContent.displayName = "FullCalendarRootContent";

const FullCalendarRoot = React.forwardRef<HTMLDivElement, FullCalendarProps>(
  (
    {
      className,
      events,
      initialDate,
      initialView,
      variant,
      onDateClick,
      onEventClick,
      onViewChange,
      onEventCreate,
      onEventUpdate,
      onEventDelete,
      renderEventContent,

      // Included Customization Props
      renderPopoverHeader,
      renderPopoverFooter,
      renderPopoverCustomFields,
      hidePopoverTitle,
      hidePopoverTime,
      hidePopoverRecurrence,

      disableCreatePopover,
      disableEventPopover,
      disableCreateOnGridClick,
      disableEventClick,
      disableDragAndDrop,
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
        variant={variant}
        onDateClick={onDateClick}
        onEventClick={onEventClick}
        onViewChange={onViewChange}
        onEventCreate={onEventCreate}
        onEventUpdate={onEventUpdate}
        onEventDelete={onEventDelete}
        renderEventContent={renderEventContent}
        // Forwarding to Provider
        renderPopoverHeader={renderPopoverHeader}
        renderPopoverFooter={renderPopoverFooter}
        renderPopoverCustomFields={renderPopoverCustomFields}
        hidePopoverTitle={hidePopoverTitle}
        hidePopoverTime={hidePopoverTime}
        hidePopoverRecurrence={hidePopoverRecurrence}
        disableCreatePopover={disableCreatePopover}
        disableEventPopover={disableEventPopover}
        disableCreateOnGridClick={disableCreateOnGridClick}
        disableEventClick={disableEventClick}
        disableDragAndDrop={disableDragAndDrop}
      >
        <FullCalendarRootContent ref={ref} className={className} {...props}>
          {children}
        </FullCalendarRootContent>
      </FullCalendarProvider>
    );
  },
);
FullCalendarRoot.displayName = "FullCalendar";

const FullCalendarToolbar = ({ className }: { className?: string }) => {
  const {
    currentDate,
    view,
    variant,
    setView,
    navigateNext,
    navigatePrev,
    navigateToday,
    openPrintPreview,
  } = useFullCalendar();

  const { isRtl } = useLayout();

  const headerText = React.useMemo(() => {
    if (view === "day") return format(currentDate, "MMMM d, yyyy");
    if (view === "week") return format(currentDate, "MMMM yyyy");
    if (view === "year") return format(currentDate, "yyyy");
    return format(currentDate, "MMMM yyyy");
  }, [currentDate, view]);

  return (
    <div
      className={clsx(
        "flex items-center justify-between p-4 shrink-0 border-b border-outline-variant/30 z-30 relative print:hidden",
        getCalendarStickyBgClasses(variant),
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
            {isRtl ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </IconButton>
          <IconButton variant="ghost" size="sm" onClick={navigateNext}>
            {isRtl ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
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
            <IconButton
              variant="ghost"
              size="sm"
              onClick={openPrintPreview}
            >
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

export const FullCalendarViewDispatcher = () => {
  const { view, variant, currentDate, setCurrentDate } = useFullCalendar();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isPrintMode = React.useContext(PrintModeContext);

  const showSideCalendar = view === "day" && isDesktop && !isPrintMode;

  return (
    <div
      className={clsx(
        "flex-1 overflow-hidden relative flex flex-row",
        isPrintMode
          ? "bg-white h-full overflow-visible"
          : getCalendarBgClasses(variant),
      )}
    >
      {showSideCalendar && (
        <div className={clsx(
            "w-[350px] shrink-0 border-r border-outline-variant/30 p-2 flex flex-col",
            getCalendarSidePanelBgClasses(variant)
          )}>
          <Calendar
            mode="single"
            value={currentDate}
            onSelect={(d) => {
              if (d) setCurrentDate(d);
            }}
            variant="embedded"
            itemShape="full"
            shape="minimal"
          />
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {view === "month" && <MonthView />}
        {(view === "week" || view === "day") && <TimelineView />}
        {view === "year" && <YearView />}
      </div>
    </div>
  );
};
export * from "./recurrence-dialog";
export * from "./recurrence-select";

export const FullCalendar = Object.assign(FullCalendarRoot, {
  Toolbar: FullCalendarToolbar,
  View: FullCalendarViewDispatcher,
});

export * from "./types";
