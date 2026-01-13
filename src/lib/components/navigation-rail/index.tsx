"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Divide, Menu } from "lucide-react";
import React, {
  Children,
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import useRipple from "use-ripple-hook";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";
import { Divider } from "../divider";

// --- TYPE DEFINITIONS & CONTEXT ---

export interface ScreenProps {
  name: string;
  label: React.ReactNode;
  icon: (props: { isActive: boolean }) => React.ReactNode;
  shape?: "full" | "minimal" | "sharp";
}

interface NavigationRailContextProps {
  activeTab: string;
  onTabPress: (name: string) => void;
  isExpanded: boolean;
  navigatorShape: "full" | "minimal" | "sharp";
  indicatorId: string;
  variant: "primary" | "secondary" | "ghost";
}

const NavigationRailContext = createContext<NavigationRailContextProps | null>(
  null
);
const useNavigationRail = () => {
  const context = useContext(NavigationRailContext);
  if (!context) {
    throw new Error(
      "NavigationRail components must be used within a <NavigationRail.Navigator>"
    );
  }
  return context;
};

// --- CVA VARIANTS ---

const navigatorVariants = cva(
  "flex flex-col h-full transition-shadow duration-300 ease-in-out z-20 overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-graphite-card",
        secondary: "bg-graphite-secondary",
        ghost: "bg-transparent",
      },
      behavior: {
        push: "relative",
        overlay: "absolute",
      },
      shape: {
        full: "rounded-r-3xl",
        minimal: "rounded-r-xl",
        sharp: "rounded-none",
      },
      bordered: {
        true: "border-r border-graphite-border",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      behavior: "push",
      shape: "minimal",
      bordered: true,
    },
  }
);

// --- SUB-COMPONENTS ---

const NavigationRailScreen: React.FC<ScreenProps> = () => {
  return null;
};
NavigationRailScreen.displayName = "NavigationRail.Screen";

// --- CUSTOM FAB FOR NAVIGATION RAIL ---

export interface NavigationRailFABProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  /** The text label to show when the rail is expanded. */
  label?: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
}

const NavigationRailFAB = React.forwardRef<
  HTMLButtonElement,
  NavigationRailFABProps
>(({ icon, label, className, variant = "primary", ...props }, ref) => {
  const { isExpanded } = useNavigationRail();
  const localRef = useRef<HTMLButtonElement>(null);

  // Merge refs
  React.useImperativeHandle(ref, () => localRef.current!);

  // Add ripple effect
  const [, event] = useRipple({
    ref: localRef,
    color:
      variant === "primary"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)",
    duration: 400,
  });

  const variantClasses = {
    primary:
      "bg-graphite-primary text-graphite-primaryForeground hover:bg-graphite-primary/90 shadow-md hover:shadow-lg",
    secondary:
      "bg-graphite-secondary text-graphite-secondaryForeground hover:bg-graphite-secondary/80 shadow-sm hover:shadow-md",
    tertiary:
      "bg-white border border-graphite-border text-graphite-foreground hover:bg-gray-50 shadow-sm hover:shadow-md",
    ghost:
      "bg-transparent text-graphite-foreground hover:bg-black/5 shadow-none",
  };

  return (
    <div className="w-full px-4 mb-6 mt-2 flex justify-start">
      <motion.button
        ref={localRef}
        type="button"
        onPointerDown={event}
        layout // Crucial for smooth width resizing
        initial={false}
        animate={{
          width: isExpanded ? "auto" : "3.5rem", // 56px collapsed
          borderRadius: "1rem", // 16px (M3 Standard)
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          mass: 0.8,
        }}
        className={clsx(
          "h-14 relative flex items-center overflow-hidden transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {/* Icon: Fixed container to prevent squishing */}
        <motion.div
          layout="position"
          className="min-w-[3.5rem] h-full flex items-center justify-center shrink-0 z-10"
        >
          {icon}
        </motion.div>

        {/* Label: Animate presence for fading in/out */}
        <div className="flex items-center h-full overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            {isExpanded && label && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15, delay: 0.05 }}
                className="pr-6 font-semibold text-base whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
});
NavigationRailFAB.displayName = "NavigationRail.FAB";

// --- TAB ITEM ---

interface TabItemProps {
  screen: ScreenProps;
}

const TabItem: React.FC<TabItemProps> = ({ screen }) => {
  const { name, label, icon, shape: itemShape } = screen;
  const {
    activeTab,
    onTabPress,
    isExpanded,
    indicatorId,
    navigatorShape,
    variant,
  } = useNavigationRail();

  const isActive = activeTab === name;
  const finalShape = itemShape || navigatorShape;

  const localRef = useRef<HTMLButtonElement>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "var(--color-ripple-light)",
    duration: 400,
  });

  const activeAndHoverBg =
    variant === "secondary" ? "bg-graphite-card" : "bg-graphite-secondary";

  const shapeToBorderRadius = {
    full: 9999,
    minimal: 12,
    sharp: 0,
  };

  const shapeToClassName = {
    full: "rounded-full",
    minimal: "rounded-lg",
    sharp: "rounded-none",
  };

  return (
    <li className="w-full">
      <button
        ref={localRef}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onTabPress(name)}
        onPointerDown={event}
        className={clsx(
          "relative z-10 flex h-14 w-full items-center justify-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2",
          "flex-row gap-4 px-4 py-2",
          isActive
            ? "text-graphite-primary font-semibold"
            : "text-graphite-foreground/70",
          shapeToClassName[finalShape],
          !isActive && [
            `after:absolute after:inset-0 after:z-[-1] after:${activeAndHoverBg} after:opacity-0 after:scale-70 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out`,
            "hover:after:opacity-100 hover:after:scale-100",
            "disabled:after:opacity-0",
          ]
        )}
      >
        {isActive && (
          <motion.div
            layoutId={indicatorId}
            className={clsx("absolute inset-0 z-0", activeAndHoverBg)}
            style={{ borderRadius: shapeToBorderRadius[finalShape] }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 1.2,
            }}
          />
        )}
        <div className="relative z-10">{icon({ isActive })}</div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: "auto",
                opacity: 1,
                transition: { delay: 0.1, duration: 0.2 },
              }}
              exit={{ width: 0, opacity: 0, transition: { duration: 0.1 } }}
              className="relative z-10 overflow-hidden whitespace-nowrap"
            >
              <Typography variant="small" className="font-semibold">
                {label}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </li>
  );
};

