"use client";

import { useMediaQuery } from "@uidotdev/usehooks";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Menu } from "lucide-react";
import React, {
  Children,
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import useRipple from "use-ripple-hook";
import { useLayout } from "../../context/layout-context";
import { Divider } from "../divider";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";

// --- TYPE DEFINITIONS & CONTEXT ---

export interface NavigationRailScreenProps {
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
  variant: "primary" | "secondary" | "tertiary" | "ghost" | "surface";
  itemVariant: "primary" | "secondary" | "tertiary" | "ghost";
  itemLayout: "stacked" | "inline";
  isRtl: boolean;
}

const NavigationRailContext = createContext<NavigationRailContextProps | null>(
  null,
);
const useNavigationRail = () => {
  const context = useContext(NavigationRailContext);
  if (!context) {
    throw new Error(
      "NavigationRail components must be used within a <NavigationRail.Navigator>",
    );
  }
  return context;
};

// --- CVA VARIANTS ---

const navigatorVariants = cva(
  "flex flex-col h-full transition-shadow duration-300 ease-in-out z-20 overflow-hidden text-on-surface",
  {
    variants: {
      variant: {
        primary: "bg-surface-container-low",
        secondary: "bg-surface-container-high",
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        surface: "bg-surface",
        ghost: "bg-transparent",
      },
      behavior: {
        push: "relative",
        overlay: "absolute",
      },
      shape: {
        full: "rounded-e-3xl",
        minimal: "rounded-e-xl",
        sharp: "rounded-none",
      },
      bordered: {
        true: "border-e border-outline-variant",
        false: "",
      },
    },
    compoundVariants: [
      { variant: "tertiary", bordered: true, className: "border-transparent!" },
    ],
    defaultVariants: {
      variant: "primary",
      behavior: "push",
      shape: "minimal",
      bordered: true,
    },
  },
);

// --- SUB-COMPONENTS ---

const NavigationRailScreen: React.FC<NavigationRailScreenProps> = () => {
  return null;
};
NavigationRailScreen.displayName = "NavigationRail.Screen";

// --- CUSTOM FAB FOR NAVIGATION RAIL ---

export interface NavigationRailFABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
}

const NavigationRailFAB = React.forwardRef<
  HTMLButtonElement,
  NavigationRailFABProps
