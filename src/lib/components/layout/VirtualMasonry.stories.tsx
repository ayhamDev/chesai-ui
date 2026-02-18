import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../card";
import { Typography } from "../typography";
import { VirtualMasonry } from "./virtual-masonry";

const meta: Meta<typeof VirtualMasonry> = {
  title: "Components/Layout/VirtualMasonry",
  component: VirtualMasonry,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A virtualized masonry layout for datasets with varying item heights. It measures items dynamically and positions them absolutely to fill gaps.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[800px] w-full bg-graphite-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VirtualMasonry>;

const masonryItems = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  height: 100 + Math.floor(Math.random() * 200), // Random height between 100 and 300
  color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`,
  title: `Card ${i + 1}`,
}));

export const Default: Story = {
  name: "1000 Items Masonry",
  render: () => (
    <VirtualMasonry
      data={masonryItems}
      columns={{ default: 2, md: 3, lg: 4, xl: 5 }}
      gap={16}
      padding={24}
      renderItem={(item, index) => (
        <Card
          className="w-full shadow-sm flex flex-col justify-end p-4"
          shape="minimal"
          style={{
            height: item.height, // Simulating content height
            backgroundColor: item.color,
          }}
        >
          <div className="bg-white/60 backdrop-blur-md p-2 rounded-lg">
            <Typography variant="body-small" className="font-bold text-black">
              {item.title}
            </Typography>
            <Typography
              variant="body-small"
              muted={true}
              className="text-xs text-black/70"
            >
              Height: {item.height}px
            </Typography>
          </div>
        </Card>
      )}
    />
  ),
};
