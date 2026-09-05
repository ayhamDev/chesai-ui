// src/lib/components/full-calendar/calendar-context.tsx
"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
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
  useEffect,
  useMemo,
  useRef,
} from "react";
import { getCalendarDateRange } from "./calendar-range";
import type {
  CalendarEvent,
  CalendarVariant,
  CalendarView,
  FullCalendarProps,
  PrintSettings,
} from "./types";

export interface PopoverState {
  isOpen: boolean;
  mode: "create" | "edit";
  anchorRect?: DOMRect;
}

export type RecurrenceEditScope = "single" | "all";

export interface RecurrenceScopeRequest {
  action: "update" | "delete";
  singleDisabled?: boolean;
}

interface FullCalendarContextType extends FullCalendarProps {
  currentDate: Date;
  view: CalendarView;
  variant: CalendarVariant;

  navigateNext: () => void;
  navigatePrev: () => void;
  navigateToday: () => void;
  setView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;

  popover: PopoverState;
  draftEvent: CalendarEvent | null;
  editingEvent: CalendarEvent | null;
  setDraftEvent: React.Dispatch<React.SetStateAction<CalendarEvent | null>>;
  openPopover: (
    mode: "create" | "edit",
    anchorRect?: DOMRect,
    initialDate?: Date,
    event?: CalendarEvent,
  ) => void;
  closePopover: () => void;

  recurrenceScopeRequest: RecurrenceScopeRequest | null;
  requestRecurrenceScope: (
    request: RecurrenceScopeRequest,
  ) => Promise<RecurrenceEditScope | null>;
  resolveRecurrenceScope: (scope: RecurrenceEditScope | null) => void;

