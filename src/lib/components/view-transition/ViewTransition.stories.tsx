import type { Meta, StoryObj } from "@storybook/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React from "react";

// Chesai UI Components
import { Button } from "../button";
import { Card } from "../card";
import { IconButton } from "../icon-button";
import {
  ShallowPage,
  ShallowRouter,
  ShallowSwitch,
  useRouter,
} from "../shallow-router";
import { Typography } from "../typography";

// The View Transition Hook & Component (From previous step)
import { TransitionLink, useViewTransition } from "./index";

const meta: Meta = {
  title: "Components/Navigators/View Transitions",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Demonstrates the View Transitions API integrating with React routers. **Note:** This requires a modern browser (Chrome 111+, Edge 111+, Safari 18+). Elements with identical `viewTransitionName` styles will magically morph between routes.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] h-[600px] bg-surface-container-lowest border border-outline-variant shadow-2xl rounded-3xl overflow-hidden relative">
        <Story />
      </div>
    ),
  ],
};

export default meta;

// --- MOCK DATA ---
const ITEMS = [
  {
    id: "item-1",
    title: "Mountain Retreat",
    subtitle: "Cabin in the woods",
    image:
      "https://images.unsplash.com/photo-1517088613037-7a895121b6b5?w=500&q=80",
  },
  {
    id: "item-2",
    title: "Ocean Breeze",
    subtitle: "Coastal relaxation",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80",
  },
  {
    id: "item-3",
    title: "Urban Jungle",
    subtitle: "City exploration",
    image:
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&q=80",
  },
];

// ============================================================================
// 1. SHALLOW ROUTER DEMO
// ============================================================================

