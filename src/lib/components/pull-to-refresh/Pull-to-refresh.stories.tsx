import type { Meta, StoryObj } from "@storybook/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PullToRefresh } from "./index";

const meta: Meta<typeof PullToRefresh> = {
  title: "Components/PullToRefresh",
  component: PullToRefresh,
  tags: ["autods"],
  parameters: {
    layout: "fullscreen",
    // Default to a mobile viewport to make testing easy
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        component:
          "A touch-specific component that wraps scrollable content to add 'pull to refresh' functionality. **To test this in a desktop browser, use your browser's developer tools to simulate a touch device.**",
      },
    },
  },
  argTypes: {
    children: { control: false },
    onRefresh: { action: "refreshed" },
    refreshingIndicator: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof PullToRefresh>;

// --- Helper Components for the Story ---

// Generates a list of random "posts"
const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i,
    title: `Random Post #${Math.floor(Math.random() * 1000)}`,
    content: "Pull down on this list to refresh the content.",
  }));

// A simple card to display a post
const PostCard = ({ title, content }: { title: string; content: string }) => (
  <div className="rounded-xl border border-graphite-border bg-graphite-card p-4">
    <p className="font-bold">{title}</p>
    <p className="text-sm text-gray-600">{content}</p>
  </div>
);

// --- STORIES ---

export const Default: Story = {
  name: "1. Default Indicator",
  render: function Render(args) {
    const [items, setItems] = useState(() => generateItems(100));

    // Simulate a network request
    const handleRefresh = async () => {
      args.onRefresh(); // For Storybook action logging
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setItems(generateItems(100));
    };

    return (
      <div className="h-screen bg-graphite-background">
        <div className="p-4 font-bold text-center">
          Simulating a Mobile App View
        </div>
        <PullToRefresh {...args} onRefresh={handleRefresh}>
          <div className="space-y-3 p-4">
            {items.map((item) => (
              <PostCard
                key={item.id}
                title={item.title}
                content={item.content}
              />
            ))}
          </div>
        </PullToRefresh>
      </div>
    );
  },
};

export const CustomIndicator: Story = {
  name: "2. Custom Refreshing Indicator",
  parameters: {
    docs: {
      description: {
        story:
          "You can pass any React node to the `refreshingIndicator` prop to customize the loading state. The pulling indicator remains the default arrow.",
      },
    },
  },
  args: {
    refreshingIndicator: (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-graphite-primary text-graphite-primaryForeground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    ),
  },
  render: (args) => <Default.render {...args} />,
};
