"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppBar } from "../appbar";
import { IconButton } from "../icon-button";
import { STACK_TRANSITIONS } from "./transitions";
import type {
  NavigationEvent,
  NavigationEventCallback,
  NavigationProp,
  Route,
  RouteProp,
  StackNavigationState,
  StackScreenComponent,
} from "./types";

// --- Contexts ---
const NavigationContext = createContext<NavigationProp<any> | undefined>(
  undefined
);
const RouteContext = createContext<Route<any, any> | undefined>(undefined);

// --- Hooks ---
export function useNavigation<T extends Record<string, object | undefined>>() {
  const navigation = useContext(NavigationContext);
  if (!navigation) {
    throw new Error(
      "useNavigation must be used within a screen of a StackNavigator."
    );
  }
  return navigation as NavigationProp<T>;
}

export function useRoute<
  T extends Record<string, object | undefined>,
  R extends keyof T
>() {
  const route = useContext(RouteContext);
  if (!route) {
    throw new Error(
      "useRoute must be used within a screen of a StackNavigator."
    );
  }
  return route as RouteProp<T, R>;
}

// --- Internal Header Component ---
const Header = <T extends Record<string, object | undefined>>({
  screen,
  navigation,
  scrollContainerRef,
}: {
  screen: StackScreenComponent<T, keyof T>["props"] | undefined;
  navigation: NavigationProp<T>;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}) => {
  if (!screen) return null;

  const options = screen.options || {};
  if (options.headerShown === false) return null;

  const title = options.headerTitle || options.title || screen.name;

  const HeaderLeft = () => {
    if (options.headerLeft)
      return options.headerLeft({ canGoBack: navigation.canGoBack() });
    if (navigation.canGoBack()) {
      return (
        <IconButton variant="ghost" onClick={navigation.goBack}>
          <ArrowLeft />
        </IconButton>
      );
    }
    return null;
  };

  const HeaderRight = () => {
    if (options.headerRight)
      return options.headerRight({ canGoBack: navigation.canGoBack() });
    return null;
  };

  return (
    <AppBar
      {...options.appBarProps}
      scrollContainerRef={scrollContainerRef}
      appBarColor={options.headerStyle?.backgroundColor || "card"}
      startAdornment={<HeaderLeft />}
      endAdornments={
        HeaderRight() ? [<HeaderRight key="header-right" />] : undefined
      }
    >
      {typeof title === "function" ? title({}) : (title as React.ReactNode)}
    </AppBar>
  );
};

// --- Main Navigator Logic ---
interface StackNavigatorProps<T extends Record<string, object | undefined>> {
  initialRouteName: keyof T;
  children:
    | React.ReactElement<StackScreenComponent<T, keyof T>["props"]>
    | React.ReactElement<StackScreenComponent<T, keyof T>["props"]>[];
}

