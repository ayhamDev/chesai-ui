"use client";

import { cva, type VariantProps } from "class-variance-authority";
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

export interface ScreenProps {
  /** A unique name for the screen. */
  name: string;
  /** The text label to display. */
  label: React.ReactNode;
  /** A function that returns the icon element, receiving active state. */
  icon: (props: { isActive: boolean }) => React.ReactNode;
  /** Overrides the shape of this specific tab item, indicator, and ripple effect. */
  shape?: "full" | "minimal" | "sharp";
}

interface BottomTabsContextProps {
  activeTab: string;
  onTabPress: (name: string) => void;
  itemLayout: "stacked" | "inline";
  mode: "attached" | "detached";
  /** The shape inherited from the parent navigator, used as a fallback. */
  navigatorShape: "full" | "minimal" | "sharp";
  indicatorId: string;
}

const BottomTabsContext = createContext<BottomTabsContextProps | null>(null);
const useBottomTabs = () => {
  const context = useContext(BottomTabsContext);
  if (!context) {
    throw new Error(
      "BottomTabs components must be used within a <BottomTabs.Navigator>"
    );
  }
  return context;
};

// --- CVA VARIANTS (REFACTORED) ---

const navigatorVariants = cva("w-full bg-graphite-card", {
  variants: {
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
      true: "border-t border-graphite-border",
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
  ],
});

// --- SCREEN COMPONENT (CONFIG ONLY) ---

const BottomTabsScreen: React.FC<ScreenProps> = () => {
  return null;
};
BottomTabsScreen.displayName = "BottomTabs.Screen";

// --- TAB ITEM (INTERNAL) ---

interface TabItemProps {
  screen: ScreenProps;
}

const TabItem: React.FC<TabItemProps> = ({ screen }) => {
  const { name, label, icon, shape: itemShape } = screen;
  const { activeTab, onTabPress, itemLayout, indicatorId, navigatorShape } =
    useBottomTabs();
  const isActive = activeTab === name;

  // If the item has its own shape, use it; otherwise, fall back to the navigator's shape.
  const finalShape = itemShape || navigatorShape;

  const localRef = useRef<HTMLButtonElement>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "rgba(0, 0, 0, 0.1)",
    duration: 400,
  });

  const isHorizontal = itemLayout === "inline" && isActive;

  const shapeToBorderRadius = {
    full: 9999,
    minimal: 12, // Corresponds to rounded-xl
    sharp: 0,
  };

  const shapeToClassName = {
    full: "rounded-full",
    minimal: "rounded-lg",
    sharp: "rounded-none",
  };

  return (
    <li className="flex-1">
      <button
        ref={localRef}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onTabPress(name)}
        onPointerDown={event}
        className={clsx(
          "relative z-10 flex h-16 w-full items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite-ring focus-visible:ring-offset-2",
          isHorizontal ? "flex-row gap-2 px-4 py-2" : "flex-col gap-1 p-2",
          isActive
            ? "text-graphite-primary font-semibold"
            : "text-graphite-foreground/70",
          shapeToClassName[finalShape] // Apply dynamic shape class for ripple
        )}
      >
        {isActive && (
          <motion.div
            layoutId={indicatorId}
            className="absolute inset-0 z-0 bg-graphite-secondary"
            // Apply dynamic border radius for indicator
            style={{ borderRadius: shapeToBorderRadius[finalShape] }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
        <div className="relative z-10">{icon({ isActive })}</div>
        <AnimatePresence>
          {isHorizontal ? (
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
          ) : (
            <div className="relative z-10">
              <Typography
                variant="small"
                className={isActive ? "font-semibold" : ""}
              >
                {label}
              </Typography>
            </div>
          )}
        </AnimatePresence>
      </button>
    </li>
  );
};

// --- NAVIGATOR COMPONENT (REFACTORED) ---

interface NavigatorProps extends React.HTMLAttributes<HTMLElement> {
  mode?: "attached" | "detached";
  shape?: "full" | "minimal" | "sharp";
  bordered?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
  children: React.ReactElement<ScreenProps> | React.ReactElement<ScreenProps>[];
  activeTab: string;
  onTabPress: (name: string) => void;
  itemLayout?: "stacked" | "inline";
}

const BottomTabsNavigator: React.FC<NavigatorProps> = ({
  children,
  activeTab,
  onTabPress,
  mode = "attached",
  itemLayout = "stacked",
  shape = "full",
  bordered = true,
  shadow = "lg",
  className,
  ...props
}) => {
  const indicatorId = React.useId();

  const screens = useMemo(
    () =>
      Children.toArray(children)
        .filter(
          (child): child is React.ReactElement<ScreenProps> =>
            React.isValidElement(child) && child.type === BottomTabsScreen
        )
        .map((child) => child.props),
    [children]
  );

  const contextValue = useMemo(
    () => ({
      activeTab,
      onTabPress,
      itemLayout,
      mode,
      navigatorShape: shape,
      indicatorId,
    }),
    [activeTab, onTabPress, itemLayout, mode, shape, indicatorId]
  );

  return (
    <BottomTabsContext.Provider value={contextValue}>
      <nav
        className={clsx(
          navigatorVariants({
            mode,
            shape,
            bordered: mode === "attached" ? bordered : false,
            shadow: mode === "detached" ? shadow : undefined,
            className,
          })
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

// --- EXPORT COMPOUND COMPONENT ---

export const BottomTabs = {
  Navigator: BottomTabsNavigator,
  Screen: BottomTabsScreen,
};
