"use client";

import { clsx } from "clsx";
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

// --- TYPE DEFINITIONS ---

export interface Route<
  T extends Record<string, object | undefined>,
  R extends keyof T,
> {
  key: string;
  name: R;
  params: T[R];
}

export type RouteProp<
  T extends Record<string, object | undefined>,
  R extends keyof T,
> = Route<T, R>;

export interface NavigationProp<T extends Record<string, object | undefined>> {
  navigate: <R extends keyof T>(name: R, params?: T[R]) => void;
  push: <R extends keyof T>(name: R, params?: T[R]) => void;
  replace: <R extends keyof T>(name: R, params?: T[R]) => void;
  goBack: () => void;
  pop: (count?: number) => void;
  popToTop: () => void;
  canGoBack: () => boolean;
  setOptions: (options: Partial<StackScreenOptions>) => void;
  addListener: (
    event: NavigationEvent,
    callback: NavigationEventCallback,
  ) => () => void;
  removeListener: (
    event: NavigationEvent,
    callback: NavigationEventCallback,
  ) => void;
  scrollContainerRef: RefObject<any | null>;
}

export interface StackScreenProps<
  T extends Record<string, object | undefined>,
  R extends keyof T,
> {
  navigation: NavigationProp<T>;
  route: RouteProp<T, R>;
}

export type NavigationEvent = "transitionStart" | "transitionEnd";
export type NavigationEventCallback = (event: {
  data: { closing: boolean };
}) => void;

export interface StackNavigationState<
  T extends Record<string, object | undefined>,
> {
  index: number;
  routes: Route<T, keyof T>[];
}

// Options for each screen
export interface StackScreenOptions {
  title?: string;
  headerTitle?:
    | React.ReactNode
    | ((props: {
        navigation: NavigationProp<any>;
        route: RouteProp<any, any>;
      }) => React.ReactNode);
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
    | "fade-from-right"
    | "fade-from-left"
    | "fade-from-top"
    | "fade-from-bottom"
    | "slide-from-left"
    | "slide-from-right"
    | "slide-from-top"
    | "slide-from-bottom"
    | { variants: any; transition: any };
  pageClassName?: string;
  headerAnimationEnabled?: boolean;
}

export interface StackScreenComponent<
  T extends Record<string, object | undefined>,
  R extends keyof T,
> {
  props: {
    name: R;
    component?: React.ComponentType<StackScreenProps<T, R>>;
    children?: (props: StackScreenProps<T, R>) => React.ReactNode;
    options?:
      | StackScreenOptions
      | ((props: { route: RouteProp<T, R> }) => StackScreenOptions);
  };
}

// --- Contexts ---
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
      "useNavigation must be used within a screen of a StackNavigator.",
    );
  }
  return navigation as NavigationProp<T>;
}

export function useRoute<
  T extends Record<string, object | undefined>,
  R extends keyof T,
>() {
  const route = useContext(RouteContext);
  if (!route) {
    throw new Error(
      "useRoute must be used within a screen of a StackNavigator.",
    );
  }
  return route as RouteProp<T, R>;
}

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

const Header = <T extends Record<string, object | undefined>>({
  options,
  screenName,
  navigation,
  route,
  scrollContainerRef,
  routeKey,
}: {
  options: StackScreenOptions;
  screenName?: keyof T;
  navigation: NavigationProp<T>;
  route: RouteProp<T, keyof T>;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  routeKey: string;
}) => {
  if (options.headerShown === false) return null;

  const title = options.headerTitle || options.title || screenName;
  const headerAnimationEnabled = options.headerAnimationEnabled ?? true;

  const contentAnimation: Variants = {
    initial: { opacity: 0.2, y: -5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0.2, y: 5 },
  };
  const contentTransition: Transition = headerAnimationEnabled
    ? { duration: 0.12, ease: "easeInOut" }
    : { duration: 0 };

  return (
    <AppBar
      {...options.appBarProps}
      routeKey={routeKey}
      scrollContainerRef={scrollContainerRef || null}
      appBarColor={
        options.headerStyle?.backgroundColor ||
        options.appBarProps?.appBarColor ||
        "card"
      }
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
          {typeof title === "function"
            ? title({ navigation, route })
            : (title as React.ReactNode)}
        </motion.div>
      </AnimatePresence>
    </AppBar>
  );
};

// --- Main Navigator Logic ---
interface StackNavigatorProps<T extends Record<string, object | undefined>> {
  initialRouteName: keyof T;
  children:
    | React.ReactElement<StackScreenComponent<T, keyof T>["props"]>
    | React.ReactElement<StackScreenComponent<T, keyof T>["props"]>[];
  screenOptions?:
    | StackScreenOptions
    | ((props: {
        route: RouteProp<T, keyof T>;
        navigation: NavigationProp<T>;
      }) => StackScreenOptions);
  /**
   * 'memory': Routes are stored in memory/history state. The URL bar does not change path (default).
   * 'path': Routes update the browser URL path.
   */
  mode?: "memory" | "path";
  /**
   * The base URL path for 'path' mode.
   * e.g., "/app" if your router is mounted at mydomain.com/app
   */
  basePath?: string;
}

