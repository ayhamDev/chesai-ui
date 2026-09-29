"use client";

import { OTPInput, OTPInputContext, type OTPInputProps } from "input-otp";
import { Dot } from "lucide-react";
import * as React from "react";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";

// --- VARIANTS ---

const slotVariants = cva(
  "relative flex items-center justify-center transition-all duration-200 ease-out motion-reduce:transition-none text-sm font-semibold select-none group border-box outline-none",
  {
    variants: {
      variant: {
        filled:
          "bg-surface-container-highest/60 text-on-surface border-b-2 border-transparent hover:bg-surface-container-highest",
        "filled-inverted":
          "bg-surface-container-lowest text-on-surface border-b-2 border-transparent hover:bg-filled-inverted-hover",
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
      separated: { true: "", false: "" },
      hasGap: { true: "", false: "" },
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
        className:
          "bg-surface-container-highest border-transparent ring-inset ring-2 ring-primary",
      },
      {
        variant: "filled-inverted",
        isActive: true,
        className:
          "bg-surface-container-lowest border-transparent ring-inset ring-2 ring-primary",
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
        className: "bg-surface-container-highest/50 border-primary",
      },
      {
        variant: "ghost-inverted",
        isActive: true,
        className: "bg-primary/10 border-primary",
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
        shape: ["full", "minimal"],
        variant: ["filled", "filled-inverted", "outlined", "outlined-inverted"],
        separated: false,
        hasGap: true,
        className: "rounded-md",
      },
      {
        shape: "full",
        variant: ["filled", "filled-inverted", "outlined", "outlined-inverted"],
        separated: false,
        className: "first:rounded-s-[32px] last:rounded-e-[32px]",
      },
      {
        shape: "minimal",
        variant: ["filled", "filled-inverted", "outlined", "outlined-inverted"],
        separated: false,
        className: "first:rounded-s-2xl last:rounded-e-2xl",
      },

      // --- Separated Rounding (Gapped/Individual Slots) ---
      {
        separated: true,
        shape: "full",
        variant: ["filled", "filled-inverted", "outlined", "outlined-inverted"],
        className: "rounded-[32px]",
      },
      {
        separated: true,
        shape: "minimal",
        variant: ["filled", "filled-inverted", "outlined", "outlined-inverted"],
        className: "rounded-2xl",
      },
      {
        shape: "full",
        variant: ["ghost", "ghost-inverted"],
        className: "rounded-[32px]",
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

export type InputOTPGap = "none" | "xs" | "sm" | "md" | "lg";

const gapClasses: Record<InputOTPGap, string> = {
  none: "gap-0",
  xs: "gap-px",
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-2",
};

interface InputOTPContextValue {
  disableHover?: boolean;
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
  /** Give every slot its own complete shape. Independent of group-style gap. */
  separated?: boolean;
  /** Space slots within each group while retaining rounded outer ends and smaller inner corners. */
  gap?: InputOTPGap;
  /** Optional shape for the focused slot. Sharp base shapes remain sharp. */
  activeShape?: "full" | "minimal" | "sharp";
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
      disableHover = false,
      variant = "filled",
      size = "md",
      shape = "minimal",
      isInvalid = false,
      separated = false,
      gap,
      activeShape,
      ...props
    },
    ref,
  ) => (
    <InputOTPStyleContext.Provider
      value={{ variant, size, shape, isInvalid, separated, gap, activeShape, disableHover }}
    >
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

export interface InputOTPGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Overrides the root gap for this group only. */
  gap?: InputOTPGap;
  shape?: InputOTPContextValue["shape"];
  activeShape?: InputOTPContextValue["activeShape"];
  separated?: boolean;
}

const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProps>(
  (
    {
      className,
      gap: gapProp,
      shape: shapeProp,
      activeShape: activeShapeProp,
      separated: separatedProp,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(InputOTPStyleContext);
    const { variant } = context;
    const separated = separatedProp ?? context.separated;
    const gap =
      gapProp ??
      context.gap ??
      (separated ||
      variant?.includes("underlined") ||
      variant?.includes("ghost")
        ? "lg"
        : "none");
    const mergeBorders =
      gap === "none" && !separated && variant?.startsWith("outlined");

    return (
      <InputOTPStyleContext.Provider
        value={{
          ...context,
          separated,
          gap,
          shape: shapeProp ?? context.shape,
          activeShape: activeShapeProp ?? context.activeShape,
        }}
      >
        <div
          ref={ref}
          data-otp-group=""
          data-disable-hover={context.disableHover || undefined}
          data-gap={gap}
          data-separated={!!separated}
          className={clsx(
            "flex items-center",
            gapClasses[gap],
            mergeBorders && "[&>[data-otp-slot]:not(:first-child)]:-ms-[2px]",
            className,
          )}
          {...props}
        />
      </InputOTPStyleContext.Provider>
    );
  },
);
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const {
    variant,
    size,
    shape,
    isInvalid,
    separated = false,
    gap = "none",
    activeShape,
    disableHover,
  } = React.useContext(InputOTPStyleContext);

  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      data-otp-slot=""
      data-disable-hover={disableHover || undefined}
      data-active={isActive}
      className={clsx(
        slotVariants({
          variant,
          size,
          shape,
          isInvalid,
          isActive,
          separated,
          hasGap: gap !== "none",
        }),
        isActive &&
          activeShape &&
          shape !== "sharp" &&
          !variant?.includes("underlined") &&
          (activeShape === "full"
            ? "rounded-[32px]!"
            : activeShape === "minimal"
              ? "rounded-2xl!"
              : "rounded-none!"),
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
