"use client";

import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { clsx } from "clsx";
import { Search } from "lucide-react";
import * as React from "react";
import { Dialog, DialogContent } from "../dialog";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { Kbd } from "../kbd";

// --- Root Command ---
const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={clsx(
      "flex h-auto w-full flex-col overflow-hidden rounded-xl bg-graphite-card text-graphite-foreground", // CHANGED: h-full -> h-auto to allow content resizing
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

// --- Command Dialog (Modal) ---
interface CommandDialogProps extends DialogProps {
  children: React.ReactNode;
}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props} variant="basic">
      <DialogContent
        className="overflow-hidden shadow-2xl"
        shape="minimal"
        padding="sm"
        layout // ENABLED: Layout animation for height/width changes
      >
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-graphite-foreground/50 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

// --- Input ---
const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div
    className="flex items-center border-b border-graphite-border px-3"
    cmdk-input-wrapper=""
  >
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={clsx(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-graphite-foreground/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

// --- List ---
const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, children, ...props }, ref) => (
  <ElasticScrollArea
    className={clsx("max-h-[300px]", className)}
    scrollbarVisibility="auto"
  >
    <CommandPrimitive.List ref={ref} className="overflow-hidden" {...props}>
      {children}
    </CommandPrimitive.List>
  </ElasticScrollArea>
));
CommandList.displayName = CommandPrimitive.List.displayName;

// --- Empty State ---
const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-graphite-foreground/60"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

// --- Group ---
const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={clsx(
      "overflow-hidden p-1 text-graphite-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-graphite-foreground/50",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

// --- Separator ---
const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={clsx("-mx-1 h-px bg-graphite-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

// --- Item ---
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={clsx(
      "relative flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors",
      // Selected State (Active)
      "data-[selected=true]:bg-graphite-secondary data-[selected=true]:text-graphite-foreground",
      // Disabled State
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

// --- Shortcut ---
const CommandShortcut = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  const content = React.Children.map(children, (child) => {
    if (typeof child === "string") {
      return (
        <Kbd size="sm" variant="ghost" className="text-[10px] h-5 min-w-[20px]">
          {child}
        </Kbd>
      );
    }
    return child;
  });

  return (
    <span
      className={clsx(
        "ml-auto flex items-center gap-1 text-xs tracking-widest text-graphite-foreground/60",
        className
      )}
      {...props}
    >
      {content}
    </span>
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
