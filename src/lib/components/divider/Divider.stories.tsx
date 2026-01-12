import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "../typography";
import { Divider } from "./index";

const meta: Meta<typeof Divider> = {
  title: "Components/Data/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
    variant: {
      control: "select",
      options: ["solid", "dashed", "dotted"],
    },
    textAlign: {
      control: "select",
      options: ["start", "center", "end"],
      if: { arg: "orientation", eq: "horizontal" },
    },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
  },
  render: (args) => (
    <div className="w-96">
      <Typography variant="p">Content above</Typography>
      <Divider {...args} />
      <Typography variant="p">Content below</Typography>
    </div>
  ),
};

export const WithText: Story = {
  args: {
    children: "OR",
    textAlign: "center",
  },
  render: (args) => (
    <div className="w-96">
      <Typography variant="p">Login with email</Typography>
      <Divider {...args} />
      <Typography variant="p">Login with Google</Typography>
    </div>
  ),
};

export const Alignments: Story = {
  name: "Text Alignments",
  render: () => (
    <div className="w-96 flex flex-col gap-8">
      <div>
        <Typography variant="small" className="mb-2">
          Start
        </Typography>
        <Divider textAlign="start">Chapter 1</Divider>
      </div>
      <div>
        <Typography variant="small" className="mb-2">
          Center
        </Typography>
        <Divider textAlign="center">Chapter 1</Divider>
      </div>
      <div>
        <Typography variant="small" className="mb-2">
          End
        </Typography>
        <Divider textAlign="end">Chapter 1</Divider>
      </div>
    </div>
  ),
};

export const Styles: Story = {
  name: "Line Styles",
  render: () => (
    <div className="w-96 flex flex-col gap-8">
      <Divider variant="solid">Solid</Divider>
      <Divider variant="dashed">Dashed</Divider>
      <Divider variant="dotted">Dotted</Divider>
    </div>
  ),
};

export const Vertical: Story = {
  name: "Vertical Orientation",
  render: () => (
    <div className="h-40 flex items-center border border-graphite-border rounded-xl p-4 bg-graphite-card">
      <Typography variant="p">Left</Typography>
      <Divider orientation="vertical" />
      <Typography variant="p">Right</Typography>
      <Divider orientation="vertical">VS</Divider>
      <Typography variant="p">Far Right</Typography>
    </div>
  ),
};
