"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { Check, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";
import {
  getSelectSlotClassNames,
  selectSlots,
  selectStyles,
} from "../select/select-styles";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  label?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  isInvalid?: boolean;
  shape?: "full" | "minimal" | "sharp";
  variant?: "flat" | "bordered" | "faded" | "underlined";
  size?: "sm" | "md" | "lg";
  labelPlacement?: "inside" | "outside" | "outside-left";
  startContent?: React.ReactNode;
  className?: string;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Select an option...",
      searchPlaceholder = "Search...",
      emptyMessage = "No results found.",
      label,
      description,
      errorMessage,
      disabled = false,
      isInvalid = false,
      shape = "minimal",
      variant = "flat",
      size = "md",
      labelPlacement = "inside",
      startContent,
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);
    const isFilled = !!selectedOption || !!placeholder || open;

    // Use Select styles to correctly format the button trigger
    const dynamicStyles = getSelectSlotClassNames({
      variant,
      size,
      shape,
      labelPlacement,
      isInvalid,
      isFilled,
      hasStartContent: !!startContent,
      hasLabel: !!label,
    });

    const isOutside =
      labelPlacement === "outside" || labelPlacement === "outside-left";

    const labelContent = label ? (
      <label className={clsx(selectSlots.label, dynamicStyles.label)}>
        {label}
      </label>
    ) : null;

    const helperWrapper = (description || (isInvalid && errorMessage)) && (
      <div className={selectSlots.helperWrapper}>
        {isInvalid && errorMessage ? (
          <div className={selectSlots.errorMessage}>{errorMessage}</div>
        ) : (
          <div className={selectSlots.description}>{description}</div>
        )}
      </div>
    );

    return (
      <div
        className={clsx(
          selectSlots.base,
          selectStyles({ labelPlacement }),
          className,
        )}
        data-filled={isFilled ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
      >
        {isOutside && labelContent}

        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              className={clsx(
                selectSlots.trigger,
                dynamicStyles.trigger,
                "cursor-pointer text-left",
              )}
              role="combobox"
              aria-expanded={open}
            >
              {!isOutside && labelContent}
              <div
                className={clsx(
                  selectSlots.innerWrapper,
                  dynamicStyles.innerWrapper,
                )}
              >
                {startContent && (
                  <span className="text-on-surface-variant/70 shrink-0 flex items-center">
                    {startContent}
                  </span>
                )}
                <span
                  className={clsx(
                    selectSlots.value,
                    dynamicStyles.value,
                    !selectedOption && "text-on-surface-variant/50",
                  )}
                >
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              </div>
              <ChevronDown
                className={clsx(
                  selectSlots.selectorIcon,
                  dynamicStyles.selectorIcon,
                  open && "rotate-180 text-primary",
                )}
              />
            </button>
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={4}
              className={clsx(
                "z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden p-0",
                "rounded-xl border border-outline-variant bg-surface-container text-on-surface shadow-md",
                "data-[state=open]:animate-menu-enter data-[state=closed]:animate-menu-exit",
              )}
            >
              <Command>
                <CommandInput placeholder={searchPlaceholder} />
                <CommandList>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => {
                          onChange?.(
                            option.value === value ? "" : option.value,
                          );
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={clsx(
                            "mr-2 h-4 w-4 text-primary transition-opacity",
                            value === option.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

        {helperWrapper}
      </div>
    );
  },
);
Combobox.displayName = "Combobox";
