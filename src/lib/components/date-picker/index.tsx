"use client";

import * as Popover from "@radix-ui/react-popover";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "../button";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { Input, type InputProps } from "../input";
import { DatePickerHeader } from "./header";
import { DateInputView } from "./input-view";
import { PaginatedCalendar } from "./paginated-calendar";

type DatePickerProps = Omit<
  InputProps,
  "value" | "onChange" | "readOnly" | "endContent"
> & {
  value?: Date | DateRange;
  onChange?: (value?: Date | DateRange) => void;
  mode?: "single" | "range";
  variant?: "docked" | "modal" | "fullscreen";
};

export const DatePicker = ({
  value,
  onChange,
  mode = "single",
  placeholder = "Pick a date",
  variant: explicitVariant,
  ...inputProps
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInputMode, setIsInputMode] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const variant = explicitVariant || (isMobile ? "fullscreen" : "docked");

  const [tempValue, setTempValue] = useState(value);

  const displayValue = (() => {
    if (!value) return "";
    if (mode === "single" && value instanceof Date)
      return format(value, "MMMM dd, yyyy");
    if (mode === "range" && "from" in value) {
      if (value.from && value.to)
        return `${format(value.from, "MMM d")} - ${format(value.to, "MMM d")}`;
      return value.from ? format(value.from, "MMMM dd, yyyy") : "";
    }
    return "";
  })();

  const handleConfirm = () => {
    onChange?.(tempValue);
    setIsOpen(false);
    setIsInputMode(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) setTempValue(value);
    setIsOpen(open);
    if (!open) setIsInputMode(false);
  };

  const TriggerInput = (
    <div className="cursor-pointer">
      <Input
        readOnly
        value={displayValue}
        placeholder={placeholder}
        endContent={
          <CalendarIcon className="h-4 w-4 text-on-surface-variant" />
        }
        className="cursor-pointer"
        {...inputProps}
      />
    </div>
  );

  if (variant === "docked") {
    return (
      <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>{TriggerInput}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            className={clsx(
              "z-50 min-w-[320px] w-full p-4 bg-surface-container-high rounded-xl border border-outline-variant shadow-lg",
              "data-[state=open]:animate-menu-enter data-[state=closed]:animate-menu-exit"
            )}
          >
            <PaginatedCalendar
              mode={mode}
              value={value}
              onSelect={(val) => {
                onChange?.(val);
                setIsOpen(false);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  const DialogContentComponent = (
    <DialogContent
      shape="full"
      className="!p-0 max-w-sm bg-surface-container-high"
    >
      {isInputMode ? (
        <DateInputView
          mode={mode}
          value={tempValue}
          onValueChange={setTempValue}
          onCalendarClick={() => setIsInputMode(false)}
        />
      ) : (
        <DatePickerHeader
          mode={mode}
          selectedDate={tempValue as Date}
          selectedRange={tempValue as DateRange}
          onEditClick={() => setIsInputMode(true)}
        />
      )}
      {!isInputMode && (
        <PaginatedCalendar
          mode={mode}
          value={tempValue}
          onSelect={setTempValue}
        />
      )}
      <div className="flex justify-end gap-2 p-4">
        <Button variant="ghost" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="ghost" onClick={handleConfirm}>
          OK
        </Button>
      </div>
    </DialogContent>
  );

  if (variant === "modal") {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange} variant="basic">
        <DialogTrigger asChild>{TriggerInput}</DialogTrigger>
        {DialogContentComponent}
      </Dialog>
    );
  }

  return null;
};
