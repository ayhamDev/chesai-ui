"use client";

import { clsx } from "clsx";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
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
  push: <R extends keyof T>(name: R, params?: T[R]) => void;
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
  scrollContainerRef: RefObject<any | null>;
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
  gestureEnabled?: boolean; // NEW: Enable/disable gestures
  gestureDirection?: "horizontal" | "vertical"; // NEW: Gesture direction
  gestureResponseDistance?: number; // NEW: Distance threshold for gesture
  gestureVelocityImpact?: number; // NEW: How much velocity affects the gesture
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
}

const StackNavigator = <T extends Record<string, object | undefined>>({
  initialRouteName,
  children,
  screenOptions: globalScreenOptions,
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

  const [state, setState] = useState<StackNavigationState<T>>(() => {
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

  // NEW: Gesture state
  const [isGesturing, setIsGesturing] = useState(false);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  useLayoutEffect(() => {
    if (typeof window !== "undefined" && !window.history.state?.routes) {
      window.history.replaceState({ ...window.history.state, ...state }, "");
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
  const currentRoute = state.routes[state.index] as RouteProp<T, keyof T>;
  const screen = screens[currentRoute.name as string];

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
        window.history.pushState({ ...window.history.state, ...newState }, "");
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
        window.history.pushState({ ...window.history.state, ...newState }, "");
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
        window.history.replaceState(
          { ...window.history.state, ...newState },
          ""
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

  const activeScreenOptions = useMemo(() => {
    const resolvedGlobalOptions =
      typeof globalScreenOptions === "function"
        ? globalScreenOptions({ route: currentRoute, navigation })
        : globalScreenOptions || {};

    const resolvedLocalOptions =
      typeof screen?.options === "function"
        ? screen.options({ route: currentRoute })
        : screen?.options || {};

    return {
      ...resolvedGlobalOptions,
      ...resolvedLocalOptions,
      headerStyle: {
        ...resolvedGlobalOptions.headerStyle,
        ...resolvedLocalOptions.headerStyle,
      },
      appBarProps: {
        ...resolvedGlobalOptions.appBarProps,
        ...resolvedLocalOptions.appBarProps,
      },
    };
  }, [globalScreenOptions, screen?.options, currentRoute, navigation]);

  const activeAnimationOption = activeScreenOptions.animation || "default";
  const activeAnimationConfig =
    typeof activeAnimationOption === "string"
      ? STACK_TRANSITIONS[activeAnimationOption] || STACK_TRANSITIONS.default
      : activeAnimationOption;

  // NEW: Gesture configuration
  const gestureEnabled = activeScreenOptions.gestureEnabled ?? true;
  const gestureDirection = activeScreenOptions.gestureDirection || "horizontal";
  const gestureResponseDistance =
    activeScreenOptions.gestureResponseDistance || 50;
  const gestureVelocityImpact =
    activeScreenOptions.gestureVelocityImpact || 0.5;

  // NEW: Handle gesture drag
  const handleDragEnd = (_: any, info: PanInfo) => {
    const isHorizontal = gestureDirection === "horizontal";
    const offset = isHorizontal ? info.offset.x : info.offset.y;
    const velocity = isHorizontal ? info.velocity.x : info.velocity.y;

    // Calculate if gesture should trigger navigation
    const shouldNavigateBack =
      (isHorizontal && offset > gestureResponseDistance) ||
      (isHorizontal && velocity > 500) ||
      (!isHorizontal && offset < -gestureResponseDistance) ||
      (!isHorizontal && velocity < -500);

    if (shouldNavigateBack && navigation.canGoBack()) {
      navigation.goBack();
    }

    setIsGesturing(false);
    dragX.set(0);
    dragY.set(0);
  };

  const handleAnimationStart = (isPop: boolean) => {
    listeners.transitionStart.forEach((cb) => cb({ data: { closing: isPop } }));
  };

  const handleAnimationComplete = (isPop: boolean) => {
    listeners.transitionEnd.forEach((cb) => cb({ data: { closing: isPop } }));
  };

  // NEW: Transform for gesture-based navigation
  const gestureX = useTransform(
    dragX,
    [0, 300],
    [0, gestureDirection === "horizontal" ? 300 : 0]
  );
  const gestureY = useTransform(
    dragY,
    [-300, 0],
    [gestureDirection === "vertical" ? -300 : 0, 0]
  );

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
              console.error(
                `Stack Router Error: No screen component found for route name "${String(
                  route.name
                )}". Did you forget to add a <Stack.Screen name="${String(
                  route.name
                )}" /> component?`
              );
              return null;
            }
            const Component = screenConfig.component;

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
            const finalOptions = {
              ...resolvedGlobalOptions,
              ...localOptions,
            };
            const pageClassName = finalOptions.pageClassName;

            const isActive = index === state.index;
            const isPrevious = index === state.index - 1;
            const variantName = isActive ? "center" : "behind";

            // NEW: Apply gesture transforms only to active screen when gesturing
            const style: React.CSSProperties = {
              zIndex: index,
              willChange: "transform, opacity",
            };

            if (
              isActive &&
              isGesturing &&
              gestureEnabled &&
              navigation.canGoBack()
            ) {
              style.x = gestureDirection === "horizontal" ? gestureX : 0;
              style.y = gestureDirection === "vertical" ? gestureY : 0;
            }

            return (
              <motion.div
                key={route.key}
                variants={activeAnimationConfig.variants}
                transition={
                  isGesturing
                    ? { type: "spring", stiffness: 300, damping: 30 }
                    : activeAnimationConfig.transition
                }
                initial="enter"
                animate={variantName}
                exit="exit"
                onAnimationStart={
                  isActive ? () => handleAnimationStart(false) : undefined
                }
                onAnimationComplete={
                  isActive ? () => handleAnimationComplete(false) : undefined
                }
                // NEW: Add drag handlers only to active screen
                drag={
                  isActive && gestureEnabled && navigation.canGoBack()
                    ? gestureDirection === "horizontal"
                      ? "x"
                      : "y"
                    : false
                }
                dragConstraints={
                  gestureDirection === "horizontal"
                    ? { left: 0, right: 300 }
                    : { top: -300, bottom: 0 }
                }
                dragElastic={0.2}
                onDragStart={() => setIsGesturing(true)}
                onDragEnd={handleDragEnd}
                onDrag={(_, info) => {
                  if (gestureDirection === "horizontal") {
                    dragX.set(info.offset.x);
                  } else {
                    dragY.set(info.offset.y);
                  }
                }}
                style={style}
                className={clsx(
                  "absolute inset-x-0 bottom-0 top-0 bg-graphite-background",
                  pageClassName
                )}
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
