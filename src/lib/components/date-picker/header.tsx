import { format } from "date-fns";
import { Pencil } from "lucide-react";
import React from "react";
import type { DateRange } from "react-day-picker";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";

interface DatePickerHeaderProps {
  mode: "single" | "range";
  selectedDate?: Date;
  selectedRange?: DateRange;
  onEditClick: () => void;
}

export const DatePickerHeader = ({
  mode,
  selectedDate,
  selectedRange,
  onEditClick,
}: DatePickerHeaderProps) => {
  const getSingleDateText = () => {
    if (!selectedDate) return "Select date";
    return format(selectedDate, "E, MMM d");
  };

  const getRangeDateText = () => {
    if (!selectedRange?.from) return "Select dates";
    if (selectedRange.from && !selectedRange.to) {
      return format(selectedRange.from, "MMM d");
    }
    if (selectedRange.from && selectedRange.to) {
      return `${format(selectedRange.from, "MMM d")} – ${format(
        selectedRange.to,
        "MMM d"
      )}`;
    }
    return "Select dates";
  };

  return (
    <div className="flex items-center justify-between pt-6 px-0 pb-2">
      <div>
        {mode === "range" && (
          <Typography variant="muted">Depart – Return dates</Typography>
        )}
        <Typography variant="h2" className="!mt-0">
          {mode === "single" ? getSingleDateText() : getRangeDateText()}
        </Typography>
      </div>
      <IconButton
        variant="ghost"
        size="md"
        aria-label="Enter date manually"
        onClick={onEditClick}
      >
        <Pencil className="h-5 w-5" />
      </IconButton>
    </div>
  );
};