const StackNavigator = <T extends Record<string, object | undefined>>({
  initialRouteName,
  children,
}: StackNavigatorProps<T>) => {
  const screens = useMemo(() => {
    const screenConfig: Record<
      string,
      StackScreenComponent<T, keyof T>["props"]
    > = {};
    React.Children.forEach(
      children,
      (
        child: React.ReactElement<StackScreenComponent<T, keyof T>["props"]>
      ) => {
        if (React.isValidElement(child)) {
          screenConfig[child.props.name as string] = child.props;
        }
      }
    );
    return screenConfig;
  }, [children]);

  const [state, setState] = useState<StackNavigationState<T>>({
    index: 0,
    routes: [
      {
        key: `${String(initialRouteName)}-${Date.now()}`,
        name: initialRouteName,
        params: undefined,
      },
    ],
  });

  const listeners = useRef<
    Record<NavigationEvent, Set<NavigationEventCallback>>
  >({
    transitionStart: new Set(),
    transitionEnd: new Set(),
  }).current;

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const currentRoute = state.routes[state.index];
  const screen = screens[currentRoute.name as string];

  // Get the animation config from the currently active screen
  const activeScreenOptions =
    typeof screen?.options === "function"
      ? screen.options({ route: currentRoute as any })
      : screen?.options || {};

  const activeAnimationOption = activeScreenOptions.animation || "default";
  const activeAnimationConfig =
    typeof activeAnimationOption === "string"
      ? STACK_TRANSITIONS[activeAnimationOption] || STACK_TRANSITIONS.default
      : activeAnimationOption;

  const navigation = useMemo((): NavigationProp<T> => {
    const canGoBack = () => state.index > 0;

    const performNavigation = (
      updater: (prevState: StackNavigationState<T>) => StackNavigationState<T>
    ) => {
      setState(updater);
    };

    return {
      navigate: (name, params) => {
        performNavigation((prevState) => {
          const newRoute: Route<T, keyof T> = {
            key: `${String(name)}-${Date.now()}`,
            name,
            params,
          };
          return {
            index: prevState.routes.length,
            routes: [...prevState.routes, newRoute],
          };
        });
      },
      push: (name, params) => {
        performNavigation((prevState) => {
          const newRoute: Route<T, keyof T> = {
            key: `${String(name)}-${Date.now()}`,
            name,
            params,
          };
          return {
            index: prevState.routes.length,
            routes: [...prevState.routes, newRoute],
          };
        });
      },
      replace: (name, params) => {
        performNavigation((prevState) => {
          const newRoute: Route<T, keyof T> = {
            key: `${String(name)}-${Date.now()}`,
            name,
            params,
          };
          const newRoutes = [...prevState.routes.slice(0, -1), newRoute];
          return {
            index: newRoutes.length - 1,
            routes: newRoutes,
          };
        });
      },
      goBack: () => {
        if (canGoBack()) {
          performNavigation((prevState) => {
            const newRoutes = prevState.routes.slice(0, -1);
            return {
              index: newRoutes.length - 1,
              routes: newRoutes,
            };
          });
        }
      },
      pop: (count = 1) => {
        if (canGoBack()) {
          performNavigation((prevState) => {
            const newRoutes = prevState.routes.slice(
              0,
              prevState.routes.length - count
            );
            return {
              index: newRoutes.length - 1,
              routes: newRoutes,
            };
          });
        }
      },
      popToTop: () => {
        if (canGoBack()) {
          performNavigation((prevState) => ({
            index: 0,
            routes: [prevState.routes[0]],
          }));
        }
      },
      canGoBack,
      addListener: (event, callback) => {
        listeners[event].add(callback);
        return () => listeners[event].delete(callback);
      },
      removeListener: (event, callback) => {
        listeners[event].delete(callback);
      },
      scrollContainerRef,
    };
  }, [state.index, listeners]);

  const handleAnimationStart = (isPop: boolean) => {
    listeners.transitionStart.forEach((cb) => cb({ data: { closing: isPop } }));
  };

  const handleAnimationComplete = (isPop: boolean) => {
    listeners.transitionEnd.forEach((cb) => cb({ data: { closing: isPop } }));
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-graphite-background">
      <Header
        screen={screen}
        navigation={navigation}
        scrollContainerRef={scrollContainerRef}
      />
      <div className="relative h-full w-full">
        <AnimatePresence
          initial={false}
          onExitComplete={() => handleAnimationComplete(true)}
        >
          {state.routes.map((route, index) => {
            const Component = screens[route.name as string].component;

            const isActive = index === state.index;
            const variantName = isActive ? "center" : "behind";

            // Use the active screen's animation config for all screens
            return (
              <motion.div
                key={route.key}
                variants={activeAnimationConfig.variants}
                transition={activeAnimationConfig.transition}
                initial="enter"
                animate={variantName}
                exit="exit"
                onAnimationStart={
                  isActive ? () => handleAnimationStart(false) : undefined
                }
                onAnimationComplete={
                  isActive ? () => handleAnimationComplete(false) : undefined
                }
                style={{
                  zIndex: index,
                  boxShadow:
                    typeof activeAnimationOption === "string" &&
                    activeAnimationOption.startsWith("slide") &&
                    isActive
                      ? "-5px 0px 15px rgba(0, 0, 0, 0.1)"
                      : undefined,
                }}
                className="absolute inset-x-0 bottom-0 top-0 bg-graphite-background"
              >
                <NavigationContext.Provider value={navigation}>
                  <RouteContext.Provider value={route}>
                    <Component
                      navigation={navigation}
                      route={route as RouteProp<T, keyof T>}
                    />
                  </RouteContext.Provider>
                </NavigationContext.Provider>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Factory Function ---
export function createStackNavigator<
  T extends Record<string, object | undefined>
>() {
  const Screen = <R extends keyof T>(
    _props: StackScreenComponent<T, R>["props"]
  ) => {
    return null;
  };

  return {
    Navigator: (props: StackNavigatorProps<T>) => <StackNavigator {...props} />,
    Screen,
  };
}
