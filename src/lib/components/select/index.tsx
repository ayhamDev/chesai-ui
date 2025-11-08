"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { useMediaQuery } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Check, ChevronDown } from "lucide-react";
import React, { createContext, useContext, useRef, useState } from "react";
import useRipple from "use-ripple-hook";
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../dialog";

// --- CONTEXT ---
interface SelectContextProps {
  variant: "primary" | "secondary";
  shape: "full" | "minimal" | "sharp";
  size: "sm" | "md" | "lg";
}

const SelectContext = createContext<SelectContextProps>({
  variant: "primary",
  shape: "minimal",
  size: "md",
});

const useSelectContext = () => useContext(SelectContext);

// --- CVA VARIANTS ---
const selectTriggerVariants = cva(
  "flex items-center justify-between transition-all duration-200 w-full px-4 border-2 text-left text-graphite-foreground [&_[data-placeholder]]:text-graphite-foreground/70",
  {
    variants: {
      variant: {
        primary: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-2xl",
        sharp: "rounded-none",
      },
      size: {
        sm: "h-10 text-sm",
        md: "h-12 text-base",
        lg: "h-14 text-lg",
      },
      isErrored: { true: "" },
      disabled: {
        true: "bg-graphite-secondary opacity-50 cursor-not-allowed",
      },
    },
    compoundVariants: [
      {
        variant: "primary",
        isErrored: false,
        className:
          "border-graphite-border data-[state=open]:border-graphite-primary",
      },
      {
        variant: "secondary",
        isErrored: false,
        className:
          "border-transparent data-[state=open]:border-graphite-primary",
      },
      {
        isErrored: true,
        className: "border-red-500 data-[state=open]:border-red-600",
      },
    ],
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
      size: "md",
    },
  }
);

const selectContentVariants = cva(
  "relative z-50 min-w-[8rem] overflow-hidden border shadow-md",
  {
    variants: {
      variant: {
        primary:
          "bg-graphite-card text-graphite-foreground border-graphite-border",
        secondary:
          "bg-graphite-secondary text-graphite-secondaryForeground border-transparent",
      },
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "minimal",
    },
  }
);

