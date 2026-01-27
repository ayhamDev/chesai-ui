"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { format } from "date-fns";
import { animate } from "framer-motion";
import { Clock } from "lucide-react";
import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTimePicker } from "../../hooks/use-time-picker";
import { Button } from "../button";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { inputWrapperVariants } from "../input";
import { Typography } from "../typography";

// --- TYPES ---

interface TimePickerProps extends Omit<
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

// --- SUB-COMPONENTS (Extracted to prevent re-renders/focus loss) ---

// 1. Single Number Input Block (Hour/Minute)
interface NumberInputBlockProps {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  label: string;
  max?: number;
  inputRef?: React.RefObject<HTMLInputElement>;
  onFocus?: () => void;
}

const NumberInputBlock = memo(
  ({
    value,
    onChange,
    onBlur,
    label,
    inputRef,
    onFocus,
  }: NumberInputBlockProps) => {
    return (
      <div className="flex flex-col gap-2">
        <div
          className={clsx(
            "relative flex h-[80px] w-[96px] items-center justify-center rounded-xl transition-colors overflow-hidden",
            "bg-surface-container-highest/50 border-2 border-transparent",
            "focus-within:bg-secondary-container/30 focus-within:border-primary",
            "hover:bg-surface-container-highest",
          )}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={value}
            onFocus={(e) => {
              e.target.select();
              onFocus?.();
            }}
            onChange={(e) => {
              // Only allow numbers
              const val = e.target.value.replace(/\D/g, "").slice(0, 2);
              onChange(val);
            }}
            onBlur={onBlur}
            className="h-full w-full bg-transparent text-center text-[57px] leading-[64px] font-normal text-on-surface outline-none selection:bg-primary/20 p-0"
          />
        </div>
        <span className="text-xs text-on-surface-variant ml-1 font-medium">
          {label}
        </span>
      </div>
    );
  },
);
NumberInputBlock.displayName = "NumberInputBlock";

// 2. Material 3 Logic Wrapper
interface MaterialTimeInputProps {
  value: Date;
  onValueChange: (date: Date) => void;
}

const MaterialTimeInput = memo(
  ({ value, onValueChange }: MaterialTimeInputProps) => {
    const { displayHour, minutes, period, setHour, setMinute, setPeriod } =
      useTimePicker(value);

    // Local state for typing
    const [localHour, setLocalHour] = useState(
      String(displayHour).padStart(2, "0"),
    );
    const [localMinute, setLocalMinute] = useState(
      String(minutes).padStart(2, "0"),
    );

    // Sync external changes (e.g. from AM/PM toggle or init) to local state
    useEffect(() => {
      setLocalHour(String(displayHour).padStart(2, "0"));
      setLocalMinute(String(minutes).padStart(2, "0"));
    }, [displayHour, minutes]);

    // --- Handlers ---

    const validateHour = () => {
      let num = parseInt(localHour, 10);
      if (isNaN(num) || num < 1) num = 1;
      if (num > 12) num = 12;

      // 1. Update local display state
      setLocalHour(String(num).padStart(2, "0"));

      // 2. Calculate new 24h hour based on current AM/PM period
      let newHour = num;
      if (period === "PM" && num < 12) newHour += 12;
      if (period === "AM" && num === 12) newHour = 0;

      // 3. Update the actual Date object and notify parent
      const newDate = new Date(value);
      newDate.setHours(newHour);
      onValueChange(newDate);
    };

    const validateMinute = () => {
      let num = parseInt(localMinute, 10);
      if (isNaN(num) || num < 0) num = 0;
      if (num > 59) num = 59;

      // 1. Update local display state
      setLocalMinute(String(num).padStart(2, "0"));

      // 2. Update the actual Date object and notify parent
      const newDate = new Date(value);
      newDate.setMinutes(num);
      onValueChange(newDate);
    };

    const handlePeriodChange = (newPeriod: "AM" | "PM") => {
      if (newPeriod === period) return;
      setPeriod(newPeriod);

      // Manually trigger onValueChange because setPeriod might be async/internal
      let currentHours = value.getHours();
      if (newPeriod === "AM" && currentHours >= 12) currentHours -= 12;
      if (newPeriod === "PM" && currentHours < 12) currentHours += 12;

      const newDate = new Date(value);
      newDate.setHours(currentHours);
      onValueChange(newDate);
    };

    return (
      <div className="flex items-start gap-3 select-none">
        {/* Hour Input */}
        <NumberInputBlock
          value={localHour}
          onChange={setLocalHour}
          onBlur={validateHour}
          label="Hour"
        />

        {/* Separator */}
        <div className="flex h-[80px] items-center pb-2">
          <span className="text-[57px] leading-[64px] text-on-surface">:</span>
        </div>

        {/* Minute Input */}
        <NumberInputBlock
          value={localMinute}
          onChange={setLocalMinute}
          onBlur={validateMinute}
          label="Minute"
        />

        {/* AM/PM Column */}
        <div className="ml-3 flex flex-col gap-[1px] h-[80px] rounded-lg border border-outline-variant bg-outline-variant overflow-hidden">
          <button
            type="button"
            onClick={() => handlePeriodChange("AM")}
            className={clsx(
              "flex-1 px-4 text-sm font-medium transition-colors hover:bg-surface-container-highest",
              period === "AM"
                ? "bg-secondary-container text-on-secondary-container" // Active State
                : "bg-surface-container-high text-on-surface-variant", // Inactive State
            )}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => handlePeriodChange("PM")}
            className={clsx(
              "flex-1 px-4 text-sm font-medium transition-colors hover:bg-surface-container-highest",
              period === "PM"
                ? "bg-secondary-container text-on-secondary-container" // Active State
                : "bg-surface-container-high text-on-surface-variant", // Inactive State
            )}
          >
            PM
          </button>
        </div>
      </div>
    );
  },
);
MaterialTimeInput.displayName = "MaterialTimeInput";

