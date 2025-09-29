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
}

interface BottomTabsContextProps {
  activeTab: string;
  onTabPress: (name: string) => void;
  variant: "contained" | "full-width";
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

// --- CVA VARIANTS ---

const navigatorVariants = cva("w-full", {
  variants: {
    variant: {
      contained: "bg-graphite-card shadow-lg",
      "full-width": "bg-graphite-card border-t border-graphite-border",
    },
    shape: {
      full: "rounded-full",
      minimal: "rounded-xl",
      sharp: "rounded-none",
    },
  },
  defaultVariants: {
    variant: "contained",
    shape: "full",
  },
});

// --- SCREEN COMPONENT (CONFIG ONLY) ---

const BottomTabsScreen: React.FC<ScreenProps> = () => {
  // This component is only for configuration and does not render anything itself.
  return null;
};
BottomTabsScreen.displayName = "BottomTabs.Screen";

// --- TAB ITEM (INTERNAL) ---

interface TabItemProps {
  screen: ScreenProps;
}

const TabItem: React.FC<TabItemProps> = ({ screen }) => {
  const { name, label, icon } = screen;
  const { activeTab, onTabPress, variant, indicatorId } = useBottomTabs();
  const isActive = activeTab === name;

  const localRef = useRef<HTMLButtonElement>(null);
  const [, event] = useRipple({
    ref: localRef,
    color: "rgba(0, 0, 0, 0.1)",
    duration: 400,
  });

  // The layout changes for the 'full-width' variant when active
  const isHorizontal = variant === "full-width" && isActive;

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
          // Layout and padding
          isHorizontal ? "flex-row gap-2 px-4 py-2" : "flex-col gap-1 p-2",
          isActive
            ? "text-graphite-primary font-semibold"
            : "text-graphite-foreground/70",
          variant === "contained" ? "rounded-full" : "rounded-lg"
        )}
      >
        {/* Active State Indicator Pill */}
        {isActive && (
          <motion.div
            layoutId={indicatorId}
            className="absolute inset-0 z-0 bg-graphite-secondary"
            style={{ borderRadius: 9999 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}

        {/* Icon */}
        <div className="relative z-10">{icon({ isActive })}</div>

        {/* Label */}
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

// --- NAVIGATOR COMPONENT ---

interface NavigatorProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof navigatorVariants> {
  children: React.ReactElement<ScreenProps> | React.ReactElement<ScreenProps>[];
  activeTab: string;
  onTabPress: (name: string) => void;
}

const BottomTabsNavigator: React.FC<NavigatorProps> = ({
  children,
  activeTab,
  onTabPress,
  variant = "contained",
  shape = "full",
  className,
  ...props
}) => {
  // Use a unique ID for the layout animation so multiple nav bars don't conflict
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
    () => ({ activeTab, onTabPress, variant, indicatorId }),
    [activeTab, onTabPress, variant, indicatorId]
  );

  return (
    <BottomTabsContext.Provider value={contextValue}>
      <nav
        className={clsx(
          variant === "contained" && "p-2", // Add padding only for the contained variant
          navigatorVariants({ variant, shape, className })
        )}
        {...props}
      >
        <ul className="flex items-center justify-around gap-2">
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
