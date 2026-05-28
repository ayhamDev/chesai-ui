"use client";

import * as RadixNavigationMenu from "@radix-ui/react-navigation-menu";
import { clsx } from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import useRipple from "use-ripple-hook";
import { useTheme } from "../../context";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "../dropdown-menu";

// Tracks how deep we are in the sub-menus
const MenubarDepthContext = createContext<number>(0);
const useMenubarDepth = () => useContext(MenubarDepthContext);

const MenubarRadioContext = createContext({
  value: "",
  onValueChange: (v: string) => {},
});

type MenubarShape = "full" | "minimal" | "sharp";

interface MenubarContextProps {
  shape: MenubarShape;
  isClickMode: boolean;
  setIsClickMode: (val: boolean) => void;
  closeMenu: () => void;
}
const MenubarContext = createContext<MenubarContextProps>({
  shape: "minimal",
  isClickMode: false,
  setIsClickMode: () => {},
  closeMenu: () => {},
});
const useMenubarContext = () => useContext(MenubarContext);

const itemStyles =
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none overflow-hidden " +
  "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] z-0 " +
  "focus:bg-secondary-container/60 hover:bg-surface-container-highest/50 data-[highlighted]:bg-secondary-container/60 " +
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/20 " +
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-38 " +
  "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/60 after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out " +
  "hover:after:opacity-100 hover:after:scale-100";

interface MenubarProps extends React.ComponentPropsWithoutRef<
  typeof RadixNavigationMenu.Root
> {
  shape?: MenubarShape;
}

const MenubarRoot = React.forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.Root>,
  MenubarProps
>(({ className, shape = "minimal", children, ...props }, ref) => {
  const [value, setValue] = useState("");
  const [isClickMode, setIsClickMode] = useState(false);

  // Expose a helper to let deep sub-menus instantly close the root navigation menu
  const closeMenu = useCallback(() => {
    setValue("");
    setIsClickMode(false);
  }, []);

  return (
    <MenubarContext.Provider
      value={{ shape, isClickMode, setIsClickMode, closeMenu }}
    >
      <MenubarDepthContext.Provider value={0}>
        <RadixNavigationMenu.Root
          ref={ref}
          value={value}
          onValueChange={(val) => {
            setValue(val);
            // If the menu closes entirely, reset the click mode
            if (!val) setIsClickMode(false);
          }}
          className={clsx(
            "relative z-10 flex h-10 w-max items-center space-x-1 rounded-lg bg-transparent p-1",
            className,
          )}
          {...props}
        >
          <RadixNavigationMenu.List className="flex items-center space-x-1">
            {children}
          </RadixNavigationMenu.List>
          <div className="absolute left-0 top-full flex justify-start">
            <RadixNavigationMenu.Viewport
              className={clsx(
                "origin-top-left relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden border border-outline-variant bg-surface-container text-on-surface shadow-lg transition-[width,height] duration-300 data-[state=open]:animate-nav-scale-in data-[state=closed]:animate-nav-scale-out sm:w-[var(--radix-navigation-menu-viewport-width)]",
                shape === "full"
                  ? "rounded-3xl"
                  : shape === "minimal"
                    ? "rounded-xl"
                    : "rounded-none",
              )}
            />
          </div>
        </RadixNavigationMenu.Root>
      </MenubarDepthContext.Provider>
    </MenubarContext.Provider>
  );
});
MenubarRoot.displayName = "Menubar";

