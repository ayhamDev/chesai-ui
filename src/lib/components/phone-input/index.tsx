// src/lib/components/phone-input/index.tsx
"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { Check, ChevronDown, Search } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";

// Phone number logic
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import SmartPhoneInput from "react-phone-number-input/input";
import enLabels from "react-phone-number-input/locale/en.json";

// Corrected standard ES imports for libphonenumber-js (safe source for CountryCode typings)
import { getExampleNumber, type CountryCode } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";

import { Dialog, DialogContent, DialogTrigger } from "../dialog";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { Input, type InputProps } from "../input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet";

// Re-export validation utilities for convenience
export {
  isValidPhoneNumber,
  isPossiblePhoneNumber,
} from "react-phone-number-input";

export const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return "🌐";
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

interface CountryPickerProps {
  value: CountryCode;
  onChange: (country: CountryCode) => void;
  disabled?: boolean;
  labels?: Record<string, string>;
  variant?: string;
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  isInvalid?: boolean;
}

const CountryPicker = ({
  value,
  onChange,
  disabled,
  labels = enLabels,
  variant = "filled",
  size = "md",
  shape = "minimal",
  isInvalid = false,
}: CountryPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const countries = useMemo(() => {
    return getCountries().map((c) => ({
      country: c as CountryCode,
      name: labels[c] || enLabels[c] || c,
      callingCode: getCountryCallingCode(c),
    }));
  }, [labels]);

  const filtered = useMemo(() => {
    if (!search) return countries;
    const s = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.callingCode.includes(s) ||
        c.country.toLowerCase() === s,
    );
  }, [countries, search]);

  const handleSelect = (c: CountryCode) => {
    onChange(c);
    setOpen(false);
    setTimeout(() => setSearch(""), 200);
  };

  // Dynamic bloom styles based on the input variant
  const bloomColor = useMemo(() => {
    if (isInvalid) return "after:bg-error/20 text-error";
    if (variant.includes("inverted")) return "after:bg-primary/20 text-primary";
    return "after:bg-on-surface/10 text-on-surface-variant hover:text-on-surface";
  }, [variant, isInvalid]);

  const textSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";

  // Match the button's shape (and its pseudo hover element) to the parent input's shape
  const shapeClass = useMemo(() => {
    if (shape === "full") return "rounded-full";
    if (shape === "sharp") return "rounded-none";
    return "rounded-lg"; // default / minimal
  }, [shape]);

  const triggerElement = (
    <button
      type="button"
      disabled={disabled}
      dir="ltr" // Force LTR so the Flex row sequence is always CountryCode -> +CallingCode -> Chevron
      className={clsx(
        "relative z-0 flex flex-row items-center justify-center gap-1.5 transition-colors px-2.5 py-1.5 outline-none",
        shapeClass,
        "after:absolute after:inset-0 after:z-[-1] after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out hover:after:opacity-100 hover:after:scale-100",
        bloomColor,
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span className={clsx("font-medium", textSize)}>{value}</span>
      <span className={clsx("font-medium opacity-60", textSize)}>
        +{getCountryCallingCode(value)}
      </span>
      <ChevronDown size={14} className="opacity-50 ml-0.5" />
    </button>
  );

  const listContent = (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full">
      <div className="p-2 border-b border-outline-variant/10 shrink-0">
        <Input
          variant="filled"
          size="sm"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startContent={
            <Search size={14} className="text-on-surface-variant" />
          }
          className="bg-transparent"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>

      <div
        className={clsx(
          "flex-1 min-h-0 relative",
          !isMobile && "overflow-y-auto",
        )}
      >
        {isMobile ? (
          <ElasticScrollArea className="absolute inset-0" elasticity={false}>
            <div className="p-1 flex flex-col gap-0.5 pb-safe">
              {filtered.map((c) => (
                <button
                  key={c.country}
                  onClick={() => handleSelect(c.country)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-left transition-colors shrink-0",
                    value === c.country
                      ? "bg-secondary-container text-on-secondary-container font-semibold"
                      : "hover:bg-surface-container-highest text-on-surface",
                  )}
                >
                  <span className="text-xl leading-none">
                    {getFlagEmoji(c.country)}
                  </span>
                  <span className="flex-1 truncate rtl:text-right">
                    {c.name}
                  </span>
                  <span
                    className="text-on-surface-variant opacity-70"
                    dir="ltr"
                  >
                    +{c.callingCode}
                  </span>
                  {value === c.country && <Check size={16} />}
                </button>
              ))}
            </div>
          </ElasticScrollArea>
        ) : (
          <div className="p-1 flex flex-col gap-0.5 pb-safe">
            {filtered.map((c) => (
              <button
                key={c.country}
                onClick={() => handleSelect(c.country)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-left transition-colors shrink-0",
                  value === c.country
                    ? "bg-secondary-container text-on-secondary-container font-semibold"
                    : "hover:bg-surface-container-highest text-on-surface",
                )}
              >
                <span className="text-xl leading-none">
                  {getFlagEmoji(c.country)}
                </span>
                <span className="flex-1 truncate rtl:text-right">{c.name}</span>
                <span className="text-on-surface-variant opacity-70" dir="ltr">
                  +{c.callingCode}
                </span>
                {value === c.country && <Check size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerElement}</SheetTrigger>
        <SheetContent
          shape="minimal"
          className="p-0 flex flex-col overflow-hidden max-h-[85vh] h-[500px]"
        >
          <SheetHeader className="px-4 py-3 border-b border-outline-variant/20 shrink-0">
            <SheetTitle className="text-left rtl:text-right">
              Select Country
            </SheetTitle>
          </SheetHeader>
          {listContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        {triggerElement}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={clsx(
            "z-50 w-[320px] max-h-80 overflow-hidden flex flex-col p-0",
            "rounded-xl border border-outline-variant bg-surface-container text-on-surface shadow-md",
            "data-[state=open]:animate-menu-enter data-[state=closed]:animate-menu-exit",
          )}
          align="start"
          sideOffset={8}
        >
          {listContent}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export interface PhoneInputProps extends Omit<
  InputProps,
  "value" | "onChange" | "onValueChange"
> {
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  /** ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB') for uncontrolled initialization */
  defaultCountry?: CountryCode;
  /** ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB') for fully controlled parents */
  country?: CountryCode;
  /** Fully controlled callback when the country selection shifts */
  onCountryChange?: (country: CountryCode) => void;
  labels?: Record<string, string>;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value,
      onValueChange,
      defaultCountry = "US",
      country: controlledCountry,
      onCountryChange,
      startContent,
      disabled,
      labels = enLabels,
      labelPlacement = "outside",
      placeholder,
      variant = "filled",
      size = "md",
      shape = "minimal",
      isInvalid = false,
      errorMessage,
      onFocus,
      onBlur,
      classNames,
      ...props
    },
    ref,
  ) => {
    const [internalCountry, setInternalCountry] =
      useState<CountryCode>(defaultCountry);
    const [isFocused, setIsFocused] = useState(false);

    const isCountryControlled = controlledCountry !== undefined;
    const activeCountry = isCountryControlled
      ? controlledCountry
      : internalCountry;

    const handleCountryChange = (newCountry: CountryCode) => {
      if (!isCountryControlled) {
        setInternalCountry(newCountry);
      }
      onCountryChange?.(newCountry);
    };

    // Keep internal uncontrolled fallback in sync if defaultCountry is dynamically updated from outside
    useEffect(() => {
      if (defaultCountry) {
        setInternalCountry(defaultCountry);
      }
    }, [defaultCountry]);

    // Suppress validation visual errors while the user is actively typing
    const activeInvalid = isInvalid && !isFocused && !!value;
    const activeErrorMessage = !isFocused ? errorMessage : undefined;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const composedStartContent = (
      <>
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center self-stretch my-1 border-r border-outline-variant/30 pr-1.5 mr-1.5 shrink-0"
        >
          <CountryPicker
            value={activeCountry}
            onChange={handleCountryChange}
            disabled={disabled}
            labels={labels}
            variant={variant}
            size={size}
            shape={shape}
            isInvalid={activeInvalid}
          />
        </div>
        {startContent}
      </>
    );

    const dynamicPlaceholder = useMemo(() => {
      if (placeholder) return placeholder;
      if (!activeCountry) return "";
      try {
        const example = getExampleNumber(activeCountry, examples as any);
        return example ? example.formatNational() : "";
      } catch (e) {
        return "";
      }
    }, [activeCountry, placeholder]);

    // Calculate maximum allowable character input dynamically based on the example country numbers
    // This blocks overflowing values natively on the browser input level, fully eliminating state mismatch update cycles
    const dynamicMaxLength = useMemo(() => {
      if (!activeCountry) return undefined;
      try {
        const example = getExampleNumber(activeCountry, examples as any);
        if (example) {
          const formatted = example.formatNational();
          // Add a safe buffer of 4 characters to accommodate alternative formatting rules,
          // custom spacing, or bracket choices comfortably without loop issues.
          return formatted.length + 4;
        }
      } catch (error) {
        // Fallback
      }
      return 22; // Ultimate safe length fallback for international inputs
    }, [activeCountry]);

    // Force the inner input row elements to strictly render in physical LTR flow order (Button on Left, Field on Right)
    const mergedClassNames = useMemo(() => {
      return {
        ...classNames,
        innerWrapper: clsx(
          "[direction:ltr] flex-row",
          classNames?.innerWrapper,
        ),
      };
    }, [classNames]);

    return (
      <SmartPhoneInput
        ref={ref}
        inputComponent={Input}
        country={activeCountry}
        value={value}
        onChange={onValueChange || (() => {})}
        disabled={disabled}
        startContent={composedStartContent}
        labelPlacement={labelPlacement}
        placeholder={dynamicPlaceholder}
        variant={variant}
        size={size}
        shape={shape}
        isInvalid={activeInvalid}
        errorMessage={activeErrorMessage}
        onFocus={handleFocus}
        onBlur={handleBlur}
        maxLength={dynamicMaxLength} // Handled natively rather than buggy JS limitMaxLength={} overrides
        dir="ltr"
        classNames={mergedClassNames}
        {...props}
        // Force text alignment to strictly left so the numbers format uniformly
        // alongside the fixed LTR layout of the country code button.
        className={clsx("!text-left", props.className)}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";

// Pre-bundled, tree-shakable locales for developers to import easily
export { default as phoneLocaleAr } from "react-phone-number-input/locale/ar.json";
export { default as phoneLocaleEn } from "react-phone-number-input/locale/en.json";
