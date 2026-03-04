import type { Meta, StoryObj } from "@storybook/react";
import {
  createRootRoute,
  createRoute,
  createMemoryHistory,
  createRouter,
  RouterProvider,
  Link,
} from "@tanstack/react-router";
import React, { useMemo } from "react";
import { Typography } from "../typography";
import { AnimatedOutlet, type RoutePreset } from "./index";

const meta: Meta<typeof AnimatedOutlet> = {
  title: "Components/Navigators/AnimatedOutlet",
  component: AnimatedOutlet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A wrapper around TanStack Router's `<Outlet />` that adds seamless, key-tracked Framer Motion transitions during route changes.",
      },
    },
  },
  argTypes: {
    animation: {
      control: "select",
      options: [
        "fade",
        "slide-right",
        "slide-left",
        "slide-up",
        "slide-down",
        "zoom",
        "scale-fade",
        "none",
      ],
      description: "Built-in transition preset or a custom animation object.",
    },
    mode: {
      control: "select",
      options: ["wait", "popLayout", "sync"],
      description: "How the exiting and entering animations are sequenced.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedOutlet>;

// --- MOCK TANSTACK ROUTER SETUP ---
const RouterDemo = ({ animation, mode }: any) => {
  const router = useMemo(() => {
    const rootRoute = createRootRoute({
      component: () => (
        <div className="w-[600px] h-[400px] flex flex-col bg-graphite-background border border-outline-variant rounded-2xl overflow-hidden shadow-xl">
          <div className="flex gap-2 p-3 bg-surface-container-high border-b border-outline-variant">
            <Link
              to="/"
              className="[&.active]:bg-primary[&.active]:text-on-primary px-4 py-2 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              Home
            </Link>
            <Link
              to="/profile"
              className="[&.active]:bg-primary [&.active]:text-on-primary px-4 py-2 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              Profile
            </Link>
            <Link
              to="/settings"
              className="[&.active]:bg-primary [&.active]:text-on-primary px-4 py-2 rounded-lg text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              Settings
            </Link>
          </div>
          {/* Important: relative positioning required for popLayout mode overlapping */}
          <div className="flex-1 relative bg-surface-container-low p-8 overflow-hidden">
            <AnimatedOutlet animation={animation} mode={mode} />
          </div>
        </div>
      ),
    });

    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: () => (
        <div className="h-full flex flex-col items-center justify-center text-center bg-blue-500/5 rounded-xl border border-blue-500/20">
          <Typography variant="display-small">Home</Typography>
          <Typography variant="body-medium" muted>
            Welcome to the home page.
          </Typography>
        </div>
      ),
    });

    const profileRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/profile",
      component: () => (
        <div className="h-full flex flex-col items-center justify-center text-center bg-emerald-500/5 rounded-xl border border-emerald-500/20">
          <Typography variant="display-small">Profile</Typography>
          <Typography variant="body-medium" muted>
            Manage your user profile here.
          </Typography>
        </div>
      ),
    });

    const settingsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/settings",
      component: () => (
        <div className="h-full flex flex-col items-center justify-center text-center bg-purple-500/5 rounded-xl border border-purple-500/20">
          <Typography variant="display-small">Settings</Typography>
          <Typography variant="body-medium" muted>
            Application preferences and configurations.
          </Typography>
        </div>
      ),
    });

    const routeTree = rootRoute.addChildren([
      indexRoute,
      profileRoute,
      settingsRoute,
    ]);

    // Use Memory History so it doesn't manipulate the real Storybook URL
    const history = createMemoryHistory({ initialEntries: ["/"] });

    return createRouter({ routeTree, history });
  }, [animation, mode]);

  return <RouterProvider router={router} />;
};

export const Default: Story = {
  args: {
    animation: "fade",
    mode: "wait",
  },
  render: (args) => <RouterDemo {...args} />,
};

export const SlideTransitions: Story = {
  name: "Slide Variants",
  args: {
    animation: "slide-left",
    mode: "popLayout",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Using `mode='popLayout'` combined with a slide allows the new route to slide in simultaneously as the old route slides out without shifting the layout.",
      },
    },
  },
  render: (args) => <RouterDemo {...args} />,
};

export const CustomAnimation: Story = {
  name: "Custom Defined Animation",
  parameters: {
    docs: {
      description: {
        story:
          "Pass a custom object mapping directly to Framer Motion states (`initial`, `animate`, `exit`, `transition`) to create entirely unique route effects.",
      },
    },
  },
  render: () => {
    const customAnim = {
      initial: { opacity: 0, rotateY: 90, scale: 0.8 },
      animate: { opacity: 1, rotateY: 0, scale: 1 },
      exit: { opacity: 0, rotateY: -90, scale: 0.8 },
      transition: { type: "spring", stiffness: 200, damping: 20 },
    };
    return <RouterDemo animation={customAnim} mode="wait" />;
  },
};
