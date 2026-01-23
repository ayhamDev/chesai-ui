"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";
import { Badge } from "../badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../command";
import {
  getMultiSelectSlotClassNames,
  multiSelectSlots,
  multiSelectStyles,
} from "./multi-select-styles";

export interface MultiSelectOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  maxCount?: number;
  variant?: "flat" | "bordered" | "underlined" | "faded";
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  labelPlacement?: "inside" | "outside" | "outside-left";
  disabled?: boolean;
  isInvalid?: boolean;
  className?: string;
  classNames?: Partial<Record<keyof typeof multiSelectSlots, string>>;
  label?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      defaultValue = [],
      value, // Removed default value here to allow uncontrolled mode
      onValueChange,
      placeholder = "Select items...",
      searchPlaceholder = "Search...",
      emptyMessage = "No item found.",
      maxCount = 10,
      variant = "flat",
      size = "md",
      shape = "minimal",
      labelPlacement = "inside",
      disabled = false,
      isInvalid = false,
      className,
      classNames,
      label,
      description,
      errorMessage,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    // Initialize state with value if present, otherwise defaultValue
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      value !== undefined ? value : defaultValue,
    );

    // Sync internal state when controlled prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues((prev) => {
          // Deep comparison to prevent infinite loops if array ref changes but content is same
          if (
            prev.length === value.length &&
            prev.every((val, index) => val === value[index])
          ) {
            return prev;
          }
          return value;
        });
      }
    }, [value]);

    const handleSelect = (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];

      // Always update local state for immediate feedback
      setSelectedValues(newValues);

      // Notify parent
      onValueChange?.(newValues);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValues([]);
      onValueChange?.([]);
    };

    const handleRemoveOne = (e: React.MouseEvent, optionValue: string) => {
      e.stopPropagation();
      const newValues = selectedValues.filter((v) => v !== optionValue);
      setSelectedValues(newValues);
      onValueChange?.(newValues);
    };

    const selectedOptions = options.filter((op) =>
      selectedValues.includes(op.value),
    );
    const visibleChips = maxCount
      ? selectedOptions.slice(0, maxCount)
      : selectedOptions;
    const hiddenCount = selectedOptions.length - visibleChips.length;

    // Filled state determines label floating
    const isFilled = selectedValues.length > 0 || open;

    const dynamicStyles = getMultiSelectSlotClassNames({
      variant,
      size,
      shape,
      labelPlacement,
      isInvalid,
      isFilled,
      hasLabel: !!label,
    });

    const labelContent = label ? (
      <span
        className={clsx(
          multiSelectSlots.label,
          dynamicStyles.label,
          classNames?.label,
        )}
      >
        {label}
      </span>
    ) : null;

    const isOutside =
      labelPlacement === "outside" || labelPlacement === "outside-left";

    // Only show placeholder if empty AND (label is outside OR menu is open to float label)
    const showPlaceholder =
      selectedValues.length === 0 &&
      (!label || labelPlacement !== "inside" || open);

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <div
          className={clsx(
            multiSelectSlots.base,
            multiSelectStyles({ labelPlacement }),
            className,
            classNames?.base,
          )}
          data-filled={isFilled}
          data-invalid={isInvalid}
          data-disabled={disabled}
        >
          {isOutside && labelContent}

          <PopoverPrimitive.Trigger
            ref={ref}
            disabled={disabled}
            className={clsx(
              multiSelectSlots.trigger,
              dynamicStyles.trigger,
              classNames?.trigger,
            )}
            data-state={open ? "open" : "closed"}
            {...props}
          >
            {!isOutside && labelContent}

            {/* Chips */}
            {selectedOptions.length > 0 ? (
              <>
                {visibleChips.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    shape={shape === "full" ? "full" : "minimal"}
                    className="pr-1 pl-2 h-6 pointer-events-auto z-10"
                    onClick={(e) => handleRemoveOne(e, option.value)}
                  >
                    {option.icon && <option.icon className="mr-1 h-3 w-3" />}
                    {option.label}
                    <div className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors">
                      <X className="h-3 w-3" />
                    </div>
                  </Badge>
                ))}
                {hiddenCount > 0 && (
                  <Badge
                    variant="secondary"
                    shape="minimal"
                    className="h-6 px-2 pointer-events-auto z-10"
                  >
                    +{hiddenCount} more
                  </Badge>
                )}
              </>
            ) : null}

            {/* Placeholder */}
            {showPlaceholder && (
              <span className={clsx(multiSelectSlots.placeholder)}>
                {placeholder}
              </span>
            )}

            {/* Icons */}
            <div className={multiSelectSlots.selectorIcon}>
              {selectedValues.length > 0 && !disabled && (
                <div
                  role="button"
                  onClick={handleClear}
                  className="p-1 rounded-full hover:bg-on-surface/10 hover:text-on-surface transition-colors pointer-events-auto"
                >
                  <X className="h-4 w-4" />
                </div>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </PopoverPrimitive.Trigger>

          {/* Helper Text / Error Message */}
          {(description || (isInvalid && errorMessage)) && (
            <div
              className={clsx(
                multiSelectSlots.helperWrapper,
                classNames?.helperWrapper,
              )}
            >
              {isInvalid && errorMessage ? (
                <div
                  className={clsx(
                    multiSelectSlots.errorMessage,
                    classNames?.errorMessage,
                  )}
                >
                  {errorMessage}
                </div>
              ) : (
                <div
                  className={clsx(
                    multiSelectSlots.description,
                    classNames?.description,
                  )}
                >
                  {description}
                </div>
              )}
            </div>
          )}
        </div>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className={clsx(
              "z-50 w-[var(--radix-popover-trigger-width)] min-w-[12rem] overflow-hidden p-1",
              "rounded-xl border border-outline-variant bg-surface-container text-on-surface shadow-md",
              "data-[state=open]:animate-menu-enter data-[state=closed]:animate-menu-exit",
            )}
            align="start"
            sideOffset={4}
          >
            <Command className="w-full">
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList className="max-h-[240px] overflow-auto py-2">
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer"
                      >
                        <div
                          className={clsx(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-on-primary"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        {option.icon && (
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {selectedValues.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setSelectedValues([]);
                          onValueChange?.([]);
                        }}
                        className="justify-center text-center cursor-pointer font-medium"
                      >
                        Clear filters
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