  isPrintPreviewOpen: boolean;
  openPrintPreview: () => void;
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
  overrideDate,
  overrideView,
}: {
  children: React.ReactNode;
  overrideDate: Date;
  overrideView: CalendarView;
}) => {
  const context = useFullCalendar();

  const printContextValue = useMemo(
    () => ({
      ...context,
      view: overrideView,
      currentDate: overrideDate,
      variant: "ghost" as CalendarVariant,
    }),
    [context, overrideDate, overrideView],
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
  variant = "surface",
  events = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onViewChange,
  onDateRangeChange,

  // Customization Props Extracted
  hidePopoverTitle = false,
  hidePopoverTime = false,
  hidePopoverRecurrence = false,
  renderPopoverHeader,
  renderPopoverFooter,
  renderPopoverCustomFields,

  renderEventContent,
  className,
  disableCreatePopover,
  disableEventPopover,
  disableCreateOnGridClick = false,
  disableEventClick = false,
  disableDragAndDrop = false,
  ...props
}: FullCalendarProps & { children: React.ReactNode }) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setViewState] = useState<CalendarView>(initialView);
  const dateRangeCallbackRef = useRef(onDateRangeChange);
  dateRangeCallbackRef.current = onDateRangeChange;

  const visibleRange = useMemo(
    () => getCalendarDateRange(currentDate, view),
    [currentDate, view],
  );
  const visibleRangeStart = visibleRange.start.getTime();
  const visibleRangeEnd = visibleRange.end.getTime();
  const lastNotifiedRangeRef = useRef<string | null>(null);

  useEffect(() => {
    const rangeKey = `${visibleRangeStart}:${visibleRangeEnd}`;
    if (lastNotifiedRangeRef.current === rangeKey) return;

    lastNotifiedRangeRef.current = rangeKey;
    dateRangeCallbackRef.current?.(
      new Date(visibleRangeStart),
      new Date(visibleRangeEnd),
    );
  }, [visibleRangeStart, visibleRangeEnd]);

  const [popover, setPopover] = useState<PopoverState>({
    isOpen: false,
    mode: "create",
  });

  const [draftEvent, setDraftEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [recurrenceScopeRequest, setRecurrenceScopeRequest] =
    useState<RecurrenceScopeRequest | null>(null);
  const recurrenceScopeResolver = useRef<
    ((scope: RecurrenceEditScope | null) => void) | null
  >(null);

  const requestRecurrenceScope = useCallback(
    (request: RecurrenceScopeRequest) =>
      new Promise<RecurrenceEditScope | null>((resolve) => {
        recurrenceScopeResolver.current?.(null);
        recurrenceScopeResolver.current = resolve;
        setRecurrenceScopeRequest(request);
      }),
    [],
  );

  const resolveRecurrenceScope = useCallback(
    (scope: RecurrenceEditScope | null) => {
      recurrenceScopeResolver.current?.(scope);
      recurrenceScopeResolver.current = null;
      setRecurrenceScopeRequest(null);
    },
    [],
  );

  const [isPrintPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    rangeStart: startOfWeek(initialDate),
    rangeEnd: endOfWeek(initialDate),
    view: initialView,
    orientation: "auto",
    colorStyle: "full",
    onlyDaysWithEvents: false,
  });

  const openPrintPreview = useCallback(() => {
    let rangeStart: Date;
    let rangeEnd: Date;

    if (view === "day") {
      rangeStart = startOfDay(currentDate);
      rangeEnd = endOfDay(currentDate);
    } else if (view === "week") {
      rangeStart = startOfWeek(currentDate);
      rangeEnd = endOfWeek(currentDate);
    } else if (view === "month") {
      rangeStart = startOfMonth(currentDate);
      rangeEnd = endOfMonth(currentDate);
    } else {
      rangeStart = startOfYear(currentDate);
      rangeEnd = endOfYear(currentDate);
    }

    setPrintSettings((settings) => ({
      ...settings,
      rangeStart,
      rangeEnd,
      view,
    }));
    setPrintPreviewOpen(true);
  }, [currentDate, view]);

  const handleSetView = useCallback(
    (newView: CalendarView) => {
      setViewState(newView);
      onViewChange?.(newView);
    },
    [onViewChange],
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
        setEditingEvent(event);
        setDraftEvent({ ...event, isDraft: false });
      } else {
        setEditingEvent(null);
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
    setEditingEvent(null);
  }, []);

  const value = useMemo(
    () => ({
      ...props,
      events,
      currentDate,
      view,
      variant,
      onEventCreate,
      onEventUpdate,
      onEventDelete,
      onViewChange,
      onDateRangeChange,

      // Included new customization props
      hidePopoverTitle,
      hidePopoverTime,
      hidePopoverRecurrence,
      renderPopoverHeader,
      renderPopoverFooter,
      renderPopoverCustomFields,

      renderEventContent,
      className,
      navigateNext,
      navigatePrev,
      navigateToday,
      setView: handleSetView,
      setCurrentDate,
      popover,
      draftEvent,
      editingEvent,
      setDraftEvent,
      openPopover,
      closePopover,
      recurrenceScopeRequest,
      requestRecurrenceScope,
      resolveRecurrenceScope,
      isPrintPreviewOpen,
      openPrintPreview,
      setPrintPreviewOpen,
      printSettings,
      setPrintSettings,
      disableCreatePopover:
        disableCreatePopover ?? disableCreateOnGridClick,
      disableEventPopover: disableEventPopover ?? disableEventClick,
      disableDragAndDrop,
    }),
    [
      props,
      events,
      currentDate,
      view,
      variant,
      onEventCreate,
      onEventUpdate,
      onEventDelete,
      onViewChange,
      onDateRangeChange,
      hidePopoverTitle,
      hidePopoverTime,
      hidePopoverRecurrence,
      renderPopoverHeader,
      renderPopoverFooter,
      renderPopoverCustomFields,
      renderEventContent,
      className,
      navigateNext,
      navigatePrev,
      navigateToday,
      handleSetView,
      popover,
      draftEvent,
      editingEvent,
      openPopover,
      closePopover,
      recurrenceScopeRequest,
      requestRecurrenceScope,
      resolveRecurrenceScope,
      isPrintPreviewOpen,
      openPrintPreview,
      printSettings,
      disableCreatePopover,
      disableEventPopover,
      disableCreateOnGridClick,
      disableEventClick,
      disableDragAndDrop,
    ],
  );

  return (
    <FullCalendarContext.Provider value={value}>
      {children}
    </FullCalendarContext.Provider>
  );
};
