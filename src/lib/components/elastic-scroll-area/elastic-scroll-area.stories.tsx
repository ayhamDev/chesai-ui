import type { Meta, StoryObj } from "@storybook/react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { Sun } from "lucide-react";
import { Typography } from "../typography";
import { ElasticScrollArea } from "./index";

const meta: Meta<typeof ElasticScrollArea> = {
  title: "Components/ElasticScrollArea",
  component: ElasticScrollArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A scroll container that provides a native-like 'rubber band' or elastic overscroll effect, common in modern operating systems like iOS and macOS. It is built on top of Radix UI's accessible Scroll Area primitive and powered by Framer Motion for physics-based animations.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "The primary scrolling direction.",
    },
    elasticity: {
      control: "boolean",
      description: "Toggles the elastic overscroll effect.",
    },
    dampingFactor: {
      control: { type: "range", min: 0.05, max: 0.5, step: 0.01 },
      description:
        "Controls the resistance of the pull. Lower values are stiffer.",
    },
    scrollbarVisibility: {
      control: "select",
      options: ["auto", "always", "scroll"],
      description: "Controls the visibility of the scrollbar.",
    },
    pullToRefresh: {
      control: "boolean",
      description: "Enables the pull-to-refresh functionality (vertical only).",
    },
    pullThreshold: {
      control: { type: "number", min: 40, max: 200, step: 10 },
      description: "The pixel distance to pull to trigger a refresh.",
    },
    onRefresh: { action: "refreshed" },
    children: { control: false },
    RefreshIndicatorComponent: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ElasticScrollArea>;

// Helper component to generate vertical scrollable content
const DummyContent = ({ itemCount = 30 }: { itemCount?: number }) => (
  <main className="p-6">
    <Typography variant="h3">Scroll Me</Typography>
    <Typography variant="muted">
      Use your mouse wheel, trackpad, or touch to scroll. Try scrolling past the
      top or bottom edges.
    </Typography>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-2xl bg-graphite-secondary flex items-center justify-center"
        >
          <Typography variant="small" className="text-graphite-foreground/50">
            Item {i + 1}
          </Typography>
        </div>
      ))}
    </div>
  </main>
);

// Helper component to generate horizontal scrollable content
const DummyHorizontalContent = ({ itemCount = 20 }: { itemCount?: number }) => (
  <div className="p-6 h-full">
    <Typography variant="h3">Scroll Me Horizontally</Typography>
    <Typography variant="muted">
      Use Shift + Mouse Wheel, or swipe horizontally.
    </Typography>
    <div className="mt-4 flex gap-4 h-full">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div
          key={i}
          className="h-32 w-32 flex-shrink-0 rounded-2xl bg-graphite-secondary flex items-center justify-center"
        >
          <Typography variant="small" className="text-graphite-foreground/50">
            Item {i + 1}
          </Typography>
        </div>
      ))}
    </div>
  </div>
);

// A mock async function for the onRefresh prop
const simulateRefresh = () => {
  return new Promise((resolve) => setTimeout(resolve, 2000));
};

// A smart render function to wrap stories in a sized container
const renderVertical = (args: any) => (
  <div className="w-96 h-[600px] rounded-2xl border-2 border-graphite-border shadow-lg overflow-hidden">
    <ElasticScrollArea {...args}>
      <DummyContent />
    </ElasticScrollArea>
  </div>
);

// --- STORIES ---

export const Default: Story = {
  name: "1. Vertical (Default)",
  args: {
    orientation: "vertical",
    elasticity: true,
    dampingFactor: 0.25,
    scrollbarVisibility: "auto",
  },
  render: renderVertical,
};

export const Horizontal: Story = {
  name: "2. Horizontal",
  args: {
    orientation: "horizontal",
    elasticity: true,
    dampingFactor: 0.25,
    scrollbarVisibility: "auto",
  },
  render: (args) => (
    <div className="w-[700px] h-72 rounded-2xl border-2 border-graphite-border shadow-lg overflow-hidden">
      <ElasticScrollArea {...args}>
        <DummyHorizontalContent />
      </ElasticScrollArea>
    </div>
  ),
};

export const PullToRefresh: Story = {
  name: "3. With Pull to Refresh (Vertical Only)",
  args: {
    orientation: "vertical",
    elasticity: true,
    pullToRefresh: true,
    onRefresh: simulateRefresh,
    pullThreshold: 80,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pull-to-refresh is only enabled when `orientation` is `vertical`. When you pull and release, the content snaps back while the indicator remains visible during the loading state.",
      },
    },
  },
  render: renderVertical,
};

// --- Custom Indicator Example ---
const CustomWeatherIndicator = ({
  pullProgress,
  isRefreshing,
}: {
  pullProgress: MotionValue<number>;
  isRefreshing: boolean;
}) => {
  const rotation = useTransform(pullProgress, [0, 150], [0, 360]);
  return (
    <motion.div style={{ rotate: rotation }}>
      <Sun
        className={
          isRefreshing
            ? "h-6 w-6 text-yellow-500 animate-spin"
            : "h-6 w-6 text-yellow-500"
        }
      />
    </motion.div>
  );
};

export const CustomRefreshIndicator: Story = {
  name: "4. Custom Refresh Indicator",
  args: {
    ...PullToRefresh.args,
    pullThreshold: 100,
    RefreshIndicatorComponent: CustomWeatherIndicator,
  },
  parameters: {
    docs: {
      description: {
        story:
          "You can pass a custom component to `RefreshIndicatorComponent` to create unique loading experiences.",
      },
    },
  },
  render: renderVertical,
};

export const ScrollbarVisibility: Story = {
  name: "5. Scrollbar Visibility",
  parameters: {
    docs: {
      description: {
        story:
          "The `scrollbarVisibility` prop controls how the scrollbar is displayed. `auto` shows on hover/scroll, `always` keeps it visible, and `scroll` only shows during active scrolling.",
      },
    },
  },
  render: () => (
    <div className="flex gap-4 items-start">
      <div className="flex flex-col items-center gap-2">
        <Typography variant="small" className="font-bold">
          'auto' (default)
        </Typography>
        <div className="w-64 h-96 rounded-2xl border-2 border-graphite-border shadow-lg overflow-hidden">
          <ElasticScrollArea scrollbarVisibility="auto">
            <DummyContent itemCount={15} />
          </ElasticScrollArea>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Typography variant="small" className="font-bold">
          'always'
        </Typography>
        <div className="w-64 h-96 rounded-2xl border-2 border-graphite-border shadow-lg overflow-hidden">
          <ElasticScrollArea scrollbarVisibility="always">
            <DummyContent itemCount={15} />
          </ElasticScrollArea>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Typography variant="small" className="font-bold">
          'scroll'
        </Typography>
        <div className="w-64 h-96 rounded-2xl border-2 border-graphite-border shadow-lg overflow-hidden">
          <ElasticScrollArea scrollbarVisibility="scroll">
            <DummyContent itemCount={15} />
          </ElasticScrollArea>
        </div>
      </div>
    </div>
  ),
};
