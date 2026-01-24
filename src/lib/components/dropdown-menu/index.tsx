"use client";

import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import React, { createContext, useContext, useRef } from "react";
import useRipple from "use-ripple-hook";
import { useTheme } from "../../context";

type DropdownMenuShape = "full" | "minimal" | "sharp";

interface DropdownMenuContextProps {
  shape: DropdownMenuShape;
}

const DropdownMenuContext = createContext<DropdownMenuContextProps>({
  shape: "minimal",
});

const useDropdownMenuContext = () => useContext(DropdownMenuContext);

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

const contentVariants = cva(
  [
    "z-50 min-w-[12rem] max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overflow-x-hidden",
    "border border-outline-variant bg-surface-container text-on-surface p-1.5",
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
  },
);

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
          className,
        )}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
});
DropdownMenuContent.displayName = RadixDropdownMenu.Content.displayName;

const itemStyles =
  "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none overflow-hidden z-0 " +
  "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] " +
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/20 " +
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-38 " +
  "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 " +
  "after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] " +
  "after:transition-all after:duration-200 after:ease-out " +
  "data-[highlighted]:after:opacity-100 data-[highlighted]:after:scale-100";

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Item>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => {
  const { shape } = useDropdownMenuContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixDropdownMenu.Item
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        shape === "sharp" && "!rounded-none",
        className,
      )}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = RadixDropdownMenu.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.CheckboxItem>
>(({ className, children, ...props }, ref) => {
  const { shape } = useDropdownMenuContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixDropdownMenu.CheckboxItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "pl-8 pr-3",
        shape === "sharp" && "!rounded-none",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center z-10">
        <RadixDropdownMenu.ItemIndicator>
          <Check className="h-4 w-4 animate-check-in text-primary" />
        </RadixDropdownMenu.ItemIndicator>
      </span>
      <span className="relative z-10">{children}</span>
    </RadixDropdownMenu.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName =
  RadixDropdownMenu.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.RadioItem>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.RadioItem>
>(({ className, children, ...props }, ref) => {
  const { shape } = useDropdownMenuContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixDropdownMenu.RadioItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "pl-8 pr-3",
        shape === "sharp" && "!rounded-none",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center z-10">
        <RadixDropdownMenu.ItemIndicator>
          <Circle className="h-2 w-2 fill-current animate-check-in text-primary" />
        </RadixDropdownMenu.ItemIndicator>
      </span>
      <span className="relative z-10">{children}</span>
    </RadixDropdownMenu.RadioItem>
  );
});
DropdownMenuRadioItem.displayName = RadixDropdownMenu.RadioItem.displayName;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, children, inset, ...props }, ref) => {
  const { shape } = useDropdownMenuContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixDropdownMenu.SubTrigger
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "data-[state=open]:after:opacity-100 data-[state=open]:after:scale-100",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        shape === "sharp" && "!rounded-none",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex flex-1 items-center gap-2">
        {children}
        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-data-[state=open]:rotate-90" />
      </span>
    </RadixDropdownMenu.SubTrigger>
  );
});
DropdownMenuSubTrigger.displayName = RadixDropdownMenu.SubTrigger.displayName;

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
        className,
      )}
      {...props}
    />
  );
});
DropdownMenuSubContent.displayName = RadixDropdownMenu.SubContent.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Label>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <RadixDropdownMenu.Label
    ref={ref}
    className={clsx(
      "px-3 py-2 text-xs font-medium text-on-surface-variant tracking-wide",
      inset && "pl-8",
      className,
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
    className={clsx("-mx-1 my-1.5 h-px bg-outline-variant/60", className)}
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
        "ml-auto text-xs font-mono tracking-wider text-on-surface-variant/50",
        className,
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
