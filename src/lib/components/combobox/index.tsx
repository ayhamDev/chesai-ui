"use client";

import { useDirection } from "../../context/direction";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { Check, ChevronDown, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  type SheetProps,
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
  /** Preserve a remotely loaded selection when it is absent from the current results. */
  selectedOption?: ComboboxOption;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  /** Disable local filtering when options already contain server search results. */
  shouldFilter?: boolean;
  isLoading?: boolean;
  loadingMessage?: React.ReactNode;
  hasMore?: boolean;
  /** Append the next page to options. Set isLoading while fetching. */
  onLoadMore?: () => void;
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
  /** Show an outer popup border. Defaults to false. */
  bordered?: boolean;
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
  /** Use mobileLayout at every screen size. "default" still uses the dropdown. */
  forceMobileLayout?: boolean;
  /** Basic appearance options for mobileLayout="bottom-sheet", including on desktop. */
  sheetProps?: Pick<SheetProps, "mode" | "shape" | "variant" | "glass">;
  name?: string;
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      selectedOption: suppliedSelectedOption,
      searchValue,
      onSearchChange,
      shouldFilter = true,
      isLoading = false,
      loadingMessage = "Loading...",
      hasMore = false,
      onLoadMore,
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
      bordered = false,
      variant = "filled",
      size = "md",
      labelPlacement = "inside",
      startContent,
      className,
      classNames,
      mobileLayout = "bottom-sheet",
      forceMobileLayout = false,
      sheetProps,
      name,
    },
    ref,
  ) => {
    const direction = useDirection();
    const [internalValue, setInternalValue] = useState(defaultValue || "");
    const [internalOpen, setInternalOpen] = useState(false);
    const [internalSearch, setInternalSearch] = useState("");
    const searchQuery = searchValue ?? internalSearch;
    const cachedSelection = useRef<ComboboxOption | undefined>(undefined);
    const loadRequested = useRef(false);
    const [loadSentinel, setLoadSentinel] = useState<HTMLDivElement | null>(null);

    const setSearchQuery = (query: string) => {
      if (searchValue === undefined) setInternalSearch(query);
      onSearchChange?.(query);
    };

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const open = internalOpen;

    const isMobile = useMediaQuery("(max-width: 768px)");
    const shouldUseMobileLayout =
      (isMobile || forceMobileLayout) && mobileLayout !== "default";

    const setOpen = (newOpen: boolean) => {
      setInternalOpen(newOpen);
      if (!newOpen) {
        setSearchQuery("");
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
      () => options.find((opt) => opt.value === currentValue)
        ?? (suppliedSelectedOption?.value === currentValue ? suppliedSelectedOption : undefined)
        ?? (cachedSelection.current?.value === currentValue ? cachedSelection.current : undefined),
      [options, currentValue, suppliedSelectedOption],
    );

    useEffect(() => {
      if (selectedOption) cachedSelection.current = selectedOption;
    }, [selectedOption]);

    useEffect(() => {
      loadRequested.current = false;
    }, [options, searchQuery, isLoading, open]);

    const requestMore = () => {
      if (!open || isLoading || !hasMore || !onLoadMore || loadRequested.current) return;
      loadRequested.current = true;
      onLoadMore();
    };

    useEffect(() => {
      if (!loadSentinel || !open || isLoading || !hasMore || !onLoadMore
        || typeof IntersectionObserver === "undefined") return;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) requestMore();
      }, {
        root: loadSentinel.closest('[data-radix-scroll-area-viewport]'),
        rootMargin: "0px 0px 80px 0px",
      });
      observer.observe(loadSentinel);
      return () => observer.disconnect();
    }, [loadSentinel, open, isLoading, hasMore, onLoadMore, options, searchQuery]);

    const handleScroll = (event: React.UIEvent) => {
      const viewport = event.target as HTMLElement;
      if (!viewport.hasAttribute('data-radix-scroll-area-viewport')) return;
      if (viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 80) requestMore();
    };

    const paginationContent = <>
      {isLoading && <div role="status" className="px-4 py-3 text-center text-sm">{loadingMessage}</div>}
      {hasMore && onLoadMore && <div ref={setLoadSentinel} className="shrink-0">
        {!isLoading && <button type="button" className="w-full px-4 py-3 text-sm" onClick={requestMore}>Load more</button>}
      </div>}
    </>;

    const filteredOptions = useMemo(() => {
      if (!shouldFilter || !searchQuery) return options;
      const lowerQuery = searchQuery.toLowerCase();
      return options.filter((op) =>
        op.label.toLowerCase().includes(lowerQuery),
      );
    }, [options, searchQuery, shouldFilter]);

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
      isClearable && currentValue ? "pe-12" : "pe-8", // Add padding to accommodate both icons
    );

    const renderBase = (children: React.ReactNode) => (
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
          <ElasticScrollArea elasticity={false} viewportClassName="overscroll-contain" className="h-full w-full" onScrollCapture={handleScroll}>
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
                        "flex items-center justify-between w-full px-4 py-3 text-start text-sm rounded-lg transition-colors shrink-0",
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
              ) : !isLoading ? (
                <div className="py-8 text-center text-on-surface-variant">
                  <Typography variant="body-small">{emptyMessage}</Typography>
                </div>
              ) : null}
              {paginationContent}
            </div>
          </ElasticScrollArea>
        </div>
      </div>
    );

    if (shouldUseMobileLayout) {
      const renderMobileWrapper = (children: React.ReactNode) =>
        mobileLayout === "bottom-sheet" ? (
          <Sheet
            open={open}
            onOpenChange={setOpen}
            mode={sheetProps?.mode}
            shape={sheetProps?.shape ?? shape}
            variant={sheetProps?.variant}
            glass={sheetProps?.glass}
            forceBottomSheet
          >
            {children}
          </Sheet>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>{children}</Dialog>
        );
      const MobileTrigger =
        mobileLayout === "bottom-sheet" ? SheetTrigger : DialogTrigger;
      const MobileContent =
        mobileLayout === "bottom-sheet" ? SheetContent : DialogContent;

      return (
        renderMobileWrapper(<>
          {renderBase(
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
          )}

          <MobileContent
            padding="none"
            className={clsx(
              "z-[1000] p-0 flex flex-col overflow-hidden",
              mobileLayout === "dialog" && "max-w-[90vw] h-[60vh]",
              mobileLayout === "bottom-sheet" && "max-h-[85vh] h-[500px]",
            )}
            // @ts-ignore
            {...(mobileLayout === "dialog" ? { shape } : {})}
          >
            {mobileLayout === "bottom-sheet" && (
              <SheetHeader className="px-4 py-3 border-b border-outline-variant/20 shrink-0">
                <SheetTitle className="text-start">
                  {label || placeholder || "Select Option"}
                </SheetTitle>
              </SheetHeader>
            )}
            {renderMobileListContent()}
          </MobileContent>
        </>)
      );
    }

    return (
      <PopoverPrimitive.Root modal open={open} onOpenChange={setOpen}>
        {renderBase(
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
        )}

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            dir={direction}
            align="start"
            sideOffset={8}
            collisionPadding={12}
            sticky="always"
            style={{
              width: "var(--radix-popover-trigger-width)",
              minWidth: 0,
              maxWidth: "var(--radix-popover-content-available-width)",
              maxHeight: "var(--radix-popover-content-available-height)",
            }}
            className={clsx(
              selectContentVariants({ position: "popper", shape, bordered }),
              "z-[1000] p-0! flex flex-col",
            )}
          >
            <Command shouldFilter={shouldFilter} className="h-auto! min-h-0 w-full bg-transparent rounded-[inherit] [&_[cmdk-input-wrapper]]:shrink-0">
              <CommandInput placeholder={searchPlaceholder} value={searchQuery} onValueChange={setSearchQuery} />
              <ElasticScrollArea
                elasticity={false}
                onScrollCapture={handleScroll}
                className="h-auto! min-h-0"
                viewportClassName="h-auto! max-h-[min(16rem,max(0px,calc(var(--radix-popover-content-available-height,100dvh)-4rem)))] overscroll-contain"
              >
                <CommandList className="max-h-none! overflow-visible!">
                  {!isLoading && <CommandEmpty>{emptyMessage}</CommandEmpty>}
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
                            "me-2 h-4 w-4 text-primary transition-opacity",
                            currentValue === option.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {option.icon && (
                          <span className="me-2 opacity-70">{option.icon}</span>
                        )}
                        <span className="truncate">{option.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {paginationContent}
                </CommandList>
              </ElasticScrollArea>
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

Combobox.displayName = "Combobox";
