import type { Meta, StoryObj } from "@storybook/react";
import { User } from "lucide-react";
import { Avatar } from "../avatar";
import { Card } from "../card";
import { Typography } from "../typography";
import { VirtualFlex } from "./virtual-flex";

const meta: Meta<typeof VirtualFlex> = {
  title: "Components/Layout/VirtualFlex",
  component: VirtualFlex,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A virtualized flex container for large lists. Supports vertical and horizontal scrolling.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[500px] w-full bg-graphite-background p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VirtualFlex>;

// Generate data
const items = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  name: `User ${i + 1}`,
  role: i % 3 === 0 ? "Admin" : "Member",
}));

export const VerticalList: Story = {
  name: "Vertical List (1000 Items)",
  render: () => (
    <div className="h-[400px] border border-graphite-border rounded-xl bg-white overflow-hidden">
      <VirtualFlex
        data={items}
        estimateSize={72} // Height of card + gap roughly
        gap={8}
        padding={16}
        renderItem={(item) => (
          <Card
            variant="secondary"
            shape="minimal"
            className="flex items-center gap-4 p-4 h-[72px]"
          >
            <Avatar fallback={item.name.slice(0, 2)} />
            <div>
              <Typography variant="body-small" className="font-bold">
                {item.name}
              </Typography>
              <Typography variant="body-small" muted={true} className="text-xs">
                {item.role}
              </Typography>
            </div>
          </Card>
        )}
      />
    </div>
  ),
};

export const HorizontalList: Story = {
  name: "Horizontal List",
  render: () => (
    <div className="h-[200px] w-full">
      <VirtualFlex
        data={items}
        direction="horizontal"
        estimateSize={300} // Width of card
        gap={16}
        padding={16}
        renderItem={(item) => (
          <Card
            variant="primary"
            shape="minimal"
            className="w-[160px] h-full flex flex-col items-center justify-center gap-2"
          >
            <Avatar size="lg" fallback={item.name.slice(0, 1)} />
            <Typography variant="body-small">{item.name}</Typography>
          </Card>
        )}
      />
    </div>
  ),
};
