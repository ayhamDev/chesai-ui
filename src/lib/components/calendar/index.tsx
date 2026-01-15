"use client";

import { clsx } from "clsx";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "../button";
import { iconButtonVariants } from "../icon-button";

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
        caption_label: "text-sm font-medium text-on-surface",
        nav: "space-x-1 flex items-center",
        nav_button: clsx(
          buttonVariants({ variant: "ghost", shape: "full" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-on-surface-variant"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-center",
        head_cell:
          "text-on-surface-variant rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2 justify-center",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-secondary-container/50 [&:has([aria-selected])]:bg-secondary-container first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
        day: clsx(
          iconButtonVariants({ variant: "ghost", shape: "full" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-on-surface"
        ),
        day_range_end: "day-range-end",
        // FIX: Added !text-on-primary to ensure correct contrast text color overrides default button styles
        day_selected:
          "bg-primary !text-on-primary hover:bg-primary hover:!text-on-primary focus:bg-primary focus:!text-on-primary",
        day_today: "bg-secondary-container text-on-secondary-container",
        day_outside:
          "day-outside text-on-surface-variant opacity-50 aria-selected:bg-secondary-container/50 aria-selected:text-on-surface-variant aria-selected:opacity-30",
        day_disabled: "text-on-surface-variant opacity-50",
        day_range_middle:
          "aria-selected:bg-secondary-container aria-selected:text-on-secondary-container",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
