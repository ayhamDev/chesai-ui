import { clsx } from "clsx";
import { add, format, set } from "date-fns";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useCalendar } from "../../hooks/use-calender";
import { IconButton } from "../icon-button";

interface CalendarProps {
  mode: "single" | "range";
  value?: Date | DateRange;
  onSelect: (value?: Date | DateRange) => void;
}

type CalendarView = "day" | "month" | "year";

export const PaginatedCalendar = ({ mode, value, onSelect }: CalendarProps) => {
  const initialCursor = (
    mode === "single" ? value : (value as DateRange)?.from
  ) as Date;
  const [cursorDate, setCursorDate] = useState(initialCursor || new Date());
  const [currentView, setCurrentView] = useState<CalendarView>("day");
  const [direction, setDirection] = useState(0);

  const { daysInMonth, weekdays, getDayProps } = useCalendar(
    cursorDate,
    value,
    mode
  );

  // --- Data for Month and Year Views ---
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => format(new Date(0, i), "MMM")),
    []
  );
  const yearBlock = useMemo(() => {
    const startYear = Math.floor(cursorDate.getFullYear() / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  }, [cursorDate]);

  // --- Handlers ---
  const handleNav = (dir: 1 | -1) => {
    setDirection(dir);
    if (currentView === "day") {
      setCursorDate((d) => add(d, { months: dir }));
    } else if (currentView === "year") {
      setCursorDate((d) => add(d, { years: dir * 12 }));
    }
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 50) handleNav(-1);
    else if (info.offset.x < -50) handleNav(1);
  };

  const handleSelectDay = (day: Date) => {
    if (mode === "single") {
      onSelect(day);
    } else {
      const range = (value && "from" in value ? value : {}) as DateRange;
      if (!range.from || (range.from && range.to)) {
        onSelect({ from: day, to: undefined });
      } else {
        onSelect({
          from: day > range.from ? range.from : day,
          to: day > range.from ? day : range.from,
        });
      }
    }
  };

  const handleSelectMonth = (monthIndex: number) => {
    setCursorDate(set(cursorDate, { month: monthIndex }));
    setCurrentView("day");
  };

  const handleSelectYear = (year: number) => {
    setCursorDate(set(cursorDate, { year }));
    setCurrentView("month");
  };

  const handleHeaderClick = () => {
    if (currentView === "day") setCurrentView("year");
    else if (currentView === "year") setCurrentView("month");
    else setCurrentView("day");
  };

  // --- Animation Variants ---
  const viewVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? "100%" : "-100%" }),
    center: { opacity: 1, x: "0%" },
    exit: (dir: number) => ({ opacity: 0, x: dir < 0 ? "100%" : "-100%" }),
  };

  const today = new Date();

  return (
    <div className="p-0 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={handleHeaderClick}
          className="text-base font-semibold hover:bg-graphite-secondary px-2 py-1 rounded-lg transition-colors"
        >
          {currentView === "day" && format(cursorDate, "MMMM yyyy")}
          {currentView === "month" && format(cursorDate, "yyyy")}
          {currentView === "year" && `${yearBlock[0]} - ${yearBlock[11]}`}
        </button>
        {/* Show nav arrows only for paginated views */}
        {(currentView === "day" || currentView === "year") && (
          <div className="flex items-center ">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => handleNav(-1)}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => handleNav(1)}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </IconButton>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden h-72">
        <AnimatePresence initial={false} custom={direction}>
          {currentView === "day" && (
            <motion.div
              key={format(cursorDate, "yyyy-MM")}
              custom={direction}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="grid grid-cols-7 text-center absolute w-full cursor-grab active:cursor-grabbing"
            >
              {weekdays.map((day, i) => (
                <div
                  key={`${day}-${i}`}
                  className="w-10 h-10 flex items-center justify-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
              {daysInMonth.map((day) => {
                const {
                  isCurrentMonth,
                  isToday,
                  isSelected,
                  isRangeStart,
                  isRangeEnd,
                  isInRange,
                } = getDayProps(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={clsx(
                      "h-10 flex items-center justify-center",
                      isInRange && "bg-graphite-secondary",
                      isRangeStart && "bg-graphite-secondary rounded-l-full",
                      isRangeEnd && "bg-graphite-secondary rounded-r-full"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      disabled={!isCurrentMonth}
                      className={clsx(
                        "w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-graphite-ring focus:ring-offset-1",
                        !isCurrentMonth && "text-gray-400 pointer-events-none",
                        !isSelected &&
                          !isInRange &&
                          "hover:bg-graphite-secondary",
                        isToday &&
                          !isSelected &&
                          "font-bold ring-1 ring-graphite-primary",
                        isSelected &&
                          "bg-graphite-primary text-graphite-primaryForeground"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}

          {currentView === "month" && (
            <motion.div
              key="month-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-3 absolute w-full"
            >
              {months.map((month, i) => {
                const isSelected = i === cursorDate.getMonth();
                const isCurrentMonth =
                  i === today.getMonth() &&
                  cursorDate.getFullYear() === today.getFullYear();
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleSelectMonth(i)}
                    className={clsx(
                      "h-16 flex items-center justify-center rounded-xl transition-colors text-sm font-semibold",
                      "focus:outline-none focus:ring-2 focus:ring-graphite-ring focus:ring-offset-1",
                      isSelected
                        ? "bg-graphite-primary text-graphite-primaryForeground"
                        : "hover:bg-graphite-secondary",
                      isCurrentMonth &&
                        !isSelected &&
                        "ring-1 ring-graphite-primary"
                    )}
                  >
                    {month}
                  </button>
                );
              })}
            </motion.div>
          )}

          {currentView === "year" && (
            <motion.div
              key={yearBlock[0]}
              custom={direction}
              variants={viewVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="grid grid-cols-3 absolute w-full cursor-grab active:cursor-grabbing"
            >
              {yearBlock.map((year) => {
                const isSelected = year === cursorDate.getFullYear();
                const isCurrentYear = year === today.getFullYear();
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleSelectYear(year)}
                    className={clsx(
                      "h-16 flex items-center justify-center rounded-xl transition-colors text-sm font-semibold",
                      "focus:outline-none focus:ring-2 focus:ring-graphite-ring focus:ring-offset-1",
                      isSelected
                        ? "bg-graphite-primary text-graphite-primaryForeground"
                        : "hover:bg-graphite-secondary",
                      isCurrentYear &&
                        !isSelected &&
                        "ring-1 ring-graphite-primary"
                    )}
                  >
                    {year}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
