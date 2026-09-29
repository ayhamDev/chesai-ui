"use client";
import { useDirection } from "../../context/direction";

import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import React, { createContext, useContext, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import useRipple from "../../hooks/useRipple";
import { useMenuKeyboardNavigation } from "../../hooks/useMenuKeyboardNavigation";
import { overlayBlurClasses, type OverlayBlur } from "../../utils/overlay";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { triggerCutout } from "./trigger-cutout";

type DropdownMenuShape = "full" | "minimal" | "sharp";

interface DropdownMenuContextProps {
  shape: DropdownMenuShape;
  glass: boolean;
  bordered: boolean;
  overlay: boolean;
  overlayClassName?: string;
  open: boolean;
  overlayBlur: OverlayBlur;
  keyboardNavigation: boolean;
  trigger: HTMLButtonElement | null;
  setTrigger: (node: HTMLButtonElement | null) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextProps>({
  shape: "minimal",
  glass: false,
  bordered: false,
  overlay: false,
  open: false,
  overlayBlur: "xs",
  keyboardNavigation: false,
  trigger: null,
  setTrigger: () => {},
});

const useDropdownMenuContext = () => useContext(DropdownMenuContext);

export interface DropdownMenuProps extends RadixDropdownMenu.DropdownMenuProps {
  shape?: DropdownMenuShape;
  glass?: boolean;
  /** Show an outer popup border. Defaults to false. */
  bordered?: boolean;
  /** Dim the page behind the menu. Outside dismissal still follows the content's Radix handlers. */
  overlay?: boolean;
  /** Customize the backdrop color, opacity or blur. */
  overlayClassName?: string;
  overlayBlur?: OverlayBlur;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  shape = "minimal",
  glass = false,
  bordered = false,
  overlay = false,
  overlayClassName,
  overlayBlur = "xs",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const keyboardNavigation = useMenuKeyboardNavigation();
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null);
  return (
    <DropdownMenuContext.Provider
      value={{
        shape,
        glass,
        bordered,
        overlay,
        overlayClassName,
        overlayBlur,
        open,
        keyboardNavigation,
        trigger,
        setTrigger,
      }}
    >
      <RadixDropdownMenu.Root
        {...props}
        open={open}
        onOpenChange={(next) => {
          if (controlledOpen === undefined) setInternalOpen(next);
          onOpenChange?.(next);
        }}
        dir={useDirection(undefined, props.dir)}
      />
    </DropdownMenuContext.Provider>
  );
};

const contentVariants = cva(
  [
    "z-50 min-w-[12rem] max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto overflow-x-hidden",
    "text-on-surface p-1.5",
    "shadow-md",
  ],
  {
    variants: {
      bordered: { true: "border border-outline-variant", false: "border-0" },
      shape: {
        full: "rounded-3xl",
        minimal: "rounded-xl",
        sharp: "rounded-none",
      },
      glass: {
        true: "bg-surface-container/60 backdrop-blur-xl",
        false: "bg-surface-container",
      },
    },
    defaultVariants: {
      shape: "minimal",
      glass: false,
    },
  },
);

const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Trigger>
>(({ style, ...props }, ref) => {
  const { overlay, open, setTrigger } = useDropdownMenuContext();
  const composedRef = React.useCallback((node: HTMLButtonElement | null) => {
    setTrigger(node);
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref, setTrigger]);
  return <RadixDropdownMenu.Trigger {...props} ref={composedRef}
    style={{ ...style, ...(overlay && open ? { pointerEvents: "auto" as const } : {}) }} />;
});
DropdownMenuTrigger.displayName = RadixDropdownMenu.Trigger.displayName;

// A cutout keeps the real trigger sharp and interactive even inside an isolated
// or transformed ancestor. Raising its z-index cannot escape those ancestors.
function DropdownMenuBackdrop() {
  const { trigger, overlayClassName, overlayBlur } = useDropdownMenuContext();
  const reducedMotion = useReducedMotion();
  const [clipPath, setClipPath] = useState<string>();
  React.useLayoutEffect(() => {
    if (!trigger) return;
    let frame = 0;
    let previous = "";
    const update = () => {
      const next = triggerCutout(trigger);
      if (next !== previous) {
        previous = next;
        setClipPath(next || undefined);
      }
      // Follow layout animations as well as scrolling and viewport changes.
      frame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frame);
  }, [trigger]);
  return <motion.div aria-hidden="true" data-dropdown-menu-overlay=""
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: "none" }}
    transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.2, 0, 0, 1] }}
    className={twMerge("fixed inset-0 z-50 bg-black/35", overlayBlurClasses[overlayBlur], overlayClassName)}
    style={{ pointerEvents: "auto", clipPath }} />;
}
const DropdownMenuGroup: typeof RadixDropdownMenu.Group =
  RadixDropdownMenu.Group;
const DropdownMenuPortal: typeof RadixDropdownMenu.Portal =
  RadixDropdownMenu.Portal;
const DropdownMenuSub: typeof RadixDropdownMenu.Sub = RadixDropdownMenu.Sub;
const DropdownMenuRadioGroup: typeof RadixDropdownMenu.RadioGroup =
  RadixDropdownMenu.RadioGroup;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>