// 3. Roller Component (Desktop)
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
      if (scrollerRef.current) {
        scrollerRef.current.scrollTop = getTargetIndex(value) * ITEM_HEIGHT;
      }
    }, [value, getTargetIndex]);

    const handleScroll = useCallback(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const currentScrollTop = scroller.scrollTop;
        const snappedIndex = Math.round(currentScrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(
          0,
          Math.min(snappedIndex, items.length - 1),
        );

        animate(currentScrollTop, clampedIndex * ITEM_HEIGHT, {
          type: "spring",
          stiffness: 400,
          damping: 40,
          mass: 0.8,
          onUpdate: (latest) => {
            if (scroller) scroller.scrollTop = latest;
          },
          onComplete: () => {
            const newValue = items[clampedIndex];
            if (String(newValue) !== String(value)) onValueChange(newValue);
          },
        });
      }, 150);
    }, [items, value, onValueChange]);

    useEffect(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      scroller.addEventListener("scroll", handleScroll);
      return () => scroller.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return (
      <div className="h-[180px] w-20 relative">
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
              className="flex items-center justify-center text-xl text-on-surface"
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

// 4. Roller Panel Wrapper
const TimePickerRollerPanel = ({
  value,
  onValueChange,
}: {
  value: Date;
  onValueChange: (d: Date) => void;
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
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2 rounded-lg bg-primary/10"
        style={{ height: `${ITEM_HEIGHT}px` }}
      />
      <div className="z-10 flex items-center gap-1">
        <TimeRoller
          items={hours}
          value={displayHour}
          onValueChange={(v) => setHour(v as number)}
        />
        <div className="pb-1 text-xl font-bold text-on-surface">:</div>
        <TimeRoller
          items={minutesArray}
          value={minutes}
          onValueChange={(v) => setMinute(v as number)}
        />
        <TimeRoller
          items={["AM", "PM"]}
          value={period}
          onValueChange={(v) => setPeriod(v as "AM" | "PM")}
        />
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

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
    const [tempValue, setTempValue] = useState(value || new Date());

    const formattedValue = value ? format(value, "hh:mm a") : "";

    // Sync temp value when dialog opens
    useEffect(() => {
      if (isOpen) setTempValue(value || new Date());
    }, [isOpen, value]);

    // Common Trigger Button
    const TriggerButton = (
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
          "text-on-surface bg-surface-container-low w-full justify-start font-normal",
          className,
        )}
        {...props}
      >
        <Clock className="mr-2 h-4 w-4 opacity-50" />
        <span className="flex-1 text-left">
          {formattedValue || placeholder}
        </span>
      </button>
    );

    // --- 1. MODAL / FULLSCREEN (Material 3 Spec) ---
    if (variant === "modal") {
      const handleConfirm = () => {
        setValue(tempValue);
        setIsOpen(false);
      };

      return (
        <div className="flex w-full flex-col gap-1.5">
          {label && (
            <label className="ml-1 text-sm font-medium text-on-surface-variant">
              {label}
            </label>
          )}

          <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
            variant={variant === "fullscreen" ? "fullscreen" : "basic"}
            animation="material3"
          >
            <DialogTrigger asChild>{TriggerButton}</DialogTrigger>

            <DialogContent
              shape={shape}
              // MD3 Spec specific layout override
              className="w-auto min-w-[312px] max-w-[400px]! p-0 bg-surface-container-high rounded-[28px] overflow-visible"
              layout={false} // Disable auto-layout for this specific fixed structure
            >
              {/* Header */}
              <div className="flex flex-col gap-1 px-6 pt-2 pb-5">
                <Typography
                  variant="label-medium"
                  className="text-on-surface-variant font-medium text-[12px] uppercase tracking-wider"
                >
                  Enter time
                </Typography>
              </div>

              {/* Body: Inputs */}
              <div className="flex justify-center px-6 pb-6">
                <MaterialTimeInput
                  value={tempValue}
                  onValueChange={setTempValue}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-4">
                <div className="flex gap-1">
                  <Button
                    shape={shape}
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="min-w-[70px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    shape={shape}
                    variant="ghost"
                    onClick={handleConfirm}
                    className="min-w-[70px]"
                  >
                    OK
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
        </div>
      );
    }

    // --- 2. DOCKED (Desktop Popover) ---
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label className="ml-1 text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
          <PopoverPrimitive.Trigger asChild>
            {TriggerButton}
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
              <TimePickerRollerPanel
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
