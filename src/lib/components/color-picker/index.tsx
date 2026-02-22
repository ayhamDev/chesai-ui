"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";
import { Pipette } from "lucide-react";
import React, { useState, useEffect } from "react";
import { HexAlphaColorPicker } from "react-colorful";
import { Input } from "../input";
import { Typography } from "../typography";
import {
  getSelectSlotClassNames,
  selectSlots,
  selectStyles,
} from "../select/select-styles";

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  label?: string;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  disabled?: boolean;
  isInvalid?: boolean;
  shape?: "full" | "minimal" | "sharp";
  variant?: "flat" | "bordered" | "faded" | "underlined";
  size?: "sm" | "md" | "lg";
  labelPlacement?: "inside" | "outside" | "outside-left";
  swatches?: string[];
  className?: string;
}

const DEFAULT_SWATCHES = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#ffffff",
  "#71717a",
  "#000000",
];

export const ColorPicker = React.forwardRef<
  HTMLButtonElement,
  ColorPickerProps
>(
  (
    {
      value = "#3b82f6",
      onChange,
      label,
      description,
      errorMessage,
      disabled = false,
      isInvalid = false,
      shape = "minimal",
      variant = "flat",
      size = "md",
      labelPlacement = "inside",
      swatches = DEFAULT_SWATCHES,
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [internalColor, setInternalColor] = useState(value);
    const [hexInput, setHexInput] = useState(value);

    useEffect(() => {
      if (value !== internalColor) {
        setInternalColor(value);
        setHexInput(value);
      }
    }, [value]);

    const handleColorChange = (newColor: string) => {
      setInternalColor(newColor);
      setHexInput(newColor);
      onChange?.(newColor);
    };

    const handleHexInputChange = (val: string) => {
      setHexInput(val);
      let cleanVal = val.trim();
      if (!cleanVal.startsWith("#")) cleanVal = `#${cleanVal}`;

      // Update wheel if it's a valid hex
      if (
        /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/i.test(
          cleanVal,
        )
      ) {
        setInternalColor(cleanVal);
        onChange?.(cleanVal);
      }
    };

    const isFilled = !!internalColor || open;
    const dynamicStyles = getSelectSlotClassNames({
      variant,
      size,
      shape,
      labelPlacement,
      isInvalid,
      isFilled,
      hasStartContent: true,
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
            >
              {!isOutside && labelContent}

              <div
                className={clsx(
                  selectSlots.innerWrapper,
                  dynamicStyles.innerWrapper,
                )}
              >
                <div
                  className="h-5 w-5 shrink-0 rounded-full border border-outline-variant/30 shadow-inner"
                  style={{ backgroundColor: internalColor }}
                />
                <span
                  className={clsx(
                    selectSlots.value,
                    dynamicStyles.value,
                    "uppercase font-mono tracking-wide",
                  )}
                >
                  {internalColor}
                </span>
              </div>

              <Pipette
                className={clsx(
                  selectSlots.selectorIcon,
                  dynamicStyles.selectorIcon,
                  open && "text-primary",
                )}
              />
            </button>
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={4}
              className={clsx(
                "z-50 w-[280px] rounded-2xl border border-outline-variant bg-surface-container-high p-4 shadow-xl",
                "data-[state=open]:animate-menu-enter data-[state=closed]:animate-menu-exit",
              )}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                .react-colorful { width: 100%; height: 200px; }
                .react-colorful__pointer { width: 20px; height: 20px; border-width: 3px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                .react-colorful__hue, .react-colorful__alpha { height: 16px; border-radius: 8px; margin-top: 12px; }
                .react-colorful__last-control { border-radius: 8px; }
              `,
                }}
              />

              <HexAlphaColorPicker
                color={internalColor}
                onChange={handleColorChange}
              />

              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    size="sm"
                    variant="faded"
                    value={hexInput}
                    onValueChange={handleHexInputChange}
                    startContent={
                      <span className="text-on-surface-variant font-mono">
                        HEX
                      </span>
                    }
                    classNames={{ input: "font-mono uppercase" }}
                  />
                </div>
              </div>

              {swatches && swatches.length > 0 && (
                <div className="mt-4">
                  <Typography variant="label-small" className="mb-2 opacity-70">
                    Swatches
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {swatches.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        className={clsx(
                          "h-6 w-6 rounded-full border border-outline-variant/20 shadow-sm transition-transform hover:scale-110",
                          internalColor.toLowerCase() ===
                            swatch.toLowerCase() &&
                            "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-high",
                        )}
                        style={{ backgroundColor: swatch }}
                        onClick={() => handleColorChange(swatch)}
                        aria-label={`Select color ${swatch}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
        {helperWrapper}
      </div>
    );
  },
);
ColorPicker.displayName = "ColorPicker";
