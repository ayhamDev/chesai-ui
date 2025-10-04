"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import useRipple from "use-ripple-hook";
import { Typography } from "../typography";

// --- 1. TYPE DEFINITIONS & CONTEXT (UNIFIED) ---

type DesktopVariant = "permanent" | "modal";
type MobileVariant = "modal" | "push";
type SidebarSide = "left" | "right";

interface SidebarContextProps {
  // State
  isDesktop: boolean;
  isExpanded: boolean;
  isOpen: boolean;
  activeItem: string;
  // Configuration
  desktopVariant: DesktopVariant;
  mobileVariant: MobileVariant;
  side: SidebarSide;
  collapsible: boolean;
  indicatorId: string;
  variant: "primary" | "secondary";
  // For Gestures
  sidebarX: MotionValue<number>;
  expandedWidth: number;
  // Actions
  toggle: () => void;
  onOpenChange: (isOpen: boolean) => void;
  handleItemPress: (itemKey: string) => void;
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

/**
 * Hook to access sidebar state and actions. Must be used within a <Sidebar> component.
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a <Sidebar> component.");
  }
  return context;
};

interface SidebarNavContextProps {
  size: "sm" | "md" | "lg";
  shape: "full" | "minimal" | "sharp";
}

const SidebarNavContext = createContext<SidebarNavContextProps>({
  size: "md",
  shape: "full",
});

// --- 2. CVA VARIANTS ---
const containerVariants = cva("flex h-full flex-col", {
  variants: {
    variant: {
      primary: "bg-graphite-primary text-graphite-primaryForeground",
      secondary: "bg-graphite-secondary text-graphite-foreground",
    },
  },
  defaultVariants: {
    variant: "secondary",
  },
});

const primaryActionVariants = cva(
  "flex items-center justify-center font-semibold transition-all duration-300 ease-in-out overflow-hidden relative group shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-graphite-ring",
  {
    variants: {
      variant: {
        primary: "bg-graphite-primary text-graphite-primaryForeground",
        secondary: "bg-graphite-secondary text-graphite-secondaryForeground",
      },
      isExpanded: {
        true: "rounded-2xl h-14 px-5",
        false: "rounded-2xl h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

const navItemVariants = cva(
  "relative flex items-center w-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2",
  {
    variants: {
      isActive: {
        true: "font-semibold text-graphite-primary",
        false:
          "text-graphite-foreground/70 hover:text-graphite-foreground/90 hover:bg-black/5",
      },
      isExpanded: {
        true: "justify-start px-5",
        false: "justify-center px-0",
      },
      size: {
        sm: "h-10 text-sm",
        md: "h-14 text-base",
        lg: "h-16 text-lg",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      isActive: false,
      isExpanded: false,
      size: "md",
      shape: "full",
    },
  }
);
// --- 3. ROOT COMPONENT (UNIFIED STATE) ---

interface SidebarProps {
  children: [
    React.ReactElement<SidebarContainerProps>,
    React.ReactElement<SidebarContentProps>
  ];
  activeItem: string;
  onItemPress: (itemKey: string) => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  defaultOpen?: boolean;
  desktopVariant?: DesktopVariant;
  mobileVariant?: MobileVariant;
  side?: SidebarSide;
  collapsible?: boolean;
}

const SidebarRoot: React.FC<SidebarProps> = ({
  children,
  activeItem,
  onItemPress,
  isOpen: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  desktopVariant = "permanent",
  mobileVariant = "modal",
  side = "left",
  collapsible = true,
}) => {
  const [sidebarContainer, mainContent] = React.Children.toArray(children) as [
    React.ReactElement<SidebarContainerProps>,
    React.ReactElement<SidebarContentProps>
  ];
  const containerVariant = sidebarContainer.props.variant || "secondary";

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const indicatorId = useId();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined && onOpenChange;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = isControlled ? onOpenChange : setUncontrolledOpen;

  const expandedWidth = 280;
  const closedX = side === "left" ? -expandedWidth : expandedWidth;
  const sidebarX = useMotionValue(isOpen ? 0 : closedX);

  useEffect(() => {
    if (!isDesktop) {
      const targetX = isOpen ? 0 : closedX;
      animate(sidebarX, targetX, {
        type: "spring",
        stiffness: 500,
        damping: 50,
        mass: 1,
      });
    }
  }, [isOpen, isDesktop, closedX, sidebarX]);

  const pushX = useTransform(sidebarX, (latestX) => {
    if (isDesktop || mobileVariant !== "push") return 0;
    if (side === "left") return latestX + expandedWidth;
    return latestX - expandedWidth;
  });

  const overlayOpacity = useTransform(
    sidebarX,
    side === "left" ? [-expandedWidth, 0] : [expandedWidth, 0],
    [0, 1]
  );

  const toggle = useCallback(() => {
    if (collapsible) {
      handleOpenChange(!isOpen);
    }
  }, [collapsible, isOpen, handleOpenChange]);

  const handleItemPress = useCallback(
    (itemKey: string) => {
      onItemPress(itemKey);
      if (!isDesktop) {
        setTimeout(() => {
          handleOpenChange(false);
        }, 100);
      }
    },
    [isDesktop, onItemPress, handleOpenChange]
  );

  const contextValue = useMemo(
    () => ({
      isDesktop,
      isExpanded: isDesktop ? isOpen : true,
      isOpen,
      activeItem,
      desktopVariant,
      mobileVariant,
      side,
      collapsible,
      indicatorId,
      sidebarX,
      expandedWidth,
      variant: containerVariant,
      toggle,
      onOpenChange: handleOpenChange,
      handleItemPress,
    }),
    [
      isDesktop,
      isOpen,
      activeItem,
      desktopVariant,
      mobileVariant,
      side,
      collapsible,
      indicatorId,
      sidebarX,
      expandedWidth,
      containerVariant,
      toggle,
      handleOpenChange,
      handleItemPress,
    ]
  );

  const collapsedWidth = 80;
  const sidebarWidth = isOpen ? expandedWidth : collapsedWidth;

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="relative h-screen w-full bg-graphite-background overflow-hidden">
        {isDesktop ? (
          <div
            className={clsx(
              "flex h-full",
              side === "right" && "flex-row-reverse"
            )}
          >
            {desktopVariant === "permanent" && (
              <motion.div
                style={{ transform: "translateZ(0)" }}
                animate={{ width: sidebarWidth }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
              >
                {sidebarContainer}
              </motion.div>
            )}
            {mainContent}
          </div>
        ) : (
          <>
            {!isDesktop && mobileVariant === "modal" && (
              <motion.div
                className="fixed inset-0 z-40 bg-black/40"
                style={{ opacity: overlayOpacity }}
                onClick={() => handleOpenChange(false)}
                initial={{ pointerEvents: "none" }}
                animate={{ pointerEvents: isOpen ? "auto" : "none" }}
              />
            )}
            {sidebarContainer}
            <motion.div
              className="h-full"
              style={{
                x: pushX,
                transform: "translateZ(0)",
                // NEW: Add touchAction style to prevent conflicts
                touchAction: isOpen ? "none" : "pan-y",
              }}
            >
              {mainContent}
            </motion.div>
          </>
        )}
      </div>
    </SidebarContext.Provider>
  );
};
SidebarRoot.displayName = "Sidebar";

// --- 4. SUB-COMPONENTS ---

interface SidebarContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}
const SidebarContainer = React.memo(
  React.forwardRef<HTMLElement, SidebarContainerProps>(
    ({ children, className, variant = "secondary" }, ref) => {
      const {
        side,
        isDesktop,
        mobileVariant,
        onOpenChange,
        sidebarX,
        expandedWidth,
      } = useSidebar();

      if (isDesktop) {
        return (
          <aside
            ref={ref}
            className={clsx(containerVariants({ variant }), className)}
          >
            {children}
          </aside>
        );
      }

      const handleDragEnd = (e: MouseEvent | TouchEvent, info: PanInfo) => {
        const closedX = side === "left" ? -expandedWidth : expandedWidth;
        const isClosing =
          (side === "left" &&
            (info.offset.x < -50 || info.velocity.x < -500)) ||
          (side === "right" && (info.offset.x > 50 || info.velocity.x > 500));

        if (isClosing) {
          animate(sidebarX, closedX, {
            type: "spring",
            stiffness: 500,
            damping: 50,
            onComplete: () => onOpenChange(false),
          });
        } else {
          animate(sidebarX, 0, {
            type: "spring",
            stiffness: 500,
            damping: 50,
            onComplete: () => onOpenChange(true),
          });
        }
      };

      return (
        <motion.aside
          ref={ref}
          key={`sidebar-${mobileVariant}`}
          drag="x"
          onDragEnd={handleDragEnd}
          style={{ x: sidebarX, transform: "translateZ(0)" }}
          dragConstraints={{
            left: side === "left" ? -expandedWidth : 0,
            right: side === "left" ? 0 : expandedWidth,
          }}
          dragElastic={{ left: 0.1, right: 0.1 }}
          className={clsx(
            containerVariants({ variant }),
            "fixed top-0 bottom-0 z-[100] flex h-screen flex-col",
            "w-[280px]",
            side === "left" ? "left-0" : "right-0",
            className
          )}
        >
          {children}
        </motion.aside>
      );
    }
  )
);
SidebarContainer.displayName = "Sidebar.Container";

const SidebarHeader = React.memo(
  (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={clsx(
        "flex h-16 flex-shrink-0 items-center px-4",
        props.className
      )}
      {...props}
    />
  )
);
SidebarHeader.displayName = "Sidebar.Header";

interface PrimaryActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: "primary" | "secondary";
}
const SidebarPrimaryAction = React.memo(
  React.forwardRef<HTMLButtonElement, PrimaryActionProps>(
    ({ children, icon, variant = "secondary", className, ...props }, ref) => {
      const { isExpanded } = useSidebar();
      return (
        <div className="px-3 py-2">
          <motion.button
            ref={ref}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className={primaryActionVariants({
              variant,
              isExpanded,
              className,
            })}
            {...props}
          >
            <motion.span layout="position" className="flex-shrink-0">
              {icon}
            </motion.span>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{
                    opacity: 1,
                    width: "auto",
                    marginLeft: "0.75rem",
                    transition: { delay: 0.1 },
                  }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      );
    }
  )
);
SidebarPrimaryAction.displayName = "Sidebar.PrimaryAction";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
}

const SidebarNav = React.memo(
  ({
    children,
    className,
    size = "md",
    shape = "full",
    ...props
  }: SidebarNavProps) => {
    return (
      <SidebarNavContext.Provider value={{ size, shape }}>
        <nav
          className={clsx("flex-1 space-y-1 px-3 py-2", className)}
          {...props}
        >
          {children}
        </nav>
      </SidebarNavContext.Provider>
    );
  }
);
SidebarNav.displayName = "Sidebar.Nav";

interface NavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  itemKey: string;
  icon: React.ReactNode;
  endAdornment?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
}
const SidebarItem = React.memo(
  React.forwardRef<HTMLButtonElement, NavItemProps>(
    (
      {
        itemKey,
        icon,
        children,
        endAdornment,
        className,
        size: propSize,
        shape: propShape,
        ...props
      },
      ref
    ) => {
      const { activeItem, handleItemPress, isExpanded, indicatorId, variant } =
        useSidebar();
      const { size: contextSize, shape: contextShape } =
        useContext(SidebarNavContext);

      const isActive = activeItem === itemKey;
      const size = propSize || contextSize;
      const shape = propShape || contextShape;

      const shapeToBorderRadius = {
        full: 9999,
        minimal: "0.5rem",
        sharp: 0,
      };

      const localRef = React.useRef<HTMLButtonElement>(null);
      React.useImperativeHandle(
        ref,
        () => localRef.current as HTMLButtonElement
      );

      const rippleColor =
        variant === "primary"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)";

      const rippleRef = localRef as React.RefObject<HTMLElement>;
      const [, event] = useRipple({
        ref: rippleRef,
        color: rippleColor,
        duration: 400,
      });

      return (
        <button
          ref={localRef}
          onPointerDown={event}
          onClick={() => handleItemPress(itemKey)}
          className={navItemVariants({
            isActive,
            isExpanded,
            size,
            shape,
            className,
          })}
          {...props}
        >
          {isActive && (
            <motion.div
              layoutId={indicatorId}
              className="absolute inset-0 z-0 bg-graphite-primary/10"
              style={{ borderRadius: shapeToBorderRadius[shape] }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <div className="relative z-10 flex-shrink-0">{icon}</div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{
                  opacity: 1,
                  width: "auto",
                  marginLeft: "0.75rem",
                  transition: { delay: 0.1, duration: 0.2 },
                }}
                exit={{
                  opacity: 0,
                  width: 0,
                  marginLeft: 0,
                  transition: { duration: 0.1 },
                }}
                className="relative z-10 flex-1 text-left overflow-hidden whitespace-nowrap"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
          {isExpanded && endAdornment && (
            <div className="relative z-10 ml-auto flex-shrink-0">
              {endAdornment}
            </div>
          )}
        </button>
      );
    }
  )
);
SidebarItem.displayName = "Sidebar.Item";

const SidebarFooter = React.memo(
  (props: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={clsx("mt-auto flex-shrink-0 p-3", props.className)}
      {...props}
    />
  )
);
SidebarFooter.displayName = "Sidebar.Footer";

const SidebarSeparator = React.memo(
  (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className={clsx("my-2 border-graphite-border/60", props.className)}
      {...props}
    />
  )
);
SidebarSeparator.displayName = "Sidebar.Separator";

const SidebarSectionHeader = React.memo(
  (props: React.HTMLAttributes<HTMLDivElement>) => {
    const { isExpanded } = useSidebar();
    return (
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Typography
              variant="small"
              className={clsx(
                "px-5 py-2 font-bold text-graphite-primary",
                props.className
              )}
              {...props}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
SidebarSectionHeader.displayName = "Sidebar.SectionHeader";

const SidebarDragHandle = React.memo(() => {
  const { isDesktop, isOpen, onOpenChange, side, sidebarX, expandedWidth } =
    useSidebar();

  if (isDesktop || isOpen) return null;

  const handleDragEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
    const isOpening =
      (side === "left" && (info.offset.x > 50 || info.velocity.x > 500)) ||
      (side === "right" && (info.offset.x < -50 || info.velocity.x < -500));

    if (isOpening) {
      animate(sidebarX, 0, {
        type: "spring",
        stiffness: 500,
        damping: 50,
        onComplete: () => onOpenChange(true),
      });
    } else {
      const closedX = side === "left" ? -expandedWidth : expandedWidth;
      animate(sidebarX, closedX, {
        type: "spring",
        stiffness: 500,
        damping: 50,
      });
    }
  };

  return (
    <motion.div
      className={clsx(
        "fixed top-0 bottom-0 z-[1000] w-12",
        side === "left" ? "left-0" : "right-0"
      )}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.1, right: 0.1 }}
      onDragEnd={handleDragEnd}
      onDrag={(e, info) => {
        const isDraggingCorrectly =
          (side === "left" && info.offset.x > 0) ||
          (side === "right" && info.offset.x < 0);

        if (isDraggingCorrectly) {
          sidebarX.set(
            side === "left"
              ? info.offset.x - expandedWidth
              : info.offset.x + expandedWidth
          );
        }
      }}
    />
  );
});
SidebarDragHandle.displayName = "Sidebar.DragHandle";

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarContent = React.memo(
  React.forwardRef<HTMLDivElement, SidebarContentProps>((props, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("h-full w-full", props.className)}
        {...props}
      />
    );
  })
);
SidebarContent.displayName = "Sidebar.Content";

// --- 5. COMPOUND EXPORT ---

export const Sidebar = Object.assign(SidebarRoot, {
  Container: SidebarContainer,
  Header: SidebarHeader,
  PrimaryAction: SidebarPrimaryAction,
  Nav: SidebarNav,
  Item: SidebarItem,
  Footer: SidebarFooter,
  Separator: SidebarSeparator,
  SectionHeader: SidebarSectionHeader,
  DragHandle: SidebarDragHandle,
  Content: SidebarContent,
});