const MenubarMenu = RadixNavigationMenu.Item;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Trigger>
>(({ className, children, ...props }, ref) => {
  const { isClickMode, setIsClickMode } = useMenubarContext();

  return (
    <RadixNavigationMenu.Trigger
      ref={ref}
      onPointerEnter={(e) => {
        // Prevent opening on hover UNLESS a menu is already clicked open
        if (!isClickMode) e.preventDefault();
        props.onPointerEnter?.(e);
      }}
      onPointerMove={(e) => {
        if (!isClickMode) e.preventDefault();
        props.onPointerMove?.(e);
      }}
      onClick={(e) => {
        // Activate click mode so siblings can open on hover
        setIsClickMode(true);
        props.onClick?.(e);
      }}
      className={clsx(
        "flex cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-sm font-semibold outline-none text-on-surface relative z-0 overflow-hidden",
        "transition-colors duration-150 ease-in-out",
        "focus:bg-surface-container-highest",
        "data-[state=open]:bg-surface-container-highest",
        "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out",
        "hover:after:opacity-100 hover:after:scale-100 hover:bg-surface-container-highest/50",
        className,
      )}
      {...props}
    >
      {children}
    </RadixNavigationMenu.Trigger>
  );
});
MenubarTrigger.displayName = "Menubar.Trigger";

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Content>
>(({ className, children, ...props }, ref) => {
  const { closeMenu } = useMenubarContext();

  return (
    <RadixNavigationMenu.Content
      ref={ref}
      onFocusOutside={(e) => {
        // Prevent sub-dropdowns from stealing focus and closing the root menu
        e.preventDefault();
        props.onFocusOutside?.(e);
      }}
      onInteractOutside={(e) => {
        const target = e.target as HTMLElement;
        // Don't close root if clicking inside a dropdown menu portal
        if (
          target.closest('[role="menu"]') ||
          target.closest("[data-radix-popper-content-wrapper]")
        ) {
          e.preventDefault();
        } else {
          // It's a genuine outside click, close the menu fully
          closeMenu();
        }
        props.onInteractOutside?.(e);
      }}
      className={clsx(
        "flex flex-col p-1.5 w-auto min-w-[12rem] outline-none",
        "data-[motion^=from-]:animate-nav-enter-from data-[motion^=to-]:animate-nav-exit-to",
        "data-[motion=from-end]:animate-nav-enter-from-right data-[motion=from-start]:animate-nav-enter-from-left",
        "data-[motion=to-end]:animate-nav-exit-to-right data-[motion=to-start]:animate-nav-exit-to-left",
        "absolute top-0 left-0",
        className,
      )}
      {...props}
    >
      <MenubarDepthContext.Provider value={1}>
        {children}
      </MenubarDepthContext.Provider>
    </RadixNavigationMenu.Content>
  );
});
MenubarContent.displayName = "Menubar.Content";

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => {
  const depth = useMenubarDepth();
  const { shape, closeMenu } = useMenubarContext();
  const { theme } = useTheme();

  const localRef = useRef<HTMLButtonElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color:
      theme === "dark"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)",
    duration: 400,
  });

  React.useImperativeHandle(ref, () => localRef.current as any);

  if (depth === 1) {
    return (
      <RadixNavigationMenu.Link asChild>
        <button
          ref={localRef}
          onPointerDown={event}
          onClick={(e) => {
            closeMenu();
            props.onClick?.(e as any);
          }}
          className={clsx(
            itemStyles,
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            inset && "pl-8",
            shape === "sharp" && "!rounded-none",
            className,
          )}
          {...(props as any)}
        />
      </RadixNavigationMenu.Link>
    );
  }

  return (
    <DropdownMenuItem
      ref={ref as any}
      inset={inset}
      className={className}
      onSelect={(e) => {
        closeMenu();
        props.onSelect?.(e);
      }}
      {...props}
    />
  );
});
MenubarItem.displayName = "Menubar.Item";

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSeparator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuSeparator>
>(({ className, ...props }, ref) => {
  const depth = useMenubarDepth();
  if (depth === 1) {
    return (
      <div
        ref={ref as any}
        className={clsx("-mx-1 my-1.5 h-px bg-outline-variant", className)}
        {...props}
      />
    );
  }
  return (
    <DropdownMenuSeparator ref={ref as any} className={className} {...props} />
  );
});
MenubarSeparator.displayName = "Menubar.Separator";

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuLabel>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuLabel> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => {
  const depth = useMenubarDepth();
  if (depth === 1) {
    return (
      <div
        ref={ref as any}
        className={clsx(
          "px-3 py-2 text-xs font-medium text-on-surface-variant tracking-wide",
          inset && "pl-8",
          className,
        )}
        {...props}
      />
    );
  }
  return (
    <DropdownMenuLabel
      ref={ref as any}
      inset={inset}
      className={className}
      {...props}
    />
  );
});
MenubarLabel.displayName = "Menubar.Label";

const MenubarSub = (
  props: React.ComponentPropsWithoutRef<typeof DropdownMenuSub>,
) => {
  const depth = useMenubarDepth();
  const { shape } = useMenubarContext();

  if (depth === 1) {
    return (
      <MenubarDepthContext.Provider value={depth + 1}>
        <DropdownMenu shape={shape} modal={false} {...props} />
      </MenubarDepthContext.Provider>
    );
  }

  return (
    <MenubarDepthContext.Provider value={depth + 1}>
      <DropdownMenuSub {...props} />
    </MenubarDepthContext.Provider>
  );
};

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuSubTrigger> & {
    inset?: boolean;
  }
>(({ className, children, inset, ...props }, ref) => {
  const depth = useMenubarDepth();
  const { shape } = useMenubarContext();
  const { theme } = useTheme();

  const localRef = useRef<HTMLButtonElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color:
      theme === "dark"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)",
    duration: 400,
  });

  React.useImperativeHandle(ref, () => localRef.current as any);

  if (depth === 2) {
    return (
      <DropdownMenuTrigger asChild>
        <button
          ref={localRef}
          onPointerDown={event as any}
          className={clsx(
            itemStyles,
            "data-[state=open]:bg-secondary-container/60",
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            inset && "pl-8",
            shape === "sharp" && "!rounded-none",
            className,
          )}
          {...(props as any)}
        >
          <span className="relative z-10 flex flex-1 items-center gap-2">
            {children}
            <ChevronRight className="ml-auto h-4 w-4" />
          </span>
        </button>
      </DropdownMenuTrigger>
    );
  }

  return (
    <DropdownMenuSubTrigger
      ref={ref as any}
      inset={inset}
      className={className}
      {...props}
    >
      {children}
    </DropdownMenuSubTrigger>
  );
});
MenubarSubTrigger.displayName = "Menubar.SubTrigger";

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuSubContent>
>(({ className, ...props }, ref) => {
  const depth = useMenubarDepth();
  const { shape } = useMenubarContext();

  if (depth === 2) {
    return (
      <DropdownMenuContent
        ref={ref as any}
        side="right"
        sideOffset={12}
        align="start"
        className={className}
        {...props}
      />
    );
  }

  return (
    <DropdownMenuSubContent ref={ref as any} className={className} {...props} />
  );
});
MenubarSubContent.displayName = "Menubar.SubContent";

