"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useRipple from "use-ripple-hook";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { FAB, type FABProps } from "../fab";
import { IconButton } from "../icon-button";
import { Sheet } from "../sheet";
import { EASING } from "../stack-router/transitions";

// --- Types ---
type SidebarState = "expanded" | "collapsed";
type SidebarSize = "sm" | "md" | "lg";
type SidebarShape = "sharp" | "minimal" | "full";
type SidebarVariant = "primary" | "secondary" | "ghost" | "surface";
type SidebarItemVariant = "primary" | "secondary" | "ghost";
type SidebarSide = "left" | "right";

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
  variant: SidebarVariant;
  itemVariant: SidebarItemVariant; // Controls item styling separately
  side: SidebarSide;
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
    defaultOpen ? "expanded" : "collapsed",
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
        variant: "primary",
        itemVariant: "primary",
        side: "left",
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// --- Sidebar Root ---
const sidebarVariants = cva(
  "group/sidebar flex flex-col overflow-hidden transition-all duration-300 ease-ios text-on-surface box-border",
  {
    variants: {
      layout: {
        sidebar: "h-full",
        // Adjusted height calc to prevent overflow with margins
        floating:
          "my-2 h-[calc(100%-1rem)] border border-outline-variant shadow-lg",
        // Removed bg-transparent to allow variant colors to show
        inset: "h-full",
      },
      variant: {
        // BACKGROUND VARIANTS ONLY
        primary: "bg-surface-container-low",
        secondary: "bg-surface-container-highest",
        surface: "bg-surface",
        ghost: "bg-transparent",
      },
      side: {
        left: "",
        right: "",
      },
      shape: {
        sharp: "",
        minimal: "",
        full: "",
      },
      overlay: {
        true: "absolute top-0 z-50 h-full shadow-xl",
        false: "relative h-full",
      },
    },
    compoundVariants: [
      {
        layout: "sidebar",
        side: "left",
        className: "border-e border-outline-variant",
      },
      {
        layout: "sidebar",
        side: "left",
        shape: "minimal",
        className: "rounded-e-2xl",
      },
      {
        layout: "sidebar",
        side: "left",
        shape: "full",
        className: "rounded-e-3xl",
      },
      {
        layout: "sidebar",
        side: "left",
        shape: "sharp",
        className: "rounded-none",
      },
      {
        layout: "sidebar",
        side: "right",
        className: "border-s border-outline-variant",
      },
      {
        layout: "sidebar",
        side: "right",
        shape: "minimal",
        className: "rounded-s-2xl",
      },
      {
        layout: "sidebar",
        side: "right",
        shape: "full",
        className: "rounded-s-3xl",
      },
      {
        layout: "sidebar",
        side: "right",
        shape: "sharp",
        className: "rounded-none",
      },
      // Floating margins
      { layout: "floating", side: "left", className: "ms-3" },
      { layout: "floating", side: "right", className: "me-3" },
      { layout: "floating", shape: "minimal", className: "rounded-2xl" },
      { layout: "floating", shape: "full", className: "rounded-3xl" },
      { layout: "floating", shape: "sharp", className: "rounded-none" },
      {
        overlay: true,
        side: "left",
        className: "left-0 border-e border-outline-variant",
      },
      {
        overlay: true,
        side: "right",
        className: "right-0 border-s border-outline-variant",
      },
    ],
    defaultVariants: {
      layout: "sidebar",
      variant: "primary",
      shape: "minimal",
      side: "left",
      overlay: false,
    },
  },
);

interface SidebarProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsible?: boolean;
  width?: string;
  collapsedWidth?: string;
  mobileWidth?: string;
  mobileLayout?: "sheet" | "push";
  itemSize?: SidebarSize;
  itemShape?: SidebarShape;
  itemVariant?: SidebarItemVariant; // Controls the default look of items
  expandOnHover?: boolean;
  overlay?: boolean;
}

