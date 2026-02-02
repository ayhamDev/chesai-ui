"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import * as React from "react";
import { Badge } from "../badge";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { Input } from "../input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { Typography } from "../typography";
import { Button } from "../button";
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
  mobileLayout?: "default" | "bottom-sheet" | "dialog";
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      defaultValue = [],
      value,
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
      mobileLayout = "bottom-sheet",
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [selectedValues, setSelectedValues] = React.useState<string[]>(
      value !== undefined ? value : defaultValue,
    );
    const [searchQuery, setSearchQuery] = React.useState("");

    const isMobile = useMediaQuery("(max-width: 768px)");
    const shouldUseMobileLayout = isMobile && mobileLayout !== "default";
    const open = internalOpen;

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues((prev) => {
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
      setSelectedValues(newValues);
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

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      return options.filter((op) =>
        op.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }, [options, searchQuery]);

    const visibleChips = maxCount
      ? selectedOptions.slice(0, maxCount)
      : selectedOptions;
    const hiddenCount = selectedOptions.length - visibleChips.length;

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
    const showPlaceholder =
      selectedValues.length === 0 &&
      (!label || labelPlacement !== "inside" || open);

    // --- SHARED LIST RENDERER (DESKTOP & MOBILE) ---
    const renderListContent = () => (
      <div className="flex flex-col h-full w-full">
        {/* Search Header */}
        <div className="p-2 border-b border-outline-variant/10 shrink-0">
          <Input
            variant="flat"
            size="sm"
            placeholder={searchPlaceholder}
            startContent={
              <Search className="w-4 h-4 text-on-surface-variant" />
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent"
            onClick={(e) => e.stopPropagation()}
            // Important: Prevents drag from stealing focus on touch
            onPointerDown={(e) => e.stopPropagation()}
          />
        </div>

        {/* CRITICAL FIX: flex-1 min-h-0 wrapper for ElasticScrollArea */}
        <div className="flex-1 min-h-0 relative">
          <ElasticScrollArea className="h-full w-full">
            <div className="p-1 flex flex-col gap-0.5 pb-safe">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={clsx(
                        "relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm outline-none transition-colors shrink-0",
                        isSelected
                          ? "bg-secondary-container/60 text-on-surface"
                          : "hover:bg-surface-container-highest text-on-surface",
                      )}
                    >
                      <div
                        className={clsx(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-on-primary"
                            : "opacity-50",
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {option.icon && (
                        // @ts-ignore
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-sm text-on-surface-variant">
                  {emptyMessage}
                </div>
              )}
            </div>
          </ElasticScrollArea>
        </div>

        {/* Footer Actions */}
        {selectedValues.length > 0 && (
          <div className="p-2 border-t border-outline-variant/10 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={(e) => handleClear(e)}
            >
              Clear selection
            </Button>
          </div>
        )}
      </div>
    );

    const triggerElement = (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={clsx(
          multiSelectSlots.trigger,
          dynamicStyles.trigger,
          classNames?.trigger,
        )}
        onClick={() => {
          setInternalOpen(!internalOpen);
          if (!internalOpen) setSearchQuery("");
        }}
        {...props}
      >
        {!isOutside && labelContent}
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
                {option.icon && (
                  // @ts-ignore
                  <option.icon className="mr-1 h-3 w-3" />
                )}
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
        {showPlaceholder && (
          <span className={clsx(multiSelectSlots.placeholder)}>
            {placeholder}
          </span>
        )}
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
      </button>
    );

    const helperWrapper = (description || (isInvalid && errorMessage)) && (
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
    );

    const BaseWrapper = ({ children }: { children: React.ReactNode }) => (
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
        {children}
        {helperWrapper}
      </div>
    );

    // --- MOBILE RENDER ---
    if (shouldUseMobileLayout) {
      const MobileWrapper = mobileLayout === "bottom-sheet" ? Sheet : Dialog;
      const MobileTrigger =
        mobileLayout === "bottom-sheet" ? SheetTrigger : DialogTrigger;
      const MobileContent =
        mobileLayout === "bottom-sheet" ? SheetContent : DialogContent;

      return (
        <MobileWrapper open={internalOpen} onOpenChange={setInternalOpen}>
          <BaseWrapper>
            <MobileTrigger asChild>{triggerElement}</MobileTrigger>
          </BaseWrapper>
          <MobileContent
            padding="none"
            className={clsx(
              "p-0 flex flex-col overflow-hidden",
              mobileLayout === "dialog" && "max-w-[90vw] h-[60vh]",
              mobileLayout === "bottom-sheet" && "max-h-[85vh] h-[500px]", // Fixed height on mobile sheet to ensure scrolling
            )}
            // @ts-ignore
            shape={shape}
          >
            {mobileLayout === "bottom-sheet" && (
              <SheetHeader className="px-4 py-3 border-b border-outline-variant/20 shrink-0">
                <SheetTitle className="text-left">
                  {label || "Select Items"}
                </SheetTitle>
              </SheetHeader>
            )}
            {renderListContent()}
          </MobileContent>
        </MobileWrapper>
      );
    }

    // --- DESKTOP RENDER ---
    return (
      <PopoverPrimitive.Root open={internalOpen} onOpenChange={setInternalOpen}>
        <BaseWrapper>
          <PopoverPrimitive.Trigger asChild>
            {triggerElement}
          </PopoverPrimitive.Trigger>
        </BaseWrapper>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className={clsx(
              "z-50 w-[var(--radix-popover-trigger-width)] min-w-[12rem] overflow-hidden p-0",
              // CRITICAL FIX: Explicit height for popover to allow inner scrolling
              "h-[300px] flex flex-col",
              "rounded-xl border border-outline-variant bg-surface-container text-on-surface shadow-md",
              "data-[state=open]:animate-menu-enter data-[state=closed]:animate-menu-exit",
            )}
            align="start"
            sideOffset={4}
            onInteractOutside={(e) => {
              if (e.target !== ref.current) {
                setInternalOpen(false);
              }
            }}
          >
            {renderListContent()}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