// --- NAVIGATOR COMPONENT ---

interface NavigatorProps extends React.HTMLAttributes<HTMLElement> {
  shape?: "full" | "minimal" | "sharp";
  bordered?: boolean;
  children: React.ReactNode;
  activeTab: string;
  onTabPress: (name: string) => void;
  variant?: "primary" | "secondary" | "ghost";
  width?: string | number;
  expandedWidth?: string | number;
}

const NavigationRailNavigator: React.FC<NavigatorProps> = ({
  children,
  activeTab,
  onTabPress,
  shape = "minimal",
  bordered = true,
  variant = "primary",
  width = "6rem",
  expandedWidth = "auto",
  className,
  style,
  ...props
}) => {
  const indicatorId = React.useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Separate children into Screens and FAB
  const childrenArray = Children.toArray(children);

  const screens = childrenArray
    .filter(
      (child): child is React.ReactElement<ScreenProps> =>
        React.isValidElement(child) && child.type === NavigationRailScreen
    )
    .map((child) => child.props);

  const fab = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === NavigationRailFAB
  );

  const contextValue = useMemo(
    () => ({
      activeTab,
      onTabPress,
      isExpanded,
      navigatorShape: shape,
      indicatorId,
      variant,
    }),
    [activeTab, onTabPress, isExpanded, shape, indicatorId, variant]
  );

  const behavior = isMobile ? "overlay" : "push";
  const finalExpandedWidth =
    typeof expandedWidth === "number" ? `${expandedWidth}px` : expandedWidth;
  const finalCollapsedWidth = typeof width === "number" ? `${width}px` : width;

  return (
    <NavigationRailContext.Provider value={contextValue}>
      {/* Spacer for overlay mode to prevent content jump */}
      {isMobile && (
        <div style={{ width: finalCollapsedWidth, flexShrink: 0 }} />
      )}

      <AnimatePresence>
        {isExpanded && behavior === "overlay" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-graphite-secondary/80 z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.nav
        className={clsx(
          navigatorVariants({
            behavior,
            shape,
            bordered,
            variant:
              isExpanded && variant === "ghost" && isMobile
                ? "primary"
                : variant,
            className,
          })
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          width: isExpanded ? finalExpandedWidth : finalCollapsedWidth,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 24,
          mass: 0.9,
        }}
        style={{
          display: "block",
          minWidth: "96px",
          ...style,
        }}
        {...props}
      >
        {/* Header (Menu Toggle) */}
        <div
          className={clsx(
            "flex h-20 w-full shrink-0 items-center justify-end p-4 pr-7"
          )}
        >
          <IconButton
            variant="ghost"
            size="md"
            shape="minimal"
            onClick={isMobile ? toggleExpanded : undefined}
            aria-label={isExpanded ? "Collapse Menu" : "Expand Menu"}
          >
            {isExpanded ? <ChevronLeft /> : <Menu />}
          </IconButton>
        </div>

        {/* FAB Area - Placed at the top, below header */}
        {fab && <div className="shrink-0">{fab}</div>}
        {/* Screens - Centered vertically */}
        <ul className="flex flex-1 flex-col items-center justify-start gap-2 p-4 pt-0 pr-6">
          <Divider variant="dashed" />
          {screens.map((screen) => (
            <TabItem key={screen.name} screen={screen} />
          ))}
        </ul>
      </motion.nav>
    </NavigationRailContext.Provider>
  );
};
NavigationRailNavigator.displayName = "NavigationRail.Navigator";

export const NavigationRail = {
  Navigator: NavigationRailNavigator,
  Screen: NavigationRailScreen,
  FAB: NavigationRailFAB,
};
