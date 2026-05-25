"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { Check, ChevronDown, Search, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { Input } from "../input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet";
import { Typography } from "../typography";
import {
  getSelectSlotClassNames,
  selectContentVariants,
  selectSlots,
  selectStyles,
} from "../select/select-styles";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  label?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  isInvalid?: boolean;
  isClearable?: boolean;
  shape?: "full" | "minimal" | "sharp";
  variant?:
    | "filled"
    | "filled-inverted"
    | "outlined"
    | "outlined-inverted"
    | "underlined"
    | "underlined-inverted"
    | "ghost"
    | "ghost-inverted";
  size?: "sm" | "md" | "lg";
  labelPlacement?: "inside" | "outside" | "outside-left";
  startContent?: React.ReactNode;
  className?: string;
  classNames?: Partial<Record<keyof typeof selectSlots, string>>;
  mobileLayout?: "default" | "bottom-sheet" | "dialog";
  name?: string;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      defaultValue,
      onValueChange,
      placeholder = "Select an option...",
      searchPlaceholder = "Search...",
      emptyMessage = "No results found.",
      label,
      description,
      errorMessage,
      disabled = false,
      isInvalid = false,
      isClearable = false,
      shape = "minimal",
      variant = "filled",
      size = "md",
      labelPlacement = "inside",
      startContent,
      className,
      classNames,
      mobileLayout = "bottom-sheet",
      name,
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || "");
    const [internalOpen, setInternalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const open = internalOpen;

    const isMobile = useMediaQuery("(max-width: 768px)");
    const shouldUseMobileLayout = isMobile && mobileLayout !== "default";

    const setOpen = (newOpen: boolean) => {
      setInternalOpen(newOpen);
      if (!newOpen) {
        setTimeout(() => setSearchQuery(""), 200);
      }
    };

    const handleValueChange = (val: string) => {
      if (!isControlled) setInternalValue(val);
      onValueChange?.(val);
      setOpen(false);
    };

    const handleClear = (e: React.MouseEvent | React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isControlled) setInternalValue("");
      onValueChange?.("");
    };

    const selectedOption = useMemo(
      () => options.find((opt) => opt.value === currentValue),
      [options, currentValue],
    );

    const filteredOptions = useMemo(() => {
      if (!searchQuery) return options;
      const lowerQuery = searchQuery.toLowerCase();
      return options.filter((op) =>
        op.label.toLowerCase().includes(lowerQuery),
      );
    }, [options, searchQuery]);

    const isFilled = !!currentValue || !!placeholder || open === true;

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
      <label
        className={clsx(
          selectSlots.label,
          dynamicStyles.label,
          classNames?.label,
        )}
      >
        {label}
      </label>
    ) : null;

    const helperWrapper = useMemo(() => {
      const shouldShowError = isInvalid && errorMessage;
      const hasContent = shouldShowError || description;
      if (!hasContent) return null;

      return (
        <div
          className={clsx(selectSlots.helperWrapper, classNames?.helperWrapper)}
        >
          {shouldShowError ? (
            <div
              className={clsx(
                selectSlots.errorMessage,
                classNames?.errorMessage,
              )}
            >
              {errorMessage}
            </div>
          ) : (
            <div
              className={clsx(selectSlots.description, classNames?.description)}
            >
              {description}
            </div>
          )}
        </div>
      );
    }, [isInvalid, errorMessage, description, classNames]);

    const triggerContent = (
      <>
        {!isOutside && labelContent}
        <div
          className={clsx(
            selectSlots.innerWrapper,
            dynamicStyles.innerWrapper,
            classNames?.innerWrapper,
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
              classNames?.value,
              !selectedOption && "text-on-surface-variant/50",
            )}
          >
            {selectedOption ? (
              <div className="flex items-center gap-2 truncate">
                {selectedOption.icon && (
                  <span className="opacity-70">{selectedOption.icon}</span>
                )}
                <span className="truncate">{selectedOption.label}</span>
              </div>
            ) : (
              placeholder
            )}
          </span>
        </div>
        <div
          className={clsx(
            selectSlots.selectorIcon,
            dynamicStyles.selectorIcon,
            classNames?.selectorIcon,
            "flex items-center gap-1 w-auto bg-transparent", // Adjust for clear button
          )}
        >
          {isClearable && currentValue && !disabled && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-0.5 rounded-full hover:bg-on-surface-variant/20 hover:text-on-surface transition-colors pointer-events-auto"
            >
              <X className="h-3.5 w-3.5 opacity-70" />
            </div>
          )}
          <ChevronDown
            className={clsx(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </div>
      </>
    );

    const triggerClassName = clsx(
      selectSlots.trigger,
      dynamicStyles.trigger,
      classNames?.trigger,
      isClearable && currentValue ? "pr-12" : "pr-8", // Add padding to accommodate both icons
    );

    const BaseWrapper = ({ children }: { children: React.ReactNode }) => (
      <div
        className={clsx(
          selectSlots.base,
          selectStyles({ labelPlacement }),
          className,
          classNames?.base,
        )}
        data-filled={isFilled ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
      >
        {isOutside && labelContent}
        {children}
        {helperWrapper}
        {/* Hidden input for Native Form Submission */}
        {name && <input type="hidden" name={name} value={currentValue || ""} />}
      </div>
    );

    const renderMobileListContent = () => (
      <div className="flex flex-col h-full w-full">
        <div className="p-2 border-b border-outline-variant/10 shrink-0">
          <Input
            variant="filled"
            size="sm"
            placeholder={searchPlaceholder}
            startContent={
              <Search className="w-4 h-4 text-on-surface-variant" />
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            isClearable
            onClear={() => setSearchQuery("")}
            className="bg-transparent"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="flex-1 min-h-0 relative">
          <ElasticScrollArea className="h-full w-full">
            <div className="p-1 flex flex-col gap-0.5 pb-safe">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = currentValue === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleValueChange(option.value)}
                      disabled={option.disabled}
                      className={clsx(
                        "flex items-center justify-between w-full px-4 py-3 text-left text-sm rounded-lg transition-colors shrink-0",
                        isSelected
                          ? "bg-secondary-container text-on-secondary-container font-semibold"
                          : "text-on-surface hover:bg-surface-container-highest",
                        option.disabled && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {option.icon && (
                          <span className="opacity-70">{option.icon}</span>
                        )}
                        <span>{option.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-on-surface-variant">
                  <Typography variant="body-small">{emptyMessage}</Typography>
                </div>
              )}
            </div>
          </ElasticScrollArea>
        </div>
      </div>
    );

    if (shouldUseMobileLayout) {
      const MobileWrapper = mobileLayout === "bottom-sheet" ? Sheet : Dialog;
      const MobileTrigger =
        mobileLayout === "bottom-sheet" ? SheetTrigger : DialogTrigger;
      const MobileContent =
        mobileLayout === "bottom-sheet" ? SheetContent : DialogContent;

      return (
        <MobileWrapper open={open} onOpenChange={setOpen}>
          <BaseWrapper>
            <MobileTrigger asChild>
              <button
                ref={ref}
                type="button"
                disabled={disabled}
                className={triggerClassName}
              >
                {triggerContent}
              </button>
            </MobileTrigger>
          </BaseWrapper>

          <MobileContent
            padding="none"
            className={clsx(
              "z-[1000] p-0 flex flex-col overflow-hidden",
              mobileLayout === "dialog" && "max-w-[90vw] h-[60vh]",
              mobileLayout === "bottom-sheet" && "max-h-[85vh] h-[500px]",
            )}
            // @ts-ignore
            shape={shape}
          >
            {mobileLayout === "bottom-sheet" && (
              <SheetHeader className="px-4 py-3 border-b border-outline-variant/20 shrink-0">
                <SheetTitle className="text-left">
                  {label || placeholder || "Select Option"}
                </SheetTitle>
              </SheetHeader>
            )}
            {renderMobileListContent()}
          </MobileContent>
        </MobileWrapper>
      );
    }

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <BaseWrapper>
          <PopoverPrimitive.Trigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              className={triggerClassName}
            >
              {triggerContent}
            </button>
          </PopoverPrimitive.Trigger>
        </BaseWrapper>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className={clsx(
              selectContentVariants({ position: "popper", shape }),
              "z-[1000] min-w-[var(--radix-popover-trigger-width)] w-[var(--radix-popover-trigger-width)] p-0 flex flex-col",
            )}
          >
            <Command className="w-full bg-transparent">
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList className="max-h-64">
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label} // Cmdk matches against this
                      disabled={option.disabled}
                      onSelect={() => handleValueChange(option.value)}
                    >
                      <Check
                        className={clsx(
                          "mr-2 h-4 w-4 text-primary transition-opacity",
                          currentValue === option.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {option.icon && (
                        <span className="mr-2 opacity-70">{option.icon}</span>
                      )}
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

Combobox.displayName = "Combobox";
