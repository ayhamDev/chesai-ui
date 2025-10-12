"use client";

import {
  AnimatePresence,
  motion,
  type Transition,
  type Variants,
} from "framer-motion";
import { ArrowLeft } from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { AppBar, type AppBarSharedProps } from "../appbar";
import { IconButton } from "../icon-button";
import { STACK_TRANSITIONS } from "./transitions";

// --- INLINED TYPE DEFINITIONS (from types.ts) ---

// Base types
export interface Route<
  T extends Record<string, object | undefined>,
  R extends keyof T
> {
  key: string;
  name: R;
  params: T[R];
}

export type RouteProp<
  T extends Record<string, object | undefined>,
  R extends keyof T
> = Route<T, R>;

export interface NavigationProp<T extends Record<string, object | undefined>> {
  navigate: <R extends keyof T>(name: R, params: T[R]) => void;
  push: <R extends keyof T>(name: R, params: T[R]) => void;
  replace: <R extends keyof T>(name: R, params: T[R]) => void;
  goBack: () => void;
  pop: (count?: number) => void;
  popToTop: () => void;
  canGoBack: () => boolean;
  addListener: (
    event: NavigationEvent,
    callback: NavigationEventCallback
  ) => () => void;
  removeListener: (
    event: NavigationEvent,
    callback: NavigationEventCallback
  ) => void;
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export interface StackScreenProps<
  T extends Record<string, object | undefined>,
  R extends keyof T
> {
  navigation: NavigationProp<T>;
  route: RouteProp<T, R>;
}

export type NavigationEvent = "transitionStart" | "transitionEnd";
export type NavigationEventCallback = (event: {
  data: { closing: boolean };
}) => void;

export interface StackNavigationState<
  T extends Record<string, object | undefined>
> {
  index: number;
  routes: Route<T, keyof T>[];
}

// Options for each screen
export interface StackScreenOptions {
  title?: string;
  headerTitle?: React.ReactNode | ((props: {}) => React.ReactNode);
  headerShown?: boolean;
  headerLeft?: (props: { canGoBack: boolean }) => React.ReactNode;
  headerRight?: (props: { canGoBack: boolean }) => React.ReactNode;
  headerStyle?: {
    backgroundColor?: "background" | "card" | "primary" | "secondary";
  };
  appBarProps?: AppBarSharedProps;
  animation?:
    | "default"
    | "none"
    | "fade"
    | "zoom-fade"
    | "flip"
    | "slide-from-left"
    | "slide-from-right"
    | "slide-from-top"
    | "slide-from-bottom"
    // biome-ignore lint/suspicious/noExplicitAny: Variants can be complex
    | { variants: any; transition: any };
}

export interface StackScreenComponent<
  T extends Record<string, object | undefined>,
  R extends keyof T
> {
  props: {
    name: R;
    component: React.ComponentType<StackScreenProps<T, R>>;
    options?:
      | StackScreenOptions
      | ((props: { route: RouteProp<T, R> }) => StackScreenOptions);
  };
}

// --- Contexts (FIX: Replaced 'any' with a more specific generic) ---
const NavigationContext = createContext<
  NavigationProp<Record<string, object | undefined>> | undefined
>(undefined);
const RouteContext = createContext<
  Route<Record<string, object | undefined>, string> | undefined
>(undefined);

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

// --- FIX: Moved HeaderLeft and HeaderRight outside the Header component ---
const HeaderLeft = <T extends Record<string, object | undefined>>({
  options,
  navigation,
}: {
  options: StackScreenOptions;
  navigation: NavigationProp<T>;
}) => {
  if (options.headerLeft) {
    return options.headerLeft({ canGoBack: navigation.canGoBack() });
  }
  if (navigation.canGoBack()) {
    return (
      <IconButton variant="ghost" onClick={navigation.goBack}>
        <ArrowLeft />
      </IconButton>
    );
  }
  return null;
};

const HeaderRight = <T extends Record<string, object | undefined>>({
  options,
  navigation,
}: {
  options: StackScreenOptions;
  navigation: NavigationProp<T>;
}) => {
  if (options.headerRight) {
    return options.headerRight({ canGoBack: navigation.canGoBack() });
  }
  return null;
};

// --- MODIFIED: Modified Internal Header Component ---
const Header = <T extends Record<string, object | undefined>>({
  screen,
  navigation,
  scrollContainerRef,
  routeKey, // New prop to trigger animations
}: {
  screen: StackScreenComponent<T, keyof T>["props"] | undefined;
  navigation: NavigationProp<T>;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  routeKey: string; // Unique key for the current route
}) => {
  if (!screen) return null;

  // FIX: Cast options to StackScreenOptions to resolve property errors
  const options = (screen.options || {}) as StackScreenOptions;
  if (options.headerShown === false) return null;

  const title = options.headerTitle || options.title || screen.name;

  // FIX: Define animation variants and transition with correct types
  const contentAnimation: Variants = {
    initial: { opacity: 0.2, y: -5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0.2, y: 5 },
  };
  const contentTransition: Transition = { duration: 0.12, ease: "easeInOut" };

  return (
    <AppBar
      {...options.appBarProps}
      scrollContainerRef={scrollContainerRef}
      appBarColor={options.headerStyle?.backgroundColor || "card"}
      startAdornment={
        <AnimatePresence mode="wait">
          <motion.div
            key={`${routeKey}-left`}
            variants={contentAnimation}
            transition={contentTransition}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <HeaderLeft options={options} navigation={navigation} />
          </motion.div>
        </AnimatePresence>
      }
      endAdornments={
        // @ts-ignore
        <HeaderRight options={options} navigation={navigation} /> ? (
          [
            <AnimatePresence mode="wait" key={`${routeKey}-right-presence`}>
              <motion.div
                key={`${routeKey}-right`}
                variants={contentAnimation}
                transition={contentTransition}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <HeaderRight options={options} navigation={navigation} />
              </motion.div>
            </AnimatePresence>,
          ]
        ) : undefined
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${routeKey}-title`}
          variants={contentAnimation}
          transition={contentTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="truncate"
        >
          {typeof title === "function" ? title({}) : (title as React.ReactNode)}
        </motion.div>
      </AnimatePresence>
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
    // FIX: Use optional chaining
    if (typeof window !== "undefined" && window.history.state?.routes) {
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
    if (typeof window !== "undefined" && !window.history.state?.routes) {
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

  // FIX: Correctly handle function-based options and cast 'any'
  const activeScreenOptions =
    typeof screen?.options === "function"
      ? screen.options({
          route: currentRoute as RouteProp<T, keyof T>,
        })
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
        // biome-ignore lint/suspicious/noExplicitAny: History API's state can be any serializable object
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
        // biome-ignore lint/suspicious/noExplicitAny: History API's state can be any serializable object
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
        // biome-ignore lint/suspicious/noExplicitAny: History API's state can be any serializable object
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
        routeKey={currentRoute.key} // Pass the key to the Header
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
                  {/* @ts-ignore */}
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
