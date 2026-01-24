"use client";

import * as RadixContextMenu from "@radix-ui/react-context-menu";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import React, { createContext, useContext, useRef } from "react";
import useRipple from "use-ripple-hook";
import { useTheme } from "../../context";

type ContextMenuShape = "full" | "minimal" | "sharp";
type ContextMenuSize = "sm" | "md" | "lg";

interface ContextMenuContextProps {
  shape: ContextMenuShape;
  size: ContextMenuSize;
}

const ContextMenuContext = createContext<ContextMenuContextProps>({
  shape: "minimal",
  size: "md",
});

const useContextMenuContext = () => useContext(ContextMenuContext);

const contentVariants = cva(
  [
    "z-50 min-w-[12rem] max-h-[var(--radix-context-menu-content-available-height)] overflow-y-auto overflow-x-hidden",
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

const itemVariants = cva(
  [
    "relative flex cursor-pointer select-none items-center gap-2 rounded-lg outline-none overflow-hidden z-0",
    "transition-colors duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
    "focus:bg-secondary-container/60 data-[highlighted]:bg-secondary-container/60",
    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/20",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-38",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/60 after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out",
    "hover:after:opacity-100 hover:after:scale-100",
  ],
  {
    variants: {
      size: {
        sm: "px-2 py-1.5 text-xs",
        md: "px-3 py-2.5 text-sm",
        lg: "px-4 py-3 text-base",
      },
      shape: {
        full: "",
        minimal: "",
        sharp: "!rounded-none",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

interface ContextMenuProps extends RadixContextMenu.ContextMenuProps {
  shape?: ContextMenuShape;
  size?: ContextMenuSize;
}

const ContextMenuRoot: React.FC<ContextMenuProps> = ({
  shape = "minimal",
  size = "md",
  ...props
}) => {
  return (
    <ContextMenuContext.Provider value={{ shape, size }}>
      <RadixContextMenu.Root {...props} />
    </ContextMenuContext.Provider>
  );
};

const ContextMenuTrigger = RadixContextMenu.Trigger;
const ContextMenuGroup = RadixContextMenu.Group;
const ContextMenuPortal = RadixContextMenu.Portal;
const ContextMenuSub = RadixContextMenu.Sub;
const ContextMenuRadioGroup = RadixContextMenu.RadioGroup;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Content>
>(({ className, ...props }, ref) => {
  const { shape } = useContextMenuContext();
  return (
    <RadixContextMenu.Portal>
      <RadixContextMenu.Content
        ref={ref}
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
    </RadixContextMenu.Portal>
  );
});
ContextMenuContent.displayName = RadixContextMenu.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Item>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => {
  const { shape, size } = useContextMenuContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixContextMenu.Item
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemVariants({ size, shape }),
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2 w-full">
        {props.children}
      </span>
    </RadixContextMenu.Item>
  );
});
ContextMenuItem.displayName = RadixContextMenu.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.CheckboxItem>
>(({ className, children, ...props }, ref) => {
  const { shape, size } = useContextMenuContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixContextMenu.CheckboxItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(itemVariants({ size, shape }), "pl-8", className)}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center z-10">
        <RadixContextMenu.ItemIndicator>
          <Check className="h-4 w-4 animate-check-in text-primary" />
        </RadixContextMenu.ItemIndicator>
      </span>
      <span className="relative z-10">{children}</span>
    </RadixContextMenu.CheckboxItem>
  );
});
ContextMenuCheckboxItem.displayName = RadixContextMenu.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.RadioItem>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.RadioItem>
>(({ className, children, ...props }, ref) => {
  const { shape, size } = useContextMenuContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixContextMenu.RadioItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(itemVariants({ size, shape }), "pl-8", className)}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center z-10">
        <RadixContextMenu.ItemIndicator>
          <Circle className="h-2 w-2 fill-current animate-check-in text-primary" />
        </RadixContextMenu.ItemIndicator>
      </span>
      <span className="relative z-10">{children}</span>
    </RadixContextMenu.RadioItem>
  );
});
ContextMenuRadioItem.displayName = RadixContextMenu.RadioItem.displayName;

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, children, inset, ...props }, ref) => {
  const { shape, size } = useContextMenuContext();
  const localRef = useRef<HTMLDivElement>(null);
  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });
  React.useImperativeHandle(ref, () => localRef.current!);

  return (
    <RadixContextMenu.SubTrigger
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemVariants({ size, shape }),
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex flex-1 items-center gap-2">
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
      </span>
    </RadixContextMenu.SubTrigger>
  );
});
ContextMenuSubTrigger.displayName = RadixContextMenu.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.SubContent>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.SubContent>
>(({ className, ...props }, ref) => {
  const { shape } = useContextMenuContext();
  return (
    <RadixContextMenu.SubContent
      ref={ref}
      className={clsx(
        contentVariants({ shape }),
        "data-[state=open]:data-[side=right]:animate-submenu-enter-right",
        "data-[state=closed]:data-[side=right]:animate-submenu-exit-right",
        "data-[state=open]:data-[side=left]:animate-submenu-enter-left",
        "data-[state=closed]:data-[side=left]:animate-submenu-exit-left",
        className,
      )}
      {...props}
    />
  );
});
ContextMenuSubContent.displayName = RadixContextMenu.SubContent.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Label>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <RadixContextMenu.Label
    ref={ref}
    className={clsx(
      "px-3 py-2 text-xs font-medium text-on-surface-variant tracking-wide",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
ContextMenuLabel.displayName = RadixContextMenu.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof RadixContextMenu.Separator>,
  React.ComponentPropsWithoutRef<typeof RadixContextMenu.Separator>
>(({ className, ...props }, ref) => (
  <RadixContextMenu.Separator
    ref={ref}
    className={clsx("-mx-1 my-1.5 h-px bg-outline-variant", className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = RadixContextMenu.Separator.displayName;

const ContextMenuShortcut = ({
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
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  Label: ContextMenuLabel,
  Separator: ContextMenuSeparator,
  Shortcut: ContextMenuShortcut,
  Group: ContextMenuGroup,
  Portal: ContextMenuPortal,
  Sub: ContextMenuSub,
  SubContent: ContextMenuSubContent,
  SubTrigger: ContextMenuSubTrigger,
});
