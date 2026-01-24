"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { format } from "date-fns";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  type Transition,
} from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState, memo } from "react";
import useRipple from "use-ripple-hook";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { type DateRange, useCalendar } from "../../hooks/use-calender";

// --- VARIANTS & STYLES ---

const calendarVariants = cva(
  "overflow-hidden select-none p-4 text-on-surface relative transition-colors duration-300",
  {
    variants: {
      shape: {
        full: "rounded-[28px]",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      variant: {
        default: "bg-surface-container-high shadow-xl w-[320px]",
        embedded: "bg-transparent shadow-none w-full border-none",
      },
    },
    defaultVariants: {
      shape: "full",
      variant: "default",
    },
  },
);

const itemShapeStyles = {
  full: "rounded-full",
  minimal: "rounded-lg",
  sharp: "rounded-none",
};

const getDayButtonClasses = (shape: "full" | "minimal" | "sharp") => {
  const radiusClass = itemShapeStyles[shape];

  return clsx(
    "relative z-10 w-10 h-10 flex items-center justify-center text-sm focus:outline-none overflow-hidden",
    "transition-colors duration-200",
    radiusClass,
    "after:absolute after:inset-0 after:z-[-1] after:bg-primary/5 after:opacity-0 after:scale-50 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out " +
      "hover:after:opacity-100 hover:after:scale-100 " +
      "disabled:after:opacity-0",
    `after:${radiusClass}`,
    "after:transition-[opacity,transform] after:duration-200 after:ease-out",
    "hover:after:opacity-100 hover:after:scale-100",
  );
};

// --- ANIMATION CONFIG ---
const transition: Transition = {
  // FIX: Explicitly type transition object
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 1,
  }),
};

// --- TYPES ---
// FIX: Removed incorrect extension of React.HTMLAttributes
export interface CalendarProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">,
    VariantProps<typeof calendarVariants> {
  mode?: "single" | "range";
  value?: Date | DateRange;
  onSelect?: (date: Date) => void;
  onRangeSelect?: (range: DateRange) => void;
  itemShape?: "full" | "minimal" | "sharp";
}

interface DayButtonProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  onClick: () => void;
  itemShape?: "full" | "minimal" | "sharp";
}

const DayButton = memo(
  ({
    day,
    isCurrentMonth,
    isToday,
    isSelected,
    isRangeStart,
    isRangeEnd,
    isInRange,
    onClick,
    itemShape = "full",
  }: DayButtonProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [, event] = useRipple({
      ref: buttonRef as React.RefObject<HTMLElement>, // FIX: Cast ref
      color: "var(--color-ripple-dark)",
      duration: 400,
    });

    if (!isCurrentMonth) {
      return (
        <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant/30 text-sm">
          {format(day, "d")}
        </div>
      );
    }

    return (
      <button
        ref={buttonRef}
        onPointerDown={event}
        onClick={onClick}
        className={clsx(
          getDayButtonClasses(itemShape),
          isSelected || isRangeStart || isRangeEnd
            ? "bg-primary text-on-primary font-bold shadow-sm"
            : isToday && !isInRange
              ? "border border-primary text-primary font-bold"
              : "text-on-surface",
        )}
      >
        {format(day, "d")}
      </button>
    );
  },
);
DayButton.displayName = "DayButton";