const ShallowListScreen = () => {
  const { push } = useRouter();
  const startTransition = useViewTransition();

  return (
    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <Typography variant="headline-small" className="font-bold mb-2">
        Destinations
      </Typography>

      {ITEMS.map((item) => (
        <Card
          key={item.id}
          variant="surface-container"
          shape="minimal"
          padding="sm"
          className="flex gap-4 cursor-pointer hover:bg-surface-container-high transition-colors"
          onClick={() => {
            // Imperative View Transition Wrap
            startTransition(() => {
              push("/detail", { id: item.id });
            });
          }}
          // MAGIC: Assign a unique transition name to the container
          style={{ viewTransitionName: `card-container-${item.id}` }}
        >
          <div
            className="w-20 h-20 rounded-lg overflow-hidden shrink-0"
            // MAGIC: Assign a unique transition name to the image
            style={{ viewTransitionName: `card-image-${item.id}` }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <Typography
              variant="title-medium"
              // MAGIC: Assign a unique transition name to the title
              style={{ viewTransitionName: `card-title-${item.id}` }}
            >
              {item.title}
            </Typography>
            <Typography variant="body-small" muted>
              {item.subtitle}
            </Typography>
          </div>
        </Card>
      ))}
    </div>
  );
};

const ShallowDetailScreen = () => {
  const { goBack, searchParams } = useRouter();
  const startTransition = useViewTransition();

  const id = searchParams.get("id");
  const item = ITEMS.find((i) => i.id === id);

  if (!item) return <div>Not found</div>;

  return (
    <div
      className="h-full flex flex-col bg-surface"
      // MAGIC: Match the container name from the list view
      style={{ viewTransitionName: `card-container-${item.id}` }}
    >
      <div
        className="w-full h-64 shrink-0 relative rounded-b-3xl overflow-hidden shadow-md"
        // MAGIC: Match the image name from the list view
        style={{ viewTransitionName: `card-image-${item.id}` }}
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <IconButton
            variant="secondary"
            size="sm"
            onClick={() => startTransition(() => goBack())}
          >
            <ArrowLeft className="w-5 h-5" />
          </IconButton>
        </div>
      </div>

      <div className="p-6 flex-1">
        <Typography
          variant="headline-medium"
          className="font-bold mb-2"
          // MAGIC: Match the title name from the list view
          style={{ viewTransitionName: `card-title-${item.id}` }}
        >
          {item.title}
        </Typography>
        <Typography variant="body-large" className="text-primary mb-6">
          {item.subtitle}
        </Typography>

        <Typography variant="body-medium" className="opacity-80">
          This layout transition was created entirely by the browser. By sharing
          the <code>viewTransitionName</code> inline style between the two
          routes, the browser automatically interpolates the position, scale,
          and bounds of the image, container, and title.
        </Typography>

        <Button
          variant="primary"
          className="w-full mt-8"
          onClick={() => startTransition(() => goBack())}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};

export const WithShallowRouter: StoryObj = {
  name: "1. Shallow Router Integration",
  render: () => (
    <ShallowRouter mode="search" paramName="view">
      <ShallowSwitch>
        <ShallowPage path="/">
          <ShallowListScreen />
        </ShallowPage>
        <ShallowPage path="/detail">
          <ShallowDetailScreen />
        </ShallowPage>
      </ShallowSwitch>
    </ShallowRouter>
  ),
};

// ============================================================================
// 2. TANSTACK ROUTER DEMO
// ============================================================================

// --- Setup TanStack In-Memory Router ---
const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function TanStackList() {
    const navigate = useNavigate();

    return (
      <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
        <Typography variant="headline-small" className="font-bold mb-2">
          TanStack View
        </Typography>

        {ITEMS.map((item) => (
          <TransitionLink
            key={item.id}
            asChild
            // TransitionLink intercepts the click, starts the transition, then fires onNavigate
            onNavigate={() => navigate({ to: "/$id", params: { id: item.id } })}
          >
            <Card
              variant="surface-container"
              shape="minimal"
              padding="sm"
              className="flex gap-4 cursor-pointer hover:bg-surface-container-high transition-colors"
              style={{ viewTransitionName: `tanstack-container-${item.id}` }}
            >
              <div
                className="w-16 h-16 rounded-full overflow-hidden shrink-0"
                style={{ viewTransitionName: `tanstack-image-${item.id}` }}
              >
                <img
                  src={item.image}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-center">
                <Typography
                  variant="title-medium"
                  style={{ viewTransitionName: `tanstack-title-${item.id}` }}
                >
                  {item.title}
                </Typography>
              </div>
            </Card>
          </TransitionLink>
        ))}
      </div>
    );
  },
});

const detailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$id",
  component: function TanStackDetail() {
    const { id } = useParams({ from: "/$id" });
    const navigate = useNavigate();
    const startTransition = useViewTransition();

    const item = ITEMS.find((i) => i.id === id);
    if (!item) return null;

    return (
      <div
        className="h-full flex flex-col bg-surface-container-highest"
        style={{ viewTransitionName: `tanstack-container-${item.id}` }}
      >
        <div className="p-4 flex items-center gap-4 border-b border-outline-variant/50">
          <IconButton
            variant="ghost"
            onClick={() => startTransition(() => navigate({ to: "/" }))}
          >
            <ArrowLeft />
          </IconButton>
          <Typography
            variant="title-large"
            style={{ viewTransitionName: `tanstack-title-${item.id}` }}
          >
            {item.title}
          </Typography>
        </div>

        <div className="p-8 flex justify-center">
          <div
            className="w-64 h-64 rounded-3xl overflow-hidden shadow-2xl"
            style={{ viewTransitionName: `tanstack-image-${item.id}` }}
          >
            <img src={item.image} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  },
});

const routeTree = rootRoute.addChildren([indexRoute, detailRoute]);

// For Storybook, we create a memory history router instance
const memoryHistory = createMemoryHistory({
  initialEntries: ["/"],
});
const router = createRouter({ routeTree, history: memoryHistory });

// Module declaration required by TanStack Router
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const WithTanStackRouter: StoryObj = {
  name: "2. TanStack Router Integration",
  render: () => {
    return <RouterProvider router={router} />;
  },
};
