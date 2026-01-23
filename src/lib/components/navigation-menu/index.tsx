"use client";

import * as RadixNavigationMenu from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import React, { useImperativeHandle, useRef } from "react";
import useRipple from "use-ripple-hook";
import { Typography } from "../typography";

// --- CVA Variants ---
export const navigationMenuTriggerStyle = cva(
  // Added z-0 and bloom effect
  "group inline-flex h-10 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-semibold transition-colors focus:bg-graphite-secondary focus:outline-none focus:ring-2 focus:ring-graphite-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-graphite-secondary/50 data-[state=open]:bg-graphite-secondary/50 relative z-0 overflow-hidden " +
    "after:absolute after:inset-0 after:z-[-1] after:bg-graphite-secondary after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out " +
    "hover:after:opacity-100 hover:after:scale-100"
);

// --- NEW: CVA for ContentItem ---
const contentItemVariants = cva([
  "relative block w-full select-none space-y-1 rounded-lg p-3 text-left leading-none no-underline outline-none transition-colors duration-150 ease-in-out overflow-hidden z-0",
  "focus:bg-graphite-secondary",
  "focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-card",
  // Bloom effect
  "after:absolute after:inset-0 after:z-[-1] after:bg-graphite-secondary after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out",
  "hover:after:opacity-100 hover:after:scale-100",
]);

// --- Core Components (Unchanged) ---
const NavigationMenuRoot = React.forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.Root>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Root>
>(({ className, children, ...props }, ref) => (
  <RadixNavigationMenu.Root
    ref={ref}
    className={clsx(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </RadixNavigationMenu.Root>
));
NavigationMenuRoot.displayName = RadixNavigationMenu.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.List>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.List>
>(({ className, ...props }, ref) => (
  <RadixNavigationMenu.List
    ref={ref}
    className={clsx(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
));
NavigationMenuList.displayName = RadixNavigationMenu.List.displayName;

const NavigationMenuItem = RadixNavigationMenu.Item;

// --- Trigger ---
const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixNavigationMenu.Trigger
    ref={ref}
    className={clsx(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    <span className="relative z-10 flex items-center">
      {children}
      <ChevronDown
        className="relative top-[1px] ml-1 h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </span>
  </RadixNavigationMenu.Trigger>
));
NavigationMenuTrigger.displayName = RadixNavigationMenu.Trigger.displayName;

// --- Content (Unchanged) ---
const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.Content>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Content>
>(({ className, ...props }, ref) => (
  <RadixNavigationMenu.Content
    ref={ref}
    className={clsx(
      "left-0 top-0 w-full data-[motion^=from-]:animate-nav-enter-from data-[motion^=to-]:animate-nav-exit-to data-[motion=from-end]:animate-nav-enter-from-right data-[motion=from-start]:animate-nav-enter-from-left data-[motion=to-end]:animate-nav-exit-to-right data-[motion=to-start]:animate-nav-exit-to-left md:absolute md:w-auto",
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = RadixNavigationMenu.Content.displayName;

const NavigationMenuLink = RadixNavigationMenu.Link;

// --- ContentList Component ---
const NavigationMenuContentList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & {
    grid?: "cols-1" | "cols-2" | "cols-3";
  }
>(({ className, grid = "cols-1", ...props }, ref) => {
  const gridClasses = {
    "cols-1": "md:grid-cols-1",
    "cols-2": "md:grid-cols-2",
    "cols-3": "md:grid-cols-3",
  };
  return (
    <ul
      ref={ref}
      className={clsx(
        "grid gap-3 p-4",
        "w-[400px]",
        gridClasses[grid],
        className
      )}
      {...props}
    />
  );
});
NavigationMenuContentList.displayName = "NavigationMenu.ContentList";

// --- ContentItem Component ---
interface ContentItemProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof NavigationMenuLink>,
    "title"
  > {
  title: React.ReactNode;
  startIcon?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const NavigationMenuContentItem = React.forwardRef<
  React.ElementRef<typeof NavigationMenuLink>,
  ContentItemProps
>(
  (
    {
      className,
      title,
      children,
      startIcon,
      endAdornment,
      onPointerDown,
      ...props
    },
    ref
  ) => {
    const localRef = useRef<HTMLAnchorElement>(null);
    useImperativeHandle(ref, () => localRef.current as HTMLAnchorElement);
    const [, event] = useRipple({
      ref: localRef,
      color: "var(--color-ripple-light)",
      duration: 400,
    });

    return (
      <li>
        <NavigationMenuLink
          ref={localRef}
          onPointerDown={(e) => {
            event(e);
            onPointerDown?.(e);
          }}
          className={contentItemVariants({ className })}
          {...props}
        >
          <div className="flex items-start gap-4 relative z-10">
            {startIcon && (
              <div className="mt-0.5 text-graphite-primary flex-shrink-0">
                {startIcon}
              </div>
            )}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <Typography
                  variant="small"
                  className="font-semibold !leading-none"
                >
                  {title}
                </Typography>
                {endAdornment}
              </div>
              {children && (
                <Typography
                  variant="muted"
                  className="!text-sm !leading-snug line-clamp-2"
                >
                  {children}
                </Typography>
              )}
            </div>
          </div>
        </NavigationMenuLink>
      </li>
    );
  }
);
NavigationMenuContentItem.displayName = "NavigationMenu.ContentItem";

// --- Viewport & Indicator (Unchanged) ---
const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.Viewport>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Viewport>
>(({ className, ...props }, ref) => (
  <div className={clsx("absolute left-0 top-full flex justify-center")}>
    <RadixNavigationMenu.Viewport
      className={clsx(
        "origin-top-center relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-xl border border-graphite-border bg-graphite-card text-graphite-foreground shadow-lg data-[state=open]:animate-nav-scale-in data-[state=closed]:animate-nav-scale-out md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = RadixNavigationMenu.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof RadixNavigationMenu.Indicator>,
  React.ComponentPropsWithoutRef<typeof RadixNavigationMenu.Indicator>
>(({ className, ...props }, ref) => (
  <RadixNavigationMenu.Indicator
    ref={ref}
    className={clsx(
      "top-full z-[1] flex h-2.5 items-end justify-center overflow-hidden data-[state=visible]:animate-nav-fade-in data-[state=hidden]:animate-nav-fade-out",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-3 w-3 rotate-45 rounded-tl-sm bg-graphite-border" />
  </RadixNavigationMenu.Indicator>
));
NavigationMenuIndicator.displayName = RadixNavigationMenu.Indicator.displayName;

// --- Compound Export ---
export const NavigationMenu = Object.assign(NavigationMenuRoot, {
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Content: NavigationMenuContent,
  Trigger: NavigationMenuTrigger,
  Link: NavigationMenuLink,
  Indicator: NavigationMenuIndicator,
  Viewport: NavigationMenuViewport,
  ContentList: NavigationMenuContentList,
  ContentItem: NavigationMenuContentItem,
});
