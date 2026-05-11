// src/lib/components/full-calendar/calendar-context.tsx
"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
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
import type { CalendarEvent, CalendarView, FullCalendarProps } from "./types";

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

  isPrinting: boolean;
  triggerPrint: () => void;
}

const FullCalendarContext = createContext<FullCalendarContextType | null>(null);

export const useFullCalendar = () => {
  const context = useContext(FullCalendarContext);
  if (!context) {
    throw new Error("useFullCalendar must be used within a FullCalendar.Root");
  }
  return context;
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
  const [isPrinting, setIsPrinting] = useState(false);

  const [popover, setPopover] = useState<PopoverState>({
    isOpen: false,
    mode: "create",
  });

  const [draftEvent, setDraftEvent] = useState<CalendarEvent | null>(null);

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
        // FIX: Remove isDraft for edited events so they stay solid on the grid
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
          isDraft: true, // Only true for newly created drafts
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

  const triggerPrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
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
      isPrinting,
      triggerPrint,
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
      isPrinting,
      triggerPrint,
    ],
  );

  return (
    <FullCalendarContext.Provider value={value}>
      {children}
    </FullCalendarContext.Provider>
  );
};
