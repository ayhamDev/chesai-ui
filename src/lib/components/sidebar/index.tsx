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

// --- 1. TYPE DEFINITIONS & CONTEXTS ---

type DesktopVariant = "permanent" | "modal";
type MobileVariant = "modal" | "push";
type SidebarSide = "left" | "right";
type ItemShape = "full" | "minimal" | "sharp";
type ItemSize = "sm" | "md" | "lg";

interface SidebarContextProps {
  isDesktop: boolean;
  isCollapsed: boolean;
  isOpenOnMobile: boolean;
  activeItem: string;
  desktopVariant: DesktopVariant;
  mobileVariant: MobileVariant;
  side: SidebarSide;
  collapsible: boolean;
  indicatorId: string;
  sidebarX: MotionValue<number>;
  expandedWidth: number;
  toggleCollapse: () => void;
  setIsOpenOnMobile: (isOpen: boolean) => void;
  handleItemPress: (itemKey: string) => void;
}

const SidebarContext = createContext<SidebarContextProps | null>(null);
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar must be used within a <Sidebar> component.");
  return context;
};

// --- Context for Nav item styling ---
interface NavContextProps {
  shape: ItemShape;
  size: ItemSize;
}
const NavContext = createContext<NavContextProps>({
  shape: "full",
  size: "md",
});

// --- 2. CVA VARIANTS ---
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
    defaultVariants: { variant: "secondary" },
  }
);

const navItemVariants = cva(
  "relative flex items-center w-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2 overflow-hidden",
  {
    variants: {
      isActive: {
        true: "font-semibold text-graphite-primary",
        false:
          "text-graphite-foreground/70 hover:text-graphite-foreground/90 hover:bg-black/5",
      },
      isCollapsed: {
        true: "justify-center",
        false: "justify-start",
      },
      shape: {
        full: "rounded-full",
        minimal: "rounded-lg",
        sharp: "rounded-none",
      },
      size: {
        sm: "h-10 text-sm px-4",
        md: "h-14 text-base px-5",
        lg: "h-16 text-lg px-5",
      },
    },
    defaultVariants: {
      isActive: false,
      isCollapsed: false,
      shape: "full",
      size: "md",
    },
    compoundVariants: [
      { isCollapsed: true, size: "sm", className: "w-10 px-0" },
      { isCollapsed: true, size: "md", className: "w-14 px-0" },
      { isCollapsed: true, size: "lg", className: "w-16 px-0" },
    ],
  }
);
// --- 3. ROOT COMPONENT ---
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
  const [sidebarContainer, mainContent] = React.Children.toArray(children);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const indicatorId = useId();

  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultCollapsed);
  const isCollapsed =
    controlledCollapsed !== undefined
      ? controlledCollapsed
      : uncontrolledCollapsed;
  const [isOpenOnMobile, setIsOpenOnMobile] = useState(false);

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

  const handleItemPress = useCallback(
    (itemKey: string) => {
      onItemPress(itemKey);
      if (!isDesktop) setIsOpenOnMobile(false);
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

const SidebarContainer = React.memo(
  React.forwardRef<HTMLElement, SidebarContainerProps>(
    ({ children, className }, ref) => {
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
            className={clsx(
              "flex h-full flex-col bg-graphite-secondary",
              className
            )}
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
            style={{ x: modalDragX, transform: "translateZ(0)" }}
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
              "fixed top-0 bottom-0 z-50 flex h-full flex-col bg-graphite-secondary shadow-lg",
              "w-[280px]",
              side === "left" ? "left-0" : "right-0",
              className
            )}
          >
            {children}
          </motion.aside>
        );
      }

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
          style={{ x: sidebarX, transform: "translateZ(0)" }}
          className={clsx(
            "fixed top-0 bottom-0 z-50 flex h-full flex-col bg-graphite-secondary shadow-lg",
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

// --- Nav Components (Refactored to use Context) ---
interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  shape?: ItemShape;
  size?: ItemSize;
}
const SidebarNav = React.memo(
  ({
    children,
    className,
    shape = "full",
    size = "md",
    ...rest
  }: SidebarNavProps) => {
    const navContextValue = useMemo(() => ({ shape, size }), [shape, size]);
    return (
      <NavContext.Provider value={navContextValue}>
        <nav
          className={clsx("flex-1 space-y-1 px-3 py-2", className)}
          {...rest}
        >
          {children}
        </nav>
      </NavContext.Provider>
    );
  }
);
SidebarNav.displayName = "Sidebar.Nav";

interface NavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  itemKey: string;
  icon: React.ReactNode;
  endAdornment?: React.ReactNode;
  shape?: ItemShape;
  size?: ItemSize;
}
// BUG FIX: Removed React.memo from this component
const SidebarItem = React.forwardRef<HTMLButtonElement, NavItemProps>(
  (
    {
      itemKey,
      icon,
      children,
      endAdornment,
      className,
      shape: shapeProp,
      size: sizeProp,
      ...props
    },
    ref
  ) => {
    const { activeItem, handleItemPress, isCollapsed, indicatorId } =
      useSidebar();
    const navContext = useContext(NavContext);
    const isActive = activeItem === itemKey;

    const shape = shapeProp || navContext.shape;
    const size = sizeProp || navContext.size;

    const localRef = useRef<HTMLButtonElement>(null);
    const [, event] = useRipple({
      ref: localRef,
      color: "rgba(0, 0, 0, 0.1)",
      duration: 450,
      disabled: props.disabled,
    });
    useImperativeHandle(ref, () => localRef.current!);

    return (
      <button
        ref={localRef}
        onPointerDown={event}
        onClick={() => handleItemPress(itemKey)}
        className={navItemVariants({
          isActive,
          isCollapsed,
          shape,
          size,
          className,
        })}
        {...props}
      >
        {isActive && (
          <motion.div
            layoutId={indicatorId}
            className="absolute inset-0 z-0 bg-graphite-primary/10"
            style={{
              borderRadius:
                shape === "full" ? 9999 : shape === "minimal" ? "0.5rem" : 0,
            }}
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

  if (mobileVariant === "modal") {
    const handleModalDragEnd = (
      event: MouseEvent | TouchEvent,
      info: PanInfo
    ) => {
      const isOpening =
        (side === "left" && (info.offset.x > 50 || info.velocity.x > 500)) ||
        (side === "right" && (info.offset.x < -50 || info.velocity.x < -500));
      if (isOpening) setIsOpenOnMobile(true);
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
