"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { clsx } from "clsx";
import { buttonVariants } from "../button"; // Your existing button variants

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={clsx("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: clsx(
          buttonVariants({ variant: "ghost", shape: "full" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-center",
        head_cell:
          "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2 justify-center",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-graphite-secondary/50 [&:has([aria-selected])]:bg-graphite-secondary first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
        day: clsx(
          buttonVariants({ variant: "ghost", shape: "full" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-graphite-primary text-graphite-primaryForeground hover:bg-graphite-primary hover:text-graphite-primaryForeground focus:bg-graphite-primary focus:text-graphite-primaryForeground",
        day_today: "bg-graphite-secondary text-graphite-secondaryForeground",
        day_outside:
          "day-outside text-gray-500 opacity-50 aria-selected:bg-graphite-secondary/50 aria-selected:text-gray-500 aria-selected:opacity-30",
        day_disabled: "text-gray-500 opacity-50",
        day_range_middle:
          "aria-selected:bg-graphite-secondary aria-selected:text-graphite-secondaryForeground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