>(({ icon, label, className, variant: propVariant, ...props }, ref) => {
  const { isExpanded, itemVariant, itemLayout, isRtl } = useNavigationRail();
  const variant =
    propVariant || (itemVariant === "ghost" ? "secondary" : "primary");
  const isStacked = itemLayout === "stacked";

  const localRef = useRef<HTMLButtonElement>(null);
  // @ts-ignore
  React.useImperativeHandle(ref, () => localRef.current!);

  const [, event] = useRipple({
    // @ts-ignore
    ref: localRef,
    color:
      variant === "primary"
        ? "var(--color-ripple-dark)"
        : "var(--color-ripple-light)",
    duration: 400,
  });

  const variantClasses = {
    primary:
      "bg-primary-container text-on-primary-container hover:bg-primary-container/90 shadow-md hover:shadow-lg",
    secondary:
      "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 shadow-sm hover:shadow-md",
    tertiary:
      "bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/80 shadow-sm hover:shadow-md",
    ghost:
      "bg-transparent text-on-surface hover:bg-surface-container-highest/50 shadow-none",
  };

  const slideX = isRtl ? 5 : -5;

  return (
    <div
      className={clsx(
        "w-full mb-6 mt-2 flex",
        // Center the FAB properly when in stacked mode
        isStacked ? "justify-center px-0" : "justify-start px-4",
      )}
    >
      {/* @ts-ignore */}
      <motion.button
        ref={localRef}
        type="button"
        onPointerDown={event}
        layout
        initial={false}
        animate={{
          width:
            isExpanded && !isStacked
              ? Math.max(140, (label?.toString().length || 0) * 12 + 60)
              : "3.5rem",
          borderRadius: "1rem",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 24,
          mass: 1,
        }}
        className={clsx(
          "h-14 relative flex items-center overflow-hidden transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isStacked && "justify-center",
          variantClasses[variant],
          className,
        )}
        // @ts-ignore
        {...props}
      >
        <motion.div
          layout="position"
          className="min-w-[3.5rem] h-full flex items-center justify-center shrink-0 z-10"
        >
          {icon}
        </motion.div>

        <div className="flex items-center h-full overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            {isExpanded && !isStacked && label && (
              <motion.span
                initial={{ opacity: 0, x: slideX }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideX }}
                transition={{ duration: 0.15, delay: 0.05 }}
                className="pe-6 font-semibold text-base text-inherit whitespace-nowrap"
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
  screen: NavigationRailScreenProps;
}

const TabItem: React.FC<TabItemProps> = ({ screen }) => {
  const { name, label, icon, shape: itemShape } = screen;
  const {
    activeTab,
    onTabPress,
    isExpanded,
    indicatorId,
    navigatorShape,
    itemVariant,
    itemLayout,
  } = useNavigationRail();

  const isActive = activeTab === name;
  const finalShape = itemShape || navigatorShape;
  const isStacked = itemLayout === "stacked";

  const localRef = useRef<HTMLButtonElement>(null);

  const isSolidFilled =
    isActive && (itemVariant === "primary" || itemVariant === "tertiary");
  const rippleColor = isSolidFilled
    ? "var(--color-ripple-light)"
    : "var(--color-ripple-dark)";

  const [, event] = useRipple({
    // @ts-ignore
    ref: localRef,
    color: rippleColor,
    duration: 400,
  });

  let activeBg = "bg-secondary-container";
  let activeText = "text-on-secondary-container";

  if (itemVariant === "primary") {
    activeBg = "bg-primary";
    activeText = "text-on-primary";
  } else if (itemVariant === "tertiary") {
    activeBg = "bg-tertiary-container";
    activeText = "text-on-tertiary-container";
  } else if (itemVariant === "ghost") {
    activeBg = "bg-transparent";
    activeText = "text-primary font-bold";
  }

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
    <li className={clsx("flex justify-center", !isStacked && "w-full")}>
      <button
        ref={localRef}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onTabPress(name)}
        onPointerDown={event}
        className={clsx(
          "relative z-10 flex transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          // Force a 1:1 square aspect ratio when stacked
          isStacked
            ? "flex-col items-center justify-center gap-1 h-[4.5rem] w-[4.5rem] px-1"
            : "flex-row items-center justify-start gap-4 px-4 py-2 h-14 w-full",
          isActive ? `${activeText} font-semibold` : "text-on-surface-variant",
          shapeToClassName[finalShape],
          !isActive && [
            `after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 after:opacity-0 after:scale-70 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out`,
            "hover:after:opacity-100 hover:after:scale-100",
            "disabled:after:opacity-0",
          ],
        )}
      >
        {isActive && (
          <motion.div
            layoutId={indicatorId}
            className={clsx("absolute inset-0 z-0", activeBg)}
            style={{ borderRadius: shapeToBorderRadius[finalShape] }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              mass: 1.2,
            }}
          />
        )}
        <div
          className={clsx(
            "relative z-10 flex items-center justify-center shrink-0",
            isStacked ? "h-6" : "",
          )}
        >
          {icon({ isActive })}
        </div>

        {isStacked ? (
          <span className="relative z-10 text-[11px] font-semibold tracking-wide text-inherit truncate max-w-full mt-0.5">
            {label}
          </span>
        ) : (
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
                <Typography body-medium className="font-semibold text-inherit!">
                  {label}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        )}
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
  variant?: "primary" | "secondary" | "tertiary" | "ghost" | "surface";
  itemVariant?: "primary" | "secondary" | "tertiary" | "ghost";
  itemLayout?: "stacked" | "inline";
  width?: string | number;
  expandedWidth?: string | number;
  /** Force the rail to remain expanded on Desktop */
  forceExpanded?: boolean;
  /** Allow the rail to expand on hover (Desktop only). Defaults to false. */
  expandOnHover?: boolean;
  /** Forces the rail to act as an overlay (drawer) on desktop viewports. */
  overlay?: boolean;
  /** Allow the rail to expand. If false, it remains collapsed permanently. Defaults to true. */
  expandable?: boolean;
}

