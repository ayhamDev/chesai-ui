"use client";

import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import React, { createContext, useContext } from "react";
import useRipple from "use-ripple-hook";

type DropdownMenuShape = "full" | "minimal" | "sharp";

// --- Context to pass shape down the tree ---
interface DropdownMenuContextProps {
  shape: DropdownMenuShape;
}

const DropdownMenuContext = createContext<DropdownMenuContextProps>({
  shape: "minimal",
});

const useDropdownMenuContext = () => useContext(DropdownMenuContext);

// --- Root Component (Wrapped to provide context) ---
interface DropdownMenuProps extends RadixDropdownMenu.DropdownMenuProps {
  shape?: DropdownMenuShape;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  shape = "minimal",
  ...props
}) => {
  return (
    <DropdownMenuContext.Provider value={{ shape }}>
      <RadixDropdownMenu.Root {...props} />
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuTrigger = RadixDropdownMenu.Trigger;
const DropdownMenuGroup = RadixDropdownMenu.Group;
const DropdownMenuPortal = RadixDropdownMenu.Portal;
const DropdownMenuSub = RadixDropdownMenu.Sub;
const DropdownMenuRadioGroup = RadixDropdownMenu.RadioGroup;

// --- CVA for Content Components ---
const contentVariants = cva(
  [
    "z-50 min-w-[12rem] max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overflow-x-hidden",
    "border border-graphite-border bg-graphite-card p-1.5",
    "shadow-md",
  ],
  {
    variants: {
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      shape: "minimal",
    },
  }
);

// --- Enhanced Animated Content Container ---
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>
>(({ className, sideOffset = 8, ...props }, ref) => {
  const { shape } = useDropdownMenuContext();
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        ref={ref}
        sideOffset={sideOffset}
        className={clsx(
          contentVariants({ shape }),
          "data-[state=open]:animate-menu-enter",
          "data-[state=closed]:animate-menu-exit",
          "data-[side=top]:origin-bottom",
          "data-[side=bottom]:origin-top",
          "data-[side=left]:origin-right",
          "data-[side=right]:origin-left",
          className
        )}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
});
DropdownMenuContent.displayName = RadixDropdownMenu.Content.displayName;

// --- Enhanced Menu Item (Restored Original Styles) ---
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Item>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => {
  // MODIFICATION: Get shape from context
  const { shape } = useDropdownMenuContext();
  const localRef = React.useRef<HTMLDivElement>(null);
  const [ripple, event] = useRipple({
    ref: localRef,
    color: "rgba(128, 128, 128, 0.1)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixDropdownMenu.Item
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        // ORIGINAL STYLES ARE PRESERVED
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none overflow-hidden",
        "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
        "hover:bg-graphite-secondary/60 focus:bg-graphite-secondary data-[highlighted]:bg-graphite-secondary",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-graphite-foreground/20",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-38",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        // MODIFICATION: Add logic to override radius only when needed
        shape === "sharp" && "!rounded-none",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = RadixDropdownMenu.Item.displayName;

// --- Enhanced Checkbox Item (Restored Original Styles) ---
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.CheckboxItem>
>(({ className, children, ...props }, ref) => {
  // MODIFICATION: Get shape from context
  const { shape } = useDropdownMenuContext();
  const localRef = React.useRef<HTMLDivElement>(null);
  const [ripple, event] = useRipple({
    ref: localRef,
    color: "rgba(128, 128, 128, 0.1)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixDropdownMenu.CheckboxItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        // ORIGINAL STYLES ARE PRESERVED
        "relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-8 pr-3 text-sm outline-none overflow-hidden",
        "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
        "hover:bg-graphite-secondary/60 focus:bg-graphite-secondary data-[highlighted]:bg-graphite-secondary",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-graphite-foreground/20",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-38",
        // MODIFICATION: Add logic to override radius only when needed
        shape === "sharp" && "!rounded-none",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <RadixDropdownMenu.ItemIndicator>
          <Check className="h-4 w-4 animate-check-in" />
        </RadixDropdownMenu.ItemIndicator>
      </span>
      {children}
    </RadixDropdownMenu.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName =
  RadixDropdownMenu.CheckboxItem.displayName;

// --- Enhanced Radio Item (Restored Original Styles) ---
const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.RadioItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.RadioItem>
>(({ className, children, ...props }, ref) => {
  // MODIFICATION: Get shape from context
  const { shape } = useDropdownMenuContext();
  const localRef = React.useRef<HTMLDivElement>(null);
  const [ripple, event] = useRipple({
    ref: localRef,
    color: "rgba(128, 128, 128, 0.1)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixDropdownMenu.RadioItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        // ORIGINAL STYLES ARE PRESERVED
        "relative flex cursor-pointer select-none items-center rounded-lg py-2.5 pl-8 pr-3 text-sm outline-none overflow-hidden",
        "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
        "hover:bg-graphite-secondary/60 focus:bg-graphite-secondary data-[highlighted]:bg-graphite-secondary",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-graphite-foreground/20",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-38",
        // MODIFICATION: Add logic to override radius only when needed
        shape === "sharp" && "!rounded-none",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <RadixDropdownMenu.ItemIndicator>
          <Circle className="h-2 w-2 fill-current animate-check-in" />
        </RadixDropdownMenu.ItemIndicator>
      </span>
      {children}
    </RadixDropdownMenu.RadioItem>
  );
});
DropdownMenuRadioItem.displayName = RadixDropdownMenu.RadioItem.displayName;

// --- Enhanced Sub-Menu Trigger (Restored Original Styles) ---
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, children, inset, ...props }, ref) => {
  // MODIFICATION: Get shape from context
  const { shape } = useDropdownMenuContext();
  const localRef = React.useRef<HTMLDivElement>(null);
  const [ripple, event] = useRipple({
    ref: localRef,
    color: "rgba(128, 128, 128, 0.1)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixDropdownMenu.SubTrigger
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        // ORIGINAL STYLES ARE PRESERVED
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none overflow-hidden",
        "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
        "hover:bg-graphite-secondary/60 focus:bg-graphite-secondary",
        "data-[state=open]:bg-graphite-secondary data-[highlighted]:bg-graphite-secondary",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-graphite-foreground/20",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        // MODIFICATION: Add logic to override radius only when needed
        shape === "sharp" && "!rounded-none",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-data-[state=open]:rotate-90" />
    </RadixDropdownMenu.SubTrigger>
  );
});
DropdownMenuSubTrigger.displayName = RadixDropdownMenu.SubTrigger.displayName;

// --- Enhanced Sub-Menu Content ---
const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.SubContent>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubContent>
>(({ className, ...props }, ref) => {
  const { shape } = useDropdownMenuContext();
  return (
    <RadixDropdownMenu.SubContent
      ref={ref}
      className={clsx(
        contentVariants({ shape }),
        "data-[state=open]:data-[side=right]:animate-submenu-enter-right",
        "data-[state=closed]:data-[side=right]:animate-submenu-exit-right",
        "data-[state=open]:data-[side=left]:animate-submenu-enter-left",
        "data-[state=closed]:data-[side=left]:animate-submenu-exit-left",
        "data-[state=open]:data-[side=top]:animate-menu-enter",
        "data-[state=closed]:data-[side=top]:animate-menu-exit",
        "data-[state=open]:data-[side=bottom]:animate-menu-enter",
        "data-[state=closed]:data-[side=bottom]:animate-menu-exit",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuSubContent.displayName = RadixDropdownMenu.SubContent.displayName;

// --- Other Components (Unchanged) ---
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Label>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <RadixDropdownMenu.Label
    ref={ref}
    className={clsx(
      "px-3 py-2 text-xs font-medium text-graphite-foreground/70 tracking-wide",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = RadixDropdownMenu.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Separator
    ref={ref}
    className={clsx("-mx-1 my-1.5 h-px bg-graphite-border/60", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = RadixDropdownMenu.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={clsx(
        "ml-auto text-xs font-mono tracking-wider text-graphite-foreground/50",
        className
      )}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
