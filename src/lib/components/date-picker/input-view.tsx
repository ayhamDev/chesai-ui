import { isValid, parse } from "date-fns";
import { Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";
// FIX: Use 'import type' for type-only imports
import type { DateRange } from "react-day-picker";
import { IconButton } from "../icon-button";
import { Input } from "../input";
import { Typography } from "../typography";

interface DateInputViewProps {
  mode: "single" | "range";
  value: Date | DateRange | undefined;
  onValueChange: (value: Date | DateRange | undefined) => void;
  onCalendarClick: () => void;
}

const formatDate = (date: Date | undefined) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

// Helper to safely check if a value is a DateRange
const isDateRange = (value: any): value is DateRange => {
  return value && typeof value === "object" && "from" in value;
};

export const DateInputView = ({
  mode,
  value,
  onValueChange,
  onCalendarClick,
}: DateInputViewProps) => {
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [startError, setStartError] = useState("");
  const [endError, setEndError] = useState("");

  useEffect(() => {
    if (mode === "single") {
      setStartInput(formatDate(value as Date));
    } else if (isDateRange(value)) {
      setStartInput(formatDate(value.from));
      setEndInput(formatDate(value.to));
    } else {
      // Handle case where range is undefined or partially formed
      setStartInput("");
      setEndInput("");
    }
  }, [value, mode]);

  const handleDateChange = (input: string): Date | null | undefined => {
    if (!input) return undefined; // Empty field
    const parsed = parse(input, "P", new Date());
    return isValid(parsed) ? parsed : null; // Invalid date
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartInput = e.target.value;
    setStartInput(newStartInput);
    const newStartDate = handleDateChange(newStartInput);

    if (newStartDate === null) {
      setStartError("Invalid date");
    } else {
      setStartError("");
      if (mode === "single") {
        onValueChange(newStartDate);
      } else {
        // FIX: Safely access current range and update 'from'
        const currentTo = isDateRange(value) ? value.to : undefined;
        onValueChange({ from: newStartDate, to: currentTo });
      }
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndInput = e.target.value;
    setEndInput(newEndInput);
    const newEndDate = handleDateChange(newEndInput);

    if (newEndDate === null) {
      setEndError("Invalid date");
    } else {
      setEndError("");
      // FIX: Safely access current range 'from' and update 'to'
      const currentFrom = isDateRange(value) ? value.from : undefined;
      onValueChange({ from: currentFrom, to: newEndDate });
    }
  };

  return (
    <div className="p-4">
      <Typography variant="muted">Select date</Typography>
      <div className="flex items-center justify-between mt-2 mb-6">
        <Typography variant="h2" className="!mt-0">
          Enter date
        </Typography>
        <IconButton
          variant="ghost"
          size="md"
          onClick={onCalendarClick}
          aria-label="Switch to calendar view"
        >
          <Calendar className="h-6 w-6" />
        </IconButton>
      </div>

      <div className="space-y-4">
        <Input
          label={mode === "single" ? "Date" : "Start date"}
          value={startInput}
          onChange={handleStartChange}
          placeholder="mm/dd/yyyy"
          error={startError}
          autoFocus
        />
        {mode === "range" && (
          <Input
            label="End date"
            value={endInput}
            onChange={handleEndChange}
            placeholder="mm/dd/yyyy"
            error={endError}
          />
        )}
      </div>
    </div>
  );
};
