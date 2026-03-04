"use client";

import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import React from "react";
import { Typography } from "../typography";
import { BreadcrumbProvider, useBreadcrumbs } from "./breadcrumb-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

// --- ROOT COMPONENT ---
const BreadcrumbRoot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
BreadcrumbRoot.displayName = "Breadcrumb";

// --- LIST COMPONENT (Animated) ---
const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<typeof motion.ol>
>(({ className, ...props }, ref) => (
  <motion.ol
    ref={ref}
    layout
    className={clsx(
      "flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5",
      className,
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "Breadcrumb.List";

// --- ITEM COMPONENT (Animated) ---
const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<typeof motion.li>
>(({ className, ...props }, ref) => (
  <motion.li
    ref={ref}
    layout
    initial={{ opacity: 0, x: -10, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
    transition={{
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 1,
    }}
    className={clsx("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "Breadcrumb.Item";

// --- LINK COMPONENT ---
const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      ref={ref}
      className={clsx(
        "transition-colors text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest px-2 py-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer",
        className,
      )}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "Breadcrumb.Link";

// --- PAGE COMPONENT ---
const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <Typography
    as="span"
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    variant="label-large"
    className={clsx("font-bold text-on-surface px-2 py-1", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "Breadcrumb.Page";

// --- SEPARATOR COMPONENT ---
const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={clsx(
      "[&>svg]:w-4 [&>svg]:h-4 text-on-surface-variant/50 shrink-0 select-none",
      className,
    )}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "Breadcrumb.Separator";

// --- ELLIPSIS COMPONENT ---
const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={clsx(
      "flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-highest transition-colors",
      className,
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "Breadcrumb.Ellipsis";

// --- DYNAMIC BREADCRUMB RENDERER ---

export interface DynamicBreadcrumbProps {
  separator?: React.ReactNode;
  /** Maximum number of items to display before collapsing into an ellipsis */
  maxItems?: number;
  /** Number of items to show before the ellipsis (Default: 1) */
  itemsBeforeCollapse?: number;
  /** Number of items to show after the ellipsis (Default: 2) */
  itemsAfterCollapse?: number;
}

const DynamicBreadcrumbRenderer = ({
  separator,
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 2,
}: DynamicBreadcrumbProps) => {
  const { items } = useBreadcrumbs();

  const shouldCollapse =
    maxItems !== undefined &&
    items.length > maxItems &&
    items.length > itemsBeforeCollapse + itemsAfterCollapse;

  let renderItems = items;
  let collapsedItems: typeof items = [];

  if (shouldCollapse) {
    const before = items.slice(0, itemsBeforeCollapse);
    const after = items.slice(-itemsAfterCollapse);
    collapsedItems = items.slice(itemsBeforeCollapse, -itemsAfterCollapse);

    renderItems = [
      ...before,
      // Inject a fake item ID to represent the ellipsis
      {
        id: "system-ellipsis-placeholder",
        label: "...",
        isSystemEllipsis: true,
      },
      ...after,
    ];
  }

  return (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <AnimatePresence mode="popLayout" initial={false}>
          {renderItems.map((item, index) => {
            const isLast = index === renderItems.length - 1;
            const Component =
              isLast || item.isCurrent ? BreadcrumbPage : BreadcrumbLink;

            // Handle rendering the Ellipsis Dropdown
            if ((item as any).isSystemEllipsis) {
              return (
                <React.Fragment key={item.id}>
                  <BreadcrumbItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
                        <BreadcrumbEllipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {collapsedItems.map((cItem) => (
                          <DropdownMenuItem key={cItem.id} asChild>
                            <a
                              href={cItem.href}
                              className="flex items-center gap-2"
                            >
                              {cItem.icon && (
                                <span className="opacity-70">{cItem.icon}</span>
                              )}
                              {cItem.label}
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                  {!isLast && (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
                    </motion.div>
                  )}
                </React.Fragment>
              );
            }

            // Standard Item Rendering
            return (
              <React.Fragment key={item.id}>
                <BreadcrumbItem>
                  <Component href={item.href}>
                    <span className="flex items-center gap-2">
                      {item.icon && (
                        <span className="shrink-0">{item.icon}</span>
                      )}
                      {item.label}
                    </span>
                  </Component>
                </BreadcrumbItem>
                {!isLast && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
};

export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Provider: BreadcrumbProvider,
  Dynamic: DynamicBreadcrumbRenderer,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
  useBreadcrumbs,
});

export {
  BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
