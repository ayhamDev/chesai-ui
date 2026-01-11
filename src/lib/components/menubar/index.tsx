"use client";

import * as RadixMenubar from "@radix-ui/react-menubar";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import React, { createContext, useContext, useRef } from "react";
import useRipple from "use-ripple-hook";

type MenubarShape = "full" | "minimal" | "sharp";

interface MenubarContextProps {
  shape: MenubarShape;
}

const MenubarContext = createContext<MenubarContextProps>({
  shape: "minimal",
});

const useMenubarContext = () => useContext(MenubarContext);

interface MenubarProps extends RadixMenubar.MenubarProps {
  shape?: MenubarShape;
}

const MenubarRoot: React.FC<MenubarProps> = ({
  shape = "minimal",
  className,
  ...props
}) => {
  return (
    <MenubarContext.Provider value={{ shape }}>
      <RadixMenubar.Root
        className={clsx(
          "flex h-10 items-center space-x-1 rounded-lg bg-transparent p-1",
          className
        )}
        {...props}
      />
    </MenubarContext.Provider>
  );
};

const contentVariants = cva(
  [
    "z-50 min-w-[12rem] max-h-[var(--radix-menubar-content-available-height)] overflow-y-auto overflow-x-hidden",
    "border border-graphite-border bg-graphite-card text-graphite-foreground p-1.5",
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

const MenubarMenu = RadixMenubar.Menu;
const MenubarGroup = RadixMenubar.Group;
const MenubarPortal = RadixMenubar.Portal;
const MenubarSub = RadixMenubar.Sub;
const MenubarRadioGroup = RadixMenubar.RadioGroup;

// --- Styled Trigger with Bloom ---
const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof RadixMenubar.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixMenubar.Trigger>
>((props, ref) => (
  <RadixMenubar.Trigger
    ref={ref}
    className={clsx(
      "flex cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-sm font-semibold outline-none text-graphite-foreground relative z-0 overflow-hidden",
      "transition-colors duration-150 ease-in-out",
      // Remove direct hover bg
      "focus:bg-graphite-secondary",
      "data-[state=open]:bg-graphite-secondary",
      // Bloom effect
      "after:absolute after:inset-0 after:z-[-1] after:bg-graphite-secondary after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out",
      "hover:after:opacity-100 hover:after:scale-100"
    )}
    {...props}
  />
));
MenubarTrigger.displayName = RadixMenubar.Trigger.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof RadixMenubar.Content>,
  React.ComponentPropsWithoutRef<typeof RadixMenubar.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => {
    const { shape } = useMenubarContext();
    return (
      <MenubarPortal>
        <RadixMenubar.Content
          ref={ref}
          align={align}
          alignOffset={alignOffset}
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
      </MenubarPortal>
    );
  }
);
MenubarContent.displayName = RadixMenubar.Content.displayName;

// Shared item styles including bloom
const itemStyles =
  "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none overflow-hidden " +
  "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] z-0 " +
  "focus:bg-graphite-secondary data-[highlighted]:bg-graphite-secondary " +
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-graphite-foreground/20 " +
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-38 " +
  // Bloom
  "after:absolute after:inset-0 after:z-[-1] after:bg-graphite-secondary/60 after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out " +
  "hover:after:opacity-100 hover:after:scale-100 " +
  // Reset bg for hover since we use bloom
  "hover:bg-transparent";

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof RadixMenubar.Item>,
  React.ComponentPropsWithoutRef<typeof RadixMenubar.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => {
  const { shape } = useMenubarContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "var(--color-ripple-light)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  return (
    <RadixMenubar.Item
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        shape === "sharp" && "!rounded-none",
        className
      )}
      {...props}
    />
  );
});
MenubarItem.displayName = RadixMenubar.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof RadixMenubar.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RadixMenubar.CheckboxItem>
>(({ className, children, ...props }, ref) => {
  const { shape } = useMenubarContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "var(--color-ripple-light)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  return (
    <RadixMenubar.CheckboxItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "pl-8 pr-3",
        shape === "sharp" && "!rounded-none",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center z-10">
        <RadixMenubar.ItemIndicator>
          <Check className="h-4 w-4 animate-check-in" />
        </RadixMenubar.ItemIndicator>
      </span>
      <span className="relative z-10">{children}</span>
    </RadixMenubar.CheckboxItem>
  );
});
MenubarCheckboxItem.displayName = RadixMenubar.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof RadixMenubar.RadioItem>,
  React.ComponentPropsWithoutRef<typeof RadixMenubar.RadioItem>
