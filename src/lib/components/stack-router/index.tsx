// src/lib/components/stack-router/index.tsx
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
} from "react";
import { AppBar, type AppBarProps } from "../appbar";
import { IconButton } from "../icon-button";
import { STACK_TRANSITIONS } from "./transitions";
import {
  type NavigationEvent,
  type NavigationEventCallback,
  type NavigationProp,
  type Route,
  type RouteProp,
  type StackNavigationState,
  type StackScreenComponent,
  type StackScreenOptions,
} from "./types";

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

  const rawBgColor =
    options.headerStyle?.backgroundColor || options.appBarProps?.color;
  const mappedColor =
    rawBgColor === "card"
      ? "surface-container-low"
      : rawBgColor === "background"
        ? "surface"
        : rawBgColor;

  const bottomContentNode = options.headerBottom
    ? options.headerBottom({ canGoBack: navigation.canGoBack() })
    : options.appBarProps?.bottomContent;

  const topRowContentNode = options.headerTopRow
    ? options.headerTopRow({ canGoBack: navigation.canGoBack() })
    : options.appBarProps?.topRowContent;

  const expandedContentNode = options.headerExpanded
    ? options.headerExpanded({ canGoBack: navigation.canGoBack() })
    : options.appBarProps?.expandedContent;

  return (
    <AppBar
      {...options.appBarProps}
      routeKey={routeKey}
      scrollContainerRef={scrollContainerRef || null}
      variant={options.appBarProps?.variant || "small"}
      // @ts-ignore
      color={mappedColor || "surface-container"}
      leadingIcon={
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
      trailingIcons={
        options.headerRight ? (
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
          </AnimatePresence>
        ) : undefined
      }
      title={
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
      }
      topRowContent={
        topRowContentNode ? (
          <AnimatePresence mode="wait" key={`${routeKey}-toprow-presence`}>
            <motion.div
              key={`${routeKey}-toprow`}
              variants={contentAnimation}
              transition={contentTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex items-center h-full"
            >
              {topRowContentNode}
            </motion.div>
          </AnimatePresence>
        ) : undefined
      }
      expandedContent={
        expandedContentNode ? (
          <AnimatePresence mode="wait" key={`${routeKey}-expanded-presence`}>
            <motion.div
              key={`${routeKey}-expanded`}
              variants={contentAnimation}
              transition={contentTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-full"
            >
              {expandedContentNode}
            </motion.div>
          </AnimatePresence>
        ) : undefined
      }
      bottomContent={
        bottomContentNode ? (
          <AnimatePresence mode="wait" key={`${routeKey}-bottom-presence`}>
            <motion.div
              key={`${routeKey}-bottom`}
              variants={contentAnimation}
              transition={contentTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {bottomContentNode}
            </motion.div>
          </AnimatePresence>
        ) : undefined
      }
    />
  );
};

// --- Extracted Screen Wrapper (FIXES HOOKS-IN-LOOP ISSUE) ---
function StackScreenWrapper<T extends Record<string, object | undefined>>({
  route,
  index,
  stateIndex,
  stateRoutes,
  baseNavigation,
  screenConfig,
  dynamicOpts,
  activeAnimationConfig,
  handleAnimationStart,
  handleAnimationComplete,
  scrollRefs,
  activeScrollRef,
}: {
  route: Route<T, keyof T>;
  index: number;
  stateIndex: number;
  stateRoutes: Route<T, keyof T>[];
  baseNavigation: Omit<NavigationProp<T>, "scrollContainerRef">;
  screenConfig: any;
  dynamicOpts: any;
  activeAnimationConfig: any;
  handleAnimationStart: (isPop: boolean) => void;
  handleAnimationComplete: (isPop: boolean) => void;
  scrollRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  activeScrollRef: React.MutableRefObject<HTMLElement | null>;
}) {
  const Component = screenConfig.component;
  const ChildrenRender = screenConfig.children;
  const pageClassName = dynamicOpts.pageClassName;

  const isActive = index === stateIndex;
  const variantName = isActive ? "center" : "behind";

  // Safe to call hook here as it is statically defined per component mount
  const routeNavigation = useMemo(
    (): NavigationProp<T> =>
      ({
        ...baseNavigation,
        scrollContainerRef: (node: HTMLElement | null) => {
          scrollRefs.current[route.key] = node;
          if (stateRoutes[stateIndex]?.key === route.key) {
            activeScrollRef.current = node;
          }
        },
      }) as NavigationProp<T>,
    [
      baseNavigation,
      route.key,
      stateIndex,
      stateRoutes,
      scrollRefs,
      activeScrollRef,
    ],
  );

  return (
    <motion.div
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
      style={{ zIndex: index, willChange: "transform, opacity" }}
      className={clsx(
        "absolute inset-x-0 bottom-0 top-0 bg-graphite-background",
        pageClassName,
      )}
    >
      {/* @ts-expect-error */}
      <NavigationContext.Provider value={routeNavigation}>
        {/* @ts-ignore */}
        <RouteContext.Provider value={route}>
          {Component ? (
            <Component
              navigation={routeNavigation}
              route={route as RouteProp<T, keyof T>}
            />
          ) : ChildrenRender ? (
            ChildrenRender({
              navigation: routeNavigation,
              route: route as RouteProp<T, keyof T>,
            })
          ) : null}
        </RouteContext.Provider>
      </NavigationContext.Provider>
    </motion.div>
  );
}

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
  mode?: "memory" | "path";
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

  const getParamsFromUrl = () => {
    if (typeof window === "undefined") return undefined;
    const search = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    search.forEach((value, key) => {
      params[key] = value;
    });
    return Object.keys(params).length > 0 ? (params as any) : undefined;
  };

  const constructUrl = (name: string, params?: object) => {
    if (mode !== "path") return undefined;
    let url = `${basePath}/${String(name)}`;
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
      if (window.history.state?.routes) {
        return window.history.state as StackNavigationState<T>;
      }
      if (mode === "path") {
        const path = window.location.pathname;
        const currentPathName = path.replace(basePath, "").replace(/^\//, "");
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

  const scrollRefs = useRef<Record<string, HTMLElement | null>>({});
  const activeScrollRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const currentRouteKey = state.routes[state.index]?.key;
    if (currentRouteKey) {
      activeScrollRef.current = scrollRefs.current[currentRouteKey] || null;
    }
  }, [state.index, state.routes]);

  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      const currentState = window.history.state;
      if (!currentState?.routes) {
        const currentRoute = state.routes[state.index];
        const url = constructUrl(
          currentRoute.name as string,
          currentRoute.params,
        );
        window.history.replaceState({ ...currentState, ...state }, "", url);
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

  const currentRoute = state.routes[state.index] as RouteProp<T, keyof T>;
  const screen = screens[currentRoute.name as string];

  const baseNavigation = useMemo((): Omit<
    NavigationProp<T>,
    "scrollContainerRef"
  > => {
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
        if (canGoBack()) window.history.back();
      },
      pop: (count = 1) => {
        if (canGoBack()) window.history.go(-count);
      },
      popToTop: () => {
        if (canGoBack()) window.history.go(-state.index);
      },
      canGoBack,
      // @ts-ignore
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
    };
  }, [state.index, state.routes, listeners, currentRoute, mode, basePath]);

  const activeScreenOptions = useMemo(() => {
    const resolvedGlobalOptions =
      typeof globalScreenOptions === "function"
        ? globalScreenOptions({
            route: currentRoute,
            navigation: baseNavigation as NavigationProp<T>,
          })
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
    baseNavigation,
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
        screenName={screen?.name as any}
        navigation={baseNavigation as NavigationProp<T>}
        route={currentRoute}
        scrollContainerRef={activeScrollRef}
        routeKey={currentRoute.key}
      />
      <div className="relative h-full w-full">
        <AnimatePresence
          initial={false}
          onExitComplete={() => handleAnimationComplete(true)}
        >
          {state.routes.map((route, index) => {
            const screenConfig = screens[route.name as string];
            if (!screenConfig) return null;

            return (
              <StackScreenWrapper
                key={route.key}
                route={route}
                index={index}
                stateIndex={state.index}
                stateRoutes={state.routes}
                baseNavigation={baseNavigation}
                screenConfig={screenConfig}
                dynamicOpts={dynamicOptions[route.key] || {}}
                activeAnimationConfig={activeAnimationConfig}
                handleAnimationStart={handleAnimationStart}
                handleAnimationComplete={handleAnimationComplete}
                scrollRefs={scrollRefs}
                activeScrollRef={activeScrollRef}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

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
