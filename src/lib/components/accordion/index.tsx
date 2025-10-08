"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import React, { createContext, useContext, useRef } from "react";
import useRipple from "use-ripple-hook";

// --- Context for Accordion Configuration ---
interface AccordionContextProps {
  variant: "primary" | "secondary";
  shape: "full" | "minimal" | "sharp";
  layout: "integrated" | "separated";
}

const AccordionContext = createContext<AccordionContextProps | null>(null);

const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "useAccordionContext must be used within an AccordionContext.Provider"
    );
  }
  return context;
};
// --- CVA Variants ---
const itemVariants = cva("overflow-hidden transition-colors", {
  variants: {
    variant: {
      primary: "bg-graphite-card",
      secondary: "bg-graphite-secondary",
    },
    layout: {
      integrated: "border-b border-graphite-border last:border-b-0",
      separated: "border border-transparent",
    },
    shape: {
      full: "",
      minimal: "",
      sharp: "",
    },
  },
  compoundVariants: [
    { layout: "separated", shape: "full", className: "rounded-2xl" },
    { layout: "separated", shape: "minimal", className: "rounded-xl" },
    { layout: "separated", shape: "sharp", className: "rounded-none" },
  ],
  defaultVariants: {
    variant: "primary",
    layout: "integrated",
    shape: "minimal",
  },
});

// --- Root Component ---
type AccordionRootProps = React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Root
> & {
  variant?: "primary" | "secondary";
  shape?: "full" | "minimal" | "sharp";
  layout?: "integrated" | "separated";
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
      children,
      ...props
    },
    ref
  ) => (
    <AccordionContext.Provider value={{ variant, shape, layout }}>
      <AccordionPrimitive.Root
        ref={ref}
        className={clsx(
          "w-full",
          layout === "separated" && "space-y-2",
          className
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Root>
    </AccordionContext.Provider>
  )
);
AccordionRoot.displayName = "Accordion";

// --- Accordion Item ---
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { variant, shape, layout } = useAccordionContext();
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={clsx(itemVariants({ variant, shape, layout }), className)}
      {...props}
    />
  );
});
AccordionItem.displayName = "AccordionItem";

// --- Accordion Trigger (MODIFIED) ---
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    /** If true, the ripple effect on click will be disabled. */
    disableRipple?: boolean;
  }
>(({ className, children, disableRipple = false, ...props }, ref) => {
  const localRef = useRef<HTMLButtonElement | null>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "rgba(0, 0, 0, 0.1)",
    duration: 400,
    disabled: disableRipple, // Pass the new prop to the hook
  });
  React.useImperativeHandle(ref, () => localRef.current);

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={localRef}
        onPointerDown={event}
        className={clsx(
          "relative flex flex-1 items-center justify-between p-4 font-semibold text-graphite-foreground transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2",
          "[&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

// --- Accordion Content ---
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={clsx("px-4 pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// --- Compound Export ---
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
