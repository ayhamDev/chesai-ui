"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import React, { createContext, useContext, useRef, useState } from "react";
import useRipple from "use-ripple-hook";
import { IconButton } from "../icon-button";
import { Sheet } from "../sheet";
import { EASING } from "../stack-router/transitions";

// --- Types ---
type SidebarState = "expanded" | "collapsed";
type SidebarSize = "sm" | "md" | "lg";
type SidebarShape = "sharp" | "minimal" | "full";
type SidebarVariant = "primary" | "secondary" | "ghost";

// --- Context ---
interface SidebarContextProps {
  state: SidebarState;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarState: (state: SidebarState) => void;
  isMobile: boolean;
  size: SidebarSize;
  shape: SidebarShape;
  variant: SidebarVariant; // Added variant to context
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
};

// --- Provider ---
export const SidebarProvider = ({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [state, setState] = useState<SidebarState>(
    defaultOpen ? "expanded" : "collapsed"
  );
  const [openMobile, setOpenMobile] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"));
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        state,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        setSidebarState: setState,
        isMobile,
        size: "md",
        shape: "minimal",
        variant: "primary", // Default
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// --- Sidebar Root ---
const sidebarVariants = cva(
  "group/sidebar flex flex-col overflow-hidden transition-all duration-300 ease-ios text-graphite-foreground",
  {
    variants: {
      layout: {
        sidebar: "border-r border-graphite-border",
        floating: "m-4 border-graphite-border shadow-lg h-[calc(100%-2rem)]",
        inset: "bg-transparent",
      },
      variant: {
        primary: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
        ghost: "bg-transparent",
      },
      shape: {
        sharp: "rounded-none",
        minimal: "rounded-2xl",
        full: "rounded-3xl",
      },
      overlay: {
        true: "absolute top-0 left-0 z-50 h-full shadow-xl border-r border-graphite-border",
        false: "relative h-full",
      },
    },
    defaultVariants: {
      layout: "sidebar",
      variant: "primary",
      shape: "minimal",
      overlay: false,
    },
  }
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsible?: boolean;
  /** Width of the sidebar when expanded on desktop. @default "16rem" */
  width?: string;
  /** Width of the sidebar when collapsed on desktop. @default "4.5rem" */
  collapsedWidth?: string;
  /** Width of the sidebar sheet on mobile. @default "18rem" */
  mobileWidth?: string;
  itemSize?: SidebarSize;
  itemShape?: SidebarShape;
  /** If true, the sidebar will expand when hovered and collapse when the mouse leaves. */
  expandOnHover?: boolean;
  /** If true, the expanded sidebar floats over content. A placeholder is kept for the collapsed width. */
  overlay?: boolean;
}

const SidebarRoot = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      children,
      layout,
      variant = "primary",
      shape,
      itemSize = "md",
      itemShape = "minimal",
      width = "16rem",
      collapsedWidth = "4.5rem",
      mobileWidth = "18rem",
      collapsible = true,
      expandOnHover = false,
      overlay = false,
      ...props
    },
    ref
  ) => {
    const {
      state,
      setSidebarState,
      toggleSidebar,
      isMobile,
      openMobile,
      setOpenMobile,
    } = useSidebar();
    const isCollapsed = state === "collapsed";

    // --- MOBILE RENDERING (SHEET) ---
    if (isMobile) {
      return (
        <Sheet
          open={openMobile}
          onOpenChange={setOpenMobile}
          forceSideSheet
          side="left"
        >
          <Sheet.Content
            className="p-0"
            style={{ width: mobileWidth, maxWidth: "100vw" }}
            aria-describedby={undefined}
          >
            <div
              className={clsx(
                "flex h-full flex-col",
                variant === "secondary"
                  ? "bg-graphite-secondary"
                  : "bg-graphite-card"
              )}
            >
              {/* Pass context down to sheet children */}
              <SidebarContext.Provider
                value={{
                  state,
                  openMobile,
                  setOpenMobile,
                  toggleSidebar,
                  setSidebarState,
                  isMobile,
                  size: itemSize,
                  shape: itemShape,
                  variant,
                }}
              >
                {children}
              </SidebarContext.Provider>
            </div>
          </Sheet.Content>
        </Sheet>
      );
    }

    // --- DESKTOP RENDERING (MOTION ASIDE) ---

    const handleMouseEnter = () => {
      if (expandOnHover && isCollapsed) {
        setSidebarState("expanded");
      }
    };

    const handleMouseLeave = () => {
      if (expandOnHover && !isCollapsed) {
        setSidebarState("collapsed");
      }
    };

    const handleBackdropClick = () => {
      if (overlay && !expandOnHover) {
        setSidebarState("collapsed");
      }
    };

    const SidebarContent = (
      <motion.aside
        ref={ref}
        initial={false}
        animate={{
          width: isCollapsed ? collapsedWidth : width,
        }}
        transition={{
          duration: 0.12,
          ease: EASING.iOS,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={clsx(
          sidebarVariants({ layout, variant, shape, overlay }),
          className
        )}
        data-state={state}
        {...props}
      >
        {children}
      </motion.aside>
    );

    // Update context with props passed to Root
    const contextValue = {
      state,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      setSidebarState,
      isMobile,
      size: itemSize,
      shape: itemShape,
      variant: variant || "primary",
    };

    if (overlay) {
      return (
        <SidebarContext.Provider value={contextValue}>
          <div className="relative h-full flex shrink-0">
            <motion.div
              initial={false}
              animate={{ width: collapsedWidth }}
              className="h-full shrink-0 bg-transparent"
            />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleBackdropClick}
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[4px] duration-300 transition-all"
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>
            {SidebarContent}
          </div>
        </SidebarContext.Provider>
      );
    }

    return (
      <SidebarContext.Provider value={contextValue}>
        {SidebarContent}
      </SidebarContext.Provider>
    );
  }
);
SidebarRoot.displayName = "Sidebar";

