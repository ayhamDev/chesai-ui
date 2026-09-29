// src/lib/components/stepper/index.tsx
"use client";
import { useDirection } from "../../context/direction";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import React, { createContext, useContext } from "react";
import { Typography } from "../typography";
import { Timeline, type TimelineConnectorProps } from "../timeline";
import { TimelineLayoutContext, themeColor, pairedColor, type TimelineColor } from "../timeline/primitives";
export { timelineColors as stepperColors } from "../timeline/primitives";
export type StepperColor = TimelineColor;
export type StepperStatus = "complete" | "current" | "upcoming" | "error";

// --- CONTEXT ---
interface StepperContextProps {
  currentStep: number;
  orientation: "horizontal" | "vertical";
  variant: "primary" | "secondary";
  color?: StepperColor;
  dir: 'ltr' | 'rtl';
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
  status: StepperStatus;
  color?: StepperColor;
  size?: 'sm' | 'md' | 'lg';
  isFirst: boolean;
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
  color?: StepperColor;
}

const StepperRoot = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      className,
      currentStep,
      orientation = "horizontal",
      variant = "primary",
      children,
      color,
      dir: explicitDir,
      ...props
    },
    ref,
  ) => {
    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => localRef.current!);
    const dir = useDirection(localRef, explicitDir);
    const childArray = React.Children.toArray(children).filter(
      React.isValidElement,
    );

    return (
      <StepperContext.Provider value={{ currentStep, orientation, variant, color, dir }}>
        <div
          ref={localRef}
          dir={explicitDir}
          role="list"
          className={clsx(
            "flex w-full",
            orientation === "horizontal"
              ? "flex-row items-stretch overflow-x-auto"
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
            const isFirst = index === 0;
            const isLast = index === childArray.length - 1;

            return (
              <StepContext.Provider
                key={child.key ?? index}
                value={{ index, status, isFirst, isLast }}
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
export interface StepperStepProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: StepperColor;
  status?: StepperStatus;
  size?: 'sm' | 'md' | 'lg';
}
const StepperStep = React.forwardRef<
  HTMLDivElement,
  StepperStepProps
>(({ className, children, color, status, size, style, ...props }, ref) => {
  const { orientation, color: rootColor } = useStepper();
  const step = useStep();
  const indicator = React.Children.toArray(children).find(child => React.isValidElement(child) && child.type === StepperIndicator) as React.ReactElement<StepperIndicatorProps> | undefined;
  const effectiveSize = indicator?.props.size ?? size ?? 'md';
  const pixels = { sm: 24, md: 32, lg: 40 }[effectiveSize];
  const effectiveStatus = status ?? step.status;

  return (
    <StepContext.Provider value={{ ...step, color: color ?? rootColor, status: effectiveStatus, size: effectiveSize }}><div
      ref={ref}
      role="listitem"
      aria-current={effectiveStatus === 'current' ? 'step' : undefined}
      data-status={effectiveStatus}
      className={clsx(
        "relative flex",
        orientation === "horizontal"
          ? "flex-col items-start flex-1 min-w-36"
          : "flex-row items-start pb-8 last:pb-0",
        className,
      )}
      {...props}
      style={{ '--stepper-indicator-size': `${pixels}px`, ...style } as React.CSSProperties}
    >
      {children}
    </div></StepContext.Provider>
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
        error: "bg-error text-on-error",
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

export interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  completedIcon?: React.ReactNode;
  color?: StepperColor;
  foreground?: StepperColor;
  shape?: 'circle' | 'square' | 'diamond';
}

const StepperIndicator = React.forwardRef<
  HTMLDivElement,
  StepperIndicatorProps
>(({ className, size: explicitSize, icon, completedIcon, color, foreground, shape = 'circle', style, children, ...props }, ref) => {
  const { status, index, color: stepColor, size: stepSize } = useStep();
  const { variant } = useStepper();
  const reducedMotion = useReducedMotion();
  const size = explicitSize ?? stepSize ?? 'md';
  const effectiveColor = color ?? stepColor ?? (variant === 'secondary' && status !== 'upcoming' ? 'secondary' : undefined);

  return (
    <div
      ref={ref}
      className={clsx(indicatorVariants({ status, size }), className)}
      {...props}
      style={{ ...(effectiveColor ? { backgroundColor: themeColor(effectiveColor), color: themeColor(foreground ?? pairedColor(effectiveColor)), '--tw-ring-color': themeColor(effectiveColor) } : foreground ? { color: themeColor(foreground) } : {}), ...(shape !== 'circle' ? { borderRadius: 6, transform: shape === 'diamond' ? 'rotate(45deg)' : undefined } : {}), ...style } as React.CSSProperties}
    >
      <span className="flex items-center justify-center" style={shape === 'diamond' ? { transform: 'rotate(-45deg)' } : undefined}>
      {status === "complete" ? (
        <motion.div
          initial={reducedMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          {completedIcon ?? <Check
            aria-hidden="true"
            className={size === "sm" ? "h-3 w-3" : "h-4 w-4"}
            strokeWidth={3}
          />}
        </motion.div>
      ) : (
        icon || children || <span>{index + 1}</span>
      )}
      </span>
    </div>
  );
});
StepperIndicator.displayName = "Stepper.Indicator";

// --- SEPARATOR (The Line) ---
export interface StepperSeparatorProps extends TimelineConnectorProps {}
const StepperSeparator = React.forwardRef<HTMLDivElement, StepperSeparatorProps>(
  ({ className, color, style, ...props }, ref) => {
    const { orientation, dir, variant } = useStepper();
    const { status, isLast, color: stepColor } = useStep();
    if (isLast) return null;
    const horizontal = orientation === "horizontal";
    const effectiveColor = color ?? stepColor ?? (status === 'complete' ? variant : status === 'error' ? 'error' : 'surface-container-highest');
    return (
      <TimelineLayoutContext.Provider value={{ horizontal, dir }}>
        <div className="absolute pointer-events-none flex items-center justify-center" aria-hidden="true"
          style={horizontal ? { top: 'calc(var(--stepper-indicator-size) / 2)', insetInlineStart: 'calc(var(--stepper-indicator-size) + 8px)', insetInlineEnd: 8, transform: 'translateY(-50%)' } : { top: 'calc(var(--stepper-indicator-size) + 4px)', bottom: 4, insetInlineStart: 'calc(var(--stepper-indicator-size) / 2)', transform: dir === 'rtl' ? 'translateX(50%)' : 'translateX(-50%)' }}>
          <Timeline.Connector ref={ref} {...props} color={effectiveColor} className={clsx('!m-0', className)}
            style={{ ...(horizontal ? { width: '100%' } : { height: '100%', position: 'absolute' }), ...style }} />
        </div>
      </TimelineLayoutContext.Provider>
    );
  },
);
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
          ? "mt-3 pe-6 pb-2 min-w-0 break-words items-start text-start"
          : "ms-4 pt-1 items-start text-start",
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
