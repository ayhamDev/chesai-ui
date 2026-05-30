"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { IconButton } from "../icon-button";
import { Sheet } from "../sheet";

// --- CONTEXT ---
interface NavbarContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
  glass: boolean;
  variant: "primary" | "secondary" | "surface" | "ghost";
  isMobile: boolean;
}

const NavbarContext = createContext<NavbarContextProps | null>(null);

export const useNavbarContext = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("Navbar components must be used within a <Navbar>");
  }
  return context;
};

// Tracks depth for nested dropdowns
const NavbarDropdownDepthContext = createContext<number>(0);

// --- VARIANTS ---
const navbarVariants = cva(
  "w-full transition-colors duration-300 flex flex-col",
  {
    variants: {
      variant: {
        primary: "bg-surface-container-low text-on-surface",
        secondary: "bg-surface-container-high text-on-surface",
        surface: "bg-surface text-on-surface",
        ghost: "bg-transparent text-on-surface",
      },
      position: {
        static: "relative z-40",
        sticky: "sticky top-0 z-40",
        fixed: "fixed top-0 inset-x-0 z-50",
      },
      bordered: {
        true: "border-b border-outline-variant",
        false: "border-none",
      },
      glass: {
        true: "backdrop-blur-xl bg-opacity-80 dark:bg-opacity-80",
        false: "",
      },
    },
    defaultVariants: {
      variant: "surface",
      position: "sticky",
      bordered: true,
      glass: true,
    },
  },
);

const itemVariants = cva(
  "relative flex items-center text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      activeVariant: {
        text: "hover:text-primary",
        pill: "px-3 py-1.5 rounded-full hover:bg-surface-container-highest",
        underline: "hover:text-primary py-1 h-full",
        bordered:
          "px-3 py-1.5 rounded-lg border border-transparent hover:bg-surface-container-highest",
      },
      isActive: { true: "", false: "" },
    },
    compoundVariants: [
      {
        activeVariant: "text",
        isActive: true,
        className: "text-primary font-semibold",
      },
      {
        activeVariant: "text",
        isActive: false,
        className: "text-on-surface-variant",
      },
      {
        activeVariant: "pill",
        isActive: true,
        className:
          "bg-secondary-container text-on-secondary-container font-semibold",
      },
      {
        activeVariant: "pill",
        isActive: false,
        className: "text-on-surface-variant",
      },
      {
        activeVariant: "underline",
        isActive: true,
        className:
          "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:rounded-full",
      },
      {
        activeVariant: "underline",
        isActive: false,
        className: "text-on-surface-variant",
      },
      {
        activeVariant: "bordered",
        isActive: true,
        className:
          "border-outline-variant bg-surface-container-low text-on-surface font-semibold shadow-sm",
      },
      {
        activeVariant: "bordered",
        isActive: false,
        className: "text-on-surface-variant",
      },
    ],
    defaultVariants: {
      activeVariant: "text",
      isActive: false,
    },
  },
);

// --- ROOT COMPONENT ---
export interface NavbarProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navbarVariants> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  innerPadding?: "none" | "sm" | "md" | "lg";
  onMenuOpenChange?: (isOpen: boolean) => void;
  isMenuOpen?: boolean;
}

const maxWidthMap = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
};

const paddingMap = {
  none: "px-0",
  sm: "px-2 sm:px-4",
  md: "px-4 sm:px-6 lg:px-8",
  lg: "px-6 sm:px-8 lg:px-12",
};

const NavbarRoot = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      children,
      variant = "surface",
      position = "sticky",
      bordered = true,
      glass = true,
      maxWidth = "xl",
      innerPadding = "md",
      onMenuOpenChange,
      isMenuOpen: controlledIsOpen,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
    const isOpen =
      controlledIsOpen !== undefined ? controlledIsOpen : uncontrolledIsOpen;
    const isMobile = useMediaQuery("(max-width: 1024px)");

    const setIsOpen = (val: boolean) => {
      setUncontrolledIsOpen(val);
      onMenuOpenChange?.(val);
    };

    const toggle = () => setIsOpen(!isOpen);

    useEffect(() => {
      if (!isMobile && isOpen) {
        setIsOpen(false);
      }
    }, [isMobile, isOpen]);

    return (
      <NavbarContext.Provider
        value={{
          isOpen,
          setIsOpen,
          toggle,
          glass: glass || false,
          variant: variant || "surface",
          isMobile,
        }}
      >
        <header
          ref={ref}
          className={clsx(
            navbarVariants({ variant, position, bordered, glass }),
            className,
          )}
          {...props}
        >
          <div
            className={clsx(
              "flex h-16 w-full items-center mx-auto",
              maxWidthMap[maxWidth],
              paddingMap[innerPadding],
            )}
          >
            {children}
          </div>
        </header>
      </NavbarContext.Provider>
    );
  },
);
NavbarRoot.displayName = "Navbar";

