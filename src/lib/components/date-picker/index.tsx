"use client";

import * as Popover from "@radix-ui/react-popover";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { AppBar } from "../appbar";
import { Button } from "../button";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { IconButton } from "../icon-button";
import { Input, type InputProps } from "../input";
import { DatePickerHeader } from "./header";
import { DateInputView } from "./input-view";
import { PaginatedCalendar } from "./paginated-calendar";

type DatePickerProps = Omit<
  InputProps,
  "value" | "onChange" | "readOnly" | "endAdornment"
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
        endAdornment={<CalendarIcon className="h-4 w-4 text-gray-500" />}
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
              "z-50 min-w-[320px] w-full p-4 bg-graphite-card rounded-xl border border-graphite-border shadow-lg",
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
    <DialogContent shape="full" className="!p-0 max-w-sm">
      {isInputMode ? (
        // FIX: Pass the correct props to the new DateInputView
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
      <div className="flex justify-end gap-2 ">
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

  if (variant === "fullscreen") {
    return (
      <Dialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        variant="fullscreen"
      >
        <DialogTrigger asChild>{TriggerInput}</DialogTrigger>
        <DialogContent className="flex flex-col ">
          <AppBar.Provider>
            <AppBar
              size="md"
              appBarColor="background"
              startAdornment={
                <IconButton
                  variant="ghost"
                  shape="full"
                  onClick={() => handleOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </IconButton>
              }
              endAdornments={[
                <Button key="save" size={"sm"} onClick={handleConfirm}>
                  Save
                </Button>,
              ]}
            />
            <div className="flex-1 flex flex-col pt-16">
              {isInputMode ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-xs p-6">
                    <DateInputView
                      mode={mode}
                      value={tempValue}
                      onValueChange={setTempValue}
                      onCalendarClick={() => setIsInputMode(false)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-6">
                    <DatePickerHeader
                      mode={mode}
                      selectedDate={tempValue as Date}
                      selectedRange={tempValue as DateRange}
                      onEditClick={() => setIsInputMode(true)}
                    />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <PaginatedCalendar
                      mode={mode}
                      value={tempValue}
                      onSelect={setTempValue}
                    />
                  </div>
                </>
              )}
            </div>
          </AppBar.Provider>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};
