import type { Meta, StoryObj } from "@storybook/react";
import { ExternalLink } from "lucide-react";
import { Button } from "../button";
import DeviceFrame from "../device";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { Typography } from "../typography";

// --- Stack Router Imports ---
import {
  ControlledStackNavigator,
  createStackNavigator,
  useNavigation,
  useTanStackRouterAdapter,
} from "./index";
import type { RouteProp } from "./types";

// --- TanStack Router Imports ---
import {
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const meta: Meta = {
  title: "Components/Navigators/StackRouter",
  component: undefined,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A stack navigator that mimics the React Navigation API for the web. It uses `AppBar` for headers and Framer Motion for smooth, native-like screen transitions. Use `createStackNavigator()` for built-in history, or `ControlledStackNavigator` to integrate with external routing libraries like TanStack Router.",
      },
    },
  },
  decorators: [
    (Story) => (
      <DeviceFrame>
        <Story />
      </DeviceFrame>
    ),
  ],
};
export default meta;

// ============================================================================
// --- SHARED TRANSITION CONFIGURATIONS ---
// ============================================================================
const TRANSITIONS = [
  { path: "None", animation: "none" },
  { path: "Fade", animation: "fade" },
  { path: "ZoomFade", animation: "zoom-fade" },
  { path: "FadeRight", animation: "fade-from-right" },
  { path: "FadeLeft", animation: "fade-from-left" },
  { path: "FadeTop", animation: "fade-from-top" },
  { path: "FadeBottom", animation: "fade-from-bottom" },
  { path: "Flip", animation: "flip" },
  { path: "SlideRight", animation: "default", pageClassName: "shadow-md" },
  { path: "SlideBottom", animation: "slide-from-bottom" },
  { path: "SlideLeft", animation: "slide-from-left" },
  { path: "SlideTop", animation: "slide-from-top" },
] as const;

// ============================================================================
// --- 1. Built-in Router: Transition Presets ---
// ============================================================================
type AnimationStackParamList = { Main: undefined } & Record<
  (typeof TRANSITIONS)[number]["path"],
  undefined
>;
const AnimationStack = createStackNavigator<AnimationStackParamList>();

const MainScreen = () => {
  const navigation = useNavigation<AnimationStackParamList>();

  return (
    <ElasticScrollArea
      scrollbarVisibility="hidden"
      className="pt-[70px]"
      ref={navigation.scrollContainerRef}
    >
      <div className="box-border p-4 flex flex-col gap-4 mt-4">
        <Typography variant="title-small">
          Built-in Transition Presets
        </Typography>
        <Typography variant="body-small" muted className="mb-4">
          Powered by the standard createStackNavigator()
        </Typography>

        {TRANSITIONS.map((t) => (
          <Button
            key={t.path}
            className="w-fit"
            onClick={() => navigation.push(t.path)}
          >
            Push with '{t.path}'
          </Button>
        ))}
      </div>
    </ElasticScrollArea>
  );
};

const GenericScreen = ({ route }: { route: RouteProp<any, any> }) => {
  const navigation = useNavigation<AnimationStackParamList>();

  return (
    <div className="p-6 pt-[70px]" ref={navigation.scrollContainerRef}>
      <Typography variant="title-small">{route.name} Screen</Typography>
      <Typography variant="body-medium">
        This screen transitioned using its specified animation preset.
      </Typography>
      <Button
        className="mt-4"
        variant="primary"
        size="sm"
        onClick={() => navigation.push(route.name)}
      >
        Push More
      </Button>
      <Button
        className="mt-4"
        variant="secondary"
        size="sm"
        onClick={() => navigation.goBack()}
      >
        Go Back
      </Button>
    </div>
  );
};

export const BuiltInTransitionPresets: StoryObj = {
  name: "1. Built-in Transition Presets",
  render: () => (
    <AnimationStack.Navigator initialRouteName="Main">
      <AnimationStack.Screen name="Main" component={MainScreen} />
      {TRANSITIONS.map((t) => (
        <AnimationStack.Screen
          key={t.path}
          name={t.path}
          component={GenericScreen}
          options={{ animation: t.animation, pageClassName: t.pageClassName }}
        />
      ))}
    </AnimationStack.Navigator>
  ),
};

// ============================================================================
// --- 2. Headless Integration Example (TanStack Router) ---
// ============================================================================
const HeadlessStack = createStackNavigator<any>();

const TanStackMainScreen = ({ navigation }: any) => (
  <ElasticScrollArea
    scrollbarVisibility="hidden"
    className="pt-[70px]"
    ref={navigation.scrollContainerRef}
  >
    <div className="box-border p-4 flex flex-col gap-4 mt-4">
      <Typography
        variant="title-small"
        className="text-primary flex items-center gap-2"
      >
        <ExternalLink size={20} /> TanStack Transitions
      </Typography>
      <Typography variant="body-small" muted className="mb-4">
        Powered by ControlledStackNavigator + useTanStackRouterAdapter()
      </Typography>

      {TRANSITIONS.map((t) => (
        <Button
          key={t.path}
          className="w-fit"
          onClick={() => navigation.push(`/${t.path}`)}
        >
          Push with '{t.path}'
        </Button>
      ))}
    </div>
  </ElasticScrollArea>
);

const TanStackAppShell = () => {
  const adapterProps = useTanStackRouterAdapter("/");

  return (
    <ControlledStackNavigator {...adapterProps}>
      <HeadlessStack.Screen
        name="/"
        component={TanStackMainScreen}
        options={{ title: "Home" }}
      />
      {TRANSITIONS.map((t) => (
        <HeadlessStack.Screen
          key={`/${t.path}`}
          name={`/${t.path}`}
          component={GenericScreen}
          options={{
            animation: t.animation,
            pageClassName: t.pageClassName,
            title: t.path,
          }}
        />
      ))}
    </ControlledStackNavigator>
  );
};

// --- TanStack Router Setup ---
const rootRoute = createRootRoute({ component: TanStackAppShell });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/" });
const transitionRoutes = TRANSITIONS.map((t) =>
  createRoute({ getParentRoute: () => rootRoute, path: `/${t.path}` }),
);

const routeTree = rootRoute.addChildren([indexRoute, ...transitionRoutes]);
const HashHistory = createHashHistory({ window: window });
const router = createRouter({ routeTree, history: HashHistory });

export const TanStackTransitionPresets: StoryObj = {
  name: "2. TanStack Transition Presets",
  render: () => <RouterProvider router={router} />,
};