// --- BRAND ---
export const NavbarBrand = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "flex items-center justify-start shrink-0 min-w-max mr-4 sm:mr-8",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
NavbarBrand.displayName = "Navbar.Brand";

// --- CONTENT (LIST) ---
const contentVariants = cva("h-full items-center gap-2 sm:gap-4 lg:gap-6", {
  variants: {
    justify: {
      start: "justify-start flex-1",
      center: "justify-center flex-1",
      end: "justify-end flex-1",
    },
  },
  defaultVariants: {
    justify: "start",
  },
});

export interface NavbarContentProps
  extends
    React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof contentVariants> {}

export const NavbarContent = React.forwardRef<
  HTMLUListElement,
  NavbarContentProps
>(({ className, justify, children, ...props }, ref) => (
  <ul
    ref={ref}
    className={clsx("hidden lg:flex", contentVariants({ justify }), className)}
    {...props}
  >
    {children}
  </ul>
));
NavbarContent.displayName = "Navbar.Content";

// --- ITEM ---
export interface NavbarItemProps
  extends
    React.LiHTMLAttributes<HTMLLIElement>,
    VariantProps<typeof itemVariants> {
  asChild?: boolean;
}

export const NavbarItem = React.forwardRef<HTMLLIElement, NavbarItemProps>(
  (
    { className, isActive, activeVariant, children, asChild, ...props },
    ref,
  ) => {
    return (
      <li
        ref={ref}
        data-active={isActive}
        className={clsx(itemVariants({ isActive, activeVariant }), className)}
        {...props}
      >
        {children}
      </li>
    );
  },
);
NavbarItem.displayName = "Navbar.Item";

// --- NESTED MENUS (DROPDOWNS) ---

export const NavbarDropdown = ({ children }: { children: React.ReactNode }) => {
  const depth = useContext(NavbarDropdownDepthContext);
  const { isMobile } = useNavbarContext();

  if (isMobile) {
    return (
      <NavbarDropdownDepthContext.Provider value={depth + 1}>
        <div className="flex flex-col w-full">{children}</div>
      </NavbarDropdownDepthContext.Provider>
    );
  }

  // Desktop uses standard DropdownMenu / SubMenu
  return (
    <NavbarDropdownDepthContext.Provider value={depth + 1}>
      {depth === 0 ? (
        <DropdownMenu>{children}</DropdownMenu>
      ) : (
        <DropdownMenuSub>{children}</DropdownMenuSub>
      )}
    </NavbarDropdownDepthContext.Provider>
  );
};

export const NavbarDropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    activeVariant?: "underline" | "pill" | "text" | "bordered";
    isActive?: boolean;
  }
>(
  (
    { children, className, activeVariant = "text", isActive, ...props },
    ref,
  ) => {
    const { isMobile } = useNavbarContext();
    const depth = useContext(NavbarDropdownDepthContext);
    const [open, setOpen] = useState(false); // Only used for mobile accordion state

    if (isMobile) {
      return (
        <button
          ref={ref}
          className={clsx(
            itemVariants({ activeVariant, isActive }),
            "justify-between w-full py-3 h-auto",
            className,
          )}
          onClick={(e) => {
            setOpen(!open);
            props.onClick?.(e);
          }}
          data-mobile-open={open}
          {...props}
        >
          {children}
          <ChevronDown
            className={clsx(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      );
    }

    if (depth > 1) {
      return (
        <DropdownMenuSubTrigger
          ref={ref}
          className={className}
          {...(props as any)}
        >
          {children}
        </DropdownMenuSubTrigger>
      );
    }

    return (
      <DropdownMenuTrigger asChild>
        <button
          ref={ref}
          className={clsx(
            itemVariants({ activeVariant, isActive }),
            "gap-1 h-full",
            className,
          )}
          {...props}
        >
          {children}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
    );
  },
);
NavbarDropdownTrigger.displayName = "Navbar.DropdownTrigger";

export const NavbarDropdownContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { isMobile } = useNavbarContext();
  const depth = useContext(NavbarDropdownDepthContext);

  if (isMobile) {
    // Find the trigger to read its open state (hacky but works since they are siblings in the wrapper)
    return (
      <div
        ref={ref}
        className={clsx(
          "flex flex-col pl-4 border-l border-outline-variant/30 ml-2 mt-1 gap-2",
          className,
        )}
        {...props}
      >
        {/* In mobile, we rely on CSS peer or sibling states, or just render it all since mobile scrolling handles it.
               For true accordion, we'd need context, but this is simple enough for CSS or state lifting. 
               Since it's a UI library, we'll keep it simple: It's always in the DOM on mobile, just styled as nested. */}
        {children}
      </div>
    );
  }

  if (depth > 1) {
    return (
      <DropdownMenuPortal>
        <DropdownMenuSubContent
          ref={ref}
          className={className}
          {...(props as any)}
        >
          {children}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    );
  }

  return (
    <DropdownMenuContent
      ref={ref}
      align="start"
      className={clsx("w-56 mt-2", className)}
      {...(props as any)}
    >
      {children}
    </DropdownMenuContent>
  );
});
NavbarDropdownContent.displayName = "Navbar.DropdownContent";