>(({ className, children, ...props }, ref) => {
  const { shape } = useMenubarContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "var(--color-ripple-light)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  return (
    <RadixMenubar.RadioItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "pl-8 pr-3",
        shape === "sharp" && "!rounded-none",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center z-10">
        <RadixMenubar.ItemIndicator>
          <Circle className="h-2 w-2 fill-current animate-check-in" />
        </RadixMenubar.ItemIndicator>
      </span>
      <span className="relative z-10">{children}</span>
    </RadixMenubar.RadioItem>
  );
});
MenubarRadioItem.displayName = RadixMenubar.RadioItem.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof RadixMenubar.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixMenubar.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, children, inset, ...props }, ref) => {
  const { shape } = useMenubarContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "var(--color-ripple-light)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  return (
    <RadixMenubar.SubTrigger
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "data-[state=open]:bg-graphite-secondary",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        shape === "sharp" && "!rounded-none",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex flex-1 items-center gap-2">
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
      </span>
    </RadixMenubar.SubTrigger>
  );
});
MenubarSubTrigger.displayName = RadixMenubar.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof RadixMenubar.SubContent>,
  React.ComponentPropsWithoutRef<typeof RadixMenubar.SubContent>
>(({ className, ...props }, ref) => {
  const { shape } = useMenubarContext();
  return (
    <RadixMenubar.SubContent
      ref={ref}
      className={clsx(
        contentVariants({ shape }),
        "data-[state=open]:data-[side=right]:animate-submenu-enter-right",
        "data-[state=closed]:data-[side=right]:animate-submenu-exit-right",
        "data-[state=open]:data-[side=left]:animate-submenu-enter-left",
        "data-[state=closed]:data-[side=left]:animate-submenu-exit-left",
        className
      )}
      {...props}
    />
  );
});
MenubarSubContent.displayName = RadixMenubar.SubContent.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof RadixMenubar.Label>,
  React.ComponentPropsWithoutRef<typeof RadixMenubar.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <RadixMenubar.Label
    ref={ref}
    className={clsx(
      "px-3 py-2 text-xs font-medium text-graphite-foreground/70 tracking-wide",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
MenubarLabel.displayName = RadixMenubar.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof RadixMenubar.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixMenubar.Separator>
>(({ className, ...props }, ref) => (
  <RadixMenubar.Separator
    ref={ref}
    className={clsx("-mx-1 my-1.5 h-px bg-graphite-border/60", className)}
    {...props}
  />
));
MenubarSeparator.displayName = RadixMenubar.Separator.displayName;

const MenubarShortcut = ({
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
MenubarShortcut.displayName = "MenubarShortcut";

export const Menubar = Object.assign(MenubarRoot, {
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  Content: MenubarContent,
  Item: MenubarItem,
  Separator: MenubarSeparator,
  Label: MenubarLabel,
  CheckboxItem: MenubarCheckboxItem,
  RadioGroup: MenubarRadioGroup,
  RadioItem: MenubarRadioItem,
  Portal: MenubarPortal,
  Group: MenubarGroup,
  Sub: MenubarSub,
  SubContent: MenubarSubContent,
  SubTrigger: MenubarSubTrigger,
  Shortcut: MenubarShortcut,
});
