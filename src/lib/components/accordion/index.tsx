"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import React, { createContext, useContext, useRef } from "react";
import useRipple from "use-ripple-hook";

type AccordionGap = "none" | "xs" | "sm" | "md" | "lg";

const gapClasses: Record<AccordionGap, string> = {
  none: "gap-0",
  xs: "gap-px",
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-2",
};

export type AccordionVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "high-contrast"
  | "ghost"
  | "surface"
  | "surface-container-lowest"
  | "surface-container-low"
  | "surface-container"
  | "surface-container-high"
  | "surface-container-highest";

interface AccordionContextProps {
  variant: AccordionVariant;
  shape: "full" | "minimal" | "sharp";
  layout: "integrated" | "separated";
  gap: AccordionGap;
}

const AccordionContext = createContext<AccordionContextProps | null>(null);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "useAccordionContext must be used within an AccordionContext.Provider",
    );
  }
  return context;
};

const itemVariants = cva("overflow-hidden transition-colors", {
  variants: {
    variant: {
      primary: "bg-surface-container-low text-on-surface",
      secondary: "bg-surface-container-highest text-on-surface",
      tertiary: "bg-tertiary-container text-on-tertiary-container",
      "high-contrast": "bg-inverse-surface text-inverse-on-surface",
      ghost: "bg-transparent text-on-surface",
      surface: "bg-surface text-on-surface",
      "surface-container-lowest": "bg-surface-container-lowest text-on-surface",
      "surface-container-low": "bg-surface-container-low text-on-surface",
      "surface-container": "bg-surface-container text-on-surface",
      "surface-container-high": "bg-surface-container-high text-on-surface",
      "surface-container-highest":
        "bg-surface-container-highest text-on-surface",
    },
    layout: {
      integrated: "border-b border-outline-variant last:border-b-0",
      separated: "border border-transparent",
    },
    shape: {
      full: "",
      minimal: "",
      sharp: "",
    },
    hasGap: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    // --- INTEGRATED LAYOUT ---
    {
      layout: "integrated",
      shape: "full",
      className: "first:rounded-t-2xl last:rounded-b-2xl",
    },
    {
      layout: "integrated",
      shape: "minimal",
      className: "first:rounded-t-xl last:rounded-b-xl",
    },
    {
      layout: "integrated",
      shape: "sharp",
      className: "first:rounded-t-none last:rounded-b-none",
    },

    // --- SEPARATED LAYOUT, NO GAP ---
    {
      layout: "separated",
      hasGap: false,
      shape: "full",
      className:
        "rounded-none first:rounded-t-2xl last:rounded-b-2xl only:rounded-2xl",
    },
    {
      layout: "separated",
      hasGap: false,
      shape: "minimal",
      className:
        "rounded-none first:rounded-t-xl last:rounded-b-xl only:rounded-xl",
    },
    {
      layout: "separated",
      hasGap: false,
      shape: "sharp",
      className: "rounded-none",
    },

    // --- SEPARATED LAYOUT, WITH GAP ---
    {
      layout: "separated",
      hasGap: true,
      shape: "full",
      className:
        "rounded-md first:rounded-t-2xl last:rounded-b-2xl only:rounded-2xl",
    },
    {
      layout: "separated",
      hasGap: true,
      shape: "minimal",
      className:
        "rounded-md first:rounded-t-xl last:rounded-b-xl only:rounded-xl",
    },
    {
      layout: "separated",
      hasGap: true,
      shape: "sharp",
      className: "rounded-none",
    },
  ],
  defaultVariants: {
    variant: "primary",
    layout: "integrated",
    shape: "minimal",
  },
});

type AccordionRootProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Root
> & {
  variant?: AccordionVariant;
  shape?: "full" | "minimal" | "sharp";
  layout?: "integrated" | "separated";
  gap?: AccordionGap;
};

const AccordionRoot = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionRootProps
>(
  (
    {
      className,
      variant = "primary",
      shape = "minimal",
      layout = "integrated",
      gap,
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedGap = gap ?? (layout === "integrated" ? "none" : "md");

    return (
      <AccordionContext.Provider
        value={{ variant, shape, layout, gap: resolvedGap }}
      >
        <AccordionPrimitive.Root
          ref={ref}
          className={clsx(
            "w-full flex flex-col",
            layout === "integrated" &&
              (shape === "full"
                ? "rounded-2xl overflow-hidden"
                : shape === "minimal"
                  ? "rounded-xl overflow-hidden"
                  : "rounded-none overflow-hidden"),
            layout === "separated" && gapClasses[resolvedGap],
            className,
          )}
          {...props}
        >
          {children}
        </AccordionPrimitive.Root>
      </AccordionContext.Provider>
    );
  },
);
AccordionRoot.displayName = "Accordion";

const AccordionItem: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> &
    React.RefAttributes<React.ElementRef<typeof AccordionPrimitive.Item>>
> = React.forwardRef(({ className, ...props }, ref) => {
  const { variant, shape, layout, gap } = useAccordionContext();
  const hasGap = gap !== "none";
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={clsx(
        itemVariants({ variant, shape, layout, hasGap }),
        className,
      )}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger: React.ForwardRefExoticComponent<
  (React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    disableRipple?: boolean;
  }) &
    React.RefAttributes<React.ElementRef<typeof AccordionPrimitive.Trigger>>
> = React.forwardRef(
  ({ className, children, disableRipple = false, ...props }, ref) => {
    const localRef = useRef<HTMLButtonElement | null>(null);
    const { variant } = useAccordionContext();

    const rippleColor =
      variant === "high-contrast" || variant === "tertiary"
        ? "var(--color-ripple-light)"
        : "var(--color-ripple-dark)";

    const [, event] = useRipple({
      ref: localRef as React.RefObject<HTMLElement>,
      color: rippleColor,
      duration: 400,
      disabled: disableRipple,
    });
    React.useImperativeHandle(ref as React.Ref<any>, () => localRef.current!);

    return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={localRef}
          onPointerDown={event}
          className={clsx(
            "relative flex flex-1 items-center justify-between p-4 font-semibold text-inherit transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "[&[data-state=open]>svg]:rotate-180",
            className,
          )}
          {...props}
        >
          {children}
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 opacity-80" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  },
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> &
    React.RefAttributes<React.ElementRef<typeof AccordionPrimitive.Content>>
> = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    {/* Using text-inherit + opacity-85 allows the body text to scale perfectly in dark/high contrast backdrops */}
    <div className={clsx("px-4 pb-4 pt-0 text-inherit opacity-85", className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
}) as typeof AccordionRoot & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
};