export const NavbarDropdownItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DropdownMenuItem>
>(({ children, className, ...props }, ref) => {
  const { isMobile, setIsOpen } = useNavbarContext();

  if (isMobile) {
    return (
      <div
        ref={ref as any}
        className={clsx(
          itemVariants({ activeVariant: "text" }),
          "py-2 w-full",
          className,
        )}
        onClick={(e) => {
          setIsOpen(false);
          props.onSelect?.(e as any);
          props.onClick?.(e as any);
        }}
        {...(props as any)}
      >
        {children}
      </div>
    );
  }

  return (
    <DropdownMenuItem ref={ref} className={className} {...props}>
      {children}
    </DropdownMenuItem>
  );
});
NavbarDropdownItem.displayName = "Navbar.DropdownItem";

// --- TOGGLE (MOBILE) ---
export const NavbarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof IconButton>
>(({ className, onClick, ...props }, ref) => {
  const { isOpen, toggle } = useNavbarContext();

  return (
    <IconButton
      ref={ref}
      variant="ghost"
      size="sm"
      className={clsx("lg:hidden shrink-0 ml-auto", className)}
      onClick={(e) => {
        toggle();
        onClick?.(e);
      }}
      aria-expanded={isOpen}
      aria-label="Toggle navigation menu"
      {...props}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.div>
    </IconButton>
  );
});
NavbarToggle.displayName = "Navbar.Toggle";

// --- MOBILE MENU ---
export interface NavbarMobileMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: "dropdown" | "side-sheet";
  side?: "left" | "right";
}

export const NavbarMobileMenu = React.forwardRef<
  HTMLDivElement,
  NavbarMobileMenuProps
>(
  (
    { className, children, mode = "dropdown", side = "right", ...props },
    ref,
  ) => {
    const { isOpen, setIsOpen, variant, glass } = useNavbarContext();

    if (mode === "side-sheet") {
      return (
        <Sheet
          open={isOpen}
          onOpenChange={setIsOpen}
          forceSideSheet
          side={side}
        >
          <Sheet.Content
            className="p-0 overflow-hidden flex flex-col"
            padding="none"
          >
            <div className="flex flex-col gap-4 p-6 overflow-y-auto w-full h-full">
              {children}
            </div>
          </Sheet.Content>
        </Sheet>
      );
    }

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={ref}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={clsx(
              "lg:hidden overflow-hidden w-full absolute top-full left-0 border-b border-outline-variant/50 shadow-xl",
              variant === "primary"
                ? "bg-surface-container-low"
                : variant === "secondary"
                  ? "bg-surface-container-high"
                  : "bg-surface",
              glass && "backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95",
              className,
            )}
            {...props}
          >
            <div className="flex flex-col gap-4 p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
NavbarMobileMenu.displayName = "Navbar.MobileMenu";

export const Navbar = Object.assign(NavbarRoot, {
  Brand: NavbarBrand,
  Content: NavbarContent,
  Item: NavbarItem,
  Toggle: NavbarToggle,
  MobileMenu: NavbarMobileMenu,
  Dropdown: NavbarDropdown,
  DropdownTrigger: NavbarDropdownTrigger,
  DropdownContent: NavbarDropdownContent,
  DropdownItem: NavbarDropdownItem,
});
