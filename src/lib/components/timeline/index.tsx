"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import React, { createContext, forwardRef, useContext, useId, useRef, useImperativeHandle } from "react";
import { useDirection } from "../../context/direction";

import { themeColor, pairedColor, TimelineLayoutContext, type TimelineColor } from "./primitives";
export { timelineColors, type TimelineColor } from "./primitives";
const TimelineColorContext = createContext<TimelineColor | undefined>(undefined);
export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  orientation?: 'vertical' | 'horizontal';
  color?: TimelineColor;
}

export type TimelineStatus = "completed" | "current" | "pending" | "error";
const TimelineStatusContext = createContext<TimelineStatus | undefined>(undefined);
export interface TimelineItemProps extends HTMLMotionProps<"li"> {
  /** Optional delivery/order state. Include a visible status label in Content too. */
  status?: TimelineStatus;
  /** Default theme role for this step's dot and outgoing connector. */
  color?: TimelineColor;
}

// --- ROOT ---
const TimelineRoot = React.forwardRef<
  HTMLUListElement,
  TimelineProps
>(({ className, orientation = 'vertical', color, dir: explicitDir, ...props }, ref) => {
  const localRef = useRef<HTMLUListElement>(null);
  useImperativeHandle(ref, () => localRef.current!);
  const dir = useDirection(localRef, explicitDir);
  const horizontal = orientation === 'horizontal';
  return (
  <TimelineLayoutContext.Provider value={{ horizontal, dir }}>
  <TimelineColorContext.Provider value={color}>
  <ul
    ref={localRef}
    dir={explicitDir}
    data-orientation={orientation}
    className={clsx("flex m-0 p-0 list-none text-start", horizontal ? "flex-row overflow-x-auto" : "flex-col", className)}
    {...props}
  />
  </TimelineColorContext.Provider>
  </TimelineLayoutContext.Provider>
); });
TimelineRoot.displayName = "Timeline";

// --- ITEM ---
const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, status, color, ...props }, ref) => {
    const reducedMotion = useReducedMotion();
    const { horizontal } = useContext(TimelineLayoutContext);
    const inheritedColor = useContext(TimelineColorContext);
    return (
    <TimelineStatusContext.Provider value={status}>
    <TimelineColorContext.Provider value={color ?? inheritedColor}>
    <motion.li
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={clsx(
        "relative flex items-stretch gap-4 min-h-[3rem]",
        horizontal && "flex-col flex-1 min-w-40",
        className,
      )}
      {...props}
      data-status={status}
      aria-current={props['aria-current'] ?? (status === "current" ? "step" : undefined)}
    />
    </TimelineColorContext.Provider></TimelineStatusContext.Provider>
  ); },
);
TimelineItem.displayName = "Timeline.Item";

// --- SEPARATOR ---
const TimelineSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { horizontal } = useContext(TimelineLayoutContext);
  return (
  <div
    ref={ref}
    className={clsx("flex items-center shrink-0", horizontal ? "flex-row w-full min-h-10" : "flex-col w-8", className)}
    {...props}
  />
); });
TimelineSeparator.displayName = "Timeline.Separator";

// --- CONNECTOR ---
export interface TimelineConnectorProps extends HTMLMotionProps<"div"> {
  variant?: "solid" | "dashed" | "dotted";
  /** Wavy geometry, with the same naming as Divider. Can also be dashed or dotted. */
  shape?: "regular" | "wavy";
  size?: "sm" | "md" | "lg";
  waveSize?: "sm" | "md" | "lg";
  color?: "default" | TimelineColor;
  /** Continuous flow for patterned lines, gentle pulse for solid straight lines. */
  animated?: boolean;
  /** Seconds per cycle. Non-positive/non-finite values fall back to 1.2 seconds. */
  duration?: number;
  flowDirection?: "forward" | "reverse";
}

