import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../card";
import { Typography } from "../typography";
import { VirtualGrid } from "./virtual-grid";

const meta: Meta<typeof VirtualGrid> = {
  title: "Components/Layout/VirtualGrid",
  component: VirtualGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A high-performance grid capable of rendering thousands of items using `@tanstack/react-virtual`. It calculates responsive columns on the fly and virtualizes rows while maintaining Framer Motion entry animations.",
      },
    },
  },
  // We wrap the story in a fixed height container so scrolling happens within it
  decorators: [
    (Story) => (
      <div className="h-[600px] w-full bg-graphite-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VirtualGrid>;

// --- MOCK DATA ---
// Generate 10,000 items
const bigData = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  title: `Item #${i + 1}`,
  color: `hsl(${i % 360}, 70%, 85%)`,
  darkColor: `hsl(${i % 360}, 70%, 25%)`,
}));

export const Default: Story = {
  name: "1. 10,000 Items",
  render: () => {
    return (
      <VirtualGrid
        data={bigData}
        columns={{ default: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
        gap={16}
        padding={24}
        estimateRowHeight={200}
        renderItem={(item) => (
          <Card
            className="h-40 flex items-center justify-center shadow-sm"
            shape="minimal"
            style={{
              backgroundColor: item.color,
              borderColor: item.darkColor,
            }}
          >
            <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl">
              <Typography
                variant="h3"
                className="font-bold"
                style={{ color: item.darkColor }}
              >
                {item.title}
              </Typography>
            </div>
          </Card>
        )}
      />
    );
  },
};

export const VariableContent: Story = {
  name: "2. Dynamic Row Heights",
  parameters: {
    docs: {
      description: {
        story:
          "Because this uses CSS Grid, if one item in a row is taller than the others, the entire row expands to fit. TanStack Virtual detects this height change automatically.",
      },
    },
  },
  render: () => {
    // Use a smaller slice for the demo
    const dynamicData = bigData.slice(0, 1000);

    return (
      <VirtualGrid
        data={dynamicData}
        columns={{ default: 1, md: 2, lg: 3 }}
        gap={24}
        padding={24}
        renderItem={(item, index) => {
          // Every 3rd item has extra text to make it taller
          const isTall = index % 3 === 0;

          return (
            <Card className="flex flex-col gap-3 p-6 h-full" variant="primary">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: item.darkColor }}
              >
                {index + 1}
              </div>
              <Typography variant="h4">{item.title}</Typography>
              <Typography
                variant="p"
                className="text-sm text-graphite-foreground/60"
              >
                {isTall
                  ? "This card has significantly more content than its neighbors. In a standard Grid layout, the row height is dictated by the tallest element in that row. Notice how the adjacent cards stretch to match this height if 'items-stretch' is applied (default), or the row simply grows."
                  : "Short description text."}
              </Typography>
            </Card>
          );
        }}
      />
    );
  },
};

export const NoAnimation: Story = {
  name: "3. No Animation (Max Performance)",
  render: () => {
    return (
      <VirtualGrid
        data={bigData}
        columns={{ default: 2, md: 4, lg: 6 }}
        gap={8}
        padding={16}
        animate={false} // Disabling animations makes scrolling huge lists feel instant
        renderItem={(item) => (
          <div
            className="h-24 rounded-lg flex items-center justify-center text-sm font-mono font-bold"
            style={{
              backgroundColor: item.color,
              color: item.darkColor,
            }}
          >
            {item.title}
          </div>
        )}
      />
    );
  },
};
