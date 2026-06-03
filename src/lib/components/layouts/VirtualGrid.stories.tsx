import type { Meta, StoryObj } from "@storybook/react";
import { User } from "lucide-react";
import { Avatar } from "../avatar";
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
          "A highly performant grid component for massive datasets. It virtualizes rows, rendering only what is visible in the viewport. It handles responsive column counts automatically.",
      },
    },
  },
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

// Generate 10,000 items
const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `User ${i + 1}`,
  role: i % 5 === 0 ? "Admin" : "Contributor",
  status: i % 2 === 0 ? "Active" : "Offline",
  color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 85%)`,
}));

export const Default: Story = {
  name: "10,000 Items Grid",
  args: {
    itemHeight: 180,
    gap: 16,
    padding: 24,
    // Responsive column mapping
    columns: {
      default: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
      "2xl": 6,
    },
  },
  render: (args) => (
    <VirtualGrid
      data={largeDataset}
      {...args}
      renderItem={(item) => (
        <Card
          className="h-full flex flex-col items-center justify-center p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-outline-variant"
          shape="minimal"
          variant="primary"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-3 text-xl font-bold text-black/50"
            style={{ backgroundColor: item.color }}
          >
            {item.name.slice(0, 1)}
          </div>
          <Typography variant="title-small" className="text-base font-bold">
            {item.name}
          </Typography>
          <Typography variant="body-small" muted={true} className="text-xs">
            {item.role} • {item.status}
          </Typography>
        </Card>
      )}
    />
  ),
};

export const ContactCards: Story = {
  name: "Detailed Card Grid",
  args: {
    itemHeight: 80, // Shorter cards
    gap: 12,
    padding: 16,
    columns: { default: 1, md: 2, lg: 3 },
  },
  render: (args) => (
    <VirtualGrid
      data={largeDataset}
      {...args}
      renderItem={(item) => (
        <Card
          variant="secondary"
          shape="minimal"
          padding="none"
          className="h-full flex items-center p-3 gap-4"
        >
          <Avatar fallback={item.name.slice(0, 2)} />
          <div className="flex-1 min-w-0 text-left">
            <Typography variant="body-small" className="font-bold truncate">
              {item.name}
            </Typography>
            <Typography
              variant="body-small"
              muted={true}
              className="text-xs truncate"
            >
              {item.role.toLowerCase()}@company.com
            </Typography>
          </div>
          <div
            className={`w-2 h-2 rounded-full ${
              item.status === "Active" ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        </Card>
      )}
    />
  ),
};
