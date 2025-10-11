"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
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

// --- Main Navigator Logic (MODIFIED) ---
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

  // --- MODIFIED: State initialization from browser history ---
  const [state, setState] = useState<StackNavigationState<T>>(() => {
    if (
      typeof window !== "undefined" &&
      window.history.state &&
      window.history.state.routes
    ) {
      return window.history.state as StackNavigationState<T>;
    }
    return {
      index: 0,
      routes: [
        {
          key: `${String(initialRouteName)}-${Date.now()}`,
          name: initialRouteName,
          params: undefined,
        },
      ],
    };
  });

  const listeners = useRef<
    Record<NavigationEvent, Set<NavigationEventCallback>>
  >({
    transitionStart: new Set(),
    transitionEnd: new Set(),
  }).current;

  // --- MODIFIED: Sync initial state and listen for popstate events ---
  useLayoutEffect(() => {
    // On first load, if history.state is empty, replace it with our initial state.
    if (
      typeof window !== "undefined" &&
      (!window.history.state || !window.history.state.routes)
    ) {
      window.history.replaceState(state, "");
    }
  }, [state]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.routes) {
        setState(event.state as StackNavigationState<T>);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const currentRoute = state.routes[state.index];
  const screen = screens[currentRoute.name as string];

  const activeScreenOptions =
    typeof screen?.options === "function"
      ? screen.options({ route: currentRoute as any })
      : screen?.options || {};
  const activeAnimationOption = activeScreenOptions.animation || "default";
  const activeAnimationConfig =
    typeof activeAnimationOption === "string"
      ? STACK_TRANSITIONS[activeAnimationOption] || STACK_TRANSITIONS.default
      : activeAnimationOption;

  // --- MODIFIED: Navigation actions now use History API ---
  const navigation = useMemo((): NavigationProp<T> => {
    const canGoBack = () => state.index > 0;

    return {
      navigate: (name, params) => {
        const newRoute: Route<T, keyof T> = {
          key: `${String(name)}-${Date.now()}`,
          name,
          params,
        };
        const newState: StackNavigationState<T> = {
          index: state.routes.length,
          routes: [...state.routes, newRoute],
        };
        window.history.pushState(newState, "");
        setState(newState);
      },
      push: (name, params) => {
        const newRoute: Route<T, keyof T> = {
          key: `${String(name)}-${Date.now()}`,
          name,
          params,
        };
        const newState: StackNavigationState<T> = {
          index: state.routes.length,
          routes: [...state.routes, newRoute],
        };
        window.history.pushState(newState, "");
        setState(newState);
      },
      replace: (name, params) => {
        const newRoute: Route<T, keyof T> = {
          key: `${String(name)}-${Date.now()}`,
          name,
          params,
        };
        const newRoutes = [...state.routes.slice(0, -1), newRoute];
        const newState: StackNavigationState<T> = {
          index: newRoutes.length - 1,
          routes: newRoutes,
        };
        window.history.replaceState(newState, "");
        setState(newState);
      },
      goBack: () => {
        if (canGoBack()) {
          window.history.back();
        }
      },
      pop: (count = 1) => {
        if (canGoBack()) {
          window.history.go(-count);
        }
      },
      popToTop: () => {
        if (canGoBack()) {
          window.history.go(-state.index);
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
  }, [state.index, state.routes, listeners]);

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
