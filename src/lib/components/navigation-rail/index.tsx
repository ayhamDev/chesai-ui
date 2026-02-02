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
  itemVariant: "primary" | "secondary" | "tertiary" | "ghost"; // Controls item look
  isRtl: boolean; // Add isRtl to internal context
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
        // Changed to logical properties (rounded-e-* handles right in LTR, left in RTL)
        full: "rounded-e-3xl",
        minimal: "rounded-e-xl",
        sharp: "rounded-none",
      },
      bordered: {
        // Changed to logical property (border-e handles right in LTR, left in RTL)
        true: "border-e border-outline-variant",
        false: "",
      },
    },
    compoundVariants: [
      // Tertiary shouldn't have a border usually as it's colored
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
  // Use context itemVariant to influence default if prop not provided
  const { isExpanded, itemVariant, isRtl } = useNavigationRail();
  const variant =
    propVariant || (itemVariant === "ghost" ? "secondary" : "primary");

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

  // Determine slide direction based on RTL
  const slideX = isRtl ? 5 : -5;

  return (
    <div className="w-full px-4 mb-6 mt-2 flex justify-start">
      {/* @ts-ignore */}
      <motion.button
        ref={localRef}
        type="button"
        onPointerDown={event}
        layout
        initial={false}
        animate={{
          width: isExpanded
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
            {isExpanded && label && (
              <motion.span
                initial={{ opacity: 0, x: slideX }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideX }}
                transition={{ duration: 0.15, delay: 0.05 }}
                // Changed pr-6 to pe-6 (padding-end) for RTL support
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
  } = useNavigationRail();

  const isActive = activeTab === name;
  const finalShape = itemShape || navigatorShape;

  const localRef = useRef<HTMLButtonElement>(null);

  // Dynamic Ripple based on itemVariant and active state
  // Solid active states (primary/tertiary) usually need lighter ripple on dark text,
  // or darker ripple on light text. Standard MD3 -> Primary/Tertiary are filled.
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

  // Highlight color based on itemVariant
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
    <li className="w-full">
      <button
        ref={localRef}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onTabPress(name)}
        onPointerDown={event}
        className={clsx(
          "relative z-10 flex h-14 w-full items-center justify-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "flex-row gap-4 px-4 py-2",
          isActive ? `${activeText} font-semibold` : "text-on-surface-variant",
          shapeToClassName[finalShape],
          // Hover effect for non-active items
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
              <Typography variant="p" className="font-semibold text-inherit!">
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
  variant?: "primary" | "secondary" | "tertiary" | "ghost" | "surface"; // Background color
  itemVariant?: "primary" | "secondary" | "tertiary" | "ghost"; // Item style
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
  itemVariant = "secondary", // Default to standard MD3 secondary container
  width = "6rem",
  expandedWidth = "12rem",
  className,
  style,
  ...props
}) => {
  const indicatorId = React.useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isRtl } = useLayout(); // Access Layout Context

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
      isRtl,
    ],
  );

  const behavior = isMobile ? "overlay" : "push";
  const finalExpandedWidth =
    typeof expandedWidth === "number" ? `${expandedWidth}px` : expandedWidth;
  const finalCollapsedWidth = typeof width === "number" ? `${width}px` : width;

  return (
    <NavigationRailContext.Provider value={contextValue}>
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
            className="fixed inset-0 bg-black/50 z-10"
            onClick={() => setIsExpanded(false)}
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
            variant, // Uses separate background variant
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
            // Use pe-7 (padding-end) for the toggle button area
            "flex h-20 w-full shrink-0 items-center justify-end p-4 pe-7",
          )}
        >
          <IconButton
            variant="ghost"
            size="md"
            shape="minimal"
            onClick={isMobile ? toggleExpanded : undefined}
            aria-label={isExpanded ? "Collapse Menu" : "Expand Menu"}
          >
            {isExpanded ? (
              // Rotate arrow in RTL mode so it points correctly
              <ChevronLeft className={clsx("w-5 h-5", isRtl && "rotate-180")} />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </IconButton>
        </div>

        {fab && <div className="shrink-0">{fab}</div>}
        <ul className="flex flex-1 flex-col items-center justify-start gap-2 p-4 pt-0 pe-6">
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
