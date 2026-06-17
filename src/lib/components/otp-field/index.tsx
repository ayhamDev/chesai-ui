"use client";

import { OTPInput, OTPInputContext, type OTPInputProps } from "input-otp";
import { Dot } from "lucide-react";
import * as React from "react";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";

// --- VARIANTS ---

const slotVariants = cva(
  "relative flex items-center justify-center transition-all duration-200 ease-out text-sm font-semibold select-none group border-box outline-none",
  {
    variants: {
      variant: {
        filled:
          "bg-surface-container-highest/60 text-on-surface border-b-2 border-transparent hover:bg-surface-container-highest",
        "filled-inverted":
          "bg-surface-container-low text-on-surface border-b-2 border-transparent hover:bg-surface-container",
        outlined:
          "bg-transparent border-2 border-outline-variant text-on-surface hover:border-on-surface-variant",
        "outlined-inverted":
          "bg-transparent border-2 border-primary/50 text-on-surface hover:border-primary",
        underlined:
          "bg-transparent border-b-2 border-outline-variant text-on-surface rounded-none! px-1",
        "underlined-inverted":
          "bg-surface-container-highest/30 border-b-2 border-primary/50 text-on-surface rounded-t-lg rounded-b-none hover:bg-surface-container-highest/50",
        ghost:
          "bg-transparent border-2 border-transparent text-on-surface hover:bg-surface-container-highest/30",
        "ghost-inverted":
          "bg-transparent border-2 border-transparent text-primary hover:bg-primary/10",
      },
      size: {
        sm: "h-12 w-10 text-sm",
        md: "h-14 w-12 text-base",
        lg: "h-16 w-14 text-lg",
      },
      shape: {
        full: "",
        minimal: "",
        sharp: "rounded-none!",
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
        className: "border-primary ring-1 ring-primary",
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
      {
        variant: "ghost-inverted",
        isActive: true,
        className: "bg-primary/10",
      },

      // Error States
      {
        variant: ["filled", "filled-inverted"],
        isInvalid: true,
        className:
          "bg-error-container/20 text-error ring-inset ring-2 ring-error border-transparent",
      },
      {
        variant: [
          "outlined",
          "outlined-inverted",
          "underlined",
          "underlined-inverted",
          "ghost",
          "ghost-inverted",
        ],
        isInvalid: true,
        className: "!border-error text-error",
      },

      // --- Grouped Rounding (Adjacent Slots) ---
      {
        shape: "full",
        variant: ["filled", "filled-inverted", "outlined", "outlined-inverted"],
        className: "first:rounded-l-full last:rounded-r-full",
      },
      {
        shape: "minimal",
        variant: ["filled", "filled-inverted", "outlined", "outlined-inverted"],
        className: "first:rounded-l-2xl last:rounded-r-2xl",
      },

      // --- Separated Rounding (Gapped/Individual Slots) ---
      {
        shape: "full",
        variant: ["ghost", "ghost-inverted"],
        className: "rounded-full",
      },
      {
        shape: "minimal",
        variant: ["ghost", "ghost-inverted"],
        className: "rounded-2xl",
      },
    ],
    defaultVariants: {
      variant: "filled",
      size: "md",
      shape: "minimal",
    },
  },
);

interface InputOTPContextValue {
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
  shape?: "full" | "minimal" | "sharp";
  isInvalid?: boolean;
}

const InputOTPStyleContext = React.createContext<InputOTPContextValue>({
  variant: "filled",
  size: "md",
  shape: "minimal",
  isInvalid: false,
});

export type InputOTPProps = Omit<OTPInputProps, "size" | "render"> &
  InputOTPContextValue & {
    containerClassName?: string;
  };

const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
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
    <InputOTPStyleContext.Provider value={{ variant, size, shape, isInvalid }}>
      <OTPInput
        ref={ref}
        containerClassName={clsx(
          "flex items-center gap-2 has-[:disabled]:opacity-50",
          containerClassName,
        )}
        className={clsx("disabled:cursor-not-allowed", className)}
        {...(props as any)}
      />
    </InputOTPStyleContext.Provider>
  ),
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(InputOTPStyleContext);
  const isSeparated =
    variant?.includes("underlined") || variant?.includes("ghost");

  return (
    <div
      ref={ref}
      className={clsx(
        "flex items-center",
        // Overlap adjacent 2px borders by applying negative margin to non-first children
        isSeparated ? "gap-2" : "gap-0 [&>div:not(:first-child)]:-ml-[2px]",
        className,
      )}
      {...props}
    />
  );
});
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { index: number }
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
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot className="text-on-surface-variant" />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
