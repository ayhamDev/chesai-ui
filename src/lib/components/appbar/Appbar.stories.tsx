import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowLeft,
  Menu,
  MoreVertical,
  Paperclip,
  Search,
  User,
} from "lucide-react";
import React, { useRef } from "react";
import { useAppBar } from "../../hooks/useAppBar";
import { ElasticScrollArea } from "../elastic-scroll-area";
import { IconButton } from "../icon-button";
import { Typography } from "../typography";
import { AppBar, type AppBarProps } from "./index";
import { Input } from "../input"; // Import Input

const meta: Meta<typeof AppBar> = {
  title: "Components/AppBar",
  component: AppBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A versatile AppBar that is decoupled from its scroll container. It uses a headless hook (`useAppBar`) to manage animations and behavior, allowing it to work with any scrollable element.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["md", "lg"],
    },
    appBarColor: {
      control: "select",
      options: ["background", "card", "primary", "secondary"],
    },
    scrollBehavior: {
      control: "select",
      options: ["sticky", "conditionally-sticky"],
    },
    animatedBehavior: {
      control: "check",
      options: ["appbar-color", "fold", "shadow"],
    },
    animatedColor: {
      control: "select",
      options: ["background", "card", "primary", "secondary"],
    },
    stickyHideTarget: {
      control: "select",
      options: [undefined, "main-row", "full-appbar"],
    },
    children: { control: false },
    largeHeaderContent: { control: false },
    smallHeaderContent: { control: false },
    startAdornment: { control: false },
    centerAdornment: { control: false },
    endAdornments: { control: false },
    scrollContainerRef: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof AppBar>;

// Helper component to generate scrollable content
const DummyContent = () => (
  <main className="p-6 pt-4">
    <Typography variant="h3">Scroll Down to See The Effect</Typography>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 30 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: strict
        <div key={i} className="h-48 rounded-2xl bg-black/5" />
      ))}
    </div>
  </main>
);

// A mock async function for the onRefresh prop
const simulateRefresh = () => {
  return new Promise((resolve) => setTimeout(resolve, 2000));
};

// A smart render function to wrap stories and demonstrate the headless pattern.
const renderWithScrollContainer = (args: AppBarProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  let paddingTop = "pt-[64px]";
  if (args.size === "lg" && args.largeHeaderContent) {
    paddingTop = "pt-[160px]";
  }

  return (
    <div className="h-screen bg-graphite-background">
      <AppBar {...args} scrollContainerRef={scrollRef} />
      <div ref={scrollRef} className={`h-full overflow-y-auto ${paddingTop}`}>
        <DummyContent />
      </div>
    </div>
  );
};

// --- STORIES ---

export const Default: Story = {
  name: "Default (Medium, Sticky)",
  args: {
    size: "md",
    scrollBehavior: "sticky",
    appBarColor: "card",
    children: <Typography variant="h4">Sticky Header</Typography>,
    startAdornment: (
      <IconButton variant="ghost" aria-label="Menu">
        <Menu />
      </IconButton>
    ),
    endAdornments: [
      <IconButton key="user-profile" variant="ghost" aria-label="User Profile">
        <User />
      </IconButton>,
    ],
  },
  render: renderWithScrollContainer,
};

export const ConditionallySticky: Story = {
  name: "Medium, Hiding on Scroll",
  args: {
    ...Default.args,
    scrollBehavior: "conditionally-sticky",
    children: <Typography variant="h4">Hiding Header</Typography>,
  },
  render: renderWithScrollContainer,
};

export const AnimatedColor: Story = {
  name: "Medium, Animated Color",
  args: {
    ...Default.args,
    animatedBehavior: ["appbar-color"],
    appBarColor: "background",
    animatedColor: "card",
    children: <Typography variant="h4">Animated Header</Typography>,
  },
  render: renderWithScrollContainer,
};

export const FoldingOnScroll: Story = {
  name: "Medium, Folding on Scroll",
  args: {
    ...Default.args,
    animatedBehavior: ["fold"],
    children: <Typography variant="h4">Folding Header</Typography>,
  },
  render: renderWithScrollContainer,
};