const SidebarRoot = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      children,
      layout = "sidebar",
      variant = "primary",
      itemVariant = "primary",
      side = "left",
      shape = "minimal",
      itemSize = "md",
      itemShape = "minimal",
      width = "16rem",
      collapsedWidth = "4.5rem",
      mobileWidth = "18rem",
      mobileLayout = "sheet",
      collapsible = true,
      expandOnHover = false,
      overlay = false,
      ...props
    },
    ref,
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

    // --- Mobile Push Effect ---
    useEffect(() => {
      if (isMobile && mobileLayout === "push") {
        const body = document.body;
        body.style.transition = "margin 0.3s cubic-bezier(0.32, 0.72, 0, 1)";

        if (openMobile) {
          body.style.width = "100vw";
          body.style.overflowX = "hidden";
          if (side === "left") {
            body.style.marginLeft = mobileWidth;
          } else {
            body.style.marginLeft = `-${mobileWidth}`;
          }
        } else {
          body.style.marginLeft = "";
          body.style.width = "";
          body.style.overflowX = "";
        }

        return () => {
          body.style.marginLeft = "";
          body.style.width = "";
          body.style.overflowX = "";
          body.style.transition = "";
        };
      }
    }, [isMobile, openMobile, mobileLayout, mobileWidth, side]);

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
      itemVariant: itemVariant || "primary",
      side: side || "left",
    };

    if (isMobile) {
      if (mobileLayout === "sheet") {
        return (
          <Sheet
            open={openMobile}
            onOpenChange={setOpenMobile}
            forceSideSheet
            side={side || "left"}
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
                    ? "bg-surface-container-high"
                    : "bg-surface-container-low",
                )}
              >
                <SidebarContext.Provider value={contextValue}>
                  {children}
                </SidebarContext.Provider>
              </div>
            </Sheet.Content>
          </Sheet>
        );
      } else {
        // Push Layout
        return (
          <SidebarContext.Provider value={contextValue}>
            <AnimatePresence>
              {/* @ts-ignore */}
              <motion.aside
                ref={ref}
                initial={{ x: side === "left" ? "-100%" : "100%" }}
                animate={{
                  x: openMobile ? "0%" : side === "left" ? "-100%" : "100%",
                }}
                transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                className={clsx(
                  "fixed top-0 bottom-0 z-50 flex flex-col overflow-hidden shadow-2xl",
                  side === "left" ? "left-0" : "right-0",
                  variant === "secondary"
                    ? "bg-surface-container-high"
                    : "bg-surface-container-low",
                  variant === "primary" && "border-r border-outline-variant",
                  className,
                )}
                style={{ width: mobileWidth }}
                {...props}
              >
                {children}
              </motion.aside>
            </AnimatePresence>
            <AnimatePresence>
              {openMobile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpenMobile(false)}
                  className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px] lg:hidden"
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>
          </SidebarContext.Provider>
        );
      }
    }

    // --- Desktop ---
    const handleMouseEnter = () => {
      if (expandOnHover && isCollapsed) setSidebarState("expanded");
    };
    const handleMouseLeave = () => {
      if (expandOnHover && !isCollapsed) setSidebarState("collapsed");
    };
    const handleBackdropClick = () => {
      if (overlay && !expandOnHover) setSidebarState("collapsed");
    };

    const SidebarContent = (
      // @ts-ignore
      <motion.aside
        ref={ref}
        initial={false}
        animate={{
          width: isCollapsed ? collapsedWidth : width,
        }}
        transition={{ duration: 0.12, ease: EASING.iOS }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={clsx(
          sidebarVariants({ layout, variant, shape, side, overlay }),
          className,
        )}
        data-state={state}
        {...props}
      >
        {children}
      </motion.aside>
    );

    if (overlay) {
      return (
        <SidebarContext.Provider value={contextValue}>
          <div
            className={clsx(
              "relative h-full flex shrink-0",
              side === "right" && "flex-row-reverse",
            )}
          >
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
  },
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
  React.HTMLAttributes<HTMLDivElement> & { elasticity?: boolean }
>(({ className, children, elasticity = false, ...props }, ref) => {
  if (elasticity) {
    return (
      <ElasticScrollArea
        ref={ref}
        className="flex-1 min-h-0 w-full"
        scrollbarVisibility="auto"
        viewportClassName="[&>div]:!block"
      >
        <div
          className={clsx("flex flex-col gap-1 px-3 py-2 w-full", className)}
          {...props}
        >
          {children}
        </div>
      </ElasticScrollArea>
    );
  }
  return (
    <div
      ref={ref}
      className={clsx(
        "flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-3 py-2 scrollbar-thin",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
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

// --- Sidebar FAB (NEW FIX) ---
export interface SidebarFABProps extends Omit<FABProps, "isExtended"> {
  label: React.ReactNode;
}

const SidebarFAB = React.forwardRef<HTMLButtonElement, SidebarFABProps>(
  ({ className, icon, label, ...props }, ref) => {
    const { state, isMobile } = useSidebar();
    const isCollapsed = !isMobile && state === "collapsed";
    // FAB is extended when sidebar is expanded
    const isExtended = !isCollapsed;

    return (
      <div
        className={clsx(
          "mb-2 flex",
          // When collapsed, center the FAB and remove side padding to prevent offset
          isCollapsed ? "justify-center px-0" : "px-3",
          className,
        )}
      >
        <FAB ref={ref} icon={icon} isExtended={isExtended} {...props}>
          {label}
        </FAB>
      </div>
    );
  },
);
SidebarFAB.displayName = "Sidebar.FAB";

// --- Item Variants (Refactored) ---
const sidebarItemVariants = cva(
  "group relative flex w-full items-center border border-transparent font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 overflow-hidden z-0",
  {
    variants: {
      isActive: {
        true: "",
        false:
          "after:absolute after:inset-0 after:z-[-1] after:opacity-0 after:scale-75 after:origin-center after:rounded-[inherit] after:transition-all after:duration-200 after:ease-out hover:after:opacity-100 hover:after:scale-100",
      },
      itemVariant: {
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
      // Primary Item: Active = High Contrast Primary
      {
        itemVariant: "primary",
        isActive: true,
        className: "bg-primary text-on-primary font-bold shadow-sm",
      },
      {
        itemVariant: "primary",
        isActive: false,
        className:
          "text-on-surface-variant hover:text-on-surface after:bg-surface-container-highest",
      },

      // Secondary Item: Active = Tonal Secondary Container
      {
        itemVariant: "secondary",
        isActive: true,
        className:
          "bg-secondary-container text-on-secondary-container font-bold",
      },
      {
        itemVariant: "secondary",
        isActive: false,
        className:
          "text-on-surface-variant hover:text-on-surface after:bg-secondary-container/50",
      },

      // Ghost Item: Active = Transparent + Text Color or Subtle BG
      {
        itemVariant: "ghost",
        isActive: true,
        className:
          "bg-transparent text-primary font-bold hover:bg-surface-container-highest/50",
      },
      {
        itemVariant: "ghost",
        isActive: false,
        className:
          "text-on-surface-variant hover:text-on-surface after:bg-surface-container-highest/30",
      },
    ],
    defaultVariants: {
      isActive: false,
      size: "md",
      shape: "minimal",
      itemVariant: "primary",
    },
  },
);

// --- Sidebar Item ---
interface SidebarItemProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarItemVariants> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  badge?: React.ReactNode;
}

const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  (
    { className, icon, children, isActive, badge, itemVariant, ...props },
    ref,
  ) => {
    const {
      state,
      size: contextSize,
      shape: contextShape,
      itemVariant: contextItemVariant,
      isMobile,
      setOpenMobile,
    } = useSidebar();

    const isCollapsed = !isMobile && state === "collapsed";
    const localRef = useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => localRef.current!);

    // Determine effective variant
    const effectiveVariant = itemVariant || contextItemVariant;

    // Dynamic Ripple Color
    // If Primary active -> White ripple. Else -> Dark ripple.
    const rippleColor =
      effectiveVariant === "primary" && isActive
        ? "var(--color-ripple-light)"
        : "var(--color-ripple-dark)";

    const [, event] = useRipple({
      // @ts-ignore
      ref: localRef,
      color: rippleColor,
      duration: 300,
    });

    const [isPressed, setIsPressed] = useState(false);
    const iconSize = props.size === "lg" ? 24 : props.size === "sm" ? 16 : 20;

    return (
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
            itemVariant: effectiveVariant,
            size: props.size || contextSize,
            shape: props.shape || contextShape,
          }),
          "px-3",
          className,
        )}
        {...props}
        onClick={(e) => {
          if (isMobile) setOpenMobile(false);
          props.onClick?.(e);
        }}
      >
        {icon && (
          <motion.span
            animate={{ scale: isPressed ? 0.85 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={clsx(
              "flex shrink-0 items-center justify-center transition-colors duration-300 relative z-10",
              "opacity-100",
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
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-1 overflow-hidden whitespace-nowrap text-left min-w-0 relative z-10"
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
              className="ml-auto shrink-0 relative z-10"
            >
              {badge}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  },
);
SidebarItem.displayName = "Sidebar.Item";

// --- Sidebar Trigger ---
const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof IconButton>
>(({ className, ...props }, ref) => {
  const { state, toggleSidebar, isMobile, side } = useSidebar();
  const isCollapsed = state === "collapsed";
  const OpenIcon = side === "left" ? PanelLeftOpen : PanelRightOpen;
  const CloseIcon = side === "left" ? PanelLeftClose : PanelRightClose;

  return (
    <IconButton
      ref={ref}
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className={clsx("text-on-surface-variant", className)}
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
        <OpenIcon className="h-5 w-5" />
      ) : (
        <CloseIcon className="h-5 w-5" />
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
  <div className="flex flex-col gap-1 py-2" {...props} />
);

const SidebarLabel = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { state, isMobile } = useSidebar();
  const isCollapsed = !isMobile && state === "collapsed";

  return (
    // @ts-ignore
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isCollapsed ? 0 : 1, y: 0 }}
      transition={{ duration: 0.12 }}
      exit={{ opacity: 0 }}
      className={clsx(
        "px-3 py-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant whitespace-nowrap overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

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
