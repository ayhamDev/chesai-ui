"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { format } from "date-fns";
import { animate } from "framer-motion";
import { Clock } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTimePicker } from "../../hooks/use-time-picker";
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { inputWrapperVariants } from "../input";

interface TimeRollerProps {
  items: (string | number)[];
  value: string | number;
  onValueChange: (newValue: string | number) => void;
}

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 5;

const TimeRoller = React.forwardRef<HTMLDivElement, TimeRollerProps>(
  ({ items, value, onValueChange }, ref) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => scrollerRef.current!);

    const paddingCount = Math.floor(VISIBLE_ITEMS / 2);

    const getTargetIndex = useCallback(
      (val: string | number) => {
        const index = items.findIndex((item) => String(item) === String(val));
        return Math.max(0, index);
      },
      [items],
    );

    useLayoutEffect(() => {
      const scroller = scrollerRef.current;
      if (scroller) {
        const targetIndex = getTargetIndex(value);
        scroller.scrollTop = targetIndex * ITEM_HEIGHT;
      }
    }, [value, getTargetIndex]);

    const handleScroll = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const currentScrollTop = scroller.scrollTop;
        const snappedIndex = Math.round(currentScrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(
          0,
          Math.min(snappedIndex, items.length - 1),
        );
        const targetScrollTop = clampedIndex * ITEM_HEIGHT;

        animate(currentScrollTop, targetScrollTop, {
          type: "spring",
          stiffness: 400,
          damping: 40,
          mass: 0.8,
          onUpdate: (latest) => {
            if (scroller) {
              scroller.scrollTop = latest;
            }
          },
          onComplete: () => {
            const newValue = items[clampedIndex];
            if (String(newValue) !== String(value)) {
              onValueChange(newValue);
            }
          },
        });
      }, 150);
    }, [items, value, onValueChange]);

    useEffect(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      scroller.addEventListener("scroll", handleScroll);
      return () => {
        scroller.removeEventListener("scroll", handleScroll);
      };
    }, [handleScroll]);

    return (
      <div
        className="h-[180px] w-20"
        style={{ height: `${VISIBLE_ITEMS * ITEM_HEIGHT}px` }}
      >
        <ElasticScrollArea
          ref={scrollerRef}
          className="h-full w-full"
          elasticity={true}
          dampingFactor={0.6}
          scrollbarVisibility="scroll"
        >
          <div style={{ height: `${paddingCount * ITEM_HEIGHT}px` }} />
          {/* @ts-ignore */}
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex h-[36px] items-center justify-center text-xl text-on-surface"
              style={{ height: `${ITEM_HEIGHT}px` }}
            >
              {typeof item === "number" ? String(item).padStart(2, "0") : item}
            </div>
          ))}

          <div style={{ height: `${paddingCount * ITEM_HEIGHT}px` }} />
        </ElasticScrollArea>
      </div>
    );
  },
);
TimeRoller.displayName = "TimeRoller";

interface TimePickerPanelProps {
  value: Date;
  onValueChange: (newDate: Date) => void;
}

const TimePickerPanel: React.FC<TimePickerPanelProps> = ({
  value,
  onValueChange,
}) => {
  const { time, displayHour, minutes, period, setHour, setMinute, setPeriod } =
    useTimePicker(value);

  useEffect(() => {
    onValueChange(time);
  }, [time, onValueChange]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="relative flex items-center justify-center p-4">
      <div
        // FIX: Changed from bg-secondary-container/50 to bg-tertiary-container (solid)
        // for distinct visibility against the dialog background.
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-[36px] -translate-y-1/2 rounded-lg bg-primary/50"
        style={{ height: `${ITEM_HEIGHT}px` }}
      />
      <div className="z-10 flex items-center">
        <TimeRoller
          items={hours}
          value={displayHour}
          onValueChange={(newHour) => setHour(newHour as number)}
        />
        <div className="pb-1 text-xl font-bold text-on-surface">:</div>
        <TimeRoller
          items={minutesArray}
          value={minutes}
          onValueChange={(newMinute) => setMinute(newMinute as number)}
        />
        <TimeRoller
          items={["AM", "PM"]}
          value={period}
          onValueChange={(newPeriod) => setPeriod(newPeriod as "AM" | "PM")}
        />
      </div>
    </div>
  );
};

export interface TimePickerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "onChange" | "size"
> {
  shape?: "full" | "minimal" | "sharp";
  size?: "sm" | "md" | "lg";
  label?: string;
  error?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  variant?: "docked" | "modal";
}

export const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      label,
      error,
      placeholder = "Select time",
      value: controlledValue,
      onChange,
      variant: variantProp,
      shape = "minimal",
      size = "md",
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const variant = variantProp || (isMobile ? "modal" : "docked");

    const [uncontrolledValue, setUncontrolledValue] = useState(new Date());
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;
    const setValue = onChange || setUncontrolledValue;

    const [isOpen, setIsOpen] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const formattedValue = value ? format(value, "hh:mm a") : "";

    if (variant === "modal") {
      const handleOpenChange = (open: boolean) => {
        if (open) {
          setTempValue(value || new Date());
        }
        setIsOpen(open);
      };

      const handleConfirm = () => {
        setValue(tempValue);
        setIsOpen(false);
      };

      return (
        <div className="flex w-full flex-col gap-2">
          {label && (
            <label className="block text-sm font-medium text-primary">
              {label}
            </label>
          )}
          <Dialog
            open={isOpen}
            onOpenChange={handleOpenChange}
            variant={variant === "modal" ? "basic" : "fullscreen"}
          >
            <DialogTrigger asChild>
              <button
                ref={ref}
                type="button"
                disabled={disabled}
                className={clsx(
                  inputWrapperVariants({
                    shape,
                    size,
                    disabled,
                    isErrored: !!error,
                  }),
                  "text-on-surface bg-surface-container-low",
                  className,
                )}
                {...props}
              >
                <Clock className="mr-2 h-4 w-4 opacity-50" />
                <span className="flex-1 text-left">
                  {formattedValue || placeholder}
                </span>
              </button>
            </DialogTrigger>
            <DialogContent
              shape={shape}
              variant="ghost"
              className="max-w-[320px]! bg-surface-container-high"
            >
              <DialogHeader>
                <DialogTitle>{label || placeholder}</DialogTitle>
              </DialogHeader>
              <TimePickerPanel value={tempValue} onValueChange={setTempValue} />
              <DialogFooter className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
        </div>
      );
    }

    return (
      <div className="flex w-full flex-col gap-2">
        {label && (
          <label className="block text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              className={clsx(
                inputWrapperVariants({
                  shape,
                  size,
                  disabled,
                  isErrored: !!error,
                  isFocused: isOpen,
                }),
                "text-on-surface bg-surface-container-low",
                className,
              )}
              {...props}
            >
              <Clock className="mr-2 h-4 w-4 opacity-50" />
              <span className="flex-1 text-left">
                {formattedValue || placeholder}
              </span>
            </button>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              sideOffset={8}
              align="start"
              className={clsx(
                "z-50 w-auto rounded-xl border border-outline-variant bg-surface-container-high shadow-md",
                "data-[state=open]:animate-menu-enter",
                "data-[state=closed]:animate-menu-exit",
              )}
            >
              <TimePickerPanel
                value={value || new Date()}
                onValueChange={setValue}
              />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
      </div>
    );
  },
);
TimePicker.displayName = "TimePicker";
