"use client";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  Children,
  createContext,
  useContext,
  useMemo,
  useRef,
} from "react";
import useRipple from "use-ripple-hook";
import { Typography } from "../typography";

// --- TYPE DEFINITIONS & CONTEXT ---

export type BottomTabsSize = "sm" | "md" | "lg";
export type BottomTabsVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "surface"
  | "ghost";
export type BottomTabsItemVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "ghost";

export interface BottomTabsScreenProps {
  name: string;
  label: React.ReactNode;
  icon: (props: { isActive: boolean; size: number }) => React.ReactNode;
  shape?: "full" | "minimal" | "sharp";
}

interface BottomTabsContextProps {
  activeTab: string;
  onTabPress: (name: string) => void;
  itemLayout: "stacked" | "inline";
  mode: "attached" | "detached";
  navigatorShape: "full" | "minimal" | "sharp";
  indicatorId: string;
  showLabels: boolean;
  size: BottomTabsSize;
  variant: BottomTabsVariant;
  itemVariant: BottomTabsItemVariant;
  pillStyle: "full" | "icon";
  disableRipple: boolean;
  indicatorAnimation: "slide" | "bloom";
}

const BottomTabsContext = createContext<BottomTabsContextProps | null>(null);
const useBottomTabs = () => {
  const context = useContext(BottomTabsContext);
  if (!context) {
    throw new Error(
      "BottomTabs components must be used within a <BottomTabs.Navigator>",
    );
  }
  return context;
};

// --- CVA VARIANTS ---

const navigatorVariants = cva("w-full transition-all duration-300", {
  variants: {
    variant: {
      primary: "bg-surface-container-low text-on-surface",
      secondary: "bg-surface-container text-on-surface",
      tertiary: "bg-tertiary-container text-on-tertiary-container",
      surface: "bg-surface text-on-surface",
      ghost: "bg-transparent text-on-surface",
    },
    mode: {
      attached: "",
      detached: "p-2",
    },
    shape: {
      full: "",
      minimal: "",
      sharp: "rounded-none",
    },
    bordered: {
      true: "border-t border-outline-variant",
      false: "",
    },
    shadow: {
      none: "shadow-none",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
    },
  },
  compoundVariants: [
    { mode: "detached", shape: "full", className: "rounded-full" },
    { mode: "detached", shape: "minimal", className: "rounded-xl" },
    { mode: "attached", shape: "full", className: "rounded-t-3xl" },
    { mode: "attached", shape: "minimal", className: "rounded-t-xl" },
    { variant: "tertiary", bordered: true, className: "!border-transparent" },
  ],
  defaultVariants: {
    variant: "secondary",
    mode: "attached",
    shape: "full",
  },
});

const BottomTabsScreen: React.FC<BottomTabsScreenProps> = () => {
  return null;
};
BottomTabsScreen.displayName = "BottomTabs.Screen";

// --- TAB ITEM ---

interface TabItemProps {
  screen: BottomTabsScreenProps;
}

