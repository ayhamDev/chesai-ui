"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Check, ChevronDown } from "lucide-react";
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import useRipple from "use-ripple-hook";
import {
  getSelectSlotClassNames,
  selectContentVariants,
  selectSlots,
  selectStyles,
} from "./select-styles";

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
      open,
      onOpenChange,
      disabled,
      position = "popper",
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue || "");
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

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
    };

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

    return (
      <SelectContext.Provider value={{ size, position, shape }}>
        <SelectPrimitive.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={handleValueChange}
          open={open}
          onOpenChange={onOpenChange}
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

            <SelectPrimitive.Trigger
              ref={ref}
              className={clsx(
                selectSlots.trigger,
                dynamicStyles.trigger,
                classNames?.trigger,
              )}
            >
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
                <SelectPrimitive.Value
                  placeholder={placeholder}
                  className={clsx(
                    selectSlots.value,
                    dynamicStyles.value,
                    classNames?.value,
                  )}
                />
              </div>

              <SelectPrimitive.Icon asChild>
                <ChevronDown
                  className={clsx(
                    selectSlots.selectorIcon,
                    dynamicStyles.selectorIcon,
                    classNames?.selectorIcon,
                  )}
                />
              </SelectPrimitive.Icon>
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

// --- Subcomponents ---

// Matches DropdownMenuItem style with bloom effect
const selectItemVariants = cva(
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none overflow-hidden z-0 " +
    "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/20 " +
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-38 " +
    // Bloom Effect
    "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 " +
    "after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] " +
    "after:transition-all after:duration-200 after:ease-out " +
    "data-[highlighted]:after:opacity-100 data-[highlighted]:after:scale-100",
  {
    variants: {
      size: {
        sm: "text-xs px-2 py-1.5",
        md: "text-sm px-3 py-2.5",
        lg: "text-base px-4 py-3",
      },
      isPopper: {
        true: "",
        false: "py-3", // Removed rounded-none to keep rounded corners
      },
      shape: {
        full: "",
        minimal: "",
        sharp: "!rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
      isPopper: true,
      shape: "minimal",
    },
  },
);

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const { size, position, shape } = useContext(SelectContext);
  const isPopper = position === "popper";

  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <SelectPrimitive.Item
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        selectItemVariants({ size, isPopper, shape }),
        "pl-8",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center z-10">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 animate-check-in text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>
        <span className="relative z-10">{children}</span>
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={clsx(
      "px-3 py-2 text-xs font-medium text-on-surface-variant tracking-wide",
      "pl-8",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={clsx("-mx-1 my-1.5 h-px bg-outline-variant", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export const SelectGroup = SelectPrimitive.Group;