const MenubarPortal = DropdownMenuPortal;

const MenubarShortcut = ({
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
MenubarShortcut.displayName = "MenubarShortcut";

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuCheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuCheckboxItem> & {
    inset?: boolean;
  }
>(({ className, children, checked, onCheckedChange, inset, ...props }, ref) => {
  const depth = useMenubarDepth();
  const { shape, closeMenu } = useMenubarContext();
  const { theme } = useTheme();

  const localRef = useRef<HTMLButtonElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color:
      theme === "dark"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)",
    duration: 400,
  });

  React.useImperativeHandle(ref, () => localRef.current as any);

  if (depth === 1) {
    return (
      <RadixNavigationMenu.Link asChild>
        <button
          ref={localRef}
          onPointerDown={event}
          className={clsx(
            itemStyles,
            "pl-8 pr-3",
            shape === "sharp" && "!rounded-none",
            className,
          )}
          onClick={(e) => {
            onCheckedChange?.(!checked);
            closeMenu();
            props.onClick?.(e as any);
          }}
          {...(props as any)}
        >
          <span className="absolute left-2 flex h-4 w-4 items-center justify-center z-10">
            {checked && (
              <Check className="h-4 w-4 animate-check-in text-primary" />
            )}
          </span>
          <span className="relative z-10">{children}</span>
        </button>
      </RadixNavigationMenu.Link>
    );
  }

  return (
    <DropdownMenuCheckboxItem
      ref={ref as any}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={className}
      onSelect={(e) => {
        closeMenu();
        props.onSelect?.(e);
      }}
      {...props}
    >
      {children}
    </DropdownMenuCheckboxItem>
  );
});
MenubarCheckboxItem.displayName = "Menubar.CheckboxItem";

const MenubarRadioGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DropdownMenuRadioGroup>
>(({ value, onValueChange, children, ...props }, ref) => {
  const depth = useMenubarDepth();
  if (depth === 1) {
    return (
      <MenubarRadioContext.Provider
        value={{
          value: value || "",
          onValueChange: onValueChange || (() => {}),
        }}
      >
        <div ref={ref} {...props}>
          {children}
        </div>
      </MenubarRadioContext.Provider>
    );
  }
  return (
    <DropdownMenuRadioGroup
      ref={ref as any}
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      {children}
    </DropdownMenuRadioGroup>
  );
});
MenubarRadioGroup.displayName = "Menubar.RadioGroup";

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuRadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuRadioItem> & {
    inset?: boolean;
  }
>(({ className, children, value, inset, ...props }, ref) => {
  const depth = useMenubarDepth();
  const { shape, closeMenu } = useMenubarContext();
  const radioContext = useContext(MenubarRadioContext);
  const { theme } = useTheme();

  const localRef = useRef<HTMLButtonElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color:
      theme === "dark"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)",
    duration: 400,
  });

  React.useImperativeHandle(ref, () => localRef.current as any);

  if (depth === 1) {
    const checked = radioContext.value === value;
    return (
      <RadixNavigationMenu.Link asChild>
        <button
          ref={localRef}
          onPointerDown={event}
          className={clsx(
            itemStyles,
            "pl-8 pr-3",
            shape === "sharp" && "!rounded-none",
            className,
          )}
          onClick={(e) => {
            radioContext.onValueChange(value);
            closeMenu();
            props.onClick?.(e as any);
          }}
          {...(props as any)}
        >
          <span className="absolute left-2 flex h-4 w-4 items-center justify-center z-10">
            {checked && (
              <Circle className="h-2 w-2 fill-current animate-check-in text-primary" />
            )}
          </span>
          <span className="relative z-10">{children}</span>
        </button>
      </RadixNavigationMenu.Link>
    );
  }

  return (
    <DropdownMenuRadioItem
      ref={ref as any}
      value={value}
      className={className}
      onSelect={(e) => {
        closeMenu();
        props.onSelect?.(e);
      }}
      {...props}
    >
      {children}
    </DropdownMenuRadioItem>
  );
});
MenubarRadioItem.displayName = "Menubar.RadioItem";

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
  Sub: MenubarSub,
  SubContent: MenubarSubContent,
  SubTrigger: MenubarSubTrigger,
  Shortcut: MenubarShortcut,
});
