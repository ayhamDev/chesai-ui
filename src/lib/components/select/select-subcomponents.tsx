"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Check } from "lucide-react";
import React, { useRef } from "react";
import useRipple from "use-ripple-hook";

// --- Re-define Context/Logic just for subcomponents if needed, or import if exported ---
// Since we split the file, we can't easily share the Context without circular deps or a separate context file.
// For now, I will assume we can grab the context from the main Select file, but standard practice
// is to keep context in a separate file if splitting components.
// However, to keep it simple, I will duplicate the Item styling logic or assume it receives props.
// Ideally, the Context should be exported from `select/index.tsx` or `select/select-context.ts`.

// NOTE: To make this work cleanly, you should ideally move `SelectContext` to a separate file.
// For this snippet, I will implement them as standalone styled components
// that might miss the `shape` prop unless passed explicitly, OR we assume the user imports them from the main index.
// BUT, the prompt asked to fix the scrolling logic in index.tsx.
// I am including this file just to ensure the imports in index.tsx work.

const selectItemVariants = cva(
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none overflow-hidden z-0 " +
    "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] " +
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/20 " +
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-38 " +
    "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 " +
    "after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] " +
    "after:transition-all after:duration-200 after:ease-out " +
    "data-[highlighted]:after:opacity-100 data-[highlighted]:after:scale-100",
  {
    variants: {
      isPopper: {
        true: "",
        false: "py-3",
      },
    },
    defaultVariants: {
      isPopper: true,
    },
  },
);

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    // @ts-ignore
    ref: localRef,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  // @ts-ignore
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <SelectPrimitive.Item
      ref={localRef}
      onPointerDown={event}
      className={clsx(selectItemVariants({}), "pl-8", className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center z-10">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 animate-check-in text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>
        <span className="relative z-10">{children}</span>
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={clsx(
      "px-3 py-2 text-xs font-medium text-on-surface-variant tracking-wide",
      "pl-8",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={clsx("-mx-1 my-1.5 h-px bg-outline-variant", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export const SelectGroup = SelectPrimitive.Group;