const StackNavigator = <T extends Record<string, object | undefined>>({
  initialRouteName,
  children,
  screenOptions: globalScreenOptions,
  mode = "memory",
  basePath = "",
}: StackNavigatorProps<T>) => {
  const screens = useMemo(() => {
    const screenConfig: Record<
      string,
      StackScreenComponent<T, keyof T>["props"]
    > = {};
    React.Children.forEach(
      children,
      (
        child: React.ReactElement<StackScreenComponent<T, keyof T>["props"]>,
      ) => {
        if (React.isValidElement(child)) {
          screenConfig[child.props.name as string] = child.props;
        }
      },
    );
    return screenConfig;
  }, [children]);

  const [dynamicOptions, setDynamicOptions] = useState<
    Record<string, Partial<StackScreenOptions>>
  >({});

  // Helper to extract params from URL query string
  const getParamsFromUrl = () => {
    if (typeof window === "undefined") return undefined;
    const search = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    search.forEach((value, key) => {
      params[key] = value;
    });
    return Object.keys(params).length > 0 ? (params as any) : undefined;
  };

  // Helper to construct URL for 'path' mode
  const constructUrl = (name: string, params?: object) => {
    if (mode !== "path") return undefined;

    let url = `${basePath}/${String(name)}`;
    // Normalize double slashes
    url = url.replace(/\/+/g, "/");

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
      const searchString = searchParams.toString();
      if (searchString) url += `?${searchString}`;
    }
    return url;
  };

  const [state, setState] = useState<StackNavigationState<T>>(() => {
    if (typeof window !== "undefined") {
      // 1. Try to restore from history state
      if (window.history.state?.routes) {
        return window.history.state as StackNavigationState<T>;
      }

      // 2. If 'path' mode, try to hydration from current URL
      if (mode === "path") {
        const path = window.location.pathname;
        const currentPathName = path.replace(basePath, "").replace(/^\//, "");

        // Find if the current URL matches a defined screen
        if (currentPathName && screens[currentPathName]) {
          const params = getParamsFromUrl();
          return {
            index: 0,
            routes: [
              {
                key: `${String(currentPathName)}-${Date.now()}`,
                name: currentPathName as keyof T,
                params: params,
              },
            ],
          };
        }
      }
    }

    // 3. Fallback to initialRouteName
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

  // Sync state to history on mount or change
  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      const currentState = window.history.state;
      // Only replace if the state structure doesn't match our router structure
      if (!currentState?.routes) {
        const currentRoute = state.routes[state.index];
        const url = constructUrl(
          currentRoute.name as string,
          currentRoute.params,
        );
        window.history.replaceState(
          { ...currentState, ...state },
          "",
          url, // This updates the URL on initial load/hydration
        );
      }
    }
  }, [state, mode, basePath]);

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
  const currentRoute = state.routes[state.index] as RouteProp<T, keyof T>;
  const screen = screens[currentRoute.name as string];

  const navigation = useMemo((): NavigationProp<T> => {
    const canGoBack = () => state.index > 0;

    return {
      navigate: (name, params) => {
        const newRoute: Route<T, keyof T> = {
          key: `${String(name)}-${Date.now()}`,
          name,
          params: params as any,
        };
        const newState: StackNavigationState<T> = {
          index: state.routes.length,
          routes: [...state.routes, newRoute],
        };

        const url = constructUrl(name as string, params as any);
        window.history.pushState(
          { ...window.history.state, ...newState },
          "",
          url,
        );
        setState(newState);
      },
      push: (name, params) => {
        const newRoute: Route<T, keyof T> = {
          key: `${String(name)}-${Date.now()}`,
          name,
          params: params as any,
        };
        const newState: StackNavigationState<T> = {
          index: state.routes.length,
          routes: [...state.routes, newRoute],
        };

        const url = constructUrl(name as string, params as any);
        window.history.pushState(
          { ...window.history.state, ...newState },
          "",
          url,
        );
        setState(newState);
      },
      replace: (name, params) => {
        const newRoute: Route<T, keyof T> = {
          key: `${String(name)}-${Date.now()}`,
          name,
          params: params as any,
        };
        const newRoutes = [...state.routes.slice(0, -1), newRoute];
        const newState: StackNavigationState<T> = {
          index: newRoutes.length - 1,
          routes: newRoutes,
        };

        const url = constructUrl(name as string, params as any);
        window.history.replaceState(
          { ...window.history.state, ...newState },
          "",
          url,
        );
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
      setOptions: (options) => {
        setDynamicOptions((prev) => ({
          ...prev,
          [currentRoute.key]: { ...prev[currentRoute.key], ...options },
        }));
      },
      addListener: (event, callback) => {
        listeners[event].add(callback);
        return () => listeners[event].delete(callback);
      },
      removeListener: (event, callback) => {
        listeners[event].delete(callback);
      },
      scrollContainerRef,
    };
  }, [state.index, state.routes, listeners, currentRoute, mode, basePath]);

  const activeScreenOptions = useMemo(() => {
    const resolvedGlobalOptions =
      typeof globalScreenOptions === "function"
        ? globalScreenOptions({ route: currentRoute, navigation })
        : globalScreenOptions || {};

    const resolvedLocalOptions =
      typeof screen?.options === "function"
        ? screen.options({ route: currentRoute })
        : screen?.options || {};

    const dynamicOpts = dynamicOptions[currentRoute.key] || {};

    return {
      ...resolvedGlobalOptions,
      ...resolvedLocalOptions,
      ...dynamicOpts,
      headerStyle: {
        ...resolvedGlobalOptions.headerStyle,
        ...resolvedLocalOptions.headerStyle,
        ...dynamicOpts.headerStyle,
      },
      appBarProps: {
        ...resolvedGlobalOptions.appBarProps,
        ...resolvedLocalOptions.appBarProps,
        ...dynamicOpts.appBarProps,
      },
    };
  }, [
    globalScreenOptions,
    screen?.options,
    currentRoute,
    navigation,
    dynamicOptions,
  ]);

  const activeAnimationOption = activeScreenOptions.animation || "default";
  const activeAnimationConfig =
    typeof activeAnimationOption === "string"
      ? // @ts-expect-error
        STACK_TRANSITIONS[activeAnimationOption] || STACK_TRANSITIONS.default
      : activeAnimationOption;

  const handleAnimationStart = (isPop: boolean) => {
    listeners.transitionStart.forEach((cb) => cb({ data: { closing: isPop } }));
  };

  const handleAnimationComplete = (isPop: boolean) => {
    listeners.transitionEnd.forEach((cb) => cb({ data: { closing: isPop } }));
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-graphite-background">
      <Header
        options={activeScreenOptions}
        screenName={screen?.name}
        navigation={navigation}
        route={currentRoute}
        scrollContainerRef={scrollContainerRef}
        routeKey={currentRoute.key}
      />
      <div className="relative h-full w-full">
        <AnimatePresence
          initial={false}
          onExitComplete={() => handleAnimationComplete(true)}
        >
          {state.routes.map((route, index) => {
            const screenConfig = screens[route.name as string];

            if (!screenConfig) {
              return null;
            }
            const Component = screenConfig.component;
            const ChildrenRender = screenConfig.children;

            const resolvedGlobalOptions =
              typeof globalScreenOptions === "function"
                ? globalScreenOptions({
                    route: route as RouteProp<T, keyof T>,
                    navigation,
                  })
                : globalScreenOptions || {};
            const localOptions =
              typeof screenConfig.options === "function"
                ? screenConfig.options({
                    route: route as RouteProp<T, keyof T>,
                  })
                : screenConfig.options || {};
            const dynamicOpts = dynamicOptions[route.key] || {};

            const finalOptions = {
              ...resolvedGlobalOptions,
              ...localOptions,
              ...dynamicOpts,
            };
            const pageClassName = finalOptions.pageClassName;

            const isActive = index === state.index;
            const variantName = isActive ? "center" : "behind";

            const style: React.CSSProperties = {
              zIndex: index,
              willChange: "transform, opacity",
            };

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
                style={style}
                className={clsx(
                  "absolute inset-x-0 bottom-0 top-0 bg-graphite-background",
                  pageClassName,
                )}
              >
                {/* @ts-expect-error */}
                <NavigationContext.Provider value={navigation}>
                  {/* @ts-ignore */}
                  <RouteContext.Provider value={route}>
                    {Component ? (
                      <Component
                        navigation={navigation}
                        route={route as RouteProp<T, keyof T>}
                      />
                    ) : ChildrenRender ? (
                      ChildrenRender({
                        navigation,
                        route: route as RouteProp<T, keyof T>,
                      })
                    ) : null}
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
  T extends Record<string, object | undefined>,
>() {
  const Screen = <R extends keyof T>(
    _props: StackScreenComponent<T, R>["props"],
  ) => {
    return null;
  };

  return {
    Navigator: (props: StackNavigatorProps<T>) => <StackNavigator {...props} />,
    Screen,
  };
}