const selectItemVariants = cva(
  "relative flex w-full cursor-pointer select-none items-center rounded-lg pr-2 pl-8 outline-none overflow-hidden transition-colors duration-150 ease-in-out data-[highlighted]:bg-graphite-secondary/80 focus:bg-graphite-secondary/80 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      size: {
        sm: "py-2 text-sm",
        md: "py-2 text-base",
        lg: "py-2.5 text-lg",
      },
      shape: {
        full: "",
        minimal: "",
        sharp: "!rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// --- PRIMITIVE COMPONENTS (For Desktop Popover) ---

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

interface SelectProps extends SelectPrimitive.SelectProps {
  children: React.ReactNode;
  variant?: SelectContextProps["variant"];
  shape?: SelectContextProps["shape"];
  size?: SelectContextProps["size"];
}

const Select: React.FC<SelectProps> = ({
  children,
  variant = "primary",
  shape = "minimal",
  size = "md",
  ...props
}) => {
  return (
    <SelectContext.Provider value={{ variant, shape, size }}>
      <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  error?: string;
  variant?: "primary" | "secondary";
  shape?: "full" | "minimal" | "sharp";
  size?: "sm" | "md" | "lg";
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(
  (
    { className, children, variant, shape, size, error, disabled, ...props },
    ref
  ) => {
    const context = useSelectContext();
    return (
      <SelectPrimitive.Trigger
        ref={ref}
        disabled={disabled}
        className={selectTriggerVariants({
          variant: variant || context.variant,
          shape: shape || context.shape,
          size,
          isErrored: !!error,
          disabled,
          className,
        })}
        {...props}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  }
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "item-aligned", ...props }, ref) => {
  const { variant, shape } = useSelectContext();
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={clsx(
          selectContentVariants({ variant, shape }),
          position === "popper"
            ? "data-[state=open]:animate-menu-enter data-[state=closed]:animate-menu-exit w-[var(--radix-select-trigger-width)]"
            : "data-[state=open]:animate-select-enter data-[state=closed]:animate-select-exit",
          "data-[side=bottom]:origin-top data-[side=top]:origin-bottom ",
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={clsx(
            "p-1",
            // Only apply max-height and fade mask for popper position (which supports scrolling)
            position === "popper" && [
              "max-h-64",
              "[mask-image:linear-gradient(to_bottom,transparent,black_1rem,black_calc(100%-1rem),transparent)]",
            ],
            position === "popper" && "w-full"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const { shape, variant, size } = useSelectContext();
  const localRef = useRef<HTMLDivElement>(null);
  const rippleColor =
    variant === "primary"
      ? "var(--color-ripple-light)"
      : "var(--color-ripple-dark)";

  const [, event] = useRipple({
    ref: localRef,
    color: rippleColor,
    duration: 400,
    disabled: props.disabled,
  });

  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  return (
    <SelectPrimitive.Item
      ref={localRef}
      onPointerDown={event}
      className={clsx(selectItemVariants({ size, shape }), className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-graphite-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="truncate">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  const { size } = useSelectContext();
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={clsx(
        "py-1.5 pl-8 pr-2 font-semibold",
        {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
});
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={clsx("-mx-1 my-1 h-px bg-graphite-border", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// --- HELPER COMPONENT FOR MOBILE DIALOG ITEMS ---
interface DialogSelectItemProps {
  item: { value: string; label: string; disabled?: boolean };
  isSelected: boolean;
  onSelect: (value: string) => void;
  variant: "primary" | "secondary";
}

const DialogSelectItem: React.FC<DialogSelectItemProps> = ({
  item,
  isSelected,
  onSelect,
  variant,
}) => {
  const localRef = useRef<HTMLButtonElement>(null);
  const rippleColor =
    variant === "primary"
      ? "var(--color-ripple-light)"
      : "var(--color-ripple-dark)";

  const [, event] = useRipple({
    ref: localRef,
    color: rippleColor,
    duration: 400,
    disabled: item.disabled,
  });

  return (
    <button
      ref={localRef}
      type="button"
      onPointerDown={event}
      disabled={item.disabled}
      onClick={() => onSelect(item.value)}
      className={clsx(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-3 pl-8 pr-2 text-left text-sm outline-none overflow-hidden",
        "transition-colors duration-150 ease-in-out",
        "focus:bg-graphite-secondary/80",
        isSelected && "font-semibold text-graphite-primary",
        "disabled:pointer-events-none disabled:opacity-50"
      )}
    >
      <span className="relative z-10 flex items-center w-full">
        {isSelected && (
          <span className="absolute -left-6 flex h-3.5 w-3.5 items-center justify-center">
            <Check className="h-4 w-4 text-graphite-primary" />
          </span>
        )}
        <span className="truncate">{item.label}</span>
      </span>
    </button>
  );
};

// --- MAIN WRAPPER COMPONENT ---

interface SelectWrapperProps
  extends Omit<SelectProps, "children" | "onChange"> {
  variant?: "primary" | "secondary";
  shape?: "full" | "minimal" | "sharp";
  size?: "sm" | "md" | "lg";
  label?: string;
  error?: string;
  placeholder?: string;
  items: { value: string; label: string; disabled?: boolean }[];
  id?: string;
  contentPosition?: React.ComponentProps<typeof SelectContent>["position"];
  onValueChange?: (value: string) => void;
  value?: string;
  className?: string;
}

const SelectInput = React.forwardRef<HTMLButtonElement, SelectWrapperProps>(
  (
    {
      label,
      error,
      placeholder,
      items,
      id,
      variant = "primary",
      shape = "minimal",
      size = "md",
      disabled,
      contentPosition = "item-aligned",
      value,
      onValueChange,
      className,
      ...props
    },
    ref
  ) => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const uniqueId = React.useId();
    const [isOpen, setIsOpen] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const selectId = id || uniqueId;

    if (isMobile && contentPosition === "popper") {
      const handleOpenChange = (open: boolean) => {
        if (open) {
          setTempValue(value);
        }
        setIsOpen(open);
      };

      const handleConfirm = () => {
        if (tempValue !== undefined) {
          onValueChange?.(tempValue);
        }
        setIsOpen(false);
      };

      const displayLabel =
        items.find((item) => item.value === value)?.label || placeholder;

      return (
        <div className="w-full flex flex-col gap-2">
          {label && (
            <div className="block text-sm font-medium text-graphite-foreground">
              {label}
            </div>
          )}
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button
                ref={ref}
                type="button"
                id={selectId}
                disabled={disabled}
                className={clsx(
                  selectTriggerVariants({
                    variant,
                    shape,
                    size,
                    isErrored: !!error,
                    disabled,
                  }),
                  className
                )}
                {...props}
              >
                <span className="truncate">{displayLabel}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
            </DialogTrigger>
            <DialogContent
              shape={shape}
              className="fixed bottom-0 m-0 w-full max-w-full rounded-b-none rounded-t-2xl p-4"
            >
              <DialogHeader className="text-left">
                <DialogTitle>{label || placeholder}</DialogTitle>
              </DialogHeader>
              <div
                className={clsx(
                  "mt-4 max-h-[40vh] overflow-y-auto ",
                  "[mask-image:linear-gradient(to_bottom,transparent,black_1rem,black_calc(100%-1rem),transparent)]"
                )}
              >
                {items.map((item) => (
                  <DialogSelectItem
                    key={item.value}
                    item={item}
                    isSelected={tempValue === item.value}
                    onSelect={setTempValue}
                    variant={variant}
                  />
                ))}
              </div>
              <DialogFooter className="flex justify-end gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleConfirm}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-graphite-foreground"
          >
            {label}
          </label>
        )}
        <Select
          disabled={disabled}
          variant={variant}
          shape={shape}
          size={size}
          value={value}
          onValueChange={onValueChange}
          {...props}
        >
          <SelectTrigger
            id={selectId}
            ref={ref}
            size={size}
            error={error}
            disabled={disabled}
            className={className}
          >
            <span className="truncate">
              <SelectValue placeholder={placeholder} />
            </span>
          </SelectTrigger>
          <SelectContent position={contentPosition}>
            {items.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                disabled={item.disabled}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
SelectInput.displayName = "SelectInput";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectInput,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
