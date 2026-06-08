// src/lib/components/navigation-rail/index.tsx
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
  pillStyle: "full" | "icon";
  disableRipple: boolean;
  indicatorAnimation: "slide" | "bloom";
}

const NavigationRailContext = createContext<NavigationRailContextProps | null>(
  null,
);

export const useNavigationRail = () => {
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

// --- CUSTOM COMPOSABLE HEADER ---

export interface NavigationRailHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const NavigationRailHeader: React.FC<NavigationRailHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "flex items-center w-full min-w-0 transition-all duration-300",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
NavigationRailHeader.displayName = "NavigationRail.Header";

// --- SECTION GROUP LABEL ---

export interface NavigationRailLabelProps extends React.HTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode;
}

const NavigationRailLabel: React.FC<NavigationRailLabelProps> = ({
  children,
  className,
  ...props
}) => {
  const { isExpanded, itemLayout } = useNavigationRail();
  const isStacked = itemLayout === "stacked";

  return (
    <li className="w-full list-none flex justify-start" {...props}>
      <AnimatePresence initial={false} mode="wait">
        {isExpanded && !isStacked ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className={clsx("w-full px-4 py-2 overflow-hidden", className)}
          >
            {typeof children === "string" ? (
              <Typography
                variant="label-small"
                className="text-on-surface-variant/70 uppercase tracking-widest font-bold block truncate"
              >
                {children}
              </Typography>
            ) : (
              children
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center py-2"
          >
            <div className="w-8 border-t border-outline-variant" />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};
NavigationRailLabel.displayName = "NavigationRail.Label";

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
  const { isExpanded, itemVariant, itemLayout, isRtl, disableRipple } =
    useNavigationRail();
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
        isStacked ? "justify-center px-0" : "justify-start px-4",
      )}
    >
      {/* @ts-ignore */}
      <motion.button
        ref={localRef}
        type="button"
        onPointerDown={disableRipple ? undefined : event}
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
          damping: 28,
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
    pillStyle,
    disableRipple,
    indicatorAnimation,
  } = useNavigationRail();

  const isActive = activeTab === name;
  const finalShape = itemShape || navigatorShape;
  const isStacked = itemLayout === "stacked";
  const isIconPill = pillStyle === "icon";

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
    full: 99,
    minimal: 12,
    sharp: 0,
  };

  const shapeToClassName = {
    full: "rounded-full",
    minimal: "rounded-lg",
    sharp: "rounded-none",
  };

  const buttonHasBloom = !isActive && !isIconPill;

  const isSlideAnim = indicatorAnimation === "slide";

  const sharedIndicatorProps = {
    layoutId: isSlideAnim ? indicatorId : undefined,
    initial: isSlideAnim ? false : { opacity: 0, scale: 0.7 },
    animate: isSlideAnim ? undefined : { opacity: 1, scale: 1 },
    exit: isSlideAnim ? undefined : { opacity: 0, scale: 0.7 },
    transition: isSlideAnim
      ? { type: "spring" as const, stiffness: 300, damping: 28, mass: 1 }
      : { duration: 0.3, ease: "easeOut" as const },
    className: clsx("absolute inset-0 z-0", activeBg),
    style: { borderRadius: shapeToBorderRadius[finalShape] },
  };

  return (
    <li
      className={clsx(
        "flex w-full",
        isStacked ? "justify-center" : "justify-start",
      )}
    >
      <button
        ref={localRef}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onTabPress(name)}
        onPointerDown={disableRipple ? undefined : event}
        className={clsx(
          "relative z-10 flex transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isIconPill && "group",
          isStacked
            ? "flex-col items-center justify-center gap-1 h-[4.5rem] w-[4.5rem] px-1"
            : "flex-row items-center justify-start gap-2 px-4 py-2 h-14 w-fit max-w-full",
          isActive
            ? isIconPill
              ? "text-on-surface"
              : `${activeText} font-semibold`
            : "text-on-surface-variant",
          shapeToClassName[finalShape],
          buttonHasBloom && [
            `after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 after:opacity-0 after:scale-70 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out`,
            "hover:after:opacity-100 hover:after:scale-100",
            "disabled:after:opacity-0",
          ],
        )}
      >
        <AnimatePresence>
          {isActive && !isIconPill && <motion.div {...sharedIndicatorProps} />}
        </AnimatePresence>

        <div
          className={clsx(
            "relative flex items-center justify-center shrink-0 transition-colors",
            isIconPill ? "w-14 h-8" : isStacked ? "h-6 w-6" : "h-6 w-6",
            isIconPill && shapeToClassName[finalShape],
            isIconPill
              ? isActive
                ? activeText
                : "text-on-surface-variant"
              : "text-inherit",
            isIconPill &&
              !isActive && [
                // Hover effect strictly disabled while active
                "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 after:opacity-0 after:scale-70 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out",
                "group-hover:after:opacity-100 group-hover:after:scale-100",
                "group-disabled:after:opacity-0",
              ],
          )}
        >
          <AnimatePresence>
            {isActive && isIconPill && <motion.div {...sharedIndicatorProps} />}
          </AnimatePresence>
          <div className="relative z-10 flex items-center justify-center">
            {icon({ isActive })}
          </div>
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
  forceExpanded?: boolean;
  expandOnHover?: boolean;
  overlay?: boolean;
  expandable?: boolean;
  pillStyle?: "full" | "icon";
  disableRipple?: boolean;
  indicatorAnimation?: "slide" | "bloom";
  /** Hides the menu/toggle button at the top of the rail */
  hideMenuButton?: boolean;
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
  pillStyle = "full",
  disableRipple = false,
  indicatorAnimation = "slide",
  hideMenuButton = false,
  className,
  style,
  ...props
}) => {
  const indicatorId = React.useId();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isRtl } = useLayout();

  const effectiveItemLayout = isMobile ? "inline" : itemLayout;
  const effectivelyExpandable =
    effectiveItemLayout === "stacked" ? false : expandable;

  const isExpanded = effectivelyExpandable
    ? isMobile
      ? internalExpanded
      : forceExpanded || internalExpanded
    : false;

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

  const header = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === NavigationRailHeader,
  );

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
      pillStyle,
      disableRipple,
      indicatorAnimation,
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
      pillStyle,
      disableRipple,
      indicatorAnimation,
    ],
  );

  return (
    <NavigationRailContext.Provider value={contextValue}>
      {behavior === "overlay" && (
        <div style={{ width: finalCollapsedWidth, flexShrink: 0 }} />
      )}

      <AnimatePresence>
        {isExpanded && behavior === "overlay" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-10 select-none"
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
          stiffness: 300,
          damping: 28,
          mass: 1,
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
            "flex h-20 w-full shrink-0 items-center px-4 gap-2",
            isExpanded && effectiveItemLayout !== "stacked"
              ? "justify-between"
              : "justify-center",
          )}
        >
          {header && <div className="min-w-0 flex-1">{header}</div>}

          {effectivelyExpandable &&
            (!forceExpanded || isMobile) &&
            !hideMenuButton && (
              <IconButton
                variant="ghost"
                size="md"
                shape="minimal"
                onClick={
                  isMobile || !expandOnHover ? toggleExpanded : undefined
                }
                className={clsx(isExpanded && "ml-auto")}
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

        {fab && <div className="shrink-0 pb-6">{fab}</div>}

        <ul
          className={clsx(
            "flex flex-1 flex-col items-center justify-start gap-2 pt-0 overflow-y-auto overflow-x-hidden",
            effectiveItemLayout === "stacked"
              ? "px-2 w-full"
              : "p-4 pe-6 w-full",
          )}
        >
          {childrenArray.map((child, index) => {
            if (!React.isValidElement(child)) return null;

            if (
              child.type === NavigationRailFAB ||
              child.type === NavigationRailHeader
            ) {
              return null;
            }

            if (child.type === NavigationRailScreen) {
              const screenChild = child as React.ReactElement<NavigationRailScreenProps>;
              return (
                <TabItem
                  key={screenChild.props.name || index}
                  screen={screenChild.props}
                />
              );
            }

            return React.cloneElement(child as React.ReactElement<any>, {
              key: child.key || index,
            });
          })}
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
  Header: NavigationRailHeader,
  Label: NavigationRailLabel,
};