const connectorColors = {
  default: "text-outline-variant/50", primary: "text-primary", secondary: "text-secondary",
  tertiary: "text-tertiary", error: "text-error",
};
const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ className, variant = "solid", shape = "regular", size = "md", waveSize = "md",
    color, animated = false, duration = 1.2, flowDirection = "forward", style, children, ...props }, ref) => {
    const status = useContext(TimelineStatusContext);
    const inheritedColor = useContext(TimelineColorContext);
    const { horizontal, dir } = useContext(TimelineLayoutContext);
    const reducedMotion = useReducedMotion();
    const id = `timeline-line-${useId().replace(/:/g, '')}`;
    const thickness = { sm: 1, md: 2, lg: 4 }[size];
    const wavelength = { sm: 12, md: 20, lg: 32 }[waveSize];
    const amplitude = { sm: 3, md: 5, lg: 8 }[waveSize];
    const wavy = shape === "wavy";
    const width = wavy ? amplitude * 2 + thickness * 2 : thickness;
    const period = wavy ? wavelength : variant === "dotted" ? thickness * 3 : thickness * 6;
    const middle = width / 2;
    const effectiveColor = color ?? inheritedColor ?? (status === "completed" || status === "current" ? "primary" : status === "error" ? "error" : "default");
    const backwards = (flowDirection === 'reverse') !== (horizontal && dir === 'rtl');
    const axis = horizontal ? 'x' : 'y';
    const moving = animated && !reducedMotion;
    const pulse = !wavy && variant === "solid";
    return (
      <motion.div ref={ref}
        initial={reducedMotion ? false : horizontal ? { scaleX: 0 } : { scaleY: 0 }} whileInView={{ scaleX: 1, scaleY: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        className={clsx("relative flex-grow overflow-hidden rounded-full", horizontal ? "mx-1" : "my-1", effectiveColor in connectorColors && connectorColors[effectiveColor as keyof typeof connectorColors], className)}
        style={{ color: effectiveColor === 'default' ? undefined : themeColor(effectiveColor), ...(horizontal ? { originX: dir === 'rtl' ? 1 : 0, height: width, minWidth: period } : { originY: 0, width, minHeight: period }), ...style }} {...props}
        aria-hidden="true" data-orientation={horizontal ? 'horizontal' : 'vertical'} data-flow={backwards ? 'reverse' : 'forward'} data-variant={variant} data-shape={shape} data-animated={moving ? "true" : "false"}>
        <motion.div key={`${horizontal}-${dir}-${shape}-${variant}-${moving}-${flowDirection}`} className="absolute pointer-events-none"
          style={horizontal ? { left: -period, top: 0, width: `calc(100% + ${period * 2}px)`, height: '100%' } : { left: 0, top: -period, width: '100%', height: `calc(100% + ${period * 2}px)` }}
          aria-hidden="true"
          animate={moving ? pulse ? { x: 0, y: 0, opacity: [1, 0.35, 1] } : { x: 0, y: 0, opacity: 1, [axis]: backwards ? [period, 0] : [0, period] } : { x: 0, y: 0, opacity: 1 }}
          transition={moving ? { duration: Number.isFinite(duration) && duration > 0 ? duration : 1.2, repeat: Infinity, ease: "linear" } : { duration: 0 }}>
          <svg width="100%" height="100%" className="block" aria-hidden="true" focusable="false">
          <defs>
            <pattern id={id} width={horizontal ? period : width} height={horizontal ? width : period} patternUnits="userSpaceOnUse">
              <g transform={horizontal ? 'matrix(0 1 1 0 0 0)' : undefined}>
              {wavy ? <path d={`M ${middle} 0 Q ${middle + amplitude} ${period / 4} ${middle} ${period / 2} T ${middle} ${period}`}
                fill="none" stroke="currentColor" strokeWidth={thickness} strokeLinecap="round"
                strokeDasharray={variant === "dashed" ? `${thickness * 3} ${thickness * 2}` : variant === "dotted" ? `0 ${thickness * 3}` : undefined} />
                : variant === "dotted" ? <circle cx={middle} cy={period / 2} r={thickness / 2} fill="currentColor" />
                : <rect width={width} height={variant === "dashed" ? period * 0.6 : period} rx={variant === "dashed" ? thickness / 2 : 0} fill="currentColor" />}
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
          </svg>
        </motion.div>
        {children as React.ReactNode}
      </motion.div>
    );
  },
);
TimelineConnector.displayName = "Timeline.Connector";

// --- DOT ---
const dotVariants = cva(
  "flex items-center justify-center shrink-0 z-10 transition-colors shadow-sm",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary border-transparent",
        error: "bg-error text-on-error border-transparent",
        "primary-container":
          "bg-primary-container text-on-primary-container border-transparent",
        secondary:
          "bg-secondary-container text-on-secondary-container border-transparent",
        surface:
          "bg-surface text-on-surface border-[1.5px] border-outline-variant",
        outline:
          "bg-transparent border-[1.5px] border-outline-variant text-on-surface-variant",
        ghost:
          "bg-transparent border-transparent text-on-surface-variant shadow-none",
        solid: "bg-outline-variant text-surface border-transparent shadow-none",
      },
      size: {
        sm: "w-3 h-3",
        md: "w-6 h-6 [&>svg]:w-3.5 [&>svg]:h-3.5",
        lg: "w-8 h-8 [&>svg]:w-4 [&>svg]:h-4",
        xl: "w-10 h-10 [&>svg]:w-5 [&>svg]:h-5",
      },
      shape: {
        circle: "rounded-full",
        diamond: "rotate-45 rounded-[4px]",
        square: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
      shape: "circle",
    },
  },
);

