import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../button"; // Import Button
import { Typography } from "../typography"; // Import Typography
import { Card } from "./index";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: ["full", "minimal", "sharp"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    shape: "full",
  },
  render: (args) => (
    <Card {...args} className="max-w-md">
      <Typography variant="h3">This is a Card</Typography>
      <Typography variant="p">
        A card is a flexible container for content. You can place any other
        components inside it.
      </Typography>
    </Card>
  ),
};

export const AllShapes: Story = {
  name: "All Shapes",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card shape="full">
        <Typography variant="h4">Full</Typography>
        <Typography variant="p">The default, highly-rounded style.</Typography>
      </Card>
      <Card shape="minimal">
        <Typography variant="h4">Minimal</Typography>
        <Typography variant="p">A more subtle, modern rounding.</Typography>
      </Card>
      <Card shape="sharp">
        <Typography variant="h4">Sharp</Typography>
        <Typography variant="p">No rounding for a blocky look.</Typography>
      </Card>
    </div>
  ),
};

export const Composition: Story = {
  name: "Composition Example",
  render: () => (
    <Card shape="minimal" className="max-w-sm flex flex-col gap-4">
      <div>
        <Typography variant="h3">Upgrade to Pro</Typography>
        <Typography variant="muted">
          Unlock all features and get unlimited access.
        </Typography>
      </div>
      <Typography variant="p">
        Gain access to advanced analytics, priority support, and exclusive
        content by upgrading your plan today.
      </Typography>
      <div className="flex justify-end">
        <Button>Learn More</Button>
      </div>
    </Card>
  ),
};
