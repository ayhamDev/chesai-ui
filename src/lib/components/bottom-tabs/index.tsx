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

export interface BottomTabsScreenProps {
  name: string;
  label: React.ReactNode;
  icon: (props: { isActive: boolean }) => React.ReactNode;
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

const navigatorVariants = cva("w-full bg-surface-container", {
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
  ],
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
  } = useBottomTabs();

  const isActive = activeTab === name;
  const finalShape = itemShape || navigatorShape;

  const localRef = useRef<HTMLButtonElement>(null);
  const [, event] = useRipple({
    // FIX: Cast ref to HTMLElement
    ref: localRef as React.RefObject<HTMLElement>,
    color: "var(--color-ripple-dark)",
    duration: 400,
  });

  const isHorizontal = itemLayout === "inline" && isActive && showLabels;

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
    <li className="flex-1">
      <button
        ref={localRef}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onTabPress(name)}
        onPointerDown={event}
        className={clsx(
          "relative z-10 flex h-16 w-full items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          isHorizontal ? "flex-row gap-2 px-4 py-2" : "flex-col gap-1 p-2",
          isActive
            ? "text-on-secondary-container font-semibold"
            : "text-on-surface-variant",
          shapeToClassName[finalShape],
          !isActive && [
            "after:absolute after:inset-0 after:z-[-1] after:bg-secondary-container/50 after:opacity-0 after:scale-70 after:origin-center after:rounded-[inherit] after:transition-all after:duration-300 after:ease-out",
            "hover:after:opacity-100 hover:after:scale-100",
            "disabled:after:opacity-0",
          ],
        )}
      >
        {isActive && (
          <motion.div
            layoutId={indicatorId}
            className="absolute inset-0 z-0 bg-secondary-container"
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

        {showLabels && (
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
        )}
      </button>
    </li>
  );
};

// --- NAVIGATOR COMPONENT ---

interface NavigatorProps extends React.HTMLAttributes<HTMLElement> {
  mode?: "attached" | "detached";
  shape?: "full" | "minimal" | "sharp";
  bordered?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
  children:
    | React.ReactElement<BottomTabsScreenProps>
    | React.ReactElement<BottomTabsScreenProps>[];
  activeTab: string;
  onTabPress: (name: string) => void;
  itemLayout?: "stacked" | "inline";
  showLabels?: boolean;
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
  showLabels = true,
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
    }),
    [activeTab, onTabPress, itemLayout, mode, shape, indicatorId, showLabels],
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
