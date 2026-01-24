"use client";

import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

// --- VARIANTS ---

const slotVariants = cva(
  "relative flex items-center justify-center transition-all duration-200 ease-in-out text-sm font-semibold select-none group",
  {
    variants: {
      variant: {
        flat: "bg-surface-container-low text-on-surface border-y border-r border-transparent first:border-l first:border-l-transparent",
        bordered:
          "bg-transparent border-y border-r border-outline-variant text-on-surface first:border-l first:border-l-outline-variant",
        faded:
          "bg-surface-container/30 border-y border-r border-surface-container-highest/50 text-on-surface first:border-l first:border-l-surface-container-highest/50",
        underlined:
          "bg-transparent border-b-2 border-outline-variant text-on-surface rounded-none! px-1",
      },
      size: {
        sm: "h-10 w-8 text-xs",
        md: "h-12 w-10 text-sm",
        lg: "h-14 w-12 text-base",
      },
      shape: {
        full: "first:rounded-l-full last:rounded-r-full",
        minimal: "first:rounded-l-2xl last:rounded-r-2xl",
        sharp: "rounded-none",
      },
      isInvalid: {
        true: "",
        false: "",
      },
      isActive: {
        true: "z-10",
        false: "",
      },
    },
    compoundVariants: [
      // Focus/Active States
      {
        variant: "flat",
        isActive: true,
        className:
          "bg-surface-container-highest ring-2 ring-primary ring-inset",
      },
      {
        variant: "bordered",
        isActive: true,
        className: "border-primary ring-1 ring-primary z-10",
      },
      {
        variant: "faded",
        isActive: true,
        className:
          "bg-surface-container/50 border-transparent ring-2 ring-primary ring-inset",
      },
      { variant: "underlined", isActive: true, className: "border-primary" },

      // Error States
      {
        variant: "flat",
        isInvalid: true,
        className: "bg-error-container/20 text-error ring-error",
      },
      {
        variant: "bordered",
        isInvalid: true,
        className: "border-error text-error",
      },
      {
        variant: "underlined",
        isInvalid: true,
        className: "border-error text-error",
      },
      {
        variant: "faded",
        isInvalid: true,
        className: "border-error text-error",
      },
    ],
    defaultVariants: {
      variant: "flat",
      size: "md",
      shape: "minimal",
    },
  },
);

// --- CONTEXT ---

interface InputOTPContextValue {
  variant?: "flat" | "bordered" | "faded" | "underlined";
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  isInvalid?: boolean;
}

const InputOTPStyleContext = React.createContext<InputOTPContextValue>({
  variant: "flat",
  size: "md",
  shape: "minimal",
  isInvalid: false,
});

// --- COMPONENTS ---

export type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput> &
  InputOTPContextValue & {
    containerClassName?: string;
  };

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  InputOTPProps
>(
  (
    {
      className,
      containerClassName,
      variant = "flat",
      size = "md",
      shape = "minimal",
      isInvalid = false,
      ...props
    }: {
      className?: string;
      containerClassName?: string;
      variant?: "flat" | "bordered" | "faded" | "underlined";
      size?: "sm" | "md" | "lg";
      shape?: "full" | "minimal" | "sharp";
      isInvalid?: boolean;
    },
    ref,
  ) => (
    <InputOTPStyleContext.Provider value={{ variant, size, shape, isInvalid }}>
      {/* @ts-expect-error */}
      <OTPInput
        ref={ref}
        containerClassName={clsx(
          "flex items-center gap-2 has-[:disabled]:opacity-50",
          containerClassName,
        )}
        className={clsx("disabled:cursor-not-allowed", className)}
        {...props}
      />
    </InputOTPStyleContext.Provider>
  ),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(InputOTPStyleContext);

  // If underlined, we want a gap between slots, otherwise they are connected
  const isSeparated = variant === "underlined";

  return (
    <div
      ref={ref}
      className={clsx(
        "flex items-center",
        isSeparated ? "gap-2" : "gap-0",
        className,
      )}
      {...props}
    />
  );
});
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { variant, size, shape, isInvalid } =
    React.useContext(InputOTPStyleContext);

  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={clsx(
        slotVariants({ variant, size, shape, isInvalid, isActive }),
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-current duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot className="text-on-surface-variant" />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