const NavigationRailNavigator: React.FC<NavigatorProps> = ({
  children,
  activeTab,
  onTabPress,
  shape = "minimal",
  bordered = true,
  variant = "primary",
  itemVariant = "secondary",
  itemLayout = "inline",
  width = "6rem",
  expandedWidth = "12rem",
  forceExpanded = false,
  expandOnHover = false,
  overlay = false,
  expandable = true,
  className,
  style,
  ...props
}) => {
  const indicatorId = React.useId();
  // Internal state for hover/manual toggling
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isRtl } = useLayout();

  // If on mobile, force the layout to be inline (mobile drawer style)
  const effectiveItemLayout = isMobile ? "inline" : itemLayout;

  // If layout is stacked, it cannot be expanded
  const effectivelyExpandable =
    effectiveItemLayout === "stacked" ? false : expandable;

  // Determine effective expanded state respecting the expandable prop
  const isExpanded = effectivelyExpandable
    ? isMobile
      ? internalExpanded // Mobile uses manual toggle
      : forceExpanded || internalExpanded // Desktop uses force OR manual/hover
    : false; // If not expandable, it's never expanded

  const behavior = isMobile || overlay ? "overlay" : "push";
  const finalExpandedWidth =
    typeof expandedWidth === "number" ? `${expandedWidth}px` : expandedWidth;
  const finalCollapsedWidth = typeof width === "number" ? `${width}px` : width;

  const handleMouseEnter = () => {
    if (effectivelyExpandable && !isMobile && expandOnHover && !forceExpanded) {
      setInternalExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (effectivelyExpandable && !isMobile && expandOnHover && !forceExpanded) {
      setInternalExpanded(false);
    }
  };

  const toggleExpanded = () => {
    if (effectivelyExpandable) {
      setInternalExpanded(!internalExpanded);
    }
  };

  const childrenArray = Children.toArray(children);
  const screens = childrenArray
    .filter(
      (child): child is React.ReactElement<NavigationRailScreenProps> =>
        React.isValidElement(child) && child.type === NavigationRailScreen,
    )
    .map((child) => child.props);

  const fab = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === NavigationRailFAB,
  );

  const contextValue = useMemo(
    () => ({
      activeTab,
      onTabPress,
      isExpanded,
      navigatorShape: shape,
      indicatorId,
      variant,
      itemVariant,
      itemLayout: effectiveItemLayout,
      isRtl,
    }),
    [
      activeTab,
      onTabPress,
      isExpanded,
      shape,
      indicatorId,
      variant,
      itemVariant,
      effectiveItemLayout,
      isRtl,
    ],
  );

  return (
    <NavigationRailContext.Provider value={contextValue}>
      {/* Spacer to hold the layout position when using absolute (overlay) positioning */}
      {behavior === "overlay" && (
        <div style={{ width: finalCollapsedWidth, flexShrink: 0 }} />
      )}

      {/* Dimmed backdrop for overlay modes when expanded */}
      <AnimatePresence>
        {isExpanded && behavior === "overlay" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-10"
            onClick={() => setInternalExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* @ts-ignore */}
      <motion.nav
        className={clsx(
          navigatorVariants({
            behavior,
            shape,
            bordered,
            variant,
            className,
          }),
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
        // @ts-ignore
        {...props}
      >
        <div
          className={clsx(
            "flex h-20 w-full shrink-0 items-center",
            // Keep padding symmetric if stacked, otherwise keep standard placement
            effectiveItemLayout === "stacked"
              ? "justify-center p-4"
              : "justify-end p-4 pe-7",
          )}
        >
          {/* Hide toggle button if not expandable or if forced expanded on Desktop */}
          {effectivelyExpandable && (!forceExpanded || isMobile) && (
            <IconButton
              variant="ghost"
              size="md"
              shape="minimal"
              onClick={isMobile || !expandOnHover ? toggleExpanded : undefined}
              aria-label={isExpanded ? "Collapse Menu" : "Expand Menu"}
            >
              {isExpanded ? (
                <ChevronLeft
                  className={clsx("w-5 h-5", isRtl && "rotate-180")}
                />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </IconButton>
          )}
        </div>

        {fab && <div className="shrink-0">{fab}</div>}
        <ul
          className={clsx(
            "flex flex-1 flex-col items-center justify-start gap-2 pt-0",
            // Fix asymmetric padding when stacked
            effectiveItemLayout === "stacked"
              ? "px-2 w-full"
              : "p-4 pe-6 w-full",
          )}
        >
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
