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
import {
  ElasticScrollArea,
  type ElasticScrollAreaProps,
} from "../elastic-scroll-area";
import { Typography } from "../typography";

// --- 1. TYPE DEFINITIONS & CONTEXT (UNIFIED) ---

type DesktopVariant = "permanent" | "modal";
type MobileVariant = "modal" | "push";
type SidebarSide = "left" | "right";
type SidebarVariant = "primary" | "secondary" | "card";

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
  variant: SidebarVariant;
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
  shape: "minimal",
});

// --- 2. CVA VARIANTS ---
const containerVariants = cva("flex h-full flex-col", {
  variants: {
    variant: {
      primary: "bg-graphite-primary text-graphite-primaryForeground",
      secondary: "bg-graphite-secondary text-graphite-foreground",
      card: "bg-graphite-card text-graphite-foreground",
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
        card: "bg-graphite-secondary text-graphite-secondaryForeground",
      },
      isExpanded: {
        true: "h-14 px-5",
        false: "h-14 w-14",
      },
      shape: {
        full: "rounded-2xl",
        minimal: "rounded-2xl",
        sharp: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "secondary",
      shape: "minimal",
    },
  }
);

const navItemVariants = cva(
  "relative flex items-center w-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2 gap-3",
  {
    variants: {
      variant: {
        primary: "",
        secondary: "",
        card: "",
      },
      isActive: {
        true: "font-semibold",
        false: "",
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
    compoundVariants: [
      {
        variant: ["secondary", "card"],
        isActive: false,
        className:
          "text-graphite-foreground/70 hover:text-graphite-foreground/90 hover:bg-black/5",
      },
      {
        variant: ["secondary", "card"],
        isActive: true,
        className: "text-graphite-primary",
      },
      {
        variant: "primary",
        isActive: false,
        className:
          "text-graphite-primaryForeground/70 hover:text-graphite-primaryForeground/90 hover:bg-white/5",
      },
      {
        variant: "primary",
        isActive: true,
        className: "text-graphite-primaryForeground",
      },
    ],
    defaultVariants: {
      isActive: false,
      isExpanded: false,
      size: "md",
      shape: "full",
      variant: "secondary",
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
  expandedWidth?: number;
  collapsedWidth?: number;
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
  expandedWidth = 280,
  collapsedWidth = 80,
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
  }, [isOpen, isDesktop, closedX, sidebarX, expandedWidth]);

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
                style={{ willChange: "width" }}
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
                className="fixed inset-0 z-[100] bg-black/40"
                style={{ opacity: overlayOpacity, willChange: "opacity" }}
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
                willChange: "transform",
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
  variant?: SidebarVariant;
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
          style={{ x: sidebarX, willChange: "transform" }}
          dragConstraints={{
            left: side === "left" ? -expandedWidth : 0,
            right: side === "left" ? 0 : expandedWidth,
          }}
          dragElastic={0} // Disable over-dragging
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
  shape?: "full" | "minimal" | "sharp";
}
const SidebarPrimaryAction = React.memo(
  React.forwardRef<HTMLButtonElement, PrimaryActionProps>(
    ({ children, icon, shape = "minimal", className, ...props }, ref) => {
      const { isExpanded, variant } = useSidebar();
      return (
        <div className="px-3 py-2">
          {/* @ts-ignore */}
          <motion.button
            ref={ref}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className={primaryActionVariants({
              variant,
              isExpanded,
              shape,
              className,
            })}
            style={{ willChange: "width" }}
            {...props}
          >
            <motion.span layout="position" className="flex-shrink-0">
              {icon}
            </motion.span>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ willChange: "transform, opacity" }}
                  className="overflow-hidden whitespace-nowrap ml-3"
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

// @ts-ignore
interface SidebarNavProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onScroll" | "dir">,
    Omit<ElasticScrollAreaProps, "children" | "className" | "ref"> {
  size?: "sm" | "md" | "lg";
  shape?: "full" | "minimal" | "sharp";
}

const SidebarNav = React.memo(
  ({
    children,
    className,
    size = "md",
    shape = "full",
    elasticity,
    dampingFactor,
    scrollbarVisibility,
    pullToRefresh,
    onRefresh,
    pullThreshold,
    ...props
  }: SidebarNavProps) => {
    return (
      <SidebarNavContext.Provider value={{ size, shape }}>
        <ElasticScrollArea
          className="flex-1"
          elasticity={elasticity}
          dampingFactor={dampingFactor}
          scrollbarVisibility={scrollbarVisibility}
          pullToRefresh={pullToRefresh}
          onRefresh={onRefresh}
          pullThreshold={pullThreshold}
        >
          <nav className={clsx("space-y-1 px-3 py-2", className)} {...props}>
            {children}
          </nav>
        </ElasticScrollArea>
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
          ? "var(--color-ripple-dark)"
          : "var(--color-ripple-light)";

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
            variant,
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
              className={clsx(
                "absolute inset-0 z-0 transition-[border-radius] duration-200",
                variant === "primary" ? "bg-white/10" : "bg-graphite-primary/10"
              )}
              style={{
                borderRadius: shapeToBorderRadius[shape],
                willChange: "transform",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <div className="relative z-10 flex-shrink-0">{icon}</div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{ willChange: "transform, opacity" }}
                className="relative z-10 flex-1 text-left  overflow-hidden whitespace-nowrap"
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
      className={clsx("my-2", "border-graphite-border/60", props.className)}
      {...props}
    />
  )
);
SidebarSeparator.displayName = "Sidebar.Separator";

const SidebarSectionHeader = React.memo(
  (props: React.HTMLAttributes<HTMLDivElement>) => {
    const { isExpanded, variant } = useSidebar();
    return (
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ willChange: "height, opacity" }}
            className="overflow-hidden"
          >
            <Typography
              variant="small"
              className={clsx(
                "px-5 py-2 font-bold",
                variant === "primary"
                  ? "text-graphite-primaryForeground/70"
                  : "text-graphite-primary",
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
      dragElastic={0} // Disable over-dragging
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