// --- Header ---
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex h-16 items-center px-4 min-w-max", className)}
    {...props}
  />
));
SidebarHeader.displayName = "Sidebar.Header";

// --- Content ---
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-3 py-2 scrollbar-thin",
      className
    )}
    {...props}
  />
));
SidebarContent.displayName = "Sidebar.Content";

// --- Footer ---
const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx("flex items-center p-3 mt-auto min-w-max", className)}
    {...props}
  />
));
SidebarFooter.displayName = "Sidebar.Footer";

// --- Item Variants (UPDATED) ---
const sidebarItemVariants = cva(
  "group relative flex w-full items-center border border-transparent font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-graphite-ring",
  {
    variants: {
      isActive: {
        true: "",
        false: "",
      },
      parentVariant: {
        primary: "",
        secondary: "",
        ghost: "",
      },
      size: {
        sm: "py-1.5 text-xs",
        md: "py-2 text-sm",
        lg: "py-3 text-base",
      },
      shape: {
        sharp: "rounded-none",
        minimal: "rounded-lg",
        full: "rounded-full",
      },
    },
    compoundVariants: [
      // --- Primary Parent (Default) ---
      {
        parentVariant: "primary",
        isActive: true,
        className:
          "bg-graphite-secondary text-graphite-foreground font-semibold",
      },
      {
        parentVariant: "primary",
        isActive: false,
        className:
          "text-graphite-foreground/70 hover:text-graphite-foreground hover:bg-graphite-secondary/60",
      },
      // --- Secondary Parent (Fix for contrast) ---
      {
        parentVariant: "secondary",
        isActive: true,
        className:
          "bg-graphite-card shadow-sm text-graphite-foreground font-semibold",
      },
      {
        parentVariant: "secondary",
        isActive: false,
        className:
          "text-graphite-foreground/70 hover:text-graphite-foreground hover:bg-graphite-card/60",
      },
      // --- Ghost Parent ---
      {
        parentVariant: "ghost",
        isActive: true,
        className:
          "bg-graphite-secondary text-graphite-foreground font-semibold",
      },
      {
        parentVariant: "ghost",
        isActive: false,
        className:
          "text-graphite-foreground/70 hover:text-graphite-foreground hover:bg-graphite-secondary/60",
      },
    ],
    defaultVariants: {
      isActive: false,
      size: "md",
      shape: "minimal",
      parentVariant: "primary",
    },
  }
);

