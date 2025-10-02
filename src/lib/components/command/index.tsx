"use client";

import { type DialogProps } from "@radix-ui/react-dialog";
import { useMediaQuery } from "@uidotdev/usehooks";
import { clsx } from "clsx";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import * as React from "react";
import useRipple from "use-ripple-hook";
import { Dialog, DialogContent } from "../dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive> & {
    shouldFilter?: boolean;
  }
>(({ className, shouldFilter = true, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    shouldFilter={shouldFilter}
    className={clsx(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-graphite-card text-graphite-foreground",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Dialog {...props} variant={isMobile ? "fullscreen" : "basic"}>
      <DialogContent className="flex flex-col overflow-hidden p-0! shadow-lg max-w-xl">
        {children}
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center  flex-1" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      autoFocus={true}
      ref={ref}
      className={clsx(
        "flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-graphite-foreground/60 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={clsx(
      "overflow-y-auto overflow-x-hidden flex-1",
      "max-h-[450px] sm:max-h-[300px]",
      className
    )}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-graphite-foreground/70"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={clsx(
      "overflow-hidden p-1 text-graphite-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-graphite-foreground/70",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={clsx("-mx-1 my-1 h-px bg-graphite-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, onPointerDown, ...props }, ref) => {
  const localRef = React.useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "rgba(0, 0, 0, 0.1)",
    duration: 400,
    disabled: props.disabled,
  });

  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  return (
    <CommandPrimitive.Item
      ref={localRef}
      onPointerDown={(e) => {
        event(e);
        onPointerDown?.(e);
      }}
      className={clsx(
        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none overflow-hidden transition-colors duration-150",
        "hover:bg-graphite-secondary/80",
        "aria-selected:bg-graphite-secondary",
        "focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={clsx(
        "ml-auto text-xs tracking-widest text-graphite-foreground/60",
        className
      )}
      {...props}
    />
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
