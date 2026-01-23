import type { Meta, StoryObj } from "@storybook/react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { Sun } from "lucide-react";
import { Typography } from "../typography";
import { PullToRefresh } from "./index";

const meta: Meta<typeof PullToRefresh> = {
  title: "Components/PullToRefresh",
  component: PullToRefresh,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An elastic pull-to-refresh component built with Framer Motion's pan gesture. It wraps scrollable content and triggers an async `onRefresh` action. Requires a container with a defined height.",
      },
    },
  },
  argTypes: {
    onRefresh: { action: "refreshed" },
    pullThreshold: {
      control: { type: "range", min: 50, max: 200, step: 10 },
    },
    children: { control: false },
    IndicatorComponent: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof PullToRefresh>;

// Helper component to generate scrollable content
const DummyContent = () => (
  <main className="p-6 pt-4">
    <Typography variant="h3">Pull Down to Refresh</Typography>
    <Typography variant="muted">
      This container is scrollable. The pull gesture only works when you are at
      the very top.
    </Typography>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-graphite-secondary" />
      ))}
    </div>
  </main>
);

// A mock async function for the onRefresh prop
const simulateRefresh = () => {
  return new Promise((resolve) => setTimeout(resolve, 2000));
};

export const Default: Story = {
  name: "1. Default Behavior",
  args: {
    onRefresh: simulateRefresh,
    pullThreshold: 100,
  },
  render: (args) => (
    <div className="w-96 h-[600px] rounded-2xl border-2 border-graphite-border shadow-lg overflow-hidden">
      <PullToRefresh {...args}>
        <DummyContent />
      </PullToRefresh>
    </div>
  ),
};

// --- Custom Indicator Example ---

interface CustomIndicatorProps {
  pullProgress: MotionValue<number>;
  isRefreshing: boolean;
}

const CustomWeatherIndicator = ({
  pullProgress,
  isRefreshing,
}: CustomIndicatorProps) => {
  // Use the motion value passed from the parent for transforms
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

export const CustomIndicator: Story = {
  name: "2. With a Custom Indicator",
  args: {
    ...Default.args,
    IndicatorComponent: CustomWeatherIndicator,
    pullThreshold: 150,
  },
  parameters: {
    docs: {
      description: {
        story:
          "You can pass any component to the `IndicatorComponent` prop. It will receive `pullProgress` (a MotionValue) and `isRefreshing` props, allowing you to create custom, fluid animations.",
      },
    },
  },
  render: (args) => (
    <div className="w-96 h-[600px] rounded-2xl border-2 border-graphite-border shadow-lg overflow-hidden">
      <PullToRefresh {...args}>
        <DummyContent />
      </PullToRefresh>
    </div>
  ),
};