>(({ className, sideOffset = 8, ...props }, ref) => {
  const {
    shape,
    glass,
    bordered,
    overlay,
    open,
    keyboardNavigation,
  } = useDropdownMenuContext();
  return (
    <>
      <AnimatePresence>
      {overlay && open && (
        <RadixDropdownMenu.Portal forceMount>
          <DropdownMenuBackdrop />
        </RadixDropdownMenu.Portal>
      )}
      </AnimatePresence>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          data-menu-keyboard={keyboardNavigation}
          ref={ref}
          sideOffset={sideOffset}
          className={twMerge(
            contentVariants({ shape, glass, bordered }),
            overlay && "z-[51]",
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
    </>
  );
}) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content> &
    React.RefAttributes<React.ElementRef<typeof RadixDropdownMenu.Content>>
>;
DropdownMenuContent.displayName = RadixDropdownMenu.Content.displayName;

// Inset radii match the popup radius minus its 0.375rem content padding.
const itemStyles =
  "relative flex cursor-pointer select-none items-center gap-2 px-3 py-2.5 text-sm outline-none overflow-hidden z-0 " +
  "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] " +
  "[[data-menu-keyboard=true]_&]:focus:ring-2 [[data-menu-keyboard=true]_&]:focus:ring-inset [[data-menu-keyboard=true]_&]:focus:ring-primary/40 " +
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
  });
  React.useImperativeHandle(ref as React.Ref<any>, () => localRef.current!);

  return (
    <RadixDropdownMenu.Item
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "ps-8",
        shape === "full"
          ? "rounded-[1.125rem]"
          : shape === "minimal"
            ? "rounded-md"
            : "rounded-none",
        className,
      )}
      {...props}
    />
  );
}) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item> & {
    inset?: boolean;
  } & React.RefAttributes<React.ElementRef<typeof RadixDropdownMenu.Item>>
>;
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
  });
  React.useImperativeHandle(ref as React.Ref<any>, () => localRef.current!);

  return (
    <RadixDropdownMenu.CheckboxItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "ps-8 pe-3",
        shape === "full"
          ? "rounded-[1.125rem]"
          : shape === "minimal"
            ? "rounded-md"
            : "rounded-none",
        className,
      )}
      {...props}
    >
      <span className="absolute start-2 flex h-4 w-4 items-center justify-center z-10">
        <RadixDropdownMenu.ItemIndicator>
          <Check className="h-4 w-4 animate-check-in text-primary" />
        </RadixDropdownMenu.ItemIndicator>
      </span>
      <span className="relative z-10">{children}</span>
    </RadixDropdownMenu.CheckboxItem>
  );
}) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.CheckboxItem> &
    React.RefAttributes<React.ElementRef<typeof RadixDropdownMenu.CheckboxItem>>
>;
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
  });
  React.useImperativeHandle(ref as React.Ref<any>, () => localRef.current!);

  return (
    <RadixDropdownMenu.RadioItem
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "ps-8 pe-3",
        shape === "full"
          ? "rounded-[1.125rem]"
          : shape === "minimal"
            ? "rounded-md"
            : "rounded-none",
        className,
      )}
      {...props}
    >
      <span className="absolute start-2 flex h-4 w-4 items-center justify-center z-10">
        <RadixDropdownMenu.ItemIndicator>
          <Circle className="h-2 w-2 fill-current animate-check-in text-primary" />
        </RadixDropdownMenu.ItemIndicator>
      </span>
      <span className="relative z-10">{children}</span>
    </RadixDropdownMenu.RadioItem>
  );
}) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.RadioItem> &
    React.RefAttributes<React.ElementRef<typeof RadixDropdownMenu.RadioItem>>
>;
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
  });
  React.useImperativeHandle(ref as React.Ref<any>, () => localRef.current!);

  return (
    <RadixDropdownMenu.SubTrigger
      ref={localRef}
      onPointerDown={event}
      className={clsx(
        itemStyles,
        "data-[state=open]:after:opacity-100 data-[state=open]:after:scale-100",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "ps-8",
        shape === "full"
          ? "rounded-[1.125rem]"
          : shape === "minimal"
            ? "rounded-md"
            : "rounded-none",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex flex-1 items-center gap-2">
        {children}
        <ChevronRight className="rtl:rotate-180 ms-auto h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-data-[state=open]:rotate-90" />
      </span>
    </RadixDropdownMenu.SubTrigger>
  );
}) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubTrigger> & {
    inset?: boolean;
  } & React.RefAttributes<React.ElementRef<typeof RadixDropdownMenu.SubTrigger>>
>;
DropdownMenuSubTrigger.displayName = RadixDropdownMenu.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof RadixDropdownMenu.SubContent>,
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubContent>
>(({ className, ...props }, ref) => {
  const { shape, glass, bordered, overlay, keyboardNavigation } =
    useDropdownMenuContext();
  return (
    <RadixDropdownMenu.SubContent
      data-menu-keyboard={keyboardNavigation}
      ref={ref}
      className={twMerge(
        contentVariants({ shape, glass, bordered }),
        overlay && "z-[51]",
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
}) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubContent> &
    React.RefAttributes<React.ElementRef<typeof RadixDropdownMenu.SubContent>>
>;
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
      inset && "ps-8",
      className,
    )}
    {...props}
  />
)) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Label> & {
    inset?: boolean;
  } & React.RefAttributes<React.ElementRef<typeof RadixDropdownMenu.Label>>
>;
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
)) as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator> &
    React.RefAttributes<React.ElementRef<typeof RadixDropdownMenu.Separator>>
>;
DropdownMenuSeparator.displayName = RadixDropdownMenu.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={clsx(
        "ms-auto text-xs font-mono tracking-wider text-on-surface-variant/50",
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
