"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { Check, ChevronDown, Search } from "lucide-react";
import React, { createContext, useContext, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet";
import { Input } from "../input";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { Typography } from "../typography";
import {
  getSelectSlotClassNames,
  selectContentVariants,
  selectSlots,
  selectStyles,
} from "./select-styles";
import {
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
} from "./select-subcomponents"; // Extracted to keep file clean or reused below

// --- Context ---
interface SelectContextProps {
  size: "sm" | "md" | "lg";
  position: "item-aligned" | "popper";
  shape: "full" | "minimal" | "sharp";
}
const SelectContext = createContext<SelectContextProps>({
  size: "md",
  position: "popper",
  shape: "minimal",
});

export const useSelectContext = () => useContext(SelectContext);

// --- Types ---
export interface SelectProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Root
> {
  variant?: "flat" | "bordered" | "underlined" | "faded";
  color?: "primary" | "secondary" | "error";
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  label?: React.ReactNode;
  labelPlacement?: "inside" | "outside" | "outside-left";
  placeholder?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  startContent?: React.ReactNode;
  isInvalid?: boolean;
  className?: string;
  classNames?: Partial<Record<keyof typeof selectSlots, string>>;
  items?: { value: string; label: string; disabled?: boolean }[];
  children?: React.ReactNode;
  position?: "item-aligned" | "popper";
  mobileLayout?: "default" | "bottom-sheet" | "dialog";
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      children,
      variant = "flat",
      color = "primary",
      size = "md",
      shape = "minimal",
      label,
      labelPlacement = "inside",
      placeholder,
      description,
      errorMessage,
      startContent,
      isInvalid = false,
      className,
      classNames,
      items,
      value,
      defaultValue,
      onValueChange,
      open: controlledOpen,
      onOpenChange,
      disabled,
      position = "popper",
      mobileLayout = "bottom-sheet",
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || "");
    const [internalOpen, setInternalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const isControlled = value !== undefined;
    const isOpenControlled = controlledOpen !== undefined;

    const currentValue = isControlled ? value : internalValue;
    const open = isOpenControlled ? controlledOpen : internalOpen;

    const setOpen = (newOpen: boolean) => {
      if (!isOpenControlled) setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
      if (!newOpen) setTimeout(() => setSearchQuery(""), 300); // Clear search after anim
    };

    const isMobile = useMediaQuery("(max-width: 768px)");
    const shouldUseMobileLayout =
      isMobile && mobileLayout !== "default" && !!items;

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

    const handleValueChange = (val: string) => {
      if (!isControlled) setInternalValue(val);
      onValueChange?.(val);
      if (shouldUseMobileLayout) setOpen(false);
    };

    const selectedLabel = useMemo(() => {
      return (
        items?.find((i) => i.value === currentValue)?.label || currentValue
      );
    }, [items, currentValue]);

    const filteredItems = useMemo(() => {
      if (!items) return [];
      if (!searchQuery) return items;
      return items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }, [items, searchQuery]);

    const labelContent = label ? (
      <span
        className={clsx(
          selectSlots.label,
          dynamicStyles.label,
          classNames?.label,
        )}
      >
        {label}
      </span>
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

    const isOutside =
      labelPlacement === "outside" || labelPlacement === "outside-left";

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
            <span className="text-on-surface-variant/70 flex-shrink-0 flex items-center">
              {startContent}
            </span>
          )}
          {shouldUseMobileLayout ? (
            <span
              className={clsx(
                selectSlots.value,
                dynamicStyles.value,
                classNames?.value,
                !currentValue && "text-on-surface-variant/50",
              )}
            >
              {selectedLabel || placeholder}
            </span>
          ) : (
            <SelectPrimitive.Value
              placeholder={placeholder}
              className={clsx(
                selectSlots.value,
                dynamicStyles.value,
                classNames?.value,
              )}
            />
          )}
        </div>
        {shouldUseMobileLayout ? (
          <ChevronDown
            className={clsx(
              selectSlots.selectorIcon,
              dynamicStyles.selectorIcon,
              classNames?.selectorIcon,
              open && "rotate-180",
            )}
          />
        ) : (
          <SelectPrimitive.Icon asChild>
            <ChevronDown
              className={clsx(
                selectSlots.selectorIcon,
                dynamicStyles.selectorIcon,
                classNames?.selectorIcon,
              )}
            />
          </SelectPrimitive.Icon>
        )}
      </>
    );

    const triggerClassName = clsx(
      selectSlots.trigger,
      dynamicStyles.trigger,
      classNames?.trigger,
    );

    // --- MOBILE LAYOUT RENDERING ---
    if (shouldUseMobileLayout) {
      const MobileWrapper = mobileLayout === "bottom-sheet" ? Sheet : Dialog;
      const MobileTrigger =
        mobileLayout === "bottom-sheet" ? SheetTrigger : DialogTrigger;
      const MobileContent =
        mobileLayout === "bottom-sheet" ? SheetContent : DialogContent;

      return (
        <MobileWrapper open={open} onOpenChange={setOpen}>
          <div
            className={clsx(
              selectSlots.base,
              selectStyles({ labelPlacement }),
              className,
              classNames?.base,
            )}
            data-filled={isFilled}
            data-invalid={isInvalid}
            data-disabled={disabled}
            data-has-label={!!label}
          >
            {isOutside && labelContent}
            <MobileTrigger asChild>
              <button
                ref={ref}
                disabled={disabled}
                className={triggerClassName}
                type="button"
              >
                {triggerContent}
              </button>
            </MobileTrigger>
            {helperWrapper}
          </div>

          <MobileContent
            padding="none"
            className={clsx(
              "p-0 flex flex-col overflow-hidden", // CRITICAL: flex flex-col to enable inner flex-1
              mobileLayout === "dialog" && "max-w-[90vw] h-[60vh]",
              mobileLayout === "bottom-sheet" && "max-h-[85vh] h-[500px]", // Fixed height for sheet to force scroll
            )}
            // @ts-ignore
            shape={shape}
          >
            {mobileLayout === "bottom-sheet" && (
              <SheetHeader className="px-4 py-3 border-b border-outline-variant/20 shrink-0">
                <SheetTitle className="text-left">
                  {label || placeholder || "Select"}
                </SheetTitle>
              </SheetHeader>
            )}

            <div className="p-2 border-b border-outline-variant/10 shrink-0">
              <Input
                variant="flat"
                size="sm"
                placeholder="Search..."
                startContent={
                  <Search className="w-4 h-4 text-on-surface-variant" />
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                isClearable
                onClear={() => setSearchQuery("")}
                className="bg-transparent"
                // Stop propagation to prevent sheet drag on input
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>

            {/* CRITICAL FIX: flex-1 min-h-0 container for ElasticScrollArea */}
            <div className="flex-1 min-h-0 relative">
              <ElasticScrollArea className="h-full w-full">
                <div className="p-2 flex flex-col gap-1 pb-safe">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isSelected = currentValue === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleValueChange(item.value)}
                          disabled={item.disabled}
                          className={clsx(
                            "flex items-center justify-between w-full px-4 py-3 text-left text-sm rounded-lg transition-colors shrink-0",
                            isSelected
                              ? "bg-secondary-container text-on-secondary-container font-semibold"
                              : "text-on-surface hover:bg-surface-container-highest",
                            item.disabled && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <span>{item.label}</span>
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-on-surface-variant">
                      <Typography variant="small">No items found.</Typography>
                    </div>
                  )}
                </div>
              </ElasticScrollArea>
            </div>
          </MobileContent>
        </MobileWrapper>
      );
    }

    // --- DESKTOP (STANDARD RADIX) RENDERING ---
    return (
      <SelectContext.Provider value={{ size, position, shape }}>
        <SelectPrimitive.Root
          value={currentValue}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          open={open}
          onOpenChange={setOpen}
          disabled={disabled}
          {...props}
        >
          <div
            className={clsx(
              selectSlots.base,
              selectStyles({ labelPlacement }),
              className,
              classNames?.base,
            )}
            data-filled={isFilled}
            data-invalid={isInvalid}
            data-disabled={disabled}
            data-has-label={!!label}
          >
            {isOutside && labelContent}

            <SelectPrimitive.Trigger ref={ref} className={triggerClassName}>
              {triggerContent}
            </SelectPrimitive.Trigger>

            {helperWrapper}

            <SelectPrimitive.Portal>
              <SelectPrimitive.Content
                position={position}
                className={clsx(
                  selectContentVariants({
                    position,
                    shape,
                  }),
                )}
                sideOffset={position === "popper" ? 4 : 0}
                align={position === "popper" ? "center" : undefined}
              >
                <SelectPrimitive.Viewport
                  className={clsx(
                    "w-full",
                    position === "popper" ? "p-1" : "p-0",
                  )}
                >
                  {items
                    ? items.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                          disabled={item.disabled}
                        >
                          {item.label}
                        </SelectItem>
                      ))
                    : children}
                </SelectPrimitive.Viewport>
              </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
          </div>
        </SelectPrimitive.Root>
      </SelectContext.Provider>
    );
  },
);
Select.displayName = "Select";

// --- RE-EXPORT SUBCOMPONENTS FOR MANUAL COMPOSITION ---
export * from "./select-subcomponents";
