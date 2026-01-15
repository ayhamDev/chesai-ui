"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import React, { createContext, useContext, useRef } from "react";
import useRipple from "use-ripple-hook";
import { useTheme } from "../../context";

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

const itemVariants = cva("overflow-hidden transition-colors", {
  variants: {
    variant: {
      primary: "bg-surface-container-low text-on-surface",
      secondary: "bg-surface-container-high text-on-surface",
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
  },
  compoundVariants: [
    { layout: "separated", shape: "full", className: "rounded-2xl" },
    { layout: "separated", shape: "minimal", className: "rounded-xl" },
    { layout: "separated", shape: "sharp", className: "rounded-none" },

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
          layout === "integrated" &&
            (shape === "full"
              ? "rounded-2xl overflow-hidden"
              : shape === "minimal"
              ? "rounded-xl overflow-hidden"
              : "rounded-none overflow-hidden"),
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

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    disableRipple?: boolean;
  }
>(({ className, children, disableRipple = false, ...props }, ref) => {
  const localRef = useRef<HTMLButtonElement | null>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "var(--color-ripple-dark)",
    duration: 400,
    disabled: disableRipple,
  });
  React.useImperativeHandle(ref, () => localRef.current);

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={localRef}
        onPointerDown={event}
        className={clsx(
          "relative flex flex-1 items-center justify-between p-4 font-semibold text-on-surface transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
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

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={clsx("px-4 pb-4 pt-0 text-on-surface-variant", className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
