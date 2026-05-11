// src/lib/components/full-calendar/index.tsx
"use client";

import { clsx } from "clsx";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "../src/lib/components/button";
import { IconButton } from "../src/lib/components/icon-button";
import { Select } from "../src/lib/components/select";
import { Typography } from "../src/lib/components/typography";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
} from "../src/lib/components/tooltip";
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
import { PrintPreviewDialog } from "./print-preview-dialog";
import type { FullCalendarProps } from "./types";

// --- ROOT COMPONENT ---

export const PrintHeader = () => {
  const { currentDate, view, printSettings } = useFullCalendar();
  const isPrintMode = React.useContext(PrintModeContext);

  const headerText = React.useMemo(() => {
    if (
      isPrintMode &&
      (printSettings.view === "auto" ||
        printSettings.view === "week" ||
        printSettings.view === "day")
    ) {
      const start = format(printSettings.rangeStart, "MMM d, yyyy");
      const end = format(printSettings.rangeEnd, "MMM d, yyyy");
      if (start !== end) return `${start} - ${end}`;
      return start;
    }
    if (view === "day") return format(currentDate, "MMMM d, yyyy");
    if (view === "week") return format(currentDate, "MMMM yyyy");
    if (view === "year") return format(currentDate, "yyyy");
    return format(currentDate, "MMMM yyyy");
  }, [currentDate, view, isPrintMode, printSettings]);

  return (
    <div className="w-full text-center py-4 font-bold text-2xl border-b border-black/20 bg-white text-black shrink-0">
      {headerText}
    </div>
  );
};

const FullCalendarRootContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { setPrintPreviewOpen, printSettings } = useFullCalendar();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPrintPreviewOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPrintPreviewOpen]);

  const printCss = `
    @media print {
      @page {
        size: ${printSettings.orientation === "landscape" ? "landscape" : printSettings.orientation === "portrait" ? "portrait" : "auto"};
        margin: 0.5cm;
      }
      body {
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
        height: 100vh !important;
        background: white !important;
        color: black !important;
      }
      ${printSettings.colorStyle === "bw" ? ".chesai-calendar-print-root { filter: grayscale(100%); }" : ""}
      ${printSettings.fontSize === "small" ? ".chesai-calendar-print-root { font-size: 0.85rem !important; }" : ""}
      ${printSettings.fontSize === "smallest" ? ".chesai-calendar-print-root { font-size: 0.7rem !important; }" : ""}
    }
  `;

  return (
    <>
      <style>{printCss}</style>
      <div
        className={clsx(
          "flex flex-col w-full h-full bg-surface text-on-surface rounded-2xl overflow-hidden font-manrope relative print:hidden",
          className,
        )}
        {...props}
      >
        {children}
        <EventPopover />
        <PrintPreviewDialog />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <div className="hidden print:block chesai-calendar-print-root">
            <PrintOverrideProvider>
              <div className="flex flex-col w-full h-[100vh] overflow-hidden bg-white text-black [&_*]:!text-black">
                <PrintHeader />
                <FullCalendarViewDispatcher />
              </div>
            </PrintOverrideProvider>
          </div>,
          document.body,
        )}
    </>
  );
};

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
    setView,
    navigateNext,
    navigatePrev,
    navigateToday,
    setPrintPreviewOpen,
  } = useFullCalendar();

  const headerText = React.useMemo(() => {
    if (view === "day") return format(currentDate, "MMMM d, yyyy");
    if (view === "week") return format(currentDate, "MMMM yyyy");
    if (view === "year") return format(currentDate, "yyyy");
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
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => setPrintPreviewOpen(true)}
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
  const { view } = useFullCalendar();

  return (
    <div className="flex-1 overflow-hidden relative flex flex-col bg-surface print:bg-white print:h-full print:overflow-visible">
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