const YEAR_COLUMNS = 3;
const YearPicker = memo(
  ({
    currentYear,
    onSelectYear,
    itemShape = "full",
  }: {
    currentYear: number;
    onSelectYear: (year: number) => void;
    itemShape?: "full" | "minimal" | "sharp";
  }) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const years = React.useMemo(
      () => Array.from({ length: 400 }, (_, i) => 1900 + i),
      [],
    );
    const totalRows = Math.ceil(years.length / YEAR_COLUMNS);
    const currentYearIndex = years.indexOf(currentYear);
    const initialRowOffset =
      currentYearIndex !== -1 ? Math.floor(currentYearIndex / YEAR_COLUMNS) : 0;
    const virtualizer = useVirtualizer({
      count: totalRows,
      getScrollElement: () => viewportRef.current,
      estimateSize: () => 60,
      overscan: 3,
      initialOffset: initialRowOffset * 60,
    });
    useEffect(() => {
      if (initialRowOffset !== -1) {
        virtualizer.scrollToIndex(initialRowOffset, { align: "center" });
      }
    }, [initialRowOffset, virtualizer]);
    return (
      <ElasticScrollArea
        ref={viewportRef}
        className="h-full w-full"
        scrollbarVisibility="auto"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const rowStartIndex = virtualRow.index * YEAR_COLUMNS;
            const rowYears = years.slice(
              rowStartIndex,
              rowStartIndex + YEAR_COLUMNS,
            );
            return (
              <div
                key={virtualRow.key}
                className="absolute top-0 left-0 w-full flex justify-between px-2"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  willChange: "transform",
                }}
              >
                {rowYears.map((year) => {
                  const isSelected = year === currentYear;
                  return (
                    <button
                      key={year}
                      onClick={() => onSelectYear(year)}
                      className={clsx(
                        "w-[88px] h-10 flex items-center justify-center text-sm font-medium transition-colors duration-200 border border-transparent focus:outline-none",
                        itemShapeStyles[itemShape],
                        isSelected
                          ? "bg-primary text-on-primary font-bold shadow-sm"
                          : "text-on-surface hover:bg-surface-container-highest hover:border-outline-variant/30",
                      )}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ElasticScrollArea>
    );
  },
);
YearPicker.displayName = "YearPicker";

const MonthPicker = memo(
  ({
    currentMonthIndex,
    onSelectMonth,
    itemShape = "full",
  }: {
    currentMonthIndex: number;
    onSelectMonth: (index: number) => void;
    itemShape?: "full" | "minimal" | "sharp";
  }) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return (
      <ElasticScrollArea className="h-full">
        <div className="grid grid-cols-3 gap-4 p-4 min-h-full content-center">
          {months.map((m, i) => (
            <button
              key={m}
              onClick={() => onSelectMonth(i)}
              className={clsx(
                "h-12 text-sm font-medium transition-colors duration-200 border border-transparent focus:outline-none",
                itemShapeStyles[itemShape],
                i === currentMonthIndex
                  ? "bg-primary text-on-primary font-bold shadow-sm"
                  : "text-on-surface hover:bg-surface-container-highest hover:border-outline-variant",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </ElasticScrollArea>
    );
  },
);
MonthPicker.displayName = "MonthPicker";

// --- MAIN COMPONENT ---

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      className,
      shape,
      variant,
      itemShape = "full",
      mode = "single",
      value,
      onSelect,
      onRangeSelect,
      ...props
    },
    ref,
  ) => {
    const [view, setView] = useState<"days" | "months" | "years">("days");
    const [direction, setDirection] = useState(0);

    const {
      cursorDate,
      daysInMonth,
      weekdays,
      getDayProps,
      nextMonth,
      prevMonth,
      nextYear,
      prevYear,
      selectYear,
      selectMonth,
      currentMonthName,
      currentMonthIndex,
      currentYear,
    } = useCalendar(value instanceof Date ? value : new Date(), value, mode);

    const handleNext = () => {
      setDirection(1);
      if (view === "years") nextYear();
      else nextMonth();
    };

    const handlePrev = () => {
      setDirection(-1);
      if (view === "years") prevYear();
      else prevMonth();
    };

    const SWIPE_THRESHOLD = 50;
    const handleDragEnd = (_: any, info: PanInfo) => {
      if (view !== "days") return;
      if (info.offset.x < -SWIPE_THRESHOLD) {
        handleNext();
      } else if (info.offset.x > SWIPE_THRESHOLD) {
        handlePrev();
      }
    };

    const handleDayClick = (day: Date) => {
      if (mode === "single") {
        onSelect?.(day);
      } else {
        const currentRange = (value as DateRange) || {};
        if (currentRange.from && currentRange.to) {
          onRangeSelect?.({ from: day, to: undefined });
        } else if (!currentRange.from) {
          onRangeSelect?.({ from: day, to: undefined });
        } else if (day < currentRange.from) {
          onRangeSelect?.({ from: day, to: currentRange.from });
        } else {
          onRangeSelect?.({ from: currentRange.from, to: day });
        }
      }
    };

    return (
      <div
        ref={ref}
        className={clsx(calendarVariants({ shape, variant, className }))}
        {...props}
      >
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between h-12 px-2 mb-4 relative z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === "months" ? "days" : "months")}
              className={clsx(
                "flex items-center gap-1 px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                itemShape === "sharp" ? "rounded-none" : "rounded-lg",
                view === "months"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface hover:bg-surface-container-highest",
              )}
            >
              <span>{currentMonthName}</span>
              <ChevronDown
                className={clsx(
                  "w-4 h-4 transition-transform duration-200",
                  view === "months" && "rotate-180",
                )}
              />
            </button>

            <button
              onClick={() => setView(view === "years" ? "days" : "years")}
              className={clsx(
                "flex items-center gap-1 px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                itemShape === "sharp" ? "rounded-none" : "rounded-lg",
                view === "years"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface hover:bg-surface-container-highest",
              )}
            >
              <span>{currentYear}</span>
              <ChevronDown
                className={clsx(
                  "w-4 h-4 transition-transform duration-200",
                  view === "years" && "rotate-180",
                )}
              />
            </button>
          </div>

          <div
            className={clsx(
              "flex gap-1 transition-opacity duration-200",
              view !== "days" && "opacity-0 pointer-events-none",
            )}
          >
            <IconButton
              variant="ghost"
              size="sm"
              shape="full"
              onClick={handlePrev}
            >
              <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              shape="full"
              onClick={handleNext}
            >
              <ChevronRight className="w-5 h-5 text-on-surface-variant" />
            </IconButton>
          </div>
        </div>

        {/* --- BODY --- */}
        <div className="relative h-[312px] overflow-hidden">
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            {view === "days" && (
              <motion.div
                key={format(cursorDate, "yyyy-MM")}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                style={{ willChange: "transform" }}
                className="absolute inset-0 flex flex-col w-full h-full touch-pan-y"
              >
                <div className="grid grid-cols-7 mb-2 shrink-0">
                  {weekdays.map((day, i) => (
                    <div
                      key={i}
                      className="h-8 flex items-center justify-center text-on-surface-variant text-xs font-medium"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1">
                  {daysInMonth.map((day, i) => {
                    const dayProps = getDayProps(day);
                    const { isRangeStart, isRangeEnd, isInRange } = dayProps;

                    return (
                      <div
                        key={i}
                        className={clsx(
                          "relative flex items-center justify-center w-full h-10 p-0",
                          (isInRange || isRangeStart || isRangeEnd) &&
                            "before:absolute before:inset-y-0 before:bg-primary/10 before:z-0",
                          isRangeStart &&
                            "before:left-1/2 before:right-0 before:rounded-l-full",
                          isRangeEnd &&
                            "before:left-0 before:right-1/2 before:rounded-r-full",
                          isInRange && "before:left-0 before:right-0",
                        )}
                      >
                        <DayButton
                          day={day}
                          {...dayProps}
                          onClick={() => handleDayClick(day)}
                          itemShape={itemShape}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
            {view === "months" && (
              <motion.div
                key="months"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-10"
              >
                <MonthPicker
                  currentMonthIndex={currentMonthIndex}
                  onSelectMonth={(m) => {
                    selectMonth(m);
                    setView("days");
                  }}
                  itemShape={itemShape}
                />
              </motion.div>
            )}
            {view === "years" && (
              <motion.div
                key="years"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-10"
              >
                <YearPicker
                  currentYear={currentYear}
                  onSelectYear={(y) => {
                    selectYear(y);
                    setView("days");
                  }}
                  itemShape={itemShape}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);

Calendar.displayName = "Calendar";