export const ShadowOnScroll: Story = {
  name: "Medium, Shadow on Scroll",
  args: {
    ...Default.args,
    animatedBehavior: ["shadow"],
    appBarColor: "background",
    children: <Typography variant="h4">Shadow Header</Typography>,
  },
  render: renderWithScrollContainer,
};

export const LargeCollapsing: Story = {
  name: "Large, Fully Collapsible",
  args: {
    size: "lg",
    scrollBehavior: "conditionally-sticky",
    appBarColor: "card",
    startAdornment: (
      <IconButton variant="ghost" aria-label="Back">
        <ArrowLeft />
      </IconButton>
    ),
    endAdornments: [
      <IconButton key="attach" variant="ghost" aria-label="Attach">
        <Paperclip />
      </IconButton>,
      <IconButton key="more" variant="ghost" aria-label="More">
        <MoreVertical />
      </IconButton>,
    ],
    children: (
      <Typography variant="h2" className="truncate font-bold">
        Large Collapsing Title
      </Typography>
    ),
    smallHeaderContent: (
      <Typography variant="h4" className="font-semibold">
        Collapsed Title
      </Typography>
    ),
    largeHeaderContent: (
      // Updated to use the Input component
      <Input
        variant="flat"
        shape="full"
        placeholder="Search..."
        startContent={<Search className="h-5 w-5 text-gray-500" />}
      />
    ),
  },
  render: renderWithScrollContainer,
};

export const LargeStatic: Story = {
  name: "Large, Static (No Collapse)",
  args: {
    ...LargeCollapsing.args,
    smallHeaderContent: undefined,
    children: (
      <Typography variant="h2" className="truncate font-bold">
        Large Static Title
      </Typography>
    ),
  },
  render: renderWithScrollContainer,
};

export const LargeStaticWithOverride: Story = {
  name: "Large, Static with Hide Override",
  args: {
    ...LargeStatic.args,
    stickyHideTarget: "main-row",
  },
  render: renderWithScrollContainer,
};

export const CombinedEffects: Story = {
  name: "Kitchen Sink (All Effects)",
  args: {
    ...LargeCollapsing.args,
    animatedBehavior: ["appbar-color", "shadow", "fold"],
    animatedColor: "secondary",
  },
  render: renderWithScrollContainer,
};

// This helper component calls the useAppBar hook safely *after* its parent has mounted and hydrated the ref.
const ElasticScrollContent = ({
  scrollRef,
  args,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  args: AppBarProps;
}) => {
  // Explicitly pick only the props that the `useAppBar` hook needs.
  const {
    size,
    scrollBehavior,
    animatedBehavior,
    animatedColor,
    largeHeaderContent,
    smallHeaderContent,
    stickyHideTarget,
    appBarColor,
  } = args;

  // By the time this component renders, scrollRef.current is hydrated.
  const { contentPaddingTop } = useAppBar({
    size,
    scrollBehavior,
    animatedBehavior,
    animatedColor,
    largeHeaderContent,
    smallHeaderContent,
    stickyHideTarget,
    appBarColor: appBarColor ?? undefined, // Coalesce null to undefined for type safety
    scrollContainerRef: scrollRef,
  });

  return (
    <div style={{ paddingTop: contentPaddingTop }}>
      <DummyContent />
    </div>
  );
};

export const WithElasticScroll: Story = {
  name: "With Elastic Scroll & Refresh",
  args: {
    ...LargeCollapsing.args,
    animatedBehavior: ["shadow", "fold"],
    scrollBehavior: "conditionally-sticky",
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates composing the `AppBar` with `ElasticScrollArea`. We use a child component to safely call the `useAppBar` hook only after the scroll container's `ref` has been attached, preventing hydration errors.",
      },
    },
  },
  render: (args) => {
    // This ref will be passed down and attached by ElasticScrollArea
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
      <div className="h-screen bg-graphite-background">
        {/* AppBar receives the ref but doesn't trigger the hook directly from here */}
        <AppBar {...args} scrollContainerRef={scrollRef} />

        <ElasticScrollArea
          ref={scrollRef}
          className="h-full"
          pullToRefresh={true}
          onRefresh={simulateRefresh}
        >
          {/* Render the child component that safely calls the hook */}
          <ElasticScrollContent scrollRef={scrollRef} args={args} />
        </ElasticScrollArea>
      </div>
    );
  },
};