// --- Sidebar Item ---
interface SidebarItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarItemVariants> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ className, icon, children, isActive, badge, ...props }, ref) => {
    const {
      state,
      size: contextSize,
      shape: contextShape,
      variant: contextVariant,
      isMobile,
    } = useSidebar();

    const isCollapsed = !isMobile && state === "collapsed";
    const localRef = useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current!);

    const [, event] = useRipple({
      ref: localRef,
      color: "var(--color-ripple-light)",
      duration: 300,
    });

    const [isPressed, setIsPressed] = useState(false);
    const iconSize = props.size === "lg" ? 24 : props.size === "sm" ? 16 : 20;

    const ButtonContent = (
      <button
        ref={localRef}
        onPointerDown={(e) => {
          event(e);
          setIsPressed(true);
        }}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        className={clsx(
          sidebarItemVariants({
            isActive,
            parentVariant: contextVariant, // Pass the parent variant to CVA
            size: props.size || contextSize,
            shape: props.shape || contextShape,
          }),
          "px-3",
          className
        )}
        {...props}
      >
        {icon && (
          <motion.span
            animate={{ scale: isPressed ? 0.85 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={clsx(
              "flex shrink-0 items-center justify-center transition-colors duration-300",
              isActive ? "text-graphite-primary" : "opacity-80"
            )}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement, {
                  // @ts-ignore
                  size: iconSize,
                })
              : icon}
          </motion.span>
        )}

        <AnimatePresence>
          {!isCollapsed && children && (
            <motion.span
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{
                opacity: 1,
                width: "auto",
                marginLeft: "0.75rem",
              }}
              exit={{
                opacity: 0,
                width: 0,
                marginLeft: 0,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
              className="flex-1 overflow-hidden whitespace-nowrap text-left min-w-0"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isCollapsed && badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="ml-auto shrink-0"
            >
              {badge}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );

    return ButtonContent;
  }
);
SidebarItem.displayName = "Sidebar.Item";

// --- Sidebar Trigger ---
const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof IconButton>
>(({ className, ...props }, ref) => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <IconButton
      ref={ref}
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className={clsx("text-graphite-foreground/60", className)}
      aria-label={
        isMobile
          ? "Open Menu"
          : isCollapsed
          ? "Expand Sidebar"
          : "Collapse Sidebar"
      }
      {...props}
    >
      {isMobile ? (
        <Menu className="h-5 w-5" />
      ) : isCollapsed ? (
        <PanelLeftOpen className="h-5 w-5" />
      ) : (
        <PanelLeftClose className="h-5 w-5" />
      )}
    </IconButton>
  );
});
SidebarTrigger.displayName = "Sidebar.Trigger";

// --- Group & Label ---
const SidebarGroup = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("flex flex-col gap-1 py-2", className)} {...props} />
);

const SidebarLabel = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { state, isMobile } = useSidebar();
  const isCollapsed = !isMobile && state === "collapsed";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isCollapsed ? 0 : 1, y: 0 }}
      transition={{ duration: 0.12 }}
      exit={{ opacity: 0 }}
      className={clsx(
        "px-3 py-1 text-xs font-semibold uppercase tracking-wider text-graphite-foreground/50 whitespace-nowrap overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// --- Exports ---
export const Sidebar = Object.assign(SidebarRoot, {
  Provider: SidebarProvider,
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Item: SidebarItem,
  Trigger: SidebarTrigger,
  Group: SidebarGroup,
  Label: SidebarLabel,
});