export interface TimelineDotProps extends HTMLMotionProps<"div"> {
  color?: TimelineColor;
  foreground?: TimelineColor;
  variant?:
    | "primary"
    | "error"
    | "primary-container"
    | "secondary"
    | "surface"
    | "outline"
    | "ghost"
    | "solid";
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "diamond" | "square";
}

const TimelineDot = forwardRef<HTMLDivElement, TimelineDotProps>(
  (
    {
      className,
      variant,
      size = "md",
      shape = "circle",
      children,
      color,
      foreground,
      style,
      ...props
    },
    ref,
  ) => {
    const status = useContext(TimelineStatusContext);
    const inheritedColor = useContext(TimelineColorContext);
    const dotColor = color ?? inheritedColor;
    const reducedMotion = useReducedMotion();
    const effectiveVariant = variant ?? (status === "completed" || status === "current" ? "primary" : status === "pending" ? "outline" : status === "error" ? "error" : "secondary");
    return (
      <motion.div
        ref={ref}
        initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
          delay: 0.05,
        }}
        className={clsx(dotVariants({ variant: effectiveVariant, size, shape }), className)}
        {...props}
        style={{ ...(dotColor ? { backgroundColor: effectiveVariant === 'outline' || effectiveVariant === 'ghost' ? 'transparent' : themeColor(dotColor), borderColor: themeColor(dotColor), color: themeColor(foreground ?? (effectiveVariant === 'outline' || effectiveVariant === 'ghost' ? dotColor : pairedColor(dotColor))) } : foreground ? { color: themeColor(foreground) } : {}), ...style }}
      >
        {shape === "diamond" && React.Children.count(children) > 0 ? (
          <div className="-rotate-45 flex items-center justify-center w-full h-full">
            {children as React.ReactNode}
          </div>
        ) : (
          (children as React.ReactNode)
        )}
      </motion.div>
    );
  },
);
TimelineDot.displayName = "Timeline.Dot";

// --- CONTENT ---
const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { horizontal } = useContext(TimelineLayoutContext);
  return (
  <div
    ref={ref}
    className={clsx("flex-1 min-w-0 text-start", horizontal ? "pe-8 pb-2" : "pb-8", className)}
    {...props}
  />
); });
TimelineContent.displayName = "Timeline.Content";

export const Timeline = Object.assign(TimelineRoot, {
  Item: TimelineItem,
  Separator: TimelineSeparator,
  Connector: TimelineConnector,
  Dot: TimelineDot,
  Content: TimelineContent,
});
