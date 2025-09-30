"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import {
  animate,
  AnimatePresence,
  motion,
  type PanInfo,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Menu } from "lucide-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import useRipple from "use-ripple-hook";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";

// --- 1. TYPE DEFINITIONS & CONTEXT ---

type DesktopVariant = "permanent" | "modal";
type MobileVariant = "modal" | "push";
type SidebarSide = "left" | "right";

interface SidebarContextProps {
  // State
  isDesktop: boolean;
  isCollapsed: boolean;
  isOpenOnMobile: boolean;
  activeItem: string;
  // Configuration
  desktopVariant: DesktopVariant;
  mobileVariant: MobileVariant;
  side: SidebarSide;
  collapsible: boolean;
  indicatorId: string;
  variant: "primary" | "secondary";
  // For Gestures
  sidebarX: MotionValue<number>; // Now used ONLY for PUSH variant
  expandedWidth: number;
  // Actions
  toggleCollapse: () => void;
  setIsOpenOnMobile: (isOpen: boolean) => void;
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

// NEW: Context for Nav item styling
interface SidebarNavContextProps {
  size: "sm" | "md" | "lg";
  shape: "full" | "minimal" | "sharp";
}

const SidebarNavContext = createContext<SidebarNavContextProps>({
  size: "md",
  shape: "full",
});

// --- 2. CVA VARIANTS ---
// NEW: CVA for the container background
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
      isCollapsed: {
        true: "rounded-2xl h-14 w-14",
        false: "rounded-2xl h-14 px-5",
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
      isCollapsed: {
        true: "justify-center px-0",
        false: "justify-start px-5",
      },
      // ADD: Size variants
      size: {
        sm: "h-10 text-sm",
        md: "h-14 text-base",
        lg: "h-16 text-lg",
      },
      // ADD: Shape variants
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      isActive: false,
      isCollapsed: false,
      size: "md",
      shape: "full",
    },
  }
);
// --- 3. ROOT COMPONENT (LAYOUT & STATE MANAGER) ---

interface SidebarProps {
  children: [
    React.ReactElement<SidebarContainerProps>,
    React.ReactElement<SidebarContentProps>
  ];
  activeItem: string;
  onItemPress: (itemKey: string) => void;
  desktopVariant?: DesktopVariant;
  mobileVariant?: MobileVariant;
  side?: SidebarSide;
  isCollapsed?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
}

