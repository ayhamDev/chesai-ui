"use client";

import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";
import * as React from "react";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";

// --- VARIANTS ---

const slotVariants = cva(
  "relative flex items-center justify-center transition-all duration-200 ease-in-out text-sm font-semibold select-none group",
  {
    variants: {
      variant: {
        filled:
          "bg-surface-container-highest/60 text-on-surface border-b-2 border-transparent",
        "filled-inverted":
          "bg-surface-container-low text-on-surface border-b-2 border-transparent",
        outlined:
          "bg-transparent border border-outline-variant text-on-surface first:border-l first:border-l-outline-variant",
        "outlined-inverted":
          "bg-transparent border border-primary/50 text-on-surface",
        faded:
          "bg-surface-container/30 border-y border-r border-surface-container-highest/50 text-on-surface first:border-l first:border-l-surface-container-highest/50",
        underlined:
          "bg-transparent border-b-2 border-outline-variant text-on-surface rounded-none! px-1",
        "underlined-inverted":
          "bg-surface-container-highest/30 border-b-2 border-primary/50 text-on-surface rounded-t-lg rounded-b-none",
        ghost:
          "bg-transparent border border-transparent text-on-surface hover:bg-surface-container-highest/30",
        "ghost-inverted":
          "bg-transparent border border-transparent text-primary hover:bg-primary/10",
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
        variant: "filled",
        isActive: true,
        className: "bg-surface-container-highest border-primary",
      },
      {
        variant: "filled-inverted",
        isActive: true,
        className: "bg-surface-container border-primary",
      },
      {
        variant: "outlined",
        isActive: true,
        className: "border-primary ring-1 ring-primary z-10",
      },
      {
        variant: "outlined-inverted",
        isActive: true,
        className: "border-primary ring-2 ring-primary/20",
      },
      {
        variant: ["underlined", "underlined-inverted"],
        isActive: true,
        className: "border-primary",
      },
      {
        variant: "ghost",
        isActive: true,
        className: "bg-surface-container-highest/50",
      },
      { variant: "ghost-inverted", isActive: true, className: "bg-primary/10" },

      // --- ERROR STATES UPDATED ---
      // For filled types, use a ring-inset to create a border inside the background
      {
        variant: ["filled", "filled-inverted"],
        isInvalid: true,
        className:
          "bg-error-container/20 text-error ring-inset ring-2 ring-error border-transparent",
      },
      // For outlined types, explicitly color the border
      {
        variant: [
          "outlined",
          "outlined-inverted",
          "underlined",
          "underlined-inverted",
          "ghost",
          "ghost-inverted",
          "faded",
        ],
        isInvalid: true,
        className: "border-error text-error z-10",
      },
    ],
    defaultVariants: {
      variant: "filled",
      size: "md",
      shape: "minimal",
    },
  },
);

// ... (Rest of the file remains unchanged)

interface InputOTPContextValue {
  variant?:
    | "filled"
    | "filled-inverted"
    | "outlined"
    | "outlined-inverted"
    | "underlined"
    | "underlined-inverted"
    | "ghost"
    | "ghost-inverted"
    | "faded";
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
  isInvalid?: boolean;
}

const InputOTPStyleContext = React.createContext<InputOTPContextValue>({
  variant: "filled",
  size: "md",
  shape: "minimal",
  isInvalid: false,
});

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
      variant = "filled",
      size = "md",
      shape = "minimal",
      isInvalid = false,
      ...props
    },
    ref,
  ) => (
    // @ts-ignore
    <InputOTPStyleContext.Provider value={{ variant, size, shape, isInvalid }}>
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
  const isSeparated =
    variant?.includes("underlined") || variant?.includes("ghost");

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