const TabItem: React.FC<TabItemProps> = ({ screen }) => {
  const { name, label, icon, shape: itemShape } = screen;
  const {
    activeTab,
    onTabPress,
    itemLayout,
    indicatorId,
    navigatorShape,
    showLabels,
    size,
    itemVariant,
    pillStyle,
    disableRipple,
    indicatorAnimation,
  } = useBottomTabs();

  const isActive = activeTab === name;
  const finalShape = itemShape || navigatorShape;
  const isIconPill = pillStyle === "icon";

  const localRef = useRef<HTMLButtonElement>(null);

  // Determine colors based on itemVariant
  let activeIndicatorClass = "bg-secondary-container";
  let activeTextClass = "text-on-secondary-container";
  let rippleColor = "var(--color-ripple-dark)";

  switch (itemVariant) {
    case "primary":
      activeIndicatorClass = "bg-primary";
      activeTextClass = "text-on-primary";
      rippleColor = "var(--color-ripple-light)";
      break;
    case "tertiary":
      activeIndicatorClass = "bg-tertiary-container";
      activeTextClass = "text-on-tertiary-container";
      rippleColor = "var(--color-ripple-dark)";
      break;
    case "ghost":
      activeIndicatorClass = "bg-transparent";
      activeTextClass = "text-primary";
      rippleColor = "var(--color-ripple-dark)";
      break;
    case "secondary":
    default:
      activeIndicatorClass = "bg-secondary-container";
      activeTextClass = "text-on-secondary-container";
      rippleColor = "var(--color-ripple-dark)";
      break;
  }

  const [, event] = useRipple({
    ref: localRef as React.RefObject<HTMLElement>,
    color: rippleColor,
    duration: 400,
  });

  const isShiftLayout = itemLayout === "inline";

  const sizeConfigs = {
    sm: {
      height: "h-12",
      iconSize: 20,
      typography: "label-small" as const,
    },
    md: {
      height: "h-16",
      iconSize: 24,
      typography: "label-medium" as const,
    },
    lg: {
      height: "h-20",
      iconSize: 28,
      typography: "label-large" as const,
    },
  };

  const config = sizeConfigs[size];

  const iconContainerSize = {
    sm: "w-12 h-7",
    md: "w-14 h-8",
    lg: "w-16 h-9",
  }[size];

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

  const buttonHasBloom = !isActive && !isIconPill;

  const iconColorClass = isActive
    ? isIconPill
      ? activeTextClass
      : "text-inherit"
    : "text-on-surface-variant";

  const isSlideAnim = indicatorAnimation === "slide";

  const sharedIndicatorProps = {
    layoutId: isSlideAnim ? indicatorId : undefined,
    initial: isSlideAnim ? false : { opacity: 0, scale: 0.7 },
    animate: isSlideAnim ? undefined : { opacity: 1, scale: 1 },
    exit: isSlideAnim ? undefined : { opacity: 0, scale: 0.7 },
    transition: isSlideAnim
      ? { type: "spring" as const, stiffness: 300, damping: 28, mass: 1 }
      : { duration: 0.3, ease: "easeOut" as const },
    className: clsx("absolute inset-0 z-0", activeIndicatorClass),
    style: { borderRadius: shapeToBorderRadius[finalShape] },
  };

  const iconContainer = (
    <div
      className={clsx(
        "relative flex items-center justify-center shrink-0 transition-colors",
        isIconPill ? iconContainerSize : "h-6 w-6",
        isIconPill && shapeToClassName[finalShape],
        isIconPill ? iconColorClass : "text-inherit",
        isIconPill &&
          !isActive && [
            // Hover effect strictly disabled while active
            "after:absolute after:inset-0 after:z-[-1] after:bg-on-surface/10 after:opacity-0 after:scale-70 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out",
            "group-hover:after:opacity-100 group-hover:after:scale-100",
          ],
      )}
    >
      <AnimatePresence>
        {isActive && isIconPill && <motion.div {...sharedIndicatorProps} />}
      </AnimatePresence>
      <div className="relative z-10 flex items-center justify-center">
        {icon({ isActive, size: config.iconSize })}
      </div>
    </div>
  );

  return (
    <li className="flex-1">
      <button
        ref={localRef}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onTabPress(name)}
        onPointerDown={disableRipple ? undefined : event}
        className={clsx(
          "relative z-10 flex w-full flex-col items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          config.height,
          isIconPill && "group",
          isActive
            ? isIconPill
              ? "text-on-surface"
              : `${activeTextClass} font-semibold`
            : "text-on-surface-variant",
          shapeToClassName[finalShape],
          buttonHasBloom && [
            // Hover effect strictly disabled while active
            "after:absolute after:inset-0 after:z-[-1] after:bg-on-surface/10 after:opacity-0 after:scale-70 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out",
            "hover:after:opacity-100 hover:after:scale-100",
          ],
        )}
      >
        <AnimatePresence>
          {isActive && !isIconPill && <motion.div {...sharedIndicatorProps} />}
        </AnimatePresence>

        <motion.div
          layout
          className="relative z-10 flex flex-col items-center justify-center"
        >
          {iconContainer}

          {showLabels && (
            <AnimatePresence initial={false}>
              {(isActive || !isShiftLayout) && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: 4 }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 400, damping: 30 },
                  }}
                  exit={{ height: 0, opacity: 0, y: 4 }}
                  className="relative z-10 overflow-hidden whitespace-nowrap"
                >
                  <Typography
                    variant={config.typography}
                    className={clsx(
                      "mt-0.5 font-semibold leading-none",
                      !isActive && "opacity-80",
                    )}
                  >
                    {label}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </button>
    </li>
  );
};

// --- NAVIGATOR COMPONENT ---

interface NavigatorProps extends React.HTMLAttributes<HTMLElement> {
  mode?: "attached" | "detached";
  shape?: "full" | "minimal" | "sharp";
  size?: BottomTabsSize;
  variant?: BottomTabsVariant;
  itemVariant?: BottomTabsItemVariant;
  bordered?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
  children:
    | React.ReactElement<BottomTabsScreenProps>
    | React.ReactElement<BottomTabsScreenProps>[];
  activeTab: string;
  onTabPress: (name: string) => void;
  itemLayout?: "stacked" | "inline";
  showLabels?: boolean;
  pillStyle?: "full" | "icon";
  disableRipple?: boolean;
  indicatorAnimation?: "slide" | "bloom";
}

const BottomTabsNavigator: React.FC<NavigatorProps> = ({
  children,
  activeTab,
  onTabPress,
  mode = "attached",
  itemLayout = "stacked",
  shape = "full",
  size = "md",
  variant = "secondary",
  itemVariant = "secondary",
  bordered = true,
  shadow = "lg",
  showLabels = true,
  pillStyle = "full",
  disableRipple = false,
  indicatorAnimation = "slide",
  className,
  ...props
}) => {
  const indicatorId = React.useId();

  const screens = useMemo(
    () =>
      Children.toArray(children)
        .filter(
          (child): child is React.ReactElement<BottomTabsScreenProps> =>
            React.isValidElement(child) && child.type === BottomTabsScreen,
        )
        .map((child) => child.props),
    [children],
  );

  const contextValue = useMemo(
    () => ({
      activeTab,
      onTabPress,
      itemLayout,
      mode,
      navigatorShape: shape,
      indicatorId,
      showLabels,
      size,
      variant,
      itemVariant,
      pillStyle,
      disableRipple,
      indicatorAnimation,
    }),
    [
      activeTab,
      onTabPress,
      itemLayout,
      mode,
      shape,
      indicatorId,
      showLabels,
      size,
      variant,
      itemVariant,
      pillStyle,
      disableRipple,
      indicatorAnimation,
    ],
  );

  return (
    <BottomTabsContext.Provider value={contextValue}>
      <nav
        className={clsx(
          navigatorVariants({
            mode,
            shape,
            variant,
            bordered: mode === "attached" ? bordered : false,
            shadow: mode === "detached" ? shadow : undefined,
            className,
          }),
        )}
        {...props}
      >
        <ul className="flex items-center justify-around gap-2 p-1">
          {screens.map((screen) => (
            <TabItem key={screen.name} screen={screen} />
          ))}
        </ul>
      </nav>
    </BottomTabsContext.Provider>
  );
};
BottomTabsNavigator.displayName = "BottomTabs.Navigator";

export const BottomTabs = {
  Navigator: BottomTabsNavigator,
  Screen: BottomTabsScreen,
};