const SidebarRoot: React.FC<SidebarProps> = ({
  children,
  activeItem,
  onItemPress,
  desktopVariant = "permanent",
  mobileVariant = "modal",
  side = "left",
  isCollapsed: controlledCollapsed,
  onCollapseChange,
  defaultCollapsed = false,
  collapsible = true,
}) => {
  const [sidebarContainer, mainContent] = React.Children.toArray(children) as [
    React.ReactElement<SidebarContainerProps>,
    React.ReactElement<SidebarContentProps>
  ];
  const containerVariant = sidebarContainer.props.variant || "secondary";

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const indicatorId = useId();

  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultCollapsed);
  const isCollapsed =
    controlledCollapsed !== undefined
      ? controlledCollapsed
      : uncontrolledCollapsed;

  const [isOpenOnMobile, setIsOpenOnMobile] = useState(false);

  // Motion Values for PUSH variant ONLY
  const expandedWidth = 280;
  const closedX = side === "left" ? -expandedWidth : expandedWidth;
  const sidebarX = useMotionValue(closedX);

  useEffect(() => {
    if (mobileVariant === "push") {
      const targetX = isOpenOnMobile ? 0 : closedX;
      animate(sidebarX, targetX, {
        type: "spring",
        stiffness: 500,
        damping: 50,
        mass: 1,
      });
    }
  }, [isOpenOnMobile, closedX, sidebarX, mobileVariant]);

  const pushX = useTransform(sidebarX, (latestX) => {
    if (mobileVariant !== "push") return 0;
    if (side === "left") return latestX + expandedWidth;
    return latestX - expandedWidth;
  });

  const toggleCollapse = useCallback(() => {
    if (!collapsible) return;
    const nextCollapsed = !isCollapsed;
    if (onCollapseChange) {
      onCollapseChange(nextCollapsed);
    } else {
      setUncontrolledCollapsed(nextCollapsed);
    }
  }, [collapsible, isCollapsed, onCollapseChange]);

  // OPTIMIZATION: Memoize handler to prevent re-renders in children
  const handleItemPress = useCallback(
    (itemKey: string) => {
      onItemPress(itemKey);
      if (!isDesktop) {
        setTimeout(() => {
          setIsOpenOnMobile(false);
        }, 100);
      }
    },
    [isDesktop, onItemPress]
  );

  const contextValue = useMemo(
    () => ({
      isDesktop,
      isCollapsed: isDesktop ? isCollapsed : false,
      isOpenOnMobile,
      activeItem,
      desktopVariant,
      mobileVariant,
      side,
      collapsible,
      indicatorId,
      sidebarX,
      expandedWidth,
      variant: containerVariant,
      toggleCollapse,
      setIsOpenOnMobile,
      handleItemPress,
    }),
    [
      isDesktop,
      isCollapsed,
      isOpenOnMobile,
      activeItem,
      desktopVariant,
      mobileVariant,
      side,
      collapsible,
      indicatorId,
      sidebarX,
      expandedWidth,
      containerVariant,
      toggleCollapse,
      handleItemPress,
    ]
  );

  const collapsedWidth = 80;
  const sidebarWidth = isCollapsed ? collapsedWidth : expandedWidth;

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="relative h-screen w-full bg-graphite-background overflow-hidden">
        {isDesktop ? (
          // --- Desktop Layout ---
          <div
            className={clsx(
              "flex h-full",
              side === "right" && "flex-row-reverse"
            )}
          >
            {desktopVariant === "permanent" && (
              <motion.div
                // OPTIMIZATION: Promote to its own layer for smoother width animation
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
          // --- Mobile Layout ---
          <>
            <AnimatePresence>
              {isOpenOnMobile && mobileVariant === "modal" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-40 bg-black/40"
                  onClick={() => setIsOpenOnMobile(false)}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isOpenOnMobile && mobileVariant === "modal" && sidebarContainer}
            </AnimatePresence>
            {mobileVariant === "push" && sidebarContainer}
            <motion.div
              className="h-full"
              // OPTIMIZATION: Promote to its own layer for smoother push animation
              style={{ x: pushX, transform: "translateZ(0)" }}
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

// --- SidebarContainer ---
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
        setIsOpenOnMobile,
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

      if (mobileVariant === "modal") {
        const modalDragX = useMotionValue(0);
        const handleModalDragEnd = (
          e: MouseEvent | TouchEvent,
          info: PanInfo
        ) => {
          const isClosing =
            (side === "left" &&
              (info.offset.x < -50 || info.velocity.x < -500)) ||
            (side === "right" && (info.offset.x > 50 || info.velocity.x > 500));

          if (isClosing) {
            const exitX = side === "left" ? -expandedWidth : expandedWidth;
            animate(modalDragX, exitX, {
              type: "spring",
              stiffness: 500,
              damping: 50,
              onComplete: () => setIsOpenOnMobile(false),
            });
          } else {
            animate(modalDragX, 0, {
              type: "spring",
              stiffness: 500,
              damping: 50,
            });
          }
        };

        return (
          <motion.aside
            ref={ref}
            key="sidebar-modal"
            drag="x"
            onDragEnd={handleModalDragEnd}
            style={{ x: modalDragX, transform: "translateZ(0)" }} // OPTIMIZATION
            dragConstraints={{
              left: side === "left" ? -expandedWidth : 0,
              right: side === "left" ? 0 : expandedWidth,
            }}
            dragElastic={{ left: 0.1, right: 0.1 }}
            initial={{ x: side === "left" ? "-100%" : "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: side === "left" ? "-100%" : "100%" }}
            transition={{ type: "spring", stiffness: 500, damping: 50 }}
            className={clsx(
              containerVariants({ variant }),
              "fixed top-0 bottom-0 z-50 flex h-full flex-col shadow-lg",
              "w-[280px]",
              side === "left" ? "left-0" : "right-0",
              className
            )}
          >
            {children}
          </motion.aside>
        );
      }

      // --- RENDER LOGIC FOR 'PUSH' VARIANT ---
      const handlePushDragEnd = (e: MouseEvent | TouchEvent, info: PanInfo) => {
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
            onComplete: () => setIsOpenOnMobile(false),
          });
        } else {
          animate(sidebarX, 0, {
            type: "spring",
            stiffness: 500,
            damping: 50,
            onComplete: () => setIsOpenOnMobile(true),
          });
        }
      };

      return (
        <motion.aside
          ref={ref}
          key="sidebar-push"
          drag="x"
          onDragEnd={handlePushDragEnd}
          dragConstraints={{
            left: side === "left" ? -expandedWidth : 0,
            right: side === "left" ? 0 : expandedWidth,
          }}
          dragElastic={{ left: 0.1, right: 0.1 }}
          style={{ x: sidebarX, transform: "translateZ(0)" }} // OPTIMIZATION
          className={clsx(
            containerVariants({ variant }),
            "fixed top-0 bottom-0 z-50 flex h-full flex-col",
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
  (props: React.HTMLAttributes<HTMLDivElement>) => {
    const { isDesktop, collapsible, toggleCollapse, side } = useSidebar();
    return (
      <div
        className={clsx(
          "flex h-16 flex-shrink-0 items-center px-4",
          side === "right" && "flex-row-reverse",
          props.className
        )}
        {...props}
      >
        {isDesktop && collapsible && (
          <IconButton variant="ghost" size="sm" onClick={toggleCollapse}>
            <Menu />
          </IconButton>
        )}
      </div>
    );
  }
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
      const { isCollapsed } = useSidebar();
      return (
        <div className="px-3 py-2">
          <motion.button
            ref={ref}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className={primaryActionVariants({
              variant,
              isCollapsed,
              className,
            })}
            {...props}
          >
            <motion.span layout="position" className="flex-shrink-0">
              {icon}
            </motion.span>
            <AnimatePresence>
              {!isCollapsed && (
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
      const { activeItem, handleItemPress, isCollapsed, indicatorId, variant } =
        useSidebar();
      const { size: contextSize, shape: contextShape } =
        useContext(SidebarNavContext);

      const isActive = activeItem === itemKey;
      const size = propSize || contextSize;
      const shape = propShape || contextShape;

      // --- THIS IS THE FIX ---
      const shapeToBorderRadius = {
        full: 9999,
        minimal: "0.5rem", // Corresponds to rounded-lg
        sharp: 0,
      };
      // --- END FIX ---

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
            isCollapsed,
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
            {!isCollapsed && (
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
          {!isCollapsed && endAdornment && (
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
    const { isCollapsed } = useSidebar();
    return (
      <AnimatePresence>
        {!isCollapsed && (
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

const SidebarTrigger = React.memo(
  React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof IconButton>>(
    (props, ref) => {
      const { isDesktop, setIsOpenOnMobile } = useSidebar();
      if (isDesktop) return null;
      return (
        <IconButton
          ref={ref}
          onClick={() => setIsOpenOnMobile(true)}
          {...props}
        />
      );
    }
  )
);
SidebarTrigger.displayName = "Sidebar.Trigger";

const SidebarDragHandle = React.memo(() => {
  const {
    isDesktop,
    isOpenOnMobile,
    setIsOpenOnMobile,
    side,
    sidebarX,
    expandedWidth,
    mobileVariant,
  } = useSidebar();

  if (isDesktop || isOpenOnMobile) return null;

  // --- RENDER LOGIC FOR 'MODAL' VARIANT ---
  if (mobileVariant === "modal") {
    const handleModalDragEnd = (
      event: MouseEvent | TouchEvent,
      info: PanInfo
    ) => {
      const isOpening =
        (side === "left" && (info.offset.x > 50 || info.velocity.x > 500)) ||
        (side === "right" && (info.offset.x < -50 || info.velocity.x < -500));

      if (isOpening) {
        setIsOpenOnMobile(true);
      }
    };
    return (
      <motion.div
        className={clsx(
          "fixed top-0 bottom-0 z-30 w-8",
          side === "left" ? "left-0" : "right-0"
        )}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.1, right: 0.1 }}
        onDragEnd={handleModalDragEnd}
      />
    );
  }

  // --- RENDER LOGIC FOR 'PUSH' VARIANT ---
  const handlePushDragEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
    const isOpening =
      (side === "left" && (info.offset.x > 50 || info.velocity.x > 500)) ||
      (side === "right" && (info.offset.x < -50 || info.velocity.x < -500));

    if (isOpening) {
      animate(sidebarX, 0, {
        type: "spring",
        stiffness: 500,
        damping: 50,
        onComplete: () => setIsOpenOnMobile(true),
      });
    } else {
      const closedX = side === "left" ? -expandedWidth : expandedWidth;
      animate(sidebarX, closedX, {
        type: "spring",
        stiffness: 500,
        damping: 50,
        onComplete: () => setIsOpenOnMobile(false),
      });
    }
  };

  return (
    <motion.div
      className={clsx(
        "fixed top-0 bottom-0 z-30 w-8",
        side === "left" ? "left-0" : "right-0"
      )}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.1, right: 0.1 }}
      onDragEnd={handlePushDragEnd}
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

// --- MODIFIED: Ensure SidebarContentProps is defined ---
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
  Trigger: SidebarTrigger,
  DragHandle: SidebarDragHandle,
  Content: SidebarContent,
});
