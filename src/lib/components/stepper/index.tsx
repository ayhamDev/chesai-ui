"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import React, { createContext, useContext, useMemo } from "react";
import { Typography } from "../typography";

// --- CONTEXT ---
interface StepperContextProps {
  currentStep: number;
  orientation: "horizontal" | "vertical";
  variant: "primary" | "secondary";
}

const StepperContext = createContext<StepperContextProps | null>(null);

const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context)
    throw new Error("Stepper components must be used within <Stepper>");
  return context;
};

interface StepContextProps {
  index: number;
  status: "complete" | "current" | "upcoming";
  isLast: boolean;
}

const StepContext = createContext<StepContextProps | null>(null);

const useStep = () => {
  const context = useContext(StepContext);
  if (!context)
    throw new Error("Step components must be used within <Stepper.Step>");
  return context;
};

// --- ROOT COMPONENT ---
export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  orientation?: "horizontal" | "vertical";
  variant?: "primary" | "secondary";
}

const StepperRoot = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      className,
      currentStep,
      orientation = "horizontal",
      variant = "primary",
      children,
      ...props
    },
    ref,
  ) => {
    const childArray = React.Children.toArray(children).filter(
      React.isValidElement,
    );

    return (
      <StepperContext.Provider value={{ currentStep, orientation, variant }}>
        <div
          ref={ref}
          className={clsx(
            "flex w-full",
            orientation === "horizontal"
              ? "flex-row items-start"
              : "flex-col items-start",
            className,
          )}
          {...props}
        >
          {childArray.map((child, index) => {
            const status =
              currentStep > index
                ? "complete"
                : currentStep === index
                  ? "current"
                  : "upcoming";
            const isLast = index === childArray.length - 1;

            return (
              <StepContext.Provider
                key={index}
                value={{ index, status, isLast }}
              >
                {child}
              </StepContext.Provider>
            );
          })}
        </div>
      </StepperContext.Provider>
    );
  },
);
StepperRoot.displayName = "Stepper";

// --- STEP WRAPPER ---
const StepperStep = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { orientation } = useStepper();
  const { isLast } = useStep();

  return (
    <div
      ref={ref}
      className={clsx(
        "relative flex",
        orientation === "horizontal"
          ? clsx("flex-row items-center", !isLast && "flex-1")
          : "flex-row items-start pb-8 last:pb-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
StepperStep.displayName = "Stepper.Step";

// --- INDICATOR (The Circle) ---
const indicatorVariants = cva(
  "relative flex items-center justify-center rounded-full font-bold transition-colors duration-300 z-10 shrink-0",
  {
    variants: {
      status: {
        complete: "bg-primary text-on-primary",
        current:
          "bg-secondary-container text-on-secondary-container ring-2 ring-primary ring-offset-2 ring-offset-background",
        upcoming: "bg-surface-container-highest text-on-surface-variant",
      },
      size: {
        sm: "h-6 w-6 text-xs",
        md: "h-8 w-8 text-sm",
        lg: "h-10 w-10 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const StepperIndicator = React.forwardRef<
  HTMLDivElement,
  StepperIndicatorProps
>(({ className, size = "md", icon, children, ...props }, ref) => {
  const { status, index } = useStep();

  return (
    <div
      ref={ref}
      className={clsx(indicatorVariants({ status, size }), className)}
      {...props}
    >
      {status === "complete" ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <Check
            className={size === "sm" ? "h-3 w-3" : "h-4 w-4"}
            strokeWidth={3}
          />
        </motion.div>
      ) : (
        icon || children || <span>{index + 1}</span>
      )}
    </div>
  );
});
StepperIndicator.displayName = "Stepper.Indicator";

// --- SEPARATOR (The Line) ---
const StepperSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useStepper();
  const { status, isLast } = useStep();

  if (isLast) return null;

  const isHorizontal = orientation === "horizontal";
  const isComplete = status === "complete";

  return (
    <div
      ref={ref}
      className={clsx(
        "absolute bg-surface-container-highest",
        isHorizontal
          ? "top-4 left-10 right-2 h-[2px] -translate-y-1/2"
          : "top-8 bottom-0 left-4 w-[2px] -translate-x-1/2",
        className,
      )}
      {...props}
    >
      <motion.div
        className="bg-primary h-full w-full origin-left"
        initial={{ scaleX: 0, scaleY: 0 }}
        animate={{
          scaleX: isHorizontal ? (isComplete ? 1 : 0) : 1,
          scaleY: !isHorizontal ? (isComplete ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ transformOrigin: isHorizontal ? "left" : "top" }}
      />
    </div>
  );
});
StepperSeparator.displayName = "Stepper.Separator";

// --- CONTENT ---
const StepperContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useStepper();
  return (
    <div
      ref={ref}
      className={clsx(
        "flex flex-col",
        orientation === "horizontal"
          ? "absolute top-10 left-0 w-max"
          : "ml-4 pt-1",
        className,
      )}
      {...props}
    />
  );
});
StepperContent.displayName = "Stepper.Content";

export const Stepper = Object.assign(StepperRoot, {
  Step: StepperStep,
  Indicator: StepperIndicator,
  Separator: StepperSeparator,
  Content: StepperContent,
  Title: (props: React.ComponentProps<typeof Typography>) => (
    <Typography variant="label-large" className="font-bold" {...props} />
  ),
  Description: (props: React.ComponentProps<typeof Typography>) => (
    <Typography variant="body-small" className="opacity-70" {...props} />
  ),
});
