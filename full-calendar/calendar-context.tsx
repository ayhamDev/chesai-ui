// src/lib/components/full-calendar/calendar-context.tsx
"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfWeek,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type {
  CalendarEvent,
  CalendarView,
  FullCalendarProps,
  PrintSettings,
} from "./types";

export interface PopoverState {
  isOpen: boolean;
  mode: "create" | "edit";
  anchorRect?: DOMRect;
}

interface FullCalendarContextType extends FullCalendarProps {
  currentDate: Date;
  view: CalendarView;

  navigateNext: () => void;
  navigatePrev: () => void;
  navigateToday: () => void;
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;

  popover: PopoverState;
  draftEvent: CalendarEvent | null;
  setDraftEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  openPopover: (
    mode: "create" | "edit",
    anchorRect?: DOMRect,
    initialDate?: Date,
    event?: CalendarEvent,
  ) => void;
  closePopover: () => void;

  isPrintPreviewOpen: boolean;
  setPrintPreviewOpen: (v: boolean) => void;
  printSettings: PrintSettings;
  setPrintSettings: React.Dispatch<React.SetStateAction<PrintSettings>>;
}

const FullCalendarContext = createContext<FullCalendarContextType | null>(null);

export const useFullCalendar = () => {
  const context = useContext(FullCalendarContext);
  if (!context) {
    throw new Error("useFullCalendar must be used within a FullCalendar.Root");
  }
  return context;
};

// --- PRINT MODE LOGIC ---
export const PrintModeContext = createContext<boolean>(false);

export const PrintOverrideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const context = useFullCalendar();
  const printView =
    context.printSettings.view === "auto"
      ? context.view
      : context.printSettings.view;

  const printContextValue = useMemo(
    () => ({
      ...context,
      view: printView as CalendarView,
      // Override current date so Month/Year views center around the print range
      currentDate: context.printSettings.rangeStart,
    }),
    [context, printView],
  );

  return (
    <PrintModeContext.Provider value={true}>
      <FullCalendarContext.Provider value={printContextValue}>
        {children}
      </FullCalendarContext.Provider>
    </PrintModeContext.Provider>
  );
};

export const FullCalendarProvider = ({
  children,
  initialDate = new Date(),
  initialView = "month",
  events = [],
  ...props
}: FullCalendarProps & { children: React.ReactNode }) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setViewState] = useState<CalendarView>(initialView);

  const [popover, setPopover] = useState<PopoverState>({
    isOpen: false,
    mode: "create",
  });

  const [draftEvent, setDraftEvent] = useState<CalendarEvent | null>(null);

  const [isPrintPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    rangeStart: startOfWeek(initialDate),
    rangeEnd: endOfWeek(initialDate),
    view: "auto",
    fontSize: "normal",
    orientation: "auto",
    colorStyle: "full",
    showWeekends: true,
    showDeclined: false,
  });

  const handleSetView = useCallback(
    (newView: CalendarView) => {
      setViewState(newView);
      props.onViewChange?.(newView);
    },
    [props.onViewChange],
  );

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === "day") return addDays(prev, 1);
      if (view === "week") return addWeeks(prev, 1);
      if (view === "month") return addMonths(prev, 1);
      if (view === "year") return addYears(prev, 1);
      return prev;
    });
  }, [view]);

  const navigatePrev = useCallback(() => {
    setCurrentDate((prev) => {
      if (view === "day") return subDays(prev, 1);
      if (view === "week") return subWeeks(prev, 1);
      if (view === "month") return subMonths(prev, 1);
      if (view === "year") return subYears(prev, 1);
      return prev;
    });
  }, [view]);

  const navigateToday = useCallback(() => setCurrentDate(new Date()), []);

  const openPopover = useCallback(
    (
      mode: "create" | "edit",
      anchorRect?: DOMRect,
      initialDate?: Date,
      event?: CalendarEvent,
    ) => {
      if (mode === "edit" && event) {
        setDraftEvent({ ...event, isDraft: false });
      } else {
        const initStart = new Date(initialDate || new Date());
        if (initialDate && initialDate.getHours() !== 0) {
          initStart.setMinutes(0, 0, 0);
        } else {
          initStart.setHours(10, 0, 0, 0);
        }
        const initEnd = new Date(initStart);
        initEnd.setHours(initStart.getHours() + 1);

        setDraftEvent({
          id: `draft-${Date.now()}`,
          title: "",
          start: initStart,
          end: initEnd,
          isAllDay: false,
          type: "event",
          colorVariant: "primary",
          isDraft: true,
        });
      }
      setPopover({ isOpen: true, mode, anchorRect });
    },
    [],
  );

  const closePopover = useCallback(() => {
    setPopover((prev) => ({ ...prev, isOpen: false }));
    setDraftEvent(null);
  }, []);

  const value = useMemo(
    () => ({
      ...props,
      events,
      currentDate,
      view,
      navigateNext,
      navigatePrev,
      navigateToday,
      setView: handleSetView,
      setCurrentDate,
      popover,
      draftEvent,
      setDraftEvent,
      openPopover,
      closePopover,
      isPrintPreviewOpen,
      setPrintPreviewOpen,
      printSettings,
      setPrintSettings,
    }),
    [
      props,
      events,
      currentDate,
      view,
      navigateNext,
      navigatePrev,
      navigateToday,
      handleSetView,
      popover,
      draftEvent,
      openPopover,
      closePopover,
      isPrintPreviewOpen,
      printSettings,
    ],
  );

  return (
    <FullCalendarContext.Provider value={value}>
      {children}
    </FullCalendarContext.Provider>
  );
};
